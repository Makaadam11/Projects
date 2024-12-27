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

export const TimetableChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    const groupedData = data.reduce((acc, curr) => {
      const key = curr.timetable_preference;
      if (!acc[key]) {
        acc[key] = {
          preference: key,
          hoursBetweenLectures: 0,
          tsImpactCount: 0,
          count: 0,
          mentalHealthCount: 0
        };
      }
      acc[key].hoursBetweenLectures += curr.hours_between_lectures;
      acc[key].tsImpactCount += curr.ts_impact === 'High' ? 1 : 0;
      acc[key].count += 1;
      if (curr.mental_health_status) acc[key].mentalHealthCount += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map(group => ({
      preference: group.preference,
      avgHoursBetween: group.hoursBetweenLectures / group.count,
      tsImpactRate: (group.tsImpactCount / group.count) * 100,
      mentalHealthRate: (group.mentalHealthCount / group.count) * 100
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Timetable Analysis
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="preference" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="avgHoursBetween"
              name="Avg Hours Between Lectures"
              fill="#8884d8"
            />
            <Bar
              yAxisId="right"
              dataKey="tsImpactRate"
              name="TS Impact Rate %"
              fill="#82ca9d"
            />
            <Bar
              yAxisId="right"
              dataKey="mentalHealthRate"
              name="Mental Health Issues %"
              fill="#ffc658"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};