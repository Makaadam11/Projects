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

export const EmploymentChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    const groupedData = data.reduce((acc, curr) => {
      const key = curr.form_of_employment;
      if (!acc[key]) {
        acc[key] = {
          employment: key,
          workHours: 0,
          stressLevel: 0,
          feelAfraid: 0,
          count: 0
        };
      }
      acc[key].workHours += curr.work_hours_per_week;
      acc[key].stressLevel += curr.stress_in_general;
      acc[key].feelAfraid += curr.feel_afraid ? 1 : 0;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map(group => ({
      ...group,
      avgWorkHours: group.workHours / group.count,
      avgStressLevel: group.stressLevel / group.count,
      afraidRate: (group.feelAfraid / group.count) * 100
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Employment & Stress
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="employment" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="avgWorkHours" name="Work Hours" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="avgStressLevel" name="Stress Level" fill="#82ca9d" />
            <Bar yAxisId="right" dataKey="afraidRate" name="Anxiety Rate %" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};