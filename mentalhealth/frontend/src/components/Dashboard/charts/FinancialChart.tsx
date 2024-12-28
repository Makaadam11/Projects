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

export const FinancialChart: React.FC<Props> = ({ data }) => {
  const [showLabels, setShowLabels] = useState(false);
  const [viewType, setViewType] = useState<'financialSupport' | 'financialProblems' | 'costOfStudy'>('financialSupport');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewChange = (type: 'financialSupport' | 'financialProblems' | 'costOfStudy') => {
    setViewType(type);
    handleClose();
  };

  const chartData = React.useMemo(() => {
    const studentTypes = ['Full Time', 'Part Time'];
    if (viewType === 'financialSupport') {
      const supportTypes = [
        'Self-paid', 'Parent (family) support', 'Student loan', 'Credit', 
        'Scholarship', 'Sponsorship (Company/Organisation etc)', 'Degree Apprentice'
      ];
      return supportTypes.map(supportType => ({
        name: supportType,
        'No MH': (data.filter(d => d.financial_support === supportType && d.predictions === 0).length / data.length) * 100,
        'MH': (data.filter(d => d.financial_support === supportType && d.predictions === 1).length / data.length) * 100
      }));
    } else {
      return studentTypes.map(type => {
        const typeData = data.filter(d => d.student_type_time === type);
        const totalType = typeData.length;
        const pred0Data = typeData.filter(d => d.predictions === 0);
        const pred1Data = typeData.filter(d => d.predictions === 1);

        if (viewType === 'financialProblems') {
          return {
            name: type,
            'No MH': (pred0Data.filter(d => d.financial_problems === 'Yes').length / totalType) * 100,
            'MH': (pred1Data.filter(d => d.financial_problems === 'Yes').length / totalType) * 100
          };
        } else {
          return {
            name: type,
            'No MH': (pred0Data.reduce((sum, curr) => sum + curr.cost_of_study, 0) / totalType),
            'MH': (pred1Data.reduce((sum, curr) => sum + curr.cost_of_study, 0) / totalType)
          };
        }
      });
    }
  }, [data, viewType]);


  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {viewType === 'financialSupport' ? 'Financial Support vs Student Type Time' : 
           viewType === 'financialProblems' ? 'Financial Problems vs Student Type Time' : 'Cost of Study vs Student Type Time'}
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
        <MenuItem onClick={() => handleViewChange('financialSupport')}>Financial Support</MenuItem>
        <MenuItem onClick={() => handleViewChange('financialProblems')}>Financial Problems</MenuItem>
        <MenuItem onClick={() => handleViewChange('costOfStudy')}>Cost of Study</MenuItem>
      </Menu>

      <Box sx={{ height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              label={{ 
                value: viewType === 'costOfStudy' ? 'Cost (£)' : 'Percentage', 
                angle: -90, 
                position: 'insideLeft' 
              }} 
            />
            <Tooltip formatter={(value: number) => viewType === 'costOfStudy' ? `£${value.toFixed(2)}` : `${value.toFixed(2)}%`} />
            <Legend />
            <Bar dataKey="No MH" fill="#82ca9d" name="No Mental Health Issues">
              {showLabels && <LabelList position="inside" formatter={(value: number) => viewType === 'costOfStudy' ? `£${value.toFixed(2)}` : `${value.toFixed(2)}%`} />}
            </Bar>
            <Bar dataKey="MH" fill="#ff6b6b" name="Mental Health Issues">
              {showLabels && <LabelList position="inside" formatter={(value: number) => viewType === 'costOfStudy' ? `£${value.toFixed(2)}` : `${value.toFixed(2)}%`} />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};