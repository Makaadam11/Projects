'use client';

import React, { useState } from 'react';
import { UserRecord } from '@/app/types/dashboard';

interface EmotionTimelineSegmentsProps {
  messages: UserRecord[];
  userName?: string;
  className?: string;
}

interface EmotionSegment {
  startTime: string;
  endTime: string;
  dominantEmotion: string;
  emotionValue: number;
  messagesInSegment: UserRecord[];
  duration: number; // in minutes
}

const EMOTION_COLORS = {
  happy: '#FCD34D',
  sad: '#3B82F6',
  neutral: '#10B981',
  angry: '#EF4444',
  fear: '#8B5CF6',
  disgust: '#F97316',
  surprise: '#EC4899'
};

const EMOTION_LABELS = {
  happy: 'Happy',
  sad: 'Sad',
  neutral: 'Neutral',
  angry: 'Angry',
  fear: 'Afraid',
  disgust: 'Disgusted',
  surprise: 'Surprised'
};

export default function EmotionTimelineSegments({ messages, userName = 'User', className = '' }: EmotionTimelineSegmentsProps) {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  // ✅ Get all records with emotions chronologically
  const getEmotionSegments = (): EmotionSegment[] => {
    // Filter and sort all records with emotion data chronologically
    const recordsWithEmotions = messages
      .filter(record => {
        const emotionsSum = (record.angry || 0) + (record.disgust || 0) + (record.fear || 0) + 
                           (record.happy || 0) + (record.sad || 0) + (record.surprise || 0) + (record.neutral || 0);
        return emotionsSum > 0;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (recordsWithEmotions.length === 0) return [];

    const segments: EmotionSegment[] = [];
    let currentSegment: EmotionSegment | null = null;

    recordsWithEmotions.forEach((record, index) => {
      // Find dominant emotion for this record
      const emotions = {
        happy: record.happy || 0,
        sad: record.sad || 0,
        neutral: record.neutral || 0,
        angry: record.angry || 0,
        fear: record.fear || 0,
        disgust: record.disgust || 0,
        surprise: record.surprise || 0
      };

      const dominantEmotion = Object.entries(emotions)
        .reduce((max, [emotion, value]) => 
          value > max.value ? { emotion, value } : max, 
          { emotion: 'neutral', value: 0 }
        );

      // Check if this is a new segment (different dominant emotion)
      if (!currentSegment || currentSegment.dominantEmotion !== dominantEmotion.emotion) {
        // End previous segment
        if (currentSegment) {
          currentSegment.endTime = record.timestamp;
          currentSegment.duration = calculateDuration(currentSegment.startTime, currentSegment.endTime);
          segments.push(currentSegment);
        }

        // Start new segment
        currentSegment = {
          startTime: record.timestamp,
          endTime: record.timestamp,
          dominantEmotion: dominantEmotion.emotion,
          emotionValue: dominantEmotion.value,
          messagesInSegment: [],
          duration: 0
        };
      }

      // Add message to current segment (if it has text)
      if (record.complete_message && record.complete_message.trim().length > 0) {
        currentSegment.messagesInSegment.push(record);
      }

      // Update emotion value (max)
      currentSegment.emotionValue = Math.max(currentSegment.emotionValue, dominantEmotion.value);
    });

    // Add last segment
    if (currentSegment) {
      currentSegment.endTime = recordsWithEmotions[recordsWithEmotions.length - 1].timestamp;
      currentSegment.duration = calculateDuration(currentSegment.startTime, currentSegment.endTime);
      segments.push(currentSegment);
    }

    return segments;
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.round((end - start) / (1000 * 60)); // in minutes
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const emotionSegments = getEmotionSegments();

  if (emotionSegments.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Emotion Segments - {userName}</h3>
        <div className="text-gray-500 space-y-2">
          <p>No emotion data available</p>
          <div className="text-sm bg-gray-50 p-3 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Total records: {messages.length}</p>
            <p>With complete_message: {messages.filter(m => m.complete_message?.trim()).length}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Emotion Segments Over Time - {userName}</h3>
      
      {/* ✅ Timeline Segments */}
      <div className="mb-6">
        <div className="flex h-20 border border-gray-200 rounded overflow-hidden">
          {emotionSegments.map((segment, index) => {
            const widthPercent = emotionSegments.length > 1 
              ? (segment.duration / emotionSegments.reduce((sum, s) => sum + s.duration, 0)) * 100 
              : 100;
            
            return (
              <div
                key={index}
                className={`cursor-pointer transition-all hover:opacity-80 border-r border-white ${
                  selectedSegment === index ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  width: `${Math.max(widthPercent, 5)}%`,
                  backgroundColor: EMOTION_COLORS[segment.dominantEmotion as keyof typeof EMOTION_COLORS] || '#6B7280',
                  minWidth: '30px'
                }}
                onClick={() => setSelectedSegment(selectedSegment === index ? null : index)}
                title={`${EMOTION_LABELS[segment.dominantEmotion as keyof typeof EMOTION_LABELS]} (${segment.duration} min)`}
              >
                <div className="h-full flex flex-col justify-center items-center text-white text-xs font-medium p-1">
                  <div className="truncate w-full text-center">
                    {EMOTION_LABELS[segment.dominantEmotion as keyof typeof EMOTION_LABELS]}
                  </div>
                  <div className="text-xs opacity-90">
                    {segment.duration}min
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ Time Labels */}
        <div className="flex mt-2 text-xs text-gray-500">
          {emotionSegments.map((segment, index) => {
            const widthPercent = emotionSegments.length > 1 
              ? (segment.duration / emotionSegments.reduce((sum, s) => sum + s.duration, 0)) * 100 
              : 100;
            
            return (
              <div key={index} style={{ width: `${Math.max(widthPercent, 5)}%`, minWidth: '30px' }} className="text-center border-r border-gray-200 pr-1">
                <div>{formatTime(segment.startTime)}</div>
                {index === emotionSegments.length - 1 && (
                  <div className="text-xs text-gray-400">{formatTime(segment.endTime)}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Selected Segment Details */}
      {selectedSegment !== null && emotionSegments[selectedSegment] && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: EMOTION_COLORS[emotionSegments[selectedSegment].dominantEmotion as keyof typeof EMOTION_COLORS] }}
            />
            <h4 className="font-semibold">
              {EMOTION_LABELS[emotionSegments[selectedSegment].dominantEmotion as keyof typeof EMOTION_LABELS]}
            </h4>
            <span className="text-sm text-gray-600">
              {formatTime(emotionSegments[selectedSegment].startTime)} - {formatTime(emotionSegments[selectedSegment].endTime)}
              ({emotionSegments[selectedSegment].duration} minutes)
            </span>
          </div>

          {/* ✅ Messages in this emotion segment */}
          <div className="space-y-2">
            <div className="font-medium text-sm text-gray-700">
              Messages in this segment ({emotionSegments[selectedSegment].messagesInSegment.length}):
            </div>
            {emotionSegments[selectedSegment].messagesInSegment.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {emotionSegments[selectedSegment].messagesInSegment.map((msg, msgIndex) => (
                  <div key={msgIndex} className="bg-white p-3 rounded border text-sm">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-medium text-gray-600">{formatTime(msg.timestamp)}</span>
                      <span className="text-xs text-gray-500">
                        {msg.status === 'sender' ? 'Sent' : 'Received'}
                      </span>
                    </div>
                    <div className="text-gray-800">
                      {msg.complete_message}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">
                No text messages in this segment
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="font-semibold text-lg">{emotionSegments.length}</div>
          <div className="text-gray-600">Segments</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="font-semibold text-lg">
            {emotionSegments.reduce((sum, s) => sum + s.duration, 0)}min
          </div>
          <div className="text-gray-600">Total time</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="font-semibold text-lg">
            {emotionSegments.reduce((sum, s) => sum + s.messagesInSegment.length, 0)}
          </div>
          <div className="text-gray-600">Messages</div>
        </div>
      </div>

      {/* ✅ Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="text-sm font-medium text-gray-700 w-full mb-2">Emotion legend:</div>
        {Object.entries(EMOTION_LABELS).map(([emotion, label]) => (
          <div key={emotion} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] }}
            />
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
