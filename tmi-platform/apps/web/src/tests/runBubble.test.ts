import { emitChatBubble } from '../engines/world/chatBubble.engine'

function runBubbleTest() {
  const world: Record<string, any> = {}

  const allowed = emitChatBubble(world, 'u1', 'hello lobby', 'lobby')
  const blocked = emitChatBubble(world, 'u1', 'hello stage', 'performance')

  console.log('[BUBBLE_TEST_ASSERT]', {
    allowed: Boolean(allowed),
    blocked: blocked === false,
    bubbleCount: world.room?.bubbles?.length ?? 0
  })
}

runBubbleTest()
