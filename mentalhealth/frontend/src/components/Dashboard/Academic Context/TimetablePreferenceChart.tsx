import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface TimetablePreferenceChartProps {
  data: DashboardData[];
}

export const TimetablePreferenceChart = ({ data }: TimetablePreferenceChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    const group = acc.find(item => item.timetable_preference === curr.timetable_preference);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        timetable_preference: curr.timetable_preference,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { timetable_preference: string; prediction_0: number; prediction_1: number }[]);

  const COLORS = ['#82ca9d', '#ff0000'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={groupedData}
          dataKey="prediction_1"
          nameKey="timetable_preference"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#ff0000"
          label
        >
          {groupedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};