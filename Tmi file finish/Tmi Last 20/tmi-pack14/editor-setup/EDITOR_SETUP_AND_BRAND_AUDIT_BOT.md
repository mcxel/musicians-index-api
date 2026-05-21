# EDITOR_AND_VSCODE_DICTIONARY_SETUP.md
## How to Set Up VS Code So It Never Auto-Corrects Brand Words

---

## STEP 1 — INSTALL THESE VS CODE EXTENSIONS

Open VS Code Extensions panel (Ctrl+Shift+X / Cmd+Shift+X) and install:

```
Required:
  streetsidesoftware.code-spell-checker  ← cSpell: Spell checker with custom dictionaries
  esbenp.prettier-vscode                 ← Prettier: Code formatting
  dbaeumer.vscode-eslint                 ← ESLint: Code linting
  EditorConfig.EditorConfig              ← EditorConfig: Consistent spacing/newlines
  usernamehw.errorlens                   ← Error Lens: Inline error highlighting
  DavidAnson.vscode-markdownlint         ← MarkdownLint: Markdown quality
  eamodio.gitlens                        ← GitLens: Git history
  Grammarly.grammarly                    ← Grammarly: Grammar suggestions

Recommended:
  bradlc.vscode-tailwindcss             ← Tailwind IntelliSense
  prisma.prisma                          ← Prisma schema support
  ms-vscode.vscode-typescript-next      ← TypeScript latest
```

---

## STEP 2 — CREATE WORKSPACE SPELL DICTIONARY

Create this file at the repo root:

**File path:** `.vscode/cspell.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json",
  "version": "0.2",
  "language": "en",
  "ignorePaths": ["node_modules/**", "dist/**", ".next/**", "*.lock", "*.log", "pnpm-lock.yaml"],
  "words": [
    "Berntout", "BerntoutGlobal", "Perductions",
    "Meridicus", "Aiko", "Zahra", "Julius", "VEX",
    "Cypher", "Cyphers", "TMI", "HUD",
    "bobblehead", "bobbleheads",
    "haptic", "haptics", "jiggle", "confetti",
    "pnpm", "Prisma", "NestJS", "NextAuth",
    "Zustand", "Framer", "GLB", "GLTF", "WebGL",
    "RTMP", "HLS", "AAVE", "Ebonics", "Ebonic",
    "streamwin", "cypher", "prebuild", "monorepo",
    "transpile", "transpilePackages",
    "superchat", "livegame",
    "lodash", "tailwindcss", "nextjs",
    "canonicalize", "canonicalized",
    "prefetch", "hydrate", "hydrated", "dehydrate",
    "middleware", "revalidate", "revalidation",
    "neon", "strobelight", "confetti"
  ],
  "flagWords": [
    "burnt out productions",
    "Berntout Productions",
    "Burnout Global",
    "berntout productions"
  ],
  "allowCompoundWords": false,
  "overrides": [
    {
      "filename": "**/*.md",
      "words": ["Berntout", "BerntoutGlobal", "Perductions"]
    },
    {
      "filename": "**/*.json",
      "words": ["Berntout", "BerntoutGlobal", "Perductions"]
    },
    {
      "filename": "**/*.ts",
      "words": ["Berntout", "BerntoutGlobal", "Perductions"]
    }
  ]
}
```

---

## STEP 3 — CREATE VS CODE WORKSPACE SETTINGS

