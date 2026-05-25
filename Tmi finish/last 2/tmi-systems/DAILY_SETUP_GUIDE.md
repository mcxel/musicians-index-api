# Daily.co Video Setup Guide
## The Musician's Index — Complete Video Wiring

---

## YOUR API KEY (from the screenshot)

```
ba0b6df653be1d75a4cf361bb1ac514f8ba5b7e10a5341d9090fe5d958da73d7
```

Your subdomain: `themusiciansindex.daily.co`

---

## STEP 1 — Add to Vercel (do this RIGHT NOW)

1. Go to: https://vercel.com/dashboard
2. Click your TMI project
3. Click **Settings** → **Environment Variables**
4. Add these two variables:

| Name | Value |
|------|-------|
| `DAILY_API_KEY` | `ba0b6df653be1d75a4cf361bb1ac514f8ba5b7e10a5341d9090fe5d958da73d7` |
| `DAILY_DOMAIN` | `themusiciansindex` |

5. Make sure both are set for **Production**, **Preview**, and **Development**
6. Click **Save**
7. Go to **Deployments** → click the three dots on the latest build → **Redeploy**

---

## STEP 2 — Install the Daily.co SDK

Run in your terminal:

```bash
cd "c:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
pnpm add @daily-co/daily-js --filter web
```

---

## STEP 3 — Drop the API route in place

Copy `tmi-systems/api/video/rooms/route.ts` to:

```
apps/web/src/app/api/video/rooms/route.ts
```

This replaces your existing video room route with one that uses your actual Daily.co API key.

---

## STEP 4 — Drop the components in place

Copy these files to your repo:

```
tmi-systems/components/media/TMIVideoRoom.tsx
→ apps/web/src/components/video/TMIVideoRoom.tsx

tmi-systems/components/media/TMIVideoPlayer.tsx
→ apps/web/src/components/media/TMIVideoPlayer.tsx

tmi-systems/components/media/TMIMediaEngine.ts
→ apps/web/src/components/media/TMIMediaEngine.ts

tmi-systems/components/hud/TMIDirectorHUD.tsx
→ apps/web/src/components/hud/TMIDirectorHUD.tsx

tmi-systems/components/lobby/TMILobbyWall.tsx
→ apps/web/src/components/lobby/TMILobbyWall.tsx

tmi-systems/lib/engine/DailyVideoEngine.ts
→ apps/web/src/lib/video/DailyVideoEngine.ts
```

---

## STEP 5 — Wire video into your live room page

Replace the content of `apps/web/src/app/live/rooms/[id]/page.tsx` with:

```tsx
"use client";
import { useParams } from "next/navigation";
import { useSession } from "@/hooks/SessionContext";
import TMILobbyWall from "@/components/lobby/TMILobbyWall";

export default function LiveRoomPage() {
  const params  = useParams();
  const session = useSession();
  const roomId  = String(params.id ?? "R-101");

  return (
    <TMILobbyWall
      roomId={roomId}
      roomType="stage"
      eventTitle="TMI Live Session"
      performerName="Kreach"
      performerId="kreach-001"
      userId={session?.userId ?? "anon"}
      userName={session?.userName ?? "Guest"}
      userRole={session?.role === "artist" ? "performer" : "fan"}
      userTier={session?.tier ?? "Free"}
      totalSeats={100}
    />
  );
}
```

---

## STEP 6 — Wire video into battle rooms

For `/live/rooms/R-101` (battle), `/rooms/cypher`, etc., use:

```tsx
import TMIVideoRoom from "@/components/video/TMIVideoRoom";

// For a performer going live:
<TMIVideoRoom
  roomId="R-101"
  roomType="battle"
  userId={session.userId}
  userName={session.userName}
  role="host"          // performer = host
  className="aspect-video rounded-xl"
/>

// For a fan watching:
<TMIVideoRoom
  roomId="R-101"
  roomType="battle"
  userId={session.userId}
  userName={session.userName}
  role="viewer"        // fan = viewer (no camera/mic)
  showControls={false}
  className="aspect-video rounded-xl"
/>
```

