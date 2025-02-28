import express from "express";
import {
  _GeneralLedgerReport,
  _GeneralLedgerReportSumm,
} from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";

const GeneralLedger = express.Router();
const { CustomPrismaClient } = PrismaList();


GeneralLedger.post("/general-ledger-report-desk", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    let qry = ""
    if (parseInt(req.body.format) === 0) {
      qry = _GeneralLedgerReport(
        req.body.date,
        req.body.sub_acct,
        req.body.dateFormat,
        parseInt(req.body.transSumm),
        parseInt(req.body.account)
      );
    } else {
      qry = _GeneralLedgerReportSumm(
        req.body.date, 
        req.body.dateFormat,
        parseInt(req.body.transSumm),
        parseInt(req.body.account))
    }

    // console.log(req.body);
    console.log(qry)
    const data = await prisma.$queryRawUnsafe(qry);

    function replacer(key: any, value: any) {
      // Check if the value is a BigInt
      if (typeof value === 'bigint') {
        return value.toString(); // Convert BigInt to string
      }
      return value; // Return the value as is for other types
    }
    const jsonString = JSON.stringify(data, replacer);

    res.send({
      message: "Successfully Get Report",
      success: true,
      data: JSON.parse(jsonString),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      success: false,
      data: [],
    });
  }
});

export default GeneralLedger;
