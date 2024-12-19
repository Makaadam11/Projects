import pandas as pd
from pathlib import Path

class DataProcessor:
    def __init__(self):
        self.base_path = Path("data")
        self.columns = [
            'diet', 'ethnic_group', 'hours_per_week_university_work', 'family_earning_class', 
            'quality_of_life', 'alcohol_consumption', 'personality_type', 'stress_in_general', 
            'well_hydrated', 'exercise_per_week', 'known_disabilities', 'work_hours_per_week', 
            'financial_support', 'form_of_employment', 'financial_problems', 'home_country', 
            'age', 'course_of_study', 'stress_before_exams', 'feel_afraid', 'timetable_preference', 
            'timetable_reasons', 'timetable_impact', 'total_device_hours', 'hours_socialmedia', 
            'level_of_study', 'gender', 'physical_activities', 'hours_between_lectures', 
            'hours_per_week_lectures', 'hours_socialising', 'actual', 'student_type_time', 
            'student_type_location', 'cost_of_study', 'sense_of_belonging'
        ]
        self.value_mappings = {
            'diet': {
                'I think my diet is somewhat in-between': 'Somewhat Inbetween',
                'I think my diet is somewhat inbetween': 'Somewhat Inbetween',
                'Yes, I think my diet is healthy': 'Healthy',
                'No, I think my diet is unhealthy': 'Unhealthy'
            },
            'ethnic_group': {
                'White': 'White',
                'Black/African/Caribbean/Black British': 'Black',
                'Asian/Asian British': 'Asian',
                'Mixed/multiple ethnic groups': 'Mixed',
                'Other ethnic group': 'Other'
            },
            'family_earning_class': {
                'Lower class (less than £25000 per annum)': 'Lower Class (below £25,000)',
                'Lower class (below £25,000)': 'Lower Class (below £25,000)',
                'Lower class': 'Lower Class (below £25,000)',
                'Middle class (between £25k and £90K)': 'Middle Class (£25,000-£54,999)',
                'Middle class (£25,000-£54,999)': 'Middle Class (£25,000-£54,999)',
                'Middle class': 'Middle Class (£25,000-£54,999)',
                'Higher class (£90001 or above per annum)': 'Higher Class (£55,000-£90,000)',
                'Higher class (£55,000-£90,000)': 'Higher Class (£55,000-£90,000)',
                'Higher class': 'Higher Class (£55,000-£90,000)',
                'Upper higher class (above £90,000)': 'Upper Higher Class (above £90,000)'
            },
            'quality_of_life': {
                'Medium quality of life': 'Medium',
                'Low quality of life': 'Low',
                'High quality of life': 'High',
                'Very Low quality of life': 'Very Low',
                'Very High quality of life': 'Very High'
            },
            'alcohol_consumption': {
                'My alcohol consumption is moderate': 'Moderate',
                "I don't drink alcohol": 'No Drinks',
                'My alcohol consumption is below moderate': 'Below Moderate',
                'My alcohol consumption is above moderate': 'Above Moderate'
            },
            'personality_type': {
                'Introvert (a quiet person who is more interested in their own thoughts and feelings than spending time with other people)': 'Introvert',
                'Extrovert (a lively and confident person who enjoys being with other people)': 'Extrovert',
                'Somewhat in between': 'Somewhat in-between'
            },
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
            'well_hydrated': {'Yes': 'Yes', 'No': 'No'},
            'financial_problems': {'Yes': 'Yes', 'No': 'No'},
            'feel_afraid': {
                'Very frequently': 'Very Frequently',
                'Rarely': 'Rarely',
                'Never': 'Never',
                'Occasionally': 'Occasionally',
                'Very rarely': 'Very Rarely',
                'Frequently': 'Frequently',
                'nan': 'Not Provided'
            },
            'timetable_preference': {
                'I prefer my timetable to be compact. (having all my classes in one day or two days in the week)': 'Compact',
                'I prefer my timetable to be spread with long gaps in between classes (eg, 1-2 modules per day, spread over 3 times per week)': 'Spread'
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
            'student_type_time': {
                'I am a part-time student': 'Part Time',
                'I am a full-time student': 'Full Time',
                'I am unsure': "Don't Know"
            },
            'student_type_location': {
                'Home Student': 'Home student',
                'European Student': 'European student',
                'International Student': 'International student'
            },
            'form_of_employment': {
                'I am unemployed': 'Unemployed',
                'Yes, I am part-time employed': 'Part Time',
                'I am self-employed': 'Self Employed',
                'Yes, I am full-time employed': 'Full Time'
            },
            'sense_of_belonging': {
                "I don't know yet": "Don't Know",
                "I don't know how to answer this question": "Don't Know",
                'A little': 'Little',
                'Very much': 'Very Much'
            },
            'physical_activities': {
                'Yes, it helps a lot': 'Yes',
                'Yes, it sometimes helps': 'Yes',
                "I don't do physical activity": "Don't Know",
                "I've not really noticed if it helps or not": "Don't Know",
                'No, it does not help': 'No'
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
            'actual': {'Yes': 'Yes', 'No': 'No'},
            'gender': {
                'Male': 'Male',
                'Female': 'Female',
                'Other': 'Other',
                'prefer not to say': 'Prefer not to say',
                'Prefer not to say': 'Prefer not to say',
                'Non-binary / LGBTQ+': 'Other'
            }
        }

        self.country_mapping = {
            # UK variations
            'UK': 'United Kingdom',
            'Uk': 'United Kingdom',
            'uk': 'United Kingdom',
            'England': 'United Kingdom',
            'England ': 'United Kingdom',
            'Wales': 'United Kingdom',
            'United Kingdom ': 'United Kingdom',
            
            # US variations
            'us': 'United States',
            'America ': 'United States',
            
            # Asia
            'china': 'China',
            'China ': 'China',
            'sri lanka': 'Sri Lanka',
            'Sri lanka': 'Sri Lanka',
            'Viet Nam': 'Vietnam',
            'Korea, Republic of': 'South Korea',
            'Myanmar': 'Myanmar',
            'Philippines ': 'Philippines',
            
            # Europe
            'slovakia': 'Slovakia',
            'serbia': 'Serbia',
            'Russian Federation': 'Russia',
            'Moldova, Republic of': 'Moldova',
            
            # Middle East
            'Iran, Islamic Republic Of': 'Iran',
            'from Egypt, based in saudi': 'Saudi Arabia',
            'Yemen ': 'Yemen',
            
            # Africa
            'Tanzania, United Republic of': 'Tanzania',
            'nig': 'Nigeria',
            
            # Special territories
            'Hong Kong': 'Hong Kong SAR',
            'Falkland Islands (Malvinas)': 'Falkland Islands',
            'Bangladesh - born England': 'United Kingdom',
            
            # Clean spaces
            'India ': 'India',
            'Greece ': 'Greece'
        }
        # Add numeric conversions for hours/age columns
        self.numeric_columns = [
            'hours_per_week_university_work', 'exercise_per_week',
            'work_hours_per_week', 'total_device_hours', 
            'hours_socialmedia', 'hours_between_lectures',
            'hours_per_week_lectures', 'hours_socialising',
            'age', 'cost_of_study'
        ]
        
        

    def read_datasets(self):
        try:
            ual1 = pd.read_excel(self.base_path / "UAL_1_Questionnaire_Data.xlsx")
            ual2 = pd.read_excel(self.base_path / "UAL2_Questionnaire_Data.xlsx")
            sol = pd.read_excel(self.base_path / "Sol_Questionnaire_Data.xlsx")
            final = pd.read_excel(self.base_path / "Final.xlsx")
        
            return ual1, ual2, sol, final
        except Exception as e:
            print(f"Error reading files: {e}")
            raise

    def clean_and_standardize_dataset(self, df):
        """Clean and standardize the merged dataset"""
        
        if 'timetable_reasons' in df.columns:
            df = df.drop('timetable_reasons', axis=1)
            
        # Clean special characters
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].astype(str).str.replace('Â', '')
                df[col] = df[col].str.strip()
    
        # Handle stress columns first
        stress_columns = ['stress_in_general', 'stress_before_exams']
        for col in stress_columns:
            if col in df.columns:
                df[col] = df[col].apply(self.standardize_stress)
        
        # Apply value mappings
        for col, mapping in self.value_mappings.items():
            if col in df.columns:
                df[col] = df[col].map(mapping).fillna(df[col])
        
        # Handle numeric columns
        for col in self.numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
        
        # Special column handling
        if 'home_country' in df.columns:
            df['home_country'] = df['home_country'].apply(self.standardize_country)
        
        if 'course_of_study' in df.columns:
            df['course_of_study'] = df['course_of_study'].apply(self.standardize_course)
        
        return df
    
    def standardize_numeric(self, value):
        """Extract numeric value from string and convert to int"""
        if pd.isna(value):
            return 0
        if isinstance(value, (int, float)):
            return int(value)
        # Extract numbers from string
        import re
        numbers = re.findall(r'\d+', str(value))
        return int(numbers[0]) if numbers else 0

    def merge_datasets(self):
        """Merge and standardize all datasets"""
        ual1, ual2, sol, final = self.read_datasets()
        
        # Standardize each dataset
        
        # Add source column
        ual1['source'] = 'UAL1'
        ual2['source'] = 'UAL2'
        sol['source'] = 'SOL'
        final['source'] = 'Final'
        
        # Merge datasets
        merged_df = pd.concat([ual1, ual2, sol, final], ignore_index=True)
        
        # Clean and standardize merged dataset
        merged_df = self.clean_and_standardize_dataset(merged_df)
        
        # Save merged dataset
        merged_df.to_excel(self.base_path / "merged_dataset_cleaned_vx.xlsx", index=False)
        print(f"Merged dataset saved with {len(merged_df)} rows")
        
        return merged_df
    
    def compare_columns(self):
        merged = pd.read_excel(self.base_path / "evaluated_dataset.xlsx")
        
        
        comparison_results = {}
        
        for col in self.columns:
            comparison_results[col] = {
                'Merged': set(merged[col].dropna().unique()) if col in merged.columns else set(),
            }
        
        return comparison_results

    def save_comparison_results(self, comparison_results):
        output_path = self.base_path / "comparison_results_evaluated.txt"
        with open(output_path, 'w', encoding='utf-8') as f:
            for col, datasets in comparison_results.items():
                f.write(f"Column: {col}\n")
                for dataset, values in datasets.items():
                    f.write(f"  {dataset}: {values}\n")
                f.write("\n")
        print(f"Comparison results saved to {output_path}")
        
    def standardize_country(self, country):
        """Standardize country names"""
        if pd.isna(country):
            return 'Unknown'
        
        country = str(country).strip()
        return self.country_mapping.get(country, country.title())
    
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
    def standardize_stress(self, value):
        """Convert any stress-related response to Yes/No"""
        if pd.isna(value) or value == 'nan':
            return 'No'
        value = str(value).lower()
        
        if any(x in value for x in ['yes', 'stressed']):
            return 'Yes'
        if any(x in value for x in ["don't have exams", "don't normally have exams", 'no', 'not stressed']):
            return 'No'
        return 'No'

if __name__ == "__main__":
    standardizer = DataProcessor()
    # merged_data = standardizer.merge_datasets()
    standardizer.save_comparison_results(standardizer.compare_columns())
