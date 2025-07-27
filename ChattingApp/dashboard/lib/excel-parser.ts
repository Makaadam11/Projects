// lib/excel-parser.ts
import * as XLSX from 'xlsx';
import { SessionData, ExcelRow, User, EmotionData, SentimentData, UserRecord } from '@/app/types/dashboard';

export class ExcelParser {
  static parseExcelFile(file: Buffer, fileName?: string): SessionData[] {
    const workbook = XLSX.read(file, { type: 'buffer' });
    const sessions: SessionData[] = [];
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
      
      const sessionData = this.processSheetData(data, sheetName, fileName);
      sessions.push(sessionData);
    });
    
    return sessions;
  }
  
  private static processSheetData(data: ExcelRow[], sheetName: string, fileName?: string): SessionData {
    const fileInfo = this.parseFileName(fileName || sheetName);
    
    // ✅ NOWA LOGIKA - podziel dane na użytkowników
    const splitData = this.splitDataByUsers(data, fileInfo.names);
    
    const users = this.extractUsersFromSplitData(splitData, fileInfo.names);
    const emotions = this.extractEmotionsFromSplitData(splitData);
    const sentiments = this.extractSentimentsFromSplitData(splitData);
    
    return {
      id: sheetName,
      date: fileInfo.date,
      users,
      emotions,
      sentiments,
      messages: splitData // Wszystkie rekordy użytkowników
    };
  }

  // ✅ NOWA METODA - podziel dane na użytkowników
  private static splitDataByUsers(data: ExcelRow[], userNames: string[]): UserRecord[] {
    const splitRecords: UserRecord[] = [];
    
    data.forEach(row => {
      // User 1 - główne kolumny
      if (row.username) {
        splitRecords.push({
          timestamp: row.timestamp,
          user_id: 1,
          username: userNames[0] || row.username,
          status: row.status,
          message: row.message,
          complete_message: row.complete_message,
          start_sending_time: row.start_sending_time,
          end_sending_time: row.end_sending_time,
          total_sending_time: row.total_sending_time || 0,
          start_viewing_time: row.start_viewing_time,
          end_viewing_time: row.end_viewing_time,
          total_viewing_time: row.total_viewing_time || 0,
          angry: row.angry || 0,
          disgust: row.disgust || 0,
          fear: row.fear || 0,
          happy: row.happy || 0,
          sad: row.sad || 0,
          surprise: row.surprise || 0,
          neutral: row.neutral || 0,
          sentiment_neg: row.sentiment_neg || 0,
          sentiment_pos: row.sentiment_pos || 0,
          sentiment_neu: row.sentiment_neu || 0
        });
      }
      
      // User 2 - kolumny z prefiksem partner_
      if (row.partner_name) {
        splitRecords.push({
          timestamp: row.timestamp,
          user_id: 2,
          username: userNames[1] || row.partner_name,
          status: row.partner_status,
          message: row.partner_message,
          complete_message: row.partner_complete_message,
          start_sending_time: row.partner_start_sending_time,
          end_sending_time: row.partner_end_sending_time,
          total_sending_time: row.partner_total_sending_time || 0,
          start_viewing_time: row.partner_start_viewing_time,
          end_viewing_time: row.partner_end_viewing_time,
          total_viewing_time: row.partner_total_viewing_time || 0,
          angry: row.partner_angry || 0,
          disgust: row.partner_disgust || 0,
          fear: row.partner_fear || 0,
          happy: row.partner_happy || 0,
          sad: row.partner_sad || 0,
          surprise: row.partner_surprise || 0,
          neutral: row.partner_neutral || 0,
          sentiment_neg: row.partner_sentiment_neg || 0,
          sentiment_pos: row.partner_sentiment_pos || 0,
          sentiment_neu: row.partner_sentiment_neu || 0
        });
      }
    });
    
    return splitRecords;
  }

// ...existing code...

  // ✅ POPRAWIONA METODA - użyj podzielonych danych + konwersja na minuty/sekundy
  private static extractUsersFromSplitData(data: UserRecord[], userNames: string[]): User[] {
    const userMap = new Map<number, User>();
    
    data.forEach(record => {
      const userId = record.user_id;
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId.toString(),
          name: record.username,
          totalSending: 0,
          totalViewing: 0,
          totalMessages: 0,
          corrections: 0
        });
      }
      
      const user = userMap.get(userId)!;
      
      if (record.status === 'sender' && record.complete_message !== '') {
        user.totalMessages++;
        // ✅ Konwertuj milisekundy na sekundy
        user.totalSending += (record.total_sending_time || 0) / 1000;
      } else if (record.status === 'receiver') {
        // ✅ Konwertuj milisekundy na sekundy
        user.totalViewing += (record.total_viewing_time || 0) / 1000;
      }
    });
    
    return Array.from(userMap.values());
  }

  // ✅ NOWA METODA - formatuj czas na minuty:sekundy
  static formatTimeToMinutesSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

// ...existing code...

  // ✅ POPRAWIONA METODA - emocje z podzielonych danych
  private static extractEmotionsFromSplitData(data: UserRecord[]): Record<string, EmotionData> {
    const emotionMap: Record<string, EmotionData> = {};
    
    data.forEach(record => {
      const username = record.username;
      
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
      
      emotionMap[username].angry += record.angry || 0;
      emotionMap[username].disgust += record.disgust || 0;
      emotionMap[username].fear += record.fear || 0;
      emotionMap[username].happy += record.happy || 0;
      emotionMap[username].sad += record.sad || 0;
      emotionMap[username].surprise += record.surprise || 0;
      emotionMap[username].neutral += record.neutral || 0;
    });
    
    return emotionMap;
  }

  // ✅ POPRAWIONA METODA - sentymenty z podzielonych danych
  private static extractSentimentsFromSplitData(data: UserRecord[]): Record<string, SentimentData> {
    const sentimentMap: Record<string, SentimentData> = {};
    
    data.forEach(record => {
      const username = record.username;
      
      if (!sentimentMap[username] && (record.sentiment_neg || record.sentiment_pos || record.sentiment_neu)) {
        const neg = record.sentiment_neg || 0;
        const pos = record.sentiment_pos || 0;
        const neu = record.sentiment_neu || 0;
        
        sentimentMap[username] = {
          neg,
          pos,
          neu,
          predicted: this.getPredictedSentiment(neg, pos, neu)
        };
      }
    });
    
    return sentimentMap;
  }

  // ✅ Pozostałe metody bez zmian
  private static parseFileName(fileName: string): { names: string[], date: string } {
    const parts = fileName.split('_');
    
    if (parts.length >= 3) {
      const name1 = parts[0];
      const name2 = parts[1];
      const dateStr = parts[2];
      
      return {
        names: [name1, name2],
        date: dateStr
      };
    }
    
    return {
      names: [],
      date: new Date().toISOString().split('T')[0]
    };
  }

  private static getPredictedSentiment(neg: number, pos: number, neu: number): string {
    const max = Math.max(neg, pos, neu);
    if (max === neg) return 'negative';
    if (max === pos) return 'positive';
    return 'neutral';
  }
}