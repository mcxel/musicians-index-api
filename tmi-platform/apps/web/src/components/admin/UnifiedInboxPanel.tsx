"use client";

import { useState, useReducer, useEffect, useCallback } from "react";

type InboxCategory = "artist" | "venue" | "support" | "payout" | "sponsor";
type InboxPriority = "URGENT" | "NORMAL" | "LOW";
type InboxStatus   = "UNREAD" | "READ" | "ACTIONED";

interface InboxItem {
  id: string;
  category: InboxCategory;
  priority: InboxPriority;
  status: InboxStatus;
  from: string;
  subject: string;
  preview: string;
  ts: string;
  _notifId?: string;
}

// ── Notification → InboxItem mapping ─────────────────────────────────────────

type NotifType =
  | 'system' | 'room_joined' | 'room_started' | 'battle_result' | 'battle_invite'
  | 'tip_received' | 'tip_sent' | 'achievement' | 'follower' | 'mention'
  | 'ticket_confirmed' | 'payout' | 'subscription' | 'magazine_drop'
  | 'nft_sale' | 'beat_purchase' | 'moderation' | 'bot_alert';

interface TMINotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  ts: number;
  href?: string;
  emoji?: string;
}

function notifToCategory(type: NotifType): InboxCategory {
  if (type === 'payout') return 'payout';
  if (type === 'subscription' || type === 'magazine_drop') return 'sponsor';
  if (type === 'moderation' || type === 'bot_alert' || type === 'system' || type === 'ticket_confirmed') return 'support';
  return 'artist';
}

function notifToPriority(p: TMINotification['priority']): InboxPriority {
  if (p === 'critical' || p === 'high') return 'URGENT';
  if (p === 'medium') return 'NORMAL';
  return 'LOW';
}

function tsAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000)   return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function mapNotifToItem(n: TMINotification): InboxItem {
  return {
    id: `notif-${n.id}`,
    _notifId: n.id,
    category: notifToCategory(n.type),
    priority: notifToPriority(n.priority),
    status: n.read ? 'READ' : 'UNREAD',
    from: n.emoji ? `${n.emoji} ${n.type.replace(/_/g, ' ')}` : n.type.replace(/_/g, ' '),
    subject: n.title,
    preview: n.body,
    ts: tsAgo(n.ts),
  };
}

// ── Seed messages (platform admin activity) ───────────────────────────────────

const SEED_MESSAGES: InboxItem[] = [
  { id: "i1",  category: "payout",  priority: "URGENT",  status: "UNREAD",   from: "Julius.B",       subject: "Payout batch #441 blocked",          preview: "Stripe flagged 3 payouts for manual review. Need override.",       ts: "2m ago"  },
  { id: "i2",  category: "sponsor", priority: "URGENT",  status: "UNREAD",   from: "Beats by Dre",   subject: "Slot confirmation required",         preview: "Campaign slot #7 unconfirmed — goes live in 4h. Awaiting sign.",  ts: "5m ago"  },
  { id: "i3",  category: "artist",  priority: "NORMAL",  status: "UNREAD",   from: "Verse.XL",       subject: "Feature request — setlist upload",   preview: "Wants to upload pre-show setlist via artist dashboard.",           ts: "11m ago" },
  { id: "i4",  category: "venue",   priority: "NORMAL",  status: "UNREAD",   from: "Venue Ops",      subject: "Gate 2 camera offline",              preview: "Gate 2 feed dropped at 21:14. Backup stream active.",             ts: "18m ago" },
  { id: "i5",  category: "support", priority: "URGENT",  status: "UNREAD",   from: "User #u-4421",   subject: "Ticket purchase failed, charged",    preview: "Payment processed but ticket not delivered. Requesting refund.",   ts: "23m ago" },
  { id: "i6",  category: "artist",  priority: "NORMAL",  status: "READ",     from: "Crown.T",        subject: "Room access request",                preview: "Requesting access to Cypher Room 5 for tonight's set.",           ts: "35m ago" },
  { id: "i7",  category: "venue",   priority: "LOW",     status: "READ",     from: "Venue Ops",      subject: "Load-in schedule update",            preview: "Updated load-in times for Friday — see attached sheet.",          ts: "1h ago"  },
  { id: "i8",  category: "payout",  priority: "LOW",     status: "ACTIONED", from: "Revenue Bot",    subject: "Batch #440 complete",                preview: "14 payouts processed. $18,420 disbursed. 0 failures.",            ts: "2h ago"  },
  { id: "i9",  category: "sponsor", priority: "NORMAL",  status: "ACTIONED", from: "NovaTech Ads",   subject: "Q2 renewal intent",                  preview: "Sponsor confirming Q2 renewal. Contracts attached for review.",    ts: "3h ago"  },
  { id: "i10", category: "support", priority: "LOW",     status: "ACTIONED", from: "User #u-7712",   subject: "Login issue resolved",               preview: "User confirmed resolution after password reset.",                 ts: "4h ago"  },
];

