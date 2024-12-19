from pydantic import BaseModel
import anthropic
import json
import os

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
    StartDate: str
    EndDate: str
    Status: str
    IPAddress: str
    Progress: int
    Duration: int
    Finished: bool
    RecordedDate: str
    ResponseId: str
    RecipientLastName: str
    RecipientFirstName: str
    RecipientEmail: str
    ExternalReference: str
    LocationLatitude: float
    LocationLongitude: float
    DistributionChannel: str
    UserLanguage: str
    Instruction: str
    Q1: str
    Q2: str
    Q3_1: int
    Q4: str
    Q5: str
    Q6: str
    Q7: str
    Q8: str
    Q9: str
    Q10_1: int
    Q11: str
    Q12_1: int
    Q13: str
    Q14: str
    Q15: str
    Q16: str
    Q17_1: int
    Q18: str
    Q19: str
    Q20: str
    Q21: str
    Q22: str
    Q23: str
    Q24_1: int
    Q25_1: int
    Q26: str
    Q27: str
    Q28: str
    Q29_1: int
    Q30_1: int
    Q31_1: int
    Q32: str
    Q33: str
    Q34: str
    Q35: str
    Q36: str
    Q37: str