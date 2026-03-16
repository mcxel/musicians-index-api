import { type Metadata } from "next";

interface SeasonPageProps {
  params: { seasonId: string };
}

export async function generateMetadata({ params }: Readonly<SeasonPageProps>): Promise<Metadata> {
  const { seasonId } = params;
  return { title: `Season ${seasonId} | Grand Platform Contest | TMI` };
}

export default async function SeasonPage({ params }: Readonly<SeasonPageProps>) {
  const { seasonId } = params;

  return (
    <main style={{ minHeight: "100vh", background: "#070a0f", color: "#fff", padding: "60px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".12em", color: "#ff6b1a", marginBottom: 16 }}>
          CONTEST SEASON
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 40px" }}>Season {seasonId}</h1>
      </div>
    </main>
  );
}
