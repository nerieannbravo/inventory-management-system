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

    const fileUrl = `/api/upload?file=${fileName}`;
    console.log('File saved. URL:', fileUrl);
    return NextResponse.json({ url: fileUrl, name: file.name });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'File upload failed', details: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');

    if (!filename) {
      return NextResponse.json({ error: 'Filename parameter is required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filename)}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}