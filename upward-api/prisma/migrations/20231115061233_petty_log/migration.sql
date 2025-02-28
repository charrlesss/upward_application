/*
  Warnings:

  - The primary key for the `transaction_code` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `petty log` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `transaction_code` DROP PRIMARY KEY,
    MODIFY `Code` VARCHAR(220) NOT NULL,
    MODIFY `Description` VARCHAR(220) NOT NULL,
    MODIFY `Acct_Code` VARCHAR(220) NOT NULL,
    ADD PRIMARY KEY (`Code`);

-- DropTable
DROP TABLE `petty log`;

-- CreateTable
CREATE TABLE `petty_log` (
    `Petty_Log` INTEGER NOT NULL AUTO_INCREMENT,
    `Purpose` VARCHAR(100) NOT NULL,
    `Acct_Code` VARCHAR(10) NOT NULL,
    `Short` VARCHAR(50) NOT NULL,
    `Inactive` BOOLEAN NOT NULL,

    PRIMARY KEY (`Petty_Log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
