import { Treemap, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface CostOfStudyChartProps {
  data: DashboardData[];
}

export const CostOfStudyChart = ({ data }: CostOfStudyChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    const group = acc.find(item => item.cost_of_study === curr.cost_of_study);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        cost_of_study: curr.cost_of_study,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { cost_of_study: number; prediction_0: number; prediction_1: number }[]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <Treemap data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="cost_of_study" />
        <YAxis />
        <Tooltip />
      </Treemap>
    </ResponsiveContainer>
  );
};