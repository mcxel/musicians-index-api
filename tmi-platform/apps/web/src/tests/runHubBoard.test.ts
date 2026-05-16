import { getHubBoard, postHubBoard } from '../engines/world/hubBoard.engine'

function runHubBoardTest() {
  const world: Record<string, any> = {}

  postHubBoard(world, 'u1', 'show starts at 9')
  postHubBoard(world, 'u2', 'be there soon')

  const items = getHubBoard(world)
  const ok = items.length === 2 && items[0].text.includes('show starts')

  console.log('[HUB_BOARD_TEST_ASSERT]', { ok, count: items.length })
}

runHubBoardTest()
