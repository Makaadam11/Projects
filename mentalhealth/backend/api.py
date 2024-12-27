from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import pandas as pd
from models import QuestionnaireDataModel
from fastapi.middleware.cors import CORSMiddleware
import os
from data_processor import DataProcessor

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterFormInputs(BaseModel):
    email: str
    password: str
    isAdmin: bool
class LoginFormInputs(BaseModel):
    email: str
    password: str

class CourseResponse(BaseModel):
    courses: List[str]
    university: str

class FilePath(BaseModel):
    path: str

@app.post("/api/submit/{university}")
async def submit_questionaire(university: str, data: QuestionnaireDataModel):
    try:
        # Save data to Excel
        if DataProcessor.save_and_evaluate(data, university):
            return {"status": "success", "message": "Survey submitted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save survey data")
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
        file_path = f"../data/{university.lower()}/{university.lower()}_courses.xlsx"
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Course file not found for {university}")
        
        # Read Excel file
        df = pd.read_excel(file_path)
        
        # Convert to list of courses
        courses = df.iloc[:, 0].tolist()
        
        return {
            "courses": courses,
            "university": university
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

def get_user_data():
    file_path = "../data/login/login_data.xlsx"
    if os.path.exists(file_path):
        df = pd.read_excel(file_path, header=0)
        print("userdata" , df)
        return df
    else:
        return pd.DataFrame(columns=["email", "password", "isAdmin"])

@app.post("/api/login")
async def login(data: LoginFormInputs):
    try:
        df = get_user_data()
        print("Input data:", data.email, data.password)
        print("DataFrame before comparison:", df)
        
        # Convert values to string and handle NaN
        df['email'] = df['email'].fillna('').astype(str)
        df['password'] = df['password'].fillna('').astype(str)
        
        # Clean input data
        clean_email = str(data.email).strip()
        clean_password = str(data.password).strip()
        
        # Compare values
        user = df[
            (df['email'].str.strip() == clean_email) & 
            (df['password'].str.strip() == clean_password)
        ]
        
        print("Matched user:", user)
        
        if not user.empty:
            return {"message": "Login successful", "isAdmin": bool(user.iloc[0]['isAdmin'])}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

def save_user_data(df):
    file_path = "../data/login/login_data.xlsx"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    df.to_excel(file_path, index=False)

@app.post("/api/register")
async def register(data: RegisterFormInputs):
    try:
        df = get_user_data()
        print("Registration attempt for:", data.email)
        
        if data.email in df['email'].values:
            raise HTTPException(status_code=400, detail="User already exists")
        
        new_user = pd.DataFrame([{
            'email': str(data.email).strip(),
            'password': str(data.password).strip(),
            'isAdmin': bool(data.isAdmin)
        }])
        
        df = pd.concat([df, new_user], ignore_index=True)
        save_user_data(df)
        
        return {"message": "User registered successfully"}
    except Exception as e:
        print(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@app.delete("/api/deleteUser")
async def delete_user(email: str):
    try:
        df = get_user_data()
        print("Delete attempt for:", email)
        
        if email not in df['email'].values:
            raise HTTPException(status_code=404, detail="User not found")
        
        df = df[df['email'] != email]
        save_user_data(df)
        
        return {"message": "User deleted successfully"}
    except Exception as e:
        print(f"Delete error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Delete error: {str(e)}")