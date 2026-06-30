/**
 * TMI Scene Runtime
 *
 * Manages the world/environment, separate from the UI window system.
 *
 * Window Runtime = User interface (where are panels?)
 * Scene Runtime = World state (stage, audience, lighting, camera, effects)
 *
 * They communicate through EventBus, not direct calls.
 *
 * When Window Runtime emits VIEWPORT_CHANGED
 * Scene Runtime listens and updates camera framing
 *
 * @see CLAUDE.md Rule 21 (Venue Runtime Convergence), Rule 18 (Visual Identity Formula)
 */

import { EventBus, emitEvent } from '../events/EventBus';

export interface StageConfig {
  width: number;
  height: number;
  depth: number;
  material: string; // 'wood', 'metal', 'glass', etc.
  lighting: 'day' | 'night' | 'concert' | 'broadcast' | 'custom';
  background: string; // image URL or color
}

export interface CameraConfig {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  fov: number;
  near: number;
  far: number;
}

export interface AudienceConfig {
  maxCapacity: number;
  seatingChart: 'theater' | 'stadium' | 'amphitheater' | 'circle' | 'custom';
  currentOccupancy: number;
}

export interface LightingConfig {
  ambientColor: string;
  ambientIntensity: number;
  keyLightColor: string;
  keyLightIntensity: number;
  fillLightColor: string;
  fillLightIntensity: number;
  backlightColor: string;
  backlightIntensity: number;
}

export interface SceneState {
  id: string;
  name: string;
  stage: StageConfig;
  camera: CameraConfig;
  audience: AudienceConfig;
  lighting: LightingConfig;
  effects: string[]; // active effects like 'rain', 'snow', 'particles'
  music?: {
    currentTrack?: string;
    volume: number;
    isPlaying: boolean;
  };
  npcs?: Array<{
    id: string;
    name: string;
    role: 'host' | 'guest' | 'performer' | 'crew';
    position: { x: number; y: number; z: number };
  }>;
}

/**
 * Scene Runtime — manages world state
 *
 * Responsibilities:
 * - Maintain stage, audience, lighting, camera configuration
 * - Update scene based on window changes (viewport → camera reframe)
 * - Manage ambient effects (weather, particles, etc.)
 * - Coordinate with other runtimes through events
 */
export class SceneRuntime {
  private sceneState: SceneState;
  private eventBus: EventBus;

  constructor(eventBus: EventBus, initialScene: SceneState) {
    this.eventBus = eventBus;
    this.sceneState = initialScene;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for window changes and update camera
    this.eventBus.on('VIEWPORT_CHANGED', this.handleViewportChanged.bind(this));
    this.eventBus.on('WINDOW_OPENED', this.handleWindowOpened.bind(this));
    this.eventBus.on('WINDOW_CLOSED', this.handleWindowClosed.bind(this));

    // Listen for experience changes
    this.eventBus.on('EXPERIENCE_STARTED', this.handleExperienceStarted.bind(this));
  }

  /**
   * When viewport changes, reframe the camera
   * Example: if chat opens on right, adjust camera to compensate
   */
  private async handleViewportChanged(event: any): Promise<void> {
    const { availableArea } = event.data;

    if (availableArea) {
      // Recalculate camera framing based on available viewport
      const aspectRatio = availableArea.width / availableArea.height;

      // Update camera FOV based on aspect ratio
      this.sceneState.camera.fov = this.calculateOptimalFOV(aspectRatio);

      await emitEvent({
        type: 'CAMERA_CHANGED',
        source: 'SceneRuntime',
        data: {
          camera: this.sceneState.camera,
          reason: 'viewport_changed',
        },
      });
    }
  }

  /**
   * When window opens, might need to adjust scene
   * Example: opening inventory on right side means less screen space for stage
   */
  private async handleWindowOpened(event: any): Promise<void> {
    const { windowId } = event.data;

    // Different windows might affect scene differently
    if (windowId === 'musicPlayer') {
      // No scene impact
    } else if (windowId === 'chat') {
      // Might adjust lighting to help visible text
      await this.adjustLightingForReadability();
    }
  }

  private async handleWindowClosed(event: any): Promise<void> {
    // Could trigger scene transitions or reset lighting
  }

  /**
   * When experience starts (Concert, Battle, Cypher, etc.)
   * Load the appropriate scene configuration
   */
  private async handleExperienceStarted(event: any): Promise<void> {
    const { experience, sceneId } = event.data;

    // Load scene configuration for this experience
    const sceneConfig = this.getSceneForExperience(experience);

    // Update scene
    Object.assign(this.sceneState, sceneConfig);

    await emitEvent({
      type: 'SCENE_LOADED',
      source: 'SceneRuntime',
      data: { experience, sceneState: this.sceneState },
    });
  }

  // Helper methods

  private calculateOptimalFOV(aspectRatio: number): number {
    // Adjust field of view based on aspect ratio
    // Wider = narrower FOV, taller = wider FOV
    const baseFOV = 75;
    const adjustedFOV = baseFOV / (aspectRatio / 1.77); // 16:9 as reference
    return Math.max(45, Math.min(120, adjustedFOV));
  }

  private async adjustLightingForReadability(): Promise<void> {
    // Increase ambient or key light slightly for better text visibility
    this.sceneState.lighting.ambientIntensity = Math.min(
      1.0,
      this.sceneState.lighting.ambientIntensity + 0.1,
    );

    await emitEvent({
      type: 'LIGHTING_CHANGED',
      source: 'SceneRuntime',
      data: { lighting: this.sceneState.lighting },
    });
  }

  private getSceneForExperience(experience: string): Partial<SceneState> {
    const scenes: Record<string, Partial<SceneState>> = {
      concert: {
        stage: {
          ...this.sceneState.stage,
          lighting: 'concert',
        },
        audience: {
          ...this.sceneState.audience,
          seatingChart: 'theater',
        },
      },
      battle: {
        stage: {
          ...this.sceneState.stage,
          lighting: 'broadcast',
        },
        audience: {
          ...this.sceneState.audience,
          seatingChart: 'circle',
        },
      },
      cypher: {
        stage: {
          ...this.sceneState.stage,
          lighting: 'broadcast',
        },
        audience: {
          ...this.sceneState.audience,
          seatingChart: 'circle',
        },
      },
      gameshow: {
        stage: {
          ...this.sceneState.stage,
          lighting: 'day',
        },
        audience: {
          ...this.sceneState.audience,
          seatingChart: 'stadium',
        },
      },
    };

    return scenes[experience] || {};
  }

  // Getters

  getSceneState(): SceneState {
    return this.sceneState;
  }

  getStage(): StageConfig {
    return this.sceneState.stage;
  }

  getCamera(): CameraConfig {
    return this.sceneState.camera;
  }

  getAudience(): AudienceConfig {
    return this.sceneState.audience;
  }

  getLighting(): LightingConfig {
    return this.sceneState.lighting;
  }

  getEffects(): string[] {
    return this.sceneState.effects;
  }

  // Mutations (via dispatch, not direct assignment)

  async addEffect(effect: string): Promise<void> {
    if (!this.sceneState.effects.includes(effect)) {
      this.sceneState.effects.push(effect);

      await emitEvent({
        type: 'USER_ACTION',
        source: 'SceneRuntime',
        data: {
          action: 'add_effect',
          effect,
          effects: this.sceneState.effects,
        },
      });
    }
  }

  async removeEffect(effect: string): Promise<void> {
    const index = this.sceneState.effects.indexOf(effect);
    if (index > -1) {
      this.sceneState.effects.splice(index, 1);

      await emitEvent({
        type: 'USER_ACTION',
        source: 'SceneRuntime',
        data: {
          action: 'remove_effect',
          effect,
          effects: this.sceneState.effects,
        },
      });
    }
  }

  async updateAudienceOccupancy(count: number): Promise<void> {
    this.sceneState.audience.currentOccupancy = Math.min(count, this.sceneState.audience.maxCapacity);

    await emitEvent({
      type: 'AUDIENCE_UPDATED',
      source: 'SceneRuntime',
      data: {
        occupancy: this.sceneState.audience.currentOccupancy,
        capacity: this.sceneState.audience.maxCapacity,
      },
    });
  }
}
