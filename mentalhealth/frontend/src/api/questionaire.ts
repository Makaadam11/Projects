import { QuestionarieData } from '@/types/QuestionaireTypes';
import axios from 'axios';

export const submitQuestionaire = async (data: QuestionarieData) => {
  try {
    const response = await axios.post(`http://localhost:8000/api/submit/${data.source.toLowerCase()}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loadCourses = async (university: string): Promise<string[]> => {
  try {
    const response = await fetch(`http://localhost:8000/api/courses/${university}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }
    const data = await response.json();
    return data.courses;
  } catch (error) {
    console.error('Error loading courses:', error);
    return [];
  }
};

import { DashboardData } from '../types/dashboard';

export async function getDashboardData(): Promise<DashboardData[]> {
    const response = await fetch('http://localhost:8000/api/dashboard');
    
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
    }
    
    return response.json();
}
