import WordCloud from 'react-d3-cloud';
import { DashboardData } from '@/types/dashboard';
import { ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

interface TimetableReasonsChartProps {
  data: DashboardData[];
}

export const TimetableReasonsChart = ({ data }: TimetableReasonsChartProps) => {
  const words = data.reduce((acc, curr) => {
    if (curr.timetable_reasons === "Not Provided") return acc;
    const reasons = curr.timetable_reasons.split(', ');
    reasons.forEach(reason => {
      const word = acc.find(item => item.text === reason);
      if (word) {
        word.value += 1;
      } else {
        acc.push({ text: reason, value: 1 });
      }
    });
    return acc;
  }, [] as { text: string; value: number }[]);

  return (
    <Box>
    <Typography variant="h6" align="center" gutterBottom>
      Timetable Reasons
      </Typography>
    <ResponsiveContainer width="100%" height={300}>
      <WordCloud data={words} />
    </ResponsiveContainer>
    </Box>
  );
};