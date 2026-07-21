-- Real, cross-user submission store for competition/show lineups (Monday
-- Night Stage, Producer Beat Battle, World Dance Party, Cypher Rotation).
-- Replaces lib/events/EventSubmissionEngine.ts's localStorage-only ledger,
-- which was per-browser and could never produce a lineup other users or
-- devices could actually see.
CREATE TABLE "event_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bpm" INTEGER,
    "genre" TEXT,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "rightsAttested" BOOLEAN NOT NULL DEFAULT false,
    "sampleClearanceDeclared" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "queuedForDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "event_submissions_category_status_idx" ON "event_submissions"("category", "status");

CREATE INDEX "event_submissions_userId_idx" ON "event_submissions"("userId");

ALTER TABLE "event_submissions" ADD CONSTRAINT "event_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
