import express from "express";
import { PrismaList } from "../../../model/connection";

const ReportFields = express.Router();

const { CustomPrismaClient } = PrismaList();

ReportFields.get("/report-fields/accounts", async (req, res) => {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  try {
    res.send({
      accounts: await prisma.$queryRawUnsafe(
        `SELECT Account FROM  policy_account `
      ),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      accounts: [],
    });
  }
});
ReportFields.get("/report-fields/accounts-desk", async (req, res) => {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  try {
    res.send({
      data: await prisma.$queryRawUnsafe(
        `Select 'All' as Account union all SELECT Account FROM  policy_account `
      ),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      data: [],
    });
  }
});

ReportFields.get("/report-fields/policy", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    res.send({
      policy: await prisma.$queryRawUnsafe(
        `SELECT 'Bonds' 
            UNION ALL SELECT DISTINCT
                PolicyType
            FROM
              policy
            WHERE
                PolicyType NOT IN (SELECT 
                        SublineName
                    FROM
                      subline
                    WHERE
                        Line = 'Bonds')
            GROUP BY PolicyType
            HAVING PolicyType <> ''`
      ),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      policy: [],
    });
  }
});
ReportFields.get("/report-fields/policy-desk", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    res.send({
      data: await prisma.$queryRawUnsafe(
        `SELECT 'Bonds' 
            UNION ALL SELECT DISTINCT
                PolicyType
            FROM
              policy
            WHERE
                PolicyType NOT IN (SELECT 
                        SublineName
                    FROM
                      subline
                    WHERE
                        Line = 'Bonds')
            GROUP BY PolicyType
            HAVING PolicyType <> ''`
      ),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      data: [],
    });
  }
});
export default ReportFields;
export const mapColumnsToKeys = (columns: string[], result: any) => {
  const newResult = result.map((item: any) => {
    const newItem: any = {};
    for (let i = 0; i < columns.length; i++) {
      newItem[columns[i]] = item[`f${i}`];
    }
    return newItem;
  });
  return newResult;
};
