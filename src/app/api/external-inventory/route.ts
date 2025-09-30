import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const FTMS_ITEMS_URL = process.env.FTMS_ITEMS_URL;
    if (!FTMS_ITEMS_URL) {
      throw new Error('FTMS_ITEMS_URL is not configured in the environment');
    }
    const response = await fetch(FTMS_ITEMS_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch external inventory: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 