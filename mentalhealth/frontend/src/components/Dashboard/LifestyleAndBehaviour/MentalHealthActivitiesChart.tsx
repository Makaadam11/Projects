import  WordCloud  from 'react-d3-cloud';
import { DashboardData } from '@/types/dashboard';
import { ResponsiveContainer } from 'recharts';

interface MentalHealthActivitiesChartProps {
  data: DashboardData[];
}

export const MentalHealthActivitiesChart = ({ data }: MentalHealthActivitiesChartProps) => {
  const words = data.reduce((acc, curr) => {
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
    <ResponsiveContainer width="100%" height={300}>
      <WordCloud data={words} />
    </ResponsiveContainer>
  );
};