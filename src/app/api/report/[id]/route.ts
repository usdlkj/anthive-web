import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import axios from 'axios';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, context: any) {
  const { id } = await context.params;

  const backendUrl = `${process.env.BACKEND_URL}/api/report/${id}/download-excel`;
  const response = await axios.get(backendUrl, {
    responseType: 'arraybuffer',
    headers: {
      Authorization: req.headers.get('Authorization'),
    }
  });

  const headers = new Headers();
  headers.set('Content-Type', response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  headers.set('Content-Disposition', response.headers['content-disposition'] || `attachment; filename=report-${id}.xlsx`);

  return new NextResponse(response.data, {
    status: 200,
    headers,
  });
}

export async function DELETE(req: NextRequest, context: any) {
  const { id } = context.params;

  const backendUrl = `${process.env.BACKEND_URL}/api/report/${id}`;
  const token = req.headers.get('Authorization');

  try {
    const response = await axios.delete(backendUrl, {
      headers: {
        Authorization: token || '',
      },
    });

    return new NextResponse(null, { status: response.status });
  } catch (error: any) {
    console.error('Error deleting report:', error);
    return new NextResponse('Failed to delete report', { status: error.response?.status || 500 });
  }
}