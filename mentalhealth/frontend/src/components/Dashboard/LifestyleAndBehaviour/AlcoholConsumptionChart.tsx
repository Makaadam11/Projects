import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface AlcoholConsumptionChartProps {
  data: DashboardData[];
}

export const AlcoholConsumptionChart = ({ data }: AlcoholConsumptionChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.alcohol_consumption === "Not Provided") return acc;
    const group = acc.find(item => item.alcohol_consumption === curr.alcohol_consumption);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        alcohol_consumption: curr.alcohol_consumption,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { alcohol_consumption: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Alcohol Consumption
      </Typography>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="alcohol_consumption" angle={75} dy={20} height={100} interval={0}/>
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="prediction_0" name="No MH Issues" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" name="MH Issues" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
    </Box>
  );
};