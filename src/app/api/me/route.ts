import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');

  try {
    const res = await axios.get(`${process.env.BACKEND_URL}/api/users/me`, {
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

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const requestBody = await req.json();

  try {
    const res = await axios.patch(`${process.env.BACKEND_URL}/api/users/me`, requestBody, {
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