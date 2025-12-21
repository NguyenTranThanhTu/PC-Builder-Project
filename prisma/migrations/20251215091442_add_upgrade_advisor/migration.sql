-- CreateTable
CREATE TABLE "UpgradeAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "currentPC" JSONB NOT NULL,
    "analysis" JSONB NOT NULL,
    "budget" JSONB,
    "selectedUpgrades" JSONB,
    "totalCost" DOUBLE PRECISION,
    "implemented" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpgradeAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UpgradeAnalysis_userId_idx" ON "UpgradeAnalysis"("userId");

-- CreateIndex
CREATE INDEX "UpgradeAnalysis_sessionId_idx" ON "UpgradeAnalysis"("sessionId");

-- CreateIndex
CREATE INDEX "UpgradeAnalysis_createdAt_idx" ON "UpgradeAnalysis"("createdAt");

-- AddForeignKey
ALTER TABLE "UpgradeAnalysis" ADD CONSTRAINT "UpgradeAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
