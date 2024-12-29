import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface PhysicalActivitiesChartProps {
  data: DashboardData[];
}

export const PhysicalActivitiesChart = ({ data }: PhysicalActivitiesChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="physical_activities" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="prediction_0" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
  );
};