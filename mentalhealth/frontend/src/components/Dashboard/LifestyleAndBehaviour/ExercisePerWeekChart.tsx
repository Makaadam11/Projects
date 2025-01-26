import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface ExercisePerWeekChartProps {
  data: DashboardData[];
}

export const ExercisePerWeekChart = ({ data }: ExercisePerWeekChartProps) => {
  data.sort((a, b) => a.exercise_per_week - b.exercise_per_week);
  const groupedData = data.reduce((acc, curr) => {
    if (curr.exercise_per_week === 0) return acc;
    const group = acc.find(item => item.exercise_per_week === curr.exercise_per_week);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        exercise_per_week: curr.exercise_per_week,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { exercise_per_week: number; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Exercise Per Week
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="exercise_per_week" dy={10} height={40} interval={0}/>
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="prediction_0" name="No MH Issues" stroke="#82ca9d" />
        <Line type="monotone" dataKey="prediction_1" name="MH Issues" stroke="#ff0000" />
      </LineChart>
    </ResponsiveContainer>
    </Box>
  );
};