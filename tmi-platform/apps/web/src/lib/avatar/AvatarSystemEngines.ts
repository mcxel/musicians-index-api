// NON-FUNCTIONAL STUBS — DO NOT SHIP OR WIRE INTO ANY UI.
// Every method in this file logs a message or returns a hardcoded literal (e.g.
// FaceScanIdentityEngine.processScan() always returns { meshMapped: true } without
// scanning anything; BobbleheadAvatarBuilder.buildBaseAvatar() always returns
// rigReady: true without building a rig). No real face processing, rigging, or
// rendering happens anywhere here. Real avatar pipeline work is genuine multi-session,
// specialist engineering (see CLAUDE.md Rule 18) — track as a separate future project,
// not something to present as functional (Rule 20).

export class AvatarOnboardingEngine {
  static initialize(userId: string) {
    console.log(`[AVATAR] Starting onboarding for ${userId}`);
    return { status: "pending_scan" };
  }
}

export class FaceScanIdentityEngine {
  static processScan(imageData: string) {
    console.log(`[AVATAR] Processing face scan mapping`);
    return { meshMapped: true };
  }
}

export class BobbleheadAvatarBuilder {
  static buildBaseAvatar(userId: string) {
    return { headScale: 1.5, bodyType: "standard", rigReady: true };
  }
}

export class AvatarMotionPackageEngine {
  static loadPack(packId: string) {
    return { animations: ['idle', 'clap', 'dance_loop'] };
  }
}

export class AvatarWardrobeEngine {
  static equipItem(avatarId: string, itemId: string) {
    console.log(`[AVATAR] Equipped ${itemId} onto ${avatarId}`);
  }
}

export class AvatarPropEngine {
  static holdProp(avatarId: string, propId: string) {
    console.log(`[AVATAR] Avatar ${avatarId} holding prop ${propId}`);
  }
}

export class AvatarEmoteEngine {
  static triggerEmote(avatarId: string, emoteId: string) {
    console.log(`[AVATAR] Fired emote ${emoteId} from ${avatarId}`);
  }
}