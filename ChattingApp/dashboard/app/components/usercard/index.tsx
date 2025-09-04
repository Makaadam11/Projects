'use client';

import { useState } from 'react';
import { SessionData } from '@/app/types/dashboard';
import { formatTime, TimeUnit } from '@/lib/time-utils';
import SentimentTimelineSegments from '../sentimentgraph';

interface UserCardProps {
  name: string;
  data: SessionData[];
}

export function UserCard({ name, data}: UserCardProps) {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('auto');
  
  const userData = data.find(session => 
    session.users.some(user => user.name === name)
  )?.users.find(user => user.name === name);

  const timeOptions: { value: TimeUnit; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'seconds', label: 'Seconds' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`${name === 'Femi' ? 'bg-green-100' : 'bg-purple-100'} p-3 rounded-full mr-4`}>
            <span className={`${name === 'Femi' ? 'text-green-600' : 'text-purple-600'} font-bold text-lg`}>
              {name}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">User Statistics</h3>
            <p className="text-sm text-gray-600">Activity analysis</p>
          </div>
        </div>
        
        {/* Time unit dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Unit:</span>
          <select
            value={timeUnit}
            onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {timeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-blue-50 p-3 rounded text-center">
          <div className="text-xs text-gray-600">Total Time Sending</div>
          <div className="text-lg font-bold" title={`${userData?.totalSending || 0}s`}>
            {formatTime(userData?.totalSending || 0, timeUnit)}
          </div>
          
        </div>
        <div className="bg-green-50 p-3 rounded text-center">
          <div className="text-xs text-gray-600">Total Messages Sent</div>
        <div className="text-lg font-bold">{userData?.totalMessages || 0}</div>
          
        </div>
        <div className="bg-purple-50 p-3 rounded text-center">
          <div className="text-xs text-gray-600">Total Time Viewing</div>
          <div className="text-lg font-bold" title={`${userData?.totalViewing || 0}s`}>
            {formatTime(userData?.totalViewing || 0, timeUnit)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="mt-4 bg-red-50 p-3 rounded text-center">
          <div className="text-xs text-gray-600">No of Warnings</div>
          <div className="text-lg font-bold">{userData?.warnings_count || 0}</div>
        </div>
        <div className="mt-4 bg-orange-50 p-3 rounded text-center">
          <div className="text-xs text-gray-600">No of Corrections</div>
          <div className="text-lg font-bold">{userData?.corrections_count || 0}</div>
      </div>
      </div>

      {/* Additional time summary */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Activity Time:</span>
          <span className="font-medium" title={`${((userData?.totalSending || 0) + (userData?.totalViewing || 0))}s`}>
            {formatTime((userData?.totalSending || 0) + (userData?.totalViewing || 0), timeUnit)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Average Time per Message:</span>
          <span className="font-medium">
            {(userData?.totalMessages || 0) > 0 
              ? formatTime(((userData?.totalSending || 0) + (userData?.totalViewing || 0)) / (userData?.totalMessages || 1), timeUnit)
              : '0s'
            }
          </span>
        </div>
      </div>
    </div>
  );
}

interface EmotionChartProps {
  userName: string;
  data: SessionData[];
}

export function EmotionChart({ userName, data }: EmotionChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Emotion Graph ({userName})</h3>
      <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
        <span className="text-gray-500">Chart will be here</span>
      </div>
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">Time (mins)</span>
      </div>
    </div>
  );
}