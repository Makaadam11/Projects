'use client';
import React, { useMemo, useState, useEffect } from 'react';
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
  totals: { friendly: number; neutral: number; aggression: number };
  percents: { friendly: number; neutral: number; aggression: number };
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
  const [segmentSeconds, setSegmentSeconds] = useState<number>(60);

  const session = data.find(s => s.users.some(u => u.name === name));

  // pomocnicze: pobierz wartości sentymentu z właściwych pól (user vs partner_*)
  const getSentVals = (rec: UserRecord): { friendly: number; neutral: number; aggression: number } => {
    const partnerSide = rec.partner_name === name && rec.partner_name !== rec.username;

    const pickNum = (v: unknown): number => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const parsed = parseFloat(v.replace(',', '.').trim());
        if (!isNaN(parsed)) return parsed;
      }
      return 0;
    };

    // pola: pos=friendly, neu=neutral, neg=aggression
    const friendly = pickNum(partnerSide ? rec.partner_sentiment_pos : rec.sentiment_pos);
    const neutral = pickNum(partnerSide ? rec.partner_sentiment_neu : rec.sentiment_neu);
    const aggression = pickNum(partnerSide ? rec.partner_sentiment_neg : rec.sentiment_neg);

    // normalizacja gdy przyjdzie 0..100
    const norm = (x: number) => (x > 1 ? x / 100 : x);

    return {
      friendly: norm(friendly),
      neutral: norm(neutral),
      aggression: norm(aggression)
    };
  };

  const rawPoints: MessageEmotionPoint[] = useMemo(() => {
    if (!session) return [];
    const msgs = session.messages.filter(m => m.username === name || m.partner_name === name);
    if (!msgs.length) return [];
    const sorted = [...msgs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    return sorted.map(rec => {
      const partnerSide = rec.partner_name === name && rec.partner_name !== rec.username;
      const vals = getSentVals(rec);
      // dominanta tylko pomocniczo, do statystyk
      let bestEmotion = 'none';
      let bestValue = -1;
      Object.entries(vals).forEach(([k, v]) => {
        if (v > bestValue) {
          bestValue = v;
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
    const endTs = startTs + windowMinutes * 60 * 1000;
    return { startTs, endTs, windowMinutes, lastDataTs };
  }, [rawPoints, minuteFilter]);

  const segments: Segment[] = useMemo(() => {
    if (!timelineConfig) return [];
    const { startTs, endTs } = timelineConfig;
    const segLenMs = segmentSeconds * 1000;
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
          totals: { friendly: 0, neutral: 0, aggression: 0 },
          percents: { friendly: 0, neutral: 0, aggression: 0 },
          dominantEmotion: 'none',
          messages: [],
          isEmpty: true
        });
        continue;
      }

      // sumuj wartości pos/neu/neg dla wiadomości w segmencie
      const totals = msgs.reduce(
        (acc, mp) => {
          const v = getSentVals(mp.record);
          acc.friendly += v.friendly;
          acc.neutral += v.neutral;
          acc.aggression += v.aggression;
          return acc;
        },
        { friendly: 0, neutral: 0, aggression: 0 }
      );

      const sum = totals.friendly + totals.neutral + totals.aggression;
      const percents =
        sum > 0
          ? {
              friendly: (totals.friendly / sum) * 100,
              neutral: (totals.neutral / sum) * 100,
              aggression: (totals.aggression / sum) * 100
            }
          : { friendly: 0, neutral: 0, aggression: 0 };

      // dominanta pomocniczo do statystyki
      let dom: { emo: string; val: number } = { emo: 'none', val: -1 };
      (['friendly', 'neutral', 'aggression'] as const).forEach(k => {
        if (totals[k] > dom.val) dom = { emo: k, val: totals[k] };
      });
      if (dom.val <= 0) dom.emo = 'none';

      segs.push({
        start: segStart,
        end: segEnd,
        durationMs: segEnd - segStart,
        totals,
        percents,
        dominantEmotion: dom.emo,
        messages: msgs.map(m => m.record),
        isEmpty: false
      });
    }
    return segs;
  }, [rawPoints, timelineConfig, segmentSeconds, name]);

  const axisTicks = useMemo(() => {
    if (!timelineConfig) return [];
    const { startTs, endTs, windowMinutes } = timelineConfig;
    let stepSeconds = 5;

    if (windowMinutes <= 1) stepSeconds = 5;
    else if (windowMinutes <= 5) stepSeconds = 30;
    else if (windowMinutes <= 10) stepSeconds = 60;
    else if (windowMinutes <= 30) stepSeconds = 180;
    else if (windowMinutes <= 60) stepSeconds = 300;
    else stepSeconds = Math.ceil((windowMinutes * 60) / 12);

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
        <h3 className="text-lg font-semibold mb-4">Sentiment Timeline - {name}</h3>
        <div className="text-gray-500 text-sm">No data</div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Sentiment Timeline - {name}</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Segment</label>
          <select
            title='Select segment duration'
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
              ((s.end - s.start) / (timelineConfig.endTs - timelineConfig.startTs || 1)) * 100
            ).toFixed(4);

            const pF = Math.round(s.percents.friendly);
            const pN = Math.round(s.percents.neutral);
            const pA = Math.round(s.percents.aggression);

            const title = `${formatFullTime(s.start)} - ${formatFullTime(s.end)} Friendly: ${pF}%, Neutral: ${pN}%, Aggression: ${pA}% (${Math.round(s.durationMs / 1000)}s)`;

            return (
              <div
                key={`${s.start}-${s.end}`}
                style={{ width: `${widthPct}%`, minWidth: '0.5px' }}
                className={`relative cursor-pointer transition-[width,background-color] duration-150
                  ${selectedSegment === i ? 'ring-2 ring-black-500 z-10' : ''}`}  // separator między segmentami
                onClick={() => setSelectedSegment(selectedSegment === i ? null : i)}
                title={title}
              >
                {/* Trzy pionowe słupki w segmencie (wysokość = procent) */}
                <div className="absolute inset-0 flex flex-col">
                  <div
                    style={{ height: `${s.percents.friendly}%`, width: '100%', backgroundColor: EMOTION_COLORS.friendly }}
                    className={`${pF === 0 ? 'opacity-30' : ''}`}
                    aria-label={`Friendly ${pF}%`}
                  />
                  <div
                    style={{ height: `${s.percents.neutral}%`, width: '100%', backgroundColor: EMOTION_COLORS.neutral }}
                    className={`${pN === 0 ? 'opacity-30' : ''}`}
                    aria-label={`Neutral ${pN}%`}
                  />
                  <div
                    style={{ height: `${s.percents.aggression}%`, width: '100%', backgroundColor: EMOTION_COLORS.aggression }}
                    className={`${pA === 0 ? 'opacity-30' : ''}`}
                    aria-label={`Aggression ${pA}%`}
                  />
                </div>
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: EMOTION_COLORS.friendly }} />
              <span className="text-sm">Friendly: {Math.round(segments[selectedSegment].percents.friendly)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: EMOTION_COLORS.neutral }} />
              <span className="text-sm">Neutral: {Math.round(segments[selectedSegment].percents.neutral)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: EMOTION_COLORS.aggression }} />
              <span className="text-sm">Aggression: {Math.round(segments[selectedSegment].percents.aggression)}%</span>
            </div>
            <span className="text-sm text-gray-600">
              {formatFullTime(segments[selectedSegment].start)} - {formatFullTime(segments[selectedSegment].end)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
              {Math.round(segments[selectedSegment].durationMs / 1000)}s
            </span>
          </div>

          {!segments[selectedSegment].messages.length && (
            <div className="text-xs text-gray-600">No data in this timeframe.</div>
          )}

          {segments[selectedSegment].messages.length > 0 && (
            <div className="space-y-2">
              {segments[selectedSegment].messages.map((m, mi) => m.status !== "receiver" && (
                <div key={mi} className="bg-white p-3 rounded border text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-700">
                      {formatFullTime(new Date(m.timestamp).getTime())}
                    </span>
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
          <div className="font-semibold text-lg">{timelineConfig.windowMinutes}m</div>
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
              ).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
            }
          </div>
          <div className="text-gray-600">Most Frequent</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="text-sm font-medium text-gray-700 w-full mb-2">Legend</div>
        {Object.entries(SENTIMENT_LABELS).map(([k, label]) => (
          <div key={k} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: EMOTION_COLORS[k] }} />
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}