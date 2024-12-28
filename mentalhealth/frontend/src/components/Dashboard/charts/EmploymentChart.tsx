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

export const EmploymentChart: React.FC<Props> = ({ data }) => {
  const [showLabels, setShowLabels] = useState(false);
  const [viewType, setViewType] = useState<'employment' | 'afraid' | 'stress'>('employment');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (type: 'employment' | 'afraid' | 'stress') => {
    setViewType(type);
    handleClose();
  };

  const chartData = React.useMemo(() => {
    if (viewType === 'employment') {
      return ['Full Time', 'Part Time', 'Unemployed', 'Self Employed'].map(type => ({
        name: type,
        'No MH': data.filter(d => d.form_of_employment === type && d.predictions === 0).reduce((sum, curr) => sum + curr.work_hours_per_week, 0) / data.filter(d => d.form_of_employment === type && d.predictions === 0).length,
        'MH': data.filter(d => d.form_of_employment === type && d.predictions === 1).reduce((sum, curr) => sum + curr.work_hours_per_week, 0) / data.filter(d => d.form_of_employment === type && d.predictions === 1).length
      }));
    } else if (viewType === 'afraid') {
      return ['Never', 'Very Rarely', 'Rarely', 'Occasionally', 'Very Frequently'].map(type => ({
        name: type,
        'No MH': data.filter(d => d.feel_afraid === type && d.predictions === 0).reduce((sum, curr) => sum + curr.work_hours_per_week, 0) / data.filter(d => d.feel_afraid === type && d.predictions === 0).length,
        'MH': data.filter(d => d.feel_afraid === type && d.predictions === 1).reduce((sum, curr) => sum + curr.work_hours_per_week, 0) / data.filter(d => d.feel_afraid === type && d.predictions === 1).length
      }));
    } else {
      return ['Yes', 'No'].map(type => ({
        name: type,
        'No MH': data.filter(d => d.stress_in_general.includes(type) && d.predictions === 0).reduce((sum, curr) => sum + curr.work_hours_per_week, 0) / data.filter(d => d.stress_in_general.includes(type) && d.predictions === 0).length,
        'MH': data.filter(d => d.stress_in_general.includes(type) && d.predictions === 1).reduce((sum, curr) => sum + curr.work_hours_per_week, 0) / data.filter(d => d.stress_in_general.includes(type) && d.predictions === 1).length
      }));
    }
  }, [data, viewType]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {viewType === 'employment' ? 'Form of Employment vs Work Hours per Week' : 
           viewType === 'afraid' ? 'Feel Afraid vs Work Hours per Week' : 'Stress in General vs Work Hours per Week'}
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
        <MenuItem onClick={() => handleViewChange('employment')}>Form of Employment</MenuItem>
        <MenuItem onClick={() => handleViewChange('afraid')}>Feel Afraid</MenuItem>
        <MenuItem onClick={() => handleViewChange('stress')}>Stress in General</MenuItem>
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