import WordCloud from 'react-d3-cloud';
import { DashboardData } from '@/types/dashboard';
import { ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

interface TimetableReasonsChartProps {
  data: DashboardData[];
}

export const TimetableReasonsChart = ({ data }: TimetableReasonsChartProps) => {
  const words = data
    .reduce((acc, curr) => {
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
    }, [] as { text: string; value: number }[])
    .sort((a, b) => b.value - a.value) // Sort by frequency
    .slice(0, 20); // Get top 10

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="h6" align="center" gutterBottom>
        Top 15 Timetable Reasons
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <WordCloud
          data={words}
          width={300}
          height={350}
          font="Arial"
          fontStyle="normal"
          fontWeight="bold"
          fontSize={(word) => Math.max(15, Math.min(40, word.value * 5))}
          rotate={0}
          padding={2}
        />
      </ResponsiveContainer>
    </Box>
  );
};