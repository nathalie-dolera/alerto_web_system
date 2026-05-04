import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'alerto-admin-secret-key-for-jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminAuthToken')?.value;

    if (!token) {
      return NextResponse.json({
        error: 'Unauthorized' 
      }, {
        status: 401 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { email: string,
      role: string };
    
    return NextResponse.json({
      user: {
        email: decoded.email,
        role: decoded.role,
      }
    });
  } catch {
    return NextResponse.json({
      error: 'Unauthorized' 
    }, {
      status: 401 
    });
  }
}
