import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface DietChartProps {
  data: DashboardData[];
}

export const DietChart = ({ data }: DietChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.diet === "Not Provided") return acc;
    const group = acc.find(item => item.diet === curr.diet);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        diet: curr.diet,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { diet: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Diet
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart layout="vertical" data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" angle={75} dy={20} height={50} interval={0}/>
        <YAxis type="category" dataKey="diet" width={80}/>
        <Tooltip />
        <Bar dataKey="prediction_0" name="No MH Issues" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" name="MH Issues" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
    </Box>
  );
};