// ════════════════════════════════════════════════════════
// FILE: .vscode/cspell.json AND packages/contracts/src/brand-dictionary.json
// PURPOSE: Official brand spellings — add to ALL spell checkers
// ════════════════════════════════════════════════════════

const OFFICIAL_BRAND_SPELLINGS = {
  "meta": {
    "owner": "Marcel Dickens / BerntoutGlobal LLC",
    "created": "2026",
    "law": "These spellings are FINAL and PROTECTED. Never auto-correct. Never normalize.",
    "culturalNote": "Berntout and Perductions are intentional Ebonic/AAVE cultural spellings. They are original creative works."
  },

  "primaryBrandNames": {
    "Berntout": {
      "status": "primary",
      "protection": "maximum",
      "meaning": "The intentional cultural/Ebonic spelling of 'burnt out'",
      "neverReplacWith": ["burnt out", "burned out", "burnout", "burntout"],
      "capitalRule": "Always capital B",
      "standalone": true
    },
    "BerntoutGlobal": {
      "status": "primary",
      "protection": "maximum",
      "meaning": "Parent company name",
      "neverReplaceWith": ["Berntout Global", "burnout global", "BernoutGlobal"],
      "capitalRule": "Capital B, capital G, no space",
      "standalone": true
    },
    "BerntoutPerductions": {
      "status": "primary",
      "protection": "maximum",
      "displayForm": "Berntout Perductions",
      "meaning": "Production company — 'Perductions' is the intentional cultural spelling of 'productions'",
      "neverReplaceWith": ["Berntout Productions", "Burnt Out Productions", "Berntout Prod"],
      "capitalRule": "Capital B, capital P, two words",
      "standalone": true
    }
  },

  "platformNames": {
    "TheMusiciansIndex": {
      "displayForm": "The Musician's Index",
      "abbreviation": "TMI",
      "rule": "Always use full name in body text. TMI only in code/internal references.",
      "apostropheRule": "Musician's — apostrophe after Musician, before s"
    },
    "StreamAndWin": {
      "displayForm": "Stream & Win",
      "rule": "Always ampersand, never 'and'"
    },
    "CypherArena": {
      "displayForm": "Cypher Arena",
      "rule": "Two words. Always 'Cypher' not 'Cipher'"
    },
    "PreviewLobby": {
      "displayForm": "Preview Lobby",
      "rule": "Two words, both capitalized in headers"
    }
  },

  "hostAndCastNames": {
    "BobbyStanley": "Bobby Stanley",
    "TimothyHadley": "Timothy Hadley",
    "MericusJames": "Meridicus James",
    "AikoStarling": "Aiko Starling",
    "ZahraVoss": "Zahra Voss",
    "NovaBlaze": "Nova Blaze",
    "JuliusMeerkat": "Julius",
    "VEXRobot": "VEX",
    "BigAce": "Big Ace",
    "MarcelDickens": "Marcel Dickens",
    "JayPaulSanchez": "Jay Paul Sanchez"
  },

  "systemTerms": [
    "Mainframe", "Framework", "Algorithm",
    "CrownWinner", "WeeklyCrown", "MonthlyCrown", "HallOfFame",
    "LobbyWall", "PreviewLobby", "CypherArena",
    "UndiscoveredBoost", "DiscoveryFirst",
    "TierUpgrade", "SeatAnchor",
    "BotManifest", "ProofGate", "FeatureFlag",
    "BerntoutGlobal", "Berntout", "Perductions"
  ]
};

// ════════════════════════════════════════════════════════
// FILE: .vscode/cspell.json
// PURPOSE: Workspace spell checker dictionary
// ════════════════════════════════════════════════════════

