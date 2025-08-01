// app/api/change-password/route.ts
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const requestBody = await req.json();

  const res = await axios.patch(`${process.env.BACKEND_URL}/api/users/change-password`, requestBody, {
    headers: {
        'Authorization': authHeader || '',
    },
  });

  return NextResponse.json(res.data);
}