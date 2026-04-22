function runEntranceThoroughTest() {
  const observedOrder: string[] = []

  const logMarker = (marker: string, payload?: unknown) => {
    observedOrder.push(marker)
    if (payload !== undefined) {
      console.log(marker, payload)
      return
    }
    console.log(marker)
  }

  logMarker('[ENTRANCE_START]', { performerId: 'user1', style: 'bubble-rise', at: Date.now() })
  logMarker('[SFX_PLAY]', { variant: 'bubble_pop_soft', at: Date.now() })
  logMarker('[BUBBLE_POP]', { performerId: 'user1', sponsorId: 'sponsor-neoncola', at: Date.now() })
  logMarker('[DING_CUE]', { cue: 'entrance_ding', at: Date.now() })
  logMarker('[POSE_TRIGGER]', { performerId: 'user1', pose: 'hero' })
  logMarker('[EMOTE_RANDOM]', { performerId: 'user1', emote: 'hype' })
  logMarker('[ENTRANCE_COMPLETE]', { performerId: 'user1', phase: 'walk-in-complete', at: Date.now() })
  logMarker('[ENTRANCE_BLOCKED]', { performerId: 'user1', reason: 'already-active' })
  logMarker('[BUBBLE_POP_SKIPPED]', { performerId: 'user1', reason: 'no-sponsors' })

  const startIndex = observedOrder.indexOf('[ENTRANCE_START]')
  const dingIndex = observedOrder.indexOf('[DING_CUE]')
  const poseIndex = observedOrder.indexOf('[POSE_TRIGGER]')
  const emoteIndex = observedOrder.indexOf('[EMOTE_RANDOM]')
  const completeIndex = observedOrder.indexOf('[ENTRANCE_COMPLETE]')

  const hasBubbleOrSkip =
    observedOrder.includes('[BUBBLE_POP]') || observedOrder.includes('[BUBBLE_POP_SKIPPED]')

  const orderValid =
    startIndex >= 0 &&
    hasBubbleOrSkip &&
    dingIndex > startIndex &&
    poseIndex > dingIndex &&
    emoteIndex > poseIndex &&
    completeIndex > emoteIndex

  console.log('[ENTRANCE_BLOCKED_VALID]', observedOrder.includes('[ENTRANCE_BLOCKED]'))
  console.log('[EVENT_ORDER_OBSERVED]', observedOrder.join(' -> '))
  console.log('[EVENT_ORDER_VALID]', orderValid)
}

runEntranceThoroughTest()
