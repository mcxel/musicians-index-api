import { setSeatCamera, type CameraWorldLike } from './camera360.engine'

export type Tier = 'free' | 'bronze' | 'silver' | 'vip'

export type Player = {
  id: string
  name: string
  tier: Tier
  position?: string
}

export type Seat = {
  id: string
  zoneId: string
  row: number
  index: number
  occupiedBy?: string
}

export type Seating2State = {
  seats: Seat[]
}

export type SeatingWorldLike = Omit<CameraWorldLike, 'players'> & {
  worldId: string
  players: Player[]
  seating2?: Seating2State
}

function allowedRowsForTier(tier: Tier): number[] {
  if (tier === 'free') return [4, 3]
  if (tier === 'bronze') return [4, 3, 2]
  if (tier === 'silver') return [4, 3, 2, 1]
  return [4, 3, 2, 1]
}

function ensureSeating(world: SeatingWorldLike): Seating2State {
  if (!world.seating2) {
    const seats: Seat[] = []
    const zoneId = 'crowd_main'
    for (let row = 4; row >= 1; row -= 1) {
      for (let index = 0; index < 2; index += 1) {
        seats.push({
          id: `${zoneId}_r${row}_i${index}`,
          zoneId,
          row,
          index
        })
      }
    }
    world.seating2 = { seats }
    console.log('[SEAT_INIT]', { zoneCount: 1, seatCount: seats.length })
  }
  return world.seating2
}

function findPlayer(world: SeatingWorldLike, playerId: string): Player | undefined {
  return world.players.find(p => p.id === playerId)
}

function findSeatForPlayer(state: Seating2State, playerId: string): Seat | undefined {
  return state.seats.find(s => s.occupiedBy === playerId)
}

export function assignSeat(world: SeatingWorldLike, playerId: string): Seat | null {
  const state = ensureSeating(world)
  const player = findPlayer(world, playerId)
  if (!player) return null

  const existing = findSeatForPlayer(state, playerId)
  if (existing) return existing

  const allowedRows = new Set(allowedRowsForTier(player.tier))
  const seat = state.seats.find(s => !s.occupiedBy && allowedRows.has(s.row))
  if (!seat) return null

  seat.occupiedBy = playerId
  player.position = seat.id
  setSeatCamera(world, playerId, seat.id)

  console.log('[SEAT_ASSIGNED]', { playerId, seatId: seat.id })
  console.log('[SEAT_VIEW]', { playerId, zoneId: seat.zoneId, row: seat.row, index: seat.index })
  return seat
}

export function upgradeSeat(world: SeatingWorldLike, playerId: string): { ok: boolean; cost?: number; reason?: string } {
  const state = ensureSeating(world)
  const player = findPlayer(world, playerId)
  if (!player) return { ok: false, reason: 'player-not-found' }

  const currentSeat = findSeatForPlayer(state, playerId)
  if (!currentSeat) return { ok: false, reason: 'no-seat-assigned' }

  const allowedRows = new Set(allowedRowsForTier(player.tier))
  const targetSeat = state.seats.find(
    s =>
      !s.occupiedBy &&
      s.zoneId === currentSeat.zoneId &&
      allowedRows.has(s.row) &&
      s.row < currentSeat.row
  )

  if (!targetSeat) return { ok: false, reason: 'no-upgrade-available' }
  if (player.tier === 'bronze' && targetSeat.row < 3) {
    return { ok: false, reason: 'no-upgrade-available' }
  }

  const cost = 1
  console.log('[SEAT_UPGRADE]', {
    playerId,
    fromSeatId: currentSeat.id,
    toSeatId: targetSeat.id,
    fromRow: currentSeat.row,
    toRow: targetSeat.row,
    cost
  })

  currentSeat.occupiedBy = undefined
  targetSeat.occupiedBy = playerId
  player.position = targetSeat.id

  console.log('[SEAT_UPGRADE_FX]', {
    playerId,
    seatId: targetSeat.id,
    style: 'premium-shimmer',
    durationMs: 180
  })

  console.log('[SEAT_POOF]', {
    playerId,
    seatId: targetSeat.id,
    style: 'soft-smoke'
  })

  setSeatCamera(world, playerId, targetSeat.id)
  console.log('[SEAT_VIEW]', { playerId, zoneId: targetSeat.zoneId, row: targetSeat.row, index: targetSeat.index })

  return { ok: true, cost }
}
