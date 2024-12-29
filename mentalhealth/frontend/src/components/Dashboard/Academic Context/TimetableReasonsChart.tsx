import WordCloud from 'react-d3-cloud';
import { DashboardData } from '@/types/dashboard';
import { ResponsiveContainer } from 'recharts';

interface TimetableReasonsChartProps {
  data: DashboardData[];
}

export const TimetableReasonsChart = ({ data }: TimetableReasonsChartProps) => {
  const words = data.reduce((acc, curr) => {
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
    <ResponsiveContainer width="100%" height={300}>
      <WordCloud data={words} />
    </ResponsiveContainer>
  );
};