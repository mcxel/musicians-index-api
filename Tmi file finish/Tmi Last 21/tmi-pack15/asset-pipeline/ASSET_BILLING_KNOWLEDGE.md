# ASSET_PIPELINE_SYSTEM.md
## How Every Media Asset Moves Through the Platform

---

## THE ASSET PIPELINE

```
Artist uploads media
  ↓
Validation (format, size, type, ownership)
  ↓
Virus/content scan
  ↓
Transcode to platform formats
  ↓
Thumbnail generation (3 sizes)
  ↓
Store to CDN/R2
  ↓
Create DB record (MediaAsset)
  ↓
Return preview URL to artist
  ↓
Artist can link to profile/room
  ↓
QC Bot validates quality
  ↓
Available for room preview / article embed
```

---

## SUPPORTED MEDIA TYPES

| Type | Formats | Max Size | Transcode Target |
|---|---|---|---|
| Audio | MP3, WAV, FLAC, AAC | 50MB | 128kbps MP3 + waveform |
| Video | MP4, MOV, WebM | 500MB | HLS (360/720/1080p) |
| Image | JPG, PNG, WebP | 10MB | WebP + JPEG fallback |
| Beat (audio) | MP3, WAV | 50MB | 128kbps MP3 + waveform |
| Album Art | JPG, PNG | 5MB | WebP 500×500 + 200×200 |

---

## THUMBNAIL PIPELINE

For every video/audio asset:

```
Original upload
  → 800×600 thumbnail (full quality)
  → 400×300 thumbnail (card size)
  → 200×150 thumbnail (lobby wall tile)
  → 60×60 thumbnail (HUD mini)
  → Fallback: platform default poster if generation fails
```

---

## APPROVED SOURCES (External Links)

Artists can also link external approved sources:

| Source | Type | Validation |
|---|---|---|
| YouTube | Video | Must be artist's own channel |
| Spotify | Audio | Must match artist profile |
| Apple Music | Audio | Must match artist profile |
| SoundCloud | Audio | Must be artist's account |
| Instagram | Video | Must be artist's account |

Validation: Artist must verify ownership by matching their TMI profile to the external account.

External previews are embedded read-only — platform cannot modify them.

---

## FALLBACK ASSETS

If any media fails:
- Audio: silent poster card with track name
- Video: dark poster with play-failed icon
- Image: platform default avatar/banner
- Beat: "Beat unavailable" card
- All fallbacks inherit the artist's accent color

---

---

# BILLING_AND_ENTITLEMENT_SYSTEM.md
## How Subscriptions Work — Purchase, Restore, Sync, Lapse

---

## SUBSCRIPTION PURCHASE FLOW

### Web
```
User clicks "Upgrade"
  → Stripe Checkout session created
  → User enters card details
  → Stripe confirms payment
  → TMI backend webhook confirms
  → User entitlement updated in DB
  → User sees new tier immediately
```

### iOS App
```
User clicks "Upgrade"
  → Apple IAP sheet opens
  → User approves with Face ID/Touch ID
  → Apple confirms to TMI via App Store Server Notifications
  → TMI backend updates entitlement
  → User sees new tier
```

### Restore Purchases (Required)
```
User taps "Restore Purchases"
  → Query Apple/Google for active subscriptions
  → Match to TMI account
  → Restore entitlement
  → Confirm to user
```

---

## ENTITLEMENT SYNC

Every device checks entitlement on:
- App launch
- After subscription change
- After restore attempt
- Every 24 hours (background refresh)

If entitlement cannot be confirmed:
- Show last known tier for 48 hours
- Then gracefully downgrade to Free
- Never hard-lock — always show content

---

## SUBSCRIPTION LAPSE HANDLING

When a subscription lapses:
1. Immediately: premium rooms become read-only
2. +7 days: premium analytics become read-only
3. +30 days: premium content is archived but accessible
4. User can resubscribe at any time and regain access

Never delete user data when subscription lapses.

---

## REFUND POLICY

- Within 48 hours of purchase: auto-refund on request
- After 48 hours: manual review
- No refunds for completed events attended
- App store refunds handled by Apple/Google directly

---

---

# KNOWLEDGE_BASE_SYSTEM.md
## Help, Support, Playbooks — For Users, Moderators, Operators

---

## USER-FACING HELP TOPICS

### Getting Started
- How to create an account
- How to set up your artist profile
- How to link your music (YouTube, Spotify, SoundCloud)
- How to go live for the first time
- How to join a cypher
- How to earn Stream & Win points

### Rooms & Events
- How rooms work
- What the turn queue does
- How the preview window works
- How to invite friends to a room
- How battle rooms work
- How voting works

### Economy & Points
- How to earn points
- What the subscription tiers include
- How to tip an artist
- How to redeem rewards
- How payouts work for artists

### Troubleshooting
- Audio not working in room
- Preview window not loading
- Points not updating
- Cannot join a room
- Subscription not showing

---

## MODERATOR PLAYBOOK

### When to Mute
- User is spamming chat with the same message 3+ times
- User is using slurs in non-reclaimed context
- User is targeting another user with abuse

### When to Kick
- After mute + continued violation
- Threatening behavior
- Doxxing attempt

### When to Escalate to Big Ace
- Legal threats
- Actual doxxing (personal info posted)
- Coordinated abuse
- CSAM (immediate escalation + report)
- Platform exploit discovered

### Never Do
- Never ban a paying subscriber without Big Ace approval
- Never delete content without logging it
- Never share user PII internally
- Never share ban reason with third parties

---

## OPERATOR PLAYBOOK (Big Ace)

### Emergency Room Shutdown
```
1. Navigate to /admin/command-center
2. Select room from active rooms list
3. Click "Emergency Close"
4. Select reason
5. Confirm — room closes with 10s warning to occupants
```

### Crown Override
```
1. Navigate to /admin/crown
2. Click "Override This Week's Crown"
3. Select artist
4. Add reason (required)
5. Confirm — crown reassigned immediately
```

### Emergency Broadcast
```
1. Navigate to /admin/emergency
2. Click "Emergency Broadcast"
3. Type message (max 140 chars)
4. Select scope: all rooms / specific rooms / platform-wide
5. Set duration (auto-dismiss after N seconds)
6. Confirm — appears on all selected surfaces immediately
```

---

*Asset Pipeline + Billing/Entitlement + Knowledge Base v1.0*
*BerntoutGlobal XXL / The Musician's Index*
