import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { DietChart } from './LifestyleAndBehaviour/DietChart';
import { WellHydratedChart } from './LifestyleAndBehaviour/WellHydratedChart';
import { ExercisePerWeekChart } from './LifestyleAndBehaviour/ExercisePerWeekChart';
import { AlcoholConsumptionChart } from './LifestyleAndBehaviour/AlcoholConsumptionChart';
import { PersonalityTypeChart } from './LifestyleAndBehaviour/PersonalityTypeChart';
import { PhysicalActivitiesChart } from './LifestyleAndBehaviour/PhysicalActivitiesChart';
import { MentalHealthActivitiesChart } from './LifestyleAndBehaviour/MentalHealthActivitiesChart';

interface LifestyleAndBehaviourProps {
  data: any; // Replace 'any' with the appropriate type based on your data structure
  chartRefs: React.RefObject<HTMLDivElement>[];
}

export const LifestyleAndBehaviour = ({ data, chartRefs }: LifestyleAndBehaviourProps) => {
  const dietChartRef = useRef(null);
  const wellHydratedChartRef = useRef(null);
  const exercisePerWeekChartRef = useRef(null);
  const alcoholConsumptionChartRef = useRef(null);
  const personalityTypeChartRef = useRef(null);
  const physicalActivitiesChartRef = useRef(null);
  const mentalHealthActivitiesChartRef = useRef(null);

  const captureCharts = async () => {
    const charts = [
      { ref: dietChartRef, name: 'DietChart' },
      { ref: wellHydratedChartRef, name: 'WellHydratedChart' },
      { ref: exercisePerWeekChartRef, name: 'ExercisePerWeekChart' },
      { ref: alcoholConsumptionChartRef, name: 'AlcoholConsumptionChart' },
      { ref: personalityTypeChartRef, name: 'PersonalityTypeChart' },
      { ref: physicalActivitiesChartRef, name: 'PhysicalActivitiesChart' },
      { ref: mentalHealthActivitiesChartRef, name: 'MentalHealthActivitiesChart' },
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
        Lifestyle and Behaviour
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[0]}>
            <DietChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[1]}>
            <WellHydratedChart data={data} />
          </Paper>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[2]}>
            <ExercisePerWeekChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[3]}>
            <AlcoholConsumptionChart data={data} />
          </Paper>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[4]}>
            <PersonalityTypeChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[5]}>
            <PhysicalActivitiesChart data={data} />
          </Paper>
        </Grid>

        {/* Row 4 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[6]}>
            <MentalHealthActivitiesChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </div>
  );
};