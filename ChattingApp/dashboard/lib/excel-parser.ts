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

  private static parseEuropeanNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleanValue = value.replace(',', '.').replace(/\s/g, '');
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private static convertPercentToDecimal(value: number): number {
    return value > 1 ? value / 100 : value;
  }

  
    private static splitDataByUsers(data: ExcelRow[], userNames: string[]): UserRecord[] {
      const splitRecords: UserRecord[] = [];
      
      // ✅ DODAJ - test parsowania na pierwszym wierszu
      if (data.length > 0) {
        const testRow = data[0];
        console.log('Excel parser - test first row emotions:', {
          raw_angry: testRow.angry,
          raw_happy: testRow.happy,
          raw_neutral: testRow.neutral,
          parsed_angry: this.convertPercentToDecimal(this.parseEuropeanNumber(testRow.angry)),
          parsed_happy: this.convertPercentToDecimal(this.parseEuropeanNumber(testRow.happy)),
          parsed_neutral: this.convertPercentToDecimal(this.parseEuropeanNumber(testRow.neutral)),
        });
      }
      
      data.forEach(row => {
        // User 1 - główne kolumny
        if (row.username) {
          const user1Record = {
            timestamp: row.timestamp,
            user_id: 1,
            username: userNames[0] || row.username,
            status: row.status,
            message: row.message,
            complete_message: row.complete_message,
            start_sending_time: row.start_sending_time,
            end_sending_time: row.end_sending_time,
            total_sending_time: this.parseEuropeanNumber(row.total_sending_time),
            start_viewing_time: row.start_viewing_time,
            end_viewing_time: row.end_viewing_time,
            total_viewing_time: this.parseEuropeanNumber(row.total_viewing_time),
            
            // ✅ POPRAW - parsuj emocje z debuggiem
            angry: this.convertPercentToDecimal(this.parseEuropeanNumber(row.angry)),
            disgust: this.convertPercentToDecimal(this.parseEuropeanNumber(row.disgust)),
            fear: this.convertPercentToDecimal(this.parseEuropeanNumber(row.fear)),
            happy: this.convertPercentToDecimal(this.parseEuropeanNumber(row.happy)),
            sad: this.convertPercentToDecimal(this.parseEuropeanNumber(row.sad)),
            surprise: this.convertPercentToDecimal(this.parseEuropeanNumber(row.surprise)),
            neutral: this.convertPercentToDecimal(this.parseEuropeanNumber(row.neutral)),
            
            sentiment_neg: this.convertPercentToDecimal(this.parseEuropeanNumber(row.sentiment_neg)),
            sentiment_pos: this.convertPercentToDecimal(this.parseEuropeanNumber(row.sentiment_pos)),
            sentiment_neu: this.convertPercentToDecimal(this.parseEuropeanNumber(row.sentiment_neu)),

            warnings_count: row.warnings_count,
            corrections_count: row.corrections_count
          };
  
          // ✅ DEBUG pierwszego rekordu
          if (splitRecords.length === 0) {
            console.log('First user record emotions:', {
              angry: user1Record.angry,
              happy: user1Record.happy,
              neutral: user1Record.neutral,
              message: user1Record.complete_message?.substring(0, 30)
            });
          }
  
          splitRecords.push(user1Record);
        }
        
        // User 2 - analogicznie...
        if (row.partner_name) {
          const user2Record ={
            timestamp: row.timestamp,
            user_id: 2,
            username: userNames[1] || row.partner_name,
            status: row.partner_status,
            message: row.partner_message,
            complete_message: row.partner_complete_message,
            start_sending_time: row.partner_start_sending_time,
            end_sending_time: row.partner_end_sending_time,
            total_sending_time: this.parseEuropeanNumber(row.partner_total_sending_time),
            start_viewing_time: row.partner_start_viewing_time,
            end_viewing_time: row.partner_end_viewing_time,
            total_viewing_time: this.parseEuropeanNumber(row.partner_total_viewing_time),
            
            angry: this.convertPercentToDecimal(this.parseEuropeanNumber(row.partner_angry)),
            disgust: this.convertPercentToDecimal(this.parseEuropeanNumber(row.partner_disgust)),
            fear: this.convertPercentToDecimal(this.parseEuropeanNumber(row.partner_fear)),
            happy: this.convertPercentToDecimal(this.parseEuropeanNumber(row.partner_happy)),
            sad: this.convertPercentToDecimal(this.parseEuropeanNumber(row.partner_sad)),
            surprise: this.convertPercentToDecimal(this.parseEuropeanNumber(row.partner_surprise)),
            neutral: this.convertPercentToDecimal(this.parseEuropeanNumber(row.partner_neutral)),
            
            sentiment_neg: this.convertPercentToDecimal(this.parseEuropeanNumber(row.partner_sentiment_neg)),
            sentiment_pos: this.convertPercentToDecimal(this.parseEuropeanNumber(row.partner_sentiment_pos)),
            sentiment_neu: this.convertPercentToDecimal(this.parseEuropeanNumber(row.partner_sentiment_neu)),
            warnings_count: row.partner_warnings_count,
            corrections_count: row.partner_corrections_count
          };
          splitRecords.push(user2Record);
        }
      });
      
      return splitRecords;
    }
  

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
          warnings_count: 0,
          corrections_count: 0
        });
      }
      
      const user = userMap.get(userId)!;
      
      if (record.status === 'sender' && record.complete_message !== '') {
        user.totalMessages++;
        user.totalSending += (record.total_sending_time || 0) / 1000;
      } else if (record.status === 'receiver') {
        user.totalViewing += (record.total_viewing_time || 0) / 1000;
      }

      user.warnings_count += record.warnings_count || 0;
      user.corrections_count += record.corrections_count || 0;
    });
    
    return Array.from(userMap.values());
  }

  static formatTimeToMinutesSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

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
