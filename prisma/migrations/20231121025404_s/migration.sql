/*
  Warnings:

  - The primary key for the `pdc` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Date Endorsed` on the `pdc` table. All the data in the column will be lost.
  - You are about to drop the column `Date Pulled Out` on the `pdc` table. All the data in the column will be lost.
  - You are about to drop the column `Date Stored` on the `pdc` table. All the data in the column will be lost.
  - You are about to drop the column `PDC Remarks` on the `pdc` table. All the data in the column will be lost.
  - You are about to drop the column `PDC Status` on the `pdc` table. All the data in the column will be lost.
  - Added the required column `PDC_ID` to the `pdc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pdc` DROP PRIMARY KEY,
    DROP COLUMN `Date Endorsed`,
    DROP COLUMN `Date Pulled Out`,
    DROP COLUMN `Date Stored`,
    DROP COLUMN `PDC Remarks`,
    DROP COLUMN `PDC Status`,
    ADD COLUMN `Date_Endorsed` DATETIME(6) NULL,
    ADD COLUMN `Date_Pulled_Out` DATETIME(6) NULL,
    ADD COLUMN `Date_Stored` DATETIME(6) NULL,
    ADD COLUMN `PDC_ID` VARCHAR(191) NOT NULL,
    ADD COLUMN `PDC_Remarks` VARCHAR(250) NULL,
    ADD COLUMN `PDC_Status` VARCHAR(150) NULL,
    ADD PRIMARY KEY (`PDC_ID`);
