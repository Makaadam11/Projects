import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface SenseOfBelongingChartProps {
  data: DashboardData[];
}

export const SenseOfBelongingChart = ({ data }: SenseOfBelongingChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.sense_of_belonging === "Not Provided") return acc;
    const group = acc.find(item => item.sense_of_belonging === curr.sense_of_belonging);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        sense_of_belonging: curr.sense_of_belonging,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { sense_of_belonging: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Sense of Belonging
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="sense_of_belonging" angle={75} dy={35} dx={10} height={80} interval={0}/>
        <YAxis />
        <Tooltip />
        <Bar dataKey="prediction_0"  name="No MH Issues" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1"  name="MH Issues"stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
    </Box>
  );
};