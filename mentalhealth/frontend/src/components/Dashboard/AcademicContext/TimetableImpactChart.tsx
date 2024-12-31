import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface TimetableImpactChartProps {
  data: DashboardData[];
}

export const TimetableImpactChart = ({ data }: TimetableImpactChartProps) => {
  const groupedData = data.reduce((acc, curr) => {

    if (curr.timetable_impact === "Not Provided") return acc;
    const group = acc.find(item => item.timetable_impact === curr.timetable_impact);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        timetable_impact: curr.timetable_impact,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { timetable_impact: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
    <Typography variant="h6" align="center" gutterBottom>
      Timetable Impact
      </Typography>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timetable_impact" />
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