# Random Page Balancer

This document outlines the architecture of the Random Page Balancer, which is handled by the `RandomPageSelector` system.

## Core Responsibilities

-   Selects a random page from a given pool, ensuring it is not on cooldown.
-   Prevents flavor fatigue by not showing the same `RandomPageKind` too frequently.
-   Provides a simple `selectBalancedRandomPage` function to be used by the `IssueEngine`.

## Cooldowns

The `isRandomPageOnCooldown` function checks if a given `RandomPageKind` has appeared within a recent window of a specified size (default is 2). This prevents repetitive page rhythms (e.g., two poll pages in a row).
