import { ensureHubState } from './communication.engine'

export type MissedActivity = {
  userId: string
  kind: 'message' | 'call' | 'invite'
  refId: string
  at: number
}

export function recordMissedActivity(
  world: Record<string, any>,
  userId: string,
  kind: MissedActivity['kind'],
  refId: string
) {
  const hub = ensureHubState(world)
  const payload: MissedActivity = { userId, kind, refId, at: Date.now() }
  hub.missedActivity.push(payload)
  console.log('[HUB_MISSED_ACTIVITY]', payload)
  return payload
}

export function listMissedActivity(world: Record<string, any>, userId: string) {
  const hub = ensureHubState(world)
  return hub.missedActivity.filter((x: MissedActivity) => x.userId === userId) as MissedActivity[]
}
