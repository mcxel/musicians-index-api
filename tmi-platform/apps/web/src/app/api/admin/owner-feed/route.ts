import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../_utils/require-admin";

interface FeedItem {
  id: string;
  source: string;
  type: string;
  summary: string;
  timestamp: number;
}

async function readJsonArray(filePath: string): Promise<Record<string, unknown>[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const appsRoot = resolve(process.cwd(), "..");

  const [dispatchEvents, workforceLedger, legalEvents, securityActions, thunderHooks, partsRequests] = await Promise.all([
    readJsonArray(resolve(appsRoot, "willdoit", "data", "dispatch-events.json")),
    readJsonArray(resolve(appsRoot, "bernoutglobal-llc", "data", "workforce-ledger.json")),
    readJsonArray(resolve(appsRoot, "bernoutglobal-llc", "data", "legal-events.json")),
    readJsonArray(resolve(appsRoot, "bernoutglobal-llc", "data", "security-actions.json")),
    readJsonArray(resolve(appsRoot, "thunderworld", "data", "workforce-hooks.json")),
    readJsonArray(resolve(appsRoot, "need-a-charge", "data", "parts-requests.json")),
  ]);

  const feed: FeedItem[] = [
    ...dispatchEvents.map((row) => ({
      id: String(row.eventId ?? row.requestId ?? Math.random()),
      source: "willdoit",
      type: String(row.type ?? "dispatch.event"),
      summary: `Dispatch ${String(row.type ?? "event")}`,
      timestamp: toNumber(row.timestamp),
    })),
    ...workforceLedger.map((row) => ({
      id: String(row.ledgerId ?? row.requestId ?? Math.random()),
      source: "bernoutglobal-llc",
      type: `workforce.${String(row.action ?? "unknown").toLowerCase()}`,
      summary: `Workforce ${String(row.action ?? "event")} $${String(row.amount ?? 0)}`,
      timestamp: toNumber(row.timestamp),
    })),
    ...legalEvents.map((row) => ({
      id: String(row.eventId ?? row.caseId ?? Math.random()),
      source: "berntout-law",
      type: String(row.type ?? "legal.event"),
      summary: `Legal ${String(row.type ?? "event")}`,
      timestamp: toNumber(row.timestamp),
    })),
    ...securityActions.map((row) => ({
      id: String(row.actionId ?? row.incidentId ?? Math.random()),
      source: "security",
      type: String(row.type ?? "security.event"),
      summary: `Security ${String(row.type ?? "event")}`,
      timestamp: toNumber(row.timestamp),
    })),
    ...thunderHooks.map((row) => ({
      id: String(row.hookId ?? row.requestId ?? Math.random()),
      source: "thunderworld",
      type: String(row.type ?? "thunderworld.workforce"),
      summary: `ThunderWorld workforce ${String(row.requestType ?? "request")}`,
      timestamp: toNumber(row.timestamp),
    })),
    ...partsRequests.map((row) => ({
      id: String(row.requestId ?? row.itemSku ?? Math.random()),
      source: "need-a-charge",
      type: "inventory.parts.request",
      summary: `Parts request ${String(row.itemSku ?? "unknown")} x${String(row.quantity ?? 0)}`,
      timestamp: toNumber(row.createdAt),
    })),
  ]
    .filter((row) => row.timestamp > 0)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 200);

  return NextResponse.json({ ok: true, generatedAt: Date.now(), feed });
}
