import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import type { DashboardData } from '@/types/dashboard';

interface Props {
  data: DashboardData[];
}

export const CountryMap: React.FC<Props> = ({ data }) => {
  const [tooltipContent, setTooltipContent] = useState("");

  const countryData = React.useMemo(() => {
    const grouped = data.reduce((acc, curr) => {
      if (!acc[curr.home_country]) {
        acc[curr.home_country] = { mh: 0, noMh: 0, total: 0 };
      }
      if (curr.predictions === 1) {
        acc[curr.home_country].mh += 1;
      } else {
        acc[curr.home_country].noMh += 1;
      }
      acc[curr.home_country].total += 1;
      return acc;
    }, {} as Record<string, { mh: number; noMh: number; total: number }>);

    return Object.entries(grouped).map(([country, stats]) => ({
      country,
      mhPercentage: (stats.mh / stats.total) * 100,
      noMhPercentage: (stats.noMh / stats.total) * 100,
      total: stats.total,
      dominant: stats.mh > stats.noMh ? 'Mental Health Issues' : 'No Mental Health Issues'
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Countries
      </Typography>
      <Box sx={{ height: 383 }}>
        <ComposableMap style={{ width: "100%", height: 380 ,  border: '2px solid #ddd', borderRadius: '8px', overflow: 'hidden'}}>
          <ZoomableGroup zoom = {1.3}>
            <Geographies geography="/topo.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryStats = countryData.find(
                    d => d.country === geo.properties.name
                  );
                  const opacity = countryStats 
                    ? countryStats.dominant === 'Mental Health Issues'
                      ? countryStats.mhPercentage / 100
                      : countryStats.noMhPercentage / 100
                    : 0;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      data-tooltip-id="my-tooltip"
                      data-tooltip-content={
                        countryStats
                          ? `${geo.properties.name}\nMH: ${countryStats.mhPercentage.toFixed(1)}%\nNo MH: ${countryStats.noMhPercentage.toFixed(1)}%\nTotal: ${countryStats.total}`
                          : `${geo.properties.name}: No data`
                      }
                      style={{
                        default: {
                          fill: countryStats
                            ? countryStats.dominant === 'Mental Health Issues'
                              ? `rgba(255, 107, 107, ${opacity})`
                              : `rgba(130, 202, 157, ${opacity})`
                            : "#F5F4F6",
                          stroke: "#D6D6DA",
                          strokeWidth: 0.5,
                          outline: "none"
                        },
                        hover: {
                          fill: countryStats
                            ? countryStats.dominant === 'Mental Health Issues'
                              ? `rgba(255, 87, 87, ${opacity})`
                              : `rgba(110, 182, 137, ${opacity})`
                            : "#F5F4F6",
                          stroke: "#D6D6DA",
                          strokeWidth: 1,
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        <Tooltip id="my-tooltip" />
      </Box>
    </Paper>
  );
};