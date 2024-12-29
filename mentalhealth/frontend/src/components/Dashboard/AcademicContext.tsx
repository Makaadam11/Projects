import { CourseOfStudyChart } from './Academic Context/CourseOfStudyChart';
import { HoursPerWeekChart } from './Academic Context/HoursPerWeekChart';
import { LevelOfStudyChart } from './Academic Context/LevelOfStudyChart';
import { TimetablePreferenceChart } from './Academic Context/TimetablePreferenceChart';
import { TimetableReasonsChart } from './Academic Context/TimetableReasonsChart';
import { TimetableImpactChart } from './Academic Context/TimetableImpactChart';
import { Box, Grid, Paper, Typography } from '@mui/material';

interface AcademicContextProps {
  data: any;
}

export const AcademicContext = ({ data }: AcademicContextProps) => {
  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' , border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#ffff' }}>
      Academic Context
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <CourseOfStudyChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <HoursPerWeekChart data={data} dataKey="hours_per_week_lectures" title="Hours per Week (Lectures)" />
          </Paper>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <HoursPerWeekChart data={data} dataKey="hours_per_week_university_work" title="Hours per Week (University Work)" />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <LevelOfStudyChart data={data} />
          </Paper>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <TimetablePreferenceChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <TimetableReasonsChart data={data} />
          </Paper>
        </Grid>

        {/* Row 4 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <TimetableImpactChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};