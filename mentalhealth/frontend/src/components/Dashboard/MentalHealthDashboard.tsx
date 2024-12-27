import React, { useState, useCallback } from 'react';
import { Box, Grid, Typography } from '@mui/material';
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
import type { FilterState, MentalHealthData } from '../../types/dashboard';

interface Props {
  data: MentalHealthData[];
}

const MentalHealthDashboard: React.FC<Props> = ({ data }) => {
  const [filters, setFilters] = useState<FilterState>({
    studentType: [],
    gender: [],
    ageRange: [18, 65],
    courseCategory: [],
    employmentStatus: [],
    ethnicGroup: [],
  });

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const filteredData = React.useMemo(() => {
    return data.filter(item => {
      // Apply all filters here
      if (filters.studentType.length && !filters.studentType.includes(item.student_type_location)) return false;
      if (filters.gender.length && !filters.gender.includes(item.gender)) return false;
      // Add more filter conditions
      return true;
    });
  }, [data, filters]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mental Health Dashboard
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={2}>
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        </Grid>
        
        <Grid item xs={12} md={10}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={3}>
              <StudentTypeChart data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <PersonalityChart data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <DietExerciseChart data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <FinancialChart data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <CountryMap data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <EthnicGroupTable data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <EmploymentChart data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <GenderChart data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <QualityOfLifeChart data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <CourseTreemap data={filteredData} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <TimetableChart data={filteredData} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MentalHealthDashboard;