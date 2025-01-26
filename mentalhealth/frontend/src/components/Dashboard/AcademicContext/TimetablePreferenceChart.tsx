import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface TimetablePreferenceChartProps {
  data: DashboardData[];
}

export const TimetablePreferenceChart = ({ data }: TimetablePreferenceChartProps) => {
  const groupedData = data
    .filter(item => item && item.timetable_preference && item.timetable_preference !== 'Not Provided')
    .reduce((acc, curr) => {
      const group = acc.find(item => item.timetable_preference === curr.timetable_preference);
      if (group) {
        group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
      } else {
        acc.push({
          timetable_preference: curr.timetable_preference,
          prediction_0: curr.predictions === 0 ? 1 : 0,
          prediction_1: curr.predictions === 1 ? 1 : 0,
        });
      }
      return acc;
    }, [] as { timetable_preference: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Timetable Preference
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timetable_preference" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="prediction_0" name="No MH Issues" stackId="a" fill="#82ca9d" />
          <Bar dataKey="prediction_1" name="MH Issues" stackId="a" fill="#ff0000" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TimetablePreferenceChart;