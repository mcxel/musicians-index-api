"use client";

import { useState, useEffect, useCallback } from "react";
import SavedPerformanceCard from "@/components/recordings/SavedPerformanceCard";
import SaveCounter from "@/components/recordings/SaveCounter";

type LibraryRecord = {
  id: string;
  title: string;
  durationSeconds: number;
  createdAt: string;
  expiresAt: string;
  daysRemaining?: number;
  isExpiringSoon?: boolean;
  renewalCount: number;
  status: string;
};

type LibraryResponse = {
  ok: boolean;
  records?: LibraryRecord[];
  quota?: { used: number; remaining: number; limit: number };
};

export default function SavedPerformancesPage() {
  const [records, setRecords] = useState<LibraryRecord[]>([]);
  const [quota, setQuota] = useState<{ used: number; remaining: number; limit: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recordings", { credentials: "include", cache: "no-store" });
      const data = (await res.json()) as LibraryResponse;
      if (data.ok) {
        setRecords(data.records ?? []);
        setQuota(data.quota ?? null);
      } else {
        setError("Unable to load saved performances.");
      }
    } catch {
      setError("Unable to load saved performances. Retry later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchLibrary(); }, [fetchLibrary]);

  async function handleRenew(id: string) {
    const res = await fetch(`/api/recordings/${id}/renew`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) void fetchLibrary();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/recordings/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  const active = records.filter((r) => r.status !== "DELETED" && r.status !== "DELETION_PENDING");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(0,0,0,0.88)",
          borderBottom: "1px solid rgba(0,255,255,0.15)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 8,
              letterSpacing: "0.35em",
              color: "#00FFFF",
              fontWeight: 900,
            }}
          >
            MEDIA LOCKER
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>
            Saved Performances
          </div>
        </div>
        {quota && <SaveCounter used={quota.used} limit={quota.limit} />}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Retention policy notice */}
        <div
          style={{
            background: "rgba(0,255,255,0.04)",
            border: "1px solid rgba(0,255,255,0.15)",
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 28,
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "#00FFFF" }}>Retention Policy:</strong> Up to{" "}
          <strong style={{ color: "#fff" }}>10 saves per rolling year</strong>. Each
          recording is kept for <strong style={{ color: "#fff" }}>90 days</strong>. Renew any
          time to extend by another 90 days. Max duration:{" "}
          <strong style={{ color: "#fff" }}>2 hours</strong> per recording.
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "rgba(255,255,255,0.3)",
              fontSize: 14,
            }}
          >
            Loading saved performances…
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#FF4444",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        ) : active.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "rgba(255,255,255,0.2)",
              fontSize: 14,
            }}
          >
            No saved performances yet.
            <div style={{ marginTop: 8, fontSize: 12 }}>
              When you go live, you can save the recording here.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {active.map((r) => (
              <SavedPerformanceCard
                key={r.id}
                id={r.id}
                title={r.title}
                durationSeconds={r.durationSeconds}
                createdAt={r.createdAt}
                expiresAt={r.expiresAt}
                daysRemaining={r.daysRemaining}
                isExpiringSoon={r.isExpiringSoon}
                renewalCount={r.renewalCount}
                onRenew={handleRenew}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
