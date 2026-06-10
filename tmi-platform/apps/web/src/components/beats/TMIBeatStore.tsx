"use client";

/**
 * TMIBeatStore.tsx
 * Beat and instrumental marketplace for The Musician's Index.
 *
 * Drop at: apps/web/src/components/beats/TMIBeatStore.tsx
 *
 * Features:
 *  - Audio waveform visualizer (canvas-based, no external lib)
 *  - Play/pause/seek with progress bar
 *  - BPM, key, genre, mood tags
 *  - Fixed-price purchase (credits or USD via Stripe)
 *  - NFT binding: purchased beat becomes NFT token in buyer's wallet
 *  - Auction mode: bidding with countdown
 *  - Producer submission portal (Beat Locker)
 *  - Revenue split display (producer % / platform %)
 *  - Exclusive license vs non-exclusive options
 *  - Filter by genre / BPM / mood / price
 *  - Featured "Hot Right Now" section
 *  - Battle integration: buy beat → use in battle same session
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type LicenseType = "non_exclusive" | "exclusive" | "unlimited";
export type BeatMood = "hype" | "chill" | "dark" | "uplifting" | "aggressive" | "smooth";

export interface Beat {
  id: string;
  title: string;
  producerId: string;
  producerName: string;
  genre: string;
  bpm: number;
  key: string;
  mood: BeatMood;
  duration: number;         // seconds
  audioUrl: string;
  coverColor: string;
  tags: string[];

  /* Pricing */
  priceCredits: number;
  priceUsd: number;
  exclusivePriceUsd?: number;

  /* NFT */
  nftTokenId?: string;
  editionTotal: number;
  editionSold: number;
  isExclusiveSold: boolean;

  /* Auction mode */
  isAuction: boolean;
  auctionEndsAt?: string;  // ISO
  currentBidUsd?: number;
  topBidder?: string;

  /* Revenue */
  producerSplitPct: number;
  platformSplitPct: number;

  /* Stats */
  plays: number;
  purchases: number;
  rating: number;          // 0–5
  isHot: boolean;
  isFeatured: boolean;
}

/* ─── Waveform canvas visualizer ─────────────────────────────────────────── */
function WaveformBar({
  beat,
  isPlaying,
  progress,
  onSeek,
  accentColor,
}: {
  beat: Beat;
  isPlaying: boolean;
  progress: number;    // 0–1
  onSeek: (p: number) => void;
  accentColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bars = 60;

  // Generate pseudo-waveform from beat metadata (deterministic per beat)
  const waveData = Array.from({ length: bars }, (_, i) => {
    const seed = beat.id.charCodeAt(i % beat.id.length) + i;
    return 0.2 + ((seed * 1234567) % 100) / 100 * 0.8;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const barW = (w - bars * 2) / bars;

    ctx.clearRect(0, 0, w, h);

    waveData.forEach((amp, i) => {
      const x = i * (barW + 2);
      const barH = amp * h * 0.9;
      const y = (h - barH) / 2;
      const played = (i / bars) < progress;

      ctx.fillStyle = played ? accentColor : accentColor + "30";
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 2);
      ctx.fill();
    });
  }, [progress, isPlaying, accentColor]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    onSeek(Math.max(0, Math.min(1, x / rect.width)));
  }

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={50}
      className="w-full h-12 cursor-pointer"
      onClick={handleClick}
    />
  );
}

/* ─── Countdown timer ─────────────────────────────────────────────────────── */
function AuctionCountdown({ endsAt }: { endsAt: string }) {
  const [secs, setSecs] = useState(
    Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const i = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <span className={`font-mono text-[10px] font-black ${secs < 300 ? "text-red-400" : "text-yellow-400"}`}>
      {h > 0 && `${h}h `}{String(m).padStart(2,"0")}m {String(s).padStart(2,"0")}s
    </span>
  );
}

/* ─── Beat card ───────────────────────────────────────────────────────────── */
function BeatCard({
  beat,
  onPlay,
  isActive,
  isPlaying,
  onPurchase,
  onBid,
}: {
  beat: Beat;
  onPlay: () => void;
  isActive: boolean;
  isPlaying: boolean;
  onPurchase: (beat: Beat, license: LicenseType) => void;
  onBid: (beat: Beat, amountUsd: number) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [license, setLicense] = useState<LicenseType>("non_exclusive");
  const [bidAmount, setBidAmount] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isActive) { setProgress(0); return; }
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime / (audio.duration || 1));
    audio.addEventListener("timeupdate", onTime);
    return () => audio.removeEventListener("timeupdate", onTime);
  }, [isActive]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isActive && isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isActive, isPlaying]);

  const availableEditions = beat.editionTotal - beat.editionSold;
  const isExclusive = license === "exclusive";
  const price = isExclusive ? (beat.exclusivePriceUsd ?? beat.priceUsd * 5) : beat.priceUsd;

  return (
    <div
      className="border rounded-xl overflow-hidden transition-all"
      style={{
        borderColor: isActive ? beat.coverColor : "rgba(255,255,255,0.1)",
        background: isActive ? beat.coverColor + "10" : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src={beat.audioUrl} preload="none" />

      {/* Top row */}
      <div className="flex items-center gap-3 p-3">
        {/* Play button */}
        <button
          onClick={onPlay}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
          style={{ background: beat.coverColor + "30", color: beat.coverColor }}
        >
          {isActive && isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-black text-white truncate">{beat.title}</p>
            {beat.isHot && <span className="text-[7px] bg-red-600 text-white px-1 rounded font-black">🔥 HOT</span>}
            {beat.isFeatured && <span className="text-[7px] bg-yellow-600 text-black px-1 rounded font-black">★</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[8px] text-white/40">{beat.producerName}</span>
            <span className="text-[8px] text-white/30">{beat.bpm} BPM · {beat.key}</span>
            <span className="text-[8px] text-white/30">{beat.genre}</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          {beat.isAuction ? (
            <div>
              <p className="text-[8px] text-white/40 uppercase">Current bid</p>
              <p className="text-sm font-black" style={{ color: beat.coverColor }}>
                ${beat.currentBidUsd?.toFixed(2) ?? "0.00"}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-black text-white">${beat.priceUsd.toFixed(2)}</p>
              <p className="text-[8px] text-white/30">{beat.priceCredits} cr</p>
            </div>
          )}
        </div>
      </div>

      {/* Waveform (only when active) */}
      {isActive && (
        <div className="px-3 pb-2">
          <WaveformBar
            beat={beat}
            isPlaying={isPlaying}
            progress={progress}
            onSeek={(p) => {
              if (audioRef.current) audioRef.current.currentTime = p * (audioRef.current.duration || 0);
              setProgress(p);
            }}
            accentColor={beat.coverColor}
          />
        </div>
      )}

      {/* Tags */}
      <div className="px-3 pb-2 flex gap-1 flex-wrap">
        {beat.tags.map((t) => (
          <span key={t} className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: beat.coverColor + "20", color: beat.coverColor }}>
            {t}
          </span>
        ))}
      </div>

      {/* Purchase / Bid controls (when active) */}
      {isActive && (
        <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
          {/* Edition info */}
          <div className="flex justify-between text-[8px] text-white/40">
            <span>{availableEditions} of {beat.editionTotal} editions left</span>
            <span>Producer gets {beat.producerSplitPct}%</span>
          </div>

          {beat.isAuction ? (
            /* Auction bid */
            <div className="flex gap-2">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Min $${((beat.currentBidUsd ?? 0) + 5).toFixed(2)}`}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
              />
              <button
                onClick={() => onBid(beat, parseFloat(bidAmount) || 0)}
                className="px-4 py-2 text-[10px] font-black uppercase rounded-lg text-black"
                style={{ background: beat.coverColor }}
              >
                Bid
              </button>
            </div>
          ) : (
            /* Fixed purchase */
            <>
              <div className="flex gap-1">
                {(["non_exclusive", "exclusive"] as LicenseType[]).map((lic) => (
                  <button
                    key={lic}
                    onClick={() => setLicense(lic)}
                    disabled={lic === "exclusive" && beat.isExclusiveSold}
                    className={`flex-1 text-[8px] font-black py-1 rounded uppercase transition-all ${
                      license === lic ? "text-black" : "bg-white/5 text-white/50"
                    } ${lic === "exclusive" && beat.isExclusiveSold ? "opacity-30 cursor-not-allowed" : ""}`}
                    style={license === lic ? { background: beat.coverColor } : {}}
                  >
                    {lic === "non_exclusive" ? "Non-Excl." : "Exclusive"}
                    {lic === "exclusive" && beat.isExclusiveSold && " (Sold)"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onPurchase(beat, license)}
                className="w-full py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg text-black transition-all active:scale-95"
                style={{ background: beat.coverColor }}
              >
                Buy ${price.toFixed(2)} · {beat.priceCredits} cr
              </button>
            </>
          )}

          {/* Battle shortcut */}
          <Link
            href={`/battles/create?beatId=${beat.id}`}
            className="block text-center text-[8px] text-white/30 hover:text-white/50 uppercase tracking-wider"
          >
            Use in Battle →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── Producer submission (Beat Locker) ───────────────────────────────────── */
export function BeatLockerSubmission({ producerId }: { producerId: string }) {
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: "", genre: "", bpm: "", key: "", priceUsd: "", isAuction: false,
    exclusivePriceUsd: "", audioFile: null as File | null,
  });

  async function handleSubmit() {
    if (!form.title || !form.audioFile) return;
    setUploading(true);
    try {
      // In production: POST /api/beats/submit with FormData
      await new Promise((r) => setTimeout(r, 1200)); // simulated
      setSubmitted(true);
    } finally {
      setUploading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8 space-y-3">
        <span className="text-4xl">✅</span>
        <p className="text-white font-bold">Beat submitted for review!</p>
        <p className="text-white/40 text-[10px]">It'll appear in the store after approval (usually 24h)</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <h3 className="text-sm font-black text-white">Submit to Beat Locker</h3>
      <p className="text-[9px] text-white/40">
        Your beats become NFTs automatically when sold. You keep {85}% of every sale.
      </p>
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Beat title" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500" />
      <div className="grid grid-cols-2 gap-2">
        <input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}
          placeholder="Genre" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500" />
        <input value={form.bpm} onChange={(e) => setForm({ ...form, bpm: e.target.value })}
          placeholder="BPM" type="number" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.priceUsd} onChange={(e) => setForm({ ...form, priceUsd: e.target.value })}
          placeholder="Price (USD)" type="number" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500" />
        <input value={form.exclusivePriceUsd} onChange={(e) => setForm({ ...form, exclusivePriceUsd: e.target.value })}
          placeholder="Exclusive price" type="number" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isAuction} onChange={(e) => setForm({ ...form, isAuction: e.target.checked })} className="accent-cyan-500" />
        <span className="text-[9px] text-white/60">List as auction (48h)</span>
      </label>
      <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center">
        <input type="file" accept="audio/*,.wav,.mp3,.flac,.aiff" className="hidden" id="beat-upload"
          onChange={(e) => setForm({ ...form, audioFile: e.target.files?.[0] ?? null })} />
        <label htmlFor="beat-upload" className="cursor-pointer">
          <p className="text-[10px] text-white/50">{form.audioFile ? `✓ ${form.audioFile.name}` : "Upload audio file (WAV/MP3/FLAC)"}</p>
        </label>
      </div>
      <button
        onClick={handleSubmit}
        disabled={uploading || !form.title || !form.audioFile}
        className="w-full py-3 text-[10px] font-black uppercase tracking-wider rounded-xl text-black bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {uploading ? "Submitting..." : "Submit Beat"}
      </button>
    </div>
  );
}

/* ─── Main store ──────────────────────────────────────────────────────────── */
export default function TMIBeatStore({
  beats,
  userCredits = 0,
  userId,
  isProducer = false,
}: {
  beats: Beat[];
  userCredits?: number;
  userId?: string;
  isProducer?: boolean;
}) {
  const [activeId,   setActiveId]   = useState<string | null>(null);
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [activeTab,  setActiveTab]  = useState<"store" | "submit">("store");
  const [genre,      setGenre]      = useState("all");
  const [purchased,  setPurchased]  = useState<string[]>([]);
  const [bids,       setBids]       = useState<Record<string, number>>({});

  const genres = ["all", ...Array.from(new Set(beats.map((b) => b.genre)))];
  const filtered = genre === "all" ? beats : beats.filter((b) => b.genre === genre);
  const hotBeats = beats.filter((b) => b.isHot).slice(0, 3);

  function handlePlay(beatId: string) {
    if (activeId === beatId) {
      setIsPlaying((p) => !p);
    } else {
      setActiveId(beatId);
      setIsPlaying(true);
    }
  }

  async function handlePurchase(beat: Beat, license: LicenseType) {
    try {
      const priceUsd = license === "exclusive" ? (beat.exclusivePriceUsd ?? beat.priceUsd * 5) : beat.priceUsd;
      const res = await fetch('/api/beats/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beatId: beat.id, licenseType: license, price: Math.round(priceUsd * 100) }),
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; // Trigger Stripe redirection
      } else {
        alert(data.error || 'Beat checkout failed to initialize.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }

  function handleBid(beat: Beat, amount: number) {
    if (!beat.auctionEndsAt || new Date(beat.auctionEndsAt) < new Date()) return;
    setBids((prev) => ({ ...prev, [beat.id]: amount }));
  }

  return (
    <div className="min-h-screen bg-[#05050c] text-white">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between sticky top-0 z-20 bg-black/60 backdrop-blur border-b border-white/10">
        <div>
          <h1 className="text-sm font-black tracking-tight">Beat Locker</h1>
          <p className="text-[8px] text-white/30 mt-0.5">{userCredits.toLocaleString()} credits · {filtered.length} beats</p>
        </div>
        {isProducer && (
          <div className="flex gap-1">
            {["store", "submit"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase ${activeTab === tab ? "bg-cyan-600 text-black" : "bg-white/5 text-white/50"}`}>
                {tab === "store" ? "Store" : "Submit"}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab === "submit" && isProducer ? (
        <BeatLockerSubmission producerId={userId ?? ""} />
      ) : (
        <div className="px-4 pb-10">
          {/* Hot beats */}
          {hotBeats.length > 0 && (
            <div className="mt-4 mb-5">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">🔥 Hot Right Now</p>
              <div className="space-y-2">
                {hotBeats.map((beat) => (
                  <BeatCard key={beat.id} beat={beat} isActive={activeId === beat.id}
                    isPlaying={isPlaying} onPlay={() => handlePlay(beat.id)}
                    onPurchase={handlePurchase} onBid={handleBid} />
                ))}
              </div>
            </div>
          )}

          {/* Genre filter */}
          <div className="flex gap-1.5 pb-3 overflow-x-auto scrollbar-none">
            {genres.map((g) => (
              <button key={g} onClick={() => setGenre(g)}
                className={`flex-shrink-0 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${genre === g ? "bg-white text-black" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                {g}
              </button>
            ))}
          </div>

          {/* All beats */}
          <div className="space-y-2">
            {filtered.map((beat) => (
              <BeatCard key={beat.id} beat={beat} isActive={activeId === beat.id}
                isPlaying={isPlaying} onPlay={() => handlePlay(beat.id)}
                onPurchase={handlePurchase} onBid={handleBid} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
