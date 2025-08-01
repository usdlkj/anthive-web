import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const API_BASE_URL = `${process.env.BACKEND_URL}/auth/login`

    // Check if the user exists
    const res = await axios.post(API_BASE_URL, { 
      email: email, 
      password: password 
    });

    const response = NextResponse.json({ 
      message: 'Login successful',
      status: 200,
      token: res.data.access_token
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}