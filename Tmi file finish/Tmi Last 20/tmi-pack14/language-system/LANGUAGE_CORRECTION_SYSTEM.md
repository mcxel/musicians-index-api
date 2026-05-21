# PLATFORM_LANGUAGE_STYLE_GUIDE.md
## The Official Voice and Tone of The Musician's Index

---

## THE PLATFORM HAS ONE VOICE — WITH 6 MODES

The platform never sounds generic, corporate, or robotic.
It sounds like a music magazine that grew up in the culture.

---

## MODE 1 — MAGAZINE VOICE (Articles, Editorials, Interviews)

**Feel:** Authoritative but human. Like a music journalist who actually listens.
**Tense:** Present tense for current events. Past for recaps.
**Person:** Third person for artists. Second person ("you") for reader engagement.

✅ Correct:
> "Ricardo Parker didn't just take the crown this week — he built a dynasty."
> "This is what the underground sounds like when it finally gets its moment."

❌ Incorrect:
> "User @ricardop has been ranked #1."
> "Congratulations to the winner of the weekly ranking!"

---

## MODE 2 — BROADCASTER VOICE (Live shows, commentary)

**Feel:** Hype, warm, never scripted-sounding.
**Energy:** Scales with hype meter (0–100%).
**Person:** Second person always ("you're watching," "you're live").

✅ Correct:
> "We are LIVE on The Musician's Index — and this room is different tonight."
> "Somebody in this crowd is about to witness something they'll talk about for years."

❌ Incorrect:
> "Welcome to the live stream event."
> "You are now watching a live performance."

---

## MODE 3 — NOTIFICATION VOICE (Push, in-app, email subjects)

**Feel:** Direct, brief, just enough intrigue to open it.
**Length:** 5–10 words ideal. Never more than 15.

✅ Correct:
> "The crown just changed hands. 👑"
> "Someone in your circle just went live."
> "Your score moved. Check it."

❌ Incorrect:
> "You have received a notification regarding a ranking update."
> "An artist you follow has started a livestream event."

---

## MODE 4 — ONBOARDING VOICE (Registration, first steps, empty states)

**Feel:** Warm, welcoming, never patronizing. Doesn't over-explain.

✅ Correct:
> "Pick what you love. We'll find you something real."
> "Your stage is ready. No waiting list."

❌ Incorrect:
> "Please select the genres you prefer from the options below."
> "Complete these steps to begin using the platform."

---

## MODE 5 — ERROR AND SYSTEM MESSAGE VOICE

**Feel:** Honest, calm, helpful. Never blames the user.

✅ Correct:
> "That room just filled up. Try another — there are more open now."
> "Something went sideways on our end. Give it a second."

❌ Incorrect:
> "Error 503: Service Unavailable"
> "The operation could not be completed due to a server error."

---

## MODE 6 — SPONSOR AND COMMERCIAL VOICE

**Feel:** Premium but not stiff. Aware it's an ad.
**Placement rule:** Sponsor copy never mimics editorial voice.

✅ Correct:
> "Brought to you by [Brand] — supporting real music."

❌ Incorrect:
> "This article was sponsored by [Brand]..." (blurs editorial/ad line)

---

## CAPITALIZATION RULES

| Term | Rule |
|---|---|
| Crown Winner | Always capitalized |
| The Crown | Capitalized when referring to the weekly #1 |
| Issue (weekly) | "Issue 12" — capitalize + number |
| Cypher | Always capital C |
| Preview Lobby | Both words capitalized in headers |
| Hall of Fame | Capitalize all three words |
| Fan / Supporter / Superfan | Capitalize in tier context |
| Free / Bronze / Gold / Diamond / Signature | Capitalize as tier names |

---

## FORBIDDEN PHRASES

| Forbidden | Use Instead |
|---|---|
| "Users" | "Artists" or "fans" or "members" |
| "Content creators" | "Artists" |
| "Content" (generic) | "Music," "show," "performance," "issue" |
| "Engage with" | "Watch," "join," "listen to" |
| "Leverage" | Never use this word |
| "Utilize" | "Use" |
| "Please note that" | Just say it |
| "At this time" | "Right now" or remove it |
| "Going forward" | Just say when |

---

# TEXT_CORRECTION_SERVICE_SPEC.md
## The Platform Text Correction Engine

---

## PURPOSE
Every text input on the platform passes through this service.
It corrects, suggests, and logs — but never silently overwrites brand words.

---

## SERVICE LOCATION
`apps/api/src/services/text-correction.service.ts`

---

## CORRECTION PIPELINE (In Order)

