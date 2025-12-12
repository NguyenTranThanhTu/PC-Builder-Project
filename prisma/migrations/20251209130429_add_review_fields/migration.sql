-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "adminReply" TEXT,
ADD COLUMN     "adminReplyAt" TIMESTAMP(3),
ADD COLUMN     "helpfulCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");
