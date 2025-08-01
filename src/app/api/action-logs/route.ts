import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = `${process.env.BACKEND_URL}/api`;

export async function GET(req: NextRequest) {
  const queryIndex = req.url.lastIndexOf('?');
  const query = queryIndex >= 0 ? req.url.substring(queryIndex) : '';
  return axios.get(`${API_BASE_URL}/action-logs${query}`, {
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
