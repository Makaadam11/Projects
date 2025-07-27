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
    
    const fileName = file.name.replace(/\.(xlsx|xls)$/i, '');
    
    const sessions = ExcelParser.parseExcelFile(buffer, fileName);
    
    return Response.json({ sessions });
  } catch (error) {
    console.error('Error processing file:', error);
    return Response.json({ error: 'Failed to process file' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams);
  
  const filteredData = DataProcessor.applyFilters(filters);
  
  return Response.json(filteredData);
}