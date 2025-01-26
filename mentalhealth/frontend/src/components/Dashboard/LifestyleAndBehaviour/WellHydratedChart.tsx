import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface WellHydratedChartProps {
  data: DashboardData[];
}

export const WellHydratedChart = ({ data }: WellHydratedChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.well_hydrated === "Not Provided") return acc
    const group = acc.find(item => item.well_hydrated === curr.well_hydrated);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        well_hydrated: curr.well_hydrated,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { well_hydrated: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Hydration Level
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="well_hydrated" angle={75} dy={30} dx={10} height={80} interval={0}/>
        <YAxis />
        <Tooltip />
        <Bar dataKey="prediction_0" name="No MH Issues" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" name="MH Issues" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
    </Box>
  );
};