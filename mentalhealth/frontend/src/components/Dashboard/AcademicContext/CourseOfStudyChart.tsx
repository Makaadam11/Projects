import { Treemap, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface CourseOfStudyChartProps {
  data: DashboardData[];
}

export const CourseOfStudyChart = ({ data }: CourseOfStudyChartProps) => {
  const groupedData = data
    .filter(item => item && item.course_of_study && item.course_of_study !== "Not Provided")
    .reduce((acc, curr) => {
      const group = acc.find(item => item.name === curr.course_of_study);
      if (group) {
        group.value += 1;
        group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
      } else {
        acc.push({
          name: curr.course_of_study,
          value: 1,
          prediction_0: curr.predictions === 0 ? 1 : 0,
          prediction_1: curr.predictions === 1 ? 1 : 0,
        });
      }
      return acc;
    }, [] as { name: string; value: number; prediction_0: number; prediction_1: number }[])
    .map(item => ({
      ...item,
      fill: item.prediction_1 > item.prediction_0 ? '#ff0000' : '#82ca9d'
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Course of Study
      </Typography>
      <ResponsiveContainer width="100%" height={315}>
        <Treemap
          data={groupedData}
          dataKey="value"
          nameKey="name"
          stroke="#fff"
        >
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `Total: ${value}\nNo MH Issue: ${props.payload.prediction_0}\nMH Issue: ${props.payload.prediction_1}`,
              `Course: ${name}`
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