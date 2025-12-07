/*
  Warnings:

  - You are about to drop the column `education` on the `UserProfessionalDetails` table. All the data in the column will be lost.
  - You are about to drop the column `experiences` on the `UserProfessionalDetails` table. All the data in the column will be lost.
  - You are about to drop the column `projects` on the `UserProfessionalDetails` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `UserProfessionalDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfessionalDetails" DROP COLUMN "education",
DROP COLUMN "experiences",
DROP COLUMN "projects",
DROP COLUMN "skills",
ADD COLUMN     "topSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];
