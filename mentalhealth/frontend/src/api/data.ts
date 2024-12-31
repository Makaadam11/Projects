import { QuestionarieData } from '@/types/QuestionaireTypes';
import { DashboardData } from '@/types/dashboard';
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

export const loadDepartments = async (university: string): Promise<string[]> => {
  try {
    const response = await fetch(`http://localhost:8000/api/departments/${university}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data.departments);
    return data.departments;
  } catch (error) {
    console.error('Error loading courses:', error);
    return [];
  }
};

export async function getDashboardData(): Promise<DashboardData[]> {
    const response = await fetch('http://localhost:8000/api/dashboard');
    
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
    }
    
    return response.json();
}

export const generateReport = async (filteredData: any[], chartImages: any []) => {
  try {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: filteredData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate report');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};