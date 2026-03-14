import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    
    return NextResponse.json(
      { status: 'success', message: 'MongoDB is connected perfectly!' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to connect to the database.' }, 
      { status: 500 }
    );
  }
}