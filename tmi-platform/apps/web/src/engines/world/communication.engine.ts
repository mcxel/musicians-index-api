export type LobbyContext = 'pre-lobby' | 'lobby' | 'hub-lobby' | 'performance' | 'other'

export function assertLobbyContext(ctx: LobbyContext): boolean {
  return ['pre-lobby', 'lobby', 'hub-lobby'].includes(ctx)
}

export function ensureHubState(world: Record<string, any>) {
  if (!world.hub) {
    world.hub = {
      messages: [],
      calls: [],
      invites: [],
      board: [],
      missedActivity: []
    }
  }
  return world.hub as {
    messages: any[]
    calls: any[]
    invites: any[]
    board: any[]
    missedActivity: any[]
  }
}

export function ensureRoomState(world: Record<string, any>) {
  if (!world.room) {
    world.room = {
      bubbles: [],
      reactions: [],
      tethering: []
    }
  }
  return world.room as {
    bubbles: any[]
    reactions: any[]
    tethering: any[]
  }
}
