 
import { SessionData, DashboardFilters } from '@/app/types/dashboard';

export class DataProcessor {
  static applyFilters(filters: any): SessionData[] {
    // Placeholder implementation
    return [];
  }
  
  static filterByDateRange(sessions: SessionData[], dateRange: [Date, Date]): SessionData[] {
    const [startDate, endDate] = dateRange;
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }
  
  static filterByMinutes(sessions: SessionData[], minutes: number | 'all'): SessionData[] {
    if (minutes === 'all') return sessions;
    
    return sessions.map(session => ({
      ...session,
      messages: session.messages.slice(0, minutes)
    }));
  }
  
  static getTopNegativeWords(sessions: SessionData[], count: number): string[] {
    const words: string[] = [];
    
    sessions.forEach(session => {
      session.messages.forEach((message: any) => {
        if (message.sentiment_neg > 0.5) {
          words.push(...(message.message?.split(' ') || []));
        }
      });
    });
    
    return words.slice(0, count);
  }
}