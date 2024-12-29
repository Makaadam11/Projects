import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface ExercisePerWeekChartProps {
  data: DashboardData[];
}

export const ExercisePerWeekChart = ({ data }: ExercisePerWeekChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
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
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="exercise_per_week" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="prediction_0" stroke="#82ca9d" />
        <Line type="monotone" dataKey="prediction_1" stroke="#ff0000" />
      </LineChart>
    </ResponsiveContainer>
  );
};