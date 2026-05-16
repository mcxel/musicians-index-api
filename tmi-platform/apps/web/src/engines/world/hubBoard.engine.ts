import { ensureHubState } from './communication.engine'

export type HubBoardItem = {
  id: string
  userId: string
  text: string
  at: number
}

export function postHubBoard(world: Record<string, any>, userId: string, text: string) {
  const hub = ensureHubState(world)
  const payload: HubBoardItem = { id: `board_${Date.now()}`, userId, text, at: Date.now() }
  hub.board.push(payload)
  console.log('[HUB_BOARD_UPDATE]', payload)
  return payload
}

export function getHubBoard(world: Record<string, any>) {
  const hub = ensureHubState(world)
  return [...hub.board] as HubBoardItem[]
}
