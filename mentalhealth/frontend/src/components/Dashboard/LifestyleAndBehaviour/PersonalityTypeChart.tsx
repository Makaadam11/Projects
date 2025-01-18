import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface PersonalityTypeChartProps {
  data: DashboardData[];
}

export const PersonalityTypeChart = ({ data }: PersonalityTypeChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.personality_type === 'Not Provided') return acc;
    const group = acc.find(item => item.personality_type === curr.personality_type);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        personality_type: curr.personality_type,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { personality_type: string; prediction_0: number; prediction_1: number }[]);

  const COLORS = ['#82ca9d', '#ff0000'];

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Personality Type
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={groupedData}
          dataKey="prediction_1"
          nameKey="personality_type"
          cx="52%"
          cy="50%"
          outerRadius={80}
          fill="#82ca9d"
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
    </Box>
  );
};