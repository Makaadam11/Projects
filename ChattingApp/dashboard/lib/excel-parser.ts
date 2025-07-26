import * as XLSX from 'xlsx';
import { SessionData, ExcelRow, User, EmotionData, SentimentData } from '@/app/types/dashboard';

export class ExcelParser {
  static parseExcelFile(file: Buffer): SessionData[] {
    const workbook = XLSX.read(file, { type: 'buffer' });
    const sessions: SessionData[] = [];
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
      
      const sessionData = this.processSheetData(data, sheetName);
      sessions.push(sessionData);
    });
    
    return sessions;
  }
  
  private static processSheetData(data: ExcelRow[], sheetName: string): SessionData {
    const users = this.extractUsers(data);
    const emotions = this.extractEmotions(data);
    const sentiments = this.extractSentiments(data);
    const date = this.extractDate(data);
    
    return {
      id: sheetName,
      date,
      users,
      emotions,
      sentiments,
      messages: data
    };
  }
  
  private static extractDate(data: ExcelRow[]): string {
    if (data.length > 0 && data[0].timestamp) {
      return new Date(data[0].timestamp).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  }
  
  private static extractUsers(data: ExcelRow[]): User[] {
    const userMap = new Map<string, User>();
    
    data.forEach(row => {
      const userId = row.user_id?.toString() || '';
      const username = row.username || '';
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          name: username,
          totalSending: 0,
          totalViewing: 0,
          totalMessages: 0,
          corrections: 0
        });
      }
      
      const user = userMap.get(userId)!;
      if (row.status === 'sender') {
        user.totalMessages++;
      }
    });
    
    return Array.from(userMap.values());
  }
  
  private static extractEmotions(data: ExcelRow[]): Record<string, EmotionData> {
    const emotionMap: Record<string, EmotionData> = {};
    
    data.forEach(row => {
      const username = row.username || '';
      if (!emotionMap[username]) {
        emotionMap[username] = {
          angry: 0,
          disgust: 0,
          fear: 0,
          happy: 0,
          sad: 0,
          surprise: 0,
          neutral: 0
        };
      }
      
      emotionMap[username].angry += row.angry || 0;
      emotionMap[username].disgust += row.disgust || 0;
      emotionMap[username].fear += row.fear || 0;
      emotionMap[username].happy += row.happy || 0;
      emotionMap[username].sad += row.sad || 0;
      emotionMap[username].surprise += row.surprise || 0;
      emotionMap[username].neutral += row.neutral || 0;
    });
    
    return emotionMap;
  }
  
  private static extractSentiments(data: ExcelRow[]): Record<string, SentimentData> {
    const sentimentMap: Record<string, SentimentData> = {};
    
    data.forEach(row => {
      const username = row.username || '';
      if (!sentimentMap[username] && (row.sentiment_neg || row.sentiment_pos || row.sentiment_neu)) {
        sentimentMap[username] = {
          neg: row.sentiment_neg || 0,
          pos: row.sentiment_pos || 0,
          neu: row.sentiment_neu || 0,
          predicted: this.getPredictedSentiment(row.sentiment_neg || 0, row.sentiment_pos || 0, row.sentiment_neu || 0)
        };
      }
    });
    
    return sentimentMap;
  }
  
  private static getPredictedSentiment(neg: number, pos: number, neu: number): string {
    const max = Math.max(neg, pos, neu);
    if (max === neg) return 'negative';
    if (max === pos) return 'positive';
    return 'neutral';
  }
}