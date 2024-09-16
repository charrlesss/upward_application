/*
  Warnings:

  - You are about to alter the column `Constraction` on the `fpolicy` table. The data in that column could be lost. The data in that column will be cast from `VarChar(3000)` to `VarChar(550)`.
  - You are about to alter the column `Boundaries` on the `fpolicy` table. The data in that column could be lost. The data in that column will be cast from `VarChar(3000)` to `VarChar(550)`.
  - You are about to alter the column `Warranties` on the `fpolicy` table. The data in that column could be lost. The data in that column will be cast from `VarChar(3000)` to `VarChar(550)`.
  - The primary key for the `vpolicy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `WORD_ID` to the `words` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bpolicy` ADD PRIMARY KEY (`PolicyNo`);

-- AlterTable
ALTER TABLE `cglpolicy` ADD PRIMARY KEY (`PolicyNo`);

-- AlterTable
ALTER TABLE `fpolicy` MODIFY `PolicyNo` VARCHAR(550) NOT NULL,
    MODIFY `Account` VARCHAR(550) NOT NULL,
    MODIFY `BillNo` VARCHAR(550) NOT NULL,
    MODIFY `Location` VARCHAR(550) NOT NULL,
    MODIFY `PropertyInsured` VARCHAR(550) NOT NULL,
    MODIFY `Constraction` VARCHAR(550) NOT NULL,
    MODIFY `Occupancy` VARCHAR(550) NOT NULL,
    MODIFY `Boundaries` VARCHAR(550) NOT NULL,
    MODIFY `Mortgage` VARCHAR(550) NOT NULL,
    MODIFY `Warranties` VARCHAR(550) NOT NULL,
    ADD PRIMARY KEY (`PolicyNo`);

-- AlterTable
ALTER TABLE `mpolicy` MODIFY `PolicyNo` VARCHAR(255) NOT NULL,
    MODIFY `Account` VARCHAR(255) NOT NULL,
    MODIFY `Location` VARCHAR(255) NOT NULL,
    MODIFY `Vessel` VARCHAR(255) NOT NULL,
    MODIFY `AdditionalInfo` VARCHAR(255) NOT NULL,
    ADD PRIMARY KEY (`PolicyNo`);

-- AlterTable
ALTER TABLE `msprpolicy` ADD PRIMARY KEY (`PolicyNo`);

-- AlterTable
ALTER TABLE `papolicy` ADD PRIMARY KEY (`PolicyNo`);

-- AlterTable
ALTER TABLE `vpolicy` DROP PRIMARY KEY,
    ADD COLUMN `AOGPercent` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    ADD COLUMN `LocalGovTaxPercent` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    ADD COLUMN `TPLTypeSection_I_II` VARCHAR(191) NULL,
    MODIFY `PolicyNo` VARCHAR(255) NOT NULL,
    MODIFY `Account` VARCHAR(255) NULL,
    MODIFY `PolicyType` VARCHAR(255) NULL,
    MODIFY `CoverNo` VARCHAR(255) NULL,
    MODIFY `ORNo` VARCHAR(255) NULL,
    MODIFY `Model` VARCHAR(255) NULL,
    MODIFY `Make` VARCHAR(255) NULL,
    MODIFY `BodyType` VARCHAR(255) NULL,
    MODIFY `Color` VARCHAR(255) NULL,
    MODIFY `BLTFileNo` VARCHAR(255) NULL,
    MODIFY `PlateNo` VARCHAR(255) NULL,
    MODIFY `ChassisNo` VARCHAR(255) NULL,
    MODIFY `MotorNo` VARCHAR(255) NULL,
    MODIFY `AuthorizedCap` VARCHAR(255) NULL,
    MODIFY `UnladenWeight` VARCHAR(255) NULL,
    MODIFY `TPL` VARCHAR(255) NULL,
    MODIFY `Others` VARCHAR(255) NULL,
    MODIFY `Mortgagee` VARCHAR(255) NULL,
    MODIFY `Denomination` VARCHAR(255) NULL,
    ADD PRIMARY KEY (`PolicyNo`);

-- AlterTable
ALTER TABLE `words` ADD COLUMN `WORD_ID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`WORD_ID`);
