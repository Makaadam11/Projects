'use client';

import { SessionData } from '@/app/types/dashboard';

interface UserCardProps {
  name: string;
  data: SessionData[];
}

export function UserCard({ name, data }: UserCardProps) {
  const userData = data.find(session => 
    session.users.some(user => user.name === name)
  )?.users.find(user => user.name === name);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-4">
        <div className={`${name === 'Femi' ? 'bg-green-100' : 'bg-purple-100'} p-3 rounded-full mr-4`}>
          <span className={`${name === 'Femi' ? 'text-green-600' : 'text-purple-600'} font-bold text-lg`}>
            {name}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Word Cloud of sentiments</h3>
          <p className="text-sm text-gray-600">(top 50 negative words)</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-blue-50 p-3 rounded text-center">
          <div className="text-xs text-gray-600">No of Corrections</div>
          <div className="text-lg font-bold">{userData?.corrections || 0}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded text-center">
          <div className="text-xs text-gray-600">Total time Sending</div>
          <div className="text-lg font-bold">{userData?.totalSending || 0}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded text-center">
          <div className="text-xs text-gray-600">Total time Viewing</div>
          <div className="text-lg font-bold">{userData?.totalViewing || 0}</div>
        </div>
      </div>
      
      <div className="mt-4 bg-blue-50 p-3 rounded text-center">
        <div className="text-xs text-gray-600">Total Msg sent</div>
        <div className="text-lg font-bold">{userData?.totalMessages || 0}</div>
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
