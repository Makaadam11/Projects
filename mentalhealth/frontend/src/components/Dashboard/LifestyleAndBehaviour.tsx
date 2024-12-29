import { DietChart } from './LifestyleAndBehaviour/DietChart';
import { WellHydratedChart } from './LifestyleAndBehaviour/WellHydratedChart';
import { ExercisePerWeekChart } from './LifestyleAndBehaviour/ExercisePerWeekChart';
import { AlcoholConsumptionChart } from './LifestyleAndBehaviour/AlcoholConsumptionChart';
import { PersonalityTypeChart } from './LifestyleAndBehaviour/PersonalityTypeChart';
import { PhysicalActivitiesChart } from './LifestyleAndBehaviour/PhysicalActivitiesChart';
import { MentalHealthActivitiesChart } from './LifestyleAndBehaviour/MentalHealthActivitiesChart';
import { Box, Grid, Paper, Typography } from '@mui/material';

interface LifestyleAndBehaviourProps {
  data: any; // Replace 'any' with the appropriate type based on your data structure
}

export const LifestyleAndBehaviour = ({ data }: LifestyleAndBehaviourProps) => {
  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' , border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#ffff' }}>
      Lifestyle and Behaviour
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <DietChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <WellHydratedChart data={data} />
          </Paper>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <ExercisePerWeekChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <AlcoholConsumptionChart data={data} />
          </Paper>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <PersonalityTypeChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <PhysicalActivitiesChart data={data} />
          </Paper>
        </Grid>

        {/* Row 4 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <MentalHealthActivitiesChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};