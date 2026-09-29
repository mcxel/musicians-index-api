"use client";

import { useEffect, useState } from "react";

type FriendsTab = "online" | "all" | "requests";

type ApiFriend = {
  id: string;
  name: string;
  role?: string;
  online?: boolean;
};

function readFriends(body: unknown): ApiFriend[] {
  const rows = Array.isArray(body)
    ? body
    : body && typeof body === "object" && Array.isArray((body as { friends?: unknown }).friends)
      ? (body as { friends: unknown[] }).friends
      : [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as Record<string, unknown>;
    const id = String(record.id ?? "");
    const name = String(record.displayName ?? record.name ?? record.username ?? "").trim();
    if (!id || !name) return [];
    if (record.relationshipStatus !== "accepted") return [];
    return [{
      id,
      name,
      role: typeof record.role === "string" ? record.role : undefined,
      online: record.online === true,
    }];
  });
}

export default function FriendsWidget() {
  const [tab, setTab] = useState<FriendsTab>("all");
  const [friends, setFriends] = useState<ApiFriend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/friends", { cache: "no-store", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return [];
        return readFriends(await res.json());
      })
      .then((rows) => {
        if (!cancelled) setFriends(rows);
      })
      .catch(() => {
        if (!cancelled) setFriends([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const online = friends.filter((friend) => friend.online);
  const list = tab === "online" ? online : friends;

  return (
    <div style={{ color: "#fff", padding: 8 }} data-testid="friends-truth-drawer">
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {(["all", "online"] as FriendsTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 9, fontWeight: 800,
              cursor: "pointer", letterSpacing: "0.08em",
              background: tab === t ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab === t ? "rgba(0,255,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: tab === t ? "#00FFFF" : "rgba(255,255,255,0.4)",
            }}
          >
            {t === "online" ? `ONLINE (${online.length})` : `ALL (${friends.length})`}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "24px 0", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Loading friends…</div>
      ) : list.length === 0 ? (
        <div data-testid="friends-empty" style={{ textAlign: "center", padding: "24px 8px", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          No friends yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {list.map((friend) => (
            <div key={friend.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{friend.name}</span>
              {friend.online ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88" }} /> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
