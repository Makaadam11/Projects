import { Treemap, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface CourseOfStudyChartProps {
  data: DashboardData[];
}

export const CourseOfStudyChart = ({ data }: CourseOfStudyChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.cost_of_study === null) return acc;
    const group = acc.find(item => item.course_of_study === curr.course_of_study);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        course_of_study: curr.course_of_study,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
        key: `${curr.course_of_study}-${curr.predictions}`
      });
    }
    return acc;
  }, [] as { course_of_study: string; prediction_0: number; prediction_1: number; key: string }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Course of Study Distribution
      </Typography>
    {/* <ResponsiveContainer width="100%" height={300}>
      <Treemap
        data={groupedData}
        dataKey="prediction_1"
        nameKey="course_of_study"
        stroke="#fff"
      >
        {groupedData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={entry.prediction_1 > 0 ? '#ff0000' : '#00ff00'}
          />
        ))}
        <Tooltip />
      </Treemap>
    </ResponsiveContainer> */}
    </Box>
  );
};