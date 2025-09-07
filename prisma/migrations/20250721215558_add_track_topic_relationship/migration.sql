-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "trackId" INTEGER;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;
