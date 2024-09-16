import express from "express";
import { PettyCashFundDisbursement } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";

const PettyCashFundDisbursements = express.Router();
const { CustomPrismaClient } = PrismaList();

PettyCashFundDisbursements.post(
  "/petty-cash-fund-disbursement",
  async (req, res) => {
    try {
      console.log(req.body);
      const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

      const qry = PettyCashFundDisbursement(
        req.body.sub_acct.toUpperCase(),
        req.body.seriesFrom,
        req.body.seriesTo
      );

      const dataCash: any = await prisma.$queryRawUnsafe(qry.dtPettyCashQuery);
      const dataSumm: any = await prisma.$queryRawUnsafe(qry.dtSummaryQuery);
      const summary: Array<any> = [];
      console.log(qry.dtPettyCashQuery);

      const Debit = dataCash
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

      const Credit = dataCash
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
        DT: "",
        Payee: "",
        particulars: "",
        transaction: "",
        identity: "",
        DRShort: "",
        Debit: "",
        CRShort: "",
        Credit: "",
        summaryReport: true,
        summaryReportExtraHeight: 0,
      });

      summary.push({
        DT: "",
        Payee: "",
        particulars: "",
        transaction: "",
        identity: "TOTAL : ",
        DRShort: "",
        Debit,
        CRShort: "",
        Credit,
        total: true,
      });

      summary.push({
        DT: "",
        Payee: "",
        particulars: "SUMMARY:",
        transaction: "",
        identity: "",
        DRShort: "",
        Debit: "",
        CRShort: "",
        Credit: "",
        summary: true,
      });

      summary.push({
        DT: "",
        Payee: "",
        particulars: "",
        transaction: "",
        identity: "ACCOUNT TITLE",
        DRShort: "CREDIT",
        Debit: "DEBIT",
        CRShort: "",
        Credit: "",
        summ: true,
        header: true,
      });

      dataSumm.forEach((itm: any) => {
        let mDebit = 0;
        let mCredit = 0;
        if (!isNaN(parseFloat(itm.mDebit?.toString().replace(/,/g, "")))) {
          mDebit = parseFloat(itm.mDebit?.toString().replace(/,/g, ""));
        }
        if (!isNaN(parseFloat(itm.mCredit?.toString().replace(/,/g, "")))) {
          mCredit = parseFloat(itm.mCredit?.toString().replace(/,/g, ""));
        }
        summary.push({
          DT: "",
          Payee: "",
          particulars: "",
          transaction: "",
          identity: `${itm.GL_Acct} ${itm.Title}`,
          DRShort: mDebit.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          Debit: mCredit.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          CRShort: "",
          Credit: "",
          summ: true,
        });
      });
      const mDebit = dataSumm
        .reduce((a: number, item: any) => {
          let num = 0;
          if (!isNaN(parseFloat(item.mDebit?.toString().replace(/,/g, "")))) {
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
          if (!isNaN(parseFloat(item.mCredit?.toString().replace(/,/g, "")))) {
            num = parseFloat(item.mCredit.toString().replace(/,/g, ""));
          }
          return a + num;
        }, 0)
        .toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

      summary.push({
        DT: "",
        Payee: "",
        particulars: "",
        transaction: "",
        identity: `TOTAL:`,
        DRShort: mDebit,
        Debit: mCredit,
        CRShort: "",
        Credit: "",
        summ: true,
        footer: true,
      });

      summary.push({
        DT: "",
        Payee: "",
        particulars: "",
        transaction: "",
        identity: `Prepared:`,
        DRShort: "Checked:",
        Debit: "Approved:",
        CRShort: "",
        Credit: "",
        summ: true,
        signature: true,
      });

      res.send({
        message: "Successfully Get Report",
        success: true,
        report: dataCash.concat(summary),
        summary,
        qry,
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

PettyCashFundDisbursements.post(
  "/petty-cash-fund-disbursement-desk",
  async (req, res) => {
    try {
      console.log(req.body);
      const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

      const qry = PettyCashFundDisbursement(
        req.body.sub_acct.toUpperCase(),
        req.body.seriesFrom,
        req.body.seriesTo
      );

      const data: any = await prisma.$queryRawUnsafe(qry.dtPettyCashQuery);
      const summary: any = await prisma.$queryRawUnsafe(qry.dtSummaryQuery);

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
  }
);

export default PettyCashFundDisbursements;
