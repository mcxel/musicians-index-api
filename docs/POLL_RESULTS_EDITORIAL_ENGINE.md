# POLL RESULTS REPORTING AND EDITORIAL PUBLISHING ENGINE

## Overview

Polls are not complete until their results can become editorial content. This engine turns poll activity into magazine-ready reporting, recap stories, archive pages, trend dashboards, and discovery loops.

---

## Purpose

- Convert important poll results into article drafts and publishable recaps.
- Place result stories in the correct magazine lane automatically.
- Preserve an editorial history of fan sentiment, artist sentiment, and year-based rankings.
- Keep polls current through trend refresh, moderation review, and archive retirement rules.

---

## Core Flow

### 1. Poll Runs
- Fans and artists vote on music, movies, cars, culture, contests, originality, and platform topics.

### 2. Result Snapshot Closes
- Store totals, percentages, splits, ranking order, freshness metadata, and time context.

### 3. Editorial Summary Is Generated
- Headline
- Subheadline
- Results recap
- Trend line / notable quote
- Chart or table block
- Link back to original poll

### 4. Story Is Placed
- Music poll results → music/news
- Movie poll results → entertainment/news
- Car poll results → lifestyle/culture
- Fan-vs-artist poll results → opinion/features
- Yearly rankings → rankings / yearbook

---

## Required Data Model

### Poll Result Snapshot
- poll_id
- category
- title
- result_snapshot
- winning_option
- ranking_json
- total_votes
- audience_split
- freshness_date
- current_year_flag
- trend_score
- retired_flag
- published_article_id
- report_status
- created_at
- updated_at

### Editorial Article Linkage
- source poll id
- source category
- related chart id
- fan/artist split id
- related article ids
- archive bucket id

---

## Article Types

- Poll Results Report
- Fan Choice Recap
- Artist Choice Recap
- Year-in-Review Rankings
- This Week's Top Voted Picks
- Battle of Opinions
- Trending Now Roundup
- Originality Spotlight Recap

---

## Magazine Placement Rules

### Section Map
- Music
- Entertainment
- Culture
- Cars
- Fan Voice
- Artist Voice
- Trending
- Rankings
- Yearbook / Best Of

### Placement Logic
- Category decides section family.
- Current-year or trending flags raise homepage/discovery priority.
- Fan-vs-artist split can route to dual placement: opinion + category news.
- Originality-focused polls can route to creator spotlight/editorial lanes.

---

## Result Blocks For Article Pages

- Winner badge
- Top 3 block
- Vote percentage bars
- Fan vs artist comparison block
- Quote callout
- Why this matters note
- Related polls links
- Archive navigation block

---

## Archive System

### Archive Types
- Yearly poll archive
- Category poll archive
- Best-of archive
- Leaderboard archive

### Archive Rules
- Keep current-year items promoted longer.
- Mark stale items archived but still discoverable.
- Allow yearbook pages to aggregate highest-engagement results by category.

---

## Live Trends Poll and Trivia Layer

### Categories
- Movies
- Music
- TV
- Cars
- Sports
- Fashion
- Gaming
- Concerts
- Tech
- Culture

### Question Types
- Best of the year
- Hottest right now
- Choose your top 3
- Rank these options
- Debate poll
- Audience prediction poll
- Artist-vs-fan comparison poll
- Timed trivia

### Freshness Workflow
- Weekly trend pull
- Monthly refresh
- Seasonal packs
- Event packs
- Award-season packs
- Retirement and replacement rules

---

## Bot Chain

- Trend Scout Bot: finds rising topics and category opportunities.
- Poll Builder Bot: drafts poll questions and answer sets.
- Trivia Refresh Bot: retires stale prompts and proposes replacements.
- Poll Results Writer Bot: turns result snapshots into article drafts.
- Trend Recap Bot: identifies patterns across recent polls.
- Magazine Placement Bot: assigns section, timing, and priority.
- Fact / Moderation Review Bot: verifies tone, claims, and safety.
- Engagement Optimizer Bot: ranks question formats by participation and retention.

---

## Analytics Requirements

- Most voted poll
- Most read poll-result article
- Most shared result story
- Categories driving signups
- Polls driving profile visits
- Polls driving room joins
- Poll formats with highest completion

---

## Sponsorship and Revenue Hooks

- Presented by label
- Sponsored section ribbons
- Sponsored category takeovers
- Safe labeling to keep editorial integrity clear

---

## Missing Chains That Are Now Mandatory

- Poll Result Snapshot Chain
- Editorial Draft Chain
- Placement and Recirculation Chain
- Current-Year Freshness Chain
- Archive Chain
- Sponsor-Safe Editorial Chain
- Analytics-to-Recommendation Chain

---

## Build Order

### Phase 1
- Result snapshot model
- Article linkage model
- Magazine placement rules

### Phase 2
- Writer / recap / placement bots
- Result blocks in article pages
- Archive routes and section buckets

### Phase 3
- Current-year trend ingestion
- Weekly refresh workflow
- Fan-vs-artist split reporting

### Phase 4
- Sponsor-safe editorial inventory
- Analytics optimization
- Yearbook and best-of dashboards

---

## Connected Systems

- Magazine / Discovery
- Ranking / Crown / Freshness
- Analytics Engine
- Recommendation Engine
- Creator Originality systems
- Avatar Motion and Live Trends systems

---

## Files Reference

- `docs/MASTER_BLUEPRINT.md`
- `docs/PAGE_FLOW_MAP.md`
- `data/archives/registry.json`
- `data/recaps/registry.json`
- `data/chains/registry.json`
- `data/features/registry.json`