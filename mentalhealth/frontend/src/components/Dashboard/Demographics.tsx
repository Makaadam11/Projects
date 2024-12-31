import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { EthnicGroupChart } from './Demographics/EthnicGroupChart';
import { AgeChart } from './Demographics/AgeChart';
import { GenderChart } from './Demographics/GenderChart';
import { StudentTypeLocationChart } from './Demographics/StudentTypeChart';
import { StudentTypeTimeChart } from './Demographics/StudentTypeTimeChart';
import { DashboardData } from '@/types/dashboard';

interface DemographicsProps {
  data: DashboardData[];
}

export const Demographics = ({ data }: DemographicsProps) => {
  const ethnicGroupRef = useRef(null);
  const ageChartRef = useRef(null);
  const genderChartRef = useRef(null);
  const studentTypeLocationRef = useRef(null);
  const studentTypeTimeRef = useRef(null);

  const captureCharts = async () => {
    const charts = [
      { ref: ethnicGroupRef, name: 'EthnicGroupChart' },
      { ref: ageChartRef, name: 'AgeChart' },
      { ref: genderChartRef, name: 'GenderChart' },
      { ref: studentTypeLocationRef, name: 'StudentTypeLocationChart' },
      { ref: studentTypeTimeRef, name: 'StudentTypeTimeChart' },
    ];

    const capturedImages: { [key: string]: string } = {};

    for (const chart of charts) {
      if (chart.ref.current) {
        const canvas = await html2canvas(chart.ref.current);
        capturedImages[chart.name] = canvas.toDataURL('image/png');
      }
    }

    return capturedImages;
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#ffff' }}>
        Demographics
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={ethnicGroupRef}>
            <EthnicGroupChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={ageChartRef}>
            <AgeChart data={data} />
          </Paper>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={genderChartRef}>
            <GenderChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={studentTypeLocationRef}>
            <StudentTypeLocationChart data={data} />
          </Paper>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={studentTypeTimeRef}>
            <StudentTypeTimeChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};