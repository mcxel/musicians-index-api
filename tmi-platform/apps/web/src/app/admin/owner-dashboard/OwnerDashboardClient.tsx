"use client";

import { useEffect, useMemo, useState } from "react";

interface FeedItem {
  id: string;
  source: string;
  type: string;
  summary: string;
  timestamp: number;
}

export default function OwnerDashboardClient() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      const response = await fetch("/api/admin/owner-feed", { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { feed?: FeedItem[] };
      if (!disposed) {
        setFeed(Array.isArray(payload.feed) ? payload.feed : []);
        setLoading(false);
      }
    };

    void load();
    const timer = setInterval(() => {
      void load();
    }, 10000);

    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, []);

  const emptyText = useMemo(() => (loading ? "Loading live feed..." : "No events recorded yet."), [loading]);

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <h1 style={{ marginTop: 0 }}>Owner Dashboard</h1>
      <p style={{ color: "#5f6080" }}>Live shared service alerts and isolation protection timeline.</p>
      {feed.length === 0 ? (
        <p>{emptyText}</p>
      ) : (
        <ul style={{ display: "grid", gap: "0.65rem", listStyle: "none", padding: 0 }}>
          {feed.map((item) => (
            <li key={item.id} style={{ border: "1px solid #d8d9ef", borderRadius: 10, padding: "0.75rem" }}>
              <strong>{item.summary}</strong>
              <div style={{ fontSize: "0.85rem", color: "#5f6080", marginTop: "0.25rem" }}>
                {item.source} | {item.type} | {new Date(item.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
