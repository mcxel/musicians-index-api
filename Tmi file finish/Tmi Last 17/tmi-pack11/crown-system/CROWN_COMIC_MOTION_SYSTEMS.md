# CROWN_SYSTEM_COMPLETE.md
## Weekly Crown · Monthly Rotation · Yearly Awards · Hall of Fame

---

## WEEKLY CROWN

### What It Is
The #1 artist on the magazine cover each week.
Determined by: streams + points + cypher wins + fan votes + watch time.

### Weekly Crown Formula
```
CROWN_SCORE = (Streams × 0.3) + (Points × 0.25) + (CypherWins × 0.2) + (FanVotes × 0.15) + (WatchTime × 0.1)
```

### Weekly Crown Benefits
- Homepage 1 center portrait (large, animated)
- 6-second motion clip featured
- Crown glow animation on profile
- Crown badge on all platform surfaces
- Article feature on Homepage 3
- +500 bonus points
- Livestream venue upgrade (free, 1 week)
- Booking portal spotlight placement

---

## CROWN BOT (Automated)

The Crown Bot runs every Sunday at midnight:

```
Sunday midnight:
  1. Calculate CROWN_SCORE for all active artists
  2. Check 8-week rule (has current #1 been there 8 weeks?)
  3. If yes → force rotation → current #1 drops to #2
  4. Assign new #1
  5. Update homepage 1 center
  6. Send notification to new crown holder
  7. Send notification to all platform users
  8. Log crown event to history
  9. Update Hall of Fame tracker
  10. Check yearly award thresholds
```

---

## 8-WEEK ROTATION RULE

```
RULE: No artist can hold #1 for more than 8 consecutive weeks.

Week 1-8:   Artist can hold #1 (if they keep earning it)
Week 9:     FORCED ROTATION regardless of score
            → Artist drops to #2 or #3
            → Crown transfers to next highest scorer
Week 9-12:  Original #1 cannot reclaim #1
Week 13+:   Original #1 can compete again
```

### What Happens at Forced Rotation
1. Special "Crown Transfer" animation on homepage
2. Outgoing #1 gets "Legendary Run" badge
3. Incoming #1 gets "New Champion" intro
4. Magazine editorial covers the crown transfer (auto-article)

---

## YEARLY CROWN AWARDS

Tracked automatically by Crown Bot.

| Milestone | Award | Reward |
|---|---|---|
| 1-2 weeks at #1 | Bronze Crown Badge | Profile badge |
| 3-4 weeks at #1 | Silver Crown Badge | Profile badge + article |
| 5-7 weeks at #1 | Gold Crown Badge | Signature room access |
| 8+ weeks at #1 | Platinum Crown | Hall of Fame nomination |
| Artist of the Year | Platinum Crown + Trophy | Full platform feature + free year subscription |

### Artist of the Year
Most total weeks at #1 in a calendar year.
Announced December 31 each year.
Hall of Fame permanent entry.

---

## HALL OF FAME SYSTEM

### What It Is
A permanent archive of all-time #1 holders.
Lives on its own page: `/hall-of-fame`

### Hall of Fame Sections
- All-time most weeks at #1
- Season champions
- Artist of the Year winners
- Cypher champions
- Stream champions
- Fan vote champions
- Undiscovered breakthrough artists
- Pioneer (early platform) legends

### Hall of Fame Visual
- Dedicated room/venue aesthetic (gold trophy room)
- 3D display case for each artist entry
- Crown/trophy animation
- Timeline view of all crowns
- Stats: dates, weeks held, score, genre

---

# COMIC_INSERT_SYSTEM.md
## The Funny Panel on the Magazine Cover

---

## CONCEPT
Every magazine cover (Homepage 1) has a small comic-style insert panel in one corner.
It rotates weekly and adds humor, energy, and personality to the cover.
Like a classic magazine's pull-quote corner or comic teaser.

---

