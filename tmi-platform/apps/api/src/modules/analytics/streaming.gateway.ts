import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SceneEngine } from './scene.engine';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/webrtc' })
export class StreamingGateway {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(StreamingGateway.name);

  constructor(private readonly sceneEngine: SceneEngine) {}

  // WebRTC Signaling: Forwarding Offers for Live Video/Audio
  @SubscribeMessage('webrtc:offer')
  handleOffer(@ConnectedSocket() client: Socket, @MessageBody() payload: { targetId: string; offer: any; roomId: string }) {
    this.server.to(`user_${payload.targetId}`).emit('webrtc:offer', {
      senderId: client.id,
      offer: payload.offer,
    });
  }

  // WebRTC Signaling: Forwarding Answers
  @SubscribeMessage('webrtc:answer')
  handleAnswer(@ConnectedSocket() client: Socket, @MessageBody() payload: { targetId: string; answer: any }) {
    this.server.to(`user_${payload.targetId}`).emit('webrtc:answer', {
      senderId: client.id,
      answer: payload.answer,
    });
  }

  // WebRTC Signaling: ICE Candidates for network routing
  @SubscribeMessage('webrtc:ice-candidate')
  handleIceCandidate(@ConnectedSocket() client: Socket, @MessageBody() payload: { targetId: string; candidate: any }) {
    this.server.to(`user_${payload.targetId}`).emit('webrtc:ice-candidate', {
      senderId: client.id,
      candidate: payload.candidate,
    });
  }

  // Scene sync: Firing lighting, fireworks, and avatar triggers to the whole room
  @SubscribeMessage('scene:trigger')
  handleSceneTrigger(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string; effect: string }) {
    this.logger.log(`Triggering cinematic effect [${payload.effect}] in room ${payload.roomId}`);
    
    // Process dynamic scene updates through the Scene Engine
    const advancedEffect = this.sceneEngine.calculateCinematicEffect(payload.roomId, payload.effect);
    
    this.server.to(payload.roomId).emit('scene:effect', advancedEffect);
  }

  // Audio sync: Spatial audio positioning based on avatar location
  @SubscribeMessage('audio:spatial-sync')
  handleSpatialAudio(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string; positions: any }) {
    this.server.to(payload.roomId).emit('audio:spatial-sync', payload.positions);
  }
}