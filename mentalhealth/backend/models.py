from pydantic import BaseModel
import anthropic
import json
import os
from typing import Optional, List, Union

with open('api_key.json') as f:
    key = json.load(f)['key']

from groq import Groq

class GroqClient:
    def __init__(self):
        self.client = Groq(
            api_key=os.environ.get("GROQ_API_KEY"),
        )

    def generate_report(self, prompt: str) -> str:
        try:
            response = self.client.chat.completions.create(
                max_tokens=4000,
                temperature=0.7,
                system="You are a professional report writer specializing in mental health analysis. Format your response in clear sections with headers.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama3-8b-8192"
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"Error generating report: {e}")
            return f"Error generating report: {str(e)}"

class AnthropicLanguageModel:
    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=key
        )

    def generate_report(self, prompt: str) -> str:
        try:
            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=4000,
                temperature=0.7,
                system="You are a professional report writer specializing in mental health analysis. Format your response in clear sections with headers.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            return response.content[0].text

        except Exception as e:
            print(f"Error generating report: {e}")
            return f"Error generating report: {str(e)}"

class QuestionnaireDataModel(BaseModel):
    diet: str
    ethnicGroup: str
    studyHours: int
    familyClass: str
    qualityOfLife: str
    alcoholConsumption: str
    personalityType: str
    stressFactors: List[str]
    hydration: str
    exerciseFrequency: int
    disabilities: str
    workHours: int
    financialSupport: str
    employment: str
    financialIssues: str
    homeCountry: str
    yearOfBirth: int
    courseOfStudy: str
    examStress: str
    anxietyLevel: str
    timetablePreference: str
    timetableReasons: str
    timetableImpact: str
    deviceHours: int
    socialMediaHours: int
    yearOfStudy: str
    gender: str
    physicalActivity: str
    hoursBetweenLectures: int
    lectureHours: int
    socialHours: int
    mentalHealth: str
    studentType: str
    studentStatus: str
    tuitionFees: int
    belonging: str
    mentalHealthActivities: Optional[str]
    source: str
    prediction: int
    capturedAt: float