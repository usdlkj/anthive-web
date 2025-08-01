import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = `${process.env.BACKEND_URL}`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const res = await axios.get(`${API_BASE_URL}/companies/${id}/users`, {
      headers: {
        Authorization: req.headers.get('Authorization'),
      },
    });

    return NextResponse.json({
      message: 'Get successful',
      status: 200,
      data: res.data,
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}