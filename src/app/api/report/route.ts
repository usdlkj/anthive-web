import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = `${process.env.BACKEND_URL}/api`;

export async function GET(req: NextRequest) {
  const queryIndex = req.url.lastIndexOf('?');
  const query = queryIndex >= 0 ? req.url.substring(queryIndex) : '';
  return axios.get(`${API_BASE_URL}/report${query}`, {
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
    const body = await req.json();
    const { reportType, reportDate } = body;

    const response = await axios.post(`${process.env.BACKEND_URL}/api/report`, {
      reportType,
      reportDate,
    }, {
      headers: {
        Authorization: req.headers.get('Authorization'),
      },
    });

    return NextResponse.json({
      message: 'Post successful',
      status: 201,
      data: response.data,
    });
  } catch (error) {
    console.error('Post error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
