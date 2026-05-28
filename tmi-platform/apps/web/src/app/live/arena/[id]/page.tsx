import Link from "next/link";
import ArenaImmersivePanel from "@/components/live/ArenaImmersivePanel";

interface LiveArenaPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LiveArenaPage({ params, searchParams }: LiveArenaPageProps) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const modeValue = typeof sp['mode'] === 'string' ? sp['mode'] : Array.isArray(sp['mode']) ? sp['mode'][0] : 'audience';
  const mode = modeValue === 'performer' ? 'performer' : 'audience';

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 20px 80px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Link href="/live/lobby" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>
          ← Back to Lobby
        </Link>

        <h1 style={{ margin: "12px 0 8px", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900 }}>
          Arena {id}
        </h1>
        <p style={{ margin: "0 0 14px", color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
          Immersive camera view, audience capture, live chat, and moderation controls.
        </p>

        <ArenaImmersivePanel roomId={id} mode={mode} />
      </div>
    </main>
  );
}
