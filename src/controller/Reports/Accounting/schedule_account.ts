import express from "express";
import {
  format,
  startOfMonth,
  endOfMonth,
  addYears,
  endOfYear,
  startOfYear,
} from "date-fns";
import { qryJournal } from "../../../model/db/views";
import { PrismaList } from "../../../model/connection";

const ScheduleAccounts = express.Router();

const { CustomPrismaClient } = PrismaList();

ScheduleAccounts.get("/chart-schedule-account", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const { account_search } = req.query;

    const chartAccount = await prisma.$queryRawUnsafe(`
        select 
            * 
        from 
              chart_account a
        where 
            a.Acct_Code LIKE '%${account_search}%' OR
            a.Acct_Title  LIKE '%${account_search}%' OR
            a.Short LIKE '%${account_search}%' 
        limit 100
    `);
    res.send({
      message: "Successfully Get Chart of Account!",
      success: true,
      chartAccount,
      data: chartAccount,
    });
  } catch (err: any) {
    res.send({
      message: err.message,
      success: false,
      chartAccount: [],
    });
  }
});

ScheduleAccounts.get("/schedule-accounts", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const accounts = await prisma.$queryRawUnsafe(`
      SELECT 'All' as AccountCode
      union all
      SELECT AccountCode FROM   policy_account order by AccountCode;
    `);
    res.send({
      message: "Successfully Get Accounts!",
      success: true,
      accounts,
      data: accounts,
    });
  } catch (err: any) {
    res.send({
      message: err.message,
      success: false,
      accounts: [],
    });
  }
});

ScheduleAccounts.get("/get-sub-account-acronym", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const sub_account = await prisma.$queryRawUnsafe(`
    SELECT Acronym FROM   sub_account order by Acronym asc;
    `);
    res.send({
      message: "Successfully Get Sub Accounts!",
      success: true,
      sub_account,
      data: sub_account,
    });
  } catch (err: any) {
    res.send({
      message: err.message,
      success: false,
      sub_account: [],
    });
  }
});

