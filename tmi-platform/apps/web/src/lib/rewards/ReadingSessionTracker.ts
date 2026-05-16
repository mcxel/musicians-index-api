import {
  startMagazineReadingSession,
  updateMagazineReadingSession,
  getMagazineReadingSession,
} from "@/lib/magazine/MagazineReadingTimer";

export const readingSessionTracker = {
  start: startMagazineReadingSession,
  update: updateMagazineReadingSession,
  get: getMagazineReadingSession,
};
