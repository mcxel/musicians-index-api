# Exposure Order Engine

This document outlines the architecture of the Exposure Order Engine, handled by the `ExposureBalancer.ts` system.

TMI must use two separate ranking systems: Exposure Order and Prestige Rank.

## Exposure Order (Discovery-First)

-   **Purpose**: This order is used for discovery-focused surfaces like the preview wall and the homepage live cover.
-   **Core Rule**: Less-exposed artists appear earlier.
-   **Implementation**: The `computeExposureOrder` function sorts artists based on their exposure score, which is calculated from their `exposureCount` and any `fairnessBoost`. Artists with lower scores appear first.

## Prestige Rank (Status Layer)

-   **Purpose**: This rank is a visible status symbol for artists, used on article badges, billboards, and for sponsor recognition.
-   **Core Rule**: Based on merit, engagement, and in-platform success.
-   **Implementation**: The `ExposureBalancer` is not responsible for calculating prestige, but the architecture ensures that the two systems are separate. The `separateExposureFromPrestige` function is a placeholder to reinforce this separation.
