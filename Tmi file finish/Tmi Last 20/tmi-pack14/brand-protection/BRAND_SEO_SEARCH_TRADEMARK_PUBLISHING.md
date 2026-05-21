# BRAND_SEO_AND_DISCOVERY_PLAN.md
## How Berntout, BerntoutGlobal, and Berntout Perductions Become Permanent on the Internet

---

## THE GOAL
Make "Berntout," "BerntoutGlobal," and "Berntout Perductions" so consistently present
across public surfaces that search engines, press, and eventually reference works
recognize them as established, original, culturally specific terms.

This is not done in one day. It is done through consistent, strategic, long-term repetition.

---

## PHASE 1 — OWN THE SEARCH RESULT (Now)

### Required Pages on themusiciansindex.com

| Page | Purpose |
|---|---|
| `/about` | Origin story. Who Marcel Dickens is. What BerntoutGlobal means. |
| `/brand` | Official brand glossary. Defines Berntout, Berntout Perductions, TMI terms. |
| `/brand/origin` | Full origin story of the Berntout spelling and its cultural meaning. |
| `/brand/presskit` | Press kit with correct spellings, logos, pronunciations. Downloadable PDF. |
| `/legal` | Company name: BerntoutGlobal LLC. Production: Berntout Perductions. |
| `/glossary` | Full platform glossary including brand terms. |

### Required Meta Tags (Every Public Page)

```html
<!-- Correct: All public pages must use the official name -->
<title>The Musician's Index | BerntoutGlobal</title>
<meta name="description" content="The Musician's Index — a BerntoutGlobal platform. 
  Discovery-first live music magazine. This is your stage, be original." />

<!-- Open Graph (for social sharing) -->
<meta property="og:site_name" content="The Musician's Index" />
<meta property="og:description" content="A BerntoutGlobal platform." />

<!-- Structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BerntoutGlobal LLC",
  "alternateName": ["Berntout Global", "BerntoutGlobal"],
  "url": "https://themusiciansindex.com",
  "founder": {
    "@type": "Person",
    "name": "Marcel Dickens"
  },
  "description": "BerntoutGlobal is the parent company of The Musician's Index. 
    Berntout is the intentional Ebonic/cultural spelling of 'burnt out,' 
    representing the act of channeling exhaustion into creative excellence."
}
</script>
```

### Footer (Every Page)

```html
<footer>
  © 2026 BerntoutGlobal LLC. All rights reserved.
  A Berntout Perductions Production.
  The Musician's Index is a trademark of BerntoutGlobal LLC.
</footer>
```

---

## PHASE 2 — BUILD CITATIONS AND PRESENCE (Months 1–6)

| Action | Where | Why |
|---|---|---|
| Write About page with Berntout origin story | Site | Search engines index original content |
| Publish Glossary page defining Berntout | Site | Creates reference document |
| Use BerntoutGlobal in every video title/description | YouTube | Video SEO |
| Use BerntoutGlobal in every social bio | Instagram, X, TikTok | Profile authority |
| Include "Berntout Perductions" in video intros | YouTube/TikTok | Brand recall |
| Add to Wikipedia (if notable enough) | Wikipedia | Third-party citation |
| Reach out to music press for brand mentions | Press | Third-party authority |
| Submit brand to Wikidata | Wikidata | Structured data |
| Publish press kit PDF | themusiciansindex.com/brand | Downloadable record |
| Include in artist contracts and sponsor decks | Business docs | Business-world record |

---

## PHASE 3 — TOWARD DICTIONARY RECOGNITION (Long-Term)

Merriam-Webster and Oxford cannot be forced to add a word. But consistent public use can be documented.

**Requirements for potential dictionary consideration (MW standard):**
- Wide use in publications and media
- Use over a sustained period (typically years)
- Meaning that is distinct and not just a brand variant

**BerntoutGlobal strategy:**
1. Publish clear definition on brand page
2. Use "Berntout" as a standalone cultural descriptor in published articles
3. Have artists/community use it naturally in public content
4. Document use in press coverage
5. Eventually submit usage examples to dictionary editors with a formal letter

