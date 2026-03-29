-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "isMinor" BOOLEAN DEFAULT false,
ADD COLUMN     "parentEmail" TEXT,
ADD COLUMN     "termsAccepted" BOOLEAN NOT NULL DEFAULT false;
