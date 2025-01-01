from io import BytesIO
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
from models import AnthropicLanguageModel, GroqClient
matplotlib.use('Agg')
from pathlib import Path
from fpdf import FPDF
from fpdf.enums import XPos, YPos

def clean_numeric_values(value):
    try:
        if isinstance(value, str):
            value = value.replace(',', '')
        return float(value)
    except (ValueError, TypeError):
        return np.nan
    
def preprocess_dataframe(df):
    df = df.copy()
    
    # Rename columns
    df.columns = [
        "diet", "ethnic_group", "hours_per_week_university_work", "family_earning_class", 
        "quality_of_life", "alcohol_consumption", "personality_type", "stress_in_general", 
        "well_hydrated", "exercise_per_week", "known_disabilities", "work_hours_per_week", 
        "financial_support", "form_of_employment", "financial_problems", "home_country", 
        "age", "course_of_study", "stress_before_exams", "feel_afraid", 
        "timetable_preference", "timetable_reasons", "timetable_impact", "total_device_hours", 
        "hours_socialmedia", "level_of_study", "gender", "physical_activities", 
        "hours_between_lectures", "hours_per_week_lectures", "hours_socialising", 
        "actual", "student_type_time", "student_type_location", 
        "cost_of_study", "sense_of_belonging", "mental_health_activities", 
        "predictions", "captured_at"
    ]
    
    # Remove unnecessary columns
    columns_to_drop = ['actual', 'predictions', 'captured_at']
    df = df.drop(columns=columns_to_drop, errors='ignore')
    
    # Numeric columns
    numeric_columns = [
        'age', 'hours_per_week_university_work', 'work_hours_per_week', 
        'hours_socialising', 'hours_socialmedia', 'total_device_hours', 
        'cost_of_study', 'hours_per_week_lectures', 'hours_between_lectures', 
        'exercise_per_week'
    ]
    
    for col in numeric_columns:
        df[col] = df[col].apply(clean_numeric_values)
    
    # Fill missing values in numeric columns
    for col in numeric_columns:
        df[col].fillna(df[col].median(), inplace=True)
    
    # Categorical columns
    categorical_columns = [
        'home_country', 'ethnic_group', 'course_of_study', 'financial_support', 
        'financial_problems', 'family_earning_class', 'stress_before_exams', 
        'stress_in_general', 'form_of_employment', 'quality_of_life', 'known_disabilities',
        'alcohol_consumption', 'well_hydrated', 'diet', 'personality_type', 
        'feel_afraid', 'timetable_preference', 'timetable_reasons', 'timetable_impact', 
        'gender', 'student_type_location', 'student_type_time', 'level_of_study', 
        'physical_activities', 'mental_health_activities', 'sense_of_belonging'
    ]
    
    for col in categorical_columns:
        df[col] = df[col].astype('category')
    
    return df

class Reports:
    def __init__(self, df):
        self.df = preprocess_dataframe(df)
        self.llm = GroqClient()
        self.output_dir = Path("report_assets")
        self.output_dir.mkdir(exist_ok=True)
        self.pdf = FPDF()
        
        # Print available columns after preprocessing
        print("Available columns after preprocessing:", self.df.columns.tolist())
        
        # Updated column categories based on preprocessed data
        self.demographic_cols = [
            'home_country', 'ethnic_group', 'age', 'gender', 
            'family_earning_class', 'student_type_location'
        ]
        
        self.academic_cols = [
            'course_of_study', 'level_of_study', 'cost_of_study', 
            'hours_per_week_lectures', 'hours_between_lectures'
        ]
        
        self.financial_cols = [
            'financial_support', 'financial_problems'
        ]
        
        self.lifestyle_cols = [
            'stress_before_exams', 'stress_in_general', 'work_hours_per_week', 
            'hours_socialising', 'hours_socialmedia', 'total_device_hours', 
            'diet', 'well_hydrated', 'alcohol_consumption', 'quality_of_life'
        ]
        
        self.psychological_cols = [
            'personality_type', 'exercise_per_week', 'feel_afraid', 'known_disabilities'
        ]

    def get_category_statistics(self, category_cols):
        stats = {}
        for col in category_cols:
            if col in self.df.columns:
                if self.df[col].dtype in ['int64', 'float64']:
                    stats[col] = {
                        'mean': self.df[col].mean(),
                        'median': self.df[col].median(),
                        'std': self.df[col].std()
                    }
                else:
                    stats[col] = self.df[col].value_counts().to_dict()
        return stats

    def generate_pdf_report(self, output_path, chart_images):
        # Initialize PDF
        self.pdf.add_page()
        self.pdf.set_font('Helvetica', 'B', 16)

        # Generate statistics for each category
        stats = {
            'demographics': self.get_category_statistics(self.demographic_cols),
            'academic': self.get_category_statistics(self.academic_cols),
            'financial': self.get_category_statistics(self.financial_cols),
            'lifestyle': self.get_category_statistics(self.lifestyle_cols),
            'psychological': self.get_category_statistics(self.psychological_cols)
        }

        # Generate prompt for LLM
        prompt = f"""
        Create a comprehensive mental health report with these sections:
        
        1. Executive Summary
        2. Demographic Analysis: {stats['demographics']}
        3. Academic Factors Analysis: {stats['academic']}
        4. Financial Analysis: {stats['financial']}
        5. Lifestyle Analysis: {stats['lifestyle']}
        6. Psychological and Social Analysis: {stats['psychological']}
        7. Percentages Summary
        8. Key Findings
        9. Recommendations
        
        Base conclusions and recommendations on the provided statistics.
        """

        # Generate report content
        report_content = self.llm.generate_report(prompt)

        # Add content to PDF
        self.pdf.cell(200, 10, "Student Mental Health Analysis", 
                     new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.pdf.set_font('Helvetica', '', 12)
        self.pdf.multi_cell(0, 10, report_content)

        # Add provided chart images
        for title, image in chart_images.items():
            self.pdf.add_page()
            self.pdf.set_font('Helvetica', 'B', 14)
            self.pdf.cell(0, 10, title.replace('_', ' ').title(), new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
            self.pdf.image(image, x=10, y=30, w=190)

        self.pdf.output(output_path)