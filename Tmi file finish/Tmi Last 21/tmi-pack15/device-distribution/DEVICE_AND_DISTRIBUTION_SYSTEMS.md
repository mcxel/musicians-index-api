# DEVICE_PLATFORM_SYSTEM.md
## Every Screen, Every OS, Every App Store — The Platform Runs Everywhere

---

## DEVICE COVERAGE MAP

| Device | App Type | Render Mode | Priority |
|---|---|---|---|
| Desktop (browser) | Web PWA | Full Mode | 🔴 Critical |
| Laptop (browser) | Web PWA | Full Mode | 🔴 Critical |
| Mobile Phone (iOS) | iOS App | Compact Mode | 🔴 Critical |
| Mobile Phone (Android) | Android App | Compact Mode | 🔴 Critical |
| Tablet (iPad/Android) | App | Hybrid Mode | 🟠 High |
| Smart TV (Apple TV) | TV App | Watch Mode | 🟡 Medium |
| Smart TV (Android TV) | TV App | Watch Mode | 🟡 Medium |
| Smart TV (Roku) | Channel | Watch Mode | 🟡 Medium |
| Smart TV (Samsung/LG) | Smart App | Watch Mode | 🟡 Medium |
| Venue Screen (kiosk) | Web/App | Display Mode | 🟡 Medium |
| Operator Station | Web | Operator Mode | 🟢 Low |
| Desktop App (Electron) | Desktop App | Full Mode | 🟢 Low |

---

## RENDER MODES

### Full Mode (Desktop/Laptop)
- Full homepage belt system (3-4 pages)
- Full room experience with all panels
- Live control panel visible to hosts
- HUD strip at bottom
- Sidebar navigation available
- Full operator overlay for admins

### Compact Mode (Phone)
- Vertical scroll homepage
- Swipe between homepage pages
- Compact room view (main stage + simplified controls)
- Bottom navigation bar
- Compact HUD
- Simplified preview window (bottom half)

### Watch Mode (TV)
- Main stage takes 80% of screen
- Minimal HUD (track info + reactions)
- Remote-friendly navigation (D-pad)
- No text input (link device instead)
- Reaction buttons (thumbs, heart)
- Large typography

### Display Mode (Venue Screen)
- Lobby wall or scoreboard view
- No interaction
- Auto-rotating featured content
- Countdown timers prominent
- Sponsor slots visible

### Operator Mode (Command Station)
- Full command center layout
- All health panels
- Bot status
- Feature flag controls
- Incident timeline
- Recovery actions

---

## SECOND SCREEN SYSTEM

When a user has multiple devices:

**Phone → TV pattern:**
```
User opens app on phone
  → Scans QR or taps "Connect to TV"
  → Phone becomes remote control
  → TV shows main stage content
  → Phone shows: reactions, queue position, chat, tip
```

**Tablet → Laptop pattern:**
```
Operator uses laptop for command center
  → Tablet shows room health overlay
  → Actions on tablet mirror to laptop instantly
```

---

## APP DISTRIBUTION STRATEGY

### Free Download, Subscription Inside

The app must be:
- Free to download on all stores
- No payment required at install
- Subscription offered inside
- Guest/preview mode available

### App Store Targets (Phase Order)

| Store | Platform | Phase |
|---|---|---|
| Apple App Store | iOS + iPadOS | Phase 1 |
| Google Play Store | Android | Phase 1 |
| Web (PWA) | All browsers | Phase 1 |
| Apple TV App Store | tvOS | Phase 2 |
| Google Play (TV) | Android TV | Phase 2 |
| Roku Channel Store | Roku OS | Phase 3 |
| Samsung Smart TV | Tizen | Phase 3 |
| LG Smart TV | webOS | Phase 3 |
| Microsoft Store | Windows | Phase 3 |
| Mac App Store | macOS | Phase 3 |

---

---

# SUBSCRIPTION_SYSTEM.md
## Free Download, Subscription Access — Tiers and Rules

---

## SUBSCRIPTION TIERS

| Tier | Price | Key Access |
|---|---|---|
| Free | $0 | Watch rooms, basic profile, follow artists |
| Bronze | $4.99/mo | Join rooms, chat, basic stats, Stream & Win |
| Gold | $9.99/mo | Bronze + upload media, join cyphers, booking |
| Diamond | $19.99/mo | Gold + premium rooms, analytics, fan clubs |
| Artist Pro | $29.99/mo | Diamond + artist dashboard, payout access |
| Venue | $49.99/mo | Venue provisioning, operator tools |
| Sponsor | $99/mo | Campaign tools, ad placement, analytics |

**Special:** Marcel Dickens and B.J. M Beat's have permanent Diamond access.

---

## APP STORE COMPLIANCE RULES

### Apple (Most Strict)
- All in-app purchases must go through Apple IAP
- Apple takes 15-30% commission
- No "purchase cheaper on web" messaging allowed
- Must use Apple's subscription restore flow
- Privacy policy required before download

### Google
- All in-app purchases must go through Google Play Billing
- Google takes 15-30% commission
- Must support subscription pause/resume

### TV Apps
- Typically no subscription purchase required in TV app
- Users sign in with existing account
- Subscription managed on web/phone

---

## DEVICE SYNC

When a user subscribes:
1. Subscription recorded in TMI backend
2. Entitlement synced across all devices
3. User can sign into any device and get correct access
4. If subscription lapses: graceful downgrade, not hard lock

```typescript
// Entitlement check
const { tier } = useSubscription();
if (!tier.includes('gold')) {
  return <UpgradePrompt targetTier="gold" />;
}
```

---

---

# APP_STORE_COMPLIANCE_SYSTEM.md  
## Everything Needed to Pass App Store Review

---

## APPLE APP STORE REQUIREMENTS

| Requirement | Status | Notes |
|---|---|---|
| Privacy policy URL | MISSING | Required before submission |
| Terms of service URL | MISSING | Required |
| Age rating | MISSING | Likely 12+ (music, mild language) |
| App screenshots (6.7" + 12.9") | MISSING | All key screens |
| App preview video | MISSING | 15-30 second demo |
| App icon (1024×1024) | MISSING | No alpha channel |
| In-app purchase setup | MISSING | All subscription tiers |
| Restore purchases button | MISSING | Required by Apple |
| Privacy nutrition labels | MISSING | Data collected declaration |
| Sign in with Apple | MISSING | Required if any social login |
| Live Activities | OPTIONAL | Could power countdown timers |

## GOOGLE PLAY REQUIREMENTS

| Requirement | Status | Notes |
|---|---|---|
| Privacy policy URL | MISSING | Required |
| Data safety form | MISSING | What data is collected/shared |
| Content rating questionnaire | MISSING | Must complete |
| App screenshots (phone + tablet) | MISSING | |
| Feature graphic (1024×500) | MISSING | |
| App icon (512×512) | MISSING | |
| In-app purchases | MISSING | All subscription tiers |
| Restore purchases | MISSING | Must support |

---

*Device Platform + Subscription + App Store Compliance v1.0*
*BerntoutGlobal XXL / The Musician's Index*
