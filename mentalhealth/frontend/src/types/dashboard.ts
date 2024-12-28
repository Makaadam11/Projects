export interface DashboardData {
  diet: string;
  ethnic_group: string;
  hours_per_week_university_work: number;
  family_earning_class: string;
  quality_of_life: string;
  alcohol_consumption: string;
  personality_type: string;
  stress_in_general: string[];
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
}

export interface FilterState {
  studentType: string[];
  gender: string[];
  ageRange: [number, number];
  courseCategory: string[];
  employmentStatus: string[];
  ethnicGroup: string[];
}

export type FilterKey = keyof FilterState;