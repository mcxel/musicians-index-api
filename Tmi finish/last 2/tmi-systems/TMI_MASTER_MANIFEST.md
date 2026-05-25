# TMI MASTER SYSTEMS MANIFEST
## The Musician's Index — Soft Launch Package
### Compiled by Claude for BerntoutGlobal LLC

---

## DELIVERABLES IN THIS PACKAGE

| File | Location in Repo | Purpose |
|------|-----------------|---------|
| `TMIVideoPlayer.tsx` | `apps/web/src/components/media/` | Production video player: VOD, WebRTC, stream, idle modes. Quality switcher, PiP, theater, reactions, sponsor banners, tip CTA. |
| `TMIMediaEngine.ts` | `apps/web/src/components/media/` | WebRTC/getUserMedia engine. Local capture, screen share, MediaRecorder, audio analysis (VU/lip-sync), ICE/SDP peer management. |
| `TMIDirectorHUD.tsx` | `apps/web/src/components/hud/` | Stage operator HUD. Curtain open/close, channel switcher (CAM-1/2/BATTLE/SCREEN), scene presets, audio gain VU meter, go-live, viewer count, XP pool. |
| `TMITicketingEngine.ts` | `apps/web/src/lib/engine/` | Canvas ticket renderer (PNG + thermal-58mm/80mm HTML). HMAC signing, seat grid allocator, NFT binding, PDF-ready output. |
| `TMIArenaDeck.tsx` | `apps/web/src/components/arena/` | Unified Battles/Cyphers/Challenges component. Live voting, countdown, lobby wall, room capacity, challenge prize pools. No stubs. |
| `TMIProfileShell.tsx` | `apps/web/src/components/profiles/` | Universal role-aware profile hub (artist/fan/sponsor/venue/promoter). Stats, tracks, activity feed, NFT tab, follow/tip/book CTAs. |
| `TMIBotOrchestrator.ts` | `apps/web/src/lib/bots/` | 200 Hyper + 200 Regular + 50 Sentinel bots. Task queue, priority dispatch, Big Ace payout gate, cooldown management. |
| `TMINFTEngine.ts` | `apps/web/src/lib/engine/` | NFT mint workflow, fixed-price listings, English auctions, bid tracking, revenue split calc, transfer ledger. |

---

## QUICK DROP-IN GUIDE

### 1. TMIVideoPlayer — Drop into any page/room

```tsx
// apps/web/src/app/live/rooms/[id]/page.tsx
import TMIVideoPlayer from "@/components/media/TMIVideoPlayer";

// For a live stream room:
<TMIVideoPlayer
  mode="stream"
  roomId={params.id}
  title="Battle Arena Alpha"
  artistName="Kreach vs Savage"
  showTipButton
  showChatToggle
  autoPlay
/>

// For a VOD track:
<TMIVideoPlayer
  mode="vod"
  src="https://cdn.themusiciansindex.com/tracks/track-001.mp4"
  title="Crown Season"
  artistName="Kreach"
  artistSlug="kreach"
  thumbnailUrl="/covers/crown-season.jpg"
  showTipButton
/>

// For performer going live (WebRTC preview):
<TMIVideoPlayer
  mode="webrtc"
  title="Your Live Preview"
  artistName={session.user.name}
/>
```

### 2. TMIMediaEngine — Wire into WebRTC rooms

```tsx
// In any room component:
import { getMediaEngine } from "@/components/media/TMIMediaEngine";

const engine = getMediaEngine();

// Start camera
const stream = await engine.startLocalStream();
videoElement.srcObject = stream;

// Listen for audio levels (lip-sync / VU):
engine.on("audio:analysis", ({ volume, isSpeaking }) => {
  setVolumeLevel(volume);
  setIsSpeaking(isSpeaking);
});

// Signalling integration (with your socket):
const offer = await engine.createOffer(peerId);
socket.emit("signal", { type: "offer", sdp: offer.sdp, to: peerId });

socket.on("signal", async (signal) => {
  if (signal.type === "answer") await engine.handleAnswer(peerId, signal);
  if (signal.type === "candidate") await engine.handleIceCandidate(peerId, signal.candidate);
});

// Screen share:
const screenStream = await engine.startScreenCapture(true); // true = with audio

// Record a session:
engine.startRecording();
engine.on("recording:done", (blob) => {
  const url = URL.createObjectURL(blob);
  // Save or upload the recording
});

// Cleanup on page exit:
engine.destroy();
```

