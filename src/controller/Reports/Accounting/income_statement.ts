import express from "express";
import {
  FinancialStatement,
  FinancialStatementSumm,
} from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";

const IncomeStatement = express.Router();
const { CustomPrismaClient } = PrismaList();

IncomeStatement.post("/income-statement-report", async (req, res) => {
  try {
    console.log(req.body)
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    let sql = "";

    if (req.body.format === 0) {
      const fs = FinancialStatement(req.body.date, "ALL", "Monthly");
      const tmp1 = `
      SELECT
        *,
        LEFT(Code, 1) AS H1,
        LEFT(Code, 4) AS H2
      FROM
          (${fs}) tmp
      WHERE
          LEFT(Code, 1) >= '6'
      `;
      sql = `
      SELECT
          Chart_Account.Acct_Title AS Footer,
          tmp1.H1,
          tmp1.H2,
          tmp1.Code,
          tmp1.Title,
          CASE
              WHEN LEFT(tmp1.Code, 1) = '6' THEN (PrevCredit - PrevDebit)
              ELSE tmp1.PrevBalance
          END AS PrevBalance,
          CASE
              WHEN LEFT(tmp1.Code, 1) = '6' THEN (CurrCredit - CurrDebit)
              ELSE tmp1.CurrBalance
          END AS CurrBalance,
          CASE
              WHEN LEFT(tmp1.Code, 1) = '6' THEN (PrevCredit - PrevDebit) + (CurrCredit - CurrDebit)
              ELSE tmp1.TotalBalance
          END AS TotalBalance
      FROM
          (${tmp1}) tmp1
      LEFT JOIN
          Chart_Account ON tmp1.H2 = Chart_Account.Acct_Code
      ORDER BY
          tmp1.Code;
      `;
    } else {
      const tmp = FinancialStatementSumm(req.body.date, "Monthly");
      const tmp1 = `
      SELECT
          *,
          LEFT(Code, 1) AS H1,
          LEFT(Code, 4) AS H2
      FROM
          (${tmp}) tmp
      WHERE
          LEFT(Code, 1) >= '6'`;
      const tmp2 = `
    SELECT
        SubAccount,
        H1,
        0 - SUM(Balance) AS Balance
    FROM
      (${tmp1}) tmp1 
    GROUP BY
        SubAccount,
        H1`;
      const tmp3 = `
      SELECT
          SubAccount,
          SUM(Balance) AS Balance
      FROM
        (${tmp2}) tmp2
      GROUP BY
          SubAccount`;
      sql = `
      SELECT
          tmp1.H1,
          CASE tmp1.H1
              WHEN '6' THEN 'INCOME'
              ELSE 'EXPENSES'
          END AS MyHeader,
          tmp1.H2,
          Chart_Account.Acct_Title AS MyFooter,
          tmp1.Code,
          SUBSTRING(tmp1.Title, LENGTH(tmp1.Code) + 1 , (LENGTH(tmp1.Title) + 1) - LENGTH(tmp1.Code)) AS Title,
          tmp1.SubAccount,
          CASE
              WHEN LEFT(tmp1.Code, 1) = '6' THEN 0 - tmp1.Balance
              ELSE tmp1.Balance
          END AS Balance,
          CASE
              WHEN LEFT(tmp1.Code, 1) = '6' THEN 0 - tmp1.TotalBalance
              ELSE tmp1.TotalBalance
          END AS TotalBalance,
          tmp3.Balance AS SBalance
      FROM
         (${tmp1}) tmp1
      LEFT JOIN
          Chart_Account ON tmp1.H2 = Chart_Account.Acct_Code
      LEFT JOIN
         (${tmp3}) tmp3 ON tmp1.SubAccount = tmp3.SubAccount
      ORDER BY
          tmp1.Code
      `;
    }
    console.log(sql)
    const dataRes: any = await prisma.$queryRawUnsafe(sql);
    
    const updatedDataRes = dataRes.map((obj: any) => ({
      ...obj,
      second: true,
    }));

    const groupedData = updatedDataRes.reduce((acc: any, obj: any) => {
      const h1Value = obj.H1;
      if (!acc[h1Value]) {
        acc[h1Value] = [];
      }
      acc[h1Value].push(obj);
      return acc;
    }, {});
    const incomeArray = groupedData["6"];
    const expensesArray = groupedData["7"];
    const income = [
      {
        Footer: "",
        H1: "",
        H2: "",
        Code: "",
        Title: "INCOME",
        PrevBalance: "",
        CurrBalance: "",
        TotalBalance: "",
        footer: true,
        first: true,
      },
      ...arrangeArray(incomeArray),
      {
        Footer: "",
        H1: "",
        H2: "",
        Code: "",
        Title: "TOTAL INCOME",
        PrevBalance: incomeArray.reduce((d: any, itms: any) => {
          return (
            d +
            parseFloat(
              Math.abs(itms["PrevBalance"]).toString()?.replace(/,/g, "")
            )
          );
        }, 0),
        CurrBalance: incomeArray.reduce((d: any, itms: any) => {
          return (
            d +
            parseFloat(
              Math.abs(itms["CurrBalance"]).toString()?.replace(/,/g, "")
            )
          );
        }, 0),
        TotalBalance: incomeArray.reduce((d: any, itms: any) => {
          return (
            d +
            parseFloat(
              Math.abs(itms["TotalBalance"]).toString()?.replace(/,/g, "")
            )
          );
        }, 0),
        footer: true,
        first: true,
        totalIncome: true,
      },
    ];
    const expenses = [
      {
        Footer: "",
        H1: "",
        H2: "",
        Code: "",
        Title: "EXPENSES",
        PrevBalance: "",
        CurrBalance: "",
        TotalBalance: "",
        footer: true,
        first: true,
      },
      ...arrangeArray(expensesArray),
      {
        Footer: "",
        H1: "",
        H2: "",
        Code: "",
        Title: "TOTAL EXPENSES",
        PrevBalance: expensesArray.reduce((d: any, itms: any) => {
          return (
            d +
            parseFloat(
              Math.abs(itms["PrevBalance"]).toString()?.replace(/,/g, "")
            )
          );
        }, 0),
        CurrBalance: expensesArray.reduce((d: any, itms: any) => {
          return (
            d +
            parseFloat(
              Math.abs(itms["CurrBalance"]).toString()?.replace(/,/g, "")
            )
          );
        }, 0),
        TotalBalance: expensesArray.reduce((d: any, itms: any) => {
          return (
            d +
            parseFloat(
              Math.abs(itms["TotalBalance"]).toString()?.replace(/,/g, "")
            )
          );
        }, 0),
        footer: true,
        first: true,
        totalExpenses: true,
      },
    ];
    const report = income.concat(expenses);

    res.send({
      message: "Successfully Get Report",
      success: true,
      report,
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

IncomeStatement.post("/income-statement-report-desk", async (req, res) => {
  try {
    console.log(req.body)
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    let sql = "";

    if (req.body.format === 0) {
      const fs = FinancialStatement(req.body.date, "ALL", "Monthly");
      const tmp1 = `
      SELECT
        *,
        LEFT(Code, 1) AS H1,
        LEFT(Code, 4) AS H2
      FROM
          (${fs}) tmp
      WHERE
          LEFT(Code, 1) >= '6'
      `;
      sql = `
      SELECT
          Chart_Account.Acct_Title AS Footer,
          tmp1.H1,
          tmp1.H2,
          tmp1.Code,
          tmp1.Title,
          CASE
              WHEN LEFT(tmp1.Code, 1) = '6' THEN (PrevCredit - PrevDebit)
              ELSE tmp1.PrevBalance
          END AS PrevBalance,
          CASE
              WHEN LEFT(tmp1.Code, 1) = '6' THEN (CurrCredit - CurrDebit)
              ELSE tmp1.CurrBalance
          END AS CurrBalance,
          CASE
              WHEN LEFT(tmp1.Code, 1) = '6' THEN (PrevCredit - PrevDebit) + (CurrCredit - CurrDebit)
              ELSE tmp1.TotalBalance
          END AS TotalBalance
      FROM
          (${tmp1}) tmp1
      LEFT JOIN
          Chart_Account ON tmp1.H2 = Chart_Account.Acct_Code
      ORDER BY
          tmp1.Code;
      `;
    } else {
      const tmp = FinancialStatementSumm(req.body.date, "Monthly");
      const tmp1 = `
      SELECT
          *,
          LEFT(Code, 1) AS H1,
          LEFT(Code, 4) AS H2
      FROM
          (${tmp}) tmp
      WHERE
          LEFT(Code, 1) >= '6'`;
      const tmp2 = `
    SELECT
        SubAccount,
        H1,
        0 - SUM(Balance) AS Balance
    FROM
      (${tmp1}) tmp1 
    GROUP BY
        SubAccount,
        H1`;
      const tmp3 = `
      SELECT
          SubAccount,
          SUM(Balance) AS Balance
      FROM
        (${tmp2}) tmp2
      GROUP BY
          SubAccount`;
      sql = `
      SELECT
          tmp1.H1,
          CASE tmp1.H1
              WHEN '6' THEN 'INCOME'
              ELSE 'EXPENSES'
          END AS MyHeader,
          tmp1.H2,
          Chart_Account.Acct_Title AS MyFooter,
          tmp1.Code,
          SUBSTRING(tmp1.Title, LENGTH(tmp1.Code) + 1 , (LENGTH(tmp1.Title) + 1) - LENGTH(tmp1.Code)) AS Title,
          tmp1.SubAccount,
          CASE
              WHEN LEFT(tmp1.Code, 1) = '6' THEN 0 - tmp1.Balance
              ELSE tmp1.Balance
          END AS Balance,
          CASE
              WHEN LEFT(tmp1.Code, 1) = '6' THEN 0 - tmp1.TotalBalance
              ELSE tmp1.TotalBalance
          END AS TotalBalance,
          tmp3.Balance AS SBalance
      FROM
         (${tmp1}) tmp1
      LEFT JOIN
          Chart_Account ON tmp1.H2 = Chart_Account.Acct_Code
      LEFT JOIN
         (${tmp3}) tmp3 ON tmp1.SubAccount = tmp3.SubAccount
      ORDER BY
          tmp1.Code
      `;
    }
    console.log(sql)
    const data: any = await prisma.$queryRawUnsafe(sql);
    res.send({
      message: "Successfully Get Report",
      success: true,
      data,
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



export default IncomeStatement;

function arrangeArray(dataArray: Array<any>) {
  const groupedDataIncome = dataArray.reduce((acc: any, obj: any) => {
    const key = obj.Footer;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});

  for (const group in groupedDataIncome) {
    const groupTotal = groupedDataIncome[group].reduce(
      (acc: any, obj: any) => {
        acc.PrevBalance += Math.abs(
          parseFloat(obj.PrevBalance.toString().replace(/,/g, "") || 0)
        );
        acc.CurrBalance += Math.abs(
          parseFloat(obj.CurrBalance.toString().replace(/,/g, "") || 0)
        );
        acc.TotalBalance += Math.abs(
          parseFloat(obj.TotalBalance.toString().replace(/,/g, "") || 0)
        );
        return acc;
      },
      {
        PrevBalance: 0,
        CurrBalance: 0,
        TotalBalance: 0,
      }
    );

    const summaryObject = {
      Footer: "",
      H1: "",
      H2: "",
      Code: "",
      Title: group,
      PrevBalance: groupTotal.PrevBalance.toString(),
      CurrBalance: groupTotal.CurrBalance.toString(),
      TotalBalance: groupTotal.TotalBalance.toString(),
      footer: true,
      third: true,
    };

    groupedDataIncome[group].push(summaryObject);
  }

  return Object.values(groupedDataIncome).flat();
}
