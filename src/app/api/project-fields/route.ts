import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = `${process.env.BACKEND_URL}`;

export async function GET(req: NextRequest) {
  const queryIndex = req.url.lastIndexOf('?');
  const query = queryIndex >= 0 ? req.url.substring(queryIndex) : '';
  return axios.get(`${API_BASE_URL}/project-fields${query}`, {
    headers: {
      Authorization: req.headers.get('Authorization'),
    }
  })
    .then((res) => {
      return NextResponse.json({
        message: 'Get successful',
        status: 200,
        data: res.data
      });
    })
    .catch((error) => {
      console.error('Get error:', error);
      return NextResponse.json(
        { error: 'Internal server error.' },
        { status: 500 }
      );
    });
}

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const res = await axios.post(`${API_BASE_URL}/project-fields`, requestBody, {
      headers: {
        Authorization: req.headers.get('Authorization'),
      }
    });

    const response = NextResponse.json({ 
      message: 'Get successful',
      status: 200,
      data: res.data
    });

    return response;
  } catch (error) {
    console.error('Get error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
