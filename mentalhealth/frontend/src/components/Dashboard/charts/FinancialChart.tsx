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

export const FinancialChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    const groupedData = data.reduce((acc, curr) => {
      const key = curr.student_type_time;
      if (!acc[key]) {
        acc[key] = {
          studentType: key,
          avgCost: 0,
          financialProblems: 0,
          financialSupport: 0,
          count: 0
        };
      }
      acc[key].avgCost += curr.cost_of_study;
      acc[key].financialProblems += curr.financial_problems ? 1 : 0;
      acc[key].financialSupport += curr.financial_support ? 1 : 0;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map(group => ({
      ...group,
      avgCost: group.avgCost / group.count,
      financialProblemsRate: (group.financialProblems / group.count) * 100,
      financialSupportRate: (group.financialSupport / group.count) * 100
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Financial Overview
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="studentType" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="avgCost" name="Avg. Cost" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="financialProblemsRate" name="Financial Problems %" fill="#82ca9d" />
            <Bar yAxisId="right" dataKey="financialSupportRate" name="Financial Support %" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};