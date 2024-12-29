import { QualityOfLifeChart } from './PsychologicalAndEmotionalFactors/QualityOfLifeChart';
import { FeelAfraidChart } from './PsychologicalAndEmotionalFactors/FeelAfraidChart';
import { StressInGeneralChart } from './PsychologicalAndEmotionalFactors/StressInGeneralChart';
import { StressBeforeExamsChart } from './PsychologicalAndEmotionalFactors/StressBeforeExamsChart';
import { KnownDisabilitiesChart } from './PsychologicalAndEmotionalFactors/KnownDisabilitiesChart';
import { SenseOfBelongingChart } from './PsychologicalAndEmotionalFactors/SenseOfBelongingChart';
import { Box, Grid, Paper, Typography } from '@mui/material';

interface PsychologicalAndEmotionalFactorsProps {
  data: any;
}

export const PsychologicalAndEmotionalFactors = ({ data }: PsychologicalAndEmotionalFactorsProps) => {
  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' , border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#ffff' }}>
      Psychological and Emotional Factors
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <QualityOfLifeChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <FeelAfraidChart data={data} />
          </Paper>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <StressInGeneralChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <StressBeforeExamsChart data={data} />
          </Paper>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <KnownDisabilitiesChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <SenseOfBelongingChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};