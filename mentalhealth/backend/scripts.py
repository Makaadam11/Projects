import pandas as pd
import os

def get_column_options(file_path=r"C:\Projects\mentalhealth\data\merged\merged_data.xlsx"):
    """Get unique values for each column in the dataset"""
    try:
        df = pd.read_excel(file_path)
        column_options = {}
        
        for column in df.columns:
            unique_values = df[column].dropna().unique()
            
            if pd.api.types.is_numeric_dtype(df[column]):
                values = sorted([x for x in unique_values if pd.notna(x)])
            else:
                values = [str(x) for x in unique_values if pd.notna(x)]
                values.sort()
            
            column_options[column] = values
            
        return column_options
        
    except Exception as e:
        print(f"Error reading file: {e}")
        return {}

if __name__ == "__main__":
    # Get column options
    options = get_column_options()
    
    # Convert dictionary to DataFrame
    df_options = pd.DataFrame.from_dict(options, orient='index').transpose()
    
    # Save to Excel
    output_path = r"C:\Projects\mentalhealth\data\merged\cols.xlsx"
    df_options.to_excel(output_path, index=False)
    print(f"Column options saved to {output_path}")