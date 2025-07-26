'use client';

import { useState, useEffect } from 'react';
import { DateFilter, SessionFilter, MinuteFilter, SentimentFilter } from './components/filters';
import { UserCard, EmotionChart, WordCloud } from './components/dashboard';
import { DashboardFilters, SessionData } from './types/dashboard';

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: [new Date(), new Date()],
    sessions: [],
    minuteFilter: 'all',
    topSentimentCount: 50
  });
  
  const [data, setData] = useState<SessionData[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (selectedFile: File) => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.sessions);
      } else {
        console.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Chat Analytics Dashboard</h1>
      
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Excel Data</h2>
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          className="border p-2 rounded"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              setFile(selectedFile);
              handleFileUpload(selectedFile);
            }
          }}
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <DateFilter onChange={(date) => setFilters({...filters, dateRange: date})} />
        <SessionFilter onChange={(sessions) => setFilters({...filters, sessions})} />
        <MinuteFilter onChange={(minute) => setFilters({...filters, minuteFilter: minute})} />
        <SentimentFilter onChange={(count) => setFilters({...filters, topSentimentCount: count})} />
      </div>
      
      {/* User Cards */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <UserCard name="Femi" data={data} />
        <UserCard name="Adam" data={data} />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <EmotionChart userName="Femi" data={data} />
        <EmotionChart userName="Adam" data={data} />
      </div>
    </div>
  );
}