import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name || 'upload.jpg';

    // Use node FormData (not browser's)
    const nodeForm = new FormData();
    nodeForm.append('file', buffer, filename);

    const backendUrl = `${process.env.BACKEND_URL}/api/payment-providers/upload-image`;
    const authHeader = req.headers.get('Authorization');

    const response = await axios.post(backendUrl, nodeForm, {
      headers: {
        Authorization: authHeader || '',
        ...nodeForm.getHeaders(),
      },
    });

    return NextResponse.json({ url: response.data });
  } catch (uploadError: any) {
    console.error('Error uploading to backend:', uploadError.message || uploadError);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}