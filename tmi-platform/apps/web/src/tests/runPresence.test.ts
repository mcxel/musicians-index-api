import { getPresence, joinPresence, leavePresence, updatePresence } from '../engines/world/presence.engine'

function runPresenceTest() {
  const world: Record<string, any> = {}

  const join = joinPresence(world, 'u1', 'lobby')
  const update = updatePresence(world, 'u1', 'active', 'hub-lobby')
  const leave = leavePresence(world, 'u1')
  const current = getPresence(world, 'u1')

  const ok =
    join.status === 'joined' &&
    update.status === 'active' &&
    leave.status === 'left' &&
    current?.status === 'left'

  console.log('[PRESENCE_TEST_ASSERT]', { ok, current })
}

runPresenceTest()
