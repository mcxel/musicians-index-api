# SOCIAL SHARE ENGINE

## Overview

The Social Share Engine handles sharing functionality across platforms, enabling users to share content to social media with tracking and attribution.

---

## Supported Platforms

| Platform | Share Type | Preview | Deep Link |
|----------|------------|---------|-----------|
| Twitter/X | tweet | card image | yes |
| Facebook | post | og:image | yes |
| Instagram | story | story asset | no |
| TikTok | video clip | thumbnail | no |
| YouTube | video clip | thumbnail | yes |
| Discord | embed | rich embed | yes |
| WhatsApp | link | link preview | yes |
| Copy Link | clipboard | - | - |

---

## Share Types

### Content Shares
- **Show Clips** - Short video moments
- **Live Moments** - Screenshot highlights
- **Achievements** - Win/trophy moments
- **Rewards** - Unlock celebrations
- **Leaderboard** - Ranking highlights

### Attribution
- User ID (sharer)
- Content ID (what was shared)
- Timestamp
- Platform target
- Campaign ID (optional)

---

## Share Flow

1. User triggers share (button/auto)
2. System captures moment/screenshot
3. Preview generated
4. Platform selection
5. Attribution appended
6. Share API called
7. Analytics tracked

---

## Deep Linking

| Target | URL Pattern |
|--------|-------------|
| Artist Profile | /artist/{artistId} |
| Show Page | /show/{showId} |
| VOD | /watch/{vodId} |
| Live Room | /live/{roomId} |

---

## Files Reference

- `data/social/share-templates.json` - Share templates
- `data/social/platform-rules.json` - Platform rules
