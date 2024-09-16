import express from "express";
import ScheduleAccounts from "./schedule_account";
import SubsidiaryLedger from "./subsidiary_ledger";
import TrialBalance from "./trial_balance";
import IncomeStatement from "./income_statement";
import BalanceSheetLong from "./balance-sheet-long";
import GeneralLedger from "./general-ledger";
import AbstractCollection from "./abstract-collection";
import DepositedCollection from "./deposited-collection";
import ReturnChecksCollection from "./return-checks-collection";
import PostDatedCheckRegister from "./post-dated-check-registered";
import PettyCashFundDisbursements from "./petty-cash-fund-disbursement";
import CashDisbursementBookCDB from "./cash-disbursement-book-cdb";
import GeneralJournalBookGJB from "./general-journal-book-gjb";
import ProductionBookPB from "./production-book-pb";
import VatBookVB from "./vat-book-vb";
import AgingAccounts from "./aging-accounts";

const AccountingReport = express.Router();

AccountingReport.use("/accounting/", ScheduleAccounts);
AccountingReport.use("/accounting/", SubsidiaryLedger);
AccountingReport.use("/accounting/", TrialBalance);
AccountingReport.use("/accounting/", IncomeStatement);
AccountingReport.use("/accounting/", BalanceSheetLong);
AccountingReport.use("/accounting/", GeneralLedger);
AccountingReport.use("/accounting/", AbstractCollection);
AccountingReport.use("/accounting/", DepositedCollection);
AccountingReport.use("/accounting/", ReturnChecksCollection);
AccountingReport.use("/accounting/", PostDatedCheckRegister);
AccountingReport.use("/accounting/", PettyCashFundDisbursements);
AccountingReport.use("/accounting/", CashDisbursementBookCDB);
AccountingReport.use("/accounting/", GeneralJournalBookGJB);
AccountingReport.use("/accounting/", ProductionBookPB);
AccountingReport.use("/accounting/", VatBookVB);
AccountingReport.use("/accounting/", AgingAccounts);

export default AccountingReport;
