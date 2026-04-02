# Issue Memory and Cooldown Rules

This document outlines the architecture of the issue memory and cooldown systems.

## Recent Memory (`RecentMemory.ts`)

TMI uses an internal magazine memory, not just browser history, to store the user's recent page navigation.

-   The `recordRecentPage` function adds a page to the history and ensures the list is trimmed to a maximum of 20 entries.
-   The list is sorted by visit time, with the most recent page at the start.
-   Duplicate routes are removed to keep the history clean.
-   This system is used by UI components to build "Recent" trays, bookmarks, and backtrack functionality.

## Cooldown Rules (`RandomPageSelector.ts`)

Cooldowns are applied to random pages to prevent repetition and flavor fatigue.

-   The `isRandomPageOnCooldown` function checks if a given `RandomPageKind` has appeared within a specified recent window.
-   The default cooldown window is 2, meaning a `RandomPageKind` cannot appear if it was one of the last two random pages shown.
-   This helps maintain a balanced and engaging magazine rhythm.
