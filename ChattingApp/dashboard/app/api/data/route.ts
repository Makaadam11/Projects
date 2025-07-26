// app/api/data/route.ts
import { NextRequest } from 'next/server';
import { ExcelParser } from '@/lib/excel-parser';
import { DataProcessor } from '@/lib/data-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const sessions = ExcelParser.parseExcelFile(buffer);
    
    return Response.json({ sessions });
  } catch (error) {
    return Response.json({ error: 'Failed to process file' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams);
  
  // Apply filters and return processed data
  const filteredData = DataProcessor.applyFilters(filters);
  
  return Response.json(filteredData);
}