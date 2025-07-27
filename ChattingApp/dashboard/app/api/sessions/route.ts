// app/api/sessions/route.ts
import { NextRequest } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { ExcelParser } from '@/lib/excel-parser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');
    
    const dataFolderPath = path.join(process.cwd(), '..', 'data');
    
    if (!fs.existsSync(dataFolderPath)) {
      return Response.json({ error: 'Data folder not found' }, { status: 404 });
    }

    // Jeśli nie ma fileName, zwróć listę wszystkich sesji
    if (!fileName) {
      const files = fs.readdirSync(dataFolderPath)
        .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
        .map(file => {
          const fileName = file.replace(/\.(xlsx|xls)$/i, '');
          const parts = fileName.split('_');
          
          let sessionInfo = {
            fileName,
            file,
            names: [] as string[],
            date: new Date().toISOString().split('T')[0],
            time: ''
          };
          
          if (parts.length >= 4) {
            sessionInfo = {
              fileName,
              file,
              names: [parts[0], parts[1]],
              date: parts[2], // 2025-07-22
              time: parts[3] // 21-05-26
            };
          }
          
          return sessionInfo;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return Response.json({ sessions: files });
    }

    // Jeśli jest fileName, zwróć dane tej sesji
    const filePath = path.join(dataFolderPath, fileName);
    
    if (!fs.existsSync(filePath)) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }
    
    const buffer = fs.readFileSync(filePath);
    const sessionName = fileName.replace(/\.(xlsx|xls)$/i, '');
    const sessions = ExcelParser.parseExcelFile(buffer, sessionName);
    
    return Response.json({ session: sessions[0] });
  } catch (error) {
    console.error('Error reading sessions:', error);
    return Response.json({ error: 'Failed to read sessions' }, { status: 500 });
  }
}