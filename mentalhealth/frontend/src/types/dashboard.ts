export interface MentalHealthData {
  student_type_location: 'European' | 'Home Student' | 'International Student';
  hours_per_week_lectures: number;
  hours_per_week_university_work: number;
  personality_type: 'Extrovert' | 'Introvert' | 'Somewhat in Between';
  total_social_media_hours: number;
  total_device_hours: number;
  hours_socialising: number;
  alcohol_consumption: string;
  well_hydrated: boolean;
  diet: string;
  exercise_per_week: number;
  financial_support: boolean;
  financial_problems: boolean;
  cost_of_study: number;
  student_type_time: 'Full-Time' | 'Part-Time';
  country: string;
  ethnic_group: string;
  stress_before_exams: boolean;
  form_of_employment: string;
  feel_afraid: boolean;
  stress_in_general: number;
  work_hours_per_week: number;
  gender: string;
  family_earning_class: string;
  age: number;
  quality_of_life: string;
  known_disabilities: boolean;
  social_media_use: string;
  course_of_study: string;
  year_of_study: number;
  category: string;
  timetable_preference: string;
  ts_impact: string;
  hours_between_lectures: number;
  mental_health_status: boolean;
}

export interface FilterState {
  studentType: string[];
  gender: string[];
  ageRange: [number, number];
  courseCategory: string[];
  employmentStatus: string[];
  ethnicGroup: string[];
}