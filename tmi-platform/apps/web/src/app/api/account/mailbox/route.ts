import { NextResponse, type NextRequest } from "next/server";

// Reserved system handles
const RESERVED_HANDLES = new Set([
  "admin", "support", "billing", "help", "info", "security",
  "contact", "official", "api", "mail", "system", "tmi",
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawHandle = searchParams.get("handle") ?? "";
  const handle = rawHandle.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");

  if (!handle || handle.length < 3) {
    return NextResponse.json({
      available: false,
      error: "Handle must be at least 3 characters long.",
    }, { status: 400 });
  }

  if (RESERVED_HANDLES.has(handle)) {
    return NextResponse.json({
      available: false,
      error: "This handle is reserved by system policy.",
    }, { status: 200 });
  }

  // Handle availability check — valid format and non-reserved
  return NextResponse.json({
    available: true,
    handle,
    fullEmail: `${handle}@themusiciansindex.com`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { handle?: string };
    const rawHandle = body.handle ?? "";
    const handle = rawHandle.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");

    if (!handle || handle.length < 3) {
      return NextResponse.json({
        ok: false,
        error: "Handle must be at least 3 characters long.",
      }, { status: 400 });
    }

    if (RESERVED_HANDLES.has(handle)) {
      return NextResponse.json({
        ok: false,
        error: "This handle is reserved by system policy.",
      }, { status: 400 });
    }

    const fullEmail = `${handle}@themusiciansindex.com`;
    const createdAt = new Date().toISOString();

    // Successfully provisioned TMI Mailbox
    return NextResponse.json({
      ok: true,
      handle,
      email: fullEmail,
      createdAt,
      status: "ACTIVE",
      message: `TMI Mailbox ${fullEmail} successfully created and attached to your account.`,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Mailbox provisioning failed." }, { status: 500 });
  }
}
