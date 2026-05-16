import type { ChatRole, RoomChatMessage } from "./RoomChatEngine";
import type { ChatWidgetFocusMode } from "./ChatWidgetPreferenceEngine";

export type FocusFilterContext = {
  performanceActive: boolean;
  scoringActive: boolean;
  manuallyHiddenRoles?: ChatRole[];
  pinnedUserId?: string;
};

function roleAllowedByFocus(role: ChatRole, focusMode: ChatWidgetFocusMode): boolean {
  if (focusMode === "all") return true;
  if (focusMode === "host-only") return role === "host";
  if (focusMode === "performer-only") return role === "performer";
  if (focusMode === "judges-only") return role === "judge";
  if (focusMode === "crowd-only") return role === "audience" || role === "sponsor";
  return true;
}

export class ChatWidgetFocusModeEngine {
  shouldDisplayMessage(message: RoomChatMessage, focusMode: ChatWidgetFocusMode, context: FocusFilterContext): boolean {
    const hiddenRoles = context.manuallyHiddenRoles ?? [];

    if (context.pinnedUserId && message.userId === context.pinnedUserId) {
      return true;
    }

    if (hiddenRoles.includes(message.role)) {
      return false;
    }

    // Priority rules
    if (message.role === "host") {
      return true;
    }
    if (message.role === "performer" && context.performanceActive) {
      return true;
    }
    if (message.role === "judge" && context.scoringActive) {
      return true;
    }

    return roleAllowedByFocus(message.role, focusMode);
  }

  filterMessages(messages: RoomChatMessage[], focusMode: ChatWidgetFocusMode, context: FocusFilterContext): RoomChatMessage[] {
    return messages.filter((message) => this.shouldDisplayMessage(message, focusMode, context));
  }

  pinUser(messages: RoomChatMessage[], pinnedUserId?: string): RoomChatMessage[] {
    if (!pinnedUserId) return messages;

    const pinned = messages.filter((message) => message.userId === pinnedUserId);
    const others = messages.filter((message) => message.userId !== pinnedUserId);

    return [...pinned, ...others];
  }
}

export const chatWidgetFocusModeEngine = new ChatWidgetFocusModeEngine();
