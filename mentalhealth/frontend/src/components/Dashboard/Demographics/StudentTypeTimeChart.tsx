import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface StudentTypeTimeChartProps {
  data: DashboardData[];
}

export const StudentTypeTimeChart = ({ data }: StudentTypeTimeChartProps) => {
    const groupedData = data.reduce((acc, curr) => {
      const category = curr.student_type_time === 'Full Time' ? 'Full Time' :
                       curr.student_type_time === 'Part Time' ? 'Part Time' : "Don't Know";
      const group = acc.find(item => item.student_type_time === category);
      if (group) {
        group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
      } else {
        acc.push({
          student_type_time: category,
          prediction_0: curr.predictions === 0 ? 1 : 0,
          prediction_1: curr.predictions === 1 ? 1 : 0,
        });
      }
      return acc;
    }, [] as { student_type_time: string; prediction_0: number; prediction_1: number }[]);
  
  const COLORS = ['#82ca9d', '#ff0000'];

  const pieData = groupedData.flatMap(item => [
    { name: `${item.student_type_time} - No MH Issues`, value: item.prediction_0, fill: '#00ff00' },
    { name: `${item.student_type_time} - MH Issues`, value: item.prediction_1, fill: '#ff0000' },
  ]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Studnet Type Time Chart
      </Typography>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={groupedData}
          dataKey="prediction_1"
          nameKey="student_type_time"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ name, value }) => `${name}: ${value}`}
        >
          {groupedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.prediction_1 > 0 ? '#ff0000' : '#00ff00'} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name, props) => {
          const group = groupedData.find(item => item.student_type_time === props.payload.student_type_time);
          return [
            `No MH Issues: ${group?.prediction_0}, MH Issues: ${group?.prediction_1}`,
            name
          ];
        }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
    </Box>
  );
};