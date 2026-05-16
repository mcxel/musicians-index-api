"use client";

import { useState } from "react";

type NodeRole = "bot" | "admin" | "worker" | "security" | "builder" | "reporter" | "venue";
type NodeStatus = "ACTIVE" | "PAUSED" | "OFFLINE" | "STANDBY";

interface ChainNode {
  id: string;
  name: string;
  role: NodeRole;
  status: NodeStatus;
  level: number;
  taskCount: number;
}

const CHAIN_NODES: ChainNode[] = [
  { id: "big-ace",    name: "Big Ace",     role: "admin",    status: "ACTIVE",  level: 1, taskCount: 18 },
  { id: "marcel",     name: "Marcel",      role: "admin",    status: "ACTIVE",  level: 2, taskCount: 12 },
  { id: "jay-paul",   name: "Jay Paul",    role: "builder",  status: "ACTIVE",  level: 2, taskCount: 9  },
  { id: "micah",      name: "Micah",       role: "reporter", status: "STANDBY", level: 2, taskCount: 4  },
  { id: "admin-chain",name: "Admin Chain", role: "admin",    status: "ACTIVE",  level: 3, taskCount: 7  },
  { id: "sec-chain",  name: "Security",    role: "security", status: "ACTIVE",  level: 3, taskCount: 5  },
  { id: "bld-chain",  name: "Builder",     role: "builder",  status: "ACTIVE",  level: 3, taskCount: 6  },
  { id: "rep-chain",  name: "Reporter",    role: "reporter", status: "STANDBY", level: 3, taskCount: 2  },
  { id: "venue-chain",name: "Venue Chain", role: "venue",    status: "ACTIVE",  level: 3, taskCount: 8  },
];

const ROLE_COLOR: Record<NodeRole, string> = {
  admin:    "border-amber-400/60 text-amber-200",
  bot:      "border-cyan-400/60 text-cyan-200",
  worker:   "border-zinc-400/50 text-zinc-300",
  security: "border-rose-400/60 text-rose-200",
  builder:  "border-violet-400/60 text-violet-200",
  reporter: "border-green-400/60 text-green-200",
  venue:    "border-fuchsia-400/60 text-fuchsia-200",
};

const STATUS_DOT: Record<NodeStatus, string> = {
  ACTIVE:  "bg-green-400",
  PAUSED:  "bg-amber-400",
  OFFLINE: "bg-red-500",
  STANDBY: "bg-zinc-500",
};

type NodeAction = "assign" | "promote" | "pause" | "reroute" | "summon";

const ACTIONS: NodeAction[] = ["assign", "promote", "pause", "reroute", "summon"];

export default function ChainCommandPanel() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  function handleAction(nodeId: string, action: NodeAction) {
    const node = CHAIN_NODES.find((n) => n.id === nodeId);
    if (!node) return;
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${action.toUpperCase()} → ${node.name}`, ...prev.slice(0, 9)]);
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-amber-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-400">Chain Command</p>
          <p className="text-[11px] font-black uppercase text-white">Authority Rail</p>
        </div>
        <span className="rounded border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-amber-200">
          {CHAIN_NODES.filter((n) => n.status === "ACTIVE").length} ACTIVE
        </span>
      </header>

      {/* Node list */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {CHAIN_NODES.map((node) => (
          <div
            key={node.id}
            className={`cursor-pointer rounded-lg border bg-black/45 p-2 transition hover:bg-black/60 ${activeNode === node.id ? "border-amber-300/60" : "border-white/10"}`}
            style={{ paddingLeft: `${(node.level - 1) * 12 + 8}px` }}
            onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[node.status]}`} />
                <span className={`text-[10px] font-black uppercase ${ROLE_COLOR[node.role].split(" ")[1]}`}>{node.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-500">{node.taskCount}t</span>
                <span className={`rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase ${ROLE_COLOR[node.role]}`}>{node.role}</span>
              </div>
            </div>

            {/* Action strip */}
            {activeNode === node.id && (
              <div className="mt-2 flex flex-wrap gap-1">
                {ACTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={(e) => { e.stopPropagation(); handleAction(node.id, a); }}
                    className="rounded border border-amber-300/30 bg-amber-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-amber-100 hover:bg-amber-500/25 hover:border-amber-300/60"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action log */}
      {log.length > 0 && (
        <div className="mt-2 rounded border border-white/10 bg-black/40 p-2">
          {log.slice(0, 4).map((entry, i) => (
            <p key={i} className="text-[8px] text-zinc-400">{entry}</p>
          ))}
        </div>
      )}
    </section>
  );
}
