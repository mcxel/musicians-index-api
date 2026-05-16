let navigationLocked = false;
let navigationTarget: string | null = null;

export function lockNavigation(target?: string) {
  navigationLocked = true;
  navigationTarget = target ?? null;
}

export function unlockNavigation() {
  navigationLocked = false;
  navigationTarget = null;
}

export function isNavigationLocked() {
  return navigationLocked;
}

export function getNavigationTarget() {
  return navigationTarget;
}