**Note:** Even without dictionary listing, consistent Google indexing and Wikipedia presence creates the equivalent public permanence for most practical purposes.

---

## GOOGLE SEARCH PROTECTION

**Target search results:**
- "Berntout" → themusiciansindex.com + BerntoutGlobal brand results
- "BerntoutGlobal" → company/platform results
- "Berntout Perductions" → company results + production credits
- "burnt out music" → TMI results appear (discovery opportunity)

**Actions:**
- Register Google Search Console for themusiciansindex.com
- Submit sitemap including /about, /brand, /brand/origin, /glossary
- Use brand name in headings (H1/H2) on About and Brand pages
- Use brand name in first 100 words of About page
- Ensure brand name appears in image alt text

---

# SEARCH_SYNONYM_AND_BRAND_MATCH_RULES.md
## How Platform Search Maps Typed Variants to Official Brand Terms

---

## PURPOSE
When users search or type brand terms in any TMI surface,
the system must find the official result even if the input is slightly different.
The system must NEVER auto-correct the display name.
It can match internally, but always displays the official spelling.

---

## BRAND SYNONYM MAP

```json
{
  "Berntout": {
    "official": "Berntout",
    "matchVariants": [
      "berntout", "BERNTOUT", "Bernout", "Burntout",
      "burnt out", "burned out", "burnout", "bernt out"
    ],
    "searchBehavior": "match-and-return-official",
    "displayAlways": "Berntout"
  },
  "BerntoutGlobal": {
    "official": "BerntoutGlobal",
    "matchVariants": [
      "berntout global", "Berntout Global", "BernoutGlobal",
      "burnout global", "BurntoutGlobal", "berntoutglobal"
    ],
    "searchBehavior": "match-and-return-official",
    "displayAlways": "BerntoutGlobal"
  },
  "Berntout Perductions": {
    "official": "Berntout Perductions",
    "matchVariants": [
      "berntout productions", "Berntout Productions",
      "berntout perductions", "BerntoutPerductions",
      "burnt out productions"
    ],
    "searchBehavior": "match-and-return-official",
    "displayAlways": "Berntout Perductions"
  },
  "The Musician's Index": {
    "official": "The Musician's Index",
    "matchVariants": [
      "Musicians Index", "the musicians index",
      "TMI", "tmi", "musician's index"
    ],
    "searchBehavior": "match-and-return-official",
    "displayAlways": "The Musician's Index"
  }
}
```

---

## SEARCH SERVICE RULES

1. Always match the synonym list first
2. Return official display name in results
3. Never show "Did you mean Burnt Out Global?" corrections
4. Fuzzy matching within 2 characters for brand terms
5. Map search input to Elasticsearch alias before querying

---

# BRAND_PROTECTION_AND_TRADEMARK_TRACKER.md
## Brand Marks, Domains, Handles, and Legal Protection Status

---

## OFFICIAL MARKS

| Mark | Type | Status | Notes |
|---|---|---|---|
| BerntoutGlobal | Brand/Company Name | In active commercial use | BerntoutGlobal LLC |
| Berntout | Cultural term / brand | In active use | Ebonic cultural spelling of "burnt out" |
| Berntout Perductions | Production company name | In active use | Ebonic cultural spelling of "productions" |
| The Musician's Index | Platform name | In active use | Primary product of BerntoutGlobal LLC |
| Stream & Win | Feature name | In active use | |
| Cypher Arena | Feature name | In active use | |
| "This is your stage, be original." | Slogan | In active use | Official platform tagline |

---

## DOMAINS TO SECURE

| Domain | Priority | Status |
|---|---|---|
| themusiciansindex.com | 🔴 Critical | [Secure] |
| berntoutglobal.com | 🔴 Critical | [Secure] |
| berntout.com | 🟠 High | [Secure if available] |
| berntoutperductions.com | 🟠 High | [Secure if available] |
| themusiciansindex.net/.org/.io | 🟡 Medium | [Secure if available] |
| streamandwin.com | 🟡 Medium | [Optional] |

