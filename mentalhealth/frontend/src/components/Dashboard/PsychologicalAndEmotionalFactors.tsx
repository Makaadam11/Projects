import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { QualityOfLifeChart } from './PsychologicalAndEmotionalFactors/QualityOfLifeChart';
import { FeelAfraidChart } from './PsychologicalAndEmotionalFactors/FeelAfraidChart';
import { StressInGeneralChart } from './PsychologicalAndEmotionalFactors/StressInGeneralChart';
import { StressBeforeExamsChart } from './PsychologicalAndEmotionalFactors/StressBeforeExamsChart';
import { KnownDisabilitiesChart } from './PsychologicalAndEmotionalFactors/KnownDisabilitiesChart';
import { SenseOfBelongingChart } from './PsychologicalAndEmotionalFactors/SenseOfBelongingChart';
import { DashboardData } from '@/types/dashboard';

interface PsychologicalAndEmotionalFactorsProps {
  data: DashboardData[];
  chartRefs: React.RefObject<HTMLDivElement>[];
}

export const PsychologicalAndEmotionalFactors = ({ data, chartRefs }: PsychologicalAndEmotionalFactorsProps) => {
  const qualityOfLifeRef = useRef(null);
  const feelAfraidRef = useRef(null);
  const stressInGeneralRef = useRef(null);
  const stressBeforeExamsRef = useRef(null);
  const knownDisabilitiesRef = useRef(null);
  const senseOfBelongingRef = useRef(null);

  const captureCharts = async () => {
    const charts = [
      { ref: qualityOfLifeRef, name: 'QualityOfLifeChart' },
      { ref: feelAfraidRef, name: 'FeelAfraidChart' },
      { ref: stressInGeneralRef, name: 'StressInGeneralChart' },
      { ref: stressBeforeExamsRef, name: 'StressBeforeExamsChart' },
      { ref: knownDisabilitiesRef, name: 'KnownDisabilitiesChart' },
      { ref: senseOfBelongingRef, name: 'SenseOfBelongingChart' },
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
    <div>
    <Box sx={{ p: 2, border: '8px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#ffff' }}>
        Psychological and Emotional Factors
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[0]}>
            <QualityOfLifeChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[1]}>
            <FeelAfraidChart data={data} />
          </Paper>
        </Grid>
        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[2]}>
            <StressInGeneralChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[3]}>
            <StressBeforeExamsChart data={data} />
          </Paper>
        </Grid>
        {/* Row 3 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[4]}>
            <KnownDisabilitiesChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[5]}>
            <SenseOfBelongingChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </div>
  );
};