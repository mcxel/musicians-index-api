import { NextResponse } from "next/server";

export interface SupportReportRecord {
  reportId: string;
  userMessage: string;
  category: string;
  userEmail?: string;
  diagnostics: Record<string, unknown>;
  createdAt: string;
}

// In-memory issue queue buffer for Observatory tracking
const SUPPORT_REPORT_QUEUE: SupportReportRecord[] = [];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SupportReportRecord;
    if (!body.reportId || !body.userMessage) {
      return NextResponse.json({ error: "Missing required report fields" }, { status: 400 });
    }

    const record: SupportReportRecord = {
      reportId: body.reportId,
      userMessage: body.userMessage,
      category: body.category || "BUG_REPORT",
      userEmail: body.userEmail,
      diagnostics: body.diagnostics || {},
      createdAt: new Date().toISOString(),
    };

    SUPPORT_REPORT_QUEUE.unshift(record);
    if (SUPPORT_REPORT_QUEUE.length > 100) SUPPORT_REPORT_QUEUE.pop();

    return NextResponse.json({
      success: true,
      reportId: record.reportId,
      message: "Report queued in Observatory Support Desk",
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    reports: SUPPORT_REPORT_QUEUE,
    totalQueued: SUPPORT_REPORT_QUEUE.length,
  });
}
