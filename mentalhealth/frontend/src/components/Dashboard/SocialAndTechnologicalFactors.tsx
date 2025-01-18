import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { HoursSocialMediaChart } from './SocialAndTechnologicalFactors/HoursSocialMediaChart';
import { TotalDeviceHoursChart } from './SocialAndTechnologicalFactors/TotalDeviceHoursChart';
import { HoursSocialisingChart } from './SocialAndTechnologicalFactors/HoursSocialisingChart';

interface SocialAndTechnologicalFactorsProps {
  data: any; // Replace 'any' with the appropriate type for your data
  chartRefs: React.RefObject<HTMLDivElement>[];
}

export const SocialAndTechnologicalFactors = ({ data, chartRefs }: SocialAndTechnologicalFactorsProps) => {
  const hoursSocialMediaRef = useRef(null);
  const totalDeviceHoursRef = useRef(null);
  const hoursSocialisingRef = useRef(null);

  const captureCharts = async () => {
    const charts = [
      { ref: hoursSocialMediaRef, name: 'HoursSocialMediaChart' },
      { ref: totalDeviceHoursRef, name: 'TotalDeviceHoursChart' },
      { ref: hoursSocialisingRef, name: 'HoursSocialisingChart' },
    ];
    const capturedImages : { [key: string]: string } = {};
    

    for (const chart of charts) {
      if (chart.ref.current) {
        const canvas = await html2canvas(chart.ref.current);
        capturedImages[chart.name] = canvas.toDataURL('image/png');
      }
    }

    return capturedImages;
  };

  return (
    <div>
    <Box sx={{ p: 2, border: '8px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#ffff' }}>
        Social and Technological Factors
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[0]}>
            <HoursSocialMediaChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[1]}>
            <TotalDeviceHoursChart data={data} />
          </Paper>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[2]}>
            <HoursSocialisingChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </div>
  );
};