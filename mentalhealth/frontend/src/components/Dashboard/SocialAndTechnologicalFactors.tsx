import { HoursSocialMediaChart } from './SocialAndTechnologicalFactors/HoursSocialMediaChart';
import { TotalDeviceHoursChart } from './SocialAndTechnologicalFactors/TotalDeviceHoursChart';
import { HoursSocialisingChart } from './SocialAndTechnologicalFactors/HoursSocialisingChart';
import { Box, Grid, Paper, Typography } from '@mui/material';

interface SocialAndTechnologicalFactorsProps {
  data: any; // Replace 'any' with the appropriate type for your data
}

export const SocialAndTechnologicalFactors = ({ data }: SocialAndTechnologicalFactorsProps) => {
  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' , border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#ffff' }}>
      Social and Technological Factors
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <HoursSocialMediaChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <TotalDeviceHoursChart data={data} />
          </Paper>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <HoursSocialisingChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};