import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';
import { Box, Typography } from '@mui/material';

interface KnownDisabilitiesChartProps {
  data: DashboardData[];
}

export const KnownDisabilitiesChart = ({ data }: KnownDisabilitiesChartProps) => {
  const groupedData = data.reduce((acc, curr) => {
    if (curr.known_disabilities === "Not Provided") return
    const group = acc.find(item => item.known_disabilities === curr.known_disabilities);
    if (group) {
      group[curr.predictions === 1 ? 'prediction_1' : 'prediction_0'] += 1;
    } else {
      acc.push({
        known_disabilities: curr.known_disabilities,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { known_disabilities: string; prediction_0: number; prediction_1: number }[]);
  const truncateLabel = (label: string, maxLength: number) => {
    return label.length > maxLength ? `${label.substring(0, maxLength)}..` : label;
  };
 
	
 
  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Known Disabilities
      </Typography>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="known_disabilities" angle={75} dy={30} dx={10} height={80} interval={0}	tickFormatter={(label) => truncateLabel(label, 10)}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="prediction_0" name="No MH Issues" stackId="a" fill="#82ca9d" />
        <Bar dataKey="prediction_1" name="MH Issues" stackId="a" fill="#ff0000" />
      </BarChart>
    </ResponsiveContainer>
    </Box>
  );
};