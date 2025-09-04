'use client';
import React, { useEffect, useRef, useMemo } from 'react';
import { SessionData } from '@/app/types/dashboard';
import Chart from 'chart.js/auto';

const EMOTION_LABELS = ['Neutral', 'Friendly', 'Aggression'];
const EMOTION_COLORS = [
  'rgb(54, 162, 235)', // Neutral
  'rgb(84, 219, 52)',  // Friendly
  'rgb(255, 99, 132)'  // Aggression
];

interface SentimentDonutProps {
  name: string;
  data: SessionData[];
  className?: string;
}

export default function SentimentDonutChart({
  name,
  data,
  className = ''
}: SentimentDonutProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const sentimentTotals = useMemo(() => {
    const session = data.find(s => s.users.some(u => u.name === name));
    if (!session) return { neu: 0, pos: 0, neg: 0, total: 0 };

    let neu = 0, pos = 0, neg = 0, count = 0;
    session.messages.forEach(m => {
      if (m.username === name || m.partner_name === name) {
        const isPartner = m.partner_name === name && m.partner_name !== m.username;
        let n = isPartner ? m.partner_sentiment_neu : m.sentiment_neu;
        let p = isPartner ? m.partner_sentiment_pos : m.sentiment_pos;
        let g = isPartner ? m.partner_sentiment_neg : m.sentiment_neg;

        [n, p, g] = [n, p, g].map(v => {
          let num = typeof v === 'number' ? v : parseFloat((v ?? '0').replace(',', '.'));
          if (num > 1) num = num / 100;
          return isNaN(num) ? 0 : num;
        });

        neu += n;
        pos += p;
        neg += g;
        count++;
      }
    });

    const total = neu + pos + neg;
    return {
      neu: total ? neu / total : 0,
      pos: total ? pos / total : 0,
      neg: total ? neg / total : 0,
      raw: { neu, pos, neg, count }
    };
  }, [data, name]);

  useEffect(() => {
    if (!chartRef.current) return;

    const values = [sentimentTotals.neu * 100, sentimentTotals.pos * 100, sentimentTotals.neg * 100];
    const chartConfig = {
      type: 'doughnut' as const,
      data: {
        labels: EMOTION_LABELS,
        datasets: [{
          label: 'Sentiment',
          data: values,
          borderWidth: 1,
          backgroundColor: EMOTION_COLORS,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // pozwala dopasować się do rozmiaru kontenera
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { display: false },
          x: { display: false }
        }
      }
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    chartInstance.current = new Chart(chartRef.current, chartConfig);

    return () => {
      chartInstance.current?.destroy();
    };
  }, [sentimentTotals]);

  return (
    <div className={`bg-gray-100 p-6 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Sentiment Overview</h3>
      <div className="flex flex-col items-center">
        {/* Mniejszy kontener na wykres */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32">
          <canvas ref={chartRef} />
        </div>

        <div id="predValues" className="mt-4 text-sm text-gray-700 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded inline-block bg-[#36a2eb]" />
            <span>Neutral: {(sentimentTotals.neu * 100).toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="w-3 h-3 rounded inline-block bg-[#54db34]" />
            <span>Friendly: {(sentimentTotals.pos * 100).toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="w-3 h-3 rounded inline-block bg-[#ff6384]" />
            <span>Aggression: {(sentimentTotals.neg * 100).toFixed(2)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
