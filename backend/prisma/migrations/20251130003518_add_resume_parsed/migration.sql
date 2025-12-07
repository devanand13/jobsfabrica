/*
  Warnings:

  - You are about to drop the `ResumeParsed` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ResumeParsed" DROP CONSTRAINT "ResumeParsed_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeParsed" DROP CONSTRAINT "ResumeParsed_userId_fkey";

-- DropTable
DROP TABLE "ResumeParsed";

-- CreateTable
CREATE TABLE "UserProfessionalDetails" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "experiences" JSONB,
    "education" JSONB,
    "skills" JSONB,
    "projects" JSONB,
    "summary" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProfessionalDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfessionalDetails_userId_key" ON "UserProfessionalDetails"("userId");

-- AddForeignKey
ALTER TABLE "UserProfessionalDetails" ADD CONSTRAINT "UserProfessionalDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