const CSPELL_CONFIG = {
  "$schema": "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json",
  "version": "0.2",
  "language": "en",
  "words": [
    // ─── BRAND NAMES (PROTECTED) ───
    "Berntout",
    "BerntoutGlobal",
    "Perductions",
    // ─── PLATFORM TERMS ───
    "Cypher",
    "Cyphers",
    "TMI",
    "HUD",
    "bobblehead",
    "bobbleheads",
    "neon",
    "haptic",
    "haptics",
    "jiggle",
    "confetti",
    "peel",
    // ─── HOST NAMES ───
    "Meridicus",
    "Aiko",
    "Zahra",
    "Nova",
    "Julius",
    "VEX",
    // ─── TECH TERMS ───
    "pnpm",
    "Prisma",
    "NestJS",
    "NextAuth",
    "Zustand",
    "framer",
    "GLB",
    "GLTF",
    "WebGL",
    "wasm",
    "RTMP",
    "HLS",
    "AAVE",
    "Ebonic",
    "Ebonics",
    // ─── PLATFORM SPECIFIC ───
    "superchat",
    "livegame",
    "streamwin",
    "cypher",
    "prebuild",
    "monorepo",
    "transpile",
    "transpilePackages",
    "lodash",
    "tailwindcss",
    "nextjs"
  ],
  "flagWords": [
    "burnt out",
    "burned out",
    "Burnout Global",
    "Berntout Productions"
  ],
  "ignorePaths": [
    "node_modules/**",
    "dist/**",
    ".next/**",
    "*.lock",
    "*.log"
  ]
};

// ════════════════════════════════════════════════════════
// FILE: tmi-platform/docs/brand/BRAND_ORIGIN_AND_USAGE_RECORD.md
// PURPOSE: The permanent origin story and usage record
// ════════════════════════════════════════════════════════

const BRAND_ORIGIN = `
# BRAND_ORIGIN_AND_USAGE_RECORD.md
## The Official Origin and Meaning of BerntoutGlobal Brand Terms

---

## BERNTOUT — OFFICIAL DEFINITION

**Word:** Berntout
**Pronunciation:** burn-out  
**Type:** Original brand term / cultural spelling innovation
**Cultural context:** Intentional Ebonic / AAVE (African American Vernacular English) spelling
**Standard equivalent:** "burnt out" or "burned out"
**Meaning in brand context:** A state of having pushed through exhaustion to create something greater — the act of channeling being "bernt out" into creative excellence

**Origin:** Created by Marcel Dickens, founder of BerntoutGlobal LLC.
**First use:** [Document first use date when confirmed]
**Public presence since:** 2026
**Intended trajectory:** Cultural term, platform brand, and original linguistic contribution

---

## BERNTOUT PERDUCTIONS — OFFICIAL DEFINITION

**Word:** Perductions
**Pronunciation:** per-duck-shuns
**Type:** Original brand term / cultural spelling innovation
**Cultural context:** Intentional Ebonic / AAVE cultural spelling
**Standard equivalent:** "productions"
**Meaning:** The production arm of BerntoutGlobal — where content is "perduced" with cultural originality

**Full company name:** Berntout Perductions
**Relationship to BerntoutGlobal:** Production subsidiary / brand unit

---

## WHY THESE SPELLINGS ARE PERMANENT

1. They are original creative works by Marcel Dickens
2. They carry cultural identity and intentional linguistic meaning
3. They differentiate the brand from generic uses of "burnt out"
4. They represent a distinct voice — the platform's own language
5. Changing them would destroy the brand identity
6. They will be defended against normalization in all systems

---

## OFFICIAL USAGE EXAMPLES

Correct:
  "Welcome to BerntoutGlobal."
  "This is a Berntout Perductions production."
  "The Berntout way — push through."

Incorrect (will be flagged):
  "Welcome to Burnout Global."
  "Berntout Productions"
  "burnt out global"

---

## DICTIONARY SUBMISSION INTENT

BerntoutGlobal intends to document and establish "Berntout" and "Berntout Perductions"
as recognized cultural terms through:

1. Consistent public usage on themusiciansindex.com
2. Artist/creator community adoption
3. Platform content (articles, videos, social)
4. Press kit and media references
5. Glossary page at themusiciansindex.com/brand
6. Origin story page at themusiciansindex.com/about
7. Structured data (schema.org Organization)
8. Long-term cultural presence

Note: Lexicon adoption (Merriam-Webster, Oxford, etc.) cannot be forced,
but grows through documented public use, cultural spread, and community adoption.
BerntoutGlobal will pursue this through legitimate cultural contribution.

---

*Brand Origin Record v1.0 — BerntoutGlobal LLC*
*Owner: Marcel Dickens*
*Created: 2026*
`;
