import { ensureHubState } from './communication.engine'

export type HubMessage = {
  userId: string
  message: string
  at: number
}

export function sendHubMessage(world: Record<string, any>, userId: string, message: string) {
  const hub = ensureHubState(world)
  const payload: HubMessage = { userId, message, at: Date.now() }
  hub.messages.push(payload)
  console.log('[HUB_MESSAGE]', payload)
  return payload
}

export function listHubMessages(world: Record<string, any>) {
  const hub = ensureHubState(world)
  return [...hub.messages] as HubMessage[]
}
