import { ensureHubState } from './communication.engine'

export type HubInvite = {
  inviteId: string
  fromUserId: string
  toUserId: string
  roomId: string
  status: 'sent' | 'accepted' | 'declined'
  at: number
}

export function sendHubInvite(
  world: Record<string, any>,
  fromUserId: string,
  toUserId: string,
  roomId: string
) {
  const hub = ensureHubState(world)
  const payload: HubInvite = {
    inviteId: `invite_${Date.now()}`,
    fromUserId,
    toUserId,
    roomId,
    status: 'sent',
    at: Date.now()
  }
  hub.invites.push(payload)
  console.log('[HUB_INVITE_SENT]', payload)
  return payload
}
