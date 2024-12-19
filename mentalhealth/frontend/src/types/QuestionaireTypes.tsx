export type QuestionType = 'single' | 'multi' | 'slider' | 'text';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export const surveyQuestions: Question[] = [
  {
    id: 'diet',
    type: 'single',
    question: 'Would you describe your current diet as healthy and balanced?',
    options: ['Yes', 'No', 'Sometimes']
  },
  {
    id: 'ethnicGroup',
    type: 'single',
    question: 'What is your ethnic group?',
    options: ['Asian', 'Black', 'Mixed', 'White', 'Arab', 'Other']
  },
  {
    id: 'studyHours',
    type: 'slider',
    question: 'How many hours do you spend on university/academic-related work per week during exams?',
    min: 0,
    max: 50,
    step: 1
  },
  {
    id: 'familyClass',
    type: 'single',
    question: 'How would you rate your family class? (family earnings per year)',
    options: ['Lower Class (below £25,000)', 'Middle Class (£25,000-£54,999)', 
              'Higher Class (£55,000-£90,000)', 'Upper Higher Class (above £90,000)']
  },
  {
    id: 'qualityOfLife',
    type: 'single',
    question: 'How would you define your quality of life?',
    options: ['Very Poor', 'Poor', 'Neither Poor nor Good', 'Good', 'Very Good']
  },
  {
    id: 'alcoholConsumption',
    type: 'single',
    question: 'How would you define your alcohol consumption?',
    options: ['Never', 'Occasionally', 'Regularly', 'Frequently', 'Daily']
  },
  {
    id: 'personalityType',
    type: 'single',
    question: 'Would you consider yourself an introvert or extrovert person?',
    options: ['Introvert', 'Extrovert', 'Ambivert']
  },
  {
    id: 'stressFactors',
    type: 'multi',
    question: 'In general, do you feel you experience stress while in University?',
    options: ['Due to university work', 'Due to employment', 'Due to personal circumstances', 'No stress']
  },
  {
    id: 'hydration',
    type: 'single',
    question: 'Would you say that you are normally well hydrated?',
    options: ['Yes', 'No', 'Sometimes']
  },
  {
    id: 'exerciseFrequency',
    type: 'slider',
    question: 'How often do you exercise per week?',
    min: 0,
    max: 7,
    step: 1
  },
  {
    id: 'disabilities',
    type: 'single',
    question: 'Do you have any known disabilities?',
    options: ['Yes', 'No', 'Prefer not to say']
  },
  {
    id: 'workHours',
    type: 'slider',
    question: 'How many hours per week do you work?',
    min: 0,
    max: 40,
    step: 1
  },
  {
    id: 'financialSupport',
    type: 'single',
    question: 'What is your main financial support for your studies?',
    options: ['Student loan', 'Parent support', 'Self-funded', 'Scholarship', 'Other']
  },
  {
    id: 'employment',
    type: 'single',
    question: 'Are you in any form of employment?',
    options: ['Full-time', 'Part-time', 'Not employed', 'Self-employed']
  },
  {
    id: 'financialIssues',
    type: 'single',
    question: 'Do you normally encounter financial issues paying your fees?',
    options: ['Yes', 'No', 'Sometimes']
  },
  {
    id: 'homeCountry',
    type: 'text',
    question: 'What Country are you from?'
  },
  {
    id: 'yearOfBirth',
    type: 'slider',
    question: 'What is your year of birth?',
    min: 1970,
    max: 2010,
    step: 1
  },
  {
    id: 'courseOfStudy',
    type: 'text',
    question: 'What is your course of study?'
  },
  {
    id: 'examStress',
    type: 'single',
    question: 'Do you normally feel stressed before exams?',
    options: ['Yes', 'No', 'Sometimes']
  },
  {
    id: 'anxiety',
    type: 'single',
    question: 'How often did you feel afraid that something awful might happen?',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often']
  },
  {
    id: 'timetablePreference',
    type: 'single',
    question: 'Would you prefer your timetable to be spread or compact?',
    options: ['Spread (3-4 days with fewer lectures)', 'Compact (1-2 busy days)']
  },
  {
    id: 'timetableReasons',
    type: 'text',
    question: 'What are the reasons for your timetable preference?'
  },
  {
    id: 'timetableImpact',
    type: 'single',
    question: 'Does your timetabling structure impact your study, life and health?',
    options: ['Yes', 'No', 'Sometimes']
  },
  {
    id: 'deviceHours',
    type: 'slider',
    question: 'How many hours do you spend using technology devices per day?',
    min: 0,
    max: 24,
    step: 1
  },
  {
    id: 'socialMediaHours',
    type: 'slider',
    question: 'How many hours do you spend using social media per day?',
    min: 0,
    max: 24,
    step: 1
  },
  {
    id: 'yearOfStudy',
    type: 'single',
    question: 'What year of study are you in?',
    options: ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Postgraduate']
  },
  {
    id: 'gender',
    type: 'single',
    question: 'How would you describe your biological gender?',
    options: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  {
    id: 'physicalActivity',
    type: 'single',
    question: 'Do you consider physical activity to be helpful to your mental health?',
    options: ['Yes', 'No', 'Not sure']
  },
  {
    id: 'hoursBetweenLectures',
    type: 'slider',
    question: 'How many hours do you normally have BETWEEN lectures per day?',
    min: 0,
    max: 12,
    step: 1
  },
  {
    id: 'lectureHours',
    type: 'slider',
    question: 'How many hours per week do you have active lectures?',
    min: 0,
    max: 40,
    step: 1
  },
  {
    id: 'socialHours',
    type: 'slider',
    question: 'How many hours per week do you socialise?',
    min: 0,
    max: 40,
    step: 1
  },
  {
    id: 'mentalHealth',
    type: 'single',
    question: 'Have you been diagnosed with mental health issues by a professional?',
    options: ['Yes', 'No', 'Prefer not to say']
  },
  {
    id: 'studentType',
    type: 'single',
    question: 'Are you full-time or part-time student?',
    options: ['Full-time', 'Part-time']
  },
  {
    id: 'studentStatus',
    type: 'single',
    question: 'Are you a home student or an international student?',
    options: ['Home student', 'International student', 'EU student']
  },
  {
    id: 'tuitionFees',
    type: 'slider',
    question: 'What are the approximate costs for your studies per year (£)?',
    min: 0,
    max: 50000,
    step: 1000
  },
  {
    id: 'belonging',
    type: 'single',
    question: 'Do you feel a sense of belonging at Solent?',
    options: ['Very much', 'Somewhat', 'Not really', 'Not at all']
  },
  {
    id: 'mentalHealthActivities',
    type: 'text',
    question: 'What activities could support your mental health?'
  }
]