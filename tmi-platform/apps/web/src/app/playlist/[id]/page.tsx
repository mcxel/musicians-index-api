"use client";

import PlaylistStreamRoom from "@/components/playlist/PlaylistStreamRoom";

export default function PlaylistPage({ params }: { params: { id: string } }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#03030d",
        color: "#fff",
        padding: "32px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 860 }}>
        <PlaylistStreamRoom playlistId={params.id} />
      </div>
    </main>
  );
}
