import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { MentalHealthData } from '../../../types/dashboard';

interface Props {
  data: MentalHealthData[];
}

export const DietExerciseChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    const groupedData = data.reduce((acc, curr) => {
      const key = `${curr.diet}-${curr.alcohol_consumption}`;
      if (!acc[key]) {
        acc[key] = {
          category: `${curr.diet} (${curr.alcohol_consumption})`,
          exerciseHours: 0,
          wellHydrated: 0,
          count: 0,
          mentalHealthCount: 0
        };
      }
      acc[key].exerciseHours += curr.exercise_per_week;
      acc[key].wellHydrated += curr.well_hydrated ? 1 : 0;
      acc[key].count += 1;
      if (curr.mental_health_status) acc[key].mentalHealthCount += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map(group => ({
      ...group,
      exerciseHours: group.exerciseHours / group.count,
      hydrationRate: (group.wellHydrated / group.count) * 100,
      mentalHealthRate: (group.mentalHealthCount / group.count) * 100
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Diet, Exercise & Wellness
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="category" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="exerciseHours" name="Exercise (hrs/week)" fill="#82ca9d" />
            <Bar dataKey="hydrationRate" name="Hydration %" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};