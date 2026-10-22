// Avatar system helpers — FaceScanIdentityEngine is the real parametric fit engine.
// Other builders remain thin stubs until their own physical wiring pass.

export {
  FaceScanIdentityEngine,
  faceScanIdentityEngine,
  fitFaceScanToCanonicalAvatar,
  approveFaceIdentityFit,
  shapeCoefficientsToRigMorph,
} from "@/lib/engines/runtime/FaceScanIdentityEngine";

export class AvatarOnboardingEngine {
  static initialize(userId: string) {
    return { status: "pending_scan" as const, userId };
  }
}

export class BobbleheadAvatarBuilder {
  static buildBaseAvatar(userId: string) {
    return { userId, headScale: 1.35, bodyType: "standard" as const, rigReady: true as const };
  }
}

export class AvatarMotionPackageEngine {
  static loadPack(packId: string) {
    return { packId, animations: ["idle", "clap", "dance_loop"] as const };
  }
}

export class AvatarWardrobeEngine {
  static equipItem(avatarId: string, itemId: string) {
    return { avatarId, itemId, equipped: true as const };
  }
}

export class AvatarPropEngine {
  static holdProp(avatarId: string, propId: string) {
    return { avatarId, propId, holding: true as const };
  }
}

export class AvatarEmoteEngine {
  static triggerEmote(avatarId: string, emoteId: string) {
    return { avatarId, emoteId, fired: true as const };
  }
}
