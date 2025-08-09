'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SessionData, UserRecord } from '@/app/types/dashboard';

interface WordCloudProps {
  name: string;
  data: SessionData[];
  topCount?: number;
  className?: string;
}

interface WordFrequency {
  text: string;
  frequency: number;
  sentiment: number;
}

export default function WordCloud({ name, data, topCount = 50, className = '' }: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontScale, setFontScale] = useState(1);
  const [wordStats, setWordStats] = useState<{ totalWords: number; negativeMessages: number; totalMessages: number }>({
    totalWords: 0,
    negativeMessages: 0,
    totalMessages: 0
  });

  const userMessages: UserRecord[] = useMemo(() => {
    if (!data || !data.length) return [];
    return data
      .flatMap(s => s.messages)
      .filter(m => m.complete_message && (m.username === name || m.partner_name === name));
  }, [data, name]);

  const getTopNegativeWords = (messages: UserRecord[]): WordFrequency[] => {
    const wordMap = new Map<string, { count: number; totalSentiment: number }>();
    const negativeMessages = messages.filter(msg =>
      msg.complete_message &&
      msg.complete_message.trim().length > 0 &&
      (msg.sentiment_neg || 0) > 0
    );
    const messagesToProcess = negativeMessages.length ? negativeMessages : messages.filter(msg =>
      msg.complete_message &&
      msg.complete_message.trim().length > 0 &&
      ((msg.sentiment_neg || 0) > 0 || (msg.sentiment_pos || 0) > 0 || (msg.sentiment_neu || 0) > 0)
    );
    messagesToProcess.forEach(message => {
      if (!message.complete_message) return;
      const words = message.complete_message
        .toLowerCase()
        .replace(/[^\w\s\u00C0-\u017F\u0100-\u017F]/g, ' ')
        .split(/\s+/)
        .filter(word =>
          word.length > 2 &&
          ![
            'the','and','that','this','with','have','will','they','from','been','were','said','each','which','their',
            'time','would','there','could','other','jest','nie','czy','ale','jak','też','już','tak','może','było',
            'będzie','lub','oraz','dla','jego','jej','tym','tej','ten','mnie','tego','która','które'
          ].includes(word)
        );
      words.forEach(word => {
        if (!wordMap.has(word)) wordMap.set(word, { count: 0, totalSentiment: 0 });
        const entry = wordMap.get(word)!;
        entry.count += 1;
        entry.totalSentiment += (message.sentiment_neg || 0);
      });
    });
    const wordFrequencies: WordFrequency[] = Array.from(wordMap.entries())
      .map(([text, data]) => ({
        text,
        frequency: data.count,
        sentiment: data.totalSentiment / data.count
      }))
      .sort((a, b) => b.frequency - a.frequency || b.sentiment - a.sentiment)
      .slice(0, topCount);
    setWordStats({
      totalWords: wordFrequencies.length,
      negativeMessages: messagesToProcess.length,
      totalMessages: messages.length
    });
    return wordFrequencies;
  };

  const drawWordCloud = (words: WordFrequency[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 900;
    canvas.height = 420;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!words.length) {
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No words to display', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText(`Processed messages: ${wordStats.totalMessages}`, canvas.width / 2, canvas.height / 2 + 10);
      return;
    }
    const maxFreq = Math.max(...words.map(w => w.frequency)) || 1;
    const maxSentiment = Math.max(...words.map(w => w.sentiment)) || 1;
    const sorted = [...words];
    const cols = Math.ceil(Math.sqrt(sorted.length * 1.3));
    const rows = Math.ceil(sorted.length / cols * 1.1);
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;
    const cells: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        cells.push({ x: c * cellW + cellW / 2, y: r * cellH + cellH / 2 });
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const golden = 137.508;
    sorted.forEach((word, i) => {
      const freqFactor = word.frequency / maxFreq;
      const sentFactor = maxSentiment ? word.sentiment / maxSentiment : 0;
      const baseSize = (12 + freqFactor * 28) * fontScale * Math.pow(canvas.width / 900, 0.5);
      const fontSize = Math.min(baseSize, cellH * 0.9);
      let hue = (i * golden + (word.text.charCodeAt(0) % 25)) % 360;
      const sat = 45 + Math.round(freqFactor * 40);
      const light = 30 + Math.round((1 - sentFactor) * 30);
      ctx.font = `600 ${fontSize}px Arial`;
      const metrics = ctx.measureText(word.text);
      const w = metrics.width;
      const h = fontSize;
      let placedOk = false;
      let pos = { x: canvas.width / 2, y: canvas.height / 2 };
      const attempts = Math.min(cells.length, 120);
      for (let a = 0; a < attempts; a++) {
        const cell = cells[(i * 17 + a) % cells.length];
        const jitterX = (Math.random() - 0.5) * cellW * 0.6;
        const jitterY = (Math.random() - 0.5) * cellH * 0.6;
        const x = Math.min(canvas.width - w / 2 - 8, Math.max(w / 2 + 8, cell.x + jitterX));
        const y = Math.min(canvas.height - h / 2 - 8, Math.max(h / 2 + 8, cell.y + jitterY));
        const bbox = { x: x - w / 2, y: y - h / 2, w, h };
        if (
          !placed.some(p => !(
            bbox.x + bbox.w < p.x ||
            p.x + p.w < bbox.x ||
            bbox.y + bbox.h < p.y ||
            p.y + p.h < bbox.y
          ))
        ) {
          pos = { x, y };
          placed.push(bbox);
          placedOk = true;
          break;
        }
      }
      if (!placedOk) {
        const x = Math.random() * (canvas.width - w - 16) + w / 2 + 8;
        const y = Math.random() * (canvas.height - h - 16) + h / 2 + 8;
        placed.push({ x: x - w / 2, y: y - h / 2, w, h });
        pos = { x, y };
      }
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(255,255,255,0.85)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(word.text, pos.x, pos.y);
      ctx.shadowColor = 'transparent';
    });
  };

  useEffect(() => {
    const words = getTopNegativeWords(userMessages);
    drawWordCloud(words);
  }, [userMessages, topCount, fontScale]);

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Negative Word Cloud - {name}
          </h3>
          <p className="text-sm text-gray-600">
            Top {topCount} words (negative sentiment)
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            <label>Font scale</label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={fontScale}
              onChange={e => setFontScale(parseFloat(e.target.value))}
              className="w-32"
            />
            <span>{fontScale.toFixed(1)}x</span>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Words: {wordStats.totalWords}</div>
          <div>Analyzed messages: {wordStats.negativeMessages}</div>
          <div>User messages: {userMessages.length}</div>
        </div>
      </div>
      <div className="border border-gray-200 rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ maxHeight: '420px', display: 'block' }}
        />
      </div>
    </div>
  );
}