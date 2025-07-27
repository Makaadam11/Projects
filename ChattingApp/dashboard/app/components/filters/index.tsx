'use client';

import { useState } from 'react';
import { SessionData, SessionInfo } from '@/app/types/dashboard';

interface DateFilterProps {
  onChange: (date: string) => void;
  availableDates?: string[];
}

export function DateFilter({ onChange, availableDates = [] }: DateFilterProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-sm font-medium mb-2">Date (Calendar)</label>
      <select 
        title='Select Date'
        className="w-full border rounded p-2"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          onChange(e.target.value);
        }}
      >
        <option value="">All Dates</option>
        {availableDates.length === 0 ? (
          <option disabled>No dates available</option>
        ) : (
          availableDates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))
        )}
      </select>
    </div>
  );
}

interface SessionFilterProps {
  onChange: (fileName: string) => void;  // ✅ Zmieniono na fileName
  sessions?: SessionInfo[];
}

export function SessionFilter({ onChange, sessions = [] }: SessionFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-sm font-medium mb-2">List of Sessions</label>
      <select
        title='Select Session' 
        className="w-full border rounded p-2" 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select Session</option>
        {sessions.length === 0 ? (
          <option disabled>No sessions available</option>
        ) : (
          sessions.map(session => (
            <option key={session.fileName} value={session.file}>
              {session.names.join(' & ')} - {session.date} {(session.time)}
            </option>
          ))
        )}
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
        className="w-full border rounded p-2" 
        onChange={(e) => onChange(e.target.value as any)}
      >
        <option value="all">All</option>
        <option value="1">1 min</option>
        <option value="5">5 min</option>
        <option value="10">10 min</option>
        <option value="30">30 min</option>
        <option value="60">60 min</option>
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
        onChange={(e) => onChange(parseInt(e.target.value) || 50)}
      />
    </div>
  );
}