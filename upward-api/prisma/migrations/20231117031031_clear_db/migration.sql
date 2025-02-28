/*
  Warnings:

  - The primary key for the `dtproperties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `cash disbursement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deposit slip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `journal voucher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `journal voucher2` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `petty cash` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `return checks` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `Slip_Code` on table `cash_breakdown` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `closedId` to the `closed` table without a default value. This is not possible if the table is not empty.
  - Made the column `ORNo` on table `collection` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Slip_Code` on table `deposit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Ref_No` on table `pdc` required. This step will fail if there are existing NULL values in that column.
  - Made the column `RPCD` on table `postponement_auth_codes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `PNNo` on table `production` required. This step will fail if there are existing NULL values in that column.
  - Made the column `RCPN` on table `pullout_auth_codes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `RCPNo` on table `pullout_request_details` required. This step will fail if there are existing NULL values in that column.
  - The required column `reportsetId` was added to the `reportset` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `booklet` MODIFY `PolicyBooklet` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`PolicyBooklet`);

-- AlterTable
ALTER TABLE `cash_breakdown` MODIFY `Slip_Code` VARCHAR(250) NOT NULL,
    ADD PRIMARY KEY (`Slip_Code`);

-- AlterTable
ALTER TABLE `closed` ADD COLUMN `closedId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`closedId`);

-- AlterTable
ALTER TABLE `collection` MODIFY `ORNo` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`ORNo`);

-- AlterTable
ALTER TABLE `company` ADD PRIMARY KEY (`Branch_Code`);

-- AlterTable
ALTER TABLE `deposit` MODIFY `Slip_Code` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`Slip_Code`);

-- AlterTable
ALTER TABLE `dtproperties` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `endorsement` ADD PRIMARY KEY (`EndorseNo`);

-- AlterTable
ALTER TABLE `holidays` MODIFY `ID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`ID`);

-- AlterTable
ALTER TABLE `journal2` MODIFY `AutoNo` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`AutoNo`);

-- AlterTable
ALTER TABLE `journal3` MODIFY `AutoNo` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`AutoNo`);

-- AlterTable
ALTER TABLE `pdc` MODIFY `Ref_No` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`Ref_No`);

-- AlterTable
ALTER TABLE `postponement` ADD PRIMARY KEY (`RPCDNo`);

-- AlterTable
ALTER TABLE `postponement_auth_codes` MODIFY `RPCD` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`RPCD`);

-- AlterTable
ALTER TABLE `postponement_detail` ADD PRIMARY KEY (`RPCDNo`);

-- AlterTable
ALTER TABLE `production` MODIFY `PNNo` VARCHAR(255) NOT NULL,
    ADD PRIMARY KEY (`PNNo`);

-- AlterTable
ALTER TABLE `pullout_auth_codes` MODIFY `RCPN` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`RCPN`);

-- AlterTable
ALTER TABLE `pullout_request` ADD PRIMARY KEY (`RCPNo`);

-- AlterTable
ALTER TABLE `pullout_request_details` MODIFY `RCPNo` VARCHAR(30) NOT NULL,
    ADD PRIMARY KEY (`RCPNo`);

-- AlterTable
ALTER TABLE `reportset` ADD COLUMN `reportsetId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`reportsetId`);

-- AlterTable
ALTER TABLE `resavelog` ADD PRIMARY KEY (`RecordNo`);

-- DropTable
DROP TABLE `cash disbursement`;

-- DropTable
DROP TABLE `deposit slip`;

-- DropTable
DROP TABLE `journal voucher`;

-- DropTable
DROP TABLE `journal voucher2`;

-- DropTable
DROP TABLE `petty cash`;

-- DropTable
DROP TABLE `return checks`;

-- CreateTable
CREATE TABLE `cash_disbursement` (
    `Branch_Code` VARCHAR(3) NULL,
    `Date_Entry` DATETIME(6) NULL,
    `Source_Type` VARCHAR(3) NULL,
    `Source_No` VARCHAR(20) NULL,
    `Explanation` VARCHAR(700) NULL,
    `Particulars` LONGTEXT NULL,
    `Payto` VARCHAR(100) NULL,
    `Address` VARCHAR(255) NULL,
    `Check_Date` DATETIME(6) NULL,
    `Check_No` VARCHAR(100) NULL,
    `Check_Bank` VARCHAR(100) NULL,
    `Check_Return` DATETIME(6) NULL,
    `Check_Collect` DATETIME(6) NULL,
    `Check_Deposit` DATETIME(6) NULL,
    `Check_Reason` VARCHAR(255) NULL,
    `GL_Acct` VARCHAR(10) NULL,
    `Sub_Acct` VARCHAR(3) NULL,
    `ID_No` VARCHAR(20) NULL,
    `cGL_Acct` VARCHAR(50) NULL,
    `cSub_Acct` VARCHAR(100) NULL,
    `cID_No` VARCHAR(100) NULL,
    `Debit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Credit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `TC` VARCHAR(3) NULL,
    `Remarks` VARCHAR(255) NULL,
    `AutoNo` BIGINT NOT NULL AUTO_INCREMENT,
    `VAT_Type` VARCHAR(50) NULL,
    `OR_Invoice_No` VARCHAR(100) NULL,
    `VATItemNo` INTEGER NULL,

    PRIMARY KEY (`AutoNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deposit_slip` (
    `Date` DATETIME(6) NULL,
    `SlipCode` VARCHAR(50) NOT NULL,
    `Slip` VARCHAR(250) NULL,
    `BankAccount` VARCHAR(250) NULL,
    `AccountName` VARCHAR(250) NULL,
    `CheckDeposit` DECIMAL(19, 4) NULL,
    `CashDeposit` DECIMAL(19, 4) NULL,
    `IDNo` VARCHAR(250) NULL,

    PRIMARY KEY (`SlipCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_voucher` (
    `Branch_Code` VARCHAR(3) NULL,
    `Date_Entry` DATETIME(6) NULL,
    `Source_Type` VARCHAR(3) NULL,
    `Source_No` VARCHAR(20) NULL,
    `Explanation` VARCHAR(255) NULL,
    `Particulars` LONGTEXT NULL,
    `Payto` VARCHAR(100) NULL,
    `Address` VARCHAR(255) NULL,
    `Check_Date` DATETIME(6) NULL,
    `Check_No` VARCHAR(100) NULL,
    `Check_Bank` VARCHAR(100) NULL,
    `Check_Return` DATETIME(6) NULL,
    `Check_Collect` DATETIME(6) NULL,
    `Check_Deposit` DATETIME(6) NULL,
    `Check_Reason` VARCHAR(255) NULL,
    `GL_Acct` VARCHAR(10) NULL,
    `Sub_Acct` VARCHAR(3) NULL,
    `ID_No` VARCHAR(20) NULL,
    `cGL_Acct` VARCHAR(50) NULL,
    `cSub_Acct` VARCHAR(100) NULL,
    `cID_No` VARCHAR(100) NULL,
    `Debit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Credit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `TC` VARCHAR(3) NULL,
    `Remarks` VARCHAR(255) NULL,
    `AutoNo` BIGINT NOT NULL AUTO_INCREMENT,
    `VAT_Type` VARCHAR(50) NULL,
    `OR_Invoice_No` VARCHAR(100) NULL,
    `VATItemNo` INTEGER NULL,

    PRIMARY KEY (`AutoNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_voucher2` (
    `Branch_Code` VARCHAR(3) NULL,
    `Date_Entry` DATETIME(6) NULL,
    `Source_Type` VARCHAR(3) NULL,
    `Source_No` VARCHAR(20) NULL,
    `Explanation` VARCHAR(255) NULL,
    `Particulars` LONGTEXT NULL,
    `Payto` VARCHAR(100) NULL,
    `Address` VARCHAR(255) NULL,
    `Check_Date` DATETIME(6) NULL,
    `Check_No` VARCHAR(100) NULL,
    `Check_Bank` VARCHAR(100) NULL,
    `Check_Return` DATETIME(6) NULL,
    `Check_Collect` DATETIME(6) NULL,
    `Check_Deposit` DATETIME(6) NULL,
    `Check_Reason` VARCHAR(255) NULL,
    `GL_Acct` VARCHAR(10) NULL,
    `Sub_Acct` VARCHAR(3) NULL,
    `ID_No` VARCHAR(20) NULL,
    `cGL_Acct` VARCHAR(50) NULL,
    `cSub_Acct` VARCHAR(100) NULL,
    `cID_No` VARCHAR(100) NULL,
    `Debit` DECIMAL(19, 4) NULL,
    `Credit` DECIMAL(19, 4) NULL,
    `TC` VARCHAR(3) NULL,
    `Remarks` VARCHAR(255) NULL,
    `AutoNo` BIGINT NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`AutoNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `petty_cash` (
    `Branch_Code` VARCHAR(3) NULL,
    `PC_Date` DATETIME(6) NULL,
    `PC_No` VARCHAR(20) NOT NULL,
    `Explanation` LONGTEXT NULL,
    `Payee` VARCHAR(100) NULL,
    `DRPurpose` LONGTEXT NULL,
    `DRAcct_Code` VARCHAR(10) NULL,
    `DRShort` VARCHAR(50) NULL,
    `Debit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Sub_Acct` VARCHAR(3) NULL,
    `IDNo` VARCHAR(20) NULL,
    `ShortName` VARCHAR(50) NULL,
    `CRAcct_Code` VARCHAR(10) NULL,
    `CRShort` VARCHAR(50) NULL,
    `Credit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `DRVATType` VARCHAR(50) NULL,
    `DRInvoiceNo` VARCHAR(100) NULL,
    `VATItemNo` INTEGER NULL,

    PRIMARY KEY (`PC_No`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `return_checks` (
    `Area` VARCHAR(255) NULL,
    `RC_Date` DATETIME(6) NULL,
    `RC_No` VARCHAR(255) NOT NULL,
    `Explanation` VARCHAR(255) NULL,
    `Check No` VARCHAR(255) NULL,
    `Date Deposit` DATETIME(6) NULL,
    `Date Collect` DATETIME(6) NULL,
    `Amount` DECIMAL(19, 4) NULL,
    `Reason` VARCHAR(255) NULL,
    `Bank` VARCHAR(255) NULL,
    `Check Date` VARCHAR(255) NULL,
    `Date Return` VARCHAR(255) NULL,
    `SlipCode` VARCHAR(255) NULL,
    `ORNum` VARCHAR(255) NULL,
    `BankAccnt` VARCHAR(255) NULL,
    `nSort` VARCHAR(255) NULL,

    PRIMARY KEY (`RC_No`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
