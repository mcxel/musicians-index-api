/**
 * MediaOrchestrator — Central registry for all live media streams on TMI.
 * Wraps WebRTCBroadcastEngine and MediaCaptureEngine.
 * Provides stable mock nodes when real WebRTC is unavailable.
 */

export interface MediaNode {
  streamId:    string;
  roomId:      string;
  channelId:   string;
  userId?:     string;
  title:       string;
  role:        'broadcaster' | 'viewer' | 'sponsor' | 'avatar';
  stream?:     MediaStream;
  avatarUrl?:  string;
  sponsorUrl?: string;
  isLive:      boolean;
  viewerCount: number;
  energy:      number; // 0-100
}

export interface RoomState {
  roomId:       string;
  label:        string;
  nodes:        MediaNode[];
  spotlightId:  string | null;
  participantCount: number;
}

const MOCK_ROOMS: RoomState[] = [
  { roomId: 'R-101', label: 'World Dance Party',  nodes: [], spotlightId: null, participantCount: 42 },
  { roomId: 'R-214', label: 'Cypher Room',        nodes: [], spotlightId: null, participantCount: 18 },
  { roomId: 'R-307', label: 'Battle Arena',        nodes: [], spotlightId: null, participantCount: 67 },
  { roomId: 'live-stage',     label: 'Live Stage',         nodes: [], spotlightId: null, participantCount: 120 },
  { roomId: 'venue-main',     label: 'Venue Main Stage',   nodes: [], spotlightId: null, participantCount: 55 },
  { roomId: 'sponsor-preview', label: 'Sponsor Preview',   nodes: [], spotlightId: null, participantCount: 0 },
  { roomId: 'billboard-live', label: 'Billboard Live',     nodes: [], spotlightId: null, participantCount: 89 },
];

class MediaOrchestratorClass {
  private rooms = new Map<string, RoomState>(MOCK_ROOMS.map(r => [r.roomId, { ...r }]));
  private localStream: MediaStream | null = null;

  getAllActiveRooms(): RoomState[] {
    return [...this.rooms.values()];
  }

  getRoomState(roomId: string): RoomState {
    return this.rooms.get(roomId) ?? {
      roomId, label: roomId, nodes: [], spotlightId: null, participantCount: 0,
    };
  }

  getRoomStreams(roomId: string): MediaNode[] {
    return this.getRoomState(roomId).nodes;
  }

  registerStream(node: MediaNode): void {
    const room = this.rooms.get(node.roomId) ?? {
      roomId: node.roomId, label: node.roomId, nodes: [], spotlightId: null, participantCount: 0,
    };
    const existing = room.nodes.findIndex(n => n.streamId === node.streamId);
    if (existing >= 0) room.nodes[existing] = node;
    else room.nodes.push(node);
    this.rooms.set(node.roomId, room);
  }

  unregisterStream(streamId: string, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.nodes = room.nodes.filter(n => n.streamId !== streamId);
    if (room.spotlightId === streamId) room.spotlightId = room.nodes[0]?.streamId ?? null;
    this.rooms.set(roomId, room);
  }

  setSpotlight(roomId: string, streamId: string): void {
    const room = this.rooms.get(roomId);
    if (room) { room.spotlightId = streamId; this.rooms.set(roomId, room); }
  }

  async attachLocalCamera(): Promise<MediaStream | null> {
    if (this.localStream) return this.localStream;
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      });
      return this.localStream;
    } catch {
      return null;
    }
  }

  detachLocalCamera(): void {
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
  }

  getFallbackMediaNode(roomId: string, index: number): MediaNode {
    const avatars = ['🎤', '🎧', '🎵', '🎸', '🥁', '🎹', '🎷', '🎺'];
    return {
      streamId:   `fallback-${roomId}-${index}`,
      roomId,
      channelId:  roomId,
      title:      `Artist ${index + 1}`,
      role:       'avatar',
      isLive:     false,
      viewerCount: 0,
      energy:     Math.floor(Math.random() * 80) + 20,
      avatarUrl:  avatars[index % avatars.length],
    };
  }
}

const MediaOrchestrator = new MediaOrchestratorClass();
export default MediaOrchestrator;
