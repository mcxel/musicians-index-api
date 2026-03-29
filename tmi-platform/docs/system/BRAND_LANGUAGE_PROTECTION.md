# BRAND_LANGUAGE_PROTECTION.md
# Brand Language Protection — Spelling, Naming, and Tone Rules
# These terms must survive AI autocorrect, refactor tools, copy editing, and code generation.

## Protected Brand Terms

| Correct Spelling | Common Wrong Versions | Never Use |
|-----------------|----------------------|-----------|
| `Berntout` | Burnout, Berntot, Bernt Out, Berntouts | All wrong versions |
| `BerntoutGlobal` | Berntout Global (with space), BerntOut Global, berntoutglobal | All wrong versions |
| `Berntout Perductions` | Berntout Productions, Bernt Out Perductions | All wrong versions |
| `The Musician's Index` | The Musicians Index (no apostrophe), Musicians Index, TMI | All wrong versions |
| `TMI` | T.M.I., t.m.i., Tmi | Always ALL CAPS, no periods |
| `B.J.M.` | BJM, B.J.M (missing final period), bjm | Always with periods |
| `Marcel` | Marcell, Marcelle | Double-L variants |

---

## Linting Rules

Add these to the project spell checker / linter configuration:

### `.cspell.json` (if using CSpell)
```json
{
  "words": [
    "Berntout",
    "BerntoutGlobal",
    "Perductions",
    "TMI"
  ],
  "ignoreWords": [],
  "flagWords": [
    "Burnout",
    "berntoutglobal",
    "Productions"
  ]
}
```

### ESLint no-restricted-syntax (optional enforcement)
```js
// .eslintrc additions — custom rule concept:
// Flag string literals containing known wrong spellings
// Requires custom ESLint plugin or manual code review
```

---

## Code-Level String Rules

When brand names appear in:
- JSX/TSX strings → use exact spelling: `"Berntout"`, `"BerntoutGlobal"`
- Constants → define once in a shared constants file and import everywhere
- API responses → validate against constants before returning

### Recommended Constants File
```typescript
// packages/shared/src/brand.ts
export const BRAND = {
  NAME: 'BerntoutGlobal',
  SHORT: 'Berntout',
  LABEL: 'Berntout Perductions',
  PLATFORM: "The Musician's Index",
  ACRONYM: 'TMI',
} as const;
```

Import `BRAND.NAME` instead of hardcoding the string. This prevents typos from drifting in.

---

## Content Tone Rules

### Tone is:
- Confident, direct, high-energy
- Music-industry native (not corporatized, not generic start-up)
- Slightly underground/gritty but polished
- Inclusive of all music roles: artist, fan, host, judge, sponsor

### Tone is NOT:
- Generic SaaS UI copy ("Your dashboard", "Manage your account")
- Overly casual (no "Hey there!", no "Oops!")
- Verbose (short, punchy copy preferred)
- Apologetic (never "sorry for the wait" — use "Loading..." or say nothing)

---

## Approved Platform Copy Patterns

| Context | Approved | Never Use |
|---------|---------|---------|
| Page title | "The Musician's Index" | "Musicians Index", "TMI Platform" |
| Error state | "Something went wrong — try again" | "Oops! We made an error" |
| Empty state | "No [content] yet" | "There are no items to display" |
| Loading | "Loading..." or skeleton | "Please wait..." |
| Points award | "+15 pts" | "You earned 15 points!" |
| Diamond badge tooltip | "Permanent Diamond" or "Diamond Status" | "Elite member", "VIP" |
| Auth gate copy | "Sign in to [action]" | "Login required", "Please log in to continue" |

---

## Protected Artist Names

These names must never be auto-corrected, abbreviated, or changed:

| Name | Notes |
|------|-------|
| Marcel | Permanent Diamond — exact spelling required everywhere |
| B.J.M. | Permanent Diamond — always with periods, never "BJM" |

---

## Review Process

Before any content or copy is committed to the repo (including docs, UI strings, email templates):

1. Search for known wrong spellings:
```bash
grep -ri "burnout\|berntot\|bernt out\|musicians index\b\|bjm\b\|productions\b" \
  apps/ packages/ docs/ --include="*.{ts,tsx,md,json}" -l
```

2. Review results — each match is a potential drift point.
3. Fix before committing.
