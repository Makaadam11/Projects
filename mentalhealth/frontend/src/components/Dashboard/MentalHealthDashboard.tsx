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
    studentType: [],
    gender: [],
    ageRange: [18, 65],
    courseCategory: [],
    employmentStatus: [],
    ethnicGroup: [],
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

      const matchesStudentType = filters.studentType.length === 0 || 
        filters.studentType.includes(item.student_type_location);
      const matchesGender = filters.gender.length === 0 || 
        filters.gender.includes(item.gender);
      const matchesAge = typeof item.age === 'number' && 
        item.age >= filters.ageRange[0] && 
        item.age <= filters.ageRange[1];
      const matchesCourse = filters.courseCategory.length === 0 || 
        filters.courseCategory.includes(item.course_of_study);
      const matchesEmployment = filters.employmentStatus.length === 0 || 
        filters.employmentStatus.includes(item.form_of_employment);
      const matchesEthnic = filters.ethnicGroup.length === 0 || 
        filters.ethnicGroup.includes(item.ethnic_group);

      return matchesStudentType && matchesGender && matchesAge && 
        matchesCourse && matchesEmployment && matchesEthnic;
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