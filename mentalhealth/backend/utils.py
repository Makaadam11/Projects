# app/utils.py
import pandas as pd

def process_questionnaire_data(df: pd.DataFrame) -> pd.DataFrame:
    # Map the questionnaire data to the required format
    df_processed = pd.DataFrame()
    df_processed['home_country'] = df['Q19']
    df_processed['ethnic_group'] = df['Q2']
    df_processed['year_of_birth'] = df['Q18']
    df_processed['age'] = df['Q18'].apply(lambda x: 2023 - int(x))
    df_processed['age_group'] = df_processed['age'].apply(lambda x: '16-20' if x <= 20 else '21-25' if x <= 25 else '26-30' if x <= 30 else '>30')
    df_processed['course_of_study'] = df['Q20']
    df_processed['course_category'] = 'Computing'  # Example, adjust as needed
    df_processed['financial_support'] = df['Q14']
    df_processed['financial_problems'] = df['Q16']
    df_processed['family_earning_class'] = df['Q4']
    df_processed['hours_per_week_university_work'] = df['Q3_1']
    df_processed['stress_before_exams'] = df['Q21']
    df_processed['stress_in_general'] = df['Q8']
    df_processed['form_of_employment'] = df['Q15']
    df_processed['work_hours_per_week'] = df['Q12_1']
    df_processed['quality_of_life'] = df['Q5']
    df_processed['known_disabilities'] = df['Q11']
    df_processed['alcohol_consumption'] = df['Q6']
    df_processed['well_hydrated'] = df['Q9']
    df_processed['diet'] = df['Q1']
    df_processed['social_media_use'] = df['Q32']
    df_processed['personality_type'] = df['Q7']
    df_processed['exercise_per_week'] = df['Q10_1']
    df_processed['hours_socialising'] = df['Q35']
    df_processed['total_social_media_hours'] = df['Q33']
    df_processed['total_device_hours'] = df['Q34']
    df_processed['feel_afraid'] = df['Q22']
    df_processed['timetable_preference'] = df['Q23']
    df_processed['ts_impact'] = df['Q24_1']
    df_processed['ts_full'] = df['Q25_1']
    df_processed['gender'] = df['Q29_1']
    df_processed['institution_country'] = df['Q19']
    df_processed['student_type_location'] = df['Q37']
    df_processed['student_type_time'] = df['Q36']
    df_processed['year_of_study'] = df['Q28']
    df_processed['cost_of_study'] = df['Q27']
    df_processed['hours_per_week_lectures'] = df['Q31_1']
    df_processed['hours_between_lectures'] = df['Q30_1']
    df_processed['Actual'] = df['Q37']
    df_processed['Predictions'] = 0  # Placeholder, replace with model predictions

    return df_processed