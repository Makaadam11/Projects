export interface User {
  id: string;
  name: string;
  totalSending: number;
  totalViewing: number;
  totalMessages: number;
  corrections: number;
}

export interface EmotionData {
  angry: number;
  disgust: number;
  fear: number;
  happy: number;
  sad: number;
  surprise: number;
  neutral: number;
}

export interface SentimentData {
  neg: number;
  pos: number;
  neu: number;
  predicted: string;
}

export interface SessionData {
  id: string;
  date: string;
  users: User[];
  emotions: Record<string, EmotionData>;
  sentiments: Record<string, SentimentData>;
  messages: any[];
}

export interface DashboardFilters {
  dateRange: [Date, Date];
  sessions: string[];
  minuteFilter: 1 | 5 | 10 | 30 | 60 | 'all';
  topSentimentCount: number;
}

export interface ExcelRow {
  timestamp: string;
  user_id: number;
  username: string;
  status: string;
  message: string;
  angry: number;
  disgust: number;
  fear: number;
  happy: number;
  sad: number;
  surprise: number;
  neutral: number;
  sentiment_neg: number;
  sentiment_pos: number;
  sentiment_neu: number;
  partner_name: string;
  partner_sentiment_neg: number;
  partner_sentiment_pos: number;
  partner_sentiment_neu: number;
}