export type ConversationType = 'dm' | 'group' | 'band';

export type MessageType =
  | 'text'
  | 'emoji'
  | 'image'
  | 'video'
  | 'audio'
  | 'beat-preview'
  | 'playlist-share'
  | 'memory-artifact'
  | 'room-invite'
  | 'lobby-invite'
  | 'system-event';

export type MessageStatus = 'sent' | 'pending' | 'failed';

export type ModerationStatus = 'approved' | 'pending' | 'rejected' | 'blocked';
export type ScanStatus = 'clean' | 'pending' | 'infected' | 'unknown';

export interface Conversation {
  id: string;
  type: ConversationType;
  participantIds: string[];
  title: string;
  lastMessageAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  messageType: MessageType;
  text?: string;
  mediaId?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  artifactId?: string;
  playlistId?: string;
  inviteId?: string;
  status: MessageStatus;
  moderationStatus?: ModerationStatus;
  scanStatus?: ScanStatus;
  adminApproved?: boolean;
  createdAt: number;
}

export interface ComposerState {
  text: string;
  selectedMemoryArtifactId?: string;
}

export interface SafetyReportState {
  open: boolean;
  messageId?: string;
}
