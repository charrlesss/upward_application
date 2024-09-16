import { PrismaClient } from "@prisma/client";
import express from "express";
import { CashDisbursementBook_CDB_GJB } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";
import { createsampleData } from "../../../model/StoredProcedure";
const { CustomPrismaClient } = PrismaList();
const CashDisbursementBookCDB = express.Router();

CashDisbursementBookCDB.post(
  "/cash-disbursement-book-cdb",
  async (req, res) => {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    console.log(req.body);
    try {
      const qry = CashDisbursementBook_CDB_GJB(
        "Cash Disbursement Book - CDB",
        req.body.sub_acct.toUpperCase(),
        new Date(req.body.date),
        req.body.dateFormat,
        "ASC"
      );

      console.log(qry.strSQL);

      function customReplacer(key: string, value: any) {
        return typeof value === "bigint" ? value.toString() : value;
      }

      const data: any = await prisma.$queryRawUnsafe(qry.strSQL);
      const dataSumm: any = await prisma.$queryRawUnsafe(qry.strSubSQL);

      const jsonString = JSON.stringify(data, customReplacer);
      const report = JSON.parse(jsonString);
      const summary: Array<any> = [];

      const Debit = report
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

      const Credit = report
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

      summary.push({
        Date_Entry: "",
        nST: "",
        Source_Type: "",
        Source_No: "",
        Explanation: "",
        Acct_Code: "",
        Acct_Title: "",
        subAcct: "",
        IDNo: "",
        Name: "",
        Debit: "",
        Credit: "",
        TC: "",
        nSource_No: "",
        nSource_Type: "",
        nDate_Entry: "",
        nExplanation: "",
        nHeader: "",
        prev_source_no: "",
        summaryReport: true,
        summaryReportExtraHeight: 0,
      });

      summary.push({
        Date_Entry: "",
        nST: "",
        Source_Type: "",
        Source_No: "",
        Explanation: "",
        Acct_Code: "",
        Acct_Title: "",
        subAcct: "",
        IDNo: "",
        Name: "TOTAL :",
        Debit,
        Credit,
        TC: "",
        nSource_No: "",
        nSource_Type: "",
        nDate_Entry: "",
        nExplanation: "",
        nHeader: "",
        prev_source_no: "",
        mainTotal: true,
      });

      summary.push({
        Date_Entry: "",
        nST: "",
        Source_Type: "",
        Source_No: "",
        Explanation: "",
        Acct_Code: "",
        Acct_Title: "SUMMARY:",
        subAcct: "",
        IDNo: "",
        Name: "",
        Debit: "",
        Credit: "",
        TC: "",
        nSource_No: "",
        nSource_Type: "",
        nDate_Entry: "",
        nExplanation: "",
        nHeader: "",
        prev_source_no: "",
        summary: true,
      });

      summary.push({
        Date_Entry: "",
        nST: "",
        Source_Type: "",
        Source_No: "",
        Explanation: "",
        Acct_Code: "",
        Acct_Title: "",
        subAcct: "",
        IDNo: "",
        Name: "",
        Debit: "",
        Credit: "",
        TC: "",
        nSource_No: "",
        nSource_Type: "",
        nDate_Entry: "",
        nExplanation: "",
        nHeader: "",
        prev_source_no: "",
        summaryHeader: true,
      });

      dataSumm.forEach((item: any) => {
        summary.push({
          Date_Entry: "",
          nST: "",
          Source_Type: "",
          Source_No: "",
          Explanation: "",
          Acct_Code: item.GL_Acct,
          Acct_Title: item.Title,
          subAcct: "",
          IDNo: "",
          Name: "",
          Debit: item.mDebit,
          Credit: item.mCredit,
          TC: "",
          nSource_No: "",
          nSource_Type: "",
          nDate_Entry: "",
          nExplanation: "",
          nHeader: "",
          prev_source_no: "",
          summaryData: true,
        });
      });
      const mDebit = dataSumm
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

      const mCredit = dataSumm
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
        Date_Entry: "",
        nST: "",
        Source_Type: "",
        Source_No: "",
        Explanation: "",
        Acct_Code: "",
        Acct_Title: "TOTAL: ",
        subAcct: "",
        IDNo: "",
        Name: "",
        Debit: mDebit,
        Credit: mCredit,
        TC: "",
        nSource_No: "",
        nSource_Type: "",
        nDate_Entry: "",
        nExplanation: "",
        nHeader: "",
        prev_source_no: "",
        summaryFooter: true,
      });
      res.send({
        message: "Successfully Get Report",
        success: true,
        qry,
        report: report.concat(summary),
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
  }
);
CashDisbursementBookCDB.post(
  "/cash-disbursement-book-cdb-desk",
  async (req, res) => {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    try {
      const qry = CashDisbursementBook_CDB_GJB(
        "Cash Disbursement Book - CDB",
        req.body.sub_acct.toUpperCase(),
        new Date(req.body.date),
        req.body.dateFormat,
        "ASC"
      );


      function customReplacer(key: string, value: any) {
        return typeof value === "bigint" ? value.toString() : value;
      }

      const data1: any = await prisma.$queryRawUnsafe(qry.strSQL);
      const summary: any = await prisma.$queryRawUnsafe(qry.strSubSQL);
      const jsonString = JSON.stringify(data1, customReplacer);
      const data = JSON.parse(jsonString);


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

export default CashDisbursementBookCDB;
