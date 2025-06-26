import { NextResponse } from "next/server";
import { fetchEmployees } from "@/app/lib/fetchEmployees";

export async function GET() {
  try {
    const employees = await fetchEmployees();
    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 