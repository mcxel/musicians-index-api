import { NextRequest, NextResponse } from 'next/server';
import { LogisticsAutomationService } from '@/lib/commerce/LogisticsAutomationService';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const quote = await LogisticsAutomationService.generateQuote(body);
  return NextResponse.json({ success: true, quote });
}