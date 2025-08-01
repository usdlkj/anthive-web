import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = `${process.env.BACKEND_URL}`;

export async function GET(req: NextRequest) {
  const queryIndex = req.url.lastIndexOf('?');
  const query = queryIndex >= 0 ? req.url.substring(queryIndex) : '';
  return axios.get(`${API_BASE_URL}/users${query}`, {
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
  console.log('We have reached POST route');
  const requestBody = await req.json();
  console.log(requestBody);
  const ret = axios.post(`${API_BASE_URL}/users`, requestBody, {
    headers: {
      Authorization: req.headers.get('Authorization'),
    }
  })
  .then((res) => {
    if (res) {
      return NextResponse.json({ 
        message: 'Post successful',
        status: 200,
        data: res.data
      });
    }
  })
  .catch((error) => {
    console.error('Get error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  });

  return ret;
}
