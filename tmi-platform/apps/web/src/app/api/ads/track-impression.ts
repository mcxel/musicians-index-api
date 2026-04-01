// Mock impression tracking API
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // In-memory: just return success
  return NextResponse.json({ success: true });
}
