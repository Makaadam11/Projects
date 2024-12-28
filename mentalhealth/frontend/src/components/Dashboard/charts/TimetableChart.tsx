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

export const TimetableChart: React.FC<Props> = ({ data }) => {
  const [showLabels, setShowLabels] = useState(false);
  const [viewType, setViewType] = useState<'preference' | 'impact'>('preference');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (type: 'preference' | 'impact') => {
    setViewType(type);
    handleClose();
  };

  const chartData = React.useMemo(() => {
    if (viewType === 'preference') {
      return ['Compact', 'Spread'].map(preference => ({
        name: preference,
        'No MH': data.filter(d => d.timetable_preference.toLowerCase().includes(preference.toLowerCase()) && d.predictions === 0).reduce((sum, curr) => sum + curr.hours_between_lectures, 0) / data.filter(d => d.timetable_preference.toLowerCase().includes(preference.toLowerCase()) && d.predictions === 0).length,
        'MH': data.filter(d => d.timetable_preference.toLowerCase().includes(preference.toLowerCase()) && d.predictions === 1).reduce((sum, curr) => sum + curr.hours_between_lectures, 0) / data.filter(d => d.timetable_preference.toLowerCase().includes(preference.toLowerCase()) && d.predictions === 1).length
      }));
    } else {
      return ['Yes', 'No'].map(impact => ({
        name: impact,
        'No MH': data.filter(d => d.timetable_impact.includes(impact) && d.predictions === 0).reduce((sum, curr) => sum + curr.hours_between_lectures, 0) / data.filter(d => d.timetable_impact.includes(impact) && d.predictions === 0).length,
        'MH': data.filter(d => d.timetable_impact.includes(impact) && d.predictions === 1).reduce((sum, curr) => sum + curr.hours_between_lectures, 0) / data.filter(d => d.timetable_impact.includes(impact) && d.predictions === 1).length
      }));
    }
  }, [data, viewType]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {viewType === 'preference' ? 'Timetable Preference vs Hours Between Lectures' : 'Timetable Impact vs Hours Between Lectures'}
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
        <MenuItem onClick={() => handleViewChange('preference')}>Timetable Preference</MenuItem>
        <MenuItem onClick={() => handleViewChange('impact')}>Timetable Impact</MenuItem>
      </Menu>

      <Box sx={{ height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              label={{ 
                value: 'Hours', 
                angle: -90, 
                position: 'insideLeft' 
              }} 
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="No MH" fill="#82ca9d" name="No Mental Health Issues">
              {showLabels && <LabelList position="inside" />}
            </Bar>
            <Bar dataKey="MH" fill="#ff6b6b" name="Mental Health Issues">
              {showLabels && <LabelList position="inside" />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};