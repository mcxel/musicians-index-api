/** Venue performance mode: personal DMs are visual-only (no message chime). */
export function isVenueQuietDmActive(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.tmiVenueQuietDm === "1";
}

export function setVenueQuietDmActive(active: boolean): void {
  if (typeof document === "undefined") return;
  if (active) {
    document.documentElement.dataset.tmiVenueQuietDm = "1";
  } else {
    delete document.documentElement.dataset.tmiVenueQuietDm;
  }
}

export function shouldPlayIncomingMessageSound(): boolean {
  return !isVenueQuietDmActive();
}
