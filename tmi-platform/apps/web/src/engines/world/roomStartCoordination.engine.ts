import { getArrivalStatus } from './arrivalStatus.engine'

export function isRoomReady(world: Record<string, any>, requiredUserIds: string[]) {
  const readyUsers = requiredUserIds.filter(userId => {
    const status = getArrivalStatus(world, userId)
    return Boolean(status && status.etaMinutes <= 0)
  })
  const ready = readyUsers.length === requiredUserIds.length
  const payload = { requiredUserIds, readyUsers, ready, at: Date.now() }
  console.log('[ROOM_START_COORDINATION]', payload)
  return payload
}
