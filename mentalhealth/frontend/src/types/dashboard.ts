export interface DashboardData {
  diet: string;
  ethnic_group: string;
  hours_per_week_university_work: number;
  family_earning_class: string;
  quality_of_life: string;
  alcohol_consumption: string;
  personality_type: string;
  stress_in_general: string;
  well_hydrated: string;
  exercise_per_week: number;
  known_disabilities: string;
  work_hours_per_week: number;
  financial_support: string;
  form_of_employment: string;
  financial_problems: string;
  home_country: string;
  age: number;
  course_of_study: string;
  stress_before_exams: string;
  feel_afraid: string;
  timetable_preference: string;
  timetable_reasons: string;
  timetable_impact: string;
  total_device_hours: number;
  hours_socialmedia: number;
  level_of_study: string;
  gender: string;
  physical_activities: string;
  hours_between_lectures: number;
  hours_per_week_lectures: number;
  hours_socialising: number;
  actual: string;
  student_type_time: string;
  student_type_location: string;
  cost_of_study: number;
  sense_of_belonging: string;
  mental_health_activities: string;
  predictions: number;
  source: string;
  captured_at: string;
  department?: string;
}


export type FilterState = {

  ethnic_group: string[];

  home_country: string[];

  age: string[];

  gender: string[];

  student_type_location: string[];

  student_type_time: string[];

  course_of_study: string[];

  hours_between_lectures: string[];

  hours_per_week_lectures: string[];

  hours_per_week_university_work: string[];

  level_of_study: string[];

  timetable_preference: string[];

  timetable_reasons: string[];

  timetable_impact: string[];

  financial_support: string[];

  financial_problems: string[];

  family_earning_class: string[];

  form_of_employment: string[];

  work_hours_per_week: string[];

  cost_of_study: string[];

  diet: string[];

  well_hydrated: string[];

  exercise_per_week: string[];

  alcohol_consumption: string[];

  personality_type: string[];

  physical_activities: string[];

  mental_health_activities: string[];

  hours_socialmedia: string[];

  total_device_hours: string[];

  hours_socialising: string[];

  quality_of_life: string[];

  feel_afraid: string[];

  stress_in_general: string[];

  stress_before_exams: string[];

  known_disabilities: string[];

  sense_of_belonging: string[];

};


export type FilterKey = keyof FilterState;