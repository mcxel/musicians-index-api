# Issue Intelligence Engine

This document outlines the architecture of the Issue Intelligence Engine, which is responsible for constructing the magazine's sequence of content.

## Core Responsibilities

The `buildIssueSequence` function is the core of this engine. It is responsible for:
-   Building an array of `IssueSequenceEntry` items.
-   Taking an `IssueBuildInput` object containing pools of artists, articles, and random pages.
-   Adhering to the `Artist → Article → Random` pattern provided by the `SequenceController`.
-   Using the `RandomPageSelector` to perform balanced selection of random pages.
-   Outputting an `IssueBuildOutput` object containing the final sequence and the updated random page history.
