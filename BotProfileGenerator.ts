/**
 * TMI Ghost Force Profile Generator
 * Populates the system with unique, realistic AI-driven audience members.
 */
export class BotProfileGenerator {
  private static firstNames = ['Jayden', 'Maya', 'Liam', 'Sofia', 'Marcus', 'Chloe'];
  private static lastNames = ['Smith', 'Rodriguez', 'Chen', 'Patel', 'Wright'];
  private static locations = ['Atlanta, GA', 'London, UK', 'Toronto, ON', 'Houston, TX', 'Los Angeles, CA'];
  private static genres = ['Trap', 'R&B', 'Synthwave', 'Boom-Bap', 'Lo-Fi'];
  private static tiers = ['FREE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  private static roles = ['AUDIENCE', 'HYPE', 'DIAGNOSTIC'];

  /**
   * Generates a squad of diverse, unique bot profiles for room population.
   */
  static generateBotSquad(count: number): any[] {
    const squad = [];
    for (let i = 0; i < count; i++) {
      squad.push(this.createSingleProfile());
    }
    console.log(`[BOT_PROFILE] Deployed ${count} unique Ghost Force members.`);
    return squad;
  }

  private static createSingleProfile() {
    const firstName = this.getRandomItem(this.firstNames);
    const lastName = this.getRandomItem(this.lastNames);
    
    return {
      botId: `B-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      displayName: `${firstName} ${lastName}`,
      location: this.getRandomItem(this.locations),
      favoriteGenre: this.getRandomItem(this.genres),
      faceMeshId: `ai-face-${Math.floor(Math.random() * 10000)}`, // Maps to AI-generated ultra-realistic faces
      subscriptionTier: this.getRandomItem(this.tiers),
      behaviorProfile: {
        hypeLevel: Math.random() * 100, // 0 to 100
        tipProbability: Math.random(),
        preferredEmotes: ['🔥', '💯']
      },
      role: this.getRandomItem(this.roles)
    };
  }

  private static getRandomItem(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static simulateTravel(botId: string, targetRoute: string) {
    // Simulates the bot navigating through the app to find 404s or dead links
    console.log(`[BOT_LOGISTICS] Bot ${botId} is traveling to route: ${targetRoute}`);
  }
}