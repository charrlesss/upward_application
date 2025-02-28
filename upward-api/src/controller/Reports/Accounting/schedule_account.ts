import express from "express";
import {
  format,
  startOfMonth,
  endOfMonth,
  addYears,
  endOfYear,
  startOfYear,
} from "date-fns";
import { qry_id_policy_sub, qryJournal } from "../../../model/db/views";
import { PrismaList } from "../../../model/connection";
import { parseDate } from "../../../model/db/stored-procedured";

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
ScheduleAccounts.get("/chart-schedule-account-desk", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const { account_search } = req.query;

    const chartAccount = await prisma.$queryRawUnsafe(`
        select 
            a.Acct_Code AS Code,
            a.Acct_Title AS Title,
            a.Short AS 'Short Name' 
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
ScheduleAccounts.get("/chart-schedule-account-account-desk", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


    const chartAccount = await prisma.$queryRawUnsafe(`
        select AccountCode from policy_account
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
          AND ${req.body.format === 1
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
                    Sub_Account ${req.body.subsi_options.toLowerCase() === "all"
          ? ""
          : ` where Acronym = '${req.body.subsi_options}'`
        }
          ) 
      GROUP BY
          a.GL_Acct, a.Sub_Acct
      ORDER BY
          a.GL_Acct ${req.body.order}, ${req.body.sort === "Name" ? ` mSub_Acct ` : " a.Sub_Acct "
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
          ${req.body.format === 1
          ? req.body.account !== ""
            ? ` AND a.GL_Acct = '${req.body.account}'   `
            : ""
          : ""
        }
          ${req.body.subsi_options.toLowerCase() === "all"
          ? ""
          : ` AND a.ID_No = '${req.body.subsi_options}'`
        }
        GROUP BY
          GL_Acct, b.Short, a.ID_No, d.Shortname
        HAVING
          IF(CAST(LEFT(a.GL_Acct,1) AS UNSIGNED) <= 3 OR CAST(LEFT(a.GL_Acct,1) AS UNSIGNED) = 7, SUM(Debit)-SUM(Credit), SUM(Credit)-SUM(Debit)) <> 0
        ORDER BY
        Group_Header ${req.body.order}, Header ${req.body.order}, GL_Acct ${req.body.order
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
      ${req.body.format === 1
          ? req.body.account !== ""
            ? ` AND a.GL_Acct = '${req.body.account}'   `
            : ""
          : ""
        }
      ${req.body.subsi_options.toLowerCase() === "all"
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
      ORDER BY a.GL_Acct ${req.body.order}, ${req.body.sort === "Name" ? " mID " : " a.ID_No "
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
    const { IDEntryWithPolicy } = qry_id_policy_sub()
    const id_entry = `
      select a.IDNo, a.Sub_Acct, a.ShortName as _Shortname , a.client_name as ShortName from (${IDEntryWithPolicy}) a
    `
    console.log(id_entry)
    const _qryJournal = qryJournal();
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    const { account, report, subsi, date, sort, order, subsiText, insurance } = req.body
    const dateFormatted = format(parseDate(date), 'yyyy-MM-dd')
    let qry = "";

    if (parseInt(subsi) === 0) {
      if (report === "GL Account (Detailed)") {
        qry = `
        SELECT 
              qryJournal.GL_Acct, 
              qryJournal.Sub_Acct, 
              qryJournal.mSub_Acct,
              Sum(qryJournal.mDebit) AS Debit, 
              Sum(qryJournal.mCredit) AS Credit, 
              IF(SUBSTRING(GL_Acct, 1, 1) <= '3' OR SUBSTRING(GL_Acct, 1, 1) = '7', 
              SUM(qryJournal.mDebit) - SUM(qryJournal.mCredit), 
              SUM(qryJournal.mCredit) - SUM(qryJournal.mDebit)) AS Balance
              From (${_qryJournal}) QryJournal 
              WHERE (((qryJournal.Source_Type) <>'BF' And (qryJournal.Source_Type) <>'BFD' And (qryJournal.Source_Type) <>'BFS') AND ((qryJournal.Date_Entry) <='${dateFormatted}')) 
              GROUP BY qryJournal.GL_Acct, qryJournal.Sub_Acct, qryJournal.mSub_Acct 
              HAVING (qryJournal.GL_Acct='${account.trim()}') ${subsiText.toUpperCase() === 'ALL' ? "" : ` AND (qryJournal.Sub_Acct='${subsiText}')) `} 
              ORDER BY  ${parseInt(sort) === 0 ? "qryJournal.mSub_Acct" : "qryJournal.Sub_Acct"}  ${parseInt(order) === 0 ? "ASC" : "DESC"}
        `
      } else {
        qry = `
        SELECT 
              qryJournal.GL_Acct, 
              qryJournal.Sub_Acct, 
              qryJournal.mSub_Acct,
              Sum(qryJournal.mDebit) AS Debit, 
              Sum(qryJournal.mCredit) AS Credit, 
              IF(SUBSTRING(GL_Acct, 1, 1) <= '3' OR SUBSTRING(GL_Acct, 1, 1) = '7', 
              SUM(qryJournal.mDebit) - SUM(qryJournal.mCredit), 
              SUM(qryJournal.mCredit) - SUM(qryJournal.mDebit)) AS Balance
              From (${_qryJournal}) QryJournal 
              WHERE (((qryJournal.Source_Type) <>'BF' And (qryJournal.Source_Type) <>'BFD' And (qryJournal.Source_Type) <>'BFS') AND ((qryJournal.Date_Entry) <='${dateFormatted}')) 
              GROUP BY qryJournal.GL_Acct, qryJournal.Sub_Acct, qryJournal.mSub_Acct 
              ORDER BY  ${parseInt(sort) === 0 ? "qryJournal.mSub_Acct" : "qryJournal.Sub_Acct"}  ${parseInt(order) === 0 ? "ASC" : "DESC"}
        `
      }
    } else if (parseInt(subsi) === 1) {
      if (subsiText.trim().toUpperCase() !== 'ALL') {
        if (report === "GL Account (Detailed)") {
          qry = `
          SELECT * FROM (
             SELECT 
            qryJournal.GL_Acct, qryJournal.ID_No, 
            ifnull(c.Shortname,ifnull(qryJournal.mID,b.Shortname)) as 'mID',
            Sum(qryJournal.mDebit) AS Debit, Sum(qryJournal.mCredit) AS Credit, 
            IF(SUBSTRING(GL_Acct, 1, 1) <= '3' OR SUBSTRING(GL_Acct, 1, 1) = '7', 
                SUM(qryJournal.mDebit) - SUM(qryJournal.mCredit), 
                SUM(qryJournal.mCredit) - SUM(qryJournal.mDebit)) AS Balance
          From (${_qryJournal}) qryJournal 
          left join (${id_entry})  b on b.IDNo = qryJournal.ID_No 
          left join (
          select a.PolicyNo,b.Shortname from Policy a 
          inner join (${id_entry})  b on b.IDNo = a.IDNo) c on c.PolicyNo = qryJournal.ID_No 
          WHERE (((qryJournal.Source_Type)<>'BF' 
          And (qryJournal.Source_Type)<>'BFD' 
          And (qryJournal.Source_Type)<>'BFS') 
          AND 
          ((qryJournal.Date_Entry) <='${dateFormatted}') 
          AND ((qryJournal.ID_No)='${subsiText.trim()}'))  
          GROUP BY qryJournal.GL_Acct, c.shortname,qryJournal.mID,qryJournal.ID_No, b.Shortname 
          HAVING (((qryJournal.GL_Acct)='${account.trim()}')) 
          ) tmp WHERE Balance <> 0 ORDER BY ${parseInt(sort) === 0 ? "mID" : "ID_No"} ${parseInt(order) === 0 ? "ASC" : "DESC"}
          `
        } else {
          qry = `
         select * from ( SELECT 
            Left(GL.GL_Acct,1) AS 'Group Header', 
            Left(GL.GL_Acct,4) AS Header,GL.GL_Acct,CA.Short AS 'mShort',
            '' AS 'Sub_Acct',
            ifnull(gl.ID_No,'') AS 'ID_No',
            ifnull(ID.Shortname,'') as 'mID', 
            sum(Debit) as 'Debit',
            sum(Credit) as 'Credit',
            IF(SUBSTRING(GL_Acct, 1, 1) <= '3' OR SUBSTRING(GL_Acct, 1, 1) = '7', 
            SUM(Debit) - SUM(Credit), 
            SUM(Credit) - SUM(Debit)) AS Balance
          FROM Journal GL 
            INNER JOIN Chart_Account CA  ON CA.Acct_Code = GL.GL_Acct 
            LEFT JOIN Sub_Account SUB  ON SUB.Sub_Acct = GL.Sub_Acct 
            LEFT JOIN (${id_entry}) ID  ON ID.IDNo = GL.ID_No 
          WHERE 
          GL.Source_Type NOT IN ('BF','BFD','BFS') AND
           Date_Entry <= '${dateFormatted}' AND 
           GL.GL_Acct ='${account.trim()}' 
          GROUP BY GL_Acct,ca.Short,gl.ID_No,IfNULL(ID.Shortname,'')  ) a
          where Balance <> 0 
          ORDER BY 'Group Header',Header,GL_Acct,${parseInt(sort) === 0 ? "mID" : "ID_No"} ${parseInt(order) === 0 ? "ASC" : "DESC"}
          `
        }
      } else {
        if (report.trim() === "GL Account (Detailed)") {
          qry = `
            select * from (
            
            SELECT 
          qryJournal.GL_Acct, 
          qryJournal.ID_No, 
          ifNull(c.Shortname,ifNull(qryJournal.mID,b.Shortname)) as 'mID', 
          Sum(qryJournal.mDebit) AS Debit, 
          Sum(qryJournal.mCredit) AS Credit, 
            IF(SUBSTRING(GL_Acct, 1, 1) <= '3' OR SUBSTRING(GL_Acct, 1, 1) = '7', 
                          SUM(qryJournal.mDebit) - SUM(qryJournal.mCredit), 
                          SUM(qryJournal.mCredit) - SUM(qryJournal.mDebit)) AS Balance 
          FROM (${_qryJournal}) qryJournal 
          left join (${id_entry}) b on b.IDNo = qryJournal.ID_No 
          left join (select a.PolicyNo,b.Shortname from Policy a 
          inner join (${id_entry}) b on b.IDNo = a.IDNo) c on c.PolicyNo = qryJournal.ID_No 
          WHERE (((qryJournal.Source_Type)<>'BF' And (qryJournal.Source_Type)<>'BFD' And (qryJournal.Source_Type)<>'BFS') AND ((qryJournal.Date_Entry) <='${dateFormatted}')) 
          GROUP BY qryJournal.GL_Acct, c.shortname,qryJournal.mID,qryJournal.ID_No, b.Shortname 
          Having (((QryJournal.GL_Acct) = '${account.trim()}')) 
            ) a
             WHERE Balance <> 0 ORDER BY ${parseInt(sort) === 0 ? "mID" : "ID_No"} ${parseInt(order) === 0 ? "ASC" : "DESC"}
              `
        } else {
          qry = `
        select * from ( 
        SELECT 
            Left(GL.GL_Acct,1) AS 'Group Header',
            Left(GL.GL_Acct,4) AS Header,
            GL.GL_Acct,CA.Short AS 'mShort',
            '' AS 'Sub_Acct',
            IFNULL(gl.ID_No,'') AS 'ID_No',
            IFNULL(ID.Shortname,'') as 'mID', 
            sum(Debit) as 'Debit',sum(Credit) as 'Credit', 
             IF(SUBSTRING(GL_Acct, 1, 1) <= '3' OR SUBSTRING(GL_Acct, 1, 1) = '7', 
            SUM(Debit) - SUM(Credit), 
            SUM(Credit) - SUM(Debit)) AS Balance
        FROM Journal GL 
        INNER JOIN Chart_Account CA ON CA.Acct_Code = GL.GL_Acct 
        LEFT JOIN Sub_Account SUB ON SUB.Sub_Acct = GL.Sub_Acct 
        LEFT JOIN (${id_entry}) ID ON ID.IDNo = GL.ID_No 
        WHERE GL.Source_Type NOT IN ('BF','BFD','BFS') AND CAST(Date_Entry AS DATE) <= '${dateFormatted}' 
        GROUP BY GL_Acct,ca.Short,gl.ID_No,IFNULL(ID.Shortname,'')  
        ) a
         where Balance <> 0 
        ORDER BY 'Group Header',Header,GL_Acct,${parseInt(sort) === 0 ? "mID" : "ID_No"} ${parseInt(order) === 0 ? "ASC" : "DESC"}`
        }
      }
    } else {
      if (insurance.trim() !== 'ALL') {
        qry = `
        select * from (
          SELECT 
        qryJournal.GL_Acct, 
        qryJournal.Sub_Acct, 
        qryJournal.ID_No, 
        Account.AccountCode AS mID, 
        SUM(qryJournal.mDebit) AS Debit, 
        SUM(qryJournal.mCredit) AS Credit, 
         IF(SUBSTRING(GL_Acct, 1, 1) <= '3' OR SUBSTRING(GL_Acct, 1, 1) = '7', 
                SUM(qryJournal.mDebit) - SUM(qryJournal.mCredit), 
                SUM(qryJournal.mCredit) - SUM(qryJournal.mDebit)) AS Balance 
        FROM (${_qryJournal}) qryJournal 
        LEFT JOIN Policy ON qryJournal.ID_No = Policy.PolicyNo 
        INNER JOIN Policy_Account Account ON Policy.Account = Account.Account 
        WHERE qryJournal.Date_Entry <='${dateFormatted}' 
        GROUP BY Account.AccountCode, qryJournal.Sub_Acct, qryJournal.GL_Acct, qryJournal.ID_No 
        ) a
         where Balance <> 0 ${report === "GL Account (Detailed)" ? ` AND a.GL_Acct='${account.trim()}' ` : ``} AND a.mID = '${insurance}'
        `
      } else {
        qry = `
        select * from (
          SELECT 
        qryJournal.GL_Acct, 
        qryJournal.Sub_Acct, 
        qryJournal.ID_No, 
        Account.AccountCode AS mID, 
        SUM(qryJournal.mDebit) AS Debit, 
        SUM(qryJournal.mCredit) AS Credit, 
         IF(SUBSTRING(GL_Acct, 1, 1) <= '3' OR SUBSTRING(GL_Acct, 1, 1) = '7', 
                SUM(qryJournal.mDebit) - SUM(qryJournal.mCredit), 
                SUM(qryJournal.mCredit) - SUM(qryJournal.mDebit)) AS Balance 
        FROM (${_qryJournal}) qryJournal 
        LEFT JOIN Policy ON qryJournal.ID_No = Policy.PolicyNo 
        INNER JOIN Policy_Account Account ON Policy.Account = Account.Account 
        WHERE qryJournal.Date_Entry <='${dateFormatted}' 
        GROUP BY Account.AccountCode, qryJournal.Sub_Acct, qryJournal.GL_Acct, qryJournal.ID_No 
        ) a
         where Balance <> 0 ${report === "GL Account (Detailed)" ? ` AND a.GL_Acct='${account.trim()}' ` : ``}
        `
      }
    }

    console.log(qry)
    const data = await prisma.$queryRawUnsafe(qry)

    res.send({
      message: "Successfully Get Chart of Account!",
      success: true,
      data
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
