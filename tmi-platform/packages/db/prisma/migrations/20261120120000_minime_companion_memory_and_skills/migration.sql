-- Durable Mini-Me Companion Memory, Latent Language, Individual Skill Proficiencies & Interaction Log.
-- OWNER APPROVAL REQUIRED BEFORE APPLYING ANYWHERE PERSISTENT (PRODUCTION_DB_MUTATIONS = NO).
-- Additive only; rollback at bottom.
-- Enforces strict owner_user_id + companion_id isolation, same-day UTC growth deduplication,
-- 21-day playful forgetfulness skill tracking, and atomic callback cooldown persistence.

CREATE TABLE IF NOT EXISTS "minime_companions" (
  "id"                                 TEXT        NOT NULL,
  "owner_user_id"                      TEXT        NOT NULL,
  "companion_id"                       TEXT        NOT NULL,
  "archetype_id"                       TEXT        NOT NULL DEFAULT 'M2_AVERAGE',
  "stage"                              TEXT        NOT NULL DEFAULT 'STAGE_1_BABY_MINI_SPEAK',
  "active_interaction_days"            INTEGER     NOT NULL DEFAULT 0,
  "last_calendar_practice_day_key"     TEXT,
  "last_meaningful_interaction_at_ms"  BIGINT,
  "first_hello_completed"              BOOLEAN     NOT NULL DEFAULT FALSE,
  "growth_axes"                        JSONB       NOT NULL DEFAULT '{"vocabularyRecognition":0,"pronunciationMastery":0.08,"emotionalRapport":0.1,"rhythmicPlay":0.05,"callbackConfidence":0}'::jsonb,
  "personality_traits"                 JSONB       NOT NULL DEFAULT '{"energy":0.5,"playfulness":0.5,"curiosity":0.55,"sociability":0.5,"expressiveness":0.5,"learnedHabitWeight":0}'::jsonb,
  "speech_settings"                    JSONB       NOT NULL DEFAULT '{"learningEnabled":true,"spontaneousCallbacksEnabled":true,"privateSpacesAllowed":true,"publicAvatarLobbySpeech":false,"quietMode":false,"companionVolume":0.35}'::jsonb,
  "favorite_movements"                 JSONB       NOT NULL DEFAULT '[]'::jsonb,
  "pending_phrase_ids"                 JSONB       NOT NULL DEFAULT '[]'::jsonb,
  "last_idle_kind"                     TEXT,
  "last_idle_decision_at_ms"           BIGINT,
  "session_callback_count"             INTEGER     NOT NULL DEFAULT 0,
  "last_any_callback_at_ms"            BIGINT,
  "year_index"                         INTEGER     NOT NULL DEFAULT 0,
  "revision"                           INTEGER     NOT NULL DEFAULT 1,
  "created_at"                         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"                         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "minime_companions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "minime_companions_days_nonneg" CHECK ("active_interaction_days" >= 0),
  CONSTRAINT "minime_companions_revision_pos" CHECK ("revision" >= 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS "minime_companions_owner_companion_uidx"
  ON "minime_companions" ("owner_user_id", "companion_id");

CREATE INDEX IF NOT EXISTS "minime_companions_owner_idx"
  ON "minime_companions" ("owner_user_id", "updated_at");

CREATE TABLE IF NOT EXISTS "minime_latent_phrases" (
  "id"                        TEXT             NOT NULL,
  "owner_user_id"             TEXT             NOT NULL,
  "companion_id"              TEXT             NOT NULL,
  "phrase_id"                 TEXT             NOT NULL,
  "canonical_text"            TEXT             NOT NULL,
  "encounter_count"           INTEGER          NOT NULL DEFAULT 1,
  "practice_count"            INTEGER          NOT NULL DEFAULT 0,
  "recognition_strength"      DOUBLE PRECISION NOT NULL DEFAULT 0.08,
  "pronunciation_strength"    DOUBLE PRECISION NOT NULL DEFAULT 0.02,
  "contexts"                  JSONB            NOT NULL DEFAULT '["GENERAL"]'::jsonb,
  "approved_for_callback"     BOOLEAN          NOT NULL DEFAULT FALSE,
  "favorited"                 BOOLEAN          NOT NULL DEFAULT FALSE,
  "public_speech_allowed"     BOOLEAN          NOT NULL DEFAULT FALSE,
  "never_say_again"           BOOLEAN          NOT NULL DEFAULT FALSE,
  "last_heard_at_ms"          BIGINT           NOT NULL,
  "last_practiced_at_ms"      BIGINT,
  "last_spoken_at_ms"         BIGINT,
  "created_at_ms"             BIGINT           NOT NULL,
  "deleted_at_ms"             BIGINT,
  CONSTRAINT "minime_latent_phrases_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "minime_latent_phrases_owner_companion_phrase_uidx"
  ON "minime_latent_phrases" ("owner_user_id", "companion_id", "phrase_id");

CREATE INDEX IF NOT EXISTS "minime_latent_phrases_owner_active_idx"
  ON "minime_latent_phrases" ("owner_user_id", "companion_id") WHERE "deleted_at_ms" IS NULL;

CREATE TABLE IF NOT EXISTS "minime_skill_proficiencies" (
  "id"                               TEXT             NOT NULL,
  "owner_user_id"                    TEXT             NOT NULL,
  "companion_id"                     TEXT             NOT NULL,
  "skill_id"                         TEXT             NOT NULL,
  "kind"                             TEXT             NOT NULL,
  "phrase_id"                        TEXT,
  "label"                            TEXT             NOT NULL,
  "peak_recognition"                 DOUBLE PRECISION NOT NULL DEFAULT 0.1,
  "peak_performance"                 DOUBLE PRECISION NOT NULL DEFAULT 0.05,
  "recall_confidence"                DOUBLE PRECISION NOT NULL DEFAULT 0.1,
  "performance_proficiency"          DOUBLE PRECISION NOT NULL DEFAULT 0.05,
  "practice_days"                    INTEGER          NOT NULL DEFAULT 1,
  "last_calendar_practice_day_key"   TEXT,
  "last_meaningful_practice_at_ms"   BIGINT           NOT NULL,
  "recovery_boost"                   DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "created_at_ms"                    BIGINT           NOT NULL,
  "deleted_at_ms"                    BIGINT,
  CONSTRAINT "minime_skill_proficiencies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "minime_skill_proficiencies_owner_companion_skill_uidx"
  ON "minime_skill_proficiencies" ("owner_user_id", "companion_id", "skill_id");

CREATE INDEX IF NOT EXISTS "minime_skill_proficiencies_owner_active_idx"
  ON "minime_skill_proficiencies" ("owner_user_id", "companion_id") WHERE "deleted_at_ms" IS NULL;

CREATE TABLE IF NOT EXISTS "minime_interaction_log" (
  "id"                  TEXT        NOT NULL,
  "owner_user_id"       TEXT        NOT NULL,
  "companion_id"        TEXT        NOT NULL,
  "interaction_kind"    TEXT        NOT NULL,
  "surface"             TEXT        NOT NULL,
  "intent"              TEXT,
  "calendar_day_key"    TEXT        NOT NULL,
  "grew_day"            BOOLEAN     NOT NULL DEFAULT FALSE,
  "raw_audio_stored"    BOOLEAN     NOT NULL DEFAULT FALSE,
  "metadata"            JSONB       NOT NULL DEFAULT '{}'::jsonb,
  "occurred_at_ms"      BIGINT      NOT NULL,
  CONSTRAINT "minime_interaction_log_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "minime_interaction_log_no_raw_audio" CHECK ("raw_audio_stored" = FALSE)
);

CREATE INDEX IF NOT EXISTS "minime_interaction_log_owner_companion_idx"
  ON "minime_interaction_log" ("owner_user_id", "companion_id", "occurred_at_ms" DESC);

-- ROLLBACK:
--   DROP TABLE IF EXISTS "minime_interaction_log";
--   DROP TABLE IF EXISTS "minime_skill_proficiencies";
--   DROP TABLE IF EXISTS "minime_latent_phrases";
--   DROP TABLE IF EXISTS "minime_companions";
