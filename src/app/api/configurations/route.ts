

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = `${process.env.BACKEND_URL}/api` || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    const queryIndex = req.url.lastIndexOf('?');
  const query = queryIndex >= 0 ? req.url.substring(queryIndex) : '';
    const res = await axios.get(`${API_BASE_URL}/configurations${query}`, {
      headers: {
        Authorization: req.headers.get('Authorization'),
      }
    })
    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await axios.post(`${API_BASE_URL}/configurations/update-by-name`, body, {
      headers: {
        Authorization: req.headers.get('Authorization'),
      }
    });
    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}