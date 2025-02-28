/*
  Warnings:

  - Made the column `NumSeriesFrom` on table `ctplregistration` required. This step will fail if there are existing NULL values in that column.
  - Made the column `NumSeriesTo` on table `ctplregistration` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `ctplregistration` MODIFY `NumSeriesFrom` VARCHAR(450) NOT NULL,
    MODIFY `NumSeriesTo` VARCHAR(450) NOT NULL;
