import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { MentalHealthData } from '../../../types/dashboard';

interface Props {
  data: MentalHealthData[];
}

export const QualityOfLifeChart: React.FC<Props> = ({ data }) => {
  const chartData = React.useMemo(() => {
    const groupedData = data.reduce((acc, curr) => {
      const key = curr.quality_of_life;
      if (!acc[key]) {
        acc[key] = {
          category: key,
          socialMediaUse: 0,
          hasDisability: 0,
          mentalHealth: 0,
          count: 0
        };
      }
      acc[key].socialMediaUse += curr.social_media_use === 'High' ? 1 : 0;
      acc[key].hasDisability += curr.known_disabilities ? 1 : 0;
      acc[key].mentalHealth += curr.mental_health_status ? 1 : 0;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map(group => ({
      category: group.category,
      socialMediaRate: (group.socialMediaUse / group.count) * 100,
      disabilityRate: (group.hasDisability / group.count) * 100,
      mentalHealthRate: (group.mentalHealth / group.count) * 100
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Quality of Life Indicators
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Social Media Usage"
              dataKey="socialMediaRate"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Radar
              name="Disability Rate"
              dataKey="disabilityRate"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
            <Radar
              name="Mental Health Issues"
              dataKey="mentalHealthRate"
              stroke="#ffc658"
              fill="#ffc658"
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};