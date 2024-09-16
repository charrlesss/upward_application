import express from "express";
import { format } from "date-fns";
import { mapColumnsToKeys } from "./report-fields";
import { exportToExcel } from "./report-to-excel";
import { RenewalNoticeReport } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";

const RenewalReport = express.Router();


const { CustomPrismaClient } = PrismaList();

RenewalReport.post("/renewal-notice", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    let { dateFrom, policy, type, account } = req.body;
    policy = policy.toUpperCase();
  
    const query = RenewalNoticeReport(
      format(new Date(dateFrom), "yyyy-MM-dd"),
      policy,
      type,
      account
    );
    console.log(query);
    const report: any = await prisma.$queryRawUnsafe(query);
  
    res.send({
      report,
      query
    });
  } catch (error:any) {
    console.log(error.message)
    res.send({
      report:[],
      message:error.message
    });
  }
});

RenewalReport.post("/export-excel-renewal-notice", async (req, res) => {
  exportToExcel({
    req,
    res,
    callback({
      state,
      header,
      rowLengthTextDisplayIndex,
      sheet,
      sendFile,
      letterList,
    }) {
      sendFile();
    },
  });
});
export default RenewalReport;
