import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface HoursSocialisingChartProps {
  data: DashboardData[];
}

export const HoursSocialisingChart = ({ data }: HoursSocialisingChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    const group = acc.find(item => item.hours_socialising === curr.hours_socialising);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        hours_socialising: curr.hours_socialising,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { hours_socialising: number; prediction_0: number; prediction_1: number }[]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hours_socialising" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="prediction_0" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
        <Area type="monotone" dataKey="prediction_1" stackId="1" stroke="#ff0000" fill="#ff0000" />
      </AreaChart>
    </ResponsiveContainer>
  );
};