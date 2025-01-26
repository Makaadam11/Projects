import React from 'react';
import { Box, Typography } from '@mui/material';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from '@/types/dashboard';

interface CourseOfStudyChartProps {
  data: DashboardData[];
}

export const CourseOfStudyChart = ({ data }: CourseOfStudyChartProps) => {
  const filteredData = data.filter(item => item.course_of_study !== 'Not Provided' && !isNaN(item.predictions));

  const groupedData = filteredData.reduce((acc, curr) => {
    const group = acc.find(item => item.name === curr.course_of_study);
    if (group) {
      group.prediction_0 += curr.predictions === 0 ? 1 : 0;
      group.prediction_1 += curr.predictions === 1 ? 1 : 0;
    } else {
      acc.push({
        name: curr.course_of_study,
        prediction_0: curr.predictions === 0 ? 1 : 0,
        prediction_1: curr.predictions === 1 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { name: string; prediction_0: number; prediction_1: number }[]);

  const totalData = groupedData.map(item => ({
    name: item.name,
    value: item.prediction_0 + item.prediction_1,
    prediction_0: item.prediction_0,
    prediction_1: item.prediction_1,
  }));

  const renderCustomCell = (props: any) => {
      if (!props || typeof props.width !== 'number' || typeof props.height !== 'number') {
        return null;
      }
  
      const { x = 0, y = 0, width = 0, height = 0, name, prediction_0 = 0, prediction_1 = 0 } = props;
      
      const total = (prediction_0 + prediction_1) || 1; // Prevent division by zero
      const percentageNoMH = (prediction_0 / total) * 100;
      const percentageMH = (prediction_1 / total) * 100;
  
      const fontSize = Math.max(8, Math.min(width, height) / 12);
      const truncatedName = name?.length > 10 ? `${name.substring(0, 10)}...` : name;
  
      const widthNoMH = String((width * percentageNoMH) / 100);
      const widthMH = String((width * percentageMH) / 100);
      const xMH = String(x + (width * percentageNoMH) / 100);
  
      return (
        <g>
          <rect x={String(x)} y={String(y)} width={String(width)} height={String(height)} fill="#fff" stroke="#000" />
          <rect x={String(x)} y={String(y)} width={widthNoMH} height={String(height)} fill="#82ca9d" />
          <rect x={xMH} y={String(y)} width={widthMH} height={String(height)} fill="#ff0000" />
          {name && width > 30 && height > 20 && (
            <text 
              x={String(x + width / 2)} 
              y={String(y + height / 2)} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="#000" 
              fontSize={String(fontSize)}
            >
              {truncatedName}
            </text>
          )}
        </g>
      );
    };

  return (
    <Box>
      <Typography variant="h6" align="center" gutterBottom>
        Course of Study
      </Typography>
      <ResponsiveContainer width="100%" height={315}>
        <Treemap
          data={totalData}
          dataKey="value"
          nameKey="name"
          stroke="#fff"
          content={renderCustomCell}
        >
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `Total: ${value}\nNo MH Issue: ${props.payload.prediction_0}\nMH Issue: ${props.payload.prediction_1}`,
              `Course: ${name}`
            ]}
            contentStyle={{ whiteSpace: 'pre-line' }}
          />
        </Treemap>
      </ResponsiveContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#82ca9d', mr: 1 }} />
          <Typography variant="body2">No MH Issue</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#ff0000', mr: 1 }} />
          <Typography variant="body2">MH Issue</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseOfStudyChart;