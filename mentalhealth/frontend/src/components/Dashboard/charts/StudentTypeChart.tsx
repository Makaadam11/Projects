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

export const StudentTypeChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    const groupedData = data.reduce((acc, curr) => {
      const key = curr.student_type_location;
      if (!acc[key]) {
        acc[key] = {
          studentType: key,
          lectureHours: 0,
          workHours: 0,
          count: 0,
          mentalHealthCount: 0
        };
      }
      acc[key].lectureHours += curr.hours_per_week_lectures;
      acc[key].workHours += curr.hours_per_week_university_work;
      acc[key].count += 1;
      if (curr.mental_health_status) acc[key].mentalHealthCount += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map(group => ({
      ...group,
      lectureHours: group.lectureHours / group.count,
      workHours: group.workHours / group.count,
      mentalHealthPercentage: (group.mentalHealthCount / group.count) * 100
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Student Type: Lecture vs University Work
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="studentType" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)} hours`,
                name
              ]}
            />
            <Legend />
            <Bar
              dataKey="lectureHours"
              name="Lecture Hours"
              fill="#4CAF50"
              opacity={0.8}
            />
            <Bar
              dataKey="workHours"
              name="University Work"
              fill="#2196F3"
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};