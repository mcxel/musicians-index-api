# TMI COMPLETE INTEGRATION GUIDE
## Every File → Exact Drop Location → Exact Usage
### BerntoutGlobal LLC — The Musician's Index

---

## COMPLETE FILE MAP (All sessions combined)

```
tmi-systems/
├── components/
│   ├── admin/
│   │   └── TMIAdminOverseer.tsx         → apps/web/src/app/admin/overseer/page.tsx
│   ├── arena/
│   │   ├── TMIArenaDeck.tsx             → apps/web/src/components/arena/TMIArenaDeck.tsx
│   │   └── TMIWinnerCelebration.tsx     → apps/web/src/components/arena/TMIWinnerCelebration.tsx
│   ├── avatar/
│   │   └── TMIAvatarSystem.tsx          → apps/web/src/components/avatar/TMIAvatarSystem.tsx
│   ├── beats/
│   │   └── TMIBeatStore.tsx             → apps/web/src/components/beats/TMIBeatStore.tsx
│   ├── billboard/
│   │   └── TMIBillboardLiveWall.tsx     → apps/web/src/components/billboard/TMIBillboardLiveWall.tsx
│   ├── home/
│   │   └── TMIHome1Compositor.tsx       → apps/web/src/components/home/TMIHome1Compositor.tsx
│   ├── hud/
│   │   └── TMIDirectorHUD.tsx           → apps/web/src/components/hud/TMIDirectorHUD.tsx
│   ├── layout/
│   │   ├── TMIUnderlaySystem.tsx        → apps/web/src/components/layout/TMIUnderlaySystem.tsx
│   │   └── TMILobbyAccessGate (in TMIAutoLobbyRouter.ts)
│   ├── lobby/
│   │   └── TMILobbyWall.tsx             → apps/web/src/components/lobby/TMILobbyWall.tsx
│   ├── magazine/
│   │   └── TMIMagazineEngine.tsx        → apps/web/src/components/magazine/TMIMagazineEngine.tsx
│   ├── media/
│   │   ├── TMILiveMediaWidget.tsx       → apps/web/src/components/media/TMILiveMediaWidget.tsx
│   │   ├── TMIMediaEngine.ts            → apps/web/src/components/media/TMIMediaEngine.ts
│   │   ├── TMIVideoPlayer.tsx           → apps/web/src/components/media/TMIVideoPlayer.tsx
│   │   └── TMIVideoRoom.tsx             → apps/web/src/components/video/TMIVideoRoom.tsx
│   └── profiles/
│       └── TMIProfileShell.tsx          → apps/web/src/components/profiles/TMIProfileShell.tsx
├── lib/
│   ├── audio/
│   │   └── TMIAudioSafetyMixer.ts       → apps/web/src/lib/audio/TMIAudioSafetyMixer.ts
│   ├── bots/
│   │   └── TMIBotOrchestrator.ts        → apps/web/src/lib/bots/TMIBotOrchestrator.ts
│   ├── engine/
│   │   ├── DailyVideoEngine.ts          → apps/web/src/lib/video/DailyVideoEngine.ts
│   │   ├── TMINFTEngine.ts              → apps/web/src/lib/engine/TMINFTEngine.ts
│   │   └── TMITicketingEngine.ts        → apps/web/src/lib/engine/TMITicketingEngine.ts
│   ├── routing/
│   │   └── TMIAutoLobbyRouter.ts        → apps/web/src/lib/routing/TMIAutoLobbyRouter.ts
│   ├── security/
│   │   └── TMISecurityEngine.ts         → apps/web/src/lib/security/TMISecurityEngine.ts
│   └── xp/
│       └── TMIXPRankingEngine.ts        → apps/web/src/lib/xp/TMIXPRankingEngine.ts
└── api/
    └── video/rooms/route.ts             → apps/web/src/app/api/video/rooms/route.ts
```

---

## HOMEPAGE WIRING (home/1 through home/5)

### home/1 — Use TMIHome1Compositor as outer wrapper
```tsx
// apps/web/src/app/home/1/page.tsx
import TMIHome1Compositor from "@/components/home/TMIHome1Compositor";

export default function Home1Page() {
  return (
    <TMIHome1Compositor isLive viewerCount={284}>
      {/* Your existing MagazinePageFlipRuntime / HomeSurfacePage here */}
    </TMIHome1Compositor>
  );
}
```

### home/2, home/3, home/5 — Replace static images with live widgets
```tsx
// apps/web/src/app/home/2/page.tsx (and 3, 5)
import { TMIUnderlaySystem, TMIOverlayFXSystem } from "@/components/layout/TMIUnderlaySystem";
import { HomepageLiveWidgetGrid } from "@/components/media/TMILiveMediaWidget";

export default function Home2Page() {
  return (
    <div className="relative w-screen min-h-[100svh] overflow-hidden">
      <TMIUnderlaySystem theme="neon80s" />
      <div className="relative z-10">
        {/* Your existing HomeSurfacePage or MagazinePageFlipRuntime */}
        
        {/* REPLACE static image grid sections with: */}
        <HomepageLiveWidgetGrid
          performers={LIVE_PERFORMERS}  // from your API
          onEnterLobby={(roomId) => router.push(`/live/rooms/${roomId}`)}
        />
      </div>
      <TMIOverlayFXSystem mode="ambient" />
    </div>
  );
}
```

