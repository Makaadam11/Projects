import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface EthnicGroupChartProps {
  data: DashboardData[];
}

export const EthnicGroupChart = ({ data }: EthnicGroupChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.ethnic_group === "Not Provided") return acc;
    const group = acc.find(item => item.ethnic_group === curr.ethnic_group);
    if (group && curr.predictions !== undefined) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        ethnic_group: curr.ethnic_group,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { ethnic_group: string; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Ethnic Group
      </Typography>
    <ResponsiveContainer width="100%" height={350} >
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ethnic_group" angle={75} dy={20} height={50} interval={0} />
        <YAxis width={40}/>
        <Tooltip />
        <Bar dataKey="prediction_0" name='No MH Issues' stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" name='MH Issues' stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
    </Box>
  );
};