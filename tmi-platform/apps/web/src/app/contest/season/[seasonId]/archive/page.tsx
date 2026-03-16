import { type Metadata } from "next";

interface SeasonArchivePageProps {
  params: { seasonId: string };
}

export async function generateMetadata({ params }: Readonly<SeasonArchivePageProps>): Promise<Metadata> {
  const { seasonId } = params;
  return { title: `Season ${seasonId} Archive | Grand Platform Contest | TMI` };
}

export default async function SeasonArchivePage({ params }: Readonly<SeasonArchivePageProps>) {
  const { seasonId } = params;

  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "60px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 8px" }}>Season {seasonId} — Archive</h1>
        <p style={{ color: "rgba(255,255,255,.4)", marginBottom: 40 }}>Final results, winners, and sponsor recognition</p>
      </div>
    </main>
  );
}
