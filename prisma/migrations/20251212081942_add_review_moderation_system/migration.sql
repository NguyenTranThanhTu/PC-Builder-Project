/*
  Warnings:

  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable - Add columns with defaults for existing data
ALTER TABLE "Review" ADD COLUMN "adminReplyBy" TEXT,
ADD COLUMN "rejectionReason" TEXT,
ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing reviews to have updatedAt = createdAt
UPDATE "Review" SET "updatedAt" = "createdAt" WHERE "updatedAt" = CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");
