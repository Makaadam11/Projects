'use client';
import React, { useMemo, useState } from 'react';
import { SessionData, UserRecord } from '@/app/types/dashboard';

const EMOTION_COLORS: Record<string, string> = {
  neutral: '#3B82F6',
  friendly: '#10B981',
  aggression: '#EF4444',
  none: '#D1D5DB'
};

const SENTIMENT_LABELS: Record<string, string> = {
  friendly: 'Friendly',
  neutral: 'Neutral',
  aggression: 'Aggression',
  none: 'None'
};

interface EmotionTimelineProps {
  name: string;
  data: SessionData[];
  className?: string;
  minuteFilter?: 1 | 5 | 10 | 30 | 60 | 'all';
}

interface MessageEmotionPoint {
  timestamp: number;
  record: UserRecord;
  dominantEmotion: string;
  dominantValue: number;
  isPartner: boolean;
}

interface Segment {
  start: number;
  end: number;
  durationMs: number;
  dominantEmotion: string;
  messages: UserRecord[];
  isEmpty: boolean;
}

export default function SentimentTimelineSegments({
  name,
  data,
  className = '',
  minuteFilter = 'all'
}: EmotionTimelineProps) {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  // const [segmentMinutes, setSegmentMinutes] = useState<number>(1);
  const [segmentSeconds, setSegmentSeconds] = useState<number>(60); // stabilne, całkowite wartości

  const session = data.find(s => s.users.some(u => u.name === name));

  const rawPoints: MessageEmotionPoint[] = useMemo(() => {
    if (!session) return [];
    const msgs = session.messages.filter(m => m.username === name || m.partner_name === name);
    if (!msgs.length) return [];
    const sorted = [...msgs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    return sorted.map(rec => {
      const partnerSide = rec.partner_name === name && rec.partner_name !== rec.username;
      const emotionsRaw = {
        neutral: partnerSide ? rec.partner_sentiment_neu : rec.sentiment_neu,
        friendly: partnerSide ? rec.partner_sentiment_pos : rec.sentiment_pos,
        aggression: partnerSide ? rec.partner_sentiment_neg : rec.sentiment_neg
      };
      let bestEmotion = 'none';
      let bestValue = -1;
      Object.entries(emotionsRaw).forEach(([k, v]) => {
        let num = 0;
        if (typeof v === 'number') num = v;
        else if (typeof v === 'string') {
          const parsed = parseFloat(v.replace(',', '.').trim());
          if (!isNaN(parsed)) num = parsed;
        }
        if (num > 1) num = num / 100;
        if (num > bestValue) {
          bestValue = num;
          bestEmotion = k;
        }
      });
      if (bestValue <= 0) {
        bestEmotion = 'none';
        bestValue = 0;
      }
      return {
        timestamp: new Date(rec.timestamp).getTime(),
        record: rec,
        dominantEmotion: bestEmotion,
        dominantValue: bestValue,
        isPartner: partnerSide
      };
    });
  }, [session, name]);

  const timelineConfig = useMemo(() => {
    if (!rawPoints.length) return null;
    const startTs = rawPoints[0].timestamp;
    const lastDataTs = rawPoints[rawPoints.length - 1].timestamp;
    let windowMinutes: number;
    if (minuteFilter === 'all') {
      windowMinutes = Math.max(1, Math.ceil((lastDataTs - startTs) / 60000) || 1);
    } else {
      windowMinutes = minuteFilter;
    }
    const endTs =
      minuteFilter === 'all'
        ? startTs + windowMinutes * 60 * 1000
        : startTs + windowMinutes * 60 * 1000;
    return { startTs, endTs, windowMinutes, lastDataTs };
  }, [rawPoints, minuteFilter]);

  const segments: Segment[] = useMemo(() => {
    if (!timelineConfig) return [];
    const { startTs, endTs } = timelineConfig;
    const segLenMs = segmentSeconds * 1000; // dokładny ms bez błędów float
    const totalMs = endTs - startTs;
    const bucketCount = Math.max(1, Math.ceil(totalMs / segLenMs));
    const segs: Segment[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const segStart = startTs + i * segLenMs;
      const segEnd = Math.min(segStart + segLenMs, endTs);
      const msgs = rawPoints.filter(p => p.timestamp >= segStart && p.timestamp < segEnd);
      if (!msgs.length) {
        segs.push({
          start: segStart,
          end: segEnd,
          durationMs: segEnd - segStart,
          dominantEmotion: 'none',
          messages: [],
          isEmpty: true
        });
        continue;
      }
      const totals: Record<string, number> = {
        neutral: 0, friendly: 0, aggression: 0
      };
      msgs.forEach(mp => {
        const rec = mp.record;
        const partnerSide = rec.partner_name === name && rec.partner_name !== rec.username;
        const emoVals: Record<string, any> = {
          neutral: partnerSide ? rec.sentiment_neu : rec.sentiment_neu,
          friendly: partnerSide ? rec.sentiment_pos : rec.sentiment_pos,
          aggression: partnerSide ? rec.sentiment_neg : rec.sentiment_neg
        };
        Object.entries(emoVals).forEach(([k, v]) => {
          let num = 0;
            if (typeof v === 'number') num = v;
          else if (typeof v === 'string') {
            const parsed = parseFloat(v.replace(',', '.').trim());
            if (!isNaN(parsed)) num = parsed;
          }
          if (num > 1) num = num / 100;
          totals[k] += num;
        });
      });
      let dom: { emo: string; val: number } = { emo: 'none', val: -1 };
      Object.entries(totals).forEach(([k, v]) => { if (v > dom.val) dom = { emo: k, val: v }; });
      if (dom.val <= 0) dom.emo = 'none';
      segs.push({
        start: segStart,
        end: segEnd,
        durationMs: segEnd - segStart,
        dominantEmotion: dom.emo,
        messages: msgs.map(m => m.record),
        isEmpty: msgs.length === 0
      });
    }
    return segs;
  }, [rawPoints, timelineConfig, segmentSeconds, name]);

  const axisTicks = useMemo(() => {
    if (!timelineConfig) return [];
    const { startTs, endTs, windowMinutes } = timelineConfig;
    let stepSeconds = 5;

    if (windowMinutes <= 1) {
      stepSeconds = 5; // 12 ticks for 1 min (every 5s)
    } else if (windowMinutes <= 5) {
      stepSeconds = 30; // 10 ticks for 5 min (every 30s)
    } else if (windowMinutes <= 10) {
      stepSeconds = 60; // 10 ticks for 10 min (every 1m)
    } else if (windowMinutes <= 30) {
      stepSeconds = 180; // every 3m
    } else if (windowMinutes <= 60) {
      stepSeconds = 300; // every 5m
    } else {
      stepSeconds = Math.ceil((windowMinutes * 60) / 12); // ~12 ticks
    }

    const ticks: { posPct: number; label: string }[] = [];
    const totalSeconds = Math.round((endTs - startTs) / 1000);
    for (let s = 0; s <= totalSeconds; s += stepSeconds) {
      const ts = startTs + s * 1000;
      const posPct = ((ts - startTs) / (endTs - startTs || 1)) * 100;
      let label: string;
      if (totalSeconds >= 3600) {
        const date = new Date(ts);
        label = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        label = `${min}:${sec.toString().padStart(2, '0')}`;
      }
      ticks.push({ posPct, label });
    }
    return ticks;
  }, [timelineConfig]);

  const formatFullTime = (ms: number) =>
    new Date(ms).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

  if (!timelineConfig) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Emotion Timeline - {name}</h3>
        <div className="text-gray-500 text-sm">No data</div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Emotion Timeline - {name}
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Segment</label>
          <select
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
            value={segmentSeconds}
            onChange={e => {
              setSelectedSegment(null);
              setSegmentSeconds(parseInt(e.target.value, 10));
            }}
          >
            <optgroup label="Seconds">
              <option value={1}>1s</option>
              <option value={2}>2s</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
              <option value={20}>20s</option>
              <option value={30}>30s</option>
              <option value={45}>45s</option>
              <option value={60}>60s</option>
            </optgroup>
            <optgroup label="Minutes">
              <option value={120}>2m</option>
              <option value={300}>5m</option>
              <option value={600}>10m</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex h-20 border border-gray-200 rounded overflow-hidden">
          {segments.map((s, i) => {
            const widthPct = +(
              ((s.end - s.start) /
                (timelineConfig.endTs - timelineConfig.startTs || 1)) *
              100
            ).toFixed(4); // stabilizacja szerokości
            return (
              <div
                key={`${s.start}-${s.end}`} // stabilny klucz
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: EMOTION_COLORS[s.dominantEmotion],
                  minWidth: '1px',
                  transition: 'width 120ms linear, background-color 120ms linear'
                }}
                className={`relative cursor-pointer ${
                  selectedSegment === i ? 'ring-2 ring-blue-500 z-10' : ''
                } ${s.dominantEmotion === 'none' ? 'opacity-50' : 'hover:opacity-80'}`}
                onClick={() =>
                  setSelectedSegment(selectedSegment === i ? null : i)
                }
                title={`${formatFullTime(s.start)} - ${formatFullTime(
                  s.end
                )} ${SENTIMENT_LABELS[s.dominantEmotion]} (${Math.round(
                  s.durationMs / 1000
                )}s)`}
              >
                {s.dominantEmotion !== 'none' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-white font-semibold select-none">
                      {SENTIMENT_LABELS[s.dominantEmotion].slice(0, 3)}
                    </span>
                  </div>
                )}
                {s.dominantEmotion === 'none' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-gray-700 font-semibold select-none">
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="relative mt-4 h-4">
          {axisTicks.map((t, idx) => (

            <div
              key={idx}
              className="absolute top-0 -translate-x-1/2 text-[10px] text-gray-500"
              style={{ left: `${t.posPct}%` }}
            >
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {selectedSegment !== null && segments[selectedSegment] && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div
              className="w-6 h-6 rounded"
              style={{
                backgroundColor:
                  EMOTION_COLORS[segments[selectedSegment].dominantEmotion]
              }}
            />
            <h4 className="font-semibold">
              {SENTIMENT_LABELS[segments[selectedSegment].dominantEmotion]}
            </h4>
            <span className="text-sm text-gray-600">
              {formatFullTime(segments[selectedSegment].start)} -{' '}
              {formatFullTime(segments[selectedSegment].end)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
              {Math.round(segments[selectedSegment].durationMs / 1000)}s
            </span>
          </div>
          {segments[selectedSegment].dominantEmotion === 'none' && (
            <div className="text-xs text-gray-600">
              No data in this timeframe.
            </div>
          )}
          {segments[selectedSegment].dominantEmotion !== 'none' && (
            <div className="space-y-2">
              {segments[selectedSegment].messages.map((m, mi) => (
                <div key={mi} className="bg-white p-3 rounded border text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-700">
                      {formatFullTime(new Date(m.timestamp).getTime())}
                    </span>
                    <span className="text-gray-500">{m.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-600 mb-1">
                    <span>Neutral: {m.sentiment_neu ?? m.partner_sentiment_neu ?? 0}</span>
                    <span>Friendly: {m.sentiment_pos ?? m.partner_sentiment_pos ?? 0}</span>
                    <span>Aggression: {m.sentiment_neg ?? m.partner_sentiment_neg ?? 0}</span>
                  </div>
                  {m.complete_message && (
                    <div className="text-gray-700">
                      <strong>Message:</strong> {m.complete_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="font-semibold text-lg">{segments.length}</div>
          <div className="text-gray-600">Segments</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="font-semibold text-lg">
            {timelineConfig.windowMinutes}m
          </div>
          <div className="text-gray-600">Window</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="font-semibold text-lg">
            {
              Object.entries(
                segments.reduce((acc, s) => {
                  if (s.dominantEmotion !== 'none') {
                    acc[s.dominantEmotion] = (acc[s.dominantEmotion] || 0) + 1;
                  }

                  return acc;
                }, {} as Record<string, number>)
              ).sort((a, b) => b[1] - a[1])[0]?.[0]
            }
          </div>
          <div className="text-gray-600">Most Frequent</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="text-sm font-medium text-gray-700 w-full mb-2">Legend</div>
        {Object.entries(SENTIMENT_LABELS).map(([k, label]) => (
          <div key={k} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: EMOTION_COLORS[k] }}
            />
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}