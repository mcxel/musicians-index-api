# Page Flow Map

**Purpose:** To define and lock the intended user navigation paths (chains) through the platform's modules. This ensures a cohesive user journey and prevents dead ends.

**Universal Completion Rule:** No major module is complete unless it has a route, scene, script, asset/animation/expression mapping, bot chain, fallback state, and validation coverage.

---

## 1. Public Magazine & Discovery Flow

**Owner:** `content-team`
**Build Priority:** P1

```mermaid
graph TD
    A[Homepage / Cover] --> B{Article Page};
    B --> C{Artist Feature};
    C --> D{Artist is LIVE?};
    D -- Yes --> E[Fan Join Flow];
    D -- No --> B;
    B --> F[Related News];
    F --> B;
    B --> G[Rotating Experience];
    G --> B;
```
*   **Chain:** `Homepage -> Article -> Artist -> Join Live Room OR -> Related Article`
*   **Key Logic:** The `RealtimeEngine` must intercept the `Artist Feature` page load if the artist is live and redirect to the `Fan Join Flow`.

## 2. Fan Join & Replay Flow

**Owner:** `community-team`
**Build Priority:** P0

```mermaid
graph TD
    A[Discovery / Notification] --> B{Join Room};
    B -- Success --> C[Live Stage];
    B -- Room Full --> D[Fallback: Waiting Room Scene];
    C --> E{Show Ends};
    E --> F[Replay / Archive Flow];
    F --> G[Timeline / Archive Page];
```
*   **Chain:** `Notification -> Join Room -> Live Stage -> Show End -> Archive Page`
*   **Key Logic:** The `SceneEngine` must handle the `Room Full` state by loading the `Waiting Room` fallback scene, not showing an error.

## 3. Creator Academy & Onboarding Flow

**Owner:** `artist-relations`
**Build Priority:** P1

```mermaid
graph TD
    A[Artist Signup] --> B[Creator Academy];
    B --> C[Promo Tools Tutorial];
    C --> D[First Live Event Setup];
    D --> E[Artist Dashboard];
    E --> F[Growth Recommendations];
```
*   **Chain:** `Signup -> Academy -> Tools -> First Live -> Dashboard`
*   **Key Logic:** The `StateEngine` must track tutorial completion to unlock features in the `Artist Dashboard`.

## 4. Live Room Avatar Presence Flow

**Owner:** `experience-team`
**Build Priority:** P0

```mermaid
graph TD
    A[Join Room] --> B[Avatar Presence Load];
    B --> C[Idle Motion + Speaker State];
    C --> D{Music / Chat / Voice Events};
    D -- Music --> E[Bob / Sway / Crowd Motion];
    D -- Voice --> F[Lip Sync + Speaker Highlight];
    D -- Reactions --> G[Emote / Room Burst / Camera Variation];
    E --> H[Room Experience Loop];
    F --> H;
    G --> H;
    H --> I{Performance Budget Hit?};
    I -- Yes --> J[Fallback: Reduced Motion / Static Mode];
    I -- No --> H;
```
*   **Chain:** `Join Room -> Presence Load -> Motion / Voice / Reaction Loop -> Performance Fallback`
*   **Key Logic:** The motion engine must respect accessibility settings, anti-spam caps, and the high/medium/low performance ladder before rendering full room effects.

## 5. Poll To Editorial Magazine Flow

**Owner:** `editorial-systems`
**Build Priority:** P0

```mermaid
graph TD
    A[Poll Launch] --> B[Votes + Splits + Timers];
    B --> C[Result Snapshot];
    C --> D[Editorial Draft Bot Chain];
    D --> E{Placement Rules};
    E --> F[News / Magazine Article];
    E --> G[Rankings / Yearbook Archive];
    F --> H[Related Polls + Related Articles];
    G --> H;
```
*   **Chain:** `Poll -> Snapshot -> Editorial Draft -> Placement -> Article / Archive -> Recirculation`
*   **Key Logic:** Important polls are incomplete until they can generate an editorial result story and route into the correct magazine lane.

## 6. Live Trends Poll And Trivia Refresh Flow

**Owner:** `content-intelligence`
**Build Priority:** P1

```mermaid
graph TD
    A[Trend Scout Bot] --> B[Question Library Refresh];
    B --> C[Moderation Review];
    C --> D[Timed Poll / Trivia Release];
    D --> E[Participation + Completion Metrics];
    E --> F[Trend Recap / Editorial Follow-up];
    F --> G[Archive + Recommendation Update];
```
*   **Chain:** `Trend Ingestion -> Question Refresh -> Review -> Release -> Metrics -> Editorial Recap`
*   **Key Logic:** The freshness engine must prevent current-year polls and trivia from becoming stale by combining weekly trend pulls, moderation review, and archive retirement rules.