'use client';

import { useState, useEffect } from 'react';
import { DateFilter, SessionFilter, MinuteFilter, SentimentFilter } from './components/filters';
import { UserCard, EmotionChart } from './components/usercard';
import WordCloud from './components/wordcloud';
import EmotionTimeline from './components/emotiongraph'
import { SessionData, SessionInfo } from './types/dashboard';
import { DataProcessor } from '@/lib/data-processor';
import EmotionTimelineSegments from './components/emotiongraph';


export default function Dashboard() {
  const [availableSessions, setAvailableSessions] = useState<SessionInfo[]>([]);
  const [selectedSessionData, setSelectedSessionData] = useState<SessionData | null>(null);
  const [filteredSessionData, setFilteredSessionData] = useState<SessionData | null>(null);
  const [filters, setFilters] = useState<{
    date: string;
    selectedFile: string;
    minuteFilter: 1 | 5 | 10 | 30 | 60 | "all";
    topSentimentCount: number;
  }>({
    date: '',
    selectedFile: '',
    minuteFilter: 'all',
    topSentimentCount: 50
  });

  useEffect(() => {
    fetchAvailableSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionData) {
      // const filtered = DataProcessor.applyDataFilters(selectedSessionData, filters);
      setFilteredSessionData(selectedSessionData);
    }
  }, [filters, selectedSessionData]);

  const fetchAvailableSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const result = await response.json();
        setAvailableSessions(result.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchSessionData = async (fileName: string) => {
    try {
      const response = await fetch(`/api/sessions?file=${encodeURIComponent(fileName)}`);
      if (response.ok) {
        const result = await response.json();
        setSelectedSessionData(result.session);
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  const handleSessionSelect = (fileName: string) => {
    setFilters({...filters, selectedFile: fileName});
    if (fileName) {
      fetchSessionData(fileName);
    } else {
      setSelectedSessionData(null);
    }
  };

  const availableDates = DataProcessor.getAvailableDates(availableSessions);
  const filteredSessions = DataProcessor.filterSessionsByDate(availableSessions, filters.date);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Chat Analytics Dashboard</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Available Sessions: {availableSessions.length}</h2>
        {selectedSessionData && (
          <p className="text-sm text-gray-600">
            Current: {selectedSessionData.users.map(u => u.name).join(' & ')} - {selectedSessionData.date}
          </p>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <DateFilter 
          availableDates={availableDates}
          onChange={(date) => setFilters({...filters, date})} 
        />
        <SessionFilter 
          sessions={filteredSessions}
          onChange={(fileName) => handleSessionSelect(fileName)}
        />
        <MinuteFilter onChange={(minute) => setFilters({...filters, minuteFilter: minute})} />
        <SentimentFilter onChange={(count) => setFilters({...filters, topSentimentCount: count})} />
      </div>
      
      {filteredSessionData ? (
        <>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <UserCard
              name={filteredSessionData.users[0]?.name || "User 1"}
              data={[filteredSessionData]}
            />
            <UserCard
              name={filteredSessionData.users[1]?.name || "User 2"}
              data={[filteredSessionData]}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <EmotionTimelineSegments
              key={`timeline-${filteredSessionData.users[0]?.name || 'user1'}`}
              name={filteredSessionData.users[0]?.name || "User 1"}
              data={[filteredSessionData]}
              minuteFilter={filters.minuteFilter}

            />
            <EmotionTimelineSegments
              key={`timeline-${filteredSessionData.users[1]?.name || 'user2'}`}
              name={filteredSessionData.users[1]?.name || "User 2"}
              data={[filteredSessionData]}
              minuteFilter={filters.minuteFilter}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <WordCloud
              name={filteredSessionData.users[0]?.name || 'User 1'}
              data={[filteredSessionData]}
              topCount={filters.topSentimentCount}
              className="w-full"
            />
            <WordCloud
              name={filteredSessionData.users[1]?.name || 'User 2'}
              data={[filteredSessionData]}
              topCount={filters.topSentimentCount}
              className="w-full"
            />
          </div>
        </>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <h3 className="text-xl text-gray-600">Select a session to view analytics</h3>
        </div>
      )}
    </div>
  );
}