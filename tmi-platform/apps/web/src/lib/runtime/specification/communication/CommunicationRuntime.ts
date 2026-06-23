import type { ConversationEngine } from "./ConversationEngine";
import type { DirectMessageEngine } from "./DirectMessageEngine";
import type { GroupChatEngine } from "./GroupChatEngine";
import type { VoiceCallRuntime } from "./VoiceCallRuntime";
import type { VideoCallRuntime } from "./VideoCallRuntime";
import type { LobbyInviteEngine } from "./LobbyInviteEngine";
import type { NotificationEngine } from "./NotificationEngine";

export interface CommunicationRuntime {
  conversations: ConversationEngine;
  directMessages: DirectMessageEngine;
  groupChat: GroupChatEngine;
  voiceCalls: VoiceCallRuntime;
  videoCalls: VideoCallRuntime;
  invites: LobbyInviteEngine;
  notifications: NotificationEngine;
}
