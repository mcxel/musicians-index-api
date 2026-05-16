import { assertLobbyContext, ensureRoomState, type LobbyContext } from './communication.engine'

export type ChatBubble = {
  userId: string
  text: string
  context: LobbyContext
  at: number
}

export function emitChatBubble(
  world: Record<string, any>,
  userId: string,
  text: string,
  context: LobbyContext
) {
  if (!assertLobbyContext(context)) {
    console.log('[CHAT_BUBBLE_BLOCKED]', { userId, context })
    return false
  }
  const room = ensureRoomState(world)
  const payload: ChatBubble = { userId, text, context, at: Date.now() }
  room.bubbles.push(payload)
  console.log('[CHAT_BUBBLE]', payload)
  return payload
}
