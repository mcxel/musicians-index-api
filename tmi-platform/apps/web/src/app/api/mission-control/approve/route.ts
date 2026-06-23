import { NextResponse } from "next/server";
import { approveTask, rejectTask, addTask } from "@/lib/admin/MissionControlTaskStore";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const action: string = typeof body.action === "string" ? body.action : "";
  const taskId: string = typeof body.taskId === "string" ? body.taskId : "";
  const actorName: string = typeof body.actorName === "string" ? body.actorName : "Marcel";

  if (action === "approve") {
    const ok = approveTask(taskId, actorName);
    return NextResponse.json({ ok, taskId, action: "approved" }, { status: ok ? 200 : 404 });
  }

  if (action === "reject") {
    const ok = rejectTask(taskId, actorName);
    return NextResponse.json({ ok, taskId, action: "rejected" }, { status: ok ? 200 : 404 });
  }

  if (action === "add") {
    const title: string = typeof body.title === "string" ? body.title.trim() : "";
    const description: string = typeof body.description === "string" ? body.description.trim() : "";
    const requestedBy: string = typeof body.requestedBy === "string" ? body.requestedBy : "system";
    if (!title) return NextResponse.json({ ok: false, error: "title required" }, { status: 400 });
    const task = addTask({ title, description, requestedBy });
    return NextResponse.json({ ok: true, task });
  }

  return NextResponse.json({ ok: false, error: "unknown action" }, { status: 400 });
}
