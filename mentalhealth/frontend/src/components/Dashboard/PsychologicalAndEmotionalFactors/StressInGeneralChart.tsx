import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface StressInGeneralChartProps {
  data: DashboardData[];
}

export const StressInGeneralChart = ({ data }: StressInGeneralChartProps) => {

  const groupedData = data.reduce((acc, curr) => {
    if (!curr || !curr.stress_in_general || curr.stress_in_general === "Not Provided") {
      return acc;
    }
    
    // Check if any part of the response indicates stress
    const hasStress = curr.stress_in_general.toLowerCase().includes('yes');
    
    const group = acc.find(item => item.stress_in_general === (hasStress ? "Yes" : "No"));
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        stress_in_general: hasStress ? "Yes" : "No",
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { stress_in_general: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Stress In General
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="stress_in_general" dy={10} height={50} interval={0}/>
        <YAxis />
        <Tooltip />
        <Bar dataKey="prediction_0"  name="No MH Issues" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" name="MH Issues" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
    </Box>
  );
};