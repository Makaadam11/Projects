import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface KnownDisabilitiesChartProps {
  data: DashboardData[];
}

export const KnownDisabilitiesChart = ({ data }: KnownDisabilitiesChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    const group = acc.find(item => item.known_disabilities === curr.known_disabilities);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        known_disabilities: curr.known_disabilities,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { known_disabilities: string; prediction_0: number; prediction_1: number }[]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="known_disabilities" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="prediction_0" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
  );
};