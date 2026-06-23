export interface VoiceCallRuntime {
  startVoiceCall(participantIds: string[]): Promise<{ callId: string }>;
  endVoiceCall(callId: string): Promise<void>;
  mute(callId: string, userId: string, muted: boolean): Promise<void>;
}
