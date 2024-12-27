import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import type { MentalHealthData } from '../../../types/dashboard';

interface Props {
  data: MentalHealthData[];
}

export const EthnicGroupTable: React.FC<Props> = ({ data }) => {
  const tableData = React.useMemo(() => {
    const grouped = data.reduce((acc, curr) => {
      const key = curr.ethnic_group;
      if (!acc[key]) {
        acc[key] = {
          ethnicGroup: key,
          total: 0,
          stressBeforeExams: 0,
          mentalHealth: 0
        };
      }
      acc[key].total += 1;
      if (curr.stress_before_exams) acc[key].stressBeforeExams += 1;
      if (curr.mental_health_status) acc[key].mentalHealth += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map(group => ({
      ...group,
      stressRate: (group.stressBeforeExams / group.total) * 100,
      mentalHealthRate: (group.mentalHealth / group.total) * 100
    }));
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Ethnic Group Analysis
      </Typography>
      <TableContainer sx={{ maxHeight: 300 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ethnic Group</TableCell>
              <TableCell align="right">Stress Rate (%)</TableCell>
              <TableCell align="right">Mental Health (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.ethnicGroup}>
                <TableCell component="th" scope="row">
                  {row.ethnicGroup}
                </TableCell>
                <TableCell align="right">
                  {row.stressRate.toFixed(1)}
                </TableCell>
                <TableCell align="right">
                  {row.mentalHealthRate.toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};