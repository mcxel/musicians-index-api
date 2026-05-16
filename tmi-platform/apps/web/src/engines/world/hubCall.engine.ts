import { ensureHubState } from './communication.engine'

export type HubCall = {
  callId: string
  fromUserId: string
  toUserId: string
  status: 'started' | 'ended' | 'missed'
  at: number
}

export function startHubCall(world: Record<string, any>, fromUserId: string, toUserId: string) {
  const hub = ensureHubState(world)
  const payload: HubCall = {
    callId: `call_${Date.now()}`,
    fromUserId,
    toUserId,
    status: 'started',
    at: Date.now()
  }
  hub.calls.push(payload)
  console.log('[HUB_CALL_START]', payload)
  return payload
}

export function endHubCall(world: Record<string, any>, callId: string) {
  const hub = ensureHubState(world)
  const call = hub.calls.find((c: HubCall) => c.callId === callId)
  if (!call) return false
  call.status = 'ended'
  call.at = Date.now()
  console.log('[HUB_CALL_END]', call)
  return call
}
