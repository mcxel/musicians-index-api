import { ensureHubState, ensureRoomState } from '../engines/world/communication.engine'
import { sendHubMessage } from '../engines/world/hubMessage.engine'
import { emitChatBubble } from '../engines/world/chatBubble.engine'

function runCommunicationTest() {
  const world: Record<string, any> = {}

  ensureHubState(world)
  ensureRoomState(world)

  sendHubMessage(world, 'u1', 'persistent hello')
  emitChatBubble(world, 'u1', 'temp hello', 'lobby')

  const hubPersisted = world.hub.messages.length === 1
  const roomEphemeralExists = world.room.bubbles.length === 1

  world.room.bubbles = []
  const roomCleared = world.room.bubbles.length === 0
  const hubStillThere = world.hub.messages.length === 1

  console.log('[COMMUNICATION_TEST_ASSERT]', {
    hubPersisted,
    roomEphemeralExists,
    roomCleared,
    hubStillThere
  })
}

runCommunicationTest()