---

## SOCIAL HANDLES TO SECURE

| Platform | Handle | Priority |
|---|---|---|
| Instagram | @berntoutglobal | 🔴 Critical |
| X/Twitter | @berntoutglobal | 🔴 Critical |
| TikTok | @berntoutglobal | 🔴 Critical |
| YouTube | @BerntoutGlobal | 🔴 Critical |
| Facebook Page | BerntoutGlobal | 🟠 High |
| LinkedIn | BerntoutGlobal | 🟠 High |
| Spotify (Brand) | BerntoutGlobal | 🟡 Medium |
| SoundCloud | BerntoutGlobal | 🟡 Medium |

**Rule:** All social bios must use the official spelling. No abbreviations or variants in handle or display name.

---

## TRADEMARK TRACKING

| Mark | Class | Notes |
|---|---|---|
| BerntoutGlobal | Class 41 (Entertainment) | Consider filing |
| The Musician's Index | Class 41 (Entertainment) | Consider filing |
| Berntout Perductions | Class 41 (Entertainment) | Consider filing |
| Berntout | Cultural term — complex | Monitor for infringement |

**Note:** Trademark registration protects commercial use. Ebonic/cultural term ownership is complex legally.
Consult an IP attorney before filing. Consistent documented commercial use is essential for any claim.
Track: who first used it publicly, when, where, what context.

---

## USAGE LOG (Keep Updated)

| Date | Where | How Used |
|---|---|---|
| 2026 | themusiciansindex.com | Platform launch |
| 2026 | All video intros | "A Berntout Perductions Production" |
| 2026 | Legal/footer copy | "© BerntoutGlobal LLC" |
| 2026 | Press kit | Official brand guide |

---

# PUBLISHING_CONSISTENCY_RULES.md
## Every Surface Where Brand Words Must Appear Correctly

---

## THE LAW
Every published surface must use official brand spellings.
This is not optional and is verified by the Brand Audit Bot weekly.

---

## SURFACE CHECKLIST

| Surface | Required Brand Words | Who Checks |
|---|---|---|
| Homepage (all 3 pages) | BerntoutGlobal in footer | Brand Audit Bot |
| Issue covers | "The Musician's Index" | Brand Audit Bot |
| All articles | "The Musician's Index" in byline context | Editor Bot |
| Artist profiles | "The Musician's Index" if platform referenced | Editor Bot |
| Broadcaster scripts | Official host names, platform name | Editor Bot |
| Push notifications | TMI (abbreviation OK in short notifications) | Editor Bot |
| Email templates | "The Musician's Index" + "BerntoutGlobal LLC" in footer | Editor Bot |
| Sponsor decks | "BerntoutGlobal LLC" full name | Manual review |
| Artist contracts | "BerntoutGlobal LLC" + "Berntout Perductions" | Manual review |
| Video intros | "A Berntout Perductions Production" | Manual review |
| Social bios | "BerntoutGlobal" in display name | Quarterly review |
| Help/FAQ pages | "The Musician's Index" | Brand Audit Bot |
| Legal/footer | Full copyright line | Brand Audit Bot |
| Press kit | All official marks with pronunciation guide | Manual review |
| About page | Full brand story with all official terms | Manual review |
| Glossary page | All platform terms officially defined | Brand Audit Bot |

---

## REQUIRED FOOTER (Every Page)

```
© 2026 BerntoutGlobal LLC. All rights reserved.
A Berntout Perductions Production.
The Musician's Index is a trademark of BerntoutGlobal LLC.
```

---

## REQUIRED VIDEO INTRO LINE

```
"A Berntout Perductions Production."
```

---

*Brand SEO + Search Synonyms + Trademark Tracker + Publishing Rules v1.0*
*BerntoutGlobal LLC / Marcel Dickens*
