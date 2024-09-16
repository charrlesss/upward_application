/*
  Warnings:

  - You are about to drop the `transaction code` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `transaction code`;

-- CreateTable
CREATE TABLE `transaction_code` (
    `Code` VARCHAR(3) NOT NULL,
    `Description` VARCHAR(100) NOT NULL,
    `Acct_Code` VARCHAR(10) NOT NULL,
    `Inactive` BOOLEAN NOT NULL,

    PRIMARY KEY (`Code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
