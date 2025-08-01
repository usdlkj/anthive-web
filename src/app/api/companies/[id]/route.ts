import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = `${process.env.BACKEND_URL}`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const res = await axios.get(`${API_BASE_URL}/companies/${id}`, {
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

export async function PATCH(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop(); // extract ID

    const res = await axios.patch(`${API_BASE_URL}/companies/${id}`, requestBody, {
      headers: {
        Authorization: req.headers.get("Authorization") || "",
      },
    });

    return NextResponse.json(
      {
        message: "Update forwarded successfully",
        status: 200,
        data: res.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop(); // extract ID

    const res = await axios.delete(`${API_BASE_URL}/companies/${id}`, {
      headers: {
        Authorization: req.headers.get("Authorization") || "",
      },
    });

    return NextResponse.json(
      {
        message: "Delete processed successfully",
        status: 200,
        data: res.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}