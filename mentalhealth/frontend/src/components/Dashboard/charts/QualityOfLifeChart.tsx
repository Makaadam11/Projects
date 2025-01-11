import React, { useState } from 'react';
import { Box, Paper, Typography, Switch, FormControlLabel, Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';
import type { DashboardData } from '@/types/dashboard';

interface Props {
  data: DashboardData[];
}

export const QualityOfLifeChart: React.FC<Props> = ({ data }) => {
  const [showLabels, setShowLabels] = useState(false);
  const [viewType, setViewType] = useState<'qualitySocialMedia' | 'qualityDevice' | 'disabilitySocialMedia' | 'disabilityDevice' | 'afraidSocialMedia' | 'afraidDevice'>('qualitySocialMedia');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (type: 'qualitySocialMedia' | 'qualityDevice' | 'disabilitySocialMedia' | 'disabilityDevice' | 'afraidSocialMedia' | 'afraidDevice') => {
    setViewType(type);
    handleClose();
  };

  const chartData = React.useMemo(() => {
    if (viewType === 'qualitySocialMedia' || viewType === 'qualityDevice') {
      const groupedData = data.reduce((acc, curr) => {
        const quality = curr.quality_of_life;
        if (!acc[quality]) {
          acc[quality] = {
            qualityOfLife: quality,
            'No MH': 0,
            'MH': 0
          };
        }

        const key = curr.predictions === 1 ? 'MH' : 'No MH';
        const hours = viewType === 'qualitySocialMedia' ? curr.hours_socialmedia : curr.total_device_hours;

        acc[quality][key] += hours;
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(groupedData).map(group => ({
        ...group,
        'No MH': group['No MH'] / data.filter(d => d.quality_of_life === group.qualityOfLife && d.predictions === 0).length,
        'MH': group['MH'] / data.filter(d => d.quality_of_life === group.qualityOfLife && d.predictions === 1).length
      }));
    } else if (viewType === 'disabilitySocialMedia' || viewType === 'disabilityDevice') {
      const groupedData = data.reduce((acc, curr) => {
        const disability = curr.known_disabilities.toLowerCase().includes('yes') ? 'Yes' : 'No';
        if (!acc[disability]) {
          acc[disability] = {
            disability,
            'No MH': 0,
            'MH': 0
          };
        }

        const key = curr.predictions === 1 ? 'MH' : 'No MH';
        const hours = viewType === 'disabilitySocialMedia' ? curr.hours_socialmedia : curr.total_device_hours;

        acc[disability][key] += hours;
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(groupedData).map(group => ({
        ...group,
        'No MH': group['No MH'] / data.filter(d => d.known_disabilities.toLowerCase().includes(group.disability.toLowerCase()) && d.predictions === 0).length,
        'MH': group['MH'] / data.filter(d => d.known_disabilities.toLowerCase().includes(group.disability.toLowerCase()) && d.predictions === 1).length
      }));
    } else {
      const groupedData = data.reduce((acc, curr) => {
        const afraid = curr.feel_afraid;
        if (!acc[afraid]) {
          acc[afraid] = {
            afraid,
            'No MH': 0,
            'MH': 0
          };
        }

        const key = curr.predictions === 1 ? 'MH' : 'No MH';
        const hours = viewType === 'afraidSocialMedia' ? curr.hours_socialmedia : curr.total_device_hours;

        acc[afraid][key] += hours;
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(groupedData).map(group => ({
        ...group,
        'No MH': group['No MH'] / data.filter(d => d.feel_afraid === group.afraid && d.predictions === 0).length,
        'MH': group['MH'] / data.filter(d => d.feel_afraid === group.afraid && d.predictions === 1).length
      }));
    }
  }, [data, viewType]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {viewType === 'qualitySocialMedia' ? 'Quality of Life vs Social Media Hours' :
           viewType === 'qualityDevice' ? 'Quality of Life vs Device Hours' :
           viewType === 'disabilitySocialMedia' ? 'Disability vs Social Media Hours' :
           viewType === 'disabilityDevice' ? 'Disability vs Device Hours' :
           viewType === 'afraidSocialMedia' ? 'Feel Afraid vs Social Media Hours' :
           'Feel Afraid vs Device Hours'}
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
        <MenuItem onClick={() => handleViewChange('qualitySocialMedia')}>Quality of Life vs Social Media Hours</MenuItem>
        <MenuItem onClick={() => handleViewChange('qualityDevice')}>Quality of Life vs Device Hours</MenuItem>
        <MenuItem onClick={() => handleViewChange('disabilitySocialMedia')}>Disability vs Social Media Hours</MenuItem>
        <MenuItem onClick={() => handleViewChange('disabilityDevice')}>Disability vs Device Hours</MenuItem>
        <MenuItem onClick={() => handleViewChange('afraidSocialMedia')}>Feel Afraid vs Social Media Hours</MenuItem>
        <MenuItem onClick={() => handleViewChange('afraidDevice')}>Feel Afraid vs Device Hours</MenuItem>
      </Menu>

      <Box sx={{ height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={viewType.includes('quality') ? 'qualityOfLife' : viewType.includes('disability') ? 'disability' : 'afraid'} angle={75} dy={20} height={100} interval={0} />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
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