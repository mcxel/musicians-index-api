/**
 * @deprecated Import from CanonicalGenreRegistry.ts — performer-side shim for backward compat.
 */
export type {
  CanonicalGenreId,
  CanonicalGenreRoomDefinition,
  GenreRoomDefinition,
  GenreRoomThemeKit,
  PerformerGenreId,
  PerformerLobbyPrivateMode,
} from "./CanonicalGenreRegistry";

export {
  CANONICAL_GENRE_IDS,
  CANONICAL_GENRE_ROOM_REGISTRY,
  BASELINE_GENRE_LOBBY_ROOM_IDS,
  FAN_GENRE_ROOM_REGISTRY,
  PERFORMER_GENRE_IDS,
  PERFORMER_GENRE_ROOM_REGISTRY,
  PERFORMER_LOBBY_PRIVATE_MODES,
  getCanonicalGenreRoomDefinition,
  getGenreRoomByRoomId,
  getGenreRoomDefinition,
  isCanonicalGenreRoomId,
  isFanGenreRoomId,
  isPerformerGenreRoomId,
  listCanonicalGenreIds,
  listGenreRoomDefinitions,
  resolveGenreLobbyJoinHref,
  shouldPublishPerformerLobbyToWall,
} from "./CanonicalGenreRegistry";