## PLACEMENT
- Corner position: bottom-left OR top-right of cover
- Size: Small (about 20% of cover area)
- Style: Comic book panel, bold border, speech bubble if needed
- Animation: Slight wobble or bounce (not full motion)

---

## COMIC INSERT TYPES (Weekly Rotation)

| Type | Example |
|---|---|
| Funny moment | Artist caught mid-expression on stage |
| Meme of the week | Platform-relevant music meme |
| Cypher moment | Best moment from last week's cypher |
| Quote of the week | Funniest/most memorable quote |
| Behind the scenes | Artist doing something unexpected |
| Weekly challenge | "This week's challenge: ___" |
| Bot commentary | Julius making a quip about the crown |
| Crown drama | "Who almost took #1? The story inside..." |
| Fan poll result | "73% said: [funny result]" |
| Issue teaser | "Turn to page 7 for..." |
| Rivalry teaser | "The beef you didn't see coming →" |

---

## COMIC INSERT BOT

Auto-generates insert suggestions weekly.
Big Ace approves final selection.
Julius may deliver the insert if it's a bot-commentary type.

---

# HOMEPAGE_MOTION_RULES.md
## How Motion Works Across All Three Home Pages

---

## MOTION PRIORITY SYSTEM

Only ONE surface can have full audio at a time.
Only ONE surface dominates the motion at a time.

### Priority Order
1. Main Preview Lobby (Homepage 2) — highest priority if live
2. Crown Winner portrait (Homepage 1) — when cover active
3. World Premieres countdown card — when active
4. Sponsor motion — lowest priority

---

## HOMEPAGE 1 (COVER) MOTION RULES

| Element | Motion | Sound |
|---|---|---|
| #1 Crown portrait | 6-second motion clip | Muted by default |
| #2–#10 portraits | 3-second micro-loop | None |
| Lightning bolts | Subtle pulse animation | None |
| Comic insert | Gentle wobble | None |
| Background shapes | Very slow drift | None |
| Crown glow | Continuous pulse | None |

**Motion on hover:**
- Portrait expands slightly (scale 1.05)
- Motion clip speed increases
- Rank number brightens

**Motion on click:**
- Portrait flashes
- Opens preview lobby

---

## HOMEPAGE 2 (LIVE WORLD) MOTION RULES

| Element | Motion | Sound |
|---|---|---|
| Main Preview Lobby | Full live video | Auto-muted on load |
| Lobby Wall thumbnails | Live video silent | Muted |
| World Premiere countdown | Digital tick | None |
| Undiscovered Boost card | Gentle pulse | None |
| Stream & Win score | Count-up animation | None |
| Live badges | Pulsing red | None |

**Sound rule:** Only one preview can unmute at a time (user click).

---

## HOMEPAGE 3 (EDITORIAL) MOTION RULES

| Element | Motion | Sound |
|---|---|---|
| Article feature card | Subtle headline scroll | None |
| Music News | Ticker scroll | None |
| Genre hexagons | Hover lift + color shift | None |
| Top 10 Charts | Live number updates | None |
| Sponsor spotlight | Crossfade animation | None |

---

## PAGE TRANSITION MOTION

When moving between Homepage 1 → 2 → 3:

```
OPTION 1 (Corner peel):
  Page edge lifts
  Paper texture visible
  Page folds back
  New page revealed underneath
  Paper crinkle sound (optional)

OPTION 2 (Bottom strip click):
  Current page slides up and off
  New page slides in from bottom
  Magazine page turn feel
  0.4 second animation

OPTION 3 (Swipe — mobile):
  Horizontal swipe
  Page follows finger
  Release → snaps to nearest page
  Spring ease
```

---

## REDUCED MOTION MODE

If user has reduced motion preference:
- All transitions: instant
- Portrait loops: static poster
- All page transitions: instant fade
- No page peel
- No corner animations
- All audio: default muted

---

*Crown System + Comic Insert + Motion Rules v1.0 — BerntoutGlobal XXL*
