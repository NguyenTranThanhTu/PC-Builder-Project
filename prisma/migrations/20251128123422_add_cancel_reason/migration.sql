/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "updatedAt",
ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';
