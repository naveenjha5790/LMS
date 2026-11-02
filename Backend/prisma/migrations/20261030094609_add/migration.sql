/*
  Warnings:

  - Added the required column `createdBy` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedBy` to the `MediaFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MediaFile" ADD COLUMN     "uploadedBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "createdBy" TEXT NOT NULL;
