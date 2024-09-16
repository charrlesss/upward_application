/*
  Warnings:

  - The primary key for the `ctplregistration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `Source_No_Ref_ID` to the `journal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ctplregistration` DROP PRIMARY KEY,
    MODIFY `ctplId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`ctplId`);

-- AlterTable
ALTER TABLE `journal` ADD COLUMN `Source_No_Ref_ID` VARCHAR(191) NOT NULL;
