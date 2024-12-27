import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  Treemap,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { MentalHealthData } from '../../../types/dashboard';

interface Props {
  data: MentalHealthData[];
}

export const CourseTreemap: React.FC<Props> = ({ data }) => {
  const treeData = React.useMemo(() => {
    const groupedData = data.reduce((acc, curr) => {
      const category = curr.category;
      const course = curr.course_of_study;
      const year = curr.year_of_study;
      
      if (!acc[category]) {
        acc[category] = {
          name: category,
          children: {}
        };
      }
      
      if (!acc[category].children[course]) {
        acc[category].children[course] = {
          name: course,
          children: [],
          value: 0
        };
      }
      
      acc[category].children[course].value += curr.cost_of_study;
      return acc;
    }, {} as Record<string, any>);

    return {
      name: 'Courses',
      children: Object.values(groupedData).map(category => ({
        name: category.name,
        children: Object.values(category.children)
      }))
    };
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Course Cost Distribution
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treeData}
            dataKey="value"
            aspectRatio={4/3}
            stroke="#fff"
            fill="#8884d8"
          >
            <Tooltip 
              formatter={(value) => [`£${value.toFixed(2)}`, 'Cost']}
            />
          </Treemap>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};