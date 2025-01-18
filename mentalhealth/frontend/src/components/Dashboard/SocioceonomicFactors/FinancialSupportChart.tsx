import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface FinancialSupportChartProps {
  data: DashboardData[];
}

export const FinancialSupportChart = ({ data }: FinancialSupportChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.financial_support === "Not Provided") return acc;
    const group = acc.find(item => item.financial_support === curr.financial_support);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        financial_support: curr.financial_support,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { financial_support: string; prediction_0: number; prediction_1: number }[]);
 
  const truncateLabel = (label: string, maxLength: number) => {
    return label.length > maxLength ? `${label.substring(0, maxLength)}..` : label;
  };
  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Financial Support
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="financial_support" angle={75} dy={35} height={80} dx={10} interval={0} 	tickFormatter={(label) => truncateLabel(label, 9)}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="prediction_0" name="No MH Issues" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" name="MH Issues" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
    </Box>
  );
};