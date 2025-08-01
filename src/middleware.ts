import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'my-secret';
const basePath = '/backoffice';

export async function middleware(req: NextRequest) {
  return NextResponse.next(); // disables all logic inside middleware

  // const url = req.nextUrl.pathname.replace(basePath, '') || '/';

  // // Always log access
  // const log = {
  //   time: new Date().toISOString(),
  //   method: req.method,
  //   path: url,
  //   ip: (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim(),
  //   userAgent: req.headers.get('user-agent') || 'unknown',
  // };

  // console.log('[Access Log]', JSON.stringify(log));

  // if (url.startsWith('/login')) {
  //   return NextResponse.next();
  // }

  // const token = req.cookies.get('whoosh')?.value;
  // if (!token) {
  //   return NextResponse.redirect(new URL(`${basePath}/login`, req.url));
  // }

  // try {
  //   const encoder = new TextEncoder();
  //   await jwtVerify(token, encoder.encode(JWT_SECRET));
  // } catch (err) {
  //   console.error('[JWT Error]', err);
  //   return NextResponse.redirect(new URL(`${basePath}/login`, req.url));
  // }

  // return NextResponse.next();
}

export const config = {
  matcher: ['/backoffice/:path*'],
};