type VideoPreviewTileProps = {
  title: string;
  status: "live" | "queued";
};

export default function VideoPreviewTile({ title, status }: VideoPreviewTileProps) {
  return (
    <article style={{ borderRadius: 12, border: "1px solid rgba(0,255,255,0.35)", overflow: "hidden", background: "rgba(5,11,19,0.9)" }}>
      <div style={{ height: 82, background: "linear-gradient(120deg, rgba(0,255,255,0.3), rgba(170,45,255,0.16), rgba(255,45,170,0.32))" }} />
      <div style={{ padding: 10, display: "grid", gap: 5 }}>
        <div style={{ fontSize: 12, color: "#fff", fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 9, color: status === "live" ? "#4ade80" : "#facc15", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900 }}>{status}</div>
      </div>
    </article>
  );
}
