/*
  Warnings:

  - You are about to drop the column `cancelReason` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancelReason" TEXT;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "cancelReason",
DROP COLUMN "status";
