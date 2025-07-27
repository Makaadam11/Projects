// lib/data-processor.ts
import { SessionData, SessionInfo } from '@/app/types/dashboard';

export class DataProcessor {
  // Pobierz dostępne daty z sesji
  static getAvailableDates(sessions: SessionInfo[]): string[] {
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
      return [];
    }
    
    try {
      const dates = sessions
        .map(session => session.date)
        .filter(date => date && typeof date === 'string')
        .filter((date, index, array) => array.indexOf(date) === index)
        .sort();
      
      return dates;
    } catch (error) {
      console.error('Error getting available dates:', error);
      return [];
    }
  }
  
  // Filtruj sesje po dacie
  static filterSessionsByDate(sessions: SessionInfo[], targetDate: string): SessionInfo[] {
    if (!targetDate) return sessions;
    return sessions.filter(session => session.date === targetDate);
  }
  
  // Zastosuj filtry na danych sesji (nie na liście sesji)
  static applyDataFilters(sessionData: SessionData, filters: any): SessionData {
    let filteredData = { ...sessionData };
    
    // Filtruj wiadomości po minutach
    if (filters.minuteFilter && filters.minuteFilter !== 'all') {
      const minutes = parseInt(filters.minuteFilter);
      filteredData.messages = sessionData.messages.slice(0, minutes);
    }
    
    return filteredData;
  }
}