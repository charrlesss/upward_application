import express from "express";
import { AbstractCollections } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";
const AbstractCollection = express.Router();
const { CustomPrismaClient } = PrismaList();

AbstractCollection.post("/abstract-collection-report", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const { queryCollection, queryJournal } = AbstractCollections(
      req.body.dateFormat,
      req.body.sub_acct.toUpperCase(),
      new Date(req.body.date),
      "Ascending"
    );
    console.log(queryCollection , "=============== sdasd");
    console.log(queryJournal , "=============== dddd");

    const dataCollection: any = await prisma.$queryRawUnsafe(queryCollection);
    const dataJournal: any = await prisma.$queryRawUnsafe(queryJournal);
    const summary: Array<any> = [];

    dataCollection.push({
      Date: "",
      ORNo: "",
      IDNo: "",
      cName: "",
      Bank: "",
      cCheck_No: "----- Nothing Follows -----",
      DRCode: "",
      Debit: "",
      DRTitle: "",
      CRCode: "",
      Credit: "",
      CRTitle: "",
      Purpose: "",
      CRRemarks: "",
      Official_Receipt: "",
      Temp_OR: "",
      Date_OR: "",
      Rpt: "",
      Status: "",
      follows: true,
    });

    const Debit = dataCollection
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.Debit.replace(/,/g, "")))) {
          num = parseFloat(item.Debit.replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const Credit = dataCollection
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.Credit.replace(/,/g, "")))) {
          num = parseFloat(item.Credit.replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    dataCollection.push({
      Date: "",
      ORNo: "",
      IDNo: "",
      cName: "",
      Bank: "TOTAL :",
      cCheck_No: "",
      DRCode: "",
      Debit,
      DRTitle: "",
      CRCode: "",
      Credit,
      CRTitle: "",
      Purpose: "",
      CRRemarks: "",
      Official_Receipt: "",
      Temp_OR: "",
      Date_OR: "",
      Rpt: "",
      Status: "",
      total: true,
    });

    summary.push({
      Date: "",
      ORNo: "",
      IDNo: "",
      cName: "",
      Bank: "",
      cCheck_No: "",
      DRCode: "",
      Debit: "",
      DRTitle: "",
      CRCode: "",
      Credit: "",
      CRTitle: "",
      Purpose: "",
      CRRemarks: "",
      Official_Receipt: "",
      Temp_OR: "",
      Date_OR: "",
      Rpt: "",
      Status: "",
      summaryReport: true,
      summaryReportExtraHeight: 0,
    });

    summary.push({
      Date: "",
      ORNo: "",
      IDNo: "",
      cName: "SUMMARY:",
      Bank: "",
      cCheck_No: "",
      DRCode: "",
      Debit: "",
      DRTitle: "",
      CRCode: "",
      Credit: "",
      CRTitle: "",
      Purpose: "",
      CRRemarks: "",
      Official_Receipt: "",
      Temp_OR: "",
      Date_OR: "",
      Rpt: "",
      Status: "",
      summary: true,
    });

    summary.push({
      Date: "",
      ORNo: "ACCOUNT TITLE",
      IDNo: "",
      cName: "",
      Bank: "",
      cCheck_No: "",
      DRCode: "",
      Debit: "",
      DRTitle: "",
      CRCode: "",
      Credit: "",
      CRTitle: "",
      Purpose: "DEBIT",
      CRRemarks: "CREDIT",
      Official_Receipt: "",
      Temp_OR: "",
      Date_OR: "",
      Rpt: "",
      Status: "",
      summ: true,
      header: true,
    });

    dataJournal.forEach((itm: any) => {
      summary.push({
        Date: "",
        ORNo: "",
        IDNo: "",
        cName: "",
        Bank: "",
        cCheck_No: "",
        DRCode: "",
        Debit: itm.mDebit,
        DRTitle: "",
        CRCode: "",
        Credit: itm.mCredit,
        CRTitle: "",
        Purpose: "",
        CRRemarks: "",
        Official_Receipt: "",
        Temp_OR: "",
        Date_OR: "",
        Rpt: "",
        Status: "",
        GL_Acct: itm.GL_Acct,
        Title: itm.Title,
        summ: true,
      });
    });

    const mDebit = dataJournal
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.mDebit.replace(/,/g, "")))) {
          num = parseFloat(item.mDebit.replace(/,/g, ""));
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
        if (!isNaN(parseFloat(item.mCredit.replace(/,/g, "")))) {
          num = parseFloat(item.mCredit.replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    summary.push({
      Date: "",
      ORNo: "TOTAL:",
      IDNo: "",
      cName: "",
      Bank: "",
      cCheck_No: "",
      DRCode: "",
      Debit: mDebit,
      DRTitle: "",
      CRCode: "",
      Credit: mCredit,
      CRTitle: "",
      Purpose: "",
      CRRemarks: "",
      Official_Receipt: "",
      Temp_OR: "",
      Date_OR: "",
      Rpt: "",
      Status: "",
      summ: true,
      footer: true,
    });
    summary.push({
      Date: "Prepared:",
      ORNo: "Checked:",
      IDNo: "Approved:",
      cName: "",
      Bank: "",
      cCheck_No: "",
      DRCode: "",
      Debit: "",
      DRTitle: "",
      CRCode: "",
      Credit: "",
      CRTitle: "",
      Purpose: "",
      CRRemarks: "",
      Official_Receipt: "",
      Temp_OR: "",
      Date_OR: "",
      Rpt: "",
      Status: "",
      summ: true,
      signature: true,
    });

    const report = dataCollection.concat(summary);
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

AbstractCollection.post("/abstract-collection-report-desk", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    console.log(req.cookies["up-dpm-login"]);

    const { queryCollection, queryJournal } = AbstractCollections(
      req.body.dateFormat,
      req.body.sub_acct.toUpperCase(),
      new Date(req.body.date),
      "Ascending"
    );


    const data: any = await prisma.$queryRawUnsafe(queryCollection);
    const summary: any = await prisma.$queryRawUnsafe(queryJournal);
    console.log(summary)
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
      report: [],
    });
  }
});

export default AbstractCollection;
