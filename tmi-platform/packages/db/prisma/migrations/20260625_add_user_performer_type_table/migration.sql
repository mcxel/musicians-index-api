-- CreateTable
CREATE TABLE "UserPerformerType" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PerformerType" NOT NULL,

    CONSTRAINT "UserPerformerType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPerformerType_userId_idx" ON "UserPerformerType"("userId");

-- AddForeignKey
ALTER TABLE "UserPerformerType" ADD CONSTRAINT "UserPerformerType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
