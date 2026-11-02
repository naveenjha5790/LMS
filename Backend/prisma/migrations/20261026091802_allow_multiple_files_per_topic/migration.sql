/*
  Warnings:

  - You are about to drop the column `mediaFileId` on the `Topic` table. All the data in the column will be lost.
  - Added the required column `topicId` to the `MediaFile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_mediaFileId_fkey";

-- DropIndex
DROP INDEX "Topic_mediaFileId_key";

-- AlterTable
ALTER TABLE "MediaFile" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "topicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "mediaFileId";

-- AddForeignKey
ALTER TABLE "MediaFile" ADD CONSTRAINT "MediaFile_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
