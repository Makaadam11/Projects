import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  Treemap,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { DashboardData } from '../../../types/dashboard';

interface Props {
  data: DashboardData[];
}

export const CourseTreemap: React.FC<Props> = ({ data }) => {
  const treeData = React.useMemo(() => {
    const groupedData = data.reduce((acc, curr) => {
      const course = curr.course_of_study;
      
      if (!acc[course]) {
        acc[course] = {
          name: course,
          value: 0,
          totalStudents: 0,
          mhStudents: 0,
          level: curr.level_of_study
        };
      }
      
      acc[course].value += curr.cost_of_study;
      acc[course].totalStudents += 1;
      if (curr.predictions === 1) {
        acc[course].mhStudents += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return {
      name: 'Courses',
      children: Object.values(groupedData).map(course => ({
        name: course.name,
        fill: course.mhStudents / course.totalStudents > 0.5 ? '#ff0000' : '#00ff00',

        value: course.value / course.totalStudents, // average cost
        totalStudents: course.totalStudents,
        mhPercentage: (course.mhStudents / course.totalStudents) * 100,
        level: course.level,
      }))
    };
  }, [data]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Course Analysis: Cost and Mental Health Distribution
          </Typography>
          <Box sx={{ height: 500 }}>
            {/* <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treeData.children}
                dataKey="totalStudents"
                aspectRatio={1}  // Changed from 4/3 to 1 for more square-like rectangles
                stroke="#fff"
                fill="#82ca9d"
              >
            <Tooltip 
              content={({ payload }) => {
                if (!payload?.[0]?.payload) return null;
                const data = payload[0].payload;
                return (
                  <div style={{ background: 'white', padding: '10px', border: '1px solid #ccc' }}>
                    <p><strong>{data.name}</strong></p>
                    <p>Level: {data.level}</p>
                    <p>Average Cost: £{data.value.toFixed(2)}</p>
                    <p>Mental Health: {data.mhPercentage.toFixed(1)}%</p>
                    <p>Total Students: {data.totalStudents}</p>
                  </div>
                );
              }}
            />
          </Treemap>
        </ResponsiveContainer> */}
      </Box>
    </Paper>
  );
};