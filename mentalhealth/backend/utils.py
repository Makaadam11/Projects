import pandas as pd

def merge_headers(df):
    """Merge the first two header rows into a single header row."""
    # Combine the first two rows to create a new header
    new_header = []
    for col1, col2 in zip(df.iloc[0], df.iloc[1]):
        if pd.isna(col2):
            new_header.append(col1)
        else:
            new_header.append(f"{col1} ({col2})")
    
    # Apply the new header to the DataFrame
    df.columns = new_header
    df = df.drop([0, 1]).reset_index(drop=True)
    
    return df

# Example usage
if __name__ == "__main__":
    # Load the dataset
    df = pd.read_excel(r"C:\Projects\mentalhealth\data\merged\merged_data.xlsx", header=None)
    
    # Merge headers
    df = merge_headers(df)
    
    # Save the updated DataFrame
    df.to_excel(r"C:\Projects\mentalhealth\data\merged\merged_data.xlsx", index=False)