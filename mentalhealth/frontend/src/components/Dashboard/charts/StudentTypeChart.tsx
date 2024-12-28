import React, { useState } from 'react';
import { Box, Paper, Typography, Switch, FormControlLabel, Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import type { DashboardData } from '@/types/dashboard';

interface Props {
  data: DashboardData[];
}

export const StudentTypeChart: React.FC<Props> = ({ data }) => {
  const [showLabels, setShowLabels] = useState(false);
  const [viewType, setViewType] = useState<'lectures' | 'universityWork'>('lectures');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (type: 'lectures' | 'universityWork') => {
    setViewType(type);
    handleClose();
  };

  const chartData = React.useMemo(() => {
    const studentTypes = ['Home student', 'International student', 'European student'];
    return studentTypes.map(type => {
      const typeData = data.filter(d => d.student_type_location === type);
      const totalType = typeData.length;
      const pred0Data = typeData.filter(d => d.predictions === 0);
      const pred1Data = typeData.filter(d => d.predictions === 1);

      return {
        name: type,
        'No MH': (pred0Data.reduce((sum, curr) => sum + (viewType === 'lectures' ? curr.hours_per_week_lectures : curr.hours_per_week_university_work), 0) / totalType) * 100,
        'MH': (pred1Data.reduce((sum, curr) => sum + (viewType === 'lectures' ? curr.hours_per_week_lectures : curr.hours_per_week_university_work), 0) / totalType) * 100
      };
    });
  }, [data, viewType]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {viewType === 'lectures' ? 'Lecture Hours Distribution' : 'University Work Hours Distribution'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />}
            label="Show Values"
          />
          <IconButton onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleViewChange('lectures')}>Lecture Hours</MenuItem>
        <MenuItem onClick={() => handleViewChange('universityWork')}>University Work Hours</MenuItem>
      </Menu>

      <Box sx={{ height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
            <Legend />
            <Bar dataKey="No MH" fill="#82ca9d" name="No Mental Health Issues">
              {showLabels && <LabelList position="inside" formatter={(value: number) => `${value.toFixed(2)}%`} />}
            </Bar>
            <Bar dataKey="MH" fill="#ff6b6b" name="Mental Health Issues">
              {showLabels && <LabelList position="inside" formatter={(value: number) => `${value.toFixed(2)}%`} />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};