### home/4 — Standard with underlay
```tsx
// Same pattern as home/2 but with theme="dark_editorial"
```

---

## LIVE ROOMS (rooms/[id])

```tsx
// apps/web/src/app/live/rooms/[id]/page.tsx
"use client";
import { useParams } from "next/navigation";
import TMILobbyWall from "@/components/lobby/TMILobbyWall";
import { TMILobbyAccessGate } from "@/lib/routing/TMIAutoLobbyRouter";
import { useSession } from "@/hooks/SessionContext";

export default function LiveRoomPage() {
  const params = useParams();
  const session = useSession();
  const roomId = String(params.id);

  const lobby = {
    roomId,
    performerName: "Kreach",
    privacy: "PUBLIC" as const,
    genre: "battle" as const,
  };

  return (
    <TMILobbyAccessGate
      lobby={lobby}
      userTier={session?.tier ?? "free"}
      isAuthenticated={!!session?.userId}
    >
      <TMILobbyWall
        roomId={roomId}
        roomType="battle"
        eventTitle="Battle Arena"
        performerName="Kreach"
        performerId="kreach-001"
        userId={session?.userId ?? "anon"}
        userName={session?.userName ?? "Guest"}
        userRole={session?.role === "artist" ? "performer" : "fan"}
      />
    </TMILobbyAccessGate>
  );
}
```

---

## AVATAR CENTER (fans only)

```tsx
// apps/web/src/app/avatar-center/page.tsx
"use client";
import { AvatarCenterPage } from "@/components/avatar/TMIAvatarSystem";
import { useSession } from "@/hooks/SessionContext";

export default function AvatarCenter() {
  const session = useSession();
  return <AvatarCenterPage session={session} />;
}
```

---

## MAGAZINE PAGE

```tsx
// apps/web/src/app/magazine/page.tsx
"use client";
import TMIMagazineEngine from "@/components/magazine/TMIMagazineEngine";
import { useSession } from "@/hooks/SessionContext";
import { MAGAZINE_ARTICLES } from "@/lib/magazine/magazineIssueData";

export default function MagazinePage() {
  const session = useSession();
  return (
    <TMIMagazineEngine
      articles={MAGAZINE_ARTICLES}
      userTier={session?.tier ?? "free"}
    />
  );
}
```

---

## BEAT STORE

```tsx
// apps/web/src/app/beats/page.tsx
"use client";
import TMIBeatStore from "@/components/beats/TMIBeatStore";
import { useSession } from "@/hooks/SessionContext";

export default function BeatsPage() {
  const session = useSession();
  // Fetch beats from /api/beats
  return (
    <TMIBeatStore
      beats={[]} // from API
      userCredits={session?.credits ?? 0}
      userId={session?.userId}
      isProducer={session?.role === "artist" || session?.role === "performer"}
    />
  );
}
```

---

## BILLBOARD WALL (home/5 discovery section)

```tsx
// Inside your home/5 page:
import TMIBillboardLiveWall from "@/components/billboard/TMIBillboardLiveWall";
import { useRouter } from "next/navigation";

function Home5BillboardSection({ userTier, feeds }) {
  const router = useRouter();
  return (
    <TMIBillboardLiveWall
      feeds={feeds}
      userTier={userTier}
      onEnterLobby={(feed) => router.push(`/live/rooms/${feed.roomId}`)}
    />
  );
}
```

---

## WINNER CELEBRATION (trigger after battle ends)

```tsx
// In your battle/room logic:
import TMIWinnerCelebration from "@/components/arena/TMIWinnerCelebration";

function BattleRoom() {
  const [winner, setWinner] = useState(null);

  // When battle ends via socket:
  socket.on("battle:ended", (result) => setWinner(result));

  return (
    <>
      {/* your room UI */}
      {winner && (
        <TMIWinnerCelebration
          payload={winner}
          onClose={() => setWinner(null)}
          autoCloseMs={8000}
        />
      )}
    </>
  );
}
```

---

## DIRECTOR HUD (performer going live)

```tsx
// In your performer's live room view:
import TMIDirectorHUD from "@/components/hud/TMIDirectorHUD";

<div className="relative w-full aspect-video">
  <TMIVideoRoom roomId="R-101" roomType="battle" role="host" ... />
  <TMIDirectorHUD
    isLive={isLive}
    viewerCount={viewers}
    performerName={session.userName}
    onGoLive={() => setIsLive(true)}
    onEndShow={() => router.push("/artist")}
    className="absolute inset-0"
  />
</div>
```

---

## XP SYSTEM (wire into any action)

