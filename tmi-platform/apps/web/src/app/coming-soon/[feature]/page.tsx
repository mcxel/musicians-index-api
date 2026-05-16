import Link from "next/link";

type Props = { params: { feature: string } };

const FEATURE_LABELS: Record<string, string> = {
  "live-merch":      "Live Merch Store",
  "backstage-pass":  "Backstage Pass",
  "nft-drops":       "NFT Drops",
  "collab-studio":   "Collab Studio",
  "artist-academy":  "Artist Academy",
  "fan-club":        "Fan Club",
  "watch-parties":   "Watch Parties",
  "cypher-league":   "Cypher League",
  "ai-mastering":    "AI Mastering",
  "booking-pro":     "Booking Pro",
};

export default function ComingSoonPage({ params }: Props) {
  const label = FEATURE_LABELS[params.feature] ?? params.feature.replace(/-/g, " ");
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.04)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 max-w-lg text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full border-2 border-fuchsia-500/40 flex items-center justify-center">
          <span className="text-4xl">🚀</span>
        </div>
        <p className="text-[9px] font-black tracking-[0.5em] uppercase text-fuchsia-400/60">Coming Soon</p>
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter capitalize">{label}</h2>
        <p className="text-zinc-400 text-sm">This feature is in development. We're building it right now — check back soon or join the waitlist.</p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link href="/home/1" className="px-6 py-3 bg-fuchsia-500 text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-fuchsia-400 transition">
            Back to Platform
          </Link>
          <Link href="/home/13" className="px-6 py-3 bg-white/10 border border-white/20 font-bold text-sm uppercase tracking-widest rounded-full hover:border-fuchsia-400/60 hover:text-fuchsia-400 transition">
            Rewards &amp; Store
          </Link>
        </div>
      </div>
    </div>
  );
}
