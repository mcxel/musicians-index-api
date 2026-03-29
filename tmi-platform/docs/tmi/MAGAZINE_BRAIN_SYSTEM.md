# Magazine Brain System

The Magazine Brain is the behavior layer for issue sequencing, random-page balancing, exposure ordering, and recent-page recovery.

## Purpose

The Magazine Brain is the top-level orchestrator for the TMI magazine experience. It coordinates the various sub-systems to create a cohesive and engaging user journey that adheres to the core "Magazine Spine" principle.

## Canonical Location

`apps/web/src/systems/magazine/`

## Source of Truth Split

-   **Behavior:** `apps/web/src/systems/magazine/`
-   **Visuals:** `apps/web/src/components/tmi/`
-   **Architecture:** `docs/tmi/`

## Magazine Spine

The core architectural rule is the permanent issue flow:
**Artist Page → Article/News Page → Random Page → repeat**

## Inputs

The `createMagazineBrain` function takes an `IssueBuildInput` object, which includes:
-   `artistPages`: A pool of available artist pages.
-   `articlePages`: A pool of available article pages.
-   `randomPages`: A pool of available random pages.
-   `randomHistory`: An optional history of recently shown random page kinds.
-   `length`: An optional target length for the issue sequence.

## Outputs

The `createMagazineBrain` function returns a `MagazineBrain` instance with methods that provide:
-   The next page in the sequence (`nextPage`).
-   The list of recently visited pages (`getRecent`).
-   The current state of the brain (`getState`).

## Integration Notes

The systems layer (including the Magazine Brain) does not directly render UI. It returns data structures and decisions (e.g., which page to show next). UI components in `src/components/tmi/` are responsible for consuming this data and rendering the appropriate visual representation.
