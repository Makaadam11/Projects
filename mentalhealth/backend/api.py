from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
from models import QuestionnaireDataModel
from evaluation import evaluate_models
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CourseResponse(BaseModel):
    courses: List[str]
    university: str

class FilePath(BaseModel):
    path: str

@app.post("/api/addQuestionarie")
async def submit_questionaire(data: QuestionnaireDataModel):
    try:
        # Process survey data
        # Add to database or file
        return {"status": "success", "message": "Survey submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/reports")
async def get_reports():
    # Generate and return reports
    return {"message": "Reports generated"}

@app.get("/api/courses/{university}", response_model=CourseResponse)
async def get_courses(university: str):
    try:
        # Construct file path
        file_path = f"C:/Projects/mentalhealth/data/{university.lower()}/{university.lower()}_courses.xlsx"
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Course file not found for {university}")
        
        # Read Excel file
        df = pd.read_excel(file_path)
        
        # Convert to list of courses
        courses = df.iloc[:, 0].tolist()
        print(courses)
        
        return {
            "courses": courses,
            "university": university
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))