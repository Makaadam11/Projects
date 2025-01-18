import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { FinancialSupportChart } from './SocioceonomicFactors/FinancialSupportChart';
import { FinancialProblemsChart } from './SocioceonomicFactors/FinancialProblemsChart';
import { FamilyEarningClassChart } from './SocioceonomicFactors/FamilyEarningClassChart';
import { FormOfEmploymentChart } from './SocioceonomicFactors/FormOfEmploymentChart';
import { WorkHoursPerWeekChart } from './SocioceonomicFactors/WorkHoursPerWeekChart';
import { CostOfStudyChart } from './SocioceonomicFactors/CostOfStudyChart';
import { Box, Grid, Paper, Typography } from '@mui/material';

interface SocioceonomicFactorsProps {
  data: any;
  chartRefs: React.RefObject<HTMLDivElement>[];
}

export const SocioceonomicFactors = ({ data, chartRefs }: SocioceonomicFactorsProps) => {
  const financialSupportRef = useRef(null);
  const financialProblemsRef = useRef(null);
  const familyEarningClassRef = useRef(null);
  const formOfEmploymentRef = useRef(null);
  const workHoursPerWeekRef = useRef(null);
  const costOfStudyRef = useRef(null);

  const captureCharts = async () => {
    const charts = [
      { ref: financialSupportRef, name: 'FinancialSupportChart' },
      { ref: financialProblemsRef, name: 'FinancialProblemsChart' },
      { ref: familyEarningClassRef, name: 'FamilyEarningClassChart' },
      { ref: formOfEmploymentRef, name: 'FormOfEmploymentChart' },
      { ref: workHoursPerWeekRef, name: 'WorkHoursPerWeekChart' },
      { ref: costOfStudyRef, name: 'CostOfStudyChart' },
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
        Socio-Economic Factors
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[0]}>
            <FinancialSupportChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[1]}>
            <FinancialProblemsChart data={data} />
          </Paper>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[2]}>
            <FamilyEarningClassChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[3]}>
            <FormOfEmploymentChart data={data} />
          </Paper>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[4]}>
            <WorkHoursPerWeekChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2, height: '100%' }} ref={chartRefs[5]}>
            <CostOfStudyChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
    </div>
  );
};