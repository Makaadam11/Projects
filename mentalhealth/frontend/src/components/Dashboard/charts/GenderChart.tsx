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

export const GenderChart: React.FC<Props> = ({ data }) => {
  const [showLabels, setShowLabels] = useState(false);
  const [viewType, setViewType] = useState<'gender' | 'earningClass'>('gender');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (type: 'gender' | 'earningClass') => {
    setViewType(type);
    handleClose();
  };

  const chartData = React.useMemo(() => {
    if (viewType === 'gender') {
      const groupedData = data.reduce((acc, curr) => {
        const gender = curr.gender;
        if (!acc[gender]) {
          acc[gender] = {
            gender,
            'No MH': 0,
            'MH': 0,
            totalAge: 0,
            count: 0
          };
        }

        const key = curr.predictions === 1 ? 'MH' : 'No MH';
        acc[gender][key] += 1;
        acc[gender].totalAge += curr.age;
        acc[gender].count += 1;
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(groupedData).map(group => ({
        gender: group.gender,
        'No MH': group['No MH'],
        'MH': group['MH'],
        averageAge: group.totalAge / group.count
      }));
    } else {
      const groupedData = data.reduce((acc, curr) => {
        const earningClass = curr.family_earning_class;
        if (!acc[earningClass]) {
          acc[earningClass] = {
            earningClass,
            'No MH': 0,
            'MH': 0,
            totalAge: 0,
            count: 0
          };
        }

        const key = curr.predictions === 1 ? 'MH' : 'No MH';
        acc[earningClass][key] += 1;
        acc[earningClass].totalAge += curr.age;
        acc[earningClass].count += 1;
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(groupedData).map(group => ({
        earningClass: group.earningClass,
        'No MH': group['No MH'],
        'MH': group['MH'],
        averageAge: group.totalAge / group.count
      }));
    }
  }, [data, viewType]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {viewType === 'gender' ? 'Gender vs Age' : 'Family Earning Class vs Age'}
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
        <MenuItem onClick={() => handleViewChange('gender')}>Gender</MenuItem>
        <MenuItem onClick={() => handleViewChange('earningClass')}>Family Earning Class</MenuItem>
      </Menu>

      <Box sx={{ height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={viewType === 'gender' ? 'gender' : 'earningClass'} />
            <YAxis label={{ value: 'Average Age', angle: -90, position: 'insideLeft' }} />
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