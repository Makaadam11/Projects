import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface StressInGeneralChartProps {
  data: DashboardData[];
}

export const StressInGeneralChart = ({ data }: StressInGeneralChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    const group = acc.find(item => item.stress_in_general === curr.stress_in_general);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        stress_in_general: curr.stress_in_general,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { stress_in_general: string; prediction_0: number; prediction_1: number }[]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="stress_in_general" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="prediction_0" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
  );
};