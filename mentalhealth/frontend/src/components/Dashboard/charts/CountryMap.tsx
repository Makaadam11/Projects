import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';
import type { MentalHealthData } from '../../../types/dashboard';

interface Props {
  data: MentalHealthData[];
}

export const CountryMap: React.FC<Props> = ({ data }) => {
  const countryData = React.useMemo(() => {
    const grouped = data.reduce((acc, curr) => {
      if (!acc[curr.country]) {
        acc[curr.country] = {
          total: 0,
          mentalHealth: 0
        };
      }
      acc[curr.country].total += 1;
      if (curr.mental_health_status) {
        acc[curr.country].mentalHealth += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; mentalHealth: number }>);

    return Object.entries(grouped).map(([country, stats]) => ({
      country,
      percentage: (stats.mentalHealth / stats.total) * 100,
      total: stats.total
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Mental Health by Country
      </Typography>
      <Box sx={{ height: 300 }}>
        <ComposableMap projection="geoMercator">
          <Geographies geography="/world-110m.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryStats = countryData.find(
                  d => d.country === geo.properties.NAME
                );
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={countryStats ? `rgba(82, 196, 26, ${countryStats.percentage / 100})` : "#F5F4F6"}
                    stroke="#D6D6DA"
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </Box>
    </Paper>
  );
};