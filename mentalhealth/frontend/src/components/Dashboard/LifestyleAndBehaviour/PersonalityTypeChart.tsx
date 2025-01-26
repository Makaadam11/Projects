import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface PersonalityTypeChartProps {
  data: DashboardData[];
}

export const PersonalityTypeChart = ({ data }: PersonalityTypeChartProps) => {
  const groupedData = data
    .filter(item => item && item.personality_type && item.personality_type !== 'Not Provided')
    .reduce((acc, curr) => {
      const group = acc.find(item => item.personality_type === curr.personality_type);
      if (group) {
        group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
      } else {
        acc.push({
          personality_type: curr.personality_type,
          prediction_0: curr.predictions === 0 ? 1 : 0,
          prediction_1: curr.predictions === 1 ? 1 : 0,
        });
      }
      return acc;
    }, [] as { personality_type: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Personality Type
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="personality_type" angle={75} dy={40} dx={10} height={80}/>
          <YAxis />
          <Tooltip />
          <Bar dataKey="prediction_0" name="No MH Issues" stackId="a" fill="#82ca9d" />
          <Bar dataKey="prediction_1" name="MH Issues" stackId="a" fill="#ff0000" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PersonalityTypeChart;