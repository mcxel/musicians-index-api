# GRAMMAR_AND_CONTENT_QUALITY_RULES.md
## The Platform's Non-Negotiable Language Rules

---

## GRAMMAR RULES

| Rule | Correct | Incorrect |
|---|---|---|
| Use active voice | "Ricardo took the crown" | "The crown was taken by Ricardo" |
| Use present tense for events | "The cypher runs every Friday" | "The cypher will be running" |
| Artist names = singular | "Maya Torres is performing" | "Maya Torres are performing" |
| Oxford comma required | "drums, bass, and keys" | "drums, bass and keys" |
| Em dash not hyphen | "The Musician's Index — the real one" | "The Musician's Index - the real one" |
| No double spaces | One space after periods | Two spaces after periods |
| Contractions allowed in onboarding/notifications | "You're live." | "You are live." |
| Contractions avoided in articles | "The artist is ready." | "The artist's ready." |

---

## CONTENT QUALITY SCORING (0–100)

| Score | Meaning | Action |
|---|---|---|
| 90–100 | Publish-ready | Auto-approve |
| 75–89 | Minor issues | Show suggestions |
| 50–74 | Needs work | Block publish, require edit |
| 0–49 | Major issues | Block publish, alert editorial |

---

## SURFACE-SPECIFIC QUALITY MINIMUMS

| Surface | Minimum Score to Publish |
|---|---|
| Feature articles | 85 |
| Artist bios | 75 |
| Sponsor copy | 90 |
| Event descriptions | 75 |
| Notifications | 80 |
| Chat/comments | No minimum (moderation only) |

---

# BOT_BRAND_LANGUAGE_RULES.md
## How Every Bot Handles Brand Words

---

## THE GOLDEN RULE FOR ALL BOTS

> **No bot may rewrite, replace, normalize, or "correct" any protected brand word.
> Bots must use the official spelling in all generated content.
> If a bot is uncertain, it uses the official spelling from approved-terms-dictionary.json.**

---

## BOT-BY-BOT RULES

| Bot | Brand Rule |
|---|---|
| `interview-bot` | All generated article drafts must use "The Musician's Index," "BerntoutGlobal," "Berntout Perductions" |
| `news-bot` | Same as interview-bot. Never use variants. |
| `broadcaster-bot` | Scripts must use official host names and platform name. Never "Stream and Win" — always "Stream & Win" |
| `editor-bot` | Must run brand word lock FIRST before any grammar/spell correction |
| `brand-audit-bot` | Scans for violations. Never auto-fixes brand words itself |
| `oracle-bot` | Platform-specific trivia must use official term spellings |
| `clip-bot` | Clip titles and descriptions must use official platform terms |
| `guardian-bot` | Cannot modify brand words in moderated content |
| All other bots | Never generate content containing brand word variants |

---

## GENERATED CONTENT TEMPLATE RULES

All bot-generated text must use these templates where the platform is mentioned:

```
"on The Musician's Index"          ← not "on the musicians index"
"a BerntoutGlobal platform"        ← not "a Berntout Global platform"
"presented by Berntout Perductions"  ← not "Berntout Productions"
```

---

# BRAND_NORMALIZATION_RULES.md
## What the System Does When It Encounters Brand Word Variants

---

## RULE 1 — DETECT AND FLAG, NEVER SILENTLY REPLACE

When any system encounters "Berntout Productions" or "Burnt Out Global":
- Flag it for human review
- Do NOT automatically replace it in published content
- Do show a suggestion with the correct spelling
- Log the event to brand-audit-log

## RULE 2 — SEARCH MAPS VARIANTS, DISPLAYS OFFICIAL

When a user types a variant in search:
- Map internally to the official brand entry
- Return official-branded results
- Never show "No results for 'burnt out global'"

## RULE 3 — PUBLISHER GATE

When editorial content is submitted for publish:
- Run Brand Audit Bot pre-publish check
- If brand violations exist: block publish + show specific correction list
- Correction must be made by human, not auto-applied

## RULE 4 — USER-SUBMITTED CONTENT

When fans/artists submit bios or descriptions:
- Run brand word scan
- Show correction suggestion inline
- Never auto-apply
- User can accept or decline suggestion
- Log both outcomes

## RULE 5 — CODE AND CONFIG FILES

When Copilot or developers write code:
- cSpell flagWords configuration will flag "Berntout Productions" as an error
- VS Code will show warning underline
- Developer sees the correction before committing
- CI/CD can optionally fail on brand violations in documentation

---

# PROFANITY_FILTER_CONFIG.md
## Chat, Comments, and Submission Content Safety

---

## APPROACH
The platform uses a tiered profanity filter, not a simple word block.
Music culture has specific language norms that a blunt filter would destroy.
The filter must be smart about context.

---

## TIER 1 — AUTO-BLOCK (No exceptions)
Sexual language toward minors
Doxxing attempts
Racial slurs (non-reclaimed context)
Personal threats
Spam/phishing links

## TIER 2 — FLAG FOR REVIEW
Sexual language (adult, non-threatening)
Heavy profanity in artist bios
Profanity in article submissions
Drug references in promo content

## TIER 3 — ALLOWED WITH CONTEXT
Standard AAVE/hip-hop cultural language
Artist names that contain strong language
Song titles quoted in articles
Cypher battle trash talk (within community norms)

## IMPLEMENTATION

```json
// profanity-filter.config.json
{
  "provider": "internal-list + openai-context-check",
  "tiers": {
    "tier1": { "action": "auto-block", "log": true, "notify": "guardian-bot" },
    "tier2": { "action": "flag-for-review", "log": true, "notify": "guardian-bot" },
    "tier3": { "action": "allow", "log": false }
  },
  "surfaces": {
    "chat": ["tier1", "tier2"],
    "comments": ["tier1", "tier2"],
    "article-submissions": ["tier1"],
    "artist-bios": ["tier1"],
    "sponsor-copy": ["tier1", "tier2"],
    "event-titles": ["tier1", "tier2"],
    "lobby-names": ["tier1"]
  },
  "culturalExemptions": {
    "hipHopContext": true,
    "artistNameExemption": true,
    "quotedLyricsExemption": true
  }
}
```

---

*Grammar Rules + Bot Brand Rules + Normalization Rules + Profanity Config v1.0*
*BerntoutGlobal LLC / Marcel Dickens*
