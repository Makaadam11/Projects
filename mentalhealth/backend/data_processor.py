import pandas as pd
from pathlib import Path
from datetime import datetime
import os
from data_evaluation import evaluate_data
from models import QuestionnaireColumnsModel
import numpy as np

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
        
    @staticmethod
    def append_row_to_excel(excel_path, data_dict):
        if os.path.exists(excel_path):
            # Read full file with first row as header
            df = pd.read_excel(excel_path, header=0)
            
            # Create new row
            new_row = {}
            for col in df.columns:
                col_id = df.iloc[0][col]  # Get column ID from second row
                
                # Find matching answer
                answer = next((item.get('answer', None) 
                            for item in data_dict['answers'] 
                            if item['id'] == col_id), None)
                
                # Special handling
                if col_id == 'stress_in_general' and answer:
                    if any('Yes' in a for a in answer):
                        answer = [a for a in answer if a != 'No']
                    answer = ','.join(answer).replace('[', '').replace(']', '')
                elif col_id == 'age' and answer:
                    current_year = int(datetime.now().strftime('%Y'))
                    answer = current_year - int(answer)
                    
                new_row[col] = answer
            
            # Add metadata
            new_row['Source'] = data_dict['source']
            new_row['Predictions'] = data_dict['predictions']
            new_row['Captured At'] = data_dict['captured_at']
            
            # Append row after headers
            new_row_df = pd.DataFrame([new_row])
            df = pd.concat([df.iloc[:1], new_row_df, df.iloc[1:]], ignore_index=True)
            
            # Save preserving both header rows
            df.to_excel(excel_path, index=False)
            
        else:
            # Create new file with two header rows
            questions = [
                '1. Would you describe your current diet as healthy and balanced?',
                # ... rest of questions
                'Source', 'Predictions', 'Captured At'
            ]
            
            column_ids = [
                'diet', 'ethnic_group',
                # ... rest of ids
                'source', 'predictions', 'captured_at'
            ]
            
            # Create DataFrame with questions as headers
            df = pd.DataFrame(columns=questions)
            
            # Add column IDs as first row
            df.loc[0] = column_ids
            
            # Add new data row
            new_row = {}
            for q, col_id in zip(questions, column_ids):
                if col_id in ['source', 'predictions', 'captured_at']:
                    answer = data_dict.get(col_id)
                else:
                    answer = next((item.get('answer', None) 
                                for item in data_dict['answers'] 
                                if item['id'] == col_id), None)
                new_row[q] = answer
                
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            df.to_excel(excel_path, index=False)
    
    @staticmethod
    def save_and_evaluate(data, university: str):
        try:
            # Convert model to dict
            data_dict = data.dict()
            print("Before processing:", data_dict)
            
            # Add timestamp and source
            data_dict['source'] = university.upper()
            data_dict['predictions'] = 0
            data_dict['captured_at'] = datetime.now().strftime('%d.%m.%Y %H:%M')
            
            # Paths to Excel files
            university_excel_path = f"../data/{university.lower()}/{university.lower()}_data/{university.lower()}_data.xlsx"
            merged_excel_path = "../data/merged/merged_data.xlsx"
            
            # Append row to both university-specific and merged Excel files
            DataProcessor.append_row_to_excel(university_excel_path, data_dict)
            DataProcessor.append_row_to_excel(merged_excel_path, data_dict)
            
            # Read Excel
            df_merged = pd.read_excel(merged_excel_path, header=None)

            # Store questions (first row) and set IDs as headers (second row)
            questions_row = df_merged.iloc[0].copy()  # Store questions
            column_ids = df_merged.iloc[1].copy()     # Set IDs as column names
            df_merged = df_merged.iloc[2:]            # Keep only data rows

            # Set column IDs for processing
            df_merged.columns = column_ids

            # Print predictions count before evaluation
            print("Predictions count before evaluation:")
            print(df_merged['predictions'].value_counts())

            # Print count of predictions equal to 0 and 1
            print("Count of predictions equal to 0:", (df_merged['predictions'] == 0).sum())
            print("Count of predictions equal to 1:", (df_merged['predictions'] == 1).sum())

            # Print count of actual values equal to 0 and 1
            if 'actual' in df_merged.columns:
                print("Count of actual values equal to 0:", (df_merged['actual'] == 0).sum())
                print("Count of actual values equal to 1:", (df_merged['actual'] == 1).sum())
            else:
                print("Column 'actual' not found in df_merged")

            # Process data with ID headers
            df_copy = pd.read_excel(merged_excel_path, header=[0,1])
            df_merged_evaluated = evaluate_data(df_copy)

            # Update predictions keeping ID headers
            if 'predictions' in df_merged.columns and 'predictions' in df_merged_evaluated.columns:
                condition = df_merged['actual'] == "Prefer not to say / I don't know"
                
                # Ensure predictions column is numeric
                df_merged['predictions'] = pd.to_numeric(df_merged['predictions'], errors='coerce')
                df_merged_evaluated['predictions'] = pd.to_numeric(df_merged_evaluated['predictions'], errors='coerce')
                
                # Update predictions with proper index alignment
                matching_indices = df_merged.index[condition]
                evaluated_indices = df_merged_evaluated.index[condition]
                
                if len(matching_indices) == len(evaluated_indices):
                    df_merged.loc[matching_indices, 'predictions'] = df_merged_evaluated.loc[evaluated_indices, 'predictions'].values
                    print(f"Updated predictions for {len(matching_indices)} rows")
                else:
                    print("Error: Index mismatch between DataFrames")
                    
            else:
                print(f"df_merged_evaluated columns: {df_merged_evaluated.columns.tolist()}")

            # Print predictions count after evaluation
            print("Predictions count after evaluation:")
            print(df_merged['predictions'].value_counts())

            # Print count of predictions equal to 0 and 1
            print("Count of predictions equal to 0:", (df_merged['predictions'] == 0).sum())
            print("Count of predictions equal to 1:", (df_merged['predictions'] == 1).sum())

            # Print count of actual values equal to 0 and 1
            if 'actual' in df_merged.columns:
                print("Count of actual values equal to 0:", (df_merged['actual'] == 0).sum())
                print("Count of actual values equal to 1:", (df_merged['actual'] == 1).sum())
            else:
                print("Column 'actual' not found in df_merged")

            # Format 'captured_at' column
            df_merged['captured_at'] = pd.to_datetime(df_merged['captured_at'], errors='coerce').dt.strftime('%d.%m.%Y %H:%M')

            # Create DataFrame with questions as new columns
            df_merged.columns = questions_row
            
            # Update source files
            for source in df_merged['Source'].unique():
                if pd.isna(source):
                    continue
                source_str = str(source).strip()
                if not source_str:
                    continue
                
                source_df = df_merged[df_merged['Source'] == source].copy()
                source_excel_path = f"../data/{source_str.lower()}/{source_str.lower()}_data/{source_str.lower()}_data.xlsx"

                # Add empty row at the beginning
                source_df.loc[-1] = [None] * len(source_df.columns)
                source_df.index = source_df.index + 1
                source_df = source_df.sort_index()

                # Fill first row with column_ids values
                for idx, col in enumerate(source_df.columns):
                    source_df.iloc[0, idx] = column_ids.values[idx]
                
                source_df.to_excel(source_excel_path, index=False)

            # Add empty row at the beginning of merged df
            df_merged.loc[-1] = [None] * len(df_merged.columns)
            df_merged.index = df_merged.index + 1
            df_merged = df_merged.sort_index()

            # Fill first row with column_ids values
            for idx, col in enumerate(df_merged.columns):
                df_merged.iloc[0, idx] = column_ids.values[idx]

            df_merged.to_excel(merged_excel_path, index=False)
            return True
            
        except Exception as e:
            print(f"Error saving to Excel: {e}")
            return False
        
if __name__ == "__main__":
    processor = DataProcessor()
    processor.process_data()