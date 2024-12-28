import React from 'react';
import { Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import type { DashboardData } from '@/types/dashboard';

interface Props {
  data: DashboardData[];
}

export const EthnicGroupTable: React.FC<Props> = ({ data }) => {
  const tableData = React.useMemo(() => {
    const grouped = data.reduce((acc, curr) => {
      const key = curr.ethnic_group;
      if (!acc[key]) {
        acc[key] = {
          ethnicGroup: key,
          total: 0,
          stressBeforeExamsYes: 0,
          stressBeforeExamsNo: 0,
          prediction0Yes: 0,
          prediction0No: 0,
          prediction1Yes: 0,
          prediction1No: 0
        };
      }
      acc[key].total += 1;
      if (curr.stress_before_exams === 'Yes') {
        acc[key].stressBeforeExamsYes += 1;
        if (curr.predictions === 0) acc[key].prediction0Yes += 1;
        if (curr.predictions === 1) acc[key].prediction1Yes += 1;
      }
      if (curr.stress_before_exams === 'No') {
        acc[key].stressBeforeExamsNo += 1;
        if (curr.predictions === 0) acc[key].prediction0No += 1;
        if (curr.predictions === 1) acc[key].prediction1No += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map(group => ({
      ...group,
      stressBeforeExamsYesRate: (group.stressBeforeExamsYes / group.total) * 100,
      stressBeforeExamsNoRate: (group.stressBeforeExamsNo / group.total) * 100,
      prediction0YesRate: (group.prediction0Yes / group.total) * 100,
      prediction0NoRate: (group.prediction0No / group.total) * 100,
      prediction1YesRate: (group.prediction1Yes / group.total) * 100,
      prediction1NoRate: (group.prediction1No / group.total) * 100
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Ethnic Group Analysis
      </Typography>
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ethnic Group</TableCell>
              <TableCell align="right">Stress Before Exams</TableCell>
              <TableCell align="right">Prediction 0 (%)</TableCell>
              <TableCell align="right">Prediction 1 (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <React.Fragment key={row.ethnicGroup}>
                <TableRow>
                  <TableCell rowSpan={2}>{row.ethnicGroup}</TableCell>
                  <TableCell align="right">Yes</TableCell>
                  <TableCell align="right" sx={{ color: 'green' }}>{row.prediction0YesRate.toFixed(1)}</TableCell>
                  <TableCell align="right" sx={{ color: 'red' }}>{row.prediction1YesRate.toFixed(1)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="right">No</TableCell>
                  <TableCell align="right" sx={{ color: 'green' }}>{row.prediction0NoRate.toFixed(1)}</TableCell>
                  <TableCell align="right" sx={{ color: 'red' }}>{row.prediction1NoRate.toFixed(1)}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};