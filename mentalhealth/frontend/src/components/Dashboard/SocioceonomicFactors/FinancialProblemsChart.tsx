import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface FinancialProblemsChartProps {
  data: DashboardData[];
}

export const FinancialProblemsChart = ({ data }: FinancialProblemsChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.financial_problems === 'Not Provided') return acc;
    const group = acc.find(item => item.financial_problems === curr.financial_problems);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        financial_problems: curr.financial_problems,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { financial_problems: string; prediction_0: number; prediction_1: number }[]);

  const COLORS = ['#82ca9d', '#ff0000'];
  const truncateLabel = (label: string, maxLength: number) => {
    return label.length > maxLength ? `${label.substring(0, maxLength)}..` : label;
  };

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Financial Problems
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={groupedData}
          dataKey="prediction_1"
          nameKey="financial_problems"
          cx="50%"
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