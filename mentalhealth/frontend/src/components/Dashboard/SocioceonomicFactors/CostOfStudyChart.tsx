import { Treemap, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface CostOfStudyChartProps {
  data: DashboardData[];
}

export const CostOfStudyChart = ({ data }: CostOfStudyChartProps) => {
  const getCostRange = (cost: number): string => {
    if (cost <= 5000) return '£0 - £5,000';
    if (cost <= 10000) return '£5,001 - £10,000';
    if (cost <= 15000) return '£10,001 - £15,000';
    if (cost <= 20000) return '£15,001 - £20,000';
    if (cost <= 25000) return '£20,001 - £25,000';
    return '£25,000+';
  };

  const groupedData = data
    .filter(item => 
      item?.cost_of_study && 
      typeof item.cost_of_study === 'number' && 
      item.cost_of_study > 0 && 
      item.cost_of_study <= 50000
    )
    .reduce((acc, curr) => {
      const range = getCostRange(curr.cost_of_study);
      const group = acc.find(item => item.name === range);
      
      if (group) {
        group.value += 1;
        group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
      } else {
        acc.push({
          name: range,
          value: 1,
          prediction_0: curr.predictions === 0 ? 0 : 1,
          prediction_1: curr.predictions === 1 ? 1 : 0,
        });
      }
      return acc;
    }, [] as { name: string; value: number; prediction_0: number; prediction_1: number }[])
    .map(item => ({
      ...item,
      fill: item.prediction_1 > item.prediction_0 ? '#ff0000' : '#82ca9d'
    }))
    .sort((a, b) => {
      const aValue = parseInt(a.name.replace(/[^0-9]/g, ''));
      const bValue = parseInt(b.name.replace(/[^0-9]/g, ''));
      return aValue - bValue;
    });

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Cost of Study
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={groupedData}
          dataKey="value"
          nameKey="name"
          stroke="#fff"
          fill="#8884d8"
        >
        <Tooltip
          formatter={(value: number, name: string, props: any) => [
            `Total: ${value}\nNo MH Issue: ${props.payload.prediction_0}\nMH Issue: ${props.payload.prediction_1}`,
            `Range: ${name}`
          ]}
          contentStyle={{ whiteSpace: 'pre-line' }}
        />
        </Treemap>
      </ResponsiveContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#82ca9d', mr: 1 }} />
          <Typography variant="body2">No MH Issue Dominant</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#ff0000', mr: 1 }} />
          <Typography variant="body2">MH Issue Dominant</Typography>
        </Box>
      </Box>
    </Box>
  );
};