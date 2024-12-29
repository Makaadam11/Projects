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
    
    # Remove unnecessary columns
    columns_to_drop = ['Unnamed: 0', 'sno', 'institution_country', 'Captured At']
    df = df.drop(columns=columns_to_drop, errors='ignore')
    
    # Numeric columns
    numeric_columns = [
        'year_of_birth', 'age', 'hours_per_week_university_work', 
        'work_hours_per_week', 'hours_socialising', 'total_social_media_hours', 
        'total_device_hours', 'cost_of_study', 'hours_per_week_lectures', 
        'hours_between_lectures', 'exercise_per_week'
    ]
    
    for col in numeric_columns:
        df[col] = df[col].apply(clean_numeric_values)
    
    # Fill missing values in numeric columns
    for col in numeric_columns:
        df[col].fillna(df[col].median(), inplace=True)
    
    # Categorical columns
    categorical_columns = [
        'home_country', 'ethnic_group', 'age_group', 'course_of_study', 
        'course_category', 'financial_support', 'financial_problems', 
        'family_earning_class', 'stress_before_exams', 'stress_in_general', 
        'form_of_employment', 'quality_of_life', 'known_disabilities',
        'alcohol_consumption', 'well_hydrated', 'diet', 'social_media_use', 
        'personality_type', 'feel_afraid', 'timetable_preference', 
        'ts_impact', 'ts_full', 'gender', 'student_type_location', 
        'student_type_time', 'year_of_study'
    ]
    
    # Fill missing values in categorical columns
    for col in categorical_columns:
        df[col].fillna('Unknown', inplace=True)
    
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
            'course_of_study', 'course_category', 'year_of_study',
            'cost_of_study', 'hours_per_week_lectures', 'hours_between_lectures'
        ]
        
        self.financial_cols = [
            'financial_support', 'financial_problems'
        ]
        
        self.lifestyle_cols = [
            'stress_before_exams', 'stress_in_general', 
            'work_hours_per_week', 'hours_socialising',
            'total_social_media_hours', 'total_device_hours',
            'diet', 'well_hydrated', 'alcohol_consumption',
            'quality_of_life'
        ]
        
        self.psychological_cols = [
            'personality_type', 'exercise_per_week',
            'feel_afraid', 'known_disabilities'
        ]

    def save_plot_to_bytes(self, fig):
        buf = BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=300)
        buf.seek(0)
        return buf

    def create_category_charts(self, category_cols, title):
        try:
            available_cols = [col for col in category_cols if col in self.df.columns]
            if not available_cols:
                print(f"No columns available for category: {title}")
                return None
                
            n_cols = len(available_cols)
            n_rows = (n_cols + 2) // 3  # 3 charts per row
            
            # Adjust figure size and spacing
            plt.rcParams['figure.autolayout'] = False
            fig, axes = plt.subplots(n_rows, 3, figsize=(15, 5*n_rows))
            fig.subplots_adjust(hspace=0.5, bottom=0.2)
            axes = axes.ravel()
            
            for idx, col in enumerate(available_cols):
                if self.df[col].dtype in ['int64', 'float64']:
                    self.df[col].hist(ax=axes[idx], bins=20)
                else:
                    value_counts = self.df[col].value_counts()
                    if len(value_counts) > 10:
                        value_counts = value_counts.head(10)
                    value_counts.plot(kind='bar', ax=axes[idx])
                    
                    # Improve label positioning
                    axes[idx].set_xticklabels(
                        axes[idx].get_xticklabels(),
                        rotation=45,
                        ha='right',
                        rotation_mode='anchor'
                    )
                
                # Add title with better spacing
                axes[idx].set_title(f'{col} Distribution', pad=20)
                
                # Adjust layout for better label visibility
                axes[idx].tick_params(axis='x', pad=10)
            
            # Hide empty subplots
            for idx in range(len(available_cols), len(axes)):
                axes[idx].set_visible(False)
                
            plt.tight_layout()
            plot_bytes = self.save_plot_to_bytes(fig)
            plt.close(fig)
            return plot_bytes
        except Exception as e:
            print(f"Error creating charts for {title}: {str(e)}")
            return None

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

    def generate_pdf_report(self, output_path):
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

        # Add charts for each category
        categories = [
            (self.demographic_cols, "Demographic Factors"),
            (self.academic_cols, "Academic Factors"),
            (self.financial_cols, "Financial Factors"),
            (self.lifestyle_cols, "Lifestyle Factors"),
            (self.psychological_cols, "Psychological Factors")
        ]

        for cols, title in categories:
            self.pdf.add_page()
            self.pdf.set_font('Helvetica', 'B', 14)
            self.pdf.cell(0, 10, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
            chart = self.create_category_charts(cols, title)
            self.pdf.image(chart, x=10, y=30, w=190)

        self.pdf.output(output_path)


# Usage
