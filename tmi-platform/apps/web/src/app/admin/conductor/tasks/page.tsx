"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  subsystem?: string;
  team?: { name: string; category: string } | null;
  agent?: { handle: string; displayName: string } | null;
  dueAt?: string;
  createdAt: string;
};

const PRIORITY_COLOR: Record<string, string> = {
  P0_CRITICAL: "text-red-400 bg-red-950/30 border-red-500/40",
  P1_HIGH: "text-orange-400 bg-orange-950/30 border-orange-500/40",
  P2_MEDIUM: "text-yellow-400 bg-yellow-950/30 border-yellow-500/40",
  P3_LOW: "text-green-400 bg-green-950/30 border-green-500/40",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-white/60",
  IN_PROGRESS: "text-blue-400",
  BLOCKED: "text-red-400",
  REVIEW: "text-yellow-400",
  APPROVED: "text-green-400",
  COMPLETED: "text-green-600",
  ESCALATED: "text-red-500",
  REJECTED: "text-red-300",
};

export default function ConductorTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ status?: string; priority?: string; subsystem?: string }>({});

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.status) params.set("status", filter.status);
    if (filter.priority) params.set("priority", filter.priority);
    if (filter.subsystem) params.set("subsystem", filter.subsystem);
    fetch(`/api/conductor/tasks?${params}`)
      .then((r) => r.json())
      .then((d) => { setTasks(d.tasks ?? []); setTotal(d.total ?? 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/admin/conductor" className="text-white/30 text-xs hover:text-white/60 mb-1 block">← MC Command Center</a>
            <h1 className="text-2xl font-black">Task Queue</h1>
            <p className="text-white/40 text-sm">{total} total tasks</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {["P0_CRITICAL", "P1_HIGH", "P2_MEDIUM", "P3_LOW"].map((p) => (
            <button
              key={p}
              onClick={() => setFilter((f) => ({ ...f, priority: f.priority === p ? undefined : p }))}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter.priority === p ? "bg-white/20 border-white/40 text-white" : "border-white/10 text-white/40 hover:text-white/70"}`}
            >
              {p.replace("_", " ")}
            </button>
          ))}
          {["PENDING", "IN_PROGRESS", "BLOCKED", "ESCALATED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter((f) => ({ ...f, status: f.status === s ? undefined : s }))}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter.status === s ? "bg-white/20 border-white/40 text-white" : "border-white/10 text-white/40 hover:text-white/70"}`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-white/40 text-sm">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-white/30 text-sm">
            No tasks found. MC has not assigned any tasks yet.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/8 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${PRIORITY_COLOR[task.priority] ?? "text-white/60 border-white/10"}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs font-semibold ${STATUS_COLOR[task.status] ?? "text-white/60"}`}>
                        {task.status}
                      </span>
                      {task.subsystem && (
                        <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded">{task.subsystem}</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white">{task.title}</div>
                    <div className="text-xs text-white/40 mt-1 line-clamp-2">{task.description}</div>
                    <div className="flex gap-3 mt-2 text-xs text-white/30">
                      {task.team && <span>Team: {task.team.name}</span>}
                      {task.agent && <span>Agent: {task.agent.handle}</span>}
                      {task.dueAt && <span>Due: {new Date(task.dueAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-white/20 whitespace-nowrap">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
