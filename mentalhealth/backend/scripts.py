import pandas as pd
import os

def update_predictions(file_path=r"C:\Projects\mentalhealth\data\merged\merged_data.xlsx"):
    """Update the prediction column based on the actual column"""
    try:
        df = pd.read_excel(file_path)
        
        if 'Predictions' not in df.columns or '32. Would you classify yourself or have you been diagnosed with mental health issues by a professional?' not in df.columns:
            raise ValueError("Columns 'Predictions' and '32. Would you classify yourself or have you been diagnosed with mental health issues by a professional?' must exist in the dataset")
        
        # Update prediction column
        df['Predictions'] = df['32. Would you classify yourself or have you been diagnosed with mental health issues by a professional?'].apply(lambda x: 1 if isinstance(x, str) and x.lower() == 'yes' else 0)
        
        # Save the updated DataFrame back to the Excel file
        df.to_excel(file_path, index=False)
        print(f"Updated predictions saved to {file_path}")
        
    except Exception as e:
        print(f"Error processing file: {e}")

if __name__ == "__main__":
    update_predictions()