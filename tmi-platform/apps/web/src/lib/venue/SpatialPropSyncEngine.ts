/**
 * SpatialPropSyncEngine.ts — 3D Spatial Prop & Visual Effects Synchronization Engine
 *
 * Broadcasts real-time spatial prop activations (glowsticks, confetti cannons,
 * spotlight beams, light sabers, 3D banners) across 3D venue rooms so all
 * users and bots see each other interacting in real time like in a video game.
 */

export type SpatialPropType =
  | 'glowstick'
  | 'confetti_cannon'
  | 'spotlight'
  | 'lightsaber'
  | 'banner'
  | 'fireworks'
  | 'tip_cannon';

export interface ActiveSpatialProp {
  propId: string;
  roomId: string;
  ownerId: string;
  ownerDisplayName: string;
  propType: SpatialPropType;
  position: [number, number, number];
  colorHex: string;
  activatedAt: number;
  durationMs: number;
}

type PropListener = (props: ActiveSpatialProp[]) => void;

class SpatialPropSyncEngineService {
  private activeProps: Map<string, ActiveSpatialProp[]> = new Map();
  private propListeners: Map<string, Set<PropListener>> = new Map();

  /**
   * Activates a 3D spatial prop in a venue room.
   */
  public activateProp(
    roomId: string,
    ownerId: string,
    ownerDisplayName: string,
    propType: SpatialPropType,
    position: [number, number, number] = [0, 1, 0],
    colorHex: string = '#FF2DAA',
    durationMs: number = 5000
  ): ActiveSpatialProp {
    const propId = `PROP_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProp: ActiveSpatialProp = {
      propId,
      roomId,
      ownerId,
      ownerDisplayName,
      propType,
      position,
      colorHex,
      activatedAt: Date.now(),
      durationMs,
    };

    const roomProps = this.activeProps.get(roomId) || [];
    roomProps.push(newProp);
    this.activeProps.set(roomId, roomProps);
    this.notify(roomId);

    // Auto-expire prop after duration
    setTimeout(() => {
      this.deactivateProp(roomId, propId);
    }, durationMs);

    return newProp;
  }

  /**
   * Deactivates a spatial prop.
   */
  public deactivateProp(roomId: string, propId: string): void {
    const roomProps = this.activeProps.get(roomId) || [];
    const filtered = roomProps.filter((p) => p.propId !== propId);
    this.activeProps.set(roomId, filtered);
    this.notify(roomId);
  }

  /**
   * Gets list of active props in a room.
   */
  public getActiveProps(roomId: string): ActiveSpatialProp[] {
    return this.activeProps.get(roomId) || [];
  }

  /**
   * Subscribes to real-time spatial prop updates in a room.
   */
  public subscribe(roomId: string, listener: PropListener): () => void {
    if (!this.propListeners.has(roomId)) {
      this.propListeners.set(roomId, new Set());
    }
    this.propListeners.get(roomId)!.add(listener);

    return () => {
      this.propListeners.get(roomId)?.delete(listener);
    };
  }

  private notify(roomId: string): void {
    const props = this.getActiveProps(roomId);
    this.propListeners.get(roomId)?.forEach((l) => l(props));
  }
}

export const SpatialPropSyncEngine = new SpatialPropSyncEngineService();
