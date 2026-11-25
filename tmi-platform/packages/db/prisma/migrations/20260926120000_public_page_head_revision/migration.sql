-- CreateEnum
CREATE TYPE "PublicPageProfileKind" AS ENUM ('FAN', 'PERFORMER', 'WRITER_PORTFOLIO');

-- CreateEnum
CREATE TYPE "PublicPageRevisionState" AS ENUM ('DRAFT', 'PUBLISHED', 'SUPERSEDED');

-- CreateTable
CREATE TABLE "public_page_heads" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "profile_kind" "PublicPageProfileKind" NOT NULL,
    "draft_revision_id" TEXT,
    "published_revision_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_page_heads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_page_revisions" (
    "id" TEXT NOT NULL,
    "head_id" TEXT NOT NULL,
    "revision_number" INTEGER NOT NULL,
    "state" "PublicPageRevisionState" NOT NULL,
    "body" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_page_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "public_page_heads_draft_revision_id_key" ON "public_page_heads"("draft_revision_id");

-- CreateIndex
CREATE UNIQUE INDEX "public_page_heads_published_revision_id_key" ON "public_page_heads"("published_revision_id");

-- CreateIndex
CREATE UNIQUE INDEX "public_page_heads_owner_user_id_profile_kind_key" ON "public_page_heads"("owner_user_id", "profile_kind");

-- CreateIndex
CREATE INDEX "public_page_revisions_head_id_idx" ON "public_page_revisions"("head_id");

-- CreateIndex
CREATE UNIQUE INDEX "public_page_revisions_head_id_revision_number_key" ON "public_page_revisions"("head_id", "revision_number");

-- AddForeignKey
ALTER TABLE "public_page_heads" ADD CONSTRAINT "public_page_heads_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_page_heads" ADD CONSTRAINT "public_page_heads_draft_revision_id_fkey" FOREIGN KEY ("draft_revision_id") REFERENCES "public_page_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_page_heads" ADD CONSTRAINT "public_page_heads_published_revision_id_fkey" FOREIGN KEY ("published_revision_id") REFERENCES "public_page_revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_page_revisions" ADD CONSTRAINT "public_page_revisions_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "public_page_heads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
