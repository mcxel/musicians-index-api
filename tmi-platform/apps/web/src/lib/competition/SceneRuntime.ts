/**
 * SceneRuntime.ts
 *
 * Implements the TMI Scene Runtime presentation layer.
 * Coordinates camera angles, neon spotlight colors, fog densities, text overlays,
 * and crowd reactions based on active show state.
 */

export interface OnscreenText {
  title: string;
  subtitle: string;
  position: "lower-third" | "center" | "top-banner";
}

export interface LightingConfig {
  primaryColorHex: string;
  secondaryColorHex: string;
  intensity: number;      // Range [0, 1]
  strobe: boolean;
}

export interface EnvironmentConfig {
  fog: number;            // Range [0, 1]
  rain: boolean;
  backdropUrl: string | null;
}

export interface SceneState {
  roomId: string;
  activeSceneType: "intro" | "gameplay" | "outro" | "cutscene" | "environmental" | "storybook";
  sceneTitle: string;
  durationSeconds: number;
  remainingSeconds: number;
  cameraPreset: "stage-wide" | "performer-close" | "judge-panel" | "crowd-reaction" | "fly-through";
  lightingConfig: LightingConfig;
  environmentConfig: EnvironmentConfig;
  onscreenText: OnscreenText | null;
  stageHostAction: string | null;
  audienceReactionMode: "idle" | "clapping" | "cheering" | "dancing" | "waving";
}

export class SceneRuntime {
  /**
   * Translates active room/event status directly into visual SceneStates
   */
  resolveSceneForEvent(
    roomId: string,
    status: string,
    format: string,
    showTitle = "TMI Showdown"
  ): SceneState {
    const normalizedStatus = status.toLowerCase();

    // 1. Show Countdown: Return Intro Scene
    if (normalizedStatus === "countdown") {
      return {
        roomId,
        activeSceneType: "intro",
        sceneTitle: "Show Opener",
        durationSeconds: 60,
        remainingSeconds: 60,
        cameraPreset: "stage-wide",
        lightingConfig: {
          primaryColorHex: "#00FFFF",  // Cyan
          secondaryColorHex: "#AA2DFF", // Purple
          intensity: 0.8,
          strobe: true,
        },
        environmentConfig: {
          fog: 0.25,
          rain: false,
          backdropUrl: "/assets/backdrops/opener_neon.jpg",
        },
        onscreenText: {
          title: showTitle,
          subtitle: "SHOW BEGINS SHORTLY",
          position: "center",
        },
        stageHostAction: "Announcer preparing intro lines...",
        audienceReactionMode: "clapping",
      };
    }

    // 2. Completed / Winner Declared: Return Outro Scene
    if (normalizedStatus === "completed" || normalizedStatus === "closed") {
      return {
        roomId,
        activeSceneType: "outro",
        sceneTitle: "Celebration Spotlight",
        durationSeconds: 45,
        remainingSeconds: 45,
        cameraPreset: "crowd-reaction",
        lightingConfig: {
          primaryColorHex: "#FFD700",  // Gold
          secondaryColorHex: "#FF9500", // Amber
          intensity: 1.0,
          strobe: false,
        },
        environmentConfig: {
          fog: 0.1,
          rain: false,
          backdropUrl: "/assets/backdrops/outro_golden.jpg",
        },
        onscreenText: {
          title: "CHAMPIONSHIP COMPLETED",
          subtitle: "VICTOR TAKES THE CROWN 👑",
          position: "top-banner",
        },
        stageHostAction: "PA announcer delivering congratulations speech.",
        audienceReactionMode: "cheering",
      };
    }

    // 3. Round Active: Return Gameplay Scene
    return {
      roomId,
      activeSceneType: "gameplay",
      sceneTitle: "Competitors Live",
      durationSeconds: 180,
      remainingSeconds: 180,
      cameraPreset: "performer-close",
      lightingConfig: {
        primaryColorHex: "#FF2DAA",  // Neon Pink
        secondaryColorHex: "#00FF88", // Lime Green
        intensity: 0.7,
        strobe: false,
      },
      environmentConfig: {
        fog: 0.15,
        rain: false,
        backdropUrl: "/assets/backdrops/live_arena.jpg",
      },
      onscreenText: {
        title: showTitle,
        subtitle: `FORMAT: ${format.toUpperCase()}`,
        position: "lower-third",
      },
      stageHostAction: "Main host refereeing the stage.",
      audienceReactionMode: "dancing",
    };
  }

  /**
   * Ticks countdown timers and dynamically adapts camera angles or strobes as time runs low
   */
  updateSceneTick(state: SceneState): SceneState {
    const updated = { ...state };
    if (updated.remainingSeconds <= 0) return updated;

    updated.remainingSeconds -= 1;

    // Trigger close-up camera and strobe warnings during last 5 seconds of countdowns
    if (updated.activeSceneType === "intro" && updated.remainingSeconds <= 5) {
      updated.cameraPreset = "performer-close";
      updated.lightingConfig.strobe = true;
      updated.lightingConfig.intensity = 1.0;
      if (updated.onscreenText) {
        updated.onscreenText.subtitle = `SHOWTIME IN ${updated.remainingSeconds}S`;
      }
    }

    // Slowly rotate camera presets during gameplay to simulate live director choices
    if (updated.activeSceneType === "gameplay") {
      const cycle = updated.remainingSeconds % 30;
      if (cycle === 0) {
        updated.cameraPreset = "crowd-reaction";
      } else if (cycle === 15) {
        updated.cameraPreset = "stage-wide";
      } else if (cycle === 25) {
        updated.cameraPreset = "performer-close";
      }
    }

    return updated;
  }

  /**
   * Triggers temporary cutscenes (e.g. sponsor promos, trophy showcases)
   */
  triggerCutscene(
    state: SceneState,
    cutsceneName: "sponsor" | "trophy" | "intro-cinematic"
  ): SceneState {
    const updated = { ...state };

    updated.activeSceneType = "cutscene";
    updated.cameraPreset = "fly-through";
    updated.lightingConfig.strobe = false;

    if (cutsceneName === "sponsor") {
      updated.sceneTitle = "Sponsor Segment";
      updated.lightingConfig.primaryColorHex = "#ffffff";
      updated.lightingConfig.intensity = 0.5;
      updated.onscreenText = {
        title: "SPONSOR CORNER",
        subtitle: "PRESENTED BY OUR PARTNER",
        position: "center",
      };
      updated.audienceReactionMode = "idle";
    } else if (cutsceneName === "trophy") {
      updated.sceneTitle = "Trophy Presentation";
      updated.lightingConfig.primaryColorHex = "#FFD700"; // Gold
      updated.lightingConfig.intensity = 1.0;
      updated.onscreenText = {
        title: "AWARD CEREMONY",
        subtitle: "UNVEILING THE WEEKLY CHAMPION TROPHY",
        position: "lower-third",
      };
      updated.audienceReactionMode = "waving";
    }

    return updated;
  }
}

export const sceneRuntime = new SceneRuntime();
