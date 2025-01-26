import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface PhysicalActivitiesChartProps {
  data: DashboardData[];
}

export const PhysicalActivitiesChart = ({ data }: PhysicalActivitiesChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.physical_activities === "Not Provided") return acc;
    const group = acc.find(item => item.physical_activities === curr.physical_activities);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        physical_activities: curr.physical_activities,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { physical_activities: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Physical Activities
      </Typography>
    <ResponsiveContainer width="100%" height={385}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="physical_activities" angle={75} dy={32} dx={10} height={80} interval={0}/>
        <YAxis />
        <Tooltip />
        <Bar dataKey="prediction_0"  name="No MH Issues" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1"  name="MH Issues"stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
    </Box>
  );
};