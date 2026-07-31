-- Adds real speaking/camera state to lobby_presences — additive only.
-- Backs the Fan Lobby's per-avatar speaking glow: sourced from real local
-- mic-level detection on each client (Web Audio AnalyserNode), never
-- fabricated. Follows the same hand-written, additive-only pattern as
-- 20260723010000_add_lobby_presence.

-- AlterTable
ALTER TABLE "lobby_presences" ADD COLUMN "is_speaking" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "lobby_presences" ADD COLUMN "has_camera_on" BOOLEAN NOT NULL DEFAULT false;