ScheduleAccounts.post("/schedule-account-report", async (req, res) => {
  try {
    console.log(req.body);
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const selectClient = `
  SELECT 
			"Client" as IDType,
            aa.entry_client_id AS IDNo,
			aa.sub_account,
		   if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
           aa.entry_client_id as client_id  
        FROM
              entry_client aa
            union all
      SELECT 
			"Agent" as IDType,
            aa.entry_agent_id AS IDNo,
			aa.sub_account,
			CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
            aa.entry_agent_id as client_id  
        FROM
              entry_agent aa
            union all
      SELECT 
			"Employee" as IDType,
            aa.entry_employee_id AS IDNo,
			aa.sub_account,
			CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
            aa.entry_employee_id as client_id
        FROM
              entry_employee aa
      union all
      SELECT 
			"Supplier" as IDType,
            aa.entry_supplier_id AS IDNo,
			aa.sub_account,
			if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
             aa.entry_supplier_id as client_id
        FROM
              entry_supplier aa
            union all
      SELECT 
			"Fixed Assets" as IDType,
            aa.entry_fixed_assets_id AS IDNo,
			aa.sub_account,
			aa.fullname AS Shortname,
            aa.entry_fixed_assets_id as client_id
        FROM
              entry_fixed_assets aa
            union all
      SELECT 
			"Others" as IDType,
            aa.entry_others_id AS IDNo,
			aa.sub_account,
			aa.description AS Shortname,
            aa.entry_others_id as client_id
        FROM
              entry_others aa
  `;

    let dateFrom = "";
    let dateTo = "";
    let qry = "";
    if (req.body.dateFormat === "Daily") {
      dateFrom = format(new Date(req.body.dateFrom), "yyyy-MM-dd");
      dateTo = format(new Date(req.body.dateFrom), "yyyy-MM-dd");
    }
    if (req.body.dateFormat === "Monthly") {
      const currentDate = new Date(req.body.dateFrom);
      dateFrom = format(startOfMonth(currentDate), "yyyy-MM-dd");
      dateTo = format(endOfMonth(currentDate), "yyyy-MM-dd");
    }
    if (req.body.dateFormat === "Yearly") {
      const currentDate = new Date(req.body.dateFrom);

      dateFrom = format(startOfYear(startOfMonth(currentDate)), "yyyy-MM-dd");
      dateTo = format(
        endOfMonth(
          endOfYear(addYears(currentDate, parseInt(req.body.yearCount)))
        ),
        "yyyy-MM-dd"
      );
    }
    if (req.body.dateFormat === "Custom") {
      dateFrom = format(new Date(req.body.dateFrom), "yyyy-MM-dd");
      dateTo = format(new Date(req.body.dateTo), "yyyy-MM-dd");
    }
    if (req.body.subsi === 0) {
      qry = `
        SELECT
          a.GL_Acct,
          a.Sub_Acct,
          a.mShort,
          MAX(b.ShortName) as mSub_Acct,
          FORMAT(Sum(a.mDebit), 2)   AS Debit,
          FORMAT(Sum(a.mCredit), 2)  AS Credit,
          IF(CAST(Left(a.GL_Acct,1) AS UNSIGNED)<=3 Or CAST(Left(a.GL_Acct,1) AS UNSIGNED)=7,
              Sum(a.mDebit)-Sum(a.mCredit),
              Sum(a.mCredit)-Sum(a.mDebit)
          ) AS Balance
      FROM
          (${qryJournal()})  a
          LEFT JOIN   sub_account b on a.Sub_Acct =  b.Acronym
      WHERE
          (a.Source_Type <> 'BF' AND a.Source_Type <>'BFD' AND a.Source_Type <>'BFS') AND
          a.Date_Entry >= '${dateFrom}' AND 
          a.Date_Entry <= '${dateTo}'
          AND ${
            req.body.format === 1
              ? req.body.account !== ""
                ? ` a.GL_Acct = '${req.body.account}'  AND `
                : ""
              : ""
          }
          (a.Sub_Acct IS NOT NULL AND trim(a.Sub_Acct) <> '') AND
          (a.GL_Acct IS NOT NULL AND trim(a.GL_Acct) <> '') AND
          a.Sub_Acct IN (
              SELECT
                  Acronym
              FROM
                    Sub_Account ${
                      req.body.subsi_options.toLowerCase() === "all"
                        ? ""
                        : ` where Acronym = '${req.body.subsi_options}'`
                    }
          ) 
      GROUP BY
          a.GL_Acct, a.Sub_Acct
      ORDER BY
          a.GL_Acct ${req.body.order}, ${
        req.body.sort === "Name" ? ` mSub_Acct ` : " a.Sub_Acct "
      } ${req.body.order}`;
    }
    if (req.body.subsi === 1) {
      qry = `
      SELECT
          LEFT(a.GL_Acct,1) AS Group_Header,
          LEFT(a.GL_Acct,4) AS Header,
          a.GL_Acct,
          b.Acct_Title  AS 'mShort',
          MAX(a.Branch_Code) AS Sub_Acct,
          d.Shortname AS 'mID',
          a.ID_No AS ID_No,
          FORMAT(Sum(Debit), 2) AS Debit,
          FORMAT(Sum(Credit), 2) AS Credit,
          IF(CAST(LEFT(a.GL_Acct,1) AS UNSIGNED) <= 3 OR CAST(LEFT(a.GL_Acct,1) AS UNSIGNED) = 7, SUM(Debit)-SUM(Credit), SUM(Credit)-SUM(Debit)) AS Balance
      FROM  journal a
      INNER JOIN  chart_account b ON b.Acct_Code = a.GL_Acct
      LEFT JOIN   sub_account c ON c.Sub_Acct = a.Sub_Acct
      LEFT JOIN (
        SELECT
            PolicyNo,
            Shortname
        FROM
              policy a
        INNER JOIN (${selectClient}) b ON b.IDNo = a.IDNo
        UNION ALL
        SELECT
            aa.IDNo,
            aa.Shortname
        FROM
          (${selectClient}) aa
        ) d ON d.PolicyNo = a.ID_No
        WHERE
          a.Source_Type NOT IN ('BF','BFD','BFS') 
          AND d.Shortname IS NOT NULL 
          AND a.Date_Entry >= '${dateFrom}'  
          AND a.Date_Entry <= '${dateTo}'
          ${
            req.body.format === 1
              ? req.body.account !== ""
                ? ` AND a.GL_Acct = '${req.body.account}'   `
                : ""
              : ""
          }
          ${
            req.body.subsi_options.toLowerCase() === "all"
              ? ""
              : ` AND a.ID_No = '${req.body.subsi_options}'`
          }
        GROUP BY
          GL_Acct, b.Short, a.ID_No, d.Shortname
        HAVING
          IF(CAST(LEFT(a.GL_Acct,1) AS UNSIGNED) <= 3 OR CAST(LEFT(a.GL_Acct,1) AS UNSIGNED) = 7, SUM(Debit)-SUM(Credit), SUM(Credit)-SUM(Debit)) <> 0
        ORDER BY
        Group_Header ${req.body.order}, Header ${req.body.order}, GL_Acct ${
        req.body.order
      }, ${req.body.sort === "Name" ? " mID " : " a.ID_No "} ${req.body.order};
`;
    }
    if (req.body.subsi === 2) {
      qry = `
      SELECT
         MAX(d.Acct_Title) as mShort,
          a.GL_Acct,
          a.Sub_Acct,
          a.ID_No,
          c.AccountCode AS mID,
          FORMAT(SUM(a.mDebit),2) AS Debit,
          FORMAT(SUM(a.mCredit),2) AS Credit,
          IF(CAST(LEFT(GL_Acct,1) AS UNSIGNED) <= 3 OR CAST(LEFT(GL_Acct,1) AS UNSIGNED) = 7, SUM(a.mDebit)-SUM(a.mCredit), SUM(a.mCredit)-SUM(a.mDebit)) AS Balance
      FROM (${qryJournal()})  a
      LEFT JOIN   policy b ON a.ID_No = b.PolicyNo
      INNER JOIN  policy_account c ON b.Account = c.Account
      LEFT JOIN   chart_account d on a.GL_Acct = d.Acct_Code
      WHERE 
      a.Date_Entry >= '${dateFrom}'  
      AND a.Date_Entry <= '${dateTo}'
      ${
        req.body.format === 1
          ? req.body.account !== ""
            ? ` AND a.GL_Acct = '${req.body.account}'   `
            : ""
          : ""
      }
      ${
        req.body.subsi_options.toLowerCase() === "all"
          ? ""
          : ` AND c.AccountCode = '${req.body.subsi_options}'`
      }
      GROUP BY
          c.AccountCode,
          a.Sub_Acct,
          a.GL_Acct,
          a.ID_No
      HAVING
          IF(CAST(LEFT(GL_Acct,1) AS UNSIGNED) <= 3 OR CAST(LEFT(GL_Acct,1) AS UNSIGNED) = 7, SUM(a.mDebit)-SUM(a.mCredit), SUM(a.mCredit)-SUM(a.mDebit)) <> 0
      ORDER BY a.GL_Acct ${req.body.order}, ${
        req.body.sort === "Name" ? " mID " : " a.ID_No "
      } ${req.body.order} ;
      `;
    }
    const report: any = await prisma.$queryRawUnsafe(qry);

    const groupArray = FormatGroupArray(report);

    res.send({
      message: "Successfully Get Chart of Account!",
      success: true,
      report: groupArray,
    });
  } catch (err: any) {
    res.send({
      message: err.message,
      success: false,
      report: [],
    });
  }
});

