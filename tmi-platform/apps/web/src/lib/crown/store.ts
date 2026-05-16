export const crownStore: Record<string, unknown> = {}

export function readCrownState() {
  return crownStore
}

export function writeCrownState(nextState: Record<string, unknown> = {}) {
  Object.keys(crownStore).forEach(key => delete crownStore[key])
  Object.assign(crownStore, nextState)
}
