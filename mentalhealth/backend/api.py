from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
from backend.models import QuestionnaireDataModel
from backend.utils import process_questionnaire_data
from backend.evaluation import evaluate_models
import os

app = FastAPI()

class FilePath(BaseModel):
    path: str

@app.post("/process")
async def process_data(file_path: FilePath):
    try:
        # Check file extension and read accordingly
        # if file_path.path.endswith('.csv'):
        #     df = pd.read_csv(file_path.path)
        # elif file_path.path.endswith('.xlsx'):
        #     df = pd.read_excel(file_path.path)
        # else:
        #     raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # processed_data = process_questionnaire_data(df)
        
        # Save the processed data to the data folder
        # output_path = os.path.join("data", "processed_data.csv")
        # processed_data.to_csv(output_path, index=False)
        df_test = pd.read_excel("C:/Projects/mentalhealth/data/Sol_Processed_Data.xlsx")
        # df_test.to_csv("C:/Projects/mentalhealth/data/Sol_Processed_Data.xlsx", index=False)

        # Evaluate models
        evaluation_results = evaluate_models()
        
        return {
            "processed_data": df_test.to_dict(orient="records"),
            "evaluation_results": evaluation_results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/reports")
async def get_reports():
    # Generate and return reports
    return {"message": "Reports generated"}