// ── Reducer ───────────────────────────────────────────────────────────────────

type Action =
  | { type: "mark_read"; id: string }
  | { type: "action"; id: string }
  | { type: "prepend_live"; items: InboxItem[] };

function inboxReducer(state: InboxItem[], action: Action): InboxItem[] {
  if (action.type === "mark_read") {
    return state.map((m) => m.id === action.id && m.status === "UNREAD" ? { ...m, status: "READ" } : m);
  }
  if (action.type === "action") {
    return state.map((m) => m.id === action.id ? { ...m, status: "ACTIONED" } : m);
  }
  if (action.type === "prepend_live") {
    const existingIds = new Set(state.map((m) => m.id));
    const fresh = action.items.filter((i) => !existingIds.has(i.id));
    return fresh.length > 0 ? [...fresh, ...state] : state;
  }
  return state;
}

// ── Style maps ────────────────────────────────────────────────────────────────

const CAT_STYLE: Record<InboxCategory, string> = {
  artist:  "border-fuchsia-400/50 text-fuchsia-300 bg-fuchsia-500/10",
  venue:   "border-cyan-400/50 text-cyan-300 bg-cyan-500/10",
  support: "border-amber-400/50 text-amber-300 bg-amber-500/10",
  payout:  "border-green-400/50 text-green-300 bg-green-500/10",
  sponsor: "border-violet-400/50 text-violet-300 bg-violet-500/10",
};

const CAT_LABEL: Record<InboxCategory, string> = {
  artist: "ARTIST", venue: "VENUE", support: "SUPPORT", payout: "PAYOUT", sponsor: "SPONSOR",
};

const PRI_STYLE: Record<InboxPriority, string> = {
  URGENT: "text-red-300", NORMAL: "text-zinc-400", LOW: "text-zinc-600",
};

