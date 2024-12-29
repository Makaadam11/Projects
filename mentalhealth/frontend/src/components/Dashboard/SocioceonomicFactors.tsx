import { FinancialSupportChart } from './SocioceonomicFactors/FinancialSupportChart';
import { FinancialProblemsChart } from './SocioceonomicFactors/FinancialProblemsChart';
import { FamilyEarningClassChart } from './SocioceonomicFactors/FamilyEarningClassChart';
import { FormOfEmploymentChart } from './SocioceonomicFactors/FormOfEmploymentChart';
import { WorkHoursPerWeekChart } from './SocioceonomicFactors/WorkHoursPerWeekChart';
import { CostOfStudyChart } from './SocioceonomicFactors/CostOfStudyChart';
import { Box, Grid, Paper, Typography } from '@mui/material';

interface SocioceonomicFactorsProps {
  data: any;
}

export const SocioceonomicFactors = ({ data }: SocioceonomicFactorsProps) => {
  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' , border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#ffff' }}>
        Socio-Economic Factors
      </Typography>
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <FinancialSupportChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <FinancialProblemsChart data={data} />
          </Paper>
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <FamilyEarningClassChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <FormOfEmploymentChart data={data} />
          </Paper>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <WorkHoursPerWeekChart data={data} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <CostOfStudyChart data={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};