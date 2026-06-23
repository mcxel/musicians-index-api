export interface VideoCallRuntime {
  startVideoCall(participantIds: string[]): Promise<{ callId: string }>;
  endVideoCall(callId: string): Promise<void>;
  setCameraEnabled(callId: string, userId: string, enabled: boolean): Promise<void>;
}