ScheduleAccounts.post("/schedule-account-report-desk", async (req, res) => {
  try {
    console.log(req.body)
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const selectClient = `
  SELECT 
			"Client" as IDType,
            aa.entry_client_id AS IDNo,
			aa.sub_account,
		   if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
           aa.entry_client_id as client_id  
        FROM
              entry_client aa
            union all
      SELECT 
			"Agent" as IDType,
            aa.entry_agent_id AS IDNo,
			aa.sub_account,
			CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
            aa.entry_agent_id as client_id  
        FROM
              entry_agent aa
            union all
      SELECT 
			"Employee" as IDType,
            aa.entry_employee_id AS IDNo,
			aa.sub_account,
			CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
            aa.entry_employee_id as client_id
        FROM
              entry_employee aa
      union all
      SELECT 
			"Supplier" as IDType,
            aa.entry_supplier_id AS IDNo,
			aa.sub_account,
			if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
             aa.entry_supplier_id as client_id
        FROM
              entry_supplier aa
            union all
      SELECT 
			"Fixed Assets" as IDType,
            aa.entry_fixed_assets_id AS IDNo,
			aa.sub_account,
			aa.fullname AS Shortname,
            aa.entry_fixed_assets_id as client_id
        FROM
              entry_fixed_assets aa
            union all
      SELECT 
			"Others" as IDType,
            aa.entry_others_id AS IDNo,
			aa.sub_account,
			aa.description AS Shortname,
            aa.entry_others_id as client_id
        FROM
              entry_others aa
  `;

    let dateFrom = "";
    let dateTo = "";
    let qry = "";
    if (req.body.dateFormat === "Daily") {
      dateFrom = format(new Date(req.body.dateFrom), "yyyy-MM-dd");
      dateTo = format(new Date(req.body.dateFrom), "yyyy-MM-dd");
    }
    if (req.body.dateFormat === "Monthly") {
      const currentDate = new Date(req.body.dateFrom);
      dateFrom = format(startOfMonth(currentDate), "yyyy-MM-dd");
      dateTo = format(endOfMonth(currentDate), "yyyy-MM-dd");
    }
    if (req.body.dateFormat === "Yearly") {
      const currentDate = new Date(req.body.dateFrom);

      dateFrom = format(startOfYear(startOfMonth(currentDate)), "yyyy-MM-dd");
      dateTo = format(
        endOfMonth(
          endOfYear(addYears(currentDate, parseInt(req.body.yearCount)))
        ),
        "yyyy-MM-dd"
      );
    }
    if (req.body.dateFormat === "Custom") {
      dateFrom = format(new Date(req.body.dateFrom), "yyyy-MM-dd");
      dateTo = format(new Date(req.body.dateTo), "yyyy-MM-dd");
    }
 
    if (req.body.subsi === 0) {
      qry = `
        SELECT
          a.GL_Acct,
          a.Sub_Acct,
          a.mShort,
          MAX(b.ShortName) as mSub_Acct,
          FORMAT(Sum(a.mDebit), 2)   AS Debit,
          FORMAT(Sum(a.mCredit), 2)  AS Credit,
          IF(CAST(Left(a.GL_Acct,1) AS UNSIGNED)<=3 Or CAST(Left(a.GL_Acct,1) AS UNSIGNED)=7,
              Sum(a.mDebit)-Sum(a.mCredit),
              Sum(a.mCredit)-Sum(a.mDebit)
          ) AS Balance
      FROM
          (${qryJournal()})  a
          LEFT JOIN   sub_account b on a.Sub_Acct =  b.Acronym
      WHERE
          (a.Source_Type <> 'BF' AND a.Source_Type <>'BFD' AND a.Source_Type <>'BFS') AND
          a.Date_Entry >= '${dateFrom}' AND 
          a.Date_Entry <= '${dateTo}'
          AND ${
            req.body.format === 1
              ? req.body.account !== ""
                ? ` a.GL_Acct = '${req.body.account}'  AND `
                : ""
              : ""
          }
          (a.Sub_Acct IS NOT NULL AND trim(a.Sub_Acct) <> '') AND
          (a.GL_Acct IS NOT NULL AND trim(a.GL_Acct) <> '') AND
          a.Sub_Acct IN (
              SELECT
                  Acronym
              FROM
                    Sub_Account ${
                      req.body.subsi_options.toLowerCase() === "all"
                        ? ""
                        : ` where Acronym = '${req.body.subsi_options}'`
                    }
          ) 
      GROUP BY
          a.GL_Acct, a.Sub_Acct
      ORDER BY
          a.GL_Acct ${req.body.order}, ${
        req.body.sort === "Name" ? ` mSub_Acct ` : " a.Sub_Acct "
      } ${req.body.order}`;
    }
    if (req.body.subsi === 1) {
      qry = `
      SELECT
          LEFT(a.GL_Acct,1) AS Group_Header,
          LEFT(a.GL_Acct,4) AS Header,
          a.GL_Acct,
          b.Acct_Title  AS 'mShort',
          MAX(a.Branch_Code) AS Sub_Acct,
          d.Shortname AS 'mID',
          a.ID_No AS ID_No,
          FORMAT(Sum(Debit), 2) AS Debit,
          FORMAT(Sum(Credit), 2) AS Credit,
          IF(CAST(LEFT(a.GL_Acct,1) AS UNSIGNED) <= 3 OR CAST(LEFT(a.GL_Acct,1) AS UNSIGNED) = 7, SUM(Debit)-SUM(Credit), SUM(Credit)-SUM(Debit)) AS Balance
      FROM  journal a
      INNER JOIN  chart_account b ON b.Acct_Code = a.GL_Acct
      LEFT JOIN   sub_account c ON c.Sub_Acct = a.Sub_Acct
      LEFT JOIN (
        SELECT
            PolicyNo,
            Shortname
        FROM
              policy a
        INNER JOIN (${selectClient}) b ON b.IDNo = a.IDNo
        UNION ALL
        SELECT
            aa.IDNo,
            aa.Shortname
        FROM
          (${selectClient}) aa
        ) d ON d.PolicyNo = a.ID_No
        WHERE
          a.Source_Type NOT IN ('BF','BFD','BFS') 
          AND d.Shortname IS NOT NULL 
          AND a.Date_Entry >= '${dateFrom}'  
          AND a.Date_Entry <= '${dateTo}'
          ${
            req.body.format === 1
              ? req.body.account !== ""
                ? ` AND a.GL_Acct = '${req.body.account}'   `
                : ""
              : ""
          }
          ${
            req.body.subsi_options.toLowerCase() === "all"
              ? ""
              : ` AND a.ID_No = '${req.body.subsi_options}'`
          }
        GROUP BY
          GL_Acct, b.Short, a.ID_No, d.Shortname
        HAVING
          IF(CAST(LEFT(a.GL_Acct,1) AS UNSIGNED) <= 3 OR CAST(LEFT(a.GL_Acct,1) AS UNSIGNED) = 7, SUM(Debit)-SUM(Credit), SUM(Credit)-SUM(Debit)) <> 0
        ORDER BY
        Group_Header ${req.body.order}, Header ${req.body.order}, GL_Acct ${
        req.body.order
      }, ${req.body.sort === "Name" ? " mID " : " a.ID_No "} ${req.body.order};
`;
    }
    if (req.body.subsi === 2) {
      qry = `
      SELECT
         MAX(d.Acct_Title) as mShort,
          a.GL_Acct,
          a.Sub_Acct,
          a.ID_No,
          c.AccountCode AS mID,
          FORMAT(SUM(a.mDebit),2) AS Debit,
          FORMAT(SUM(a.mCredit),2) AS Credit,
          IF(CAST(LEFT(GL_Acct,1) AS UNSIGNED) <= 3 OR CAST(LEFT(GL_Acct,1) AS UNSIGNED) = 7, SUM(a.mDebit)-SUM(a.mCredit), SUM(a.mCredit)-SUM(a.mDebit)) AS Balance
      FROM (${qryJournal()})  a
      LEFT JOIN   policy b ON a.ID_No = b.PolicyNo
      INNER JOIN  policy_account c ON b.Account = c.Account
      LEFT JOIN   chart_account d on a.GL_Acct = d.Acct_Code
      WHERE 
      a.Date_Entry >= '${dateFrom}'  
      AND a.Date_Entry <= '${dateTo}'
      ${
        req.body.format === 1
          ? req.body.account !== ""
            ? ` AND a.GL_Acct = '${req.body.account}'   `
            : ""
          : ""
      }
      ${
        req.body.subsi_options.toLowerCase() === "all"
          ? ""
          : ` AND c.AccountCode = '${req.body.subsi_options}'`
      }
      GROUP BY
          c.AccountCode,
          a.Sub_Acct,
          a.GL_Acct,
          a.ID_No
      HAVING
          IF(CAST(LEFT(GL_Acct,1) AS UNSIGNED) <= 3 OR CAST(LEFT(GL_Acct,1) AS UNSIGNED) = 7, SUM(a.mDebit)-SUM(a.mCredit), SUM(a.mCredit)-SUM(a.mDebit)) <> 0
      ORDER BY a.GL_Acct ${req.body.order}, ${
        req.body.sort === "Name" ? " mID " : " a.ID_No "
      } ${req.body.order} ;
      `;
    }
    console.log(qry)

    const data: any = await prisma.$queryRawUnsafe(qry);

    // GL_Acct,
    // Sub_Acct,
    // mShort,
    // mSub_Acct,
    // Debit,
    // Credit,
    // Balance

    // {
    //   format: 0,
    //   account: '',
    //   account_title: '',
    //   dateFormat: 'Custom',
    //   dateFrom: '2024-08-29T06:15:42.296Z',
    //   dateTo: '2024-08-29T06:15:42.296Z',
    //   yearCount: '24',
    //   subsi: 1,
    //   subsi_options: 'All',
    //   sort: 'Name',
    //   order: 'asc',
    //   title: 'UPWARD CONSULTANCY SERVICES AND MANAGEMENT INC.\n' +
    //     'Schedule of Accounts \n' +
    //     'Cut off Date: August 29, 2024 to August 29, 2024\n'
    // }
    res.send({
      message: "Successfully Get Chart of Account!",
      success: true,
      data,
    });
  } catch (err: any) {
    res.send({
      message: err.message,
      success: false,
      data: [],
    });
  }
});

