import express from "express";
import { ProductionBook } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";

const ProductionBookPB = express.Router();

ProductionBookPB.post("/production-book-pb", async (req, res) => {
  try {
    const { CustomPrismaClient } = PrismaList();
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const qry = ProductionBook(
      "Date Issued",
      "ASC",
      req.body.dateFormat,
      new Date(req.body.date),
      req.body.sub_acct.toUpperCase()
    );
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
      DateIssued: "",
      PolicyNo: "",
      Explanation: "",
      Acct_Code: "",
      Short: "",
      SubAcct: "",
      Shortname: "",
      Debit: "",
      Credit: "",
      TC: "",
      nDate_Entry: "",
      nSource_No: "",
      nExplanation: "",
      nHeader: "",
      prev_source_no: "",
      summaryReport: true,
      summaryReportExtraHeight: 0,
    });

    summary.push({
      DateIssued: "",
      PolicyNo: "",
      Explanation: "",
      Acct_Code: "",
      Short: "",
      SubAcct: "",
      Shortname: "Grand Total :",
      Debit,
      Credit,
      TC: "",
      nDate_Entry: "",
      nSource_No: "",
      nExplanation: "",
      nHeader: "",
      prev_source_no: "",
      mainTotal: true,
    });

    summary.push({
      DateIssued: "",
      PolicyNo: "",
      Explanation: "",
      Acct_Code: "",
      Short: "",
      SubAcct: "SUMMARY:",
      Shortname: "",
      Debit: "",
      Credit: "",
      TC: "",
      nDate_Entry: "",
      nSource_No: "",
      nExplanation: "",
      nHeader: "",
      prev_source_no: "",
      summary: true,
    });

    summary.push({
      DateIssued: "",
      PolicyNo: "",
      Explanation: "",
      Acct_Code: "",
      Short: "",
      SubAcct: "",
      Shortname: "",
      Debit: "",
      Credit: "",
      TC: "",
      nDate_Entry: "",
      nSource_No: "",
      nExplanation: "",
      nHeader: "",
      prev_source_no: "",
      summaryHeader: true,
    });

    dataSumm.forEach((item: any) => {
      summary.push({
        DateIssued: "",
        PolicyNo: "",
        Explanation: "",
        Acct_Code: item.cGL_Acct,
        Short: "",
        SubAcct: "",
        Shortname: "",
        Debit: item.Debit,
        Credit: item.Credit,
        TC: "",
        nDate_Entry: "",
        nSource_No: "",
        nExplanation: "",
        nHeader: "",
        prev_source_no: "",
        summaryData: true,
      });
    });
    const mDebit = dataSumm
      .reduce((a: number, item: any) => {
        let num = 0;
        if (!isNaN(parseFloat(item.Debit.toString().replace(/,/g, "")))) {
          num = parseFloat(item.Debit.toString().replace(/,/g, ""));
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
        if (!isNaN(parseFloat(item.Credit.toString().replace(/,/g, "")))) {
          num = parseFloat(item.Credit.toString().replace(/,/g, ""));
        }
        return a + num;
      }, 0)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    summary.push({
      DateIssued: "",
      PolicyNo: "",
      Explanation: "",
      Acct_Code: "TOTAL: ",
      Short: "",
      SubAcct: "",
      Shortname: "",
      Debit: mDebit,
      Credit: mCredit,
      TC: "",
      nDate_Entry: "",
      nSource_No: "",
      nExplanation: "",
      nHeader: "",
      prev_source_no: "",
      summaryFooter: true,
    });

    summary.push({
      DateIssued: "",
      PolicyNo: "",
      Explanation: "",
      Acct_Code: " ",
      Short: "",
      SubAcct: "",
      Shortname: "",
      Debit: mDebit,
      Credit: mCredit,
      TC: "",
      nDate_Entry: "",
      nSource_No: "",
      nExplanation: "",
      nHeader: "",
      prev_source_no: "",
      summaryFooterSignature: true,
    });

    let mergedArray = report.concat(summary);

    res.send({
      message: "Successfully Get Report",
      success: true,
      qry,
      report: mergedArray,
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

export default ProductionBookPB;
