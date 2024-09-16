import express from "express";
import { DepositedCollections } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";

const DepositedCollection = express.Router();
const { CustomPrismaClient } = PrismaList();

DepositedCollection.post("/deposited-collection-report", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const { queryDeposit, queryJournal } = DepositedCollections(
      req.body.dateFormat,
      req.body.sub_acct.toUpperCase(),
      new Date(req.body.date),
      "Ascending"
    );

    console.log(queryDeposit);

    const dataDeposit: any = await prisma.$queryRawUnsafe(queryDeposit);
    const dataJournal: any = await prisma.$queryRawUnsafe(queryJournal);
    const summary: Array<any> = [];

    dataDeposit.push({
      Temp_SlipCntr: "",
      Temp_SlipDate: "",
      Temp_SlipCode: "",
      Date_Deposit: "",
      Slip_Code: "",
      Account_ID: "",
      IDNo: "",
      Bank: "",
      cCheck_No: "----- Nothing Follows -----",
      Debit: "",
      Credit: "",
      Ref_No: "",
      Type: "",
      Check_Date: "",
      Rpt: "",
      Account_Name: "",
      acct_name: "",
      follows: true,
    });

    const Debit = dataDeposit
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.Debit?.replace(/,/g, "")))) {
          num = parseFloat(item.Debit?.replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const Credit = dataDeposit
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.Credit?.replace(/,/g, "")))) {
          num = parseFloat(item.Credit?.replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    dataDeposit.push({
      Temp_SlipCntr: "",
      Temp_SlipDate: "",
      Temp_SlipCode: "",
      Date_Deposit: "",
      Slip_Code: "",
      Account_ID: "",
      IDNo: "",
      Bank: "",
      cCheck_No: "TOTAL :",
      Debit,
      Credit,
      Ref_No: "",
      Type: "",
      Check_Date: "",
      Rpt: "",
      Account_Name: "",
      acct_name: "",
      total: true,
    });

    summary.push({
      Temp_SlipCntr: "",
      Temp_SlipDate: "",
      Temp_SlipCode: "",
      Date_Deposit: "",
      Slip_Code: "",
      Account_ID: "",
      IDNo: "",
      Bank: "",
      cCheck_No: "",
      Debit: "",
      Credit: "",
      Ref_No: "",
      Type: "",
      Check_Date: "",
      Rpt: "",
      Account_Name: "",
      acct_name: "",
      summaryReport: true,
      summaryReportExtraHeight: 0,
    });

    summary.push({
      Temp_SlipCntr: "",
      Temp_SlipDate: "",
      Temp_SlipCode: "",
      Date_Deposit: "",
      Slip_Code: "",
      Account_ID: "",
      IDNo: "",
      Bank: "",
      cCheck_No: "",
      Debit: "",
      Credit: "",
      Ref_No: "",
      Type: "",
      Check_Date: "",
      Rpt: "",
      Account_Name: "",
      acct_name: "SUMMARY:",
      summary: true,
    });

    summary.push({
      Temp_SlipCntr: "",
      Temp_SlipDate: "",
      Temp_SlipCode: "",
      Date_Deposit: "",
      Slip_Code: "",
      Account_ID: "",
      IDNo: "ACCOUNT TITLE",
      Bank: "",
      cCheck_No: "",
      Debit: "DEBIT",
      Credit: "CREDIT",
      Ref_No: "",
      Type: "",
      Check_Date: "",
      Rpt: "",
      Account_Name: "",
      acct_name: "",
      summ: true,
      header: true,
    });

    dataJournal.forEach((itm: any) => {
      summary.push({
        Temp_SlipCntr: "",
        Temp_SlipDate: "",
        Temp_SlipCode: "",
        Date_Deposit: "",
        Slip_Code: "",
        Account_ID: "",
        IDNo: "",
        Bank: "",
        cCheck_No: "",
        Debit: itm.mDebit,
        Credit: itm.mCredit,
        Ref_No: "",
        Type: "",
        Check_Date: "",
        Rpt: "",
        Account_Name: "",
        acct_name: `${itm.GL_Acct} ${itm.Title}`,
        summ: true,
      });
    });

    const mDebit = dataJournal
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.mDebit.toString().replace(/,/g, "")))) {
          num = parseFloat(item.mDebit.toString().replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const mCredit = dataJournal
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.mCredit.toString().replace(/,/g, "")))) {
          num = parseFloat(item.mCredit.toString().replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    summary.push({
      Temp_SlipCntr: "",
      Temp_SlipDate: "",
      Temp_SlipCode: "",
      Date_Deposit: "",
      Slip_Code: "",
      Account_ID: "",
      IDNo: "",
      Bank: "TOTAL:",
      cCheck_No: "",
      Debit: mDebit,
      Credit: mCredit,
      Ref_No: "",
      Type: "",
      Check_Date: "",
      Rpt: "",
      Account_Name: "",
      acct_name: "",
      summ: true,
      footer: true,
    });
    summary.push({
      Temp_SlipCntr: "",
      Temp_SlipDate: "",
      Temp_SlipCode: "",
      Date_Deposit: "",
      Slip_Code: "",
      Account_ID: "",
      IDNo: "Prepared:",
      Bank: "Checked:",
      cCheck_No: "Approved:",
      Debit: "",
      Credit: "",
      Ref_No: "",
      Type: "",
      Check_Date: "",
      Rpt: "",
      Account_Name: "",
      acct_name: "",
      summ: true,
      signature: true,
    });

    let seen1 = new Set();
    let seen2 = new Set();

    dataDeposit.forEach((item: any) => {
      if (seen1.has(item.Temp_SlipCntr)) {
        item.Temp_SlipCntr = "";
        item.Temp_SlipDate = "";
      } else {
        seen1.add(item.Temp_SlipCntr);
        seen2.add(item.Temp_SlipDate);
      }
    });

    const report = dataDeposit.concat(summary);

    res.send({
      message: "Successfully Get Report",
      success: true,
      report,
      summary,
      queryDeposit,
      queryJournal,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      success: false,
      report: [],
    });
  }
});

DepositedCollection.post(
  "/deposited-collection-report-desk",
  async (req, res) => {
    try {
      const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

      const { queryDeposit, queryJournal } = DepositedCollections(
        req.body.dateFormat,
        req.body.sub_acct.toUpperCase(),
        new Date(req.body.date),
        "Ascending"
      );

      const data: any = await prisma.$queryRawUnsafe(queryDeposit);
      const summary: any = await prisma.$queryRawUnsafe(queryJournal);

      res.send({
        message: "Successfully Get Report",
        success: true,
        data,
        summary,
      });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        message: err.message,
        success: false,
        data: [],
        summary: [],
      });
    }
  }
);

export default DepositedCollection;
