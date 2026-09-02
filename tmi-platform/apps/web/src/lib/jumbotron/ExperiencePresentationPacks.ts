/**
 * ExperiencePresentationPacks.ts — Canonical Experience Presentation Pack Registry & Resolver
 *
 * Laws:
 * 1. One metadata-driven resolver for all experience classes.
 * 2. Cypher Law: Strictly NO winner or elimination framing for normal Cyphers.
 * 3. World Dance Party Law: Dedicated procedural Disco Orb with mirrored surfaces and beat-reactive visuals.
 * 4. Grounded in real venue skin, lighting, and display-target parameters.
 */

import {
  type DisplayTargetClass,
  type JumbotronExperienceType,
  type JumbotronEventType,
  type JumbotronPresentationPack,
} from "./JumbotronContracts";

export interface PresentationPackResolutionContext {
  experienceType: JumbotronExperienceType;
  venueClass?: string;
  venueSkin?: string;
  presentationTheme?: string;
  geometryTargets?: DisplayTargetClass[];
  supportedDisplays?: DisplayTargetClass[];
  lightingProfile?: string;
  animationProfile?: string;
  brandPalette?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export class ExperiencePresentationPacks {
  /**
   * Canonical registry of baseline presentation packs per experience type.
   */
  private static readonly PACK_DEFINITIONS: Record<
    JumbotronExperienceType,
    (ctx: PresentationPackResolutionContext) => JumbotronPresentationPack
  > = {
    BATTLE_ARENA: (ctx) => ({
      id: `pack.battle_arena.${ctx.venueSkin ?? "default"}`,
      name: "Battle Arena Championship Pack",
      experienceType: "BATTLE_ARENA",
      supportedTargets: ["JUMBOTRON", "STAGE_RAIL", "VENUE_WALL", "OVERLAY", "LOWER_THIRD"],
      primaryTarget: "JUMBOTRON",
      lightingProfile: ctx.lightingProfile ?? "HIGH_CONTRAST_STROBE",
      animationProfile: ctx.animationProfile ?? "IMPACT_PULSE",
      brandPalette: ctx.brandPalette ?? {
        primary: "#00FFFF",
        secondary: "#FF2DAA",
        accent: "#FFD700",
        background: "#06070d",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "ROUND_TIMER_TICK",
        "ROUND_TIMER_CRITICAL",
        "ROUND_WINNER",
        "BATTLE_SCOREBOARD_UPDATE",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "AUDIENCE_CROWD_METER",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
      ],
      proceduralFeatures: {
        hasScoreboard: true,
        hasRoundTimer: true,
        hasCrowdMeter: true,
        hasDiscoOrb: false,
        hasTheaterCurtain: false,
        hasCollaborativeRotation: false,
        allowWinnerPresentation: true,
      },
    }),

    CHALLENGE_ARENA: (ctx) => ({
      id: `pack.challenge_arena.${ctx.venueSkin ?? "default"}`,
      name: "Challenge Arena Objective Pack",
      experienceType: "CHALLENGE_ARENA",
      supportedTargets: ["JUMBOTRON", "STAGE_RAIL", "VENUE_WALL", "OVERLAY", "LOWER_THIRD"],
      primaryTarget: "JUMBOTRON",
      lightingProfile: ctx.lightingProfile ?? "HIGH_CONTRAST_STROBE",
      animationProfile: ctx.animationProfile ?? "IMPACT_PULSE",
      brandPalette: ctx.brandPalette ?? {
        primary: "#00FFFF",
        secondary: "#FFD700",
        accent: "#FF2DAA",
        background: "#06070d",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "ROUND_TIMER_TICK",
        "CHALLENGE_OBJECTIVE_REVEAL",
        "CHALLENGE_ATTEMPT_TICK",
        "CHALLENGE_JUDGMENT_OPEN",
        "CHALLENGE_RESULT",
        "AUDIENCE_CROWD_METER",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
        "AMBIENT_IDLE",
      ],
      proceduralFeatures: {
        hasScoreboard: false,
        hasRoundTimer: true,
        hasCrowdMeter: true,
        hasDiscoOrb: false,
        hasTheaterCurtain: false,
        hasCollaborativeRotation: false,
        allowWinnerPresentation: false,
      },
    }),

    CYPHER: (ctx) => ({
      id: `pack.cypher.${ctx.venueSkin ?? "default"}`,
      name: "Cypher Collaborative Circle Pack",
      experienceType: "CYPHER",
      supportedTargets: ["JUMBOTRON", "STAGE_RAIL", "SIDE_DISPLAY", "OVERLAY"],
      primaryTarget: "JUMBOTRON",
      lightingProfile: ctx.lightingProfile ?? "WARM_UNDERGROUND_NEON",
      animationProfile: ctx.animationProfile ?? "TEMPO_GROOVE",
      brandPalette: ctx.brandPalette ?? {
        primary: "#AA2DFF",
        secondary: "#00FFFF",
        accent: "#FFD700",
        background: "#080512",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "CYPHER_ROTATION_NEXT",
        "CYPHER_ARTIST_SPOTLIGHT",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
        "AMBIENT_IDLE",
      ],
      proceduralFeatures: {
        hasScoreboard: false,
        hasRoundTimer: true, // Beat/verse countdown timer
        hasCrowdMeter: true,
        hasDiscoOrb: false,
        hasTheaterCurtain: false,
        hasCollaborativeRotation: true,
        // STRICT INVARIANT: Cyphers are collaborative rotations; winner/elimination UI is strictly forbidden!
        allowWinnerPresentation: false,
      },
    }),

    REGULAR_LIVE: (ctx) => ({
      id: `pack.regular_live.${ctx.venueSkin ?? "default"}`,
      name: "Regular Live Performance Stage Pack",
      experienceType: "REGULAR_LIVE",
      supportedTargets: ["JUMBOTRON", "FULL_DISPLAY", "SIDE_DISPLAY", "LOWER_THIRD", "OVERLAY"],
      primaryTarget: "JUMBOTRON",
      lightingProfile: ctx.lightingProfile ?? "BALANCED_STAGE_WARM",
      animationProfile: ctx.animationProfile ?? "SMOOTH_SWEEP",
      brandPalette: ctx.brandPalette ?? {
        primary: "#00FFFF",
        secondary: "#FF2DAA",
        accent: "#FFD700",
        background: "#050510",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "SEAT_SPOTLIGHT",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
        "CERTIFIED_AD_NETWORK",
        "CAST_PLAYLIST_ARTWORK",
        "CAST_MEMORY_MOMENT",
        "CAST_YOPHO_CARD",
        "AMBIENT_UPCOMING_SCHEDULE",
      ],
      proceduralFeatures: {
        hasScoreboard: false,
        hasRoundTimer: false,
        hasCrowdMeter: true,
        hasDiscoOrb: false,
        hasTheaterCurtain: true,
        hasCollaborativeRotation: false,
        allowWinnerPresentation: false,
      },
    }),

    WORLD_DANCE_PARTY: (ctx) => ({
      id: `pack.world_dance_party.${ctx.venueSkin ?? "default"}`,
      name: "World Dance Party Procedural Disco Orb Pack",
      experienceType: "WORLD_DANCE_PARTY",
      supportedTargets: ["JUMBOTRON", "STAGE_RAIL", "VENUE_WALL", "OVERLAY"],
      primaryTarget: "JUMBOTRON",
      lightingProfile: ctx.lightingProfile ?? "DISCO_MIRROR_SPECULAR",
      animationProfile: ctx.animationProfile ?? "BEAT_SYNC_PULSE",
      brandPalette: ctx.brandPalette ?? {
        primary: "#FF2DAA",
        secondary: "#00FFFF",
        accent: "#FFD700",
        background: "#0a001a",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "DISCO_ORB_BEAT_PULSE",
        "DISCO_ORB_ROTATION_SHIFT",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "SEAT_SPOTLIGHT",
        "AUDIENCE_CROWD_METER",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
      ],
      proceduralFeatures: {
        hasScoreboard: false,
        hasRoundTimer: false,
        hasCrowdMeter: true,
        hasDiscoOrb: true, // Dedicated procedural Disco Orb with mirrored surfaces
        hasTheaterCurtain: false,
        hasCollaborativeRotation: true,
        allowWinnerPresentation: false,
      },
    }),

    AUDITORIUM: (ctx) => ({
      id: `pack.auditorium.${ctx.venueSkin ?? "default"}`,
      name: "Grand Auditorium Classic Marquee Pack",
      experienceType: "AUDITORIUM",
      supportedTargets: ["JUMBOTRON", "CURTAIN_RAIL", "VENUE_WALL", "BILLBOARD", "OVERLAY"],
      primaryTarget: "JUMBOTRON",
      lightingProfile: ctx.lightingProfile ?? "THEATRICAL_GOLD_AMBER",
      animationProfile: ctx.animationProfile ?? "ELEGANT_FADE",
      brandPalette: ctx.brandPalette ?? {
        primary: "#FFD700",
        secondary: "#AA2DFF",
        accent: "#00FFFF",
        background: "#08040a",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "CURTAIN_INTERMISSION_START",
        "CURTAIN_COUNTDOWN_RETURN",
        "CURTAIN_SPONSOR_WRAP",
        "CURTAIN_INTERMISSION_END",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
        "CERTIFIED_AD_NETWORK",
      ],
      proceduralFeatures: {
        hasScoreboard: false,
        hasRoundTimer: true, // Countdown to return
        hasCrowdMeter: false,
        hasDiscoOrb: false,
        hasTheaterCurtain: true, // Elegant curtain rails and intermission sequences
        hasCollaborativeRotation: false,
        allowWinnerPresentation: false,
      },
    }),

    GAME_SHOW: (ctx) => ({
      id: `pack.game_show.${ctx.venueSkin ?? "default"}`,
      name: "Live Game Show Spectacular Pack",
      experienceType: "GAME_SHOW",
      supportedTargets: ["JUMBOTRON", "STAGE_RAIL", "VENUE_WALL", "OVERLAY"],
      primaryTarget: "JUMBOTRON",
      lightingProfile: ctx.lightingProfile ?? "BROADCAST_STUDIO_BRIGHT",
      animationProfile: ctx.animationProfile ?? "EXCITEMENT_CHIME",
      brandPalette: ctx.brandPalette ?? {
        primary: "#FFD700",
        secondary: "#00FFFF",
        accent: "#FF2DAA",
        background: "#030818",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "ROUND_TIMER_TICK",
        "ROUND_TIMER_CRITICAL",
        "ROUND_WINNER",
        "BATTLE_SCOREBOARD_UPDATE",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "SEAT_SPOTLIGHT",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
      ],
      proceduralFeatures: {
        hasScoreboard: true,
        hasRoundTimer: true,
        hasCrowdMeter: true,
        hasDiscoOrb: false,
        hasTheaterCurtain: false,
        hasCollaborativeRotation: false,
        allowWinnerPresentation: true,
      },
    }),

    LOUNGE: (ctx) => ({
      id: `pack.lounge.${ctx.venueSkin ?? "default"}`,
      name: "Intimate Ambient Lounge Pack",
      experienceType: "LOUNGE",
      supportedTargets: ["JUMBOTRON", "VENUE_WALL", "SIDE_DISPLAY", "LOWER_THIRD"],
      primaryTarget: "VENUE_WALL",
      lightingProfile: ctx.lightingProfile ?? "MOODY_NEON_CHILL",
      animationProfile: ctx.animationProfile ?? "SUBTLE_DRIFT",
      brandPalette: ctx.brandPalette ?? {
        primary: "#AA2DFF",
        secondary: "#00E5FF",
        accent: "#FFD700",
        background: "#070714",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
        "CERTIFIED_AD_NETWORK",
        "CAST_PLAYLIST_ARTWORK",
        "CAST_MEMORY_MOMENT",
        "AMBIENT_UPCOMING_SCHEDULE",
        "AMBIENT_IDLE",
      ],
      proceduralFeatures: {
        hasScoreboard: false,
        hasRoundTimer: false,
        hasCrowdMeter: false,
        hasDiscoOrb: false,
        hasTheaterCurtain: false,
        hasCollaborativeRotation: false,
        allowWinnerPresentation: false,
      },
    }),

    MONDAY_NIGHT_STAGE: (ctx) => ({
      id: `pack.monday_night_stage.${ctx.venueSkin ?? "default"}`,
      name: "Monday Night Stage Arena Primetime Pack",
      experienceType: "MONDAY_NIGHT_STAGE",
      supportedTargets: ["JUMBOTRON", "CURTAIN_RAIL", "STAGE_RAIL", "VENUE_WALL", "FULL_DISPLAY"],
      primaryTarget: "JUMBOTRON",
      lightingProfile: ctx.lightingProfile ?? "PRIMETIME_ARENA_MEGA",
      animationProfile: ctx.animationProfile ?? "SWEEPING_ARENA_CUES",
      brandPalette: ctx.brandPalette ?? {
        primary: "#00FFFF",
        secondary: "#FFD700",
        accent: "#FF2DAA",
        background: "#02040a",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "ROUND_TIMER_CRITICAL",
        "ROUND_WINNER",
        "BATTLE_SCOREBOARD_UPDATE",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "SEAT_SPOTLIGHT",
        "AUDIENCE_CROWD_METER",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
      ],
      proceduralFeatures: {
        hasScoreboard: true,
        hasRoundTimer: true,
        hasCrowdMeter: true,
        hasDiscoOrb: false,
        hasTheaterCurtain: true,
        hasCollaborativeRotation: false,
        allowWinnerPresentation: true,
      },
    }),

    WORLD_CONCERT: (ctx) => ({
      id: `pack.world_concert.${ctx.venueSkin ?? "default"}`,
      name: "World Concert Stadium Pack",
      experienceType: "WORLD_CONCERT",
      supportedTargets: ["JUMBOTRON", "VENUE_WALL", "STAGE_RAIL", "OVERLAY"],
      primaryTarget: "JUMBOTRON",
      lightingProfile: ctx.lightingProfile ?? "STADIUM_BEAM_ARRAY",
      animationProfile: ctx.animationProfile ?? "HIGH_ENERGY_FLARE",
      brandPalette: ctx.brandPalette ?? {
        primary: "#FF2DAA",
        secondary: "#00FFFF",
        accent: "#FFD700",
        background: "#000000",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "AUDIENCE_CROWD_METER",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
      ],
      proceduralFeatures: {
        hasScoreboard: false,
        hasRoundTimer: false,
        hasCrowdMeter: true,
        hasDiscoOrb: false,
        hasTheaterCurtain: false,
        hasCollaborativeRotation: false,
        allowWinnerPresentation: false,
      },
    }),

    FAN_LOBBY: (ctx) => ({
      id: `pack.fan_lobby.${ctx.venueSkin ?? "default"}`,
      name: "Fan Lobby Social Wall Pack",
      experienceType: "FAN_LOBBY",
      supportedTargets: ["VENUE_WALL", "SIDE_DISPLAY", "OVERLAY"],
      primaryTarget: "VENUE_WALL",
      lightingProfile: ctx.lightingProfile ?? "LOBBY_AMBIENT_CYAN",
      animationProfile: ctx.animationProfile ?? "GENTLE_CAROUSEL",
      brandPalette: ctx.brandPalette ?? {
        primary: "#00FFFF",
        secondary: "#AA2DFF",
        accent: "#FFD700",
        background: "#050711",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "GIFT_ALERT",
        "REWARD_AWARDED",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
        "AMBIENT_UPCOMING_SCHEDULE",
      ],
      proceduralFeatures: {
        hasScoreboard: false,
        hasRoundTimer: false,
        hasCrowdMeter: false,
        hasDiscoOrb: false,
        hasTheaterCurtain: false,
        hasCollaborativeRotation: false,
        allowWinnerPresentation: false,
      },
    }),

    PERFORMER_LOBBY: (ctx) => ({
      id: `pack.performer_lobby.${ctx.venueSkin ?? "default"}`,
      name: "Performer Backstage Greenroom Pack",
      experienceType: "PERFORMER_LOBBY",
      supportedTargets: ["VENUE_WALL", "SIDE_DISPLAY", "LOWER_THIRD"],
      primaryTarget: "VENUE_WALL",
      lightingProfile: ctx.lightingProfile ?? "GREENROOM_BACKSTAGE_AMBER",
      animationProfile: ctx.animationProfile ?? "MINIMAL_HUD",
      brandPalette: ctx.brandPalette ?? {
        primary: "#FFD700",
        secondary: "#00FFFF",
        accent: "#FF2DAA",
        background: "#0a0705",
      },
      allowedEventTypes: [
        "SAFETY_ALERT",
        "EMERGENCY_BROADCAST",
        "ROUND_TIMER_TICK",
        "DIRECT_SPONSOR_CAMPAIGN",
        "HOUSE_PROMOTION",
        "AMBIENT_UPCOMING_SCHEDULE",
      ],
      proceduralFeatures: {
        hasScoreboard: false,
        hasRoundTimer: true,
        hasCrowdMeter: false,
        hasDiscoOrb: false,
        hasTheaterCurtain: false,
        hasCollaborativeRotation: false,
        allowWinnerPresentation: false,
      },
    }),
  };

  /**
   * Resolves the canonical presentation pack for a given experience and venue configuration.
   */
  public static resolveExperiencePresentationPack(
    ctx: PresentationPackResolutionContext
  ): JumbotronPresentationPack {
    const factory = ExperiencePresentationPacks.PACK_DEFINITIONS[ctx.experienceType];
    if (!factory) {
      // Fallback to Regular Live baseline
      return ExperiencePresentationPacks.PACK_DEFINITIONS.REGULAR_LIVE(ctx);
    }

    const pack = factory(ctx);

    // Apply supportedDisplays filter if venue hardware specifies a constrained set
    if (ctx.supportedDisplays && ctx.supportedDisplays.length > 0) {
      const filteredTargets = pack.supportedTargets.filter((t) =>
        ctx.supportedDisplays!.includes(t)
      );
      if (filteredTargets.length > 0) {
        pack.supportedTargets = filteredTargets;
        if (!filteredTargets.includes(pack.primaryTarget)) {
          pack.primaryTarget = filteredTargets[0]!;
        }
      }
    }

    return pack;
  }
}
