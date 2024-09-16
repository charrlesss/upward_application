import express from "express";
import { ReturnedChecksCollection } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";

const ReturnChecksCollection = express.Router();
const { CustomPrismaClient } = PrismaList();

ReturnChecksCollection.post("/return-checks-collection", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const qry = ReturnedChecksCollection(
      req.body.dateFormat,
      req.body.sub_acct.toUpperCase(),
      new Date(req.body.date),
      "Ascending"
    );

    const dataReturned: any = await prisma.$queryRawUnsafe(qry.queryReturned);
    const dataJournal: any = await prisma.$queryRawUnsafe(qry.queryJournal);
    const summary: Array<any> = [];

    const Debit = dataReturned
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.Debit?.toString()?.replace(/,/g, "")))) {
          num = parseFloat(item.Debit?.toString()?.replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    const Credit = dataReturned
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.Credit?.toString()?.replace(/,/g, "")))) {
          num = parseFloat(item.Credit?.toString()?.replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    summary.push({
      Date_Entry: "",
      Source_No: "",
      Explanation: "",
      GL_Acct: "",
      cGL_Acct: "",
      ID_No: "",
      cID_No: "",
      Check_No: "",
      Check_Bank: "",
      Check_Return: "",
      Check_Deposit: "",
      Check_Reason: "TOTAL :",
      Debit,
      Credit,
      Rpt: "",
      total: true,
    });

    summary.push({
      Date_Entry: "",
      Source_No: "",
      Explanation: "",
      GL_Acct: "",
      cGL_Acct: "",
      ID_No: "",
      cID_No: "",
      Check_No: "",
      Check_Bank: "",
      Check_Return: "",
      Check_Deposit: "",
      Check_Reason: "",
      Debit: "",
      Credit: "",
      Rpt: "",
      summaryReport: true,
      summaryReportExtraHeight: 0,
    });

    summary.push({
      Date_Entry: "",
      Source_No: "",
      Explanation: "",
      GL_Acct: "",
      cGL_Acct: "",
      ID_No: "",
      cID_No: "SUMMARY:",
      Check_No: "",
      Check_Bank: "",
      Check_Return: "",
      Check_Deposit: "",
      Check_Reason: "",
      Debit: "",
      Credit: "",
      Rpt: "",
      summary: true,
    });
    summary.push({
      Date_Entry: "",
      Source_No: "",
      Explanation: "",
      GL_Acct: "",
      cGL_Acct: "",
      ID_No: "",
      cID_No: "",
      Check_No: "",
      Check_Bank: "ACCOUNT TITLE:",
      Check_Return: "",
      Check_Deposit: "",
      Check_Reason: "",
      Debit: "DEBIT",
      Credit: "CREDIT",
      Rpt: "",
      summ: true,
      header: true,
    });
    dataJournal.forEach((itm: any) => {
      summary.push({
        Date_Entry: "",
        Source_No: "",
        Explanation: "",
        GL_Acct: "",
        cGL_Acct: "",
        ID_No: "",
        cID_No: "",
        Check_No: "",
        Check_Bank: `${itm.GL_Acct} ${itm.Title}`,
        Check_Return: "",
        Check_Deposit: "",
        Check_Reason: "",
        Debit: parseFloat(
          itm.mDebit?.toString().replace(/,/g, "")
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        Credit: parseFloat(
          itm.mCredit?.toString().replace(/,/g, "")
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        Rpt: "",
        summ: true,
      });
    });
    const mDebit = dataJournal
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.mDebit?.toString().replace(/,/g, "")))) {
          num = parseFloat(item.mDebit?.toString().replace(/,/g, ""));
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
        if (!isNaN(parseFloat(item.mCredit?.toString().replace(/,/g, "")))) {
          num = parseFloat(item.mCredit?.toString().replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    summary.push({
      Date_Entry: "",
      Source_No: "",
      Explanation: "",
      GL_Acct: "",
      cGL_Acct: "",
      ID_No: "",
      cID_No: "",
      Check_No: "",
      Check_Bank: "TOTAL:",
      Check_Return: "",
      Check_Deposit: "",
      Check_Reason: "",
      Debit: mDebit,
      Credit: mCredit,
      Rpt: "",
      summ: true,
      footer: true,
    });
    summary.push({
      Date_Entry: "",
      Source_No: "",
      Explanation: "",
      GL_Acct: "",
      cGL_Acct: "",
      ID_No: "",
      cID_No: "",
      Check_No: "Checked:",
      Check_Bank: "Prepared:",
      Check_Return: "Approved:",
      Check_Deposit: "",
      Check_Reason: "",
      Debit: "",
      Credit: "",
      Rpt: "",
      summ: true,
      signature: true,
    });
    let seen1 = new Set();
    let seen2 = new Set();

    summary.forEach((item: any) => {
      if (seen1.has(item.Source_No)) {
        item.Source_No = "";
        item.Date_Entry = "";
      } else {
        seen1.add(item.Source_No);
        seen2.add(item.Date_Entry);
      }
    });

    const report = dataReturned.concat(summary);
    res.send({
      message: "Successfully Get Report",
      success: true,
      report,
      summary,
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
ReturnChecksCollection.post("/return-checks-collection-desk", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const qry = ReturnedChecksCollection(
      req.body.dateFormat,
      req.body.sub_acct.toUpperCase(),
      new Date(req.body.date),
      "Ascending"
    );

    const data: any = await prisma.$queryRawUnsafe(qry.queryReturned);
    const summary: any = await prisma.$queryRawUnsafe(qry.queryJournal);
    console.log(qry.queryReturned)
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
});
export default ReturnChecksCollection;
