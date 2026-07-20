-- AI Agent Registry: real persisted identity/directive/objective/
-- achievement/checkpoint records for Big Ace, Michael Charlie, department
-- leads, and individual bots. Scope: identity, directives, objectives,
-- achievements, checkpoints only.
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "reportsToId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_directives" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_directives_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "agent_directives_agentId_idx" ON "agent_directives"("agentId");

CREATE TABLE "agent_objectives" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "agent_objectives_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "agent_objectives_agentId_status_idx" ON "agent_objectives"("agentId", "status");

CREATE TABLE "agent_achievements" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_achievements_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "agent_achievements_agentId_idx" ON "agent_achievements"("agentId");

CREATE TABLE "agent_checkpoints" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_checkpoints_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "agent_checkpoints_agentId_idx" ON "agent_checkpoints"("agentId");

ALTER TABLE "agent_directives" ADD CONSTRAINT "agent_directives_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_objectives" ADD CONSTRAINT "agent_objectives_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_achievements" ADD CONSTRAINT "agent_achievements_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_checkpoints" ADD CONSTRAINT "agent_checkpoints_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
