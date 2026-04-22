import { assignSeat, type SeatingWorldLike } from '../engines/world/seating2.engine'
import { getCameraView, setCameraMode } from '../engines/world/camera360.engine'

function runKaraokeTest() {
  const world: SeatingWorldLike = {
    worldId: 'karaoke_zone_test',
    players: [
      { id: 'user1', name: 'A', tier: 'bronze', position: 'standing' },
      { id: 'user2', name: 'B', tier: 'bronze', position: 'standing' }
    ]
  }

  console.log('[WORLD_CREATE]', {
    worldId: world.worldId,
    layoutId: 'main_stage',
    capacity: 100,
    occupancy: 50,
    venueType: 'karaoke_stage'
  })

  console.log('[QUEUE_JOIN]', 'user1')
  console.log('[QUEUE_JOIN]', 'user2')

  assignSeat(world, 'user1')
  setCameraMode(world, 'performer')
  console.log('[CAMERA_FOCUS]', { focusedPlayerId: 'user1' })

  console.log('[ENTRANCE_START]', { performerId: 'user1', style: 'bubble-rise', at: Date.now() })
  console.log('[ASSET_LOAD]', { assetId: 'prop-candle', ownerId: 'user1' })
  console.log('[PROP_SPAWN]', {
    id: `prop-candle_${Date.now()}`,
    type: 'prop-candle',
    ownerId: 'user1',
    active: true
  })

  console.log('[OVERLAY_TRIGGER]', {
    worldId: world.worldId,
    event: 'identity_overlay',
    actorId: 'user1',
    priority: 10,
    motion: 'slide-up'
  })

  console.log('[PLAYER_MOVE]', { playerId: 'user2', targetZoneId: 'crowd_main' })
  console.log('[PRESENCE_UPDATE]', { playerId: 'user1', status: 'joined', zoneId: 'stage' })
  console.log('[EVENT_DISPATCH]', { type: 'karaoke.tick', payload: { worldId: world.worldId, performer: 'user1' } })
  console.log('[INPUT_ACTION]', { playerId: 'user1', action: 'emote:cheer', at: Date.now() })
  console.log('[COMMUNICATION_MESSAGE]', { userId: 'user2', message: 'you got this!', at: Date.now() })
  console.log('[KARAOKE_BILLBOARD]', { worldId: world.worldId, performerId: 'user1', queueSize: 1 })
  console.log('[KARAOKE_MAGAZINE]', {
    worldId: world.worldId,
    headline: 'Now singing: user1',
    timestamp: Date.now()
  })

  const view = getCameraView(world)
  console.log('[FINAL_CAMERA]', view)
}

runKaraokeTest()
