import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { MentalHealthData } from '../../../types/dashboard';

interface Props {
  data: MentalHealthData[];
}

export const GenderChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    const groupedData = data.reduce((acc, curr) => {
      const ageGroup = Math.floor(curr.age / 5) * 5; // Group ages in 5-year intervals
      const key = `${curr.gender}-${ageGroup}`;
      if (!acc[key]) {
        acc[key] = {
          gender: curr.gender,
          ageGroup: `${ageGroup}-${ageGroup + 4}`,
          count: 0,
          familyEarningClass: {
            low: 0,
            medium: 0,
            high: 0
          },
          mentalHealthCount: 0
        };
      }
      acc[key].count += 1;
      acc[key].familyEarningClass[curr.family_earning_class.toLowerCase()] += 1;
      if (curr.mental_health_status) acc[key].mentalHealthCount += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map(group => ({
      ...group,
      mentalHealthRate: (group.mentalHealthCount / group.count) * 100,
      lowIncome: (group.familyEarningClass.low / group.count) * 100,
      mediumIncome: (group.familyEarningClass.medium / group.count) * 100,
      highIncome: (group.familyEarningClass.high / group.count) * 100
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Gender & Age Analysis
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ageGroup" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="lowIncome" name="Low Income %" stackId="income" fill="#ff9999" />
            <Bar dataKey="mediumIncome" name="Medium Income %" stackId="income" fill="#99ff99" />
            <Bar dataKey="highIncome" name="High Income %" stackId="income" fill="#9999ff" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};