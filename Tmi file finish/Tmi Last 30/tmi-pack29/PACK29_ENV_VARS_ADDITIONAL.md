# PACK29_ENV_VARS_ADDITIONAL.md
## Additional Environment Variables — Pack 28+29 Systems
### BerntoutGlobal XXL / The Musician's Index

Extends ENV_VAR_MASTER_LIST.md from Pack 27. Add these to existing .env files.

---

## API ADDITIONS (apps/api/.env)

```env
# Advertiser bot outreach (email sending for sales CRM)
OUTREACH_FROM_EMAIL=advertising@themusiciansindex.com
OUTREACH_REPLY_TO=hello@themusiciansindex.com

# Bot rate limits
BOT_MAX_OUTREACH_PER_DAY=50
BOT_MAX_PROPOSALS_PER_DAY=20
BOT_MAX_LEAD_SCORE_THRESHOLD=60  # 0-100, min score to qualify

# Ad slot reservation hold duration
SLOT_HOLD_HOURS=24

# Campaign auto-approve (hours to wait before auto-approving low-risk categories)
CAMPAIGN_AUTO_APPROVE_HOURS=24

# House ad fallback — minimum priority to show
HOUSE_AD_MIN_PRIORITY=10

# Game session config
GAME_MAX_PLAYERS_DEFAULT=8
GAME_ROUND_TIMER_SECONDS=15
GAME_INTERMISSION_SECONDS=10

# Party lobby config
PARTY_MAX_MEMBERS=12
PARTY_DISBAND_IDLE_MINUTES=60
PARTY_VIDEO_ENABLED=true  # set false if WebRTC not ready for prod

# Stream & Win points per event type
STREAM_WIN_POINTS_DAILY_LOGIN=5
STREAM_WIN_POINTS_ROOM_JOIN=10
STREAM_WIN_POINTS_GAME_PLAY=15
STREAM_WIN_POINTS_SHOW_ATTEND=20
STREAM_WIN_POINTS_FOLLOW_ARTIST=3

# Editorial
ARTICLE_PREVIEW_CHARS=150  # chars for article card preview
NEWS_TICKER_MAX_ITEMS=8    # max items in news ticker
NEWS_TICKER_MAX_AGE_HOURS=2  # only show articles from last N hours

# Admin notifications
ADMIN_NOTIFICATION_EMAIL=bigace@berntoutglobal.com  # Big Ace approval emails
ADMIN_SLACK_WEBHOOK=  # optional Slack webhook for Big Ace notifications
```

## WEB ADDITIONS (apps/web/.env.local)

```env
# Advertise page
NEXT_PUBLIC_ADVERTISE_ENABLED=true  # show/hide /advertise pages
NEXT_PUBLIC_SPONSOR_ENABLED=true    # show/hide /sponsor pages

# Game system
NEXT_PUBLIC_GAMES_ENABLED=true

# Party lobby
NEXT_PUBLIC_PARTY_ENABLED=true
NEXT_PUBLIC_PARTY_VIDEO_ENABLED=false  # WebRTC video (phase 2)

# Stream & Win widget
NEXT_PUBLIC_STREAM_WIN_ENABLED=true

# Google Fonts (design system)
NEXT_PUBLIC_GOOGLE_FONTS_URL=https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;600;700&family=Inter:wght@400;500;600&display=swap
```
