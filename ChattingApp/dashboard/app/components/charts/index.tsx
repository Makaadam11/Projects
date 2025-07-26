 
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  emotion: number;
}

interface EmotionLineChartProps {
  data: ChartData[];
  emotion: string;
  color: string;
}

export function EmotionLineChart({ data, emotion, color }: EmotionLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="emotion" stroke={color} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}