import pandas as pd
from pathlib import Path

class DataProcessor:
    def __init__(self):
        self.base_path = Path("data")
        self.selected_columns = [
            'stress_in_general', 'stress_before_exams', 
            'level_of_study', 'timetable_impact',
            'course_of_study'
        ]
        self.value_mappings = {
            'stress_in_general': {
                'Yes (due to employment-related issues)': 'Yes',
                'Yes (due to other circumstances, such as health, family issues, etc)': 'Yes',
                'Yes (due to university work)': 'Yes',
                'No': 'No',
                'Yes': 'Yes',
                'Yes (due to other circumstances, such as health, family issues, etc),No': 'Yes',
                'Yes (due to other circumstances, such as health, family issues, etc), Yes (due to university work)': 'Yes',
                'Yes (due to employment-related issues), Yes (due to other circumstances, such as health, family issues, etc)': 'Yes',
                'Yes (due to employment-related issues),Yes (due to other circumstances, such as health, family issues, etc),Yes (due to university work)': 'Yes',
                'Yes (due to university work),No': 'Yes',
                'Yes (due to employment-related issues), Yes (due to university work)': 'Yes'
            },
            'stress_before_exams': {
                'Yes (due to university work)': 'Yes',
                'Yes (due to employment-related issues)': 'Yes',
                'Yes (due to other circumstances such as health, family issues, etc)': 'Yes',
                'Yes': 'Yes',
                'No': 'No',
                "I don't have exams": 'No',
                "I don't normally have exams": 'No',
                'No (I am not stressed)': 'No'
            },
           'timetable_impact': {
                'Yes': 'Yes',
                'No': 'No',
                'Not completed': 'No',
                'Yes, on my life, health and studies': 'Yes',
                'Yes, on my studies': 'Yes',
                'Yes, on my life and health': 'Yes',
                'No, it has no impact on my studies, life or health': 'No'
            },
            'level_of_study': {
                'Level 4': 'Level 4',
                'Level 4 ': 'Level 4',
                'Level 4 (first year, undergraduate)': 'Level 4',
                'Level 4 Foundation year': 'Level 4',
                'Foundation year': 'Level 4',
                'Level 5 (second year, undergraduate)': 'Level 5',
                'Level 6 (third year, undergraduate)': 'Level 6',
                'Level 7': 'Level 7',
                'Level 7 ': 'Level 7',
                'Level 7 (postgraduate)': 'Level 7',
                'Others': 'Other',
                'Other': 'Other'
            },
        }

    def standardize_yes_no(self, value):
        """Convert any value to Yes/No"""
        if pd.isna(value) or value == 'nan':
            return 'No'
            
        value = str(value).lower()
        return 'Yes' if 'yes' in value else 'No'
    
    def standardize_course(self, course):
        """Standardize course names to degree types"""
        if pd.isna(course):
            return 'Other'
            
        course = str(course).upper().strip()
        
        # Handle Foundation Years
        if 'FOUNDATION' in course:
            return 'Foundation'
            
        # Handle specific degree types
        if 'BSC' in course or 'BACHELOR OF SCIENCE' in course:
            return 'BSc'
        elif 'BA' in course or 'BACHELOR OF ARTS' in course:
            return 'BA'
        elif 'MSC' in course or 'MASTER OF SCIENCE' in course:
            return 'MSc'
        elif 'MA ' in course or 'MASTER OF ARTS' in course:
            return 'MA'
        elif 'BENG' in course or 'BACHELOR OF ENGINEERING' in course:
            return 'BEng'
        elif 'FDSC' in course:
            return 'FdSc'
        elif 'MBA' in course:
            return 'MBA'
        elif 'MRES' in course:
            return 'MRes'
        elif 'HNC' in course or 'HND' in course:
            return 'HNC/HND'
        elif 'LLB' in course:
            return 'LLB'
        elif 'BMUS' in course:
            return 'BMus'
        elif 'APPRENTICESHIP' in course:
            return 'Apprenticeship'
        elif any(x in course for x in ['STUDY ABROAD', 'EXCHANGES']):
            return 'Exchange'
            
        return 'Other'
    
    def process_data(self):
        """Process data for pre-evaluation"""
        try:
            # Read from report data
            df = pd.read_excel(self.base_path / "report_data.xlsx")
            print(f"Loaded dataset with {len(df)} rows")
            if 'timetable_reasons' in df.columns:
                df = df.drop('timetable_reasons', axis=1)
            
            stress_columns = ['stress_in_general', 'stress_before_exams', 'timetable_impact']
            for col in stress_columns:
                if col in df.columns:
                    df[col] = df[col].apply(self.standardize_yes_no)

            # Process only selected columns
            for col in self.selected_columns:
                if col in df.columns:
                    if col in self.value_mappings:
                        df[col] = df[col].map(self.value_mappings[col]).fillna(df[col])
                    elif col == 'course_of_study':
                        df[col] = df[col].apply(self.standardize_course)
            
            # Save pre-evaluation dataset
            df.to_excel(self.base_path / "pre_evaluation_dataset.xlsx", index=False)
            print("Pre-evaluation dataset saved successfully")
            
            return df
            
        except Exception as e:
            print(f"Error processing data: {e}")
            raise

if __name__ == "__main__":
    processor = DataProcessor()
    processor.process_data()