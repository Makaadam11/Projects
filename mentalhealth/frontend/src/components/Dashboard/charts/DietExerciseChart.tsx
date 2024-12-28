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
import type { DashboardData } from '../../../types/dashboard';

interface Props {
  data: DashboardData[];
}

export const DietExerciseChart: React.FC<Props> = ({ data }) => {
  const [showLabels, setShowLabels] = useState(false);
  const [viewType, setViewType] = useState<'diet' | 'hydration' | 'alcohol'>('diet');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (type: 'diet' | 'hydration' | 'alcohol') => {
    setViewType(type);
    handleClose();
  };

  const chartData = React.useMemo(() => {
    if (viewType === 'diet') {
      return ['Healthy', 'Unhealthy', 'Somewhat Inbetween'].map(type => ({
        name: type,
        'No MH': data.filter(d => d.diet === type && d.predictions === 0).reduce((sum, curr) => sum + curr.exercise_per_week, 0) / data.filter(d => d.diet === type && d.predictions === 0).length,
        'MH': data.filter(d => d.diet === type && d.predictions === 1).reduce((sum, curr) => sum + curr.exercise_per_week, 0) / data.filter(d => d.diet === type && d.predictions === 1).length
      }));
    } else if (viewType === 'hydration') {
      return ['Yes', 'No'].map(type => ({
        name: type,
        'No MH': data.filter(d => d.well_hydrated === type && d.predictions === 0).reduce((sum, curr) => sum + curr.exercise_per_week, 0) / data.filter(d => d.well_hydrated === type && d.predictions === 0).length,
        'MH': data.filter(d => d.well_hydrated === type && d.predictions === 1).reduce((sum, curr) => sum + curr.exercise_per_week, 0) / data.filter(d => d.well_hydrated === type && d.predictions === 1).length
      }));
    } else {
      return ['No Drinks', 'Below Moderate', 'Moderate', 'Above Moderate'].map(type => ({
        name: type,
        'No MH': data.filter(d => d.alcohol_consumption === type && d.predictions === 0).reduce((sum, curr) => sum + curr.exercise_per_week, 0) / data.filter(d => d.alcohol_consumption === type && d.predictions === 0).length,
        'MH': data.filter(d => d.alcohol_consumption === type && d.predictions === 1).reduce((sum, curr) => sum + curr.exercise_per_week, 0) / data.filter(d => d.alcohol_consumption === type && d.predictions === 1).length
      }));
    }
  }, [data, viewType]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {viewType === 'diet' ? 'Diet vs Exercise Hours' : 
           viewType === 'hydration' ? 'Hydration vs Exercise Hours' : 'Alcohol Consumption vs Exercise Hours'}
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
        <MenuItem onClick={() => handleViewChange('diet')}>Diet</MenuItem>
        <MenuItem onClick={() => handleViewChange('hydration')}>Hydration</MenuItem>
        <MenuItem onClick={() => handleViewChange('alcohol')}>Alcohol Consumption</MenuItem>
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