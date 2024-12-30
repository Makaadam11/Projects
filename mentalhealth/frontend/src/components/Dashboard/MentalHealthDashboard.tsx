"use client"
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import { FilterPanel } from './FilterPanel';
import { StudentTypeChart } from './charts/StudentTypeChart';
import { PersonalityChart } from './charts/PersonalityChart';
import { DietExerciseChart } from './charts/DietExerciseChart';
import { FinancialChart } from './charts/FinancialChart';
import { CountryMap } from './charts/CountryMap';
import { EthnicGroupTable } from './charts/EthnicGroupTable';
import { EmploymentChart } from './charts/EmploymentChart';
import { GenderChart } from './charts/GenderChart';
import { QualityOfLifeChart } from './charts/QualityOfLifeChart';
import { CourseTreemap } from './charts/CourseTreemap';
import { TimetableChart } from './charts/TimetableChart';
import type { FilterState, DashboardData } from '../../types/dashboard';
import { getDashboardData, generateReport } from '../../api/data';
import html2canvas from 'html2canvas';
import { Demographics } from './Demographics';
import { PhysicalActivitiesChart } from './LifestyleAndBehaviour/PhysicalActivitiesChart';
import { PsychologicalAndEmotionalFactors } from './PsychologicalAndEmotionalFactors';
import { AcademicContext } from './AcademicContext';
import { SocioceonomicFactors } from './SocioceonomicFactors';
import { LifestyleAndBehaviour } from './LifestyleAndBehaviour';
import { SocialAndTechnologicalFactors } from './SocialAndTechnologicalFactors';

const MentalHealthDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    ethnic_group: [],
    home_country: [],
    age: [],
    gender: [],
    student_type_location: [],
    student_type_time: [],
    course_of_study: [],
    hours_between_lectures: [],
    hours_per_week_lectures: [],
    hours_per_week_university_work: [],
    level_of_study: [],
    timetable_preference: [],
    timetable_reasons: [],
    timetable_impact: [],
    financial_support: [],
    financial_problems: [],
    family_earning_class: [],
    form_of_employment: [],
    work_hours_per_week: [],
    cost_of_study: [],
    diet: [],
    well_hydrated: [],
    exercise_per_week: [],
    alcohol_consumption: [],
    personality_type: [],
    physical_activities: [],
    mental_health_activities: [],
    hours_socialmedia: [],
    total_device_hours: [],
    hours_socialising: [],
    quality_of_life: [],
    feel_afraid: [],
    stress_in_general: [],
    stress_before_exams: [],
    known_disabilities: [],
    sense_of_belonging: [],
  });

  const chartRefs = {
    studentType: useRef(null),
    personality: useRef(null),
    dietExercise: useRef(null),
    financial: useRef(null),
    countryMap: useRef(null),
    ethnicGroup: useRef(null),
    employment: useRef(null),
    gender: useRef(null),
    qualityOfLife: useRef(null),
    courseTreemap: useRef(null),
    timetable: useRef(null),
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardData();
      const dashboardData = response?.data || [];
      
      if (!Array.isArray(dashboardData)) {
        throw new Error('Invalid data format received');
      }
      
      setData(dashboardData as DashboardData[]);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const captureCharts = async () => {
    const chartImages = {};
    
    for (const [key, ref] of Object.entries(chartRefs)) {
      if (ref.current) {
        const canvas = await html2canvas(ref.current);
        // chartImages[key] = canvas.toDataURL('image/png');
      }
    }
    
    return chartImages;
  };

  // const handleGenerateReport = async () => {
  //   try {
  //     const chartImages = await captureCharts();
      
  //     await generateReport({
  //       data: filteredData,
  //       charts: chartImages
  //     });
  //   } catch (error) {
  //     console.error('Failed to generate report:', error);
  //   }
  // };

  const handleFilterChange = useCallback((key: keyof FilterState, value: string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const filteredData = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      console.log("Invalid data array:", data);
      return [];
    }

    return data.filter(item => {
      if (!item) return false;

      const matchesFilter = (key: keyof FilterState, value: any) => {
        if (filters[key].length === 0) return true;
        return filters[key].includes(value);
      };

      return (
        matchesFilter('ethnic_group', item.ethnic_group) &&
        matchesFilter('home_country', item.home_country) &&
        matchesFilter('age', item.age) &&
        matchesFilter('gender', item.gender) &&
        matchesFilter('student_type_location', item.student_type_location) &&
        matchesFilter('student_type_time', item.student_type_time) &&
        matchesFilter('course_of_study', item.course_of_study) &&
        matchesFilter('hours_between_lectures', item.hours_between_lectures) &&
        matchesFilter('hours_per_week_lectures', item.hours_per_week_lectures) &&
        matchesFilter('hours_per_week_university_work', item.hours_per_week_university_work) &&
        matchesFilter('level_of_study', item.level_of_study) &&
        matchesFilter('timetable_preference', item.timetable_preference) &&
        matchesFilter('timetable_reasons', item.timetable_reasons) &&
        matchesFilter('timetable_impact', item.timetable_impact) &&
        matchesFilter('financial_support', item.financial_support) &&
        matchesFilter('financial_problems', item.financial_problems) &&
        matchesFilter('family_earning_class', item.family_earning_class) &&
        matchesFilter('form_of_employment', item.form_of_employment) &&
        matchesFilter('work_hours_per_week', item.work_hours_per_week) &&
        matchesFilter('cost_of_study', item.cost_of_study) &&
        matchesFilter('diet', item.diet) &&
        matchesFilter('well_hydrated', item.well_hydrated) &&
        matchesFilter('exercise_per_week', item.exercise_per_week) &&
        matchesFilter('alcohol_consumption', item.alcohol_consumption) &&
        matchesFilter('personality_type', item.personality_type) &&
        matchesFilter('physical_activities', item.physical_activities) &&
        matchesFilter('mental_health_activities', item.mental_health_activities) &&
        matchesFilter('hours_socialmedia', item.hours_socialmedia) &&
        matchesFilter('total_device_hours', item.total_device_hours) &&
        matchesFilter('hours_socialising', item.hours_socialising) &&
        matchesFilter('quality_of_life', item.quality_of_life) &&
        matchesFilter('feel_afraid', item.feel_afraid) &&
        matchesFilter('stress_in_general', item.stress_in_general) &&
        matchesFilter('stress_before_exams', item.stress_before_exams) &&
        matchesFilter('known_disabilities', item.known_disabilities) &&
        matchesFilter('sense_of_belonging', item.sense_of_belonging)
      );
    });
  }, [data, filters]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Mental Health Dashboard
        </Typography>
        <div className="flex gap-2">
        <button 
          // onClick={handleGenerateReport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Generate Report
        </button>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} lg={2}>
          <FilterPanel 
            filters={filters} 
            onFilterChange={handleFilterChange}
            data={data}
          />
        </Grid>
        
        <Grid item xs={12} md={9} lg={10}>
          <Grid container spacing={3}>
            {filteredData.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">No data matches the selected filters</Alert>
              </Grid>
            ) : (
                <>
                <Grid item xs={12} md={6}>
                  <Demographics data={filteredData} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <AcademicContext data={filteredData} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SocioceonomicFactors data={filteredData} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LifestyleAndBehaviour data={filteredData} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SocialAndTechnologicalFactors data={filteredData} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PsychologicalAndEmotionalFactors data={filteredData} />
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MentalHealthDashboard;