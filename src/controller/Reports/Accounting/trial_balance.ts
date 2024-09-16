import express from "express";
import { FinancialStatement } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";

const TrialBalance = express.Router();

const { CustomPrismaClient } = PrismaList();

TrialBalance.post("/trial-balance-report", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    const qry = FinancialStatement(
      req.body.date,
      req.body.sub_acct,
      req.body.dateFormat
    );
    console.log(qry);

    const report = await prisma.$queryRawUnsafe(qry);
    res.send({
      message: "Successfully get Report",
      success: false,
      report,
    });
  } catch (err: any) {
    res.send({
      message: err.message,
      success: false,
      report: [],
    });
  }
});

TrialBalance.post("/trial-balance-report-desk", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    const qry = FinancialStatement(
      req.body.date,
      req.body.sub_acct,
      req.body.dateFormat
    );
    const data = await prisma.$queryRawUnsafe(qry);
    console.log(qry ,'==========');
    res.send({
      message: "Successfully get Report",
      success: false,
      data,
    });
  } catch (err: any) {
    res.send({
      message: err.message,
      success: false,
      report: [],
    });
  }
});

// {
//   dateFormat: 'Monthly',
//   date: '2024-09-04T00:59:48.538Z',
//   sub_acct: 'All',
//   title: 'UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.\n' +
//     'Monthly Trial Balance (September 2024)'
// }
export default TrialBalance;
