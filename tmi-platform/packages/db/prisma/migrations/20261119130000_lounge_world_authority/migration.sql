-- Lounge world authority (2026-11-19). NOT applied to any shared/production database.
-- 1) Owner-appointed lounge roles: moderators, DJs, bans, invitations (revocable, audited).
CREATE TABLE IF NOT EXISTS lounge_room_roles (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('MODERATOR', 'DJ', 'BANNED', 'INVITED')),
  granted_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revoked_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS lounge_room_roles_active_uq ON lounge_room_roles (room_id, user_id, role) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS lounge_room_roles_room_idx ON lounge_room_roles (room_id) WHERE revoked_at IS NULL;

-- 2) Server-authoritative video-panel positions (one row per participant per room).
CREATE TABLE IF NOT EXISTS lounge_panel_positions (
  room_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  x DOUBLE PRECISION NOT NULL,
  z DOUBLE PRECISION NOT NULL,
  facing DOUBLE PRECISION NOT NULL DEFAULT 0,
  mode TEXT NOT NULL DEFAULT 'FREE' CHECK (mode IN ('FREE', 'FOLLOW', 'DOCKED', 'CIRCLE')),
  docked_at TEXT,
  circle_id TEXT,
  seq BIGINT NOT NULL,
  t_ms BIGINT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, participant_id)
);

-- 3) Shared room-object events (jukebox queue). Ordered per object; idempotent per event id.
CREATE TABLE IF NOT EXISTS room_object_events (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  object_id TEXT NOT NULL,
  seq BIGINT NOT NULL,
  event_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('REQUEST_TRACK', 'SELECT_TRACK', 'SKIP', 'PAUSE', 'PLAY')),
  track_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS room_object_events_event_uq ON room_object_events (room_id, event_id);
CREATE UNIQUE INDEX IF NOT EXISTS room_object_events_seq_uq ON room_object_events (room_id, object_id, seq);

-- 4) Server-authoritative Fan avatar state in avatar-enabled venues (never lounges / performer lobbies).
CREATE TABLE IF NOT EXISTS room_avatar_states (
  room_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  z DOUBLE PRECISION NOT NULL,
  yaw DOUBLE PRECISION NOT NULL DEFAULT 0,
  state TEXT NOT NULL,
  speed DOUBLE PRECISION NOT NULL DEFAULT 0,
  seat_id TEXT,
  active_emote TEXT,
  active_prop TEXT,
  seq BIGINT NOT NULL,
  t_ms BIGINT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, participant_id)
);

-- 5) Saved video-presence looks (per ACCOUNT: one inventory for Fan + Performer) and the equipped look.
CREATE TABLE IF NOT EXISTS video_presence_collections (
  collection_id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  appearance_ids TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS video_presence_collections_owner_idx ON video_presence_collections (owner_id);
CREATE TABLE IF NOT EXISTS video_presence_equipped (
  user_id TEXT PRIMARY KEY,
  appearance_id TEXT NOT NULL,
  collection_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) Room registry: ownership class (platform-owned OFFICIAL vs creator-owned USER vs quarantined
--    LEGACY_UNCLASSIFIED) and the venue layout (blueprint) the server uses for avatar movement.
CREATE TABLE IF NOT EXISTS room_registry (
  room_id TEXT PRIMARY KEY,
  ownership_class TEXT NOT NULL CHECK (ownership_class IN ('OFFICIAL', 'USER', 'LEGACY_UNCLASSIFIED')),
  venue_blueprint_id TEXT,
  classified_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
