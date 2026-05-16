export type ArrivalStatus = {
  userId: string
  etaMinutes: number
  note?: string
  at: number
}

function ensureArrivalState(world: Record<string, any>) {
  if (!world.arrival) {
    world.arrival = { byUser: {} as Record<string, ArrivalStatus> }
  }
  return world.arrival as { byUser: Record<string, ArrivalStatus> }
}

export function setArrivalStatus(
  world: Record<string, any>,
  userId: string,
  etaMinutes: number,
  note?: string
) {
  const state = ensureArrivalState(world)
  const payload: ArrivalStatus = { userId, etaMinutes, note, at: Date.now() }
  state.byUser[userId] = payload
  console.log('[ARRIVAL_STATUS]', payload)
  return payload
}

export function getArrivalStatus(world: Record<string, any>, userId: string) {
  const state = ensureArrivalState(world)
  return state.byUser[userId]
}