```
User submits text
      ↓
Step 1: BRAND WORD LOCK
  → Detect and freeze all protected brand terms
  → Berntout / BerntoutGlobal / Perductions cannot be touched
      ↓
Step 2: SPELL CHECK
  → Check against approved-terms-dictionary.json
  → Flag unknown words
  → Auto-fix obvious single-character errors
  → Suggest corrections for ambiguous words
      ↓
Step 3: GRAMMAR CHECK
  → Check sentence structure
  → Flag subject-verb disagreements
  → Suggest improvements (do not auto-apply)
      ↓
Step 4: PROFANITY FILTER
  → Check against banned-words.json
  → Flag for moderation review (do not silently delete)
      ↓
Step 5: STYLE GUIDE CHECK
  → Check capitalization of platform terms
  → Check forbidden phrases (see style guide)
  → Suggest style-guide-compliant alternatives
      ↓
Step 6: APPLY AUTO-FIXES (safe only)
  → Single-char typos
  → Missing apostrophes in contractions
  → Platform term capitalization
  → NEVER touch brand words
      ↓
Step 7: PRESENT SUGGESTIONS (complex fixes)
  → Show user the suggestions
  → Let user accept/reject each
      ↓
Step 8: SAVE CORRECTED VERSION + LOG
  → Save to DB with correction metadata
  → Log: what was changed, what was suggested, what user kept
```

---

## API

```typescript
// POST /api/text/correct
export interface TextCorrectionRequest {
  text: string;
  surface: TextSurface;    // 'article' | 'bio' | 'chat' | 'sponsor' | etc.
  userId: string;
  autoApplySimple: boolean; // Auto-fix single-char errors?
}

export interface TextCorrectionResponse {
  original: string;
  corrected: string;         // Auto-fixed version
  suggestions: Suggestion[]; // Complex suggestions for user review
  brandWordsPreserved: string[]; // Confirms brand words were locked
  correctionLog: CorrectionEvent[];
}

export interface Suggestion {
  position: [number, number]; // Start/end char index
  original: string;
  suggested: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  autoApply: boolean;
}
```

---

## WHERE IT RUNS

| Surface | Spell | Grammar | Profanity | Auto-Fix | Suggestions |
|---|---|---|---|---|---|
| Article body | ✅ | ✅ | ✅ | ✅ | ✅ |
| Artist bio | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat | ✅ | ❌ | ✅ | ✅ | ❌ |
| Comments | ✅ | ❌ | ✅ | ✅ | ❌ |
| Event titles | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sponsor copy | ✅ | ✅ | ✅ | ❌ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Emails | ✅ | ✅ | ✅ | ✅ | ✅ |
| Onboarding text | ✅ | ✅ | ❌ | ✅ | ✅ |
| Lobby names | ✅ | ❌ | ✅ | ✅ | ❌ |

---

## API PROVIDER STACK

Primary: **LanguageTool API** (open source, self-hostable)
AI Fallback: **OpenAI grammar correction** (for complex cases)
Profanity: Internal banned-words.json list
Brand protection: Internal brand-dictionary.json (always runs first)

---

# EDITOR_BOT_SPEC.md
## The Grammar / Content Cleanup Bot

---

## BOT ID: `editor-bot`
## SCHEDULE: On publish + nightly + weekly audit

---

## WHAT IT SCANS

- All published articles
- All artist bios
- All sponsor text
- Homepage copy
- Notification templates
- Email templates
- Help pages
- FAQ pages
- Admin announcements
- Bot-generated content

---

## WHAT IT DOES

```
1. Load text from CMS/DB
2. Run brand word lock (never correct brand words)
3. Run spell check vs approved-terms-dictionary.json
4. Run grammar check (LanguageTool API)
5. Score content quality:
   - Spelling score (0-100)
   - Grammar score (0-100)
   - Style guide compliance (0-100)
   - Brand word accuracy (0-100)
6. Auto-fix: safe corrections only
7. Flag: complex issues for editorial review
8. Publish report to editor-bot log channel
9. Alert editorial team if score < 80
```

---

## BOT MANIFEST

```json
{
  "id": "editor-bot",
  "schedule": "0 2 * * *",
  "owner": "algorithm",
  "permissions": {
    "reads": ["articles", "bios", "sponsor-copy", "notifications", "emails"],
    "writes": ["editor-bot-log", "content-quality-scores"],
    "cannot_touch": ["brand-words", "published-crown-content", "user-chat"]
  },
  "fallback": {
    "on_failure": "skip-cycle",
    "notify": "framework",
    "retry_after_minutes": 60
  },
  "logging": {
    "channel": "bot-logs:editor",
    "level": "info",
    "persist_days": 90
  }
}
```

---

*Language Style Guide + Text Correction Service + Editor Bot v1.0*
*BerntoutGlobal XXL / The Musician's Index*
