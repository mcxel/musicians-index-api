export interface FunnelMetrics {
  reach: number;
  completionRate: number; // 0 to 1
  likeRate: number;       // 0 to 1
  fanConversion: number;  // 0 to 1
  existingFanRetained: number; // 0 to 1
  newListenerRetained: number; // 0 to 1
  badgesEarned: string[];
}

export class FanConversionFunnelEngine {
  /**
   * Analyzes live telemetry shards to calculate the "Fan-Truth" metrics.
   */
  static analyzePerformance(
    totalAttendees: number,
    existingFans: number,
    newListeners: number,
    completedListens: number,
    totalReactions: number,
    newConversions: number
  ): FunnelMetrics {
    const reach = totalAttendees;
    
    // Core calculations
    const completionRate = reach > 0 ? completedListens / reach : 0;
    const likeRate = reach > 0 ? totalReactions / reach : 0;
    const fanConversion = newListeners > 0 ? newConversions / newListeners : 0;

    // The "Truth Gap" - did existing fans stay vs new listeners?
    // Mocking the segregation logic for the HUD representation
    const existingFanRetained = existingFans > 0 ? (completedListens * 0.8) / existingFans : 0; 
    const newListenerRetained = newListeners > 0 ? (completedListens * 0.2) / newListeners : 0;

    const badgesEarned: string[] = [];
    
    // Achievement Evaluator
    if (fanConversion > 0.4) {
      badgesEarned.push("Viral Spark");
    }
    if (existingFanRetained >= 0.95) {
      badgesEarned.push("Fan Magnet");
    }
    if (likeRate > 0.5) {
      badgesEarned.push("Crowd Controller");
    }
    if (completionRate > 0.8) {
      badgesEarned.push("Flawless Execution");
    }

    return {
      reach,
      completionRate,
      likeRate,
      fanConversion,
      existingFanRetained,
      newListenerRetained,
      badgesEarned,
    };
  }
}