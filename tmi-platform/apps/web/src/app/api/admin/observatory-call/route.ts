export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { resolveMessagingUser } from "@/lib/messaging/resolveMessagingUser";
import {
  createCall,
  getCall,
  heartbeatPresence,
  isUserOnline,
  listActiveFor,
  listIncomingFor,
  listOnlinePresence,
  updateCallStatus,
  type ObservatoryCallStatus,
} from "@/lib/admin/ObservatoryCallEngine";
import { TMI_GOVERNANCE_CLUSTER } from "@/lib/auth/GovernanceClusterEngine";
import prisma from "@/lib/prisma";
import { resolveSessionDisplayName } from "@/lib/auth/resolveSessionIdentity";

async function governanceContacts(excludeUserId: string) {
  const emails = TMI_GOVERNANCE_CLUSTER.members.flatMap((m) => [
    m.adminEmail.toLowerCase(),
    ...(m.emailAliases ?? []).map((e) => e.toLowerCase()),
  ]);
  const users = await prisma.user.findMany({
    where: {
      OR: emails.map((e) => ({ email: { equals: e, mode: "insensitive" as const } })),
    },
    select: { id: true, email: true, displayName: true },
  });
  const byEmail = new Map(users.map((u) => [u.email?.toLowerCase() ?? "", u]));

  return TMI_GOVERNANCE_CLUSTER.members
    .map((m) => {
      const emailsForMember = [
        m.adminEmail.toLowerCase(),
        ...(m.emailAliases ?? []).map((e) => e.toLowerCase()),
      ];
      const user = emailsForMember.map((e) => byEmail.get(e)).find(Boolean);
      if (!user || user.id === excludeUserId) return null;
      return {
        userId: user.id,
        memberId: m.memberId,
        displayName: resolveSessionDisplayName({
          email: user.email,
          dbDisplayName: user.displayName ?? m.name,
          userId: user.id,
        }),
        online: isUserOnline(user.id),
        adminHub:
          m.memberId === "justin"
            ? "/admin/justin"
            : m.memberId === "jaypaul"
              ? "/admin/jay-paul"
              : m.memberId === "marcel"
                ? "/admin/marcel"
                : "/admin/overseer",
      };
    })
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const callId = searchParams.get("callId");
  if (callId) {
    const call = getCall(callId);
    if (!call) return NextResponse.json({ error: "Call not found" }, { status: 404 });
    if (call.callerId !== user.id && call.calleeId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ call, calleeOnline: isUserOnline(call.calleeId) });
  }

  heartbeatPresence({
    userId: user.id,
    displayName: user.displayName,
    path: searchParams.get("path") ?? undefined,
  });

  const contacts = await governanceContacts(user.id);
  return NextResponse.json({
    me: { userId: user.id, displayName: user.displayName },
    contacts,
    incoming: listIncomingFor(user.id),
    active: listActiveFor(user.id),
    online: listOnlinePresence(),
  });
}

export async function POST(req: NextRequest) {
  const user = await resolveMessagingUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    action?: string;
    calleeId?: string;
    calleeName?: string;
    callId?: string;
    status?: ObservatoryCallStatus;
    threadId?: string;
    path?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action ?? "create";

  if (action === "heartbeat") {
    heartbeatPresence({
      userId: user.id,
      displayName: user.displayName,
      path: body.path,
    });
    return NextResponse.json({ ok: true, online: true });
  }

  if (action === "create") {
    if (!body.calleeId) {
      return NextResponse.json({ error: "calleeId required" }, { status: 400 });
    }
    let calleeName = body.calleeName?.trim();
    if (!calleeName) {
      const db = await prisma.user.findUnique({
        where: { id: body.calleeId },
        select: { displayName: true, email: true },
      });
      calleeName = resolveSessionDisplayName({
        email: db?.email,
        dbDisplayName: db?.displayName,
        userId: body.calleeId,
      });
    }
    try {
      const call = createCall({
        callerId: user.id,
        callerName: user.displayName,
        calleeId: body.calleeId,
        calleeName,
        threadId: body.threadId,
      });
      return NextResponse.json({
        call,
        calleeOnline: isUserOnline(body.calleeId),
        signalingRoomId: call.callId,
      });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Unable to create call" },
        { status: 400 },
      );
    }
  }

  if (action === "update") {
    if (!body.callId || !body.status) {
      return NextResponse.json({ error: "callId and status required" }, { status: 400 });
    }
    const call = updateCallStatus(body.callId, body.status, user.id);
    if (!call) return NextResponse.json({ error: "Call not found" }, { status: 404 });
    return NextResponse.json({ call, signalingRoomId: call.callId });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
