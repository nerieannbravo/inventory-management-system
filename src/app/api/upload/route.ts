import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bodyNumber = formData.get('body_number') as string | null;

    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Use body_number if provided, else fallback to timestamp
    const safeBodyNumber = bodyNumber ? bodyNumber.replace(/[^a-zA-Z0-9_-]/g, '') : Date.now().toString();
    const fileName = `${safeBodyNumber}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);
    console.log('Saving file to:', filePath);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/api/upload/${fileName}`;
    console.log('File saved. URL:', fileUrl);
    return NextResponse.json({ url: fileUrl, name: file.name });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'File upload failed', details: String(err) }, { status: 500 });
  }
}