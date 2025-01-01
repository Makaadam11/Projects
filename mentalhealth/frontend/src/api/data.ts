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

export const generateReport = async (filteredData: DashboardData[], chartImages: { [key: string]: string }) => {
  try {
    if (!filteredData?.length) throw new Error('Invalid filtered data');
    if (!chartImages || !Object.keys(chartImages).length) throw new Error('No chart images provided');

    // Clean and transform the data
    const cleanedData = filteredData.map(item => ({
      ...item,
      // Convert numeric fields and handle NaN/null
      age: Number(item.age) || 0,
      hours_per_week_university_work: Number(item.hours_per_week_university_work) || 0,
      work_hours_per_week: Number(item.work_hours_per_week) || 0,
      hours_socialising: Number(item.hours_socialising) || 0,
      hours_socialmedia: Number(item.hours_socialmedia) || 0,
      total_device_hours: Number(item.total_device_hours) || 0,
      cost_of_study: Number(item.cost_of_study) || 0,
      hours_per_week_lectures: Number(item.hours_per_week_lectures) || 0,
      hours_between_lectures: Number(item.hours_between_lectures) || 0,
      exercise_per_week: Number(item.exercise_per_week) || 0,
      predictions: isNaN(Number(item.predictions)) ? 0 : Number(item.predictions), // Ensure predictions field is a valid number
      captured_at: item.captured_at || new Date().toISOString(), // Ensure captured_at field is included
    }));

    // Process and validate chart images
    const processedChartImages = Object.fromEntries(
      Object.entries(chartImages)
        .filter(([_, value]) => value?.startsWith('data:image/'))
        .map(([key, value]) => [key, value])
    );

    const payload = {
      data: cleanedData,
      charts: processedChartImages
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('http://localhost:8000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`Server error: ${responseData.detail || JSON.stringify(responseData)}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
};