function FormatGroupArray(data: Array<any>) {
  const groupedArray = data.reduce((acc: any, obj: any) => {
    const key = obj.GL_Acct;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});

  const result = Object.values(groupedArray).map((group: any) => {
    let totalDebit = 0;
    let totalCredit = 0;
    let totalBalance = 0;
    group.forEach((item: any) => {
      totalDebit += parseFloat(item.Debit.toString().replace(/,/g, ""));
      totalCredit += parseFloat(item.Credit.toString().replace(/,/g, ""));
      totalBalance += parseFloat(item.Balance.toString().replace(/,/g, ""));
    });

    const HeaderItem = {
      Group_Header: group[0].Group_Header,
      Header: group[0].Header,
      GL_Acct: group[0].GL_Acct,
      mShort: `${group[0].GL_Acct}(${group[0].mShort})`,
      Sub_Acct: "",
      mID: "",
      ID_No: "",
      Debit: "",
      Credit: "",
      Balance: "",
      ArrayHeader: true,
    };

    const footerItem = {
      Group_Header: "",
      Header: "",
      GL_Acct: "",
      mShort: "",
      Sub_Acct: "",
      mID: "",
      ID_No: "",
      Debit: formatNumberWithCommas(totalDebit),
      Credit: formatNumberWithCommas(totalCredit),
      Balance: formatNumberWithCommas(totalBalance),
      ArrayFooter: true,
    };
    function formatNumberWithCommas(number: number) {
      return number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    return [HeaderItem, ...group, footerItem];
  });
  const rr = result.flat();
  return rr;
}

export default ScheduleAccounts;

//  Group_Header,
//  Header,
// a.GL_Acct,
// 'mShort',
// Sub_Acct,
// 'mID',
//  ID_No,
//  Debit,
//  Credit,
//  Balance