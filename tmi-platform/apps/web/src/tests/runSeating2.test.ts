import { getCameraView, setCameraMode, type CameraWorldLike } from '../engines/world/camera360.engine'
import { assignSeat, upgradeSeat, type Player, type SeatingWorldLike } from '../engines/world/seating2.engine'

type TestWorld = SeatingWorldLike & CameraWorldLike

function createWorld(): TestWorld {
  const players: Player[] = [
    { id: 'u_free', name: 'Free User', tier: 'free', position: 'standing' },
    { id: 'u_bronze', name: 'Bronze User', tier: 'bronze', position: 'standing' }
  ]
  return {
    worldId: 'seating2_test_world',
    players
  }
}

function runSeating2Test() {
  const world = createWorld()

  const freeSeat = assignSeat(world, 'u_free')
  const bronzeSeat = assignSeat(world, 'u_bronze')

  const freeUpgrade1 = upgradeSeat(world, 'u_free')
  const bronzeUpgrade1 = upgradeSeat(world, 'u_bronze')
  const bronzeUpgrade2 = upgradeSeat(world, 'u_bronze')

  setCameraMode(world, 'audience')
  const view = getCameraView(world)

  const freeMovedForward =
    Boolean(freeSeat) &&
    freeUpgrade1.ok &&
    world.seating2!.seats.some(s => s.occupiedBy === 'u_free' && s.row < (freeSeat?.row ?? 99))

  const bronzeMovedForward =
    Boolean(bronzeSeat) &&
    bronzeUpgrade1.ok &&
    world.seating2!.seats.some(s => s.occupiedBy === 'u_bronze' && s.row < (bronzeSeat?.row ?? 99))

  const bronzeRestrictionValid = bronzeUpgrade2.ok === false && bronzeUpgrade2.reason === 'no-upgrade-available'

  console.log('[SEATING2_ASSERT]', {
    assignedFree: Boolean(freeSeat),
    assignedBronze: Boolean(bronzeSeat),
    freeMovedForward,
    bronzeMovedForward,
    bronzeRestrictionValid,
    freeUpgrade1,
    bronzeUpgrade1,
    bronzeUpgrade2,
    cameraMode: view.mode,
    cameraSeatRef: view.seatRef ?? 'none'
  })
}

runSeating2Test()
