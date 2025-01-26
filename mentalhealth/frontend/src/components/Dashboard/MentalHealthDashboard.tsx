"use client"
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Box, Grid, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { FilterPanel } from './FilterPanel';
import type { FilterState, DashboardData } from '../../types/dashboard';
import { getDashboardData, generateReport } from '../../api/data';
import html2canvas from 'html2canvas';
import { Demographics } from './Demographics';
import { PsychologicalAndEmotionalFactors } from './PsychologicalAndEmotionalFactors';
import { AcademicContext } from './AcademicContext';
import { SocioceonomicFactors } from './SocioceonomicFactors';
import { LifestyleAndBehaviour } from './LifestyleAndBehaviour';
import { SocialAndTechnologicalFactors } from './SocialAndTechnologicalFactors';

const MentalHealthDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };
  
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
  
  const [error, setError] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false); // New state for loading
  const [selectedUniversity, setSelectedUniversity] = useState<string>('All');
  
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

  const demographicsRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const academicContextRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null) ];
  const socioeconomicFactorsRefs = [useRef(null), useRef(null), useRef(null), useRef(null) , useRef(null), useRef(null)];
  const lifestyleAndBehaviourRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const socialAndTechnologicalFactorsRefs = [useRef(null), useRef(null), useRef(null)];
  const psychologicalAndEmotionalFactorsRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const captureChartImages = async () => {
    const allChartRefs = [
      ...demographicsRefs,
      ...academicContextRefs,
      ...socioeconomicFactorsRefs,
      ...lifestyleAndBehaviourRefs,
      ...socialAndTechnologicalFactorsRefs,
      ...psychologicalAndEmotionalFactorsRefs,
    ];
  
    const chartImages: { [key: string]: string } = {};
    let canvas: HTMLCanvasElement;
    for (const ref of allChartRefs) {
      if (ref.current) {
        canvas = await html2canvas(ref.current, { allowTaint: true, useCORS: true, logging: true });
        chartImages[ref.current.id || `chart-${Object.keys(chartImages).length + 1}`] = canvas.toDataURL('image/png');
      }
    }
  
    return chartImages;
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true); // Set loading state to true
    try {
      // const chartImages = await captureChartImages();
      // console.log(`Number of charts being sent: ${Object.keys(chartImages).length}`);
      const chartImages = await captureChartImages();
      const response = await generateReport(filteredData, chartImages);
      alert('Report generated successfully');
      setReportUrl(response?.report_url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGeneratingReport(false); // Set loading state to false
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for all universities');
      const response = await getDashboardData('All');
      const dashboardData = response?.data || [];
      
      if (!Array.isArray(dashboardData)) {
        throw new Error('Invalid data format received');
      }
      
      setData(dashboardData as DashboardData[]);
      setError(null);
      console.log('Data fetched successfully:', dashboardData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: string) => {
    console.log('Year changing to:', year);
    setSelectedYear(year);
  };

  const handleUniversityChange = (university: string) => {
    setSelectedUniversity(university);
  };

  const handleFilterChange = useCallback((key: keyof FilterState, value: string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

// 1. Add getAcademicYear helper
const getAcademicYear = (dateString: string | undefined) => {
  if (!dateString) {
    console.error("Date string is undefined");
    return null;
  }

  // Handle date format dd.MM.yyyy HH:mm
  const [datePart] = dateString.split(" ");
  const [day, month, year] = datePart.split(".").map(Number);
  console.log('Date parts:', { day, month, year });

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.error("Invalid date parts:", { day, month, year });
    return null;
  }

  const academicYear = month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  console.log('Calculated academic year:', academicYear);
  return academicYear;
};

const filteredData = useMemo(() => {
  console.log('Filtering data:', {
    dataLength: data.length,
    selectedYear,
    selectedUniversity,
    filters
  });

  if (!Array.isArray(data) || data.length === 0) {
    console.log('No data to filter');
    return [];
  }

  return data.filter(item => {
    if (!item?.captured_at) return false;

    const academicYear = getAcademicYear(item.captured_at);
    console.log('Item year:', { date: item.captured_at, academicYear });

    const matchesYear = academicYear === selectedYear;
    const matchesUniversity = selectedUniversity === 'All' || item.source === selectedUniversity;

    console.log('Item:', {
      date: item.captured_at,
      academicYear,
      selectedYear,
      matchesYear,
      university: item.source,
      matchesUniversity
    });

    if (!matchesYear || !matchesUniversity) return false;

    const matchesFilter = (key: keyof FilterState, value: any) => {
      if (!filters[key] || filters[key].length === 0) return true;
      const matches = filters[key].includes(value);
      console.log(`Filter ${key}:`, { value, filterValues: filters[key], matches });
      return matches;
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

  console.log('Filtered results:', filtered.length);
  return filtered;
}, [data, selectedYear, selectedUniversity, filters]);


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
    <div>
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Mental Health Dashboard - {selectedYear}
        </Typography>
        
        <div className="flex gap-2">
        {reportUrl && (
        <button             className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-green-700"
>
          <a 
            href={`/report?timestamp=${reportUrl.split('/').pop()}`} 
          >
            View Report
          </a>
          

        </button >
      )}
          <button 
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={generatingReport} // Disable button when loading
          >
            {generatingReport ? <CircularProgress size={24} color="inherit" /> : 'Generate Report'}
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
        <div>
      <FilterPanel
        data={data}
        filters={filters}
        onFilterChange={handleFilterChange}
        onYearChange={handleYearChange}
        onUniversityChange={handleUniversityChange}
        selectedYear={selectedYear}
      />
      {loading && <p>Loading data...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <div>
          {/* Render your dashboard data here */}
          <p>Data loaded successfully.</p>
        </div>
      )}
    </div>
        </Grid>
        
        <Grid item xs={12} md={9} lg={10}>
          <Grid container spacing={3}>
            {filteredData.length === 0 ? (
              <Grid item xs={12}>
              <Alert severity="info">
                No data for year {selectedYear}
              </Alert>
            </Grid>
            ) : (
                <>
              <Grid item xs={12} md={6}>
          <Demographics 
            key={`demographics-${selectedYear}-${filteredData.length}`}
            data={filteredData} 
            chartRefs={demographicsRefs}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <AcademicContext 
            key={`demographics-${selectedYear}-${filteredData.length}`}
            data={filteredData} 
            chartRefs={academicContextRefs}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SocioceonomicFactors 
            key={`demographics-${selectedYear}-${filteredData.length}`}
            data={filteredData} 
            chartRefs={socioeconomicFactorsRefs}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LifestyleAndBehaviour 
            key={`demographics-${selectedYear}-${filteredData.length}`}
            data={filteredData} 
            chartRefs={lifestyleAndBehaviourRefs}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SocialAndTechnologicalFactors 
            key={`demographics-${selectedYear}-${filteredData.length}`}
            data={filteredData} 
            chartRefs={socialAndTechnologicalFactorsRefs}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PsychologicalAndEmotionalFactors 
            key={`demographics-${selectedYear}-${filteredData.length}`}
            data={filteredData} 
            chartRefs={psychologicalAndEmotionalFactorsRefs}
          />
        </Grid>
            </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
    </div>
  );
};

export default MentalHealthDashboard;