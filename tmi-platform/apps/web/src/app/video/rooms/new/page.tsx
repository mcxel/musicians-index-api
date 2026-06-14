"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VideoRoomRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"creating" | "fallback" | "error">("creating");

  useEffect(() => {
    const inviteId = searchParams?.get("inviteId") ?? "";
    const name = searchParams?.get("name") ?? "";

    async function createOrFallback() {
      try {
        // Try Daily.co room creation first
        const res = await fetch("/api/video/rooms", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userName: name || undefined }),
        });

        if (res.ok) {
          const data = await res.json() as { roomId?: string; roomUrl?: string; token?: string };
          if (data.roomUrl && data.roomId) {
            router.replace(`/video/rooms/${data.roomId}?roomUrl=${encodeURIComponent(data.roomUrl)}${data.token ? `&token=${encodeURIComponent(data.token)}` : ""}`);
            return;
          }
        }
      } catch { /* fall through */ }

      // Fallback: route to TMI live room system (no DAILY_API_KEY required)
      setStatus("fallback");
      const roomId = inviteId ? `party-${inviteId.slice(0, 8)}` : "fan-meetup";
      const guestParam = name ? `&guest=${encodeURIComponent(name)}` : "";
      router.replace(`/live/rooms/${roomId}?from=billboard${guestParam}`);
    }

    void createOrFallback();
  }, [router, searchParams]);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🎥</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
          {status === "fallback" ? "Joining room…" : "Starting video room…"}
        </div>
      </div>
    </main>
  );
}

export default function VideoRoomsNewPage() {
  return (
    <Suspense>
      <VideoRoomRedirect />
    </Suspense>
  );
}
