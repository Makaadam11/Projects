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

export const PersonalityChart: React.FC<Props> = ({ data }) => {
  const [showLabels, setShowLabels] = useState(false);
  const [viewType, setViewType] = useState<'personalityDevice' | 'personalitySocialMedia' | 'socialDevice' | 'socialMedia'>('personalityDevice');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (type: 'personalityDevice' | 'personalitySocialMedia' | 'socialDevice' | 'socialMedia') => {
    setViewType(type);
    handleClose();
  };

  const chartData = React.useMemo(() => {
    if (viewType === 'personalityDevice') {
      return ['Introvert', 'Extrovert', 'Somewhat in-between'].map(type => ({
        name: type,
        'No MH': data.filter(d => d.personality_type === type && d.predictions === 0).reduce((sum, curr) => sum + curr.total_device_hours, 0) / data.filter(d => d.personality_type === type && d.predictions === 0).length,
        'MH': data.filter(d => d.personality_type === type && d.predictions === 1).reduce((sum, curr) => sum + curr.total_device_hours, 0) / data.filter(d => d.personality_type === type && d.predictions === 1).length
      }));
    } else if (viewType === 'personalitySocialMedia') {
      return ['Introvert', 'Extrovert', 'Somewhat in-between'].map(type => ({
        name: type,
        'No MH': data.filter(d => d.personality_type === type && d.predictions === 0).reduce((sum, curr) => sum + curr.hours_socialmedia, 0) / data.filter(d => d.personality_type === type && d.predictions === 0).length,
        'MH': data.filter(d => d.personality_type === type && d.predictions === 1).reduce((sum, curr) => sum + curr.hours_socialmedia, 0) / data.filter(d => d.personality_type === type && d.predictions === 1).length
      }));
    } else if (viewType === 'socialDevice') {
      return [
        {
          name: 'Socializing',
          'No MH': data.filter(d => d.predictions === 0).reduce((sum, curr) => sum + curr.hours_socialising, 0) / data.filter(d => d.predictions === 0).length,
          'MH': data.filter(d => d.predictions === 1).reduce((sum, curr) => sum + curr.hours_socialising, 0) / data.filter(d => d.predictions === 1).length
        },
        {
          name: 'Total Device Hours',
          'No MH': data.filter(d => d.predictions === 0).reduce((sum, curr) => sum + curr.total_device_hours, 0) / data.filter(d => d.predictions === 0).length,
          'MH': data.filter(d => d.predictions === 1).reduce((sum, curr) => sum + curr.total_device_hours, 0) / data.filter(d => d.predictions === 1).length
        }
      ];
    } else {
      return [
        {
          name: 'Socializing',
          'No MH': data.filter(d => d.predictions === 0).reduce((sum, curr) => sum + curr.hours_socialising, 0) / data.filter(d => d.predictions === 0).length,
          'MH': data.filter(d => d.predictions === 1).reduce((sum, curr) => sum + curr.hours_socialising, 0) / data.filter(d => d.predictions === 1).length
        },
        {
          name: 'Social Media Hours',
          'No MH': data.filter(d => d.predictions === 0).reduce((sum, curr) => sum + curr.hours_socialmedia, 0) / data.filter(d => d.predictions === 0).length,
          'MH': data.filter(d => d.predictions === 1).reduce((sum, curr) => sum + curr.hours_socialmedia, 0) / data.filter(d => d.predictions === 1).length
        }
      ];
    }
  }, [data, viewType]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {viewType === 'personalityDevice' ? 'Personality Types vs Total Device Hours' : 
           viewType === 'personalitySocialMedia' ? 'Personality Types vs Social Media Hours' : 
           viewType === 'socialDevice' ? 'Socializing vs Total Device Hours' : 'Socializing vs Social Media Hours'}
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
        <MenuItem onClick={() => handleViewChange('personalityDevice')}>Personality Types vs Total Device Hours</MenuItem>
        <MenuItem onClick={() => handleViewChange('personalitySocialMedia')}>Personality Types vs Social Media Hours</MenuItem>
        <MenuItem onClick={() => handleViewChange('socialDevice')}>Socializing vs Total Device Hours</MenuItem>
        <MenuItem onClick={() => handleViewChange('socialMedia')}>Socializing vs Social Media Hours</MenuItem>
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