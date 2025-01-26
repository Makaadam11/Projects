import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface StressBeforeExamsChartProps {
  data: DashboardData[];
}

export const StressBeforeExamsChart = ({ data }: StressBeforeExamsChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (!curr || !curr.stress_before_exams || curr.stress_before_exams === "Not Provided") {
      return acc;
    }
    
    // Check if any part of the response indicates stress
    const hasStress = curr.stress_before_exams.toLowerCase().includes('yes');
    
    const group = acc.find(item => item.stress_before_exams === (hasStress ? "Yes" : "No"));
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        stress_before_exams: hasStress ? "Yes" : "No",
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { stress_before_exams: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Stress Before Exams
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="stress_before_exams" dy={10} height={50} interval={0}/>
        <YAxis />
        <Tooltip />
        <Bar dataKey="prediction_0"  name="No MH Issues" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" name="MH Issues" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
    </Box>
  );
};