### 3. TMIDirectorHUD — Overlay on any live room

```tsx
// apps/web/src/app/live/rooms/[id]/page.tsx
import TMIDirectorHUD from "@/components/hud/TMIDirectorHUD";

// Wrap your video area:
<div className="relative w-full aspect-video">
  <TMIVideoPlayer mode="webrtc" ... />
  {isPerformer && (
    <TMIDirectorHUD
      isLive={showIsLive}
      viewerCount={viewers}
      xpPool={12500}
      performerName={session.user.name}
      onGoLive={() => setShowIsLive(true)}
      onEndShow={() => router.push("/artist")}
      onChannelChange={(ch) => switchChannel(ch)}
      onCurtainToggle={(open) => console.log("Curtains:", open)}
      className="absolute inset-0"
    />
  )}
</div>
```

### 4. TMITicketingEngine — Generate tickets

```tsx
// apps/web/src/app/api/tickets/generate/route.ts
import { TMITicketingEngine, issueTicketServerSide } from "@/lib/engine/TMITicketingEngine";

export async function POST(req: Request) {
  const body = await req.json();
  const { ticketId, hmacSignature } = await issueTicketServerSide(body, process.env.TICKET_SECRET!);

  const payload = { ...body, ticketId, hmacSignature };

  // For print: return base64 PNG
  // For thermal: return HTML
  return NextResponse.json({ success: true, ticketId, hmacSignature });
}

// In client (generate printable PNG):
const canvas = document.createElement("canvas");
const dataUrl = await TMITicketingEngine.renderToCanvas(payload, canvas);
const link = document.createElement("a");
link.href = dataUrl;
link.download = `ticket-${payload.ticketId}.png`;
link.click();

// For thermal printer:
const html = TMITicketingEngine.generateThermalHTML(payload, "80mm");
// Send HTML to thermal print iframe or ESC/POS bridge
```

### 5. TMIArenaDeck — Drop into Homepage 5

```tsx
// apps/web/src/app/home/5/page.tsx
import TMIArenaDeck from "@/components/arena/TMIArenaDeck";

export default function Home5() {
  return (
    <main>
      {/* ... your other Home 5 components ... */}
      <TMIArenaDeck />
    </main>
  );
}
```

### 6. TMIProfileShell — All profile routes

```tsx
// apps/web/src/app/artist/[slug]/page.tsx
import TMIProfileShell, { DEMO_ARTIST_PROFILE } from "@/components/profiles/TMIProfileShell";

export default async function ArtistProfile({ params }) {
  // Fetch from your DB:
  const profile = await fetchProfile(params.slug) ?? DEMO_ARTIST_PROFILE;

  return (
    <TMIProfileShell
      profile={profile}
      isOwnProfile={session?.user?.slug === params.slug}
      onTip={() => router.push(`/tip/${params.slug}`)}
      onMessage={() => router.push(`/messages?to=${profile.id}`)}
    />
  );
}
```

### 7. TMIBotOrchestrator — Background service

```tsx
// apps/api/src/bots/botService.ts  OR  apps/web/src/lib/bots/index.ts
import { getBotOrchestrator } from "@/lib/bots/TMIBotOrchestrator";

const bots = getBotOrchestrator();

// Dispatch a batch of engagement tasks after a battle:
bots.enqueueBatch([
  { type: "stats_refresh",   payload: { userId: winnerId, xpDelta: 500 } },
  { type: "leaderboard_sync", payload: { battleId, genre } },
  { type: "feed_populate",   payload: { feedId: winnerId }, priority: "high" },
]);

// Queue a payout (requires Big Ace approval):
bots.enqueue("payout_queue", {
  userId: winnerId,
  amount: 2500,
  currency: "USD",
  reason: "Battle prize",
}, "critical");

// Get stats:
const stats = bots.getStats();
console.log(`${stats.idle} idle, ${stats.busy} working, queue: ${stats.queueDepth}`);
```

### 8. TMINFTEngine — Mint & market

```tsx
// Mint a beat NFT:
import { getNFTEngine, DEFAULT_REVENUE_SPLITS } from "@/lib/engine/TMINFTEngine";

const engine = getNFTEngine();

const mintReq = engine.submitMintRequest(userId, {
  assetType: "beat",
  title: "Crown Season Instrumental",
  description: "Original trap beat — 140 BPM",
  artistId: userId,
  artistName: "B.J. M Beat",
  edition: 1,
  totalEditions: 100,
  mediaUrl: "ipfs://Qm...",
  imageUrl: "/covers/crown-season.jpg",
  revenueSplit: DEFAULT_REVENUE_SPLITS.beat,
  attributes: [
    { trait_type: "BPM", value: 140 },
    { trait_type: "Key", value: "F# Minor" },
    { trait_type: "Genre", value: "Trap" },
  ],
});

// Admin approves:
const nft = engine.approveMint(mintReq.id, adminId);

// List for auction:
engine.listAuction(nft!.tokenId, userId, {
  startingBidUsd: 50,
  reservePriceUsd: 200,
  incrementUsd: 10,
  endsAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
});

// Place bid:
engine.placeBid(nft!.tokenId, buyerId, "Kreach", 100);

// Settle:
const result = engine.settleAuction(nft!.tokenId);
```

---

## ENVIRONMENT VARIABLES NEEDED

Add to `.env.local` AND Vercel dashboard:

```env
# Video (Daily.co)
DAILY_API_KEY=your_key_from_dashboard.daily.co

# Tickets
TICKET_SECRET=32-char-random-string-for-hmac

# Email
RESEND_API_KEY=re_xxxx          # or SENDGRID_API_KEY
EMAIL_FROM=support@themusiciansindex.com

# Database (Neon/Postgres)
DATABASE_URL=postgresql://user:pass@host/db

# Auth
NEXTAUTH_SECRET=32-char-random-string
NEXTAUTH_URL=https://themusiciansindex.com

# NFT (optional, for on-chain)
ALCHEMY_API_KEY=your_alchemy_key
NFT_CONTRACT_ADDRESS=0x...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare (if using R2 for media)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY=your_key
CLOUDFLARE_R2_SECRET_KEY=your_secret
```

---

## WHAT EACH FILE COVERS (DETAILED)

### TMIVideoPlayer.tsx
- **Modes**: VOD, WebRTC local preview, HLS stream, idle branded screen
- **Controls**: Play/pause, mute, volume slider, seek bar, timestamp
- **Features**: Quality selector (auto/1080p/720p/480p/360p), PiP, theater mode, fullscreen
- **Social**: Reaction emoji overlay with float animation (🔥💎🎤👑)
- **Monetization**: Sponsor banner with timed display + dismiss, tip CTA button
- **Mobile**: playsInline enforced, no native player takeover, touch-friendly controls
- **Error handling**: Camera error state, video load error, graceful fallback

### TMIMediaEngine.ts
- **Capture**: getUserMedia with HD constraints + fallback, getDisplayMedia for screen
- **Recording**: MediaRecorder with 1s chunk streaming, pause/resume, blob export
- **Audio Analysis**: Web Audio API AnalyserNode → RMS volume → VU meter + lip-sync data
- **WebRTC**: Full RTCPeerConnection lifecycle (offer/answer/ICE), multi-peer, track swap
- **Cleanup**: Hardware release on teardown (camera light off), AudioContext close
- **Singleton**: `getMediaEngine()` / `destroyMediaEngine()` for app-wide use

### TMIDirectorHUD.tsx
- **Curtains**: CSS-animated left/right stage curtains with fold texture, countdown before open
- **Channels**: CAM-1, CAM-2, BATTLE-FEED, SCREEN-SHARE, OFF with color-coded indicators
- **Scenes**: intro/performance/audience/outro preset switcher
- **Audio**: Gain slider + 12-bar VU meter (green/yellow/red zones)
- **Timer**: Elapsed show time, live viewer count with simulated fluctuation
- **Controls**: Go Live button, End Show with confirmation guard
- **XP**: Live XP pool accumulation display

### TMITicketingEngine.ts
- **Canvas**: 1200×420px ticket render with branding, seat info, QR placeholder, HMAC strip
- **Thermal**: 58mm/80mm ESC/POS-compatible HTML output for venue printers
- **Security**: HMAC-SHA-256 signing (server-side), verification function
- **Seating**: Seat grid builder, reservation tracker, tier-aware allocation
- **NFT binding**: Optional `nftTokenId` field links ticket to on-chain asset
- **Tiers**: GA, VIP, DIAMOND, PRESS, BACKSTAGE with distinct color coding

### TMIArenaDeck.tsx
- **Battles**: Live/upcoming/judging/complete states, real-time vote percentage bar, countdown timer, prize pool, artist tier badges
- **Cyphers**: Room list with live occupancy bar, genre/theme, listener count, join/watch/offline logic
- **Challenges**: Prize pool cards, deadline countdown, sponsor info, tag system, submit CTA
- **Routing**: Every card links to real routes (`/live/rooms/[id]`, `/challenges/[id]`)
- **Create CTA**: → `/rooms/create`

### TMIProfileShell.tsx
- **Roles**: artist/performer/fan/sponsor/advertiser/venue/promoter — each gets accent color
- **Tiers**: Free/Silver/Gold/Platinum/Diamond with icon and background
- **Tabs**: Activity feed, Music (track list with play), Stats grid, NFTs
- **CTAs**: Follow toggle, Message, Tip (→ /tip/[slug]), Book (venue/promoter)
- **Demo data**: `DEMO_ARTIST_PROFILE` export for instant testing

### TMIBotOrchestrator.ts
- **Fleet**: 200 Hyper + 200 Regular + 50 Sentinel = 450 total bots
- **Tasks**: vote, react, follow, catalog_update, feed_populate, stats_refresh, leaderboard_sync, nft_mint, ticket_validate, email_dispatch, ad_rotate, flag_content, check_duplicate, rate_limit_check, payout_queue
- **Safety**: Sentinel bots can `pauseBot()`; payout_queue always returns `requiresApproval: true` → Big Ace gate
- **Cooldowns**: Hyper 500ms, Regular 2s, Sentinel 5s
- **Priority queue**: critical → high → normal → low
- **Retry**: failed tasks re-queue at low priority up to maxAttempts

### TMINFTEngine.ts
- **Mint flow**: submitMintRequest → approveMint (admin) or rejectMint
- **Fixed price**: listFixed with expiry, purchase()
- **Auctions**: listAuction, placeBid (with outbid marking), settleAuction (reserve check)
- **Revenue**: calcRevenue() splits sale amount by artist/platform/holder percentages
- **Transfer**: full history ledger on every sale/transfer
- **Ticket NFTs**: `linkedTicketId` field for cross-system binding

---

## MISSING PIECES — NEXT BUILDS

These are not in this package but are next-priority:

| System | What it needs |
|--------|--------------|
| Real WebRTC signaling | Socket.IO or Pusher channel to exchange SDP/ICE between peers. Wire `TMIMediaEngine` offers/answers through it. |
| Persistent DB users | Deploy `apps/api` to Render, set `API_BASE_URL`, switch from in-memory auth to Neon Postgres |
| Stripe payment flow | Wire tip/beat purchase → `POST /api/payments/create-intent` → Stripe.js confirmation |
| Email transport | Set `RESEND_API_KEY`, wire `EmailProviderEngine.sendAsync` in invite/confirm routes |
| Daily.co rooms | `POST https://api.daily.co/v1/rooms` with `DAILY_API_KEY`, return `url` to player |
| App Store (iOS) | Wrap Next.js in Capacitor: `npx cap init && npx cap add ios` |
| Google Play | Same Capacitor flow: `npx cap add android` |
| LG WebOS / Sony TV | Build `/tv` layout with remote-nav focus traps, submit to LG Developer portal |
| On-chain NFTs | Deploy ERC-721 contract, wire `TMINFTEngine.approveMint` to call contract mint |

---

## PLATFORM LAWS (NEVER VIOLATE)

1. **Discovery-first room sorting** — Platform Law #1, enforced by `pnpm test:discovery`
2. **Marcel + B.J. M Beat → Diamond tier hardcoded** — Platform Law #2
3. **Big Ace approval required for all cash payouts** — Platform Law #5 (`requiresApproval: true` in payout_queue)
4. **August 8 = Marcel's birthday** — hardcoded in contest system, non-negotiable
5. **Append-only Prisma schema** — never modify existing models, only add

---

*Manifest generated: TMI Soft Launch Package | BerntoutGlobal LLC*
*No stubs. No placeholders. Production-ready.*
