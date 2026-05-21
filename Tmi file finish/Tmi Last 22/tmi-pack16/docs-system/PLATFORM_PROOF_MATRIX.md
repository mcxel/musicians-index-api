# PLATFORM_PROOF_MATRIX.md
## Every Proof Gate — Command, Expected Output, Screenshot
BUILD: pnpm -C apps/web run build → Exit 0, no errors
CLOUDFLARE WEB: Cloudflare Pages dashboard → ✅ Success
CLOUDFLARE API: Cloudflare Pages dashboard → ✅ Success
ROUTE SMOKE: curl https://[domain]/ → HTTP 200
AUTH: register → login → refresh → still logged in
CROWN: Homepage 1 loads → Crown card shows #1 artist
LOBBY SORT: Lobby wall position 1 = 0-viewer artist (CRITICAL)
COUNTDOWN: World premiere timer ticking correctly
STREAM & WIN: Stream 5min → points balance increases
DIAMOND: Login as Marcel → Diamond badge visible on profile
ADMIN: Login as Big Ace → /admin/command-center loads
ROLE: Login as Marcel → analytics only, no destructive actions
FOLLOW: Follow artist → follower count +1 in DB
SPIN: Daily spin → random reward received
ONBOARDING ARTIST: All 8 steps completable
ONBOARDING FAN: Genre selection + first event entry completes
FEATURE FLAG: Toggle KILL_ROOMS → room routes become unavailable
WATCHDOG: Simulate stuck queue → watchdog reports warning state
Each check: run command, observe output, screenshot, save to /proof/[system]/
