import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface HoursSocialisingChartProps {
  data: DashboardData[];
}

export const HoursSocialisingChart = ({ data }: HoursSocialisingChartProps) => {
  data.sort((a, b) => a.hours_socialising - b.hours_socialising);
  const groupedData = data.reduce((acc, curr) => {
    if (curr.hours_socialising === 0) return acc;
    const group = acc.find(item => item.hours_socialising === curr.hours_socialising);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        hours_socialising: curr.hours_socialising,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { hours_socialising: number; prediction_0: number; prediction_1: number }[]);

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Hours Socialising
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hours_socialising"  dy={10} height={50} interval={1}/>
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="prediction_0" name="No MH Issues" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
        <Area type="monotone" dataKey="prediction_1" name="MH Issues" stackId="1" stroke="#ff0000" fill="#ff0000" />
      </AreaChart>
    </ResponsiveContainer>
    </Box>
  );
};