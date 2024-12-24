import { NextResponse } from 'next/server';
import path from 'path';
import * as XLSX from 'xlsx';
import { CoursesResponse } from '@/types/QuestionaireTypes';

export async function GET(
  request: Request,
  { params }: { params: { university: string } }
): Promise<NextResponse<CoursesResponse>> {
  const university = params.university;
  
  try {
    const coursesPath = path.join(process.cwd(), '..', 'data', university.toLowerCase(), `${university.toLowerCase()}_courses.xlsx`);

    const workbook = XLSX.readFile(coursesPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const courses = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      .flat()
      .filter((course): course is string => typeof course === 'string' && course.trim() !== '');

    return NextResponse.json({ courses });
  } catch (error) {
    console.error(`Error loading courses for ${university}:`, error);
    return NextResponse.json({ courses: [] }, { status: 500 });
  }
}