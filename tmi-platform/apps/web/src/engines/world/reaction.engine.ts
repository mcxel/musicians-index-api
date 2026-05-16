import { assertLobbyContext, ensureRoomState, type LobbyContext } from './communication.engine'

export type RoomReaction = {
  userId: string
  reaction: 'wave' | 'clap' | 'fire' | 'heart'
  context: LobbyContext
  at: number
}

export function triggerReaction(
  world: Record<string, any>,
  userId: string,
  reaction: RoomReaction['reaction'],
  context: LobbyContext
) {
  if (!assertLobbyContext(context)) {
    console.log('[REACTION_BLOCKED]', { userId, context, reaction })
    return false
  }
  const room = ensureRoomState(world)
  const payload: RoomReaction = { userId, reaction, context, at: Date.now() }
  room.reactions.push(payload)
  console.log('[REACTION_TRIGGER]', payload)
  return payload
}
