/*
  Warnings:

  - You are about to drop the column `Account ID` on the `bankaccounts` table. All the data in the column will be lost.
  - The primary key for the `petty_log` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `bankaccounts` DROP COLUMN `Account ID`,
    ADD COLUMN `Account_ID` VARCHAR(50) NULL,
    MODIFY `Auto` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`Auto`);

-- AlterTable
ALTER TABLE `petty_log` DROP PRIMARY KEY,
    MODIFY `Petty_Log` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`Petty_Log`);
