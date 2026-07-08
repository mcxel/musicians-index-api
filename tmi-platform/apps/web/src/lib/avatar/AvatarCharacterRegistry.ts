import { TMI_CHARACTERS, type TMICharacter } from "./TMICharacterRoster";

export type AvatarCharacter = TMICharacter;

export const AVATAR_CHARACTER_REGISTRY = TMI_CHARACTERS;

export function getAvatarCharacterBySlug(slug: string): AvatarCharacter | undefined {
  const normalized = slug.trim().toLowerCase();
  return TMI_CHARACTERS.find((character) => character.slug === normalized || character.id === normalized);
}

export function getFaceScanReadyCharacters(): AvatarCharacter[] {
  return TMI_CHARACTERS.filter((character) => character.faceScanCompatible);
}

export function getWorldDancePartyCharacters(): AvatarCharacter[] {
  return TMI_CHARACTERS.filter((character) => character.worldDancePartyEnabled);
}

export function getAvatarRosterHighlights() {
  return {
    total: TMI_CHARACTERS.length,
    faceScanReady: getFaceScanReadyCharacters().length,
    worldDancePartyReady: getWorldDancePartyCharacters().length,
  };
}