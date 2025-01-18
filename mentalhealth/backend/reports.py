from io import BytesIO
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
from models import AnthropicLanguageModel, GroqClient
from PIL import Image
matplotlib.use('Agg')
from pathlib import Path
from fpdf import FPDF
from fpdf.enums import XPos, YPos
import base64

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
    columns_to_drop = ['actual', 'captured_at']
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
    df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].median())
    
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
        # print("df: " + str(df))
        self.df = preprocess_dataframe(df)
        self.llm = GroqClient()
        self.output_dir = Path("report_assets")
        self.output_dir.mkdir(exist_ok=True)
        self.pdf = FPDF()
        
        # Add Unicode font
        font_path = Path("fonts/DejaVuLGCSans.ttf")
        self.pdf.add_font('DejaVuLGCSans', '', str(font_path), uni=True)
        
        font_path = Path("fonts/DejaVuLGCSans-Bold.ttf")
        self.pdf.add_font('DejaVuLGCSans-Bold', '', str(font_path), uni=True)
        self.pdf.set_font('DejaVuLGCSans', '', 12)
        
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

    def add_image_with_text(self, image_data, text):
        print(f"Adding image with text: {text}")
        image_data_base64 = image_data.split(",")[1]  # Correctly split the image data
        image = Image.open(BytesIO(base64.b64decode(image_data_base64)))
        image_path = self.output_dir / f"{text}.png"
        image.save(image_path)

        # Calculate the appropriate width and height while maintaining aspect ratio
        max_width = 190
        max_height = 150
        width, height = image.size
        aspect_ratio = width / height

        if height > max_height:
            height = max_height
            width = height * aspect_ratio

        if width > max_width:
            width = max_width
            height = width / aspect_ratio

        self.pdf.image(str(image_path), x=10, y=10, w=width, h=height)
        self.pdf.set_xy(10, 10 + height + 10)  # Adjust the position for the text
        self.pdf.set_font('DejaVuLGCSans', '', 12)
        self.pdf.multi_cell(190, 9)
        print(f"Image with text added: {text}")

    def generate_pdf_report(self, output_path, chart_images):
        # Initialize PDF
        self.pdf.add_page()
        self.pdf.set_font('DejaVuLGCSans-Bold', '', 16)

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
        
        For each category, analyze the data based on the prediction values (0 or 1) indicating mental health issues.
        
        Example format:
        
        BSc Computer Science (Analysis)
        
        Summary Metrics
        • Total Records for BSc Computer Science: 37
        • Predicted "Mental Health Proneness" (Predictions = 1): 7
        • Predicted "Not Prone to Mental Health" (Predictions = 0): 30
        
        Age Group Distribution:
        o 16–20 years: Majority of students (70%), with 90% classified as not prone (Prediction = 0). Only 10% classified as prone (Prediction = 1).
        o 21–25 years: 20% of students, all predominantly classified as not prone.
        o Evidence indicates that younger students face lower mental health proneness.
        
        Financial Support and Financial Problems:
        o Parent Support: 100% of students with parent support were classified as not prone (Prediction = 0).
        o Student Loans: Represents 65% of students, with 85% classified as not prone and 15% prone. Financial dependency plays a role in mental health stability.
        o Financial Problems: 80% of those facing financial problems (e.g., lower family income) were classified as prone to mental health issues (Prediction = 1).
        
        Stress Levels:
        o Stress before exams: 90% reported stress, but only 15% were prone (Prediction = 1).
        o Stress in general: 80% of students reported general stress, with a small correlation to being prone (20%).
        
        Employment Status:
        o Unemployed Students: 90% classified as not prone. Lack of work may reduce mental health risk.
        o Part-time/Full-time Jobs: 10% prone, possibly linked to time management and academic pressure.
        
        Diet and Exercise:
        o Students with healthy diets and regular exercise were predominantly not prone (95%).
        o Lack of hydration/alcohol consumption showed no strong correlation.
        
        Social Media and Device Use:
        o High social media use (15+ hours weekly): 40% prone to mental health issues.
        o Moderate use (8–15 hours weekly): 10% prone.
        o Low use (<8 hours weekly): No correlation observed with mental health proneness.
        
        Family Earning Class:
        o Lower Class: 60% prone.
        o Middle Class: 90% not prone.
        o Higher Class: 95% not prone. Economic stability correlates with mental health resilience.
        
        Gender Distribution:
        o Female students: 15% prone (Prediction = 1).
        o Male students: 5% prone.
        o Other genders (e.g., Non-binary): Higher proneness (40%), though sample size is small.
        
        Evidenced-Based Conclusion
        1. Age and Support Systems: Younger students (16–20 years) with adequate parental or financial support exhibit low mental health risks. Financial problems and lack of familial support significantly increase susceptibility.
        2. Stress and Workload: General and exam-related stress are not sole predictors of mental health issues. However, combining high stress with heavy workloads (employment) amplifies risks.
        3. Economic Class: Lower-income students face disproportionately higher mental health challenges, highlighting a critical area for intervention.
        4. Social Media Influence: Excessive use (15+ hours) correlates with increased mental health issues. Moderation appears to offer protection.
        5. Gender Differences: Females and non-binary individuals demonstrate higher vulnerability, suggesting gender-sensitive support mechanisms.
        
        Recommendations
        1. Enhance Financial Support: Universities should prioritize financial aid, especially for lower-income and international students. Emergency grants and mental health funding should be streamlined.
        2. Promote Balanced Lifestyles:
        a. Campaigns promoting healthy diets, hydration, and regular exercise should be instituted.
        b. Social media workshops to teach moderation and device-free time could mitigate digital stress.
        3. Targeted Mental Health Resources:
        a. Expand counseling and peer-support services, with a focus on gender-sensitive approaches.
        b. Provide tailored support for part-time workers balancing employment and studies.
        4. Monitor High-Risk Groups:
        a. Track stress levels and workload in younger cohorts, offering early intervention.
        b. Introduce mentorship programmes pairing upper-year students with first years for guidance.
        5. Data-Driven Initiatives:
        a. Conduct regular surveys and use predictive models to refine mental health strategies.
        b. Integrate mental health modules into the academic curriculum for greater awareness.
        
        Generally
        • Financial issues, stress, heavy social media usage, and limited physical activity are significant indicators of mental health proneness.
        • Strengthening coping mechanisms and offering financial and mental health support could mitigate risks.
        • Encouraging balanced lifestyles, reduced social media reliance, and physical activity can promote resilience.
        """

        # Generate report content
        report_content = self.llm.generate_report(prompt)

        # Add content to PDF
        self.pdf.cell(200, 10, "Student Mental Health Analysis", 
                    new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.pdf.set_font('DejaVuLGCSans', '', 12)
        self.pdf.multi_cell(0, 10, report_content)

        # Debug: Print the number of charts to be processed
        print(f"Number of charts to be processed: {len(chart_images)}")

        # Add provided chart images with text
        for title, image in chart_images.items():
            if isinstance(image, str) and image.startswith("data:image/png;base64,"):
                # Generate a meaningful title or use a default title
                chart_title = title if title != "[object HTMLDivElement]" else "Chart"
                print(f"Adding chart image for: {chart_title}")
                self.pdf.add_page()
                self.add_image_with_text(image, f"Analysis for {chart_title.replace('_', ' ').title()}")

        self.pdf.output(output_path)
        print(f"PDF report generated at: {output_path}")