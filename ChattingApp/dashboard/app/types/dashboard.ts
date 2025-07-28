export interface User {
  id: string;
  name: string;
  totalSending: number; // w sekundach
  totalViewing: number; // w sekundach
  totalMessages: number;
  corrections: number;
  // ✅ Dodaj formatowane czasy
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
  fileName: string;  // Adam_Femi_2025-07-22_21-05-26
  file: string;      // Adam_Femi_2025-07-22_21-05-26.xlsx
  names: string[];   // ["Adam", "Femi"]
  date: string;      // 2025-07-22
  time?: string;     // 21-05-26
}

// app/types/dashboard.ts
export interface SessionData {
  id: string;
  date: string;
  users: User[];
  emotions: Record<string, EmotionData>;
  sentiments: Record<string, SentimentData>;
  messages: UserRecord[]; // ✅ Zmieniono na UserRecord[]
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
  
  // Partner data
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
  partner_event_type: string;
  partner_action_by: string;
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
}

// Pojedynczy rekord użytkownika


// ✅ Dodaj interface dla messages
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
}