const ALL_CATS: InboxCategory[] = ["artist", "venue", "support", "payout", "sponsor"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function UnifiedInboxPanel() {
  const [messages, dispatch] = useReducer(inboxReducer, SEED_MESSAGES);
  const [filter, setFilter]   = useState<InboxCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  // Fetch session to show who is viewing
  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { user?: { email?: string } } | null) => {
        if (data?.user?.email) setUserEmail(data.user.email);
      })
      .catch(() => {});
  }, []);

  // Poll notifications and merge into inbox
  const loadNotifications = useCallback(async () => {
    try {
      const r = await fetch('/api/notifications', { credentials: 'include', cache: 'no-store' });
      if (!r.ok) return;
      const data = (await r.json()) as { notifications: TMINotification[]; unreadCount: number };
      if (!Array.isArray(data.notifications)) return;
      const mapped = data.notifications.map(mapNotifToItem);
      dispatch({ type: "prepend_live", items: mapped });
      setLiveCount(data.unreadCount);
    } catch {
      // notifications unavailable — keep seed messages
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const id = setInterval(() => void loadNotifications(), 30_000);
    return () => clearInterval(id);
  }, [loadNotifications]);

  // Mark notification read via API when item opened
  async function markNotifRead(notifId: string) {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', id: notifId }),
      });
    } catch {}
  }

  const visible = filter === "all" ? messages : messages.filter((m) => m.category === filter);
  const unread  = messages.filter((m) => m.status === "UNREAD").length;
  const urgent  = messages.filter((m) => m.priority === "URGENT" && m.status === "UNREAD").length;

  function toggle(id: string) {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next) {
      dispatch({ type: "mark_read", id });
      const item = messages.find((m) => m.id === id);
      if (item?._notifId) void markNotifRead(item._notifId);
    }
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-cyan-400/30 bg-black/60 p-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-400">
            {userEmail ? `Signed in · ${userEmail}` : 'Unified Inbox'}
          </p>
          <p className="text-[11px] font-black uppercase text-white">Platform Messages</p>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {liveCount > 0 && (
            <span className="rounded border border-cyan-500/60 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-300">
              {liveCount} LIVE
            </span>
          )}
          {urgent > 0 && (
            <span className="rounded border border-red-500/60 bg-red-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-red-300">
              {urgent} URGENT
            </span>
          )}
          <span className="rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-300">
            {unread} NEW
          </span>
        </div>
      </header>

      {/* Category filter */}
      <div className="mb-3 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] transition ${filter === "all" ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}
        >
          All ({messages.length})
        </button>
        {ALL_CATS.map((cat) => {
          const count = messages.filter((m) => m.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`rounded border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] transition ${filter === cat ? `${CAT_STYLE[cat].split(" ")[0]} bg-white/5 ${CAT_STYLE[cat].split(" ")[1]}` : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}
            >
              {CAT_LABEL[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Message list */}
      <div className="flex flex-col gap-1 overflow-y-auto">
        {visible.length === 0 && (
          <p className="py-6 text-center text-[10px] text-zinc-600">No messages in this category</p>
        )}
        {visible.map((msg) => {
          const isOpen     = expanded === msg.id;
          const isActioned = msg.status === "ACTIONED";
          const isUnread   = msg.status === "UNREAD";
          return (
            <div
              key={msg.id}
              className={`rounded-lg border bg-black/40 transition ${isActioned ? "border-white/5 opacity-50" : "border-white/10 hover:border-white/20"}`}
            >
              <button
                type="button"
                onClick={() => toggle(msg.id)}
                className="w-full px-2.5 py-2 text-left"
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${isUnread ? "bg-cyan-400" : "bg-transparent"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`rounded border px-1 py-0.5 text-[7px] font-black uppercase ${CAT_STYLE[msg.category]}`}>
                        {CAT_LABEL[msg.category]}
                      </span>
                      <span className={`text-[7px] font-black uppercase ${PRI_STYLE[msg.priority]}`}>
                        {msg.priority === "URGENT" ? "⚡ URGENT" : msg.priority}
                      </span>
                      <span className="ml-auto text-[7px] text-zinc-600">{msg.ts}</span>
                    </div>
                    <p className={`mt-0.5 text-[9px] font-black uppercase ${isUnread ? "text-white" : "text-zinc-400"}`}>
                      {msg.from}
                    </p>
                    <p className="truncate text-[8px] text-zinc-500">{msg.subject}</p>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-white/5 px-2.5 pb-2 pt-1.5">
                  <p className="mb-2 text-[8px] leading-relaxed text-zinc-400">{msg.preview}</p>
                  {!isActioned && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "action", id: msg.id })}
                      className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-zinc-300 hover:border-white/30 hover:text-white"
                    >
                      Mark Actioned
                    </button>
                  )}
                  {isActioned && (
                    <span className="text-[7px] font-black uppercase text-zinc-600">Actioned</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
