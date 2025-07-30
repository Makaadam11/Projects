'use client';

import React, { useState } from 'react';
import { UserRecord } from '@/app/types/dashboard';
import { formatTime as formatTimeUtil, TimeUnit } from '@/lib/time-utils';

interface EmotionTimelineSegmentsProps {
  messages: UserRecord[];
  userName?: string;
  className?: string;
  minuteFilter?: 1 | 5 | 10 | 30 | 60 | 'all'; // ✅ Dodaj minute filter prop
}

interface EmotionSegment {
  startTime: string;
  endTime: string;
  dominantEmotion: string;
  emotionValue: number;
  messagesInSegment: UserRecord[];
  duration: number; // in seconds
  intervalNumber: number; // Which interval this is (0, 1, 2, ...)
}

// ✅ Konfiguracja interwałów dla różnych filtrów
const INTERVAL_CONFIG = {
  1: { intervalSeconds: 1, totalIntervals: 30 },     // 1 min = 60 x 1s
  5: { intervalSeconds: 5, totalIntervals: 30 },     // 5 min = 60 x 5s
  10: { intervalSeconds: 10, totalIntervals: 30 },   // 10 min = 60 x 10s
  30: { intervalSeconds: 30, totalIntervals: 30 },   // 30 min = 60 x 30s
  60: { intervalSeconds: 60, totalIntervals: 30 },   // 60 min = 60 x 1min
  'all': { intervalSeconds: 100, totalIntervals: 50 } // all = 50 x 5min intervals
};

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