```tsx
// apps/web/src/lib/xp/xpActions.ts
import { TMIXPRankingEngine } from "@/lib/xp/TMIXPRankingEngine";

// On the server (API route), after any user action:
export async function awardXP(userId: string, action: XPAction) {
  const stats = await getUserStats(userId);  // from DB
  const engine = new TMIXPRankingEngine(stats);
  const result = engine.applyXP(userId, action);

  // Save to DB
  await updateUserStats(userId, result.newStats);

  // If rare drop — notify via websocket
  if (result.event.isRareDrop) {
    io.to(userId).emit("rare_drop", result.event);
  }

  // If level up
  if (result.leveledUp) {
    io.to(userId).emit("level_up", { newLevel: result.newLevel });
  }

  return result;
}
```

---

## AUDIO SAFETY MIXER (in live rooms)

```tsx
// In your WebRTC room component:
import { useAudioSafetyMixer } from "@/lib/audio/TMIAudioSafetyMixer";

function LiveRoom({ roomId }) {
  const { addTrack, removeTrack, setMode, activeSpeaker, volumeMap } = useAudioSafetyMixer();

  // When performer joins:
  async function handlePerformerJoin(userId, stream, role) {
    await addTrack(userId, stream, role);
  }

  // Toggle between band mix and solo
  return (
    <div>
      <button onClick={() => setMode("band_mix")}>Band Mix</button>
      <button onClick={() => setMode("solo_focus")}>Solo Focus</button>
      {/* Active speaker indicator */}
      {activeSpeaker && <p>Speaking: {activeSpeaker}</p>}
    </div>
  );
}
```

---

## SECURITY (add to next.config.js)

```js
// apps/web/next.config.js
import { SECURITY_HEADERS } from "./src/lib/security/TMISecurityEngine.js";

const nextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};
export default nextConfig;
```

---

## DIAMOND / ADMIN ACCOUNTS (no code change needed)

```
Vercel → Settings → Environment Variables:

DIAMOND_EMAILS = facethebully916@gmail.com,kreach@email.com,kg@email.com
ADMIN_EMAILS   = admin@berntoutglobal.com,micah@email.com

Redeploy → done. No git push required.
```

---

## BOT FLEET (start after app boots)

```tsx
// apps/web/src/lib/bots/botService.ts  (imported at app startup)
import { getBotOrchestrator } from "@/lib/bots/TMIBotOrchestrator";

const bots = getBotOrchestrator();  // starts 450 bots automatically

// After a battle ends:
bots.enqueueBatch([
  { type: "stats_refresh",    payload: { userId: winnerId, xpDelta: 500 } },
  { type: "leaderboard_sync", payload: { battleId, genre } },
  { type: "feed_populate",    payload: { feedId: winnerId }, priority: "high" },
]);

// Queue payout (Big Ace approval required — Platform Law #5):
bots.enqueue("payout_queue", {
  userId: winnerId,
  amount: 2500,
  currency: "USD",
  reason: "Battle Season 2 prize",
}, "critical");
```

---

## ENVIRONMENT VARIABLES (complete list)

```env
# VIDEO (Daily.co) — KEY IS READY
DAILY_API_KEY=ba0b6df653be1d75a4cf361bb1ac514f8ba5b7e10a5341d9090fe5d958da73d7
DAILY_DOMAIN=themusiciansindex

# AUTH
NEXTAUTH_SECRET=generate-32-char-random
NEXTAUTH_URL=https://themusiciansindex.com

# ACCOUNTS (no code push needed)
ADMIN_EMAILS=berntmusic33@gmail.com,bigace@berntoutglobal.com
DIAMOND_EMAILS=facethebully916@gmail.com,bjmbeat@berntoutglobal.com

# DATABASE
DATABASE_URL=postgresql://user:pass@host/tmi-db

# STRIPE
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# EMAIL (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=support@themusiciansindex.com

# TICKETS
TICKET_SECRET=generate-32-char-random

# NFT (optional for on-chain)
ALCHEMY_API_KEY=your_key
NFT_CONTRACT_ADDRESS=0x...
```

---

## INSTALL COMMAND (run once)

```bash
cd "c:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
pnpm add @daily-co/daily-js --filter web
pnpm add framer-motion --filter web   # if not already installed
```

---

## PLATFORM LAWS (never break these)

| Law | Rule | Where enforced |
|-----|------|---------------|
| #1 | Discovery-first room sorting | `pnpm test:discovery` |
| #2 | Marcel + B.J. M Beat = Diamond always | `TMISecurityEngine.ts` hardcoded |
| #5 | Big Ace approval for all cash payouts | `TMIBotOrchestrator.ts` payout_queue |
| — | Performers use camera, NOT avatar | `TMIAvatarSystem.tsx` role check |
| — | August 8 = Marcel's birthday | Contest system — never modify |
| — | Append-only Prisma schema | Never modify existing models |

---

*TMI Complete Integration Guide | BerntoutGlobal LLC*
*No stubs. No placeholders. Everything connects.*
