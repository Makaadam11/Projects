'use client';

import { useState } from 'react';

interface DateFilterProps {
  onChange: (date: [Date, Date]) => void;
}

export function DateFilter({ onChange }: DateFilterProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-sm font-medium mb-2">Date (Calendar)</label>
      <input 
        placeholder="Select date"
        type="date" 
        className="w-full border rounded p-2"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          const date = new Date(e.target.value);
          onChange([date, date]);
        }}
      />
    </div>
  );
}

interface SessionFilterProps {
  onChange: (sessions: string[]) => void;
}

export function SessionFilter({ onChange }: SessionFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-sm font-medium mb-2">List of Sessions</label>
      <select
      title='Select Session' 
      className="w-full border rounded p-2" onChange={(e) => onChange([e.target.value])}>
        <option value="">All Sessions</option>
        <option value="session1">Session 1</option>
        <option value="session2">Session 2</option>
      </select>
    </div>
  );
}

interface MinuteFilterProps {
  onChange: (minute: 1 | 5 | 10 | 30 | 60 | 'all') => void;
}

export function MinuteFilter({ onChange }: MinuteFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-sm font-medium mb-2">Minute Filter</label>
      <select 
      title='Select Minute Filter'
      className="w-full border rounded p-2" onChange={(e) => onChange(e.target.value as any)}>
        <option value="1">1 min</option>
        <option value="5">5 min</option>
        <option value="10">10 min</option>
        <option value="30">30 min</option>
        <option value="60">60 min</option>
        <option value="all">All</option>
      </select>
    </div>
  );
}

interface SentimentFilterProps {
  onChange: (count: number) => void;
}

export function SentimentFilter({ onChange }: SentimentFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-sm font-medium mb-2">Top Word Sentiment No</label>
      <input 
      title='Select Top Sentiment Count'
      placeholder="Enter count"
        type="number" 
        defaultValue="50" 
        className="w-full border rounded p-2"
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
    </div>
  );
}