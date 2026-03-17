-- Phase C: Add profileArticleId to Artist for auto-created profile articles
-- AlterTable
ALTER TABLE "Artist" ADD COLUMN "profileArticleId" TEXT;

-- CreateIndex (unique constraint)
CREATE UNIQUE INDEX "Artist_profileArticleId_key" ON "Artist"("profileArticleId");

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_profileArticleId_fkey" FOREIGN KEY ("profileArticleId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
