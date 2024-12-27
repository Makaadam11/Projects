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

export const PersonalityChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    const groupedData = data.reduce((acc, curr) => {
      const key = curr.personality_type;
      if (!acc[key]) {
        acc[key] = {
          personalityType: key,
          socialMediaHours: 0,
          deviceHours: 0,
          socializingHours: 0,
          count: 0
        };
      }
      acc[key].socialMediaHours += curr.total_social_media_hours;
      acc[key].deviceHours += curr.total_device_hours;
      acc[key].socializingHours += curr.hours_socialising;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map(group => ({
      ...group,
      socialMediaHours: group.socialMediaHours / group.count,
      deviceHours: group.deviceHours / group.count,
      socializingHours: group.socializingHours / group.count
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Personality & Social Behavior
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="personalityType" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="socialMediaHours" name="Social Media" fill="#8884d8" />
            <Bar dataKey="deviceHours" name="Device Usage" fill="#82ca9d" />
            <Bar dataKey="socializingHours" name="Socializing" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};