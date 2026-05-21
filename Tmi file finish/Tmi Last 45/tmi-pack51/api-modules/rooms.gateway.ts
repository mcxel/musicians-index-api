// apps/api/src/gateways/rooms.gateway.ts
// Discovery-first lobby WebSocket gateway — Platform Law #1 enforced here.
// ORDER BY viewer_count ASC NULLS FIRST — NEVER change this sort.

import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: "/rooms", cors: { origin: process.env.WEB_URL } })
export class RoomsGateway {
  @WebSocketServer()
  server: Server;

  // ── LOBBY SORT — Platform Law #1 ──────────────────────────
  // This function is LOCKED. Never change ASC to DESC.
  // 0 viewers ALWAYS sorts to position 1.
  private sortRoomsDiscoveryFirst(rooms: any[]) {
    return [...rooms].sort((a, b) => {
      if (a.viewerCount === 0 && b.viewerCount > 0) return -1; // Law #1
      if (b.viewerCount === 0 && a.viewerCount > 0) return 1;
      return a.viewerCount - b.viewerCount; // ASC — LOCKED
    });
  }

  private async buildLobbyUpdate() {
    // Fetch all active rooms from DB, sort discovery-first
    // const rooms = await this.prisma.room.findMany({ where: { isActive: true } });
    const rooms: any[] = []; // Blackbox: replace with real DB query
    const sorted = this.sortRoomsDiscoveryFirst(rooms);
    return {
      type: "lobby_update",
      rooms: sorted.map(r => ({
        roomId: r.id,
        viewerCount: r.viewerCount,
        isLive: r.isLive,
        hostName: r.host?.displayName,
        scene: r.scene,
      })),
      sortedBy: "viewer_count_asc" as const,  // LOCKED — never change
    };
  }

  @SubscribeMessage("join_lobby")
  async handleJoinLobby(@ConnectedSocket() client: Socket) {
    client.join("lobby");
    const update = await this.buildLobbyUpdate();
    client.emit("lobby_update", update);
  }

  @SubscribeMessage("join_room")
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.join(`room:${data.roomId}`);
    // Increment viewer count, emit to all lobby clients
    // Blackbox: await this.roomsService.incrementViewerCount(data.roomId);
    const update = await this.buildLobbyUpdate();
    this.server.to("lobby").emit("lobby_update", update);
  }

  @SubscribeMessage("leave_room")
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.leave(`room:${data.roomId}`);
    // Platform Law #8: room stays active even with 0 members
    // Blackbox: await this.roomsService.decrementViewerCount(data.roomId);
    const update = await this.buildLobbyUpdate();
    this.server.to("lobby").emit("lobby_update", update);
  }

  // Called by AdsService to rotate ad zone
  broadcastAdRotation(zone: string, creativeId: string) {
    this.server.emit("ad_rotation", { zone, creativeId });
  }

  // Called by ScoringService when crown is awarded
  broadcastCrownAwarded(artistId: string, animationDurationMs: 3000) {
    this.server.emit("crown_awarded", { artistId, animationDurationMs: 3000 }); // Platform Law: always 3000ms
  }
}