**File path:** `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.rulers": [100],
  "editor.tabSize": 2,
  "editor.wordWrap": "on",

  "cSpell.enabled": true,
  "cSpell.language": "en",
  "cSpell.showStatus": true,
  "cSpell.showAutocompleteSuggestions": true,

  "grammarly.selectors": [
    { "language": "markdown", "scheme": "file" },
    { "language": "plaintext", "scheme": "file" }
  ],

  "prettier.requireConfig": true,
  "eslint.enable": true,
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],

  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.eol": "\n",

  "[markdown]": {
    "editor.wordWrap": "on",
    "editor.defaultFormatter": "DavidAnson.vscode-markdownlint"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## STEP 4 — CREATE .editorconfig

**File path:** `.editorconfig` (repo root)

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

---

## STEP 5 — ADD GRAMMARLY EXCEPTIONS

In Grammarly's VS Code extension settings, add to custom dictionary:
```
Berntout
BerntoutGlobal
Perductions
Cypher
TMI
HUD
```

---

## COPILOT INSTRUCTION

Tell Copilot to install extensions and create these files:

```
Create these workspace configuration files exactly as specified in 
EDITOR_AND_VSCODE_DICTIONARY_SETUP.md in tmi-pack14.
Do not modify any brand words in cspell.json flagWords or words arrays.
Install all required VS Code extensions listed.
```

---

---

# BRAND_AUDIT_BOT_SPEC.md
## The Bot That Scans All Text for Brand Violations Weekly

---

## BOT ID: `brand-audit-bot`
## SCHEDULE: Every Sunday 22:00 (before Crown Bot and Review Bot)

---

## WHAT IT SCANS EVERY WEEK

```
1. tmi-platform/apps/web/src/app/**/page.tsx — all page text
2. tmi-platform/apps/web/src/components/**/*.tsx — all component text
3. tmi-platform/docs/**/*.md — all documentation
4. CMS articles (live published content)
5. Artist bio database
6. Sponsor content database
7. Email templates
8. Push notification templates
9. Footer text
10. Meta tags and SEO fields
11. Bot script templates
```

---

## WHAT IT CHECKS

| Check | Flagged As |
|---|---|
| "Berntout Productions" found anywhere | 🔴 BRAND VIOLATION |
| "Burnt Out" used as brand reference | 🔴 BRAND VIOLATION |
| "Burnout Global" found anywhere | 🔴 BRAND VIOLATION |
| "Musicians Index" (missing "The" or apostrophe) | 🟠 SPELLING WARNING |
| "Stream and Win" (should be "&") | 🟡 STYLE WARNING |
| "Cipher Arena" (should be "Cypher") | 🟠 SPELLING WARNING |
| Host name misspelled | 🟠 SPELLING WARNING |
| Missing footer copyright line | 🟡 COMPLIANCE WARNING |
| Missing BerntoutGlobal in About page | 🟡 COMPLIANCE WARNING |

---

## OUTPUT REPORT FORMAT

```json
{
  "report_id": "brand-audit-2026-W12",
  "scanned_at": "2026-03-22T22:00:00Z",
  "brand_violations": [
    {
      "severity": "critical",
      "found": "Berntout Productions",
      "should_be": "Berntout Perductions",
      "file": "apps/web/src/app/about/page.tsx",
      "line": 42,
      "auto_fixable": true
    }
  ],
  "spelling_warnings": [...],
  "style_warnings": [...],
  "compliance_warnings": [...],
  "overall_brand_health_score": 97,
  "auto_fixed_count": 0,
  "requires_human_review": 1
}
```

---

## AUTO-FIX RULES

The Brand Audit Bot may auto-fix ONLY:
- Capitalization corrections for platform terms (Preview Lobby → Preview Lobby)
- "Stream and Win" → "Stream & Win" in non-legal text

The Brand Audit Bot may NEVER auto-fix without approval:
- Any content touching artist attribution
- Any legal copy
- Any sponsor copy
- Any content that has been published and indexed

---

## BOT MANIFEST

```json
{
  "id": "brand-audit-bot",
  "schedule": "0 22 * * SUN",
  "owner": "algorithm",
  "permissions": {
    "reads": ["all-text-surfaces", "cms", "repo-docs", "email-templates", "notifications"],
    "writes": ["brand-audit-log", "content-quality-scores"],
    "cannot_touch": ["published-articles", "artist-data", "billing", "auth"]
  },
  "fallback": {
    "on_failure": "log-only",
    "notify": "big-ace",
    "retry_after_minutes": 60
  },
  "logging": {
    "channel": "bot-logs:brand-audit",
    "level": "warn",
    "persist_days": 365
  }
}
```

---

# APPROVED_TERMS_DICTIONARY.json (Full Content Reference)

```json
{
  "meta": {
    "version": "1.0",
    "owner": "BerntoutGlobal LLC",
    "updated": "2026-03",
    "law": "These terms must never be auto-corrected or flagged as errors in any system."
  },
  "brandTerms": [
    "Berntout", "BerntoutGlobal", "Berntout Perductions", "Perductions"
  ],
  "platformTerms": [
    "The Musician's Index", "TMI", "Stream & Win",
    "Cypher Arena", "Preview Lobby", "Lobby Wall",
    "Crown Winner", "World Premiere", "Hall of Fame",
    "HUD Interface", "Page Flip", "Artist Ring",
    "Fan Tier", "Supporter", "Superfan", "Founding Member",
    "Issue Cover", "Magazine Issue", "Weekly Issue",
    "Undiscovered Boost", "Discovery First",
    "BotManifest", "ProofGate", "FeatureFlag"
  ],
  "castNames": [
    "Bobby Stanley", "Timothy Hadley", "Meridicus James",
    "Aiko Starling", "Zahra Voss", "Nova Blaze", "Julius", "VEX"
  ],
  "systemNames": [
    "Mainframe", "Framework", "Algorithm",
    "Big Ace", "Marcel Dickens", "Jay Paul Sanchez"
  ],
  "showNames": [
    "Deal or Feud 1000", "Circles & Squares", "Monthly Idol",
    "Marcel's Monday Night Stage", "Game Night Hub",
    "Stream & Win Radio"
  ],
  "venueTiers": [
    "Free", "Bronze", "Gold", "Diamond", "Signature",
    "Living Room", "The Circle", "The Loft",
    "Back Room Bar", "Creator Studio", "Meeting Hall",
    "Nightclub", "Showcase Lounge", "Premium Club",
    "Mini Concert Hall", "Concert Hall", "Amphitheater",
    "Arena", "Premiere Theater", "World Stage"
  ],
  "musicTermsAllowed": [
    "cypher", "cyphers", "battle", "freestyle",
    "drop", "hook", "verse", "bridge", "adlib",
    "feature", "collab", "playlist", "tracklist"
  ]
}
```

---

# COMMON_CORRECTIONS.json

```json
{
  "brandCorrections": {
    "Berntout Productions": "Berntout Perductions",
    "burnt out": "Berntout",
    "Burnout Global": "BerntoutGlobal",
    "Berntout Global": "BerntoutGlobal",
    "Musicians Index": "The Musician's Index",
    "Cipher Arena": "Cypher Arena",
    "Stream and Win": "Stream & Win",
    "Preview lobby": "Preview Lobby",
    "crown winner": "Crown Winner",
    "hall of fame": "Hall of Fame"
  },
  "platformCorrections": {
    "Nova blaze": "Nova Blaze",
    "aiko starling": "Aiko Starling",
    "meridicus james": "Meridicus James",
    "bobby stanley": "Bobby Stanley",
    "timothy hadley": "Timothy Hadley",
    "zahra voss": "Zahra Voss"
  },
  "styleCorrections": {
    "Users": "Artists or fans or members",
    "Content creators": "Artists",
    "Utilize": "Use",
    "Leverage": "[Remove or rephrase]"
  }
}
```

---

*VS Code Setup + Brand Audit Bot + Approved Dictionary + Common Corrections v1.0*
*BerntoutGlobal LLC / Marcel Dickens*
