/*
  Warnings:

  - You are about to drop the `chart account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `chart account`;

-- CreateTable
CREATE TABLE `chart_account` (
    `Acct_Code` VARCHAR(10) NOT NULL,
    `Acct_Title` VARCHAR(100) NOT NULL,
    `Short` VARCHAR(50) NOT NULL,
    `Account` VARCHAR(20) NOT NULL,
    `Acct_Type` VARCHAR(20) NOT NULL,
    `IDNo` BOOLEAN NOT NULL,
    `SubAccnt` BOOLEAN NOT NULL,
    `Inactive` BOOLEAN NOT NULL,

    PRIMARY KEY (`Acct_Code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
