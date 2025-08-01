// src/api/dashboard/route.ts
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');

  try {
    const res = await axios.get(`${process.env.BACKEND_URL}/dashboard/summary`, {
      headers: {
        'Authorization': authHeader || '',
      },
    });

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Dashboard API error:', err);
    const message = err.response?.data?.message || err.message || 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}