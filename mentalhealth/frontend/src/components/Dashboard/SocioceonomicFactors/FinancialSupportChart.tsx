import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface FinancialSupportChartProps {
  data: DashboardData[];
}

export const FinancialSupportChart = ({ data }: FinancialSupportChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="financial_support" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="prediction_0" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
  );
};