import type { HomepageRuntimeOverrides } from './types'

let runtimeOverrides: HomepageRuntimeOverrides = {}

export function getHomepageRuntimeOverrides(): HomepageRuntimeOverrides {
  return runtimeOverrides
}

export function setHomepageRuntimeOverrides(overrides: HomepageRuntimeOverrides = {}) {
  runtimeOverrides = overrides
}

export function clearHomepageRuntimeOverrides() {
  runtimeOverrides = {}
}
