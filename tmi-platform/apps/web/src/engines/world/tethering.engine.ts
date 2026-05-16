import { assertLobbyContext, ensureRoomState, type LobbyContext } from './communication.engine'

export type Tether = {
  fromUserId: string
  toUserId: string
  context: LobbyContext
  at: number
}

export function createTether(
  world: Record<string, any>,
  fromUserId: string,
  toUserId: string,
  context: LobbyContext
) {
  if (!assertLobbyContext(context)) {
    console.log('[TETHER_BLOCKED]', { fromUserId, toUserId, context })
    return false
  }
  const room = ensureRoomState(world)
  const payload: Tether = { fromUserId, toUserId, context, at: Date.now() }
  room.tethering.push(payload)
  console.log('[TETHER_CREATE]', payload)
  return payload
}
