/**
 * GameShowHostEngine.ts — Automated 3D Animatronic Game Show Host Engine
 *
 * Registers canonical game show hosts (Julius, Tiana Monday Night Stage Host,
 * Jack O'Brien, Hector Lvanos, Record Ralph, Bebo) as 360 BobbleHead animatronics.
 * Runs automated host routines (intro speech, performer introductions, cypher call-offs,
 * score announcements, spotlight triggers) without requiring manual human control.
 */

import { assembleBobbleHeadBotAvatar, BobbleHeadBotAvatarConfig } from '../avatar/BotAvatarAssembler';

export interface AnimatronicHostProfile {
  hostId: string;
  name: string;
  title: string;
  avatarConfig: BobbleHeadBotAvatarConfig;
  catchphrase: string;
  stagePosition: [number, number, number]; // [X, Y, Z] on 3D stage
  isAnimatronicActive: boolean;
  currentAction: 'speaking' | 'introducing_performer' | 'announcing_winner' | 'idle' | 'dancing';
}

export const CANONICAL_HOST_ROSTER: Record<string, Omit<AnimatronicHostProfile, 'avatarConfig'>> = {
  julius: {
    hostId: 'julius',
    name: 'Julius',
    title: 'Master of Ceremonies & Thunder Dome Host',
    catchphrase: "Welcome to the Thunder Dome! Let's get ready to make noise!",
    stagePosition: [0, 1.8, -2.5],
    isAnimatronicActive: true,
    currentAction: 'idle',
  },
  tiana: {
    hostId: 'tiana',
    name: 'Tiana',
    title: 'Monday Night Stage Host',
    catchphrase: 'Monday Night Live starts right now! Give it up for our next performer!',
    stagePosition: [-2, 1.8, -2.5],
    isAnimatronicActive: true,
    currentAction: 'idle',
  },
  jack_hector: {
    hostId: 'jack_hector',
    name: "Jack O'Brien & Hector Lvanos",
    title: 'Cypher Battle Arena Anchors',
    catchphrase: 'Two enter, one crowned king! Let the battle begin!',
    stagePosition: [2, 1.8, -2.5],
    isAnimatronicActive: true,
    currentAction: 'idle',
  },
  record_ralph: {
    hostId: 'record_ralph',
    name: 'Record Ralph',
    title: 'Vinyl & DJ Turntable Host',
    catchphrase: "Dropping the hottest tracks in 4K Ultra HD!",
    stagePosition: [0, 2.0, -4.0],
    isAnimatronicActive: true,
    currentAction: 'idle',
  },
  bebo: {
    hostId: 'bebo',
    name: 'Bebo',
    title: 'Comedy & VIP Lounge Host',
    catchphrase: "Keep those drinks coming and the laughs rolling!",
    stagePosition: [3.5, 1.6, -1.0],
    isAnimatronicActive: true,
    currentAction: 'idle',
  },
};

class GameShowHostEngineService {
  private hosts: Map<string, AnimatronicHostProfile> = new Map();

  constructor() {
    this.initializeHosts();
  }

  private initializeHosts(): void {
    let index = 1;
    for (const [id, meta] of Object.entries(CANONICAL_HOST_ROSTER)) {
      const avatarConfig = assembleBobbleHeadBotAvatar(`host-${id}`, meta.name, index * 10, 'cypher_host');
      this.hosts.set(id, {
        ...meta,
        avatarConfig,
      });
      index++;
    }
  }

  /**
   * Gets an animatronic host by ID (e.g. 'julius').
   */
  public getHost(hostId: string): AnimatronicHostProfile | undefined {
    return this.hosts.get(hostId);
  }

  /**
   * Triggers an automated animatronic speech & action sequence.
   */
  public triggerHostAction(
    hostId: string,
    action: 'speaking' | 'introducing_performer' | 'announcing_winner' | 'dancing',
    customMessage?: string
  ): { hostName: string; speech: string; action: string } | null {
    const host = this.hosts.get(hostId);
    if (!host) return null;

    host.currentAction = action;
    const speech = customMessage || host.catchphrase;

    // Reset back to idle after action duration
    setTimeout(() => {
      if (this.hosts.has(hostId)) {
        this.hosts.get(hostId)!.currentAction = 'idle';
      }
    }, 6000);

    return {
      hostName: host.name,
      speech,
      action,
    };
  }

  /**
   * Returns all registered animatronic hosts.
   */
  public getAllHosts(): AnimatronicHostProfile[] {
    return Array.from(this.hosts.values());
  }
}

export const GameShowHostEngine = new GameShowHostEngineService();
