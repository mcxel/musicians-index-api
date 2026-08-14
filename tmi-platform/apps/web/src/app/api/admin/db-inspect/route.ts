export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Temporary, read-only diagnostic for the T1 Preview DB-runtime investigation.
// Reports table names + row counts only — never connection strings or any
// secret value. Remove once the eos-preview schema question is settled.
export async function GET(req: Request) {
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || (adminKey !== process.env.ADMIN_API_KEY && adminKey !== process.env.DB_INSPECT_TOKEN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    const tableNames = tables.map((t) => t.table_name);

    let userCount: number | string = "table absent";
    if (tableNames.includes("User")) {
      const r = await prisma.$queryRaw<Array<{ c: bigint }>>`SELECT count(*)::bigint as c FROM "User"`;
      userCount = Number(r[0]?.c ?? 0);
    }

    let lobbyEventCount: number | string = "table absent";
    if (tableNames.includes("lobby_events")) {
      const r = await prisma.$queryRaw<Array<{ c: bigint }>>`SELECT count(*)::bigint as c FROM "lobby_events"`;
      lobbyEventCount = Number(r[0]?.c ?? 0);
    }

    return NextResponse.json(
      {
        tableCount: tableNames.length,
        tableNames,
        userCount,
        lobbyEventCount,
        checkedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}
