-- CreateTable
CREATE TABLE `policy_account` (
    `Account` VARCHAR(225) NOT NULL,
    `Description` TEXT NOT NULL,
    `AccountCode` VARCHAR(225) NOT NULL,
    `COM` BOOLEAN NOT NULL,
    `TPL` BOOLEAN NOT NULL,
    `MAR` BOOLEAN NOT NULL,
    `FIRE` BOOLEAN NOT NULL,
    `G02` BOOLEAN NOT NULL,
    `G13` BOOLEAN NOT NULL,
    `G16` BOOLEAN NOT NULL,
    `MSPR` BOOLEAN NOT NULL,
    `PA` BOOLEAN NOT NULL,
    `CGL` BOOLEAN NOT NULL,
    `Inactive` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `policy_account_Account_key`(`Account`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank` (
    `Bank_Code` VARCHAR(10) NOT NULL,
    `Bank` VARCHAR(50) NOT NULL,
    `Inactive` BOOLEAN NOT NULL,

    PRIMARY KEY (`Bank_Code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mortgagee` (
    `Policy` VARCHAR(100) NOT NULL,
    `Mortgagee` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `mortgagee_Mortgagee_key`(`Mortgagee`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subline` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Line` TEXT NOT NULL,
    `SublineName` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subline_line` (
    `LineId` VARCHAR(191) NOT NULL,
    `Line` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`LineId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rates` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Account` VARCHAR(250) NULL,
    `Line` VARCHAR(250) NULL,
    `Type` VARCHAR(250) NULL,
    `Rate` VARCHAR(250) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ctplregistration` (
    `ctplId` INTEGER NOT NULL AUTO_INCREMENT,
    `Prefix` VARCHAR(50) NULL,
    `NumSeriesFrom` INTEGER NULL,
    `NumSeriesTo` INTEGER NULL,
    `Cost` VARCHAR(150) NULL,
    `CreatedBy` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ctplType` VARCHAR(250) NULL,

    PRIMARY KEY (`ctplId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ctplprefix` (
    `prefixId` INTEGER NOT NULL AUTO_INCREMENT,
    `prefixName` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`prefixId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ctpltype` (
    `typeId` INTEGER NOT NULL AUTO_INCREMENT,
    `typeName` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`typeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vpolicy` (
    `PolicyNo` VARCHAR(20) NOT NULL,
    `Account` VARCHAR(20) NULL,
    `PolicyType` VARCHAR(4) NULL,
    `CoverNo` VARCHAR(10) NULL,
    `ORNo` VARCHAR(10) NULL,
    `DateFrom` DATETIME(6) NULL,
    `DateTo` DATETIME(6) NULL,
    `Model` VARCHAR(20) NULL,
    `Make` VARCHAR(100) NULL,
    `BodyType` VARCHAR(100) NULL,
    `Color` VARCHAR(20) NULL,
    `BLTFileNo` VARCHAR(20) NULL,
    `PlateNo` VARCHAR(10) NULL,
    `ChassisNo` VARCHAR(20) NULL,
    `MotorNo` VARCHAR(20) NULL,
    `AuthorizedCap` VARCHAR(10) NULL,
    `UnladenWeight` VARCHAR(10) NULL,
    `TPL` VARCHAR(100) NULL,
    `TPLLimit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `PremiumPaid` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `EstimatedValue` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Aircon` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Stereo` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Magwheels` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Others` VARCHAR(20) NULL,
    `OthersAmount` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Deductible` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Towing` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `RepairLimit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `BodilyInjury` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `PropertyDamage` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `PersonalAccident` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `SecI` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `SecIIPercent` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `ODamage` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Theft` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Sec4A` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Sec4B` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Sec4C` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `AOG` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `MortgageeForm` BOOLEAN NULL,
    `Mortgagee` VARCHAR(100) NULL,
    `Denomination` VARCHAR(150) NULL,

    PRIMARY KEY (`PolicyNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal` (
    `Branch_Code` VARCHAR(3) NULL,
    `Date_Entry` DATETIME(6) NULL,
    `Source_Type` VARCHAR(3) NULL,
    `Source_No` VARCHAR(50) NULL,
    `Explanation` LONGTEXT NULL,
    `Particulars` LONGTEXT NULL,
    `Payto` VARCHAR(500) NULL,
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
    `ID_No` VARCHAR(50) NULL,
    `cGL_Acct` VARCHAR(50) NULL,
    `cSub_Acct` VARCHAR(100) NULL,
    `cID_No` VARCHAR(500) NULL,
    `Debit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Credit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `TC` VARCHAR(3) NULL,
    `Remarks` LONGTEXT NULL,
    `AutoNo` BIGINT NOT NULL,
    `VAT_Type` VARCHAR(50) NULL,
    `OR_Invoice_No` VARCHAR(100) NULL,
    `VATItemNo` INTEGER NULL,

    PRIMARY KEY (`AutoNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bankaccounts` (
    `Account_No` VARCHAR(50) NULL,
    `Account_Name` VARCHAR(50) NULL,
    `Account_Type` VARCHAR(50) NULL,
    `Desc` VARCHAR(50) NULL,
    `Option` INTEGER NULL,
    `Account ID` VARCHAR(50) NULL,
    `Inactive` BOOLEAN NOT NULL,
    `Auto` INTEGER NOT NULL,
    `IDNo` VARCHAR(50) NULL,
    `Identity` VARCHAR(50) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booklet` (
    `Account` VARCHAR(20) NOT NULL,
    `DateEntry` VARCHAR(10) NOT NULL,
    `PolicyType` VARCHAR(4) NOT NULL,
    `PolicyBooklet` VARCHAR(4) NOT NULL,
    `PolicyNoFrom` VARCHAR(20) NOT NULL,
    `PolicyNoTo` VARCHAR(20) NOT NULL,
    `COCFrom` VARCHAR(20) NOT NULL,
    `COCTo` VARCHAR(20) NOT NULL,
    `ORFrom` VARCHAR(20) NOT NULL,
    `ORTo` VARCHAR(20) NOT NULL,
    `Done` BOOLEAN NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `books` (
    `Code` VARCHAR(5) NOT NULL,
    `Number` BIGINT NOT NULL,
    `Book Code` VARCHAR(5) NOT NULL,
    `Books Desc` VARCHAR(50) NOT NULL,
    `Hide Code` VARCHAR(5) NOT NULL,
    `Default` BOOLEAN NOT NULL,
    `Hide` BOOLEAN NOT NULL,

    PRIMARY KEY (`Code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bpolicy` (
    `PolicyNo` VARCHAR(20) NOT NULL,
    `Account` VARCHAR(20) NOT NULL,
    `PolicyType` VARCHAR(20) NULL,
    `Percentage` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `BidDate` DATETIME(6) NOT NULL,
    `BidTime` DATETIME(6) NOT NULL,
    `Obligee` VARCHAR(255) NOT NULL,
    `UnitDetail` VARCHAR(200) NOT NULL,
    `BondValue` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `NotaryName` VARCHAR(100) NOT NULL,
    `TaxCerNo` VARCHAR(20) NOT NULL,
    `IssuedLocation` VARCHAR(50) NOT NULL,
    `NIssued` DATETIME(6) NOT NULL,
    `CapacityAs` VARCHAR(20) NOT NULL,
    `TaxCerNoCorp` VARCHAR(20) NOT NULL,
    `IssuedLoctCorp` VARCHAR(50) NOT NULL,
    `CIssued` DATETIME(6) NOT NULL,
    `Officer` VARCHAR(100) NOT NULL DEFAULT '',
    `OPosition` VARCHAR(100) NOT NULL DEFAULT '',
    `Validity` VARCHAR(255) NOT NULL DEFAULT ''
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash disbursement` (
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
    `AutoNo` BIGINT NOT NULL,
    `VAT_Type` VARCHAR(50) NULL,
    `OR_Invoice_No` VARCHAR(100) NULL,
    `VATItemNo` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_breakdown` (
    `Slip_Code` VARCHAR(50) NULL,
    `Pap_1000` INTEGER NULL,
    `Pap_500` INTEGER NULL,
    `Pap_100` INTEGER NULL,
    `Pap_50` INTEGER NULL,
    `Pap_20` INTEGER NULL,
    `Pap_10` INTEGER NULL,
    `Pap_5` INTEGER NULL,
    `Coin_5` INTEGER NULL,
    `Coin_2` INTEGER NULL,
    `Coin_1` INTEGER NULL,
    `Cnt_50` INTEGER NULL,
    `Cnt_25` INTEGER NULL,
    `Cnt_10` INTEGER NULL,
    `Cnt_05` INTEGER NULL,
    `Cnt_01` INTEGER NULL,
    `Pap_200` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cglpolicy` (
    `PolicyNo` VARCHAR(20) NOT NULL,
    `Account` VARCHAR(100) NOT NULL,
    `PeriodFrom` DATETIME(6) NOT NULL,
    `PeriodTo` DATETIME(6) NOT NULL,
    `Location` VARCHAR(255) NOT NULL,
    `LimitA` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `LimitB` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chart account` (
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

-- CreateTable
CREATE TABLE `closed` (
    `FStatement` VARCHAR(20) NOT NULL,
    `Date_Time` DATETIME(6) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collection` (
    `Date` DATETIME(6) NULL,
    `ORNo` VARCHAR(50) NULL,
    `IDNo` VARCHAR(50) NULL,
    `Name` VARCHAR(500) NULL,
    `Payment` VARCHAR(50) NULL,
    `Bank` VARCHAR(150) NULL,
    `Check_Date` DATETIME(6) NULL,
    `Check_No` VARCHAR(50) NULL,
    `DRCode` VARCHAR(50) NULL,
    `DRTitle` VARCHAR(50) NULL,
    `DRRemarks` LONGTEXT NULL,
    `Debit` DECIMAL(19, 4) NULL,
    `Purpose` LONGTEXT NULL,
    `CRCode` VARCHAR(50) NULL,
    `CRTitle` VARCHAR(50) NULL,
    `Credit` DECIMAL(19, 4) NULL,
    `CRRemarks` LONGTEXT NULL,
    `ID_No` VARCHAR(50) NULL,
    `Official_Receipt` VARCHAR(50) NULL,
    `Temp_OR` VARCHAR(50) NULL,
    `Date_OR` DATETIME(6) NULL,
    `Short` VARCHAR(500) NULL,
    `SlipCode` VARCHAR(50) NULL,
    `Status` VARCHAR(50) NULL,
    `CRLoanID` VARCHAR(50) NULL,
    `CRLoanName` VARCHAR(150) NULL,
    `CRRemarks2` LONGTEXT NULL,
    `CRVATType` VARCHAR(50) NULL,
    `CRInvoiceNo` VARCHAR(100) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company` (
    `Branch_Code` VARCHAR(3) NOT NULL,
    `Branch_Name` VARCHAR(100) NOT NULL,
    `Location_Code` VARCHAR(3) NOT NULL,
    `Location_Name` VARCHAR(100) NOT NULL,
    `Series_Code` VARCHAR(3) NOT NULL,
    `Company_Code` VARCHAR(3) NOT NULL,
    `Company_Name` VARCHAR(100) NOT NULL,
    `Address` VARCHAR(255) NOT NULL,
    `Contact` VARCHAR(20) NOT NULL,
    `Email` VARCHAR(50) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company list` (
    `CompanyCode` VARCHAR(8) NOT NULL,
    `Company` VARCHAR(100) NOT NULL,
    `ShortName` VARCHAR(50) NOT NULL,
    `Inactive` BOOLEAN NOT NULL,

    PRIMARY KEY (`CompanyCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deposit` (
    `Date_Deposit` DATETIME(6) NULL,
    `Slip_Code` VARCHAR(50) NULL,
    `Account ID` VARCHAR(50) NULL,
    `Account Name` VARCHAR(250) NULL,
    `Debit` DECIMAL(19, 4) NULL,
    `Credit` DECIMAL(19, 4) NULL,
    `Check_Date` VARCHAR(50) NULL,
    `Check_No` VARCHAR(50) NULL,
    `Check_Ctr` VARCHAR(50) NULL,
    `Check_Remarks` VARCHAR(50) NULL,
    `Bank` VARCHAR(150) NULL,
    `Type` VARCHAR(50) NULL,
    `Ref_No` VARCHAR(50) NULL,
    `IDNo` VARCHAR(250) NULL,
    `Temp_SlipCode` VARCHAR(50) NULL,
    `Temp_SlipCntr` VARCHAR(50) NULL,
    `Temp_SlipDate` DATETIME(6) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deposit slip` (
    `Date` DATETIME(6) NULL,
    `SlipCode` VARCHAR(50) NULL,
    `Slip` VARCHAR(250) NULL,
    `BankAccount` VARCHAR(250) NULL,
    `AccountName` VARCHAR(250) NULL,
    `CheckDeposit` DECIMAL(19, 4) NULL,
    `CashDeposit` DECIMAL(19, 4) NULL,
    `IDNo` VARCHAR(250) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dtproperties` (
    `id` INTEGER NOT NULL,
    `objectid` INTEGER NULL,
    `property` VARCHAR(64) NOT NULL,
    `value` VARCHAR(255) NULL,
    `uvalue` VARCHAR(255) NULL,
    `lvalue` LONGBLOB NULL,
    `version` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`, `property`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `endorsement` (
    `EndorseNo` VARCHAR(20) NOT NULL,
    `PolicyNo` VARCHAR(20) NOT NULL,
    `DateEndorse` DATETIME(6) NOT NULL,
    `Title` VARCHAR(50) NOT NULL,
    `TPLLimit` DECIMAL(19, 4) NOT NULL,
    `PremiumPaid` DECIMAL(19, 4) NOT NULL,
    `Aircon` DECIMAL(19, 4) NOT NULL,
    `Stereo` DECIMAL(19, 4) NOT NULL,
    `Magwheels` DECIMAL(19, 4) NOT NULL,
    `AOG` DECIMAL(19, 4) NOT NULL,
    `Deductible` DECIMAL(19, 4) NOT NULL,
    `Towing` DECIMAL(19, 4) NOT NULL,
    `RepairLimit` DECIMAL(19, 4) NOT NULL,
    `EstimatedValue` DECIMAL(19, 4) NOT NULL,
    `BodilyInjury` DECIMAL(19, 4) NOT NULL,
    `PropertyDamage` DECIMAL(19, 4) NOT NULL,
    `PersonalAccident` DECIMAL(19, 4) NOT NULL,
    `SecIIPercent` DECIMAL(19, 4) NOT NULL,
    `Sec4A` DECIMAL(19, 4) NOT NULL,
    `Sec4B` DECIMAL(19, 4) NOT NULL,
    `Sec4C` DECIMAL(19, 4) NOT NULL,
    `ODamage` DECIMAL(19, 4) NOT NULL,
    `Shortname` VARCHAR(100) NOT NULL,
    `Address` VARCHAR(250) NOT NULL,
    `Model` VARCHAR(50) NOT NULL,
    `Make` VARCHAR(50) NOT NULL,
    `BodyType` VARCHAR(50) NOT NULL,
    `Color` VARCHAR(50) NOT NULL,
    `PlateNo` VARCHAR(50) NOT NULL,
    `ChassisNo` VARCHAR(50) NOT NULL,
    `MotorNo` VARCHAR(50) NOT NULL,
    `AuthorizedCap` VARCHAR(50) NOT NULL,
    `UnladenWeight` VARCHAR(50) NOT NULL,
    `Mortgagee` VARCHAR(100) NOT NULL,
    `MortgageeClause` VARCHAR(250) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fpolicy` (
    `PolicyNo` VARCHAR(20) NOT NULL,
    `Account` VARCHAR(20) NOT NULL,
    `DateFrom` DATETIME(6) NOT NULL,
    `DateTo` DATETIME(6) NOT NULL,
    `BillNo` VARCHAR(50) NOT NULL,
    `Percentage` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `Location` VARCHAR(100) NOT NULL,
    `InsuredValue` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `PropertyInsured` VARCHAR(255) NOT NULL,
    `Constraction` VARCHAR(3000) NOT NULL,
    `Occupancy` VARCHAR(255) NOT NULL,
    `Boundaries` VARCHAR(3000) NOT NULL,
    `Mortgage` VARCHAR(255) NOT NULL,
    `Warranties` VARCHAR(3000) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `holidays` (
    `ID` INTEGER NOT NULL,
    `Name` VARCHAR(250) NULL,
    `Date` DATE NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `id entry` (
    `IDNo` VARCHAR(20) NOT NULL,
    `IDType` VARCHAR(12) NOT NULL,
    `Sub_Acct` VARCHAR(3) NOT NULL,
    `Firstname` VARCHAR(100) NOT NULL,
    `Middle` VARCHAR(100) NOT NULL,
    `Lastname` VARCHAR(100) NOT NULL,
    `Individual` BOOLEAN NOT NULL,
    `UnitNo` VARCHAR(300) NOT NULL DEFAULT '',
    `Street` VARCHAR(100) NOT NULL DEFAULT '',
    `City` VARCHAR(100) NOT NULL DEFAULT '',
    `Address` VARCHAR(500) NOT NULL,
    `Contact` VARCHAR(20) NOT NULL,
    `Shortname` VARCHAR(150) NOT NULL,
    `Inactive` BOOLEAN NOT NULL,
    `TINNo` VARCHAR(50) NULL,
    `VatType` VARCHAR(50) NULL,

    PRIMARY KEY (`IDNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal partial` (
    `Branch_Code` VARCHAR(3) NULL,
    `Date_Entry` DATETIME(6) NULL,
    `Source_Type` VARCHAR(3) NULL,
    `Source_No` VARCHAR(10) NULL,
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
    `Remarks` VARCHAR(255) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal voucher` (
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
    `AutoNo` BIGINT NOT NULL,
    `VAT_Type` VARCHAR(50) NULL,
    `OR_Invoice_No` VARCHAR(100) NULL,
    `VATItemNo` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal voucher2` (
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
    `AutoNo` BIGINT NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal2` (
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
    `AutoNo` BIGINT NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal3` (
    `Branch_Code` VARCHAR(3) NULL,
    `Date_Entry` DATETIME(6) NULL,
    `Source_Type` VARCHAR(3) NULL,
    `Source_No` VARCHAR(20) NULL,
    `Explanation` LONGTEXT NULL,
    `Particulars` LONGTEXT NULL,
    `Payto` VARCHAR(500) NULL,
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
    `cID_No` VARCHAR(500) NULL,
    `Debit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `Credit` DECIMAL(19, 4) NULL DEFAULT 0.0000,
    `TC` VARCHAR(3) NULL,
    `Remarks` LONGTEXT NULL,
    `AutoNo` BIGINT NOT NULL,
    `VAT_Type` VARCHAR(50) NULL,
    `OR_Invoice_No` VARCHAR(100) NULL,
    `VATItemNo` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ledger` (
    `PolicyNo` VARCHAR(20) NOT NULL,
    `Agent` VARCHAR(100) NOT NULL,
    `Commision` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,

    PRIMARY KEY (`PolicyNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mpolicy` (
    `PolicyNo` VARCHAR(20) NOT NULL,
    `Account` VARCHAR(20) NOT NULL,
    `Location` VARCHAR(100) NOT NULL,
    `DateFrom` DATETIME(6) NOT NULL,
    `DateTo` DATETIME(6) NOT NULL,
    `PointOfOrigin` VARCHAR(500) NOT NULL,
    `PointofDestination` VARCHAR(500) NOT NULL,
    `Vessel` VARCHAR(100) NOT NULL,
    `AdditionalInfo` VARCHAR(100) NOT NULL,
    `SubjectInsured` VARCHAR(255) NOT NULL,
    `Consignee` VARCHAR(255) NOT NULL,
    `InsuredValue` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `Percentage` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `msprpolicy` (
    `PolicyNo` VARCHAR(20) NOT NULL,
    `Account` VARCHAR(100) NOT NULL,
    `PeriodFrom` DATETIME(6) NOT NULL,
    `PeriodTo` DATETIME(6) NOT NULL,
    `Location` VARCHAR(255) NOT NULL,
    `Saferoom` VARCHAR(255) NOT NULL,
    `OriginPoint` VARCHAR(255) NOT NULL,
    `DestinationPoint` VARCHAR(255) NOT NULL,
    `Method` VARCHAR(255) NOT NULL,
    `Guard` SMALLINT NOT NULL,
    `Messenger` SMALLINT NOT NULL,
    `SecI` DECIMAL(19, 4) NOT NULL,
    `SecIPremium` DECIMAL(19, 4) NOT NULL,
    `SecIB` DECIMAL(19, 4) NOT NULL,
    `SecIPremiumB` DECIMAL(19, 4) NOT NULL,
    `SecII` DECIMAL(19, 4) NOT NULL,
    `SecIIPremium` DECIMAL(19, 4) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `papolicy` (
    `PolicyNo` VARCHAR(20) NOT NULL,
    `Account` VARCHAR(100) NOT NULL,
    `PeriodFrom` DATETIME(6) NOT NULL,
    `PeriodTo` DATETIME(6) NOT NULL,
    `Location` VARCHAR(255) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pdc` (
    `Ref_No` VARCHAR(50) NULL,
    `PNo` VARCHAR(50) NULL,
    `IDNo` VARCHAR(50) NULL,
    `Date` DATETIME(6) NULL,
    `Name` VARCHAR(250) NULL,
    `Remarks` VARCHAR(250) NULL,
    `Bank` VARCHAR(250) NULL,
    `Branch` VARCHAR(50) NULL,
    `Check_Date` DATETIME(6) NULL,
    `Check_No` VARCHAR(50) NULL,
    `Check_Amnt` DECIMAL(19, 4) NULL,
    `Check_Remarks` VARCHAR(50) NULL,
    `SlipCode` VARCHAR(50) NULL,
    `DateDepo` DATETIME(6) NULL,
    `ORNum` VARCHAR(50) NULL,
    `PDC Status` VARCHAR(150) NULL,
    `Date Stored` DATETIME(6) NULL,
    `Date Endorsed` DATETIME(6) NULL,
    `Date Pulled Out` DATETIME(6) NULL,
    `PDC Remarks` VARCHAR(250) NULL,
    `mark` VARCHAR(50) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `petty cash` (
    `Branch_Code` VARCHAR(3) NULL,
    `PC_Date` DATETIME(6) NULL,
    `PC_No` VARCHAR(20) NULL,
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
    `VATItemNo` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `petty log` (
    `Purpose` VARCHAR(100) NOT NULL,
    `Acct_Code` VARCHAR(10) NOT NULL,
    `Short` VARCHAR(50) NOT NULL,
    `Inactive` BOOLEAN NOT NULL,

    PRIMARY KEY (`Purpose`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `policy` (
    `IDNo` VARCHAR(20) NOT NULL,
    `Account` VARCHAR(20) NOT NULL,
    `SubAcct` VARCHAR(20) NOT NULL DEFAULT '',
    `PolicyType` VARCHAR(20) NULL,
    `PolicyNo` VARCHAR(20) NOT NULL,
    `DateIssued` DATETIME(6) NOT NULL,
    `TotalPremium` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `Vat` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `DocStamp` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `FireTax` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `LGovTax` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `Notarial` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `Misc` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `TotalDue` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `ExtraDebit` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `ExtraCredit` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `Payment1` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `Payment2` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `Payment3` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `TotalPaid` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `Discount` DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    `Journal` BOOLEAN NOT NULL,
    `Cancelled` BOOLEAN NOT NULL DEFAULT false,
    `Remarks` VARCHAR(255) NOT NULL DEFAULT '',
    `AgentID` VARCHAR(100) NULL,
    `AgentCom` DECIMAL(19, 4) NULL,
    `Remitted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`PolicyNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postponement` (
    `RPCDNo` VARCHAR(30) NOT NULL,
    `PNNo` VARCHAR(30) NULL,
    `HoldingFees` DECIMAL(16, 2) NULL,
    `PenaltyCharge` DECIMAL(16, 2) NULL,
    `Surplus` DECIMAL(18, 2) NULL,
    `Deducted_to` VARCHAR(150) NULL,
    `PaidVia` VARCHAR(50) NULL,
    `PaidInfo` VARCHAR(250) NULL,
    `Date` DATE NULL,
    `Status` VARCHAR(30) NULL,
    `Branch` VARCHAR(30) NULL,
    `Prepared_by` VARCHAR(50) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postponement_auth_codes` (
    `RPCD` VARCHAR(50) NULL,
    `For_User` VARCHAR(500) NULL,
    `Approved_Code` VARCHAR(50) NULL,
    `Disapproved_Code` VARCHAR(50) NULL,
    `Used_By` VARCHAR(50) NULL,
    `Used_DateTime` DATE NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postponement_detail` (
    `RPCDNo` VARCHAR(30) NOT NULL,
    `CheckNo` VARCHAR(30) NOT NULL,
    `OldCheckDate` DATE NULL,
    `NewCheckDate` DATE NULL,
    `Reason` VARCHAR(250) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production` (
    `PNNo` VARCHAR(255) NULL,
    `IDNo` VARCHAR(255) NULL,
    `Short` VARCHAR(100) NULL,
    `Insurance` VARCHAR(255) NULL,
    `InsuranceName` VARCHAR(255) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pullout_auth_codes` (
    `RCPN` VARCHAR(50) NULL,
    `For_User` VARCHAR(500) NULL,
    `Approved_Code` VARCHAR(50) NULL,
    `Disapproved_Code` VARCHAR(50) NULL,
    `Used_By` VARCHAR(50) NULL,
    `Used_DateTime` DATE NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pullout_request` (
    `RCPNo` VARCHAR(30) NOT NULL,
    `PNNo` VARCHAR(30) NULL,
    `Reason` VARCHAR(100) NULL,
    `Status` VARCHAR(30) NULL,
    `Branch` VARCHAR(30) NULL,
    `Requested_By` VARCHAR(30) NULL,
    `Requested_Date` DATETIME(6) NULL,
    `Approved_By` VARCHAR(30) NULL,
    `Approved_Date` DATETIME(6) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pullout_request_details` (
    `RCPNo` VARCHAR(30) NULL,
    `CheckNo` VARCHAR(50) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reportset` (
    `Report Settings` VARCHAR(50) NOT NULL,
    `Set Option` VARCHAR(50) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resavelog` (
    `RecordNo` VARCHAR(500) NOT NULL,
    `RecordTable` VARCHAR(500) NOT NULL,
    `Username` VARCHAR(200) NOT NULL,
    `DateModified` DATETIME(6) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `return checks` (
    `Area` VARCHAR(255) NULL,
    `RC_Date` DATETIME(6) NULL,
    `RC_No` VARCHAR(50) NULL,
    `Explanation` VARCHAR(255) NULL,
    `Check No` VARCHAR(255) NULL,
    `Date Deposit` DATETIME(6) NULL,
    `Date Collect` DATETIME(6) NULL,
    `Amount` DECIMAL(19, 4) NULL,
    `Reason` VARCHAR(50) NULL,
    `Bank` VARCHAR(50) NULL,
    `Check Date` VARCHAR(50) NULL,
    `Date Return` VARCHAR(50) NULL,
    `SlipCode` VARCHAR(50) NULL,
    `ORNum` VARCHAR(50) NULL,
    `BankAccnt` VARCHAR(50) NULL,
    `nSort` VARCHAR(50) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sysdiagrams` (
    `name` VARCHAR(160) NOT NULL,
    `principal_id` INTEGER NOT NULL,
    `diagram_id` INTEGER NOT NULL,
    `version` INTEGER NULL,
    `definition` LONGBLOB NULL,

    UNIQUE INDEX `UK_principal_name`(`principal_id`, `name`),
    PRIMARY KEY (`diagram_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `table1` (
    `IDNo` VARCHAR(20) NOT NULL,
    `IDType` VARCHAR(12) NOT NULL,
    `Sub_Acct` VARCHAR(3) NOT NULL,
    `Firstname` VARCHAR(100) NOT NULL,
    `Middle` VARCHAR(2) NOT NULL,
    `Lastname` VARCHAR(25) NULL,
    `Individual` BOOLEAN NOT NULL,
    `UnitNo` VARCHAR(300) NOT NULL DEFAULT '',
    `Street` VARCHAR(100) NOT NULL DEFAULT '',
    `City` VARCHAR(100) NOT NULL DEFAULT '',
    `Address` VARCHAR(500) NOT NULL,
    `Contact` VARCHAR(20) NOT NULL,
    `Shortname` VARCHAR(150) NOT NULL,
    `Inactive` BOOLEAN NOT NULL,

    PRIMARY KEY (`IDNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_accrual_request` (
    `ReqId` VARCHAR(50) NULL,
    `Nature` VARCHAR(1000) NULL,
    `Acct_Code` VARCHAR(500) NULL,
    `Date_From` DATE NULL,
    `Date_To` DATE NULL,
    `Amount` DECIMAL(19, 4) NULL,
    `VAT` VARCHAR(50) NULL,
    `C_ID` VARCHAR(50) NULL,
    `Req_By` VARCHAR(50) NULL,
    `Req_Date` DATETIME(6) NULL,
    `Req_Status` VARCHAR(50) NULL,
    `Approved_By` VARCHAR(50) NULL,
    `Approved_Date` DATETIME(6) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_accrual_request_income` (
    `ReqId` VARCHAR(50) NULL,
    `Nature` VARCHAR(1000) NULL,
    `Acct_Code` VARCHAR(500) NULL,
    `Date_From` DATE NULL,
    `Date_To` DATE NULL,
    `NetAmount` DECIMAL(19, 4) NULL,
    `GrossAmount` DECIMAL(19, 4) NULL,
    `VAT` VARCHAR(50) NULL,
    `C_ID` VARCHAR(50) NULL,
    `Req_By` VARCHAR(50) NULL,
    `Req_Date` DATETIME(6) NULL,
    `Req_Status` VARCHAR(50) NULL,
    `Approved_By` VARCHAR(50) NULL,
    `Approved_Date` DATETIME(6) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction code` (
    `Code` VARCHAR(3) NOT NULL,
    `Description` VARCHAR(100) NOT NULL,
    `Acct_Code` VARCHAR(10) NOT NULL,
    `Inactive` BOOLEAN NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `words` (
    `Wordings` VARCHAR(20) NOT NULL,
    `SType` BOOLEAN NOT NULL,
    `Phrase` VARCHAR(8000) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `xid_entry` (
    `ID` VARCHAR(255) NULL,
    `ID_No` VARCHAR(255) NULL,
    `cID_No` VARCHAR(255) NULL,
    `Sub_Acct` VARCHAR(255) NULL,
    `cSub_Acct` VARCHAR(255) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `xsubsidiary` (
    `Date_Entry` DATETIME(6) NULL,
    `Sort_Number` DOUBLE NULL,
    `Source_Type` VARCHAR(20) NULL,
    `Source_No` VARCHAR(20) NULL,
    `Explanation` VARCHAR(255) NULL,
    `Particulars` VARCHAR(255) NULL,
    `Payto` VARCHAR(100) NULL,
    `Address` VARCHAR(100) NULL,
    `Check_Date` DATETIME(6) NULL,
    `Check_No` VARCHAR(100) NULL,
    `Check_Bank` VARCHAR(100) NULL,
    `GL_Acct` VARCHAR(10) NULL,
    `Sub_Acct` VARCHAR(25) NULL,
    `ID_No` VARCHAR(25) NULL,
    `cGL_Acct` VARCHAR(150) NULL,
    `cSub_Acct` VARCHAR(150) NULL,
    `cID_No` VARCHAR(150) NULL,
    `Debit` DECIMAL(19, 4) NULL,
    `Credit` DECIMAL(19, 4) NULL,
    `Bal` DECIMAL(19, 4) NULL,
    `Balance` DECIMAL(19, 4) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_details` (
    `contact_details_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(225) NOT NULL DEFAULT '',
    `mobile` VARCHAR(225) NOT NULL DEFAULT '',
    `telephone` VARCHAR(225) NOT NULL DEFAULT '',

    PRIMARY KEY (`contact_details_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry_agent` (
    `entry_agent_id` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(225) NOT NULL DEFAULT '',
    `lastname` VARCHAR(225) NOT NULL DEFAULT '',
    `middlename` VARCHAR(225) NOT NULL DEFAULT '',
    `address` TEXT NOT NULL,
    `agent_contact_details_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Entry_Agent_agent_contact_details_id_key`(`agent_contact_details_id`),
    PRIMARY KEY (`entry_agent_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry_client` (
    `entry_client_id` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(225) NOT NULL DEFAULT '',
    `lastname` VARCHAR(225) NOT NULL DEFAULT '',
    `middlename` VARCHAR(225) NOT NULL DEFAULT '',
    `company` VARCHAR(225) NOT NULL DEFAULT '',
    `address` VARCHAR(225) NOT NULL DEFAULT '',
    `option` VARCHAR(225) NOT NULL DEFAULT '',
    `sub_account` VARCHAR(225) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `client_contact_details_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Entry_Client_client_contact_details_id_key`(`client_contact_details_id`),
    PRIMARY KEY (`entry_client_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry_employee` (
    `entry_employee_id` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(225) NOT NULL DEFAULT '',
    `middlename` VARCHAR(225) NOT NULL DEFAULT '',
    `lastname` VARCHAR(225) NOT NULL DEFAULT '',
    `sub_account` VARCHAR(225) NOT NULL DEFAULT '',
    `address` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`entry_employee_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry_fixed_assets` (
    `entry_fixed_assets_id` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `remarks` TEXT NOT NULL,
    `fullname` VARCHAR(225) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`entry_fixed_assets_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry_others` (
    `entry_others_id` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`entry_others_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry_supplier` (
    `entry_supplier_id` VARCHAR(191) NOT NULL,
    `supplier_contact_details_id` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(225) NOT NULL DEFAULT '',
    `lastname` VARCHAR(225) NOT NULL DEFAULT '',
    `middlename` VARCHAR(225) NOT NULL DEFAULT '',
    `company` VARCHAR(225) NOT NULL DEFAULT '',
    `address` VARCHAR(225) NOT NULL DEFAULT '',
    `VAT_Type` VARCHAR(225) NOT NULL DEFAULT '',
    `option` VARCHAR(225) NOT NULL DEFAULT '',
    `tin_no` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Entry_Supplier_supplier_contact_details_id_key`(`supplier_contact_details_id`),
    PRIMARY KEY (`entry_supplier_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `id_sequence` (
    `seq_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `last_count` VARCHAR(100) NOT NULL,
    `year` VARCHAR(2) NOT NULL,
    `month` VARCHAR(2) NOT NULL,

    UNIQUE INDEX `Id_Sequence_type_key`(`type`),
    PRIMARY KEY (`seq_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_account` (
    `Sub_Acct` VARCHAR(191) NOT NULL,
    `Description` TEXT NOT NULL,
    `ShortName` VARCHAR(225) NOT NULL,
    `Acronym` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Sub_Acct`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `UserId` VARCHAR(191) NOT NULL,
    `Username` VARCHAR(50) NOT NULL,
    `Password` VARCHAR(500) NOT NULL,
    `AccountType` ENUM('PRODUCTION', 'ACCOUNTING', 'ADMIN') NOT NULL,
    `REFRESH_TOKEN` TEXT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Users_Username_key`(`Username`),
    PRIMARY KEY (`UserId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `entry_agent` ADD CONSTRAINT `Entry_Agent_agent_contact_details_id_fkey` FOREIGN KEY (`agent_contact_details_id`) REFERENCES `contact_details`(`contact_details_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry_client` ADD CONSTRAINT `Entry_Client_client_contact_details_id_fkey` FOREIGN KEY (`client_contact_details_id`) REFERENCES `contact_details`(`contact_details_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry_supplier` ADD CONSTRAINT `Entry_Supplier_supplier_contact_details_id_fkey` FOREIGN KEY (`supplier_contact_details_id`) REFERENCES `contact_details`(`contact_details_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
