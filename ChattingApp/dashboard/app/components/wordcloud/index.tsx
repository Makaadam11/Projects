'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UserRecord } from '@/app/types/dashboard';

interface WordCloudProps {
  messages: UserRecord[];
  topCount?: number;
  className?: string;
}

interface WordFrequency {
  text: string;
  frequency: number;
  sentiment: number;
}

export default function WordCloud({ messages, topCount = 50, className = '' }: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wordStats, setWordStats] = useState<{ totalWords: number; negativeMessages: number }>({
    totalWords: 0,
    negativeMessages: 0
  });

  const getTopNegativeWords = (messages: UserRecord[]): WordFrequency[] => {
    console.log('Processing messages:', messages.length);
    
    const wordMap = new Map<string, { count: number, totalSentiment: number }>();

    // ✅ Bardziej elastyczne filtrowanie wiadomości
    const negativeMessages = messages.filter(msg => {
      const hasMessage = msg.complete_message && msg.complete_message.trim().length > 0;
      const hasNegativeSentiment = msg.sentiment_neg && msg.sentiment_neg > 0;
      
      console.log('Message check:', {
        message: msg.complete_message?.substring(0, 50),
        sentiment_neg: msg.sentiment_neg,
        sentiment_pos: msg.sentiment_pos,
        sentiment_neu: msg.sentiment_neu,
        hasMessage,
        hasNegativeSentiment
      });
      
      return hasMessage && hasNegativeSentiment;
    });

    console.log('Filtered negative messages:', negativeMessages.length);

    // ✅ Jeśli brak negative messages, użyj wszystkich z sentiment_neg > 0
    let messagesToProcess = negativeMessages;
    if (negativeMessages.length === 0) {
      messagesToProcess = messages.filter(msg => 
        msg.complete_message && 
        msg.complete_message.trim().length > 0 &&
        (msg.sentiment_neg > 0 || msg.sentiment_pos > 0 || msg.sentiment_neu > 0)
      );
      console.log('Using all messages with sentiment:', messagesToProcess.length);
    }

    messagesToProcess.forEach(message => {
      if (!message.complete_message) return;

      // ✅ Poprawione czyszczenie tekstu
      const words = message.complete_message
        .toLowerCase()
        .replace(/[^\w\s\u00C0-\u017F\u0100-\u017F]/g, ' ') // Zachowaj polskie znaki
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && // Skrócono z 3 na 2
          !['the', 'and', 'that', 'this', 'with', 'have', 'will', 'they', 'from', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'jest', 'nie', 'czy', 'ale', 'jak', 'też', 'już', 'tak', 'może', 'było', 'będzie', 'lub', 'oraz', 'dla', 'jego', 'jej', 'tym', 'tej', 'ten', 'mnie', 'tego', 'która', 'które'].includes(word)
        );

      words.forEach(word => {
        if (!wordMap.has(word)) {
          wordMap.set(word, { count: 0, totalSentiment: 0 });
        }
        const current = wordMap.get(word)!;
        current.count += 1;
        current.totalSentiment += (message.sentiment_neg || 0);
      });
    });

    const wordFrequencies: WordFrequency[] = Array.from(wordMap.entries())
      .map(([word, data]) => ({
        text: word,
        frequency: data.count,
        sentiment: data.totalSentiment / data.count
      }))
      .sort((a, b) => b.sentiment - a.sentiment)
      .slice(0, topCount);

    console.log('Final word frequencies:', wordFrequencies.slice(0, 10));

    // Update stats
    setWordStats({
      totalWords: wordFrequencies.length,
      negativeMessages: messagesToProcess.length
    });

    return wordFrequencies;
  };

  const drawWordCloud = (words: WordFrequency[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (words.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No words found with negative sentiment', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText(`Processed ${messages.length} messages`, canvas.width / 2, canvas.height / 2 + 10);
      return;
    }

    const maxFreq = Math.max(...words.map(w => w.frequency));
    const maxSentiment = Math.max(...words.map(w => w.sentiment));

    // ✅ Lepszy układ słów - spiral layout
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    words.forEach((word, index) => {
      // Spiral positioning
      const angle = index * 0.5;
      const radius = 20 + index * 8;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Make sure words stay within canvas
      const boundedX = Math.max(50, Math.min(canvas.width - 50, x));
      const boundedY = Math.max(30, Math.min(canvas.height - 30, y));

      // Font size based on frequency
      const fontSize = 12 + (word.frequency / maxFreq) * 18;
      
      // Color based on sentiment intensity
      const intensity = Math.min(200, (word.sentiment / maxSentiment) * 200);
      const red = Math.floor(intensity + 55); // Ensure minimum readability
      const color = `rgb(${red}, 0, 0)`;

      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add shadow for better readability
      ctx.shadowColor = 'rgba(255,255,255,0.8)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(word.text, boundedX, boundedY);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
    });
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      const words = getTopNegativeWords(messages);
      drawWordCloud(words);
    }
  }, [messages, topCount]);

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Negative Sentiment Word Cloud
          </h3>
          <p className="text-sm text-gray-600">
            Top {topCount} words with highest negative sentiment
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Words found: {wordStats.totalWords}</div>
          <div>Messages analyzed: {wordStats.negativeMessages}</div>
          <div>Total messages: {messages.length}</div>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="w-full"
          style={{ maxHeight: '400px', display: 'block' }}
        />
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs text-gray-500">
          <summary>Debug Info</summary>
          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
            {JSON.stringify({
              messagesCount: messages.length,
              sampleMessages: messages.slice(0, 3).map(m => ({
                message: m.complete_message?.substring(0, 50),
                sentiment_neg: m.sentiment_neg,
                sentiment_pos: m.sentiment_pos,
                sentiment_neu: m.sentiment_neu
              })),
              wordStats
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}