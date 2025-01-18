import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { CourseOfStudyChart } from './AcademicContext/CourseOfStudyChart';
import { HoursPerWeekChart } from './AcademicContext/HoursPerWeekChart';
import { LevelOfStudyChart } from './AcademicContext/LevelOfStudyChart';
import { TimetablePreferenceChart } from './AcademicContext/TimetablePreferenceChart';
import { TimetableReasonsChart } from './AcademicContext/TimetableReasonsChart';
import { TimetableImpactChart } from './AcademicContext/TimetableImpactChart';

interface AcademicContextProps {
  data: any;
  chartRefs: React.RefObject<HTMLDivElement>[];
}

export const AcademicContext = ({ data, chartRefs }: AcademicContextProps) => {
  const courseOfStudyRef = useRef(null);
  const hoursPerWeekLecturesRef = useRef(null);
  const hoursPerWeekUniversityWorkRef = useRef(null);
  const levelOfStudyRef = useRef(null);
  const timetablePreferenceRef = useRef(null);
  const timetableReasonsRef = useRef(null);
  const timetableImpactRef = useRef(null);

  const captureCharts = async () => {
    const charts = [
      { ref: courseOfStudyRef, name: 'CourseOfStudyChart' },
      { ref: hoursPerWeekLecturesRef, name: 'HoursPerWeekLecturesChart' },
      { ref: hoursPerWeekUniversityWorkRef, name: 'HoursPerWeekUniversityWorkChart' },
      { ref: levelOfStudyRef, name: 'LevelOfStudyChart' },
      { ref: timetablePreferenceRef, name: 'TimetablePreferenceChart' },
      { ref: timetableReasonsRef, name: 'TimetableReasonsChart' },
      { ref: timetableImpactRef, name: 'TimetableImpactChart' },
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
        Academic Context
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[0]}>
            <CourseOfStudyChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[1]}>
            <HoursPerWeekChart data={data} dataKey="hours_per_week_lectures" title="Hours per Week (Lectures)" />
          </Paper>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[2]}>
            <HoursPerWeekChart data={data} dataKey="hours_per_week_university_work" title="Hours per Week (University Work)" />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[3]}>
            <LevelOfStudyChart data={data} />
          </Paper>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[4]}>
            <TimetablePreferenceChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[5]}>
            <TimetableReasonsChart data={data} />
          </Paper>
        </Grid>

        {/* Row 4 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[6]}>
            <TimetableImpactChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </div>
  );
};