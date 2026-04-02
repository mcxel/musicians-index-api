// apps/api/src/modules/social/presence.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/presence' })
export class PresenceGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('presence.update')
  handlePresenceUpdate(client: Socket, payload: { userId: string; status: string }): void {
    this.server.emit('presence.updated', payload);
  }
}
