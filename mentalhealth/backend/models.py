from pydantic import BaseModel
import anthropic
import json
import os
from typing import Optional, List, Union

with open('api_key.json') as f:
    api_keys = json.load(f)
    antropic_key = api_keys['antropic_key']
    grok_key = api_keys['grok_key']

from groq import Groq

class GroqClient:
    def __init__(self):
        self.client = Groq(
            api_key=os.environ.get("GROQ_API_KEY") if os.environ.get("GROQ_API_KEY") else grok_key
        )

    def generate_report(self, prompt: str) -> str:
        try:
            response = self.client.chat.completions.create(
                max_tokens=4000,
                temperature=0.7,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional report writer specializing in mental health analysis. Format your response in clear sections with headers. Focus on analyzing the data based on the prediction values (0 or 1) indicating mental health issues."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama-3.1-8b-instant"
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"Error generating report: {e}")
            return f"Error generating report: {str(e)}"

class AnthropicLanguageModel:
    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=antropic_key
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
    source: Optional[str]
    predictions: Optional[int]
    captured_at: Optional[str]
    
class DashboardDataModel(BaseModel):
    diet: Optional[str]
    ethnic_group: Optional[str]
    hours_per_week_university_work: Optional[int]
    family_earning_class: Optional[str]
    quality_of_life: Optional[str]
    alcohol_consumption: Optional[str]
    personality_type: Optional[str]
    stress_in_general: Optional[str]
    well_hydrated: Optional[str]
    exercise_per_week: Optional[int]
    known_disabilities: Optional[str]
    work_hours_per_week: Optional[int]
    financial_support: Optional[str]
    form_of_employment: Optional[str]
    financial_problems: Optional[str]
    home_country: Optional[str]
    age: Optional[int]
    course_of_study: Optional[str]
    stress_before_exams: Optional[str]
    feel_afraid: Optional[str]
    timetable_preference: Optional[str]
    timetable_reasons: Optional[str]
    timetable_impact: Optional[str]
    total_device_hours: Optional[int]
    hours_socialmedia: Optional[int]
    level_of_study: Optional[str]
    gender: Optional[str]
    physical_activities: Optional[str]
    hours_between_lectures: Optional[int]
    hours_per_week_lectures: Optional[int]
    hours_socialising: Optional[int]
    actual: Optional[str]
    student_type_time: Optional[str]
    student_type_location: Optional[str]
    cost_of_study: Optional[int]
    sense_of_belonging: Optional[str]
    mental_health_activities: Optional[str]
    source: Optional[str]
    predictions: Optional[int]
    captured_at: Optional[str]
