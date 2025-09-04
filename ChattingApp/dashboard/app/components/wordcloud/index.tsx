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
  sentiment: number; // per-word NEG score 0..1
}

const WORD_RE = /[A-Za-z]{2,}/g;
const STOP = new Set([
  'the','and','that','this','with','have','will','they','from','been','were','said','each','which','their',
  'time','would','there','could','other','you','your','yours','our','ours','about','into','over','because',
  'but','not','are','for','was','when','what','why','how','who','where','than','then'
]);

export default function WordCloud({ name, data, topCount = 50, className = '' }: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontScale, setFontScale] = useState(1);
  const [loading, setLoading] = useState(false);
  const [wordStats, setWordStats] = useState<{ totalWords: number; negativeMessages: number; totalMessages: number }>({
    totalWords: 0,
    negativeMessages: 0,
    totalMessages: 0
  });

  // Znormalizuj wiadomości autora "name" (jako sender) z obu perspektyw
  const userMessages: { text: string; neg: number }[] = useMemo(() => {
    if (!data?.length) return [];
    const rows = data.flatMap(s => s.messages || []);
    const out: { text: string; neg: number }[] = [];
    for (const r of rows) {
      // jeśli autor jako baza
      if (r.username === name && r.complete_message && r.complete_message.trim()) {
        const neg = Number(r.sentiment_neg ?? 0);
        out.push({ text: r.complete_message.trim(), neg: isFinite(neg) ? neg : 0 });
      }
      // jeśli autor jako partner_* w pliku partnera
      if (r.partner_name === name && r.partner_complete_message && r.partner_complete_message.trim()) {
        const neg = Number(r.partner_sentiment_neg ?? 0);
        out.push({ text: r.partner_complete_message.trim(), neg: isFinite(neg) ? neg : 0 });
      }
    }
    return out;
  }, [data, name]);

  // wybierz top najbardziej negatywne zdania autora
  function pickTopNegativeSentences(items: { text: string; neg: number }[], topK = 20, threshold = 0.1): string[] {
    const filtered = items.filter(i => i.text && i.neg >= threshold);
    const sorted = filtered.sort((a, b) => b.neg - a.neg).slice(0, topK);
    const seen = new Set<string>();
    const res: string[] = [];
    for (const s of sorted) {
      const k = s.text.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        res.push(s.text);
      }
    }
    return res;
  }

  function extractUniqueWords(sentences: string[]): string[] {
    const set = new Set<string>();
    for (const s of sentences) {
      const tokens = (s.match(WORD_RE) || []).map(t => t.toLowerCase());
      for (const t of tokens) {
        if (t.length > 2 && !STOP.has(t)) set.add(t);
      }
    }
    return Array.from(set);
  }

  async function fetchWordNegScores(words: string[]): Promise<Record<string, number>> {
    if (!words.length) return {};
    const res = await fetch(`/api/sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words})
    });
    if (!res.ok) return {};
    const data = await res.json();
    return (data?.scores ?? {}) as Record<string, number>;
  }

  async function buildTopNegativeWords(): Promise<WordFrequency[]> {
    const sentences = pickTopNegativeSentences(userMessages, 1, 0);
    const words = extractUniqueWords(sentences);
    const scores = await fetchWordNegScores(words);

    console.log(sentences);
    console.log(words);
    console.log(scores);

    // zbuduj frequency na bazie całego korpusu zdań (nie tylko top), ale filtruj po word score
    const freq = new Map<string, number>();
    for (const { text } of userMessages) {
      const tokens = (text.match(WORD_RE) || []).map(t => t.toLowerCase()).filter(t => !STOP.has(t) && t.length > 2);
      for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
    }

    const items: WordFrequency[] = Object.entries(scores)
      .filter(([, neg]) => (neg ?? 0) >= 0)        // per-word próg
      .map(([w, neg]) => ({ text: w, sentiment: Number(neg), frequency: freq.get(w) || 1 }))
      .sort((a, b) => (b.sentiment - a.sentiment) || (b.frequency - a.frequency))
      .slice(0, topCount);

    setWordStats({
      totalWords: items.length,
      negativeMessages: sentences.length,
      totalMessages: userMessages.length
    });
    return items;
  }

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
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No negative words found', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText(`Processed messages: ${wordStats.totalMessages}`, canvas.width / 2, canvas.height / 2 + 10);
      return;
    }

    const maxFreq = Math.max(...words.map(w => w.frequency)) || 1;
    const maxSent = Math.max(...words.map(w => w.sentiment)) || 1;

    const cols = Math.ceil(Math.sqrt(words.length * 1.3));
    const rows = Math.ceil(words.length / cols * 1.1);
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

    words.forEach((word, i) => {
      const f = word.frequency / maxFreq;
      const s = word.sentiment / maxSent; // 0..1
      const baseSize = (12 + f * 28) * fontScale * Math.pow(canvas.width / 900, 0.5);
      const fontSize = Math.min(baseSize, cellH * 0.9);

      const hue = (i * golden + (word.text.charCodeAt(0) % 25)) % 360;
      const sat = 45 + Math.round(f * 40);
      const light = 30 + Math.round((1 - s) * 30); // im bardziej negatywne, tym ciemniejsze

      ctx.font = `600 ${fontSize}px Arial`;
      const metrics = ctx.measureText(word.text);
      const w = metrics.width;
      const h = fontSize;

      let pos = { x: canvas.width / 2, y: canvas.height / 2 };
      let placedOk = false;

      const attempts = 120;
      for (let a = 0; a < attempts; a++) {
        const cell = cells[(i * 17 + a) % cells.length];
        const jitterX = (Math.random() - 0.5) * cellW * 0.6;
        const jitterY = (Math.random() - 0.5) * cellH * 0.6;
        const x = Math.min(canvas.width - w / 2 - 8, Math.max(w / 2 + 8, cell.x + jitterX));
        const y = Math.min(canvas.height - h / 2 - 8, Math.max(h / 2 + 8, cell.y + jitterY));
        const bbox = { x: x - w / 2, y: y - h / 2, w, h };
        if (!placed.some(p => !(bbox.x + bbox.w < p.x || p.x + p.w < bbox.x || bbox.y + bbox.h < p.y || p.y + p.h < bbox.y))) {
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
    let mounted = true;
    (async () => {
      setLoading(true);
      const items = await buildTopNegativeWords().catch(() => []);
      if (mounted) drawWordCloud(items);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [userMessages, topCount, fontScale]);

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Negative Word Cloud - {name}</h3>
          <p className="text-sm text-gray-600">Top {topCount} words (per-word negative sentiment)</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            <label>Font scale</label>
            <input type="range" min={0.5} max={2} step={0.1} value={fontScale} onChange={e => setFontScale(parseFloat(e.target.value))} className="w-32" />
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
        {loading && <div className="p-2 text-xs text-gray-500">Scoring words…</div>}
        <canvas ref={canvasRef} className="w-full" style={{ maxHeight: '420px', display: 'block' }} />
      </div>
    </div>
  );
}