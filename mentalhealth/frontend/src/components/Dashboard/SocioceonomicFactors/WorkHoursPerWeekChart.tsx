import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface WorkHoursPerWeekChartProps {
  data: DashboardData[];
}

export const WorkHoursPerWeekChart = ({ data }: WorkHoursPerWeekChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    const group = acc.find(item => item.work_hours_per_week === curr.work_hours_per_week);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        work_hours_per_week: curr.work_hours_per_week,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { work_hours_per_week: number; prediction_0: number; prediction_1: number }[]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="work_hours_per_week" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="prediction_0" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
        <Area type="monotone" dataKey="prediction_1" stackId="1" stroke="#ff0000" fill="#ff0000" />
      </AreaChart>
    </ResponsiveContainer>
  );
};