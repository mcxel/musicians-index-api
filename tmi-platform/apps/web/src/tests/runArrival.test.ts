import { getArrivalStatus, setArrivalStatus } from '../engines/world/arrivalStatus.engine'
import { isRoomReady } from '../engines/world/roomStartCoordination.engine'

function runArrivalTest() {
  const world: Record<string, any> = {}

  setArrivalStatus(world, 'u1', 20, "I'll be there in 20 min")
  setArrivalStatus(world, 'u2', 0, 'arrived')
  setArrivalStatus(world, 'u3', 0, 'arrived')
  setArrivalStatus(world, 'u1', 0, 'arrived')

  const status = getArrivalStatus(world, 'u1')
  const readyPayload = isRoomReady(world, ['u1', 'u2', 'u3'])

  console.log('[ARRIVAL_TEST_ASSERT]', {
    etaStored: status?.etaMinutes === 0,
    noteStored: Boolean(status?.note),
    roomReady: readyPayload.ready
  })
}

runArrivalTest()
