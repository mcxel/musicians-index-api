import { triggerReaction } from '../engines/world/reaction.engine'

function runReactionTest() {
  const world: Record<string, any> = {}

  const allowed = triggerReaction(world, 'u1', 'wave', 'hub-lobby')
  const blocked = triggerReaction(world, 'u1', 'fire', 'performance')

  console.log('[REACTION_TEST_ASSERT]', {
    allowed: Boolean(allowed),
    blocked: blocked === false,
    reactionCount: world.room?.reactions?.length ?? 0
  })
}

runReactionTest()
