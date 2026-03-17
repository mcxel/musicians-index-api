-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" JSONB NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_snapshots" (
    "id" TEXT NOT NULL,
    "contestRoundId" TEXT NOT NULL,
    "articleId" TEXT,
    "results" JSONB NOT NULL,
    "winnerInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "poll_snapshots_contestRoundId_key" ON "poll_snapshots"("contestRoundId");

-- CreateIndex
CREATE UNIQUE INDEX "poll_snapshots_articleId_key" ON "poll_snapshots"("articleId");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_snapshots" ADD CONSTRAINT "poll_snapshots_contestRoundId_fkey" FOREIGN KEY ("contestRoundId") REFERENCES "contest_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_snapshots" ADD CONSTRAINT "poll_snapshots_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
