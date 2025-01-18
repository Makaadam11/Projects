import  WordCloud  from 'react-d3-cloud';
import { DashboardData } from '@/types/dashboard';
import { ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

interface MentalHealthActivitiesChartProps {
  data: DashboardData[];
}

export const MentalHealthActivitiesChart = ({ data }: MentalHealthActivitiesChartProps) => {
  const words = data.reduce((acc, curr) => {
    if (curr.mental_health_activities === "Not Provided") return acc;
    const activities = curr.mental_health_activities.split(', ');
    activities.forEach(activity => {
      const word = acc.find(item => item.text === activity);
      if (word) {
        word.value += 1;
      } else {
        acc.push({ text: activity, value: 1 });
      }
    });
    return acc;
  }, [] as { text: string; value: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Mental Health Activities
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
    <WordCloud 
          data={words} 
          fontSize={(word) => Math.max(12, Math.min(60, word.value * 8))}
          padding={3}
          spiral="rectangular"
          rotate={0}
          font="Arial"
          fontWeight="bold"
          height={350}
        />
    </ResponsiveContainer>
    </Box>
  );
};