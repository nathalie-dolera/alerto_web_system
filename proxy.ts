import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'alerto-admin-secret-key-for-jwt';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
];

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/alarms',
  '/devices',
  '/users',
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  
  // Check if the route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/';

  // Get the auth token from cookies
  const token = request.cookies.get('adminAuthToken')?.value;

  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access a protected route with a token, verify it
  if (isProtectedRoute && token) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Invalid or expired token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If accessing login page while authenticated, optionally redirect to dashboard
  if (pathname === '/login' && token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Token is invalid, allow access to login page
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
