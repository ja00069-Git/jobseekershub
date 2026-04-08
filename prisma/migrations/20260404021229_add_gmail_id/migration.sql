/*
  Warnings:

  - A unique constraint covering the columns `[gmailId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "gmailId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Application_gmailId_key" ON "Application"("gmailId");