---

## STEP 7 — Add video to admin overseer deck

In `apps/web/src/app/admin/overseer/page.tsx`, add a monitor section:

```tsx
import TMIVideoRoom from "@/components/video/TMIVideoRoom";

// Add this in the overseer layout:
<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
  {["R-101", "R-102", "CY-01", "CY-02"].map((roomId) => (
    <div key={roomId} className="space-y-1">
      <p className="text-[9px] text-white/30 font-mono uppercase">
        Monitor: {roomId}
      </p>
      <TMIVideoRoom
        roomId={roomId}
        roomType="admin"
        userId={session.userId}
        userName="Overseer"
        role="viewer"
        showControls={false}
        className="aspect-video rounded-lg"
      />
    </div>
  ))}
</div>
```

---

## STEP 8 — Verify it works

After deploying, test this in your browser console (on the live site):

```javascript
fetch('/api/video/rooms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'stage',
    roomId: 'test-room-001',
    userId: 'test-user',
    userName: 'Marcel',
    role: 'host'
  })
}).then(r => r.json()).then(console.log)
```

You should see:
```json
{
  "success": true,
  "room": { "name": "test-room-001", "url": "https://themusiciansindex.daily.co/test-room-001" },
  "token": "eyJ...",
  "joinUrl": "https://themusiciansindex.daily.co/test-room-001?t=eyJ..."
}
```

If you see that → **video is live everywhere**.

---

## WHAT THIS UNLOCKS (IMMEDIATELY)

Once the API key is in Vercel:

| Feature | Status After |
|---------|-------------|
| Live performer video feed | ✅ LIVE |
| Fan audience video tiles | ✅ LIVE |
| Battle room head-to-head video | ✅ LIVE |
| Cypher room rotation feeds | ✅ LIVE |
| Admin overseer monitor wall | ✅ LIVE |
| PiP video on fan dashboard | ✅ LIVE |
| Cloud recordings | ✅ LIVE |
| Backstage performer prep room | ✅ LIVE |
| Venue broadcast (up to 500) | ✅ LIVE |

---

## ROOM TYPES AVAILABLE

| Type | Max Participants | Use For |
|------|-----------------|---------|
| `battle` | 50 | Head-to-head performer matches |
| `cypher` | 80 | Open mic rotation |
| `stage` | 200 | Main performance stage |
| `backstage` | 10 | Performer prep/green room |
| `venue` | 500 | Large concerts/events |
| `chat` | 8 | Fan group chats, performer-fan video |
| `admin` | 20 | Overseer monitoring |

---

## ENVIRONMENT VARIABLES FULL LIST

Add ALL of these to Vercel for 100% functionality:

```env
# Video (Daily.co) — YOUR KEY IS READY
DAILY_API_KEY=ba0b6df653be1d75a4cf361bb1ac514f8ba5b7e10a5341d9090fe5d958da73d7
DAILY_DOMAIN=themusiciansindex

# Database (Neon — for persistent users)
DATABASE_URL=postgresql://user:pass@host/tmi-db

# Auth
NEXTAUTH_SECRET=generate-32-char-random-string
NEXTAUTH_URL=https://themusiciansindex.com

# Tickets
TICKET_SECRET=generate-32-char-random-string

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=support@themusiciansindex.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

---

## TROUBLESHOOTING

**"DAILY_API_KEY not configured"** — Key isn't in Vercel env vars yet. Add it and redeploy.

**"Failed to create Daily room"** — Check the key is correct (no extra spaces). Go to Daily dashboard → Developers → verify the key matches exactly.

**Camera doesn't show** — Must be on HTTPS. localhost won't work for camera. Test on the live Vercel URL.

**Video room loads but black screen** — User hasn't allowed camera permission. Check browser settings.

**"Room not found" on join** — Room expired. Rooms auto-expire after 120 minutes by default.

---

*Setup guide for TMI video system | BerntoutGlobal LLC*
*Daily.co subdomain: themusiciansindex.daily.co*