export default function EmotionTimelineSegments({ 
  messages, 
  userName = 'User', 
  className = '',
  minuteFilter = 'all'
}: EmotionTimelineSegmentsProps) {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('auto');

  // ✅ POPRAW - użyj WSZYSTKICH rekordów i sprawdź emocje w procesie
  const getRegularEmotionSegments = (): EmotionSegment[] => {
    console.log('Processing regular emotion segments for:', userName, 'Filter:', minuteFilter);
    console.log('Raw messages received:', messages.length);

    // ✅ Użyj WSZYSTKICH rekordów - nie filtruj na początku
    const allSortedMessages = messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    console.log('All sorted messages:', allSortedMessages.length);

    // ✅ Debug pierwszych rekordów - sprawdź format danych
    allSortedMessages.slice(0, 5).forEach((record, index) => {
      console.log(`Record ${index} debug:`, {
        timestamp: record.timestamp,
        username: record.username,
        status: record.status,
        message: record.complete_message?.substring(0, 20),
        emotions: {
          angry: record.angry,
          happy: record.happy,
          neutral: record.neutral,
          sad: record.sad
        },
        emotion_types: {
          angry_type: typeof record.angry,
          happy_type: typeof record.happy
        }
      });
    });

    // ✅ Użyj wszystkich rekordów - emocje będą sprawdzane w pętli
    const finalRecords = allSortedMessages;

    console.log('Final records to process:', finalRecords.length);

    if (finalRecords.length === 0) return [];

    // Pobierz konfigurację interwałów
    const config = INTERVAL_CONFIG[minuteFilter];
    const { intervalSeconds, totalIntervals } = config;

    // Znajdź zakres czasowy
    const firstTimestamp = new Date(finalRecords[0].timestamp).getTime();
    const lastTimestamp = new Date(finalRecords[finalRecords.length - 1].timestamp).getTime();
    
    // ✅ POPRAW - oblicz rzeczywistą długość rozmowy w sekundach
    const actualConversationDurationSeconds = Math.max(
      Math.ceil((lastTimestamp - firstTimestamp) / 1000),
      1 // Minimum 1 sekunda jeśli masz jakiekolwiek dane
    );
    
    // ✅ POPRAW - oblicz ile interwałów potrzeba dla rzeczywistej rozmowy
    const intervalsNeededForConversation = Math.max(
      Math.ceil(actualConversationDurationSeconds / intervalSeconds),
      1 // Minimum 1 interwał jeśli masz jakiekolwiek dane
    );
    
    // ✅ Użyj pełnej liczby interwałów z filtra, ale oznacz które są wypełnione
    const actualIntervals = totalIntervals;
    const filledIntervals = Math.min(intervalsNeededForConversation, totalIntervals);

    console.log('Timeline config:', {
      intervalSeconds,
      totalIntervals,
      actualConversationDurationSeconds,
      intervalsNeededForConversation,
      filledIntervals,
      actualIntervals,
      firstTime: finalRecords[0].timestamp,
      lastTime: finalRecords[finalRecords.length - 1].timestamp,
      duration: (lastTimestamp - firstTimestamp) / 1000,
      recordsCount: finalRecords.length
    });

    const segments: EmotionSegment[] = [];

    // Stwórz wszystkie interwały (wypełnione + puste)
    for (let i = 0; i < actualIntervals; i++) {
      const intervalStartMs = firstTimestamp + (i * intervalSeconds * 1000);
      const intervalEndMs = firstTimestamp + ((i + 1) * intervalSeconds * 1000);
      
      const intervalStart = new Date(intervalStartMs).toISOString();
      const intervalEnd = new Date(intervalEndMs).toISOString();

      // ✅ POPRAW - sprawdź czy ten interwał jest w zakresie rzeczywistej rozmowy
      // Jeśli masz jakiekolwiek dane, zawsze oznacz pierwszy interwał jako wypełniony
      const isWithinConversation = (i < filledIntervals) || (i === 0 && finalRecords.length > 0);
      
      let dominantEmotion = 'neutral';
      let maxEmotionValue = 0;
      const messagesInInterval: UserRecord[] = [];

      if (isWithinConversation) {
        // Znajdź wszystkie rekordy w tym interwale
        const recordsInInterval = finalRecords.filter(record => {
          const recordTime = new Date(record.timestamp).getTime();
          return recordTime >= intervalStartMs && recordTime < intervalEndMs;
        });

        // ✅ DEBUG - sprawdź co się dzieje z interwałami
        if (i < 5) {
          console.log(`Interval ${i} debug:`, {
            intervalStartMs,
            intervalEndMs,
            recordsInInterval: recordsInInterval.length,
            recordTimes: recordsInInterval.map(r => ({
              timestamp: r.timestamp,
              time: new Date(r.timestamp).getTime()
            }))
          });
        }

        // ✅ DODAJ wiadomości z tekstem niezależnie od emocji
        recordsInInterval.forEach(record => {
          if (record.complete_message && record.complete_message.trim().length > 0) {
            messagesInInterval.push(record);
          }
        });

        if (recordsInInterval.length > 0) {
          // ✅ POPRAW parsowanie emocji z formatem europejskim
          const totalEmotions = {
            happy: 0, sad: 0, neutral: 0, angry: 0, fear: 0, disgust: 0, surprise: 0
          };

          // ✅ Funkcja do parsowania europejskiego formatu
          const parseEuropeanEmotion = (value: any): number => {
            if (value === null || value === undefined || value === '') return 0;
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
              // Zamień przecinek na kropkę i usuń spacje
              const cleanValue = value.replace(',', '.').replace(/\s/g, '');
              const parsed = parseFloat(cleanValue);
              return isNaN(parsed) ? 0 : parsed;
            }
            return 0;
          };

          recordsInInterval.forEach(record => {
            // ✅ Parsuj z obsługą formatu europejskiego i konwertuj procenty na 0-1
            const angry = parseEuropeanEmotion(record.angry);
            const disgust = parseEuropeanEmotion(record.disgust);
            const fear = parseEuropeanEmotion(record.fear);
            const happy = parseEuropeanEmotion(record.happy);
            const sad = parseEuropeanEmotion(record.sad);
            const surprise = parseEuropeanEmotion(record.surprise);
            const neutral = parseEuropeanEmotion(record.neutral);

            // ✅ DEBUG - zobacz surowe i parsowane wartości
            if (i < 3) {
              console.log(`Interval ${i} record emotion parsing:`, {
                record_timestamp: record.timestamp,
                raw_emotions: {
                  angry: record.angry,
                  happy: record.happy,
                  neutral: record.neutral
                },
                parsed_emotions: {
                  angry,
                  happy,
                  neutral
                }
              });
            }

            // Konwertuj z procentów na wartości 0-1 jeśli potrzeba
            totalEmotions.angry += angry > 1 ? angry / 100 : angry;
            totalEmotions.disgust += disgust > 1 ? disgust / 100 : disgust;
            totalEmotions.fear += fear > 1 ? fear / 100 : fear;
            totalEmotions.happy += happy > 1 ? happy / 100 : happy;
            totalEmotions.sad += sad > 1 ? sad / 100 : sad;
            totalEmotions.surprise += surprise > 1 ? surprise / 100 : surprise;
            totalEmotions.neutral += neutral > 1 ? neutral / 100 : neutral;
          });

          // Debug dla pierwszych interwałów
          if (i < 3) {
            console.log(`Interval ${i} emotions:`, totalEmotions);
          }

          // Znajdź dominującą emocję
          const dominantEmotionResult = Object.entries(totalEmotions)
            .reduce((max, [emotion, value]) => 
              value > max.value ? { emotion, value } : max, 
              { emotion: 'neutral', value: 0 }
            );

          dominantEmotion = dominantEmotionResult.emotion;
          maxEmotionValue = dominantEmotionResult.value;

          // ✅ Jeśli suma emocji bardzo mała ale są dane - ustaw minimum
          if (maxEmotionValue < 0.001 && recordsInInterval.length > 0) {
            dominantEmotion = 'neutral';
            maxEmotionValue = 0.001; // Ustaw minimum żeby segment był widoczny
          }
        }
      }

      segments.push({
        startTime: intervalStart,
        endTime: intervalEnd,
        dominantEmotion: isWithinConversation ? dominantEmotion : 'empty',
        emotionValue: maxEmotionValue,
        messagesInSegment: messagesInInterval,
        duration: intervalSeconds,
        intervalNumber: i,
        isEmpty: !isWithinConversation
      } as EmotionSegment & { isEmpty: boolean });
    }

    console.log('Generated regular segments:', segments.length, 'Filled:', filledIntervals);
    console.log('Segments with messages:', segments.filter(s => s.messagesInSegment.length > 0).length);
    console.log('Segments with emotions > 0:', segments.filter(s => s.emotionValue > 0).length);
    console.log('Sample segments:', segments.slice(0, 5).map(s => ({
      interval: s.intervalNumber,
      emotion: s.dominantEmotion,
      value: s.emotionValue,
      messages: s.messagesInSegment.length,
      isEmpty: (s as any).isEmpty
    })));
    
    return segments;
  };

  const getSegmentColor = (segment: EmotionSegment & { isEmpty?: boolean }) => {
    if (segment.isEmpty) {
      return '#F3F4F6'; // Szary dla pustych interwałów
    }
    return EMOTION_COLORS[segment.dominantEmotion as keyof typeof EMOTION_COLORS] || '#6B7280';
  };

  // ✅ Poprawi formatowanie label dla małych interwałów
  const formatIntervalLabel = (intervalNumber: number): string => {
    const config = INTERVAL_CONFIG[minuteFilter];
    const totalSeconds = intervalNumber * config.intervalSeconds;
    
    if (config.intervalSeconds === 1) {
      // ✅ Dla 1-sekundowych interwałów, pokaż co 5 sekund + pierwszy i ostatni
      if (totalSeconds % 5 === 0 || totalSeconds === 1 || totalSeconds === config.totalIntervals - 1) {
        return `${totalSeconds}s`;
      }
      return '';
    } else if (config.intervalSeconds <= 5) {
      // Dla 5s interwałów, pokaż co 25s (co 5 interwałów)
      if (intervalNumber % 5 === 0 || intervalNumber === config.totalIntervals - 1) {
        return totalSeconds < 60 ? `${totalSeconds}s` : `${Math.floor(totalSeconds/60)}m ${totalSeconds%60}s`;
      }
      return '';
    } else if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    } else if (totalSeconds < 3600) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const timeOptions: { value: TimeUnit; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'seconds', label: 'Seconds' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' }
  ];

  const emotionSegments = getRegularEmotionSegments();

  // ✅ POPRAW - sprawdź czy są jakiekolwiek segmenty z danymi
  const hasAnyData = emotionSegments.length > 0 && (
    emotionSegments.some(s => !(s as any).isEmpty) || 
    emotionSegments.some(s => s.emotionValue > 0) ||
    emotionSegments.some(s => s.messagesInSegment.length > 0)
  );

  if (!hasAnyData) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Emotion Timeline Segments - {userName}</h3>
        <div className="text-gray-500 space-y-2">
          <p>No emotion data available</p>
          <div className="text-sm bg-gray-50 p-3 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Total records: {messages.length}</p>
            <p>With complete_message: {messages.filter(m => m.complete_message?.trim()).length}</p>
            <p>Minute filter: {minuteFilter} ({INTERVAL_CONFIG[minuteFilter].intervalSeconds}s intervals)</p>
            <p>Generated segments: {emotionSegments.length}</p>
            <p>Non-empty segments: {emotionSegments.filter((s: any) => !s.isEmpty).length}</p>
            <p>Segments with emotions: {emotionSegments.filter(s => s.emotionValue > 0).length}</p>
            <p>Sample segment data:</p>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(
                emotionSegments.slice(0, 3).map((s: any) => ({
                  interval: s.intervalNumber,
                  emotion: s.dominantEmotion,
                  value: s.emotionValue,
                  isEmpty: s.isEmpty,
                  messages: s.messagesInSegment.length
                })), 
                null, 
                2
              )}
            </pre>
            <p>Sample raw messages:</p>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(
                messages.slice(0, 2).map(m => ({
                  timestamp: m.timestamp,
                  message: m.complete_message?.substring(0, 20),
                  emotions: {
                    angry: m.angry,
                    happy: m.happy,
                    neutral: m.neutral
                  }
                })), 
                null, 
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Emotion Timeline - {userName}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({INTERVAL_CONFIG[minuteFilter].intervalSeconds}s intervals, {minuteFilter === 'all' ? 'all' : `${minuteFilter} min`} view)
          </span>
        </h3>
        
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
      
      {/* Timeline z pustymi interwałami */}
      <div className="mb-6">
        <div className="flex h-20 border border-gray-200 rounded overflow-hidden">
          {emotionSegments.map((segment: EmotionSegment & { isEmpty?: boolean }, index) => {
            const widthPercent = 100 / emotionSegments.length;
            const segmentColor = getSegmentColor(segment);
            
            return (
              <div
                key={index}
                className={`transition-all border-r border-white ${
                  segment.isEmpty 
                    ? 'cursor-default opacity-50' 
                    : `cursor-pointer hover:opacity-80 ${selectedSegment === index ? 'ring-2 ring-blue-500' : ''}`
                }`}
                style={{
                  width: `${Math.max(widthPercent, 0.5)}%`,
                  backgroundColor: segmentColor,
                  minWidth: '2px'
                }}
                onClick={() => !segment.isEmpty && setSelectedSegment(selectedSegment === index ? null : index)}
                title={segment.isEmpty 
                  ? `Empty interval (${formatIntervalLabel(segment.intervalNumber)})`
                  : `${EMOTION_LABELS[segment.dominantEmotion as keyof typeof EMOTION_LABELS]} (${formatIntervalLabel(segment.intervalNumber)})`
                }
              >
                {!segment.isEmpty && (
                  <div className="h-full flex flex-col justify-center items-center text-white text-xs font-medium p-1">
                    <div className="truncate w-full text-center text-xs">
                      {EMOTION_LABELS[segment.dominantEmotion as keyof typeof EMOTION_LABELS]?.substring(0, 3)}
                    </div>
                    {INTERVAL_CONFIG[minuteFilter].intervalSeconds >= 5 && (
                      <div className="text-xs opacity-90">
                        {formatTimeUtil(segment.duration, timeUnit)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ✅ POPRAW - Interval Labels co 5 jednostek */}
        <div className="flex mt-2 text-xs text-gray-500 overflow-x-auto">
          {emotionSegments.map((segment, index) => {
            const widthPercent = 100 / emotionSegments.length;
            const label = formatIntervalLabel(segment.intervalNumber);
            
            return (
              <div 
                key={index} 
                style={{ width: `${Math.max(widthPercent, 0.5)}%`, minWidth: '2px' }} 
                className="text-center border-r border-gray-200 pr-1 flex-shrink-0"
              >
                {label && (
                  <div className="truncate text-xs" style={{ fontSize: '10px' }}>{label}</div>
                )}
                {index === emotionSegments.length - 1 && (
                  <div className="text-xs text-gray-400" style={{ fontSize: '10px' }}>
                    {formatIntervalLabel(segment.intervalNumber + 1) || `${(segment.intervalNumber + 1) * INTERVAL_CONFIG[minuteFilter].intervalSeconds}s`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Segment Details - tylko dla wypełnionych */}
      {selectedSegment !== null && emotionSegments[selectedSegment] && !(emotionSegments[selectedSegment] as any).isEmpty && (
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
              Interval: {formatIntervalLabel(emotionSegments[selectedSegment].intervalNumber)} - {formatIntervalLabel(emotionSegments[selectedSegment].intervalNumber + 1)}
              ({formatTimeUtil(emotionSegments[selectedSegment].duration, timeUnit)})
            </span>
          </div>

          {/* Messages in this interval */}
          <div className="space-y-2">
            <div className="font-medium text-sm text-gray-700">
              Messages in this interval ({emotionSegments[selectedSegment].messagesInSegment.length}):
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
                No text messages in this interval
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Summary Stats z informacją o wypełnieniu */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="font-semibold text-lg">{emotionSegments.filter((s: any) => !s.isEmpty).length}</div>
          <div className="text-gray-600">Filled Intervals</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="font-semibold text-lg">
            {formatTimeUtil(INTERVAL_CONFIG[minuteFilter].intervalSeconds, timeUnit)}
          </div>
          <div className="text-gray-600">Per Interval</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="font-semibold text-lg" title={`${emotionSegments.filter((s: any) => !s.isEmpty).reduce((sum, s) => sum + s.duration, 0)}s`}>
            {formatTimeUtil(emotionSegments.filter((s: any) => !s.isEmpty).reduce((sum, s) => sum + s.duration, 0), timeUnit)}
          </div>
          <div className="text-gray-600">Conversation Time</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="font-semibold text-lg">
            {emotionSegments.reduce((sum, s) => sum + s.messagesInSegment.length, 0)}
          </div>
          <div className="text-gray-600">Messages</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="text-sm font-medium text-gray-700 w-full mb-2">Emotion Legend:</div>
        {Object.entries(EMOTION_LABELS).map(([emotion, label]) => (
          <div key={emotion} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] }}
            />
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
        {/* ✅ Dodaj legendę dla pustych interwałów */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-300" />
          <span className="text-sm text-gray-600">No Data</span>
        </div>
      </div>
    </div>
  );
}