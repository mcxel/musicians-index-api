export type PresenceStatus = 'joined' | 'idle' | 'active' | 'away' | 'left'

export type PresenceRecord = {
  userId: string
  status: PresenceStatus
  zoneId?: string
  updatedAt: number
}

export function ensurePresenceState(world: Record<string, any>) {
  if (!world.presence) {
    world.presence = {
      byUser: {} as Record<string, PresenceRecord>,
      history: [] as PresenceRecord[]
    }
  }
  return world.presence as {
    byUser: Record<string, PresenceRecord>
    history: PresenceRecord[]
  }
}

export function joinPresence(world: Record<string, any>, userId: string, zoneId?: string) {
  const state = ensurePresenceState(world)
  const record: PresenceRecord = {
    userId,
    status: 'joined',
    zoneId,
    updatedAt: Date.now()
  }
  state.byUser[userId] = record
  state.history.push(record)
  console.log('[PRESENCE_JOIN]', record)
  return record
}

export function updatePresence(
  world: Record<string, any>,
  userId: string,
  status: PresenceStatus,
  zoneId?: string
) {
  const state = ensurePresenceState(world)
  const record: PresenceRecord = {
    userId,
    status,
    zoneId,
    updatedAt: Date.now()
  }
  state.byUser[userId] = record
  state.history.push(record)
  console.log('[PRESENCE_UPDATE]', record)
  return record
}

export function leavePresence(world: Record<string, any>, userId: string) {
  const state = ensurePresenceState(world)
  const prev = state.byUser[userId]
  const record: PresenceRecord = {
    userId,
    status: 'left',
    zoneId: prev?.zoneId,
    updatedAt: Date.now()
  }
  state.byUser[userId] = record
  state.history.push(record)
  console.log('[PRESENCE_LEAVE]', record)
  return record
}

export function getPresence(world: Record<string, any>, userId: string) {
  const state = ensurePresenceState(world)
  return state.byUser[userId]
}
