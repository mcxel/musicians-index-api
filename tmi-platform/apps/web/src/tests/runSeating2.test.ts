import { getCameraView, setCameraMode, type CameraWorldLike } from '../engines/world/camera360.engine'
import { assignSeat, upgradeSeat, type Player, type SeatingWorldLike } from '../engines/world/seating2.engine'

type TestWorld = SeatingWorldLike & CameraWorldLike

function createWorld(): TestWorld {
  const players: Player[] = [
    { id: 'u_free', name: 'Free User', tier: 'free', position: 'standing' },
    { id: 'u_RUBY', name: 'RUBY User', tier: 'RUBY', position: 'standing' }
  ]
  return {
    worldId: 'seating2_test_world',
    players
  }
}

function runSeating2Test() {
  const world = createWorld()

  const freeSeat = assignSeat(world, 'u_free')
  const RUBYSeat = assignSeat(world, 'u_RUBY')

  const freeUpgrade1 = upgradeSeat(world, 'u_free')
  const RUBYUpgrade1 = upgradeSeat(world, 'u_RUBY')
  const RUBYUpgrade2 = upgradeSeat(world, 'u_RUBY')

  setCameraMode(world, 'audience')
  const view = getCameraView(world)

  const freeMovedForward =
    Boolean(freeSeat) &&
    freeUpgrade1.ok &&
    world.seating2!.seats.some(s => s.occupiedBy === 'u_free' && s.row < (freeSeat?.row ?? 99))

  const RUBYMovedForward =
    Boolean(RUBYSeat) &&
    RUBYUpgrade1.ok &&
    world.seating2!.seats.some(s => s.occupiedBy === 'u_RUBY' && s.row < (RUBYSeat?.row ?? 99))

  const RUBYRestrictionValid = RUBYUpgrade2.ok === false && RUBYUpgrade2.reason === 'no-upgrade-available'

  console.log('[SEATING2_ASSERT]', {
    assignedFree: Boolean(freeSeat),
    assignedRUBY: Boolean(RUBYSeat),
    freeMovedForward,
    RUBYMovedForward,
    RUBYRestrictionValid,
    freeUpgrade1,
    RUBYUpgrade1,
    RUBYUpgrade2,
    cameraMode: view.mode,
    cameraSeatRef: view.seatRef ?? 'none'
  })
}

runSeating2Test()
