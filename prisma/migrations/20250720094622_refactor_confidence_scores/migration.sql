/*
  Warnings:

  - You are about to drop the column `confidence1` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `confidence10` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `confidence2` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `confidence3` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `confidence4` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `confidence5` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `confidence6` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `confidence7` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `confidence8` on the `UserPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `confidence9` on the `UserPreferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPreferences" DROP COLUMN "confidence1",
DROP COLUMN "confidence10",
DROP COLUMN "confidence2",
DROP COLUMN "confidence3",
DROP COLUMN "confidence4",
DROP COLUMN "confidence5",
DROP COLUMN "confidence6",
DROP COLUMN "confidence7",
DROP COLUMN "confidence8",
DROP COLUMN "confidence9";

-- CreateTable
CREATE TABLE "ConfidenceScore" (
    "id" TEXT NOT NULL,
    "preferencesId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfidenceScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfidenceScore_preferencesId_questionId_key" ON "ConfidenceScore"("preferencesId", "questionId");

-- AddForeignKey
ALTER TABLE "ConfidenceScore" ADD CONSTRAINT "ConfidenceScore_preferencesId_fkey" FOREIGN KEY ("preferencesId") REFERENCES "UserPreferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
