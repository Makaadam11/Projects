import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface StudentTypeTimeChartProps {
  data: DashboardData[];
}

export const StudentTypeTimeChart = ({ data }: StudentTypeTimeChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    const category = curr.student_type_time === 'Full Time' ? 'Full Time' :
                     curr.student_type_time === 'Part Time' ? 'Part Time' : "Don't Know";
    const group = acc.find(item => item.student_type_time === category);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        student_type_time: category,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { student_type_time: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Student Type Time Chart
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="student_type_time" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="prediction_0" name='No MH Issues' stackId="a" fill="#82ca9d" />
          <Bar dataKey="prediction_1" name='MH Issues' stackId="a" fill="#ff0000" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default StudentTypeTimeChart;