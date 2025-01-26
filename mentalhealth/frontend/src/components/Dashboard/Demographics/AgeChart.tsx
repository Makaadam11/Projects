import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface AgeChartProps {
  data: DashboardData[];
}

export const AgeChart = ({ data }: AgeChartProps) => {
  const ageGroups = [
    { name: '18-24', min: 18, max: 24 },
    { name: '25-34', min: 25, max: 34 },
    { name: '35-44', min: 35, max: 44 },
    { name: '45+', min: 45, max: 100 },
  ];

  const groupedData = ageGroups.map(group => ({
    age_group: group.name,
    prediction_0: data.filter(item => item.age >= group.min && item.age <= group.max && item.predictions === 0).length,
    prediction_1: data.filter(item => item.age >= group.min && item.age <= group.max && item.predictions === 1).length,
  }));

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Age Group
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age_group" angle={75} dy={20} dx={5} height={50} interval={0} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="prediction_0"  stackId="a" fill="#82ca9d" name="No MH Issues" />
          <Bar dataKey="prediction_1" stackId="a" fill="#ff0000" name="MH Issues" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};