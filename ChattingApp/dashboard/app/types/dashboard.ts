export interface User {
  id: string;
  name: string;
  totalSessionTime: number;
  totalSending: number;
  totalViewing: number;
  totalMessages: number;
  warnings_count: number;
  corrections_count: number;
  formattedTotalSending?: string; // MM:SS
  formattedTotalViewing?: string;  // MM:SS
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

export interface SessionInfo {
  fileName: string;
  file: string;
  names: string[];
  date: string;
  time?: string;
}

export interface SessionData {
  id: string;
  date: string;
  users: User[];
  emotions: Record<string, EmotionData>;
  sentiments: Record<string, SentimentData>;
  messages: UserRecord[];
  sessionInfo?: SessionInfo;
}
    
export interface DashboardFilters {
  dateRange: string[] | [string, string];
  sessions: SessionData[];
  minuteFilter: 1 | 5 | 10 | 30 | 60 | 'all';
  topSentimentCount: number;
}

export interface ExcelRow {
  timestamp: string;
  user_id: number;
  username: string;
  status: string;
  message: string;
  complete_message: string;
  start_sending_time: string;
  end_sending_time: string;
  total_sending_time: number;
  start_viewing_time: string;
  end_viewing_time: string;
  total_viewing_time: number;
  angry: any;
  disgust: any;
  fear: any;
  happy: any;
  sad: any;
  surprise: any;
  neutral: any;
  sentiment_neg: number;
  sentiment_pos: number;
  sentiment_neu: number;
  warnings_count: number;
  corrections_count: number;

  partner_name: string;
  partner_status: string;
  partner_message: string;
  partner_complete_message: string;
  partner_start_sending_time: string;
  partner_end_sending_time: string;
  partner_total_sending_time: number;
  partner_start_viewing_time: string;
  partner_end_viewing_time: string;
  partner_total_viewing_time: number;
  partner_angry: any;
  partner_disgust: any;
  partner_fear: any;
  partner_happy: any;
  partner_sad: any;
  partner_surprise: any;
  partner_neutral: any;
  partner_sentiment_neg: number;
  partner_sentiment_pos: number;
  partner_sentiment_neu: number;
  partner_warnings_count: number;
  partner_corrections_count: number;
}



export interface UserRecord {
  timestamp: string;
  user_id: number;
  username: string;
  status: string;
  message: string;
  complete_message: string;
  start_sending_time: string;
  end_sending_time: string;
  total_sending_time: number;
  start_viewing_time: string;
  end_viewing_time: string;
  total_viewing_time: number;
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
  warnings_count: number;
  corrections_count: number;

  partner_name?: string;
  partner_status?: string;
  partner_message?: string;
  partner_complete_message?: string;
  partner_start_sending_time?: string;
  partner_end_sending_time?: string;
  partner_total_sending_time?: number;
  partner_start_viewing_time?: string;
  partner_end_viewing_time?: string;
  partner_total_viewing_time?: number;
  partner_angry?: number;
  partner_disgust?: number;
  partner_fear?: number;
  partner_happy?: number;
  partner_sad?: number;
  partner_surprise?: number;
  partner_neutral?: number;
  partner_sentiment_neg?: number;
  partner_sentiment_pos?: number;
  partner_sentiment_neu?: number;
  partner_warnings_count?: number;
  partner_corrections_count?: number;
  formattedTotalSending?: string; // MM:SS
  formattedTotalViewing?: string;  // MM:SS
}

