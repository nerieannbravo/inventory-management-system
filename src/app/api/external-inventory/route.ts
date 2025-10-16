import { NextResponse } from 'next/server';

/**
 * FTMS Integration Removed
 * 
 * This endpoint was previously used to fetch items from an external FTMS (Finance Tracking Management System).
 * The system has been updated to serve as the primary source for item records.
 * 
 * FTMS integration has been completely removed from the system.
 */
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'FTMS integration has been removed. This system is now the primary source for item records.' 
    }, 
    { status: 410 } // 410 Gone - indicates the resource is no longer available
  );
} 