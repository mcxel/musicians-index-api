/**
 * RevenueAutomationBot
 * Acts as an invisible "Hype Man" inside every venue.
 * Automatically promotes tickets, triggers "Goal Reached" FOMO, 
 * and injects sponsor advertisements at peak crowd energy moments.
 */

export class RevenueAutomationBot {
  private lastPromptAt: number = 0;
  private MIN_PROMPT_INTERVAL: number = 180_000; // 3 Minutes minimum between ANY revenue prompts
  
  /**
   * Evaluates the room's energy and decides if it's the right time to drop a CTA.
   */
  public evaluateRoomMonetization(roomId: string, currentEnergy: number, viewers: number, isSoldOut: boolean, hasEncoreChant: boolean) {
    const now = Date.now();
    if (now - this.lastPromptAt < this.MIN_PROMPT_INTERVAL) return; // Prevent spam

    // Only prompt if EARNED: High energy, sold-out momentum, or active crowd chanting
    if ((currentEnergy > 0.85 && viewers > 100) || isSoldOut || hasEncoreChant) {
      this.lastPromptAt = now;
      this.injectFomoPrompt(roomId, 'DIAMOND_SUBSCRIPTION');
    }
    
    // If the room is steadily engaged, rotate the sponsor billboard
    if (currentEnergy > 0.5 && currentEnergy <= 0.85) {
      this.rotateSponsorBillboard(roomId);
    }
  }

  private injectFomoPrompt(roomId: string, target: 'TICKET' | 'DIAMOND_SUBSCRIPTION' | 'BEAT_SALE') {
    console.log(`[RevenueBot] Energy is peaking in ${roomId}. Injecting ${target} purchase overlay.`);
    // Triggers the UI overlay for fans: "Over 100 people are vibing to this. Subscribe to support!"
  }

  private rotateSponsorBillboard(roomId: string) {
    console.log(`[RevenueBot] Audience stable in ${roomId}. Rotating premium sponsor ad slot.`);
    // Connects to AdRailSlot to push the highest bidding sponsor onto the wall
  }

  /**
   * Watches the ongoing tip totals and announces "Goals" to pressure more giving.
   */
  public manageDonationGoal(roomId: string, currentTotal: number, goal: number) {
    const percentage = currentTotal / goal;
    const now = Date.now();
    if (percentage > 0.8 && percentage < 1.0 && (now - this.lastPromptAt > this.MIN_PROMPT_INTERVAL)) {
      this.lastPromptAt = now;
      // Post a message in chat mimicking urgency
      this.dispatchHypeChatMessage(roomId, `🚨 We are 80% to the goal! Who's going to push us over?!`);
    }
  }

  private dispatchHypeChatMessage(roomId: string, message: string) {
    // Sends a system message into the Arena Chat
  }
}