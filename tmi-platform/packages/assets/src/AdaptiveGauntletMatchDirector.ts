// AdaptiveGauntletMatchDirector.ts
// Full implementation of the Adaptive Gauntlet Match Director as per the approved contract.

import {
  PerformanceTaxonomy,
  getFormats,
  getGenresForSkill,
  getSubgenres,
} from "./PerformanceTaxonomyRegistry";

/**
 * Input participant representation. Additional metadata can be added as needed.
 */
export interface Participant {
  userId: string;
  skill: string; // e.g., 'MUSIC'
  genre?: string;
  subgenre?: string;
  format?: string;
  region?: string; // optional geographic region identifier
}

/**
 * Request payload for a match operation.
 */
export interface MatchRequest {
  experience: string; // e.g., 'GAUNTLET', 'CHALLENGE', etc.
  skill: string;
  genre?: string;
  subgenre?: string;
  format?: string;
  region?: string;
  eligibleParticipants: Participant[];
  minimumParticipants: number;
  idealParticipants: number;
  maximumParticipants: number;
  waitDuration?: number; // milliseconds to wait before lock‑in
  availability?: string; // placeholder for future use
  adjacentTaxonomyRules?: Record<string, string[]>; // skill → adjacent skills/genres
}

/**
 * Result of a match operation.
 */
export interface MatchResult {
  selectedTaxonomyScope: {
    skill: string;
    genre?: string;
    subgenre?: string;
    format?: string;
  };
  eligibleParticipantIds: string[]; // frozen at lock‑in
  roomTitle: string;
  roomPolicyReference: string; // e.g., 'LOCK_IN', 'FORMING', 'OVERFLOW'
  expansionHistory: string[]; // human‑readable steps taken
  targetingMetadata: {
    taxonomyScope: string; // canonical ID for discovery services
    region?: string;
  };
}

/**
 * AdaptiveGauntletMatchDirector implements hierarchical matching, threshold handling,
 * lock‑in freezing, and metadata generation.
 */
export class AdaptiveGauntletMatchDirector {
  /**
   * Primary entry point: perform matching based on the request and return a deterministic result.
   */
  public match(request: MatchRequest): MatchResult {
    const history: string[] = [];
    // Step 1: exact match (skill + genre + subgenre + format)
    let candidates = this.filterByExact(request);
    if (candidates.length < request.minimumParticipants) {
      history.push(`Exact match yielded ${candidates.length} participants, below minimum ${request.minimumParticipants}`);
      // Step 2: drop subgenre
      candidates = this.filterBySkillGenreFormat(request);
      history.push(`Dropped subgenre, now ${candidates.length} participants (skill=${request.skill}, genre=${request.genre || "any"}, format=${request.format || "any"})`);
    }
    // Step 3: region expansion (ignore region constraints)
    if (candidates.length < request.minimumParticipants) {
      candidates = this.filterBySkillGenreFormat(request, true);
      history.push(`Region expansion applied, now ${candidates.length} participants`);
    }
    // Step 4: adjacent taxonomy expansion (use provided adjacent rules or simple fallback to same skill other genres)
    if (candidates.length < request.minimumParticipants) {
      candidates = this.expandViaAdjacency(request);
      history.push(`Adjacent taxonomy expansion applied, now ${candidates.length} participants`);
    }
    // Step 5: skill‑only fallback
    if (candidates.length < request.minimumParticipants) {
      candidates = this.filterBySkillOnly(request);
      history.push(`Skill‑only fallback applied, now ${candidates.length} participants`);
    }

    // Enforce cross‑skill rejection – ensure all remaining participants share the same skill
    const uniqueSkills = new Set(candidates.map(p => p.skill));
    if (uniqueSkills.size > 1) {
      // filter to the most common skill
      const skillCounts: Record<string, number> = {};
      candidates.forEach(p => {
        skillCounts[p.skill] = (skillCounts[p.skill] ?? 0) + 1;
      });
      const primarySkill = Object.entries(skillCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
      candidates = candidates.filter(p => p.skill === primarySkill);
      history.push(`Cross‑skill rejection applied, kept skill ${primarySkill}`);
    }

    // Determine final taxonomy scope based on the highest‑specificity match that succeeded
    const finalScope = this.determineScope(request, candidates);

    // Apply participant thresholds
    let policy = "FORMING";
    if (candidates.length >= request.minimumParticipants) {
      if (candidates.length >= request.idealParticipants) {
        policy = "IDEAL";
      } else {
        policy = "MINIMUM_REACHED";
      }
    }
    if (candidates.length > request.maximumParticipants) {
      // overflow: keep only up to maximum and mark the rest as overflow (handled by caller)
      candidates = candidates.slice(0, request.maximumParticipants);
      policy = "OVERFLOW";
    }

    // Lock‑in: freeze participant IDs at this point
    const frozenIds = candidates.map(p => p.userId);

    // Generate room title using taxonomy helpers
    const roomTitle = this.generateRoomTitle(finalScope, request.experience);

    // Build targeting metadata for discovery systems
    const targetingMetadata = {
      taxonomyScope: `${finalScope.skill}:${finalScope.genre ?? "*"}:${finalScope.subgenre ?? "*"}:${finalScope.format ?? "*"}`,
      region: request.region,
    };

    return {
      selectedTaxonomyScope: finalScope,
      eligibleParticipantIds: frozenIds,
      roomTitle,
      roomPolicyReference: policy,
      expansionHistory: history,
      targetingMetadata,
    };
  }

  // ------- Helper methods -------------------------------------------------

  private filterByExact(req: MatchRequest): Participant[] {
    return req.eligibleParticipants.filter(p => {
      return (
        p.skill === req.skill &&
        (req.genre ? p.genre === req.genre : true) &&
        (req.subgenre ? p.subgenre === req.subgenre : true) &&
        (req.format ? p.format === req.format : true)
      );
    });
  }

  private filterBySkillGenreFormat(req: MatchRequest, ignoreRegion = false): Participant[] {
    return req.eligibleParticipants.filter(p => {
      if (p.skill !== req.skill) return false;
      if (req.genre && p.genre !== req.genre) return false;
      if (req.format && p.format !== req.format) return false;
      if (!ignoreRegion && req.region && p.region && p.region !== req.region) return false;
      return true;
    });
  }

  private filterBySkillOnly(req: MatchRequest): Participant[] {
    return req.eligibleParticipants.filter(p => p.skill === req.skill);
  }

  private expandViaAdjacency(req: MatchRequest): Participant[] {
    if (!req.adjacentTaxonomyRules) return [];
    const adjacent = req.adjacentTaxonomyRules[req.skill] ?? [];
    // Adjacent list contains genre names that are considered acceptable expansion targets.
    return req.eligibleParticipants.filter(p => {
      return p.skill === req.skill && (adjacent.includes(p.genre ?? "") || p.genre === req.genre);
    });
  }

  private determineScope(req: MatchRequest, participants: Participant[]): {
    skill: string;
    genre?: string;
    subgenre?: string;
    format?: string;
  } {
    // Pick the most specific taxonomy that still has participants.
    if (req.subgenre) {
      return { skill: req.skill, genre: req.genre, subgenre: req.subgenre, format: req.format };
    }
    if (req.genre) {
      return { skill: req.skill, genre: req.genre, format: req.format };
    }
    return { skill: req.skill, format: req.format };
  }

  private generateRoomTitle(scope: { skill: string; genre?: string; subgenre?: string; format?: string }, experience: string): string {
    const parts = [scope.subgenre, scope.genre, scope.format, experience]
      .filter(Boolean)
      .map(p => p?.toString().replace(/_/g, " "));
    // Capitalize each part
    const title = parts.map(p => p!.charAt(0).toUpperCase() + p!.slice(1)).join(" ");
    return title;
  }
}
