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
    answers: List[dict]
    source: str
    
class QuestionnaireColumnsModel(BaseModel):
    diet: str
    ethnic_group: str
    hours_per_week_university_work: int
    family_earning_class: str
    quality_of_life: str
    alcohol_consumption: str
    personality_type: str
    stress_in_general: List[str]
    well_hydrated: str
    exercise_per_week: int
    known_disabilities: str
    work_hours_per_week: int
    financial_support: str
    form_of_employment: str
    financial_problems: str
    home_country: str
    age: int
    course_of_study: str
    stress_before_exams: str
    feel_afraid: str
    timetable_preference: str
    timetable_reasons: str
    timetable_impact: str
    total_device_hours: int
    hours_socialmedia: int
    level_of_study: str
    gender: str
    physical_activities: str
    hours_between_lectures: int
    hours_per_week_lectures: int
    hours_socialising: int
    actual: str
    student_type_time: str
    student_type_location: str
    cost_of_study: int
    sense_of_belonging: str
    mental_health_activities: str
