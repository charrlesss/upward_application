import express from "express";
import { format } from "date-fns";
import { v4 as uuidV4 } from "uuid";
import { qryJournal } from "../../../model/db/views";
import { PrismaList } from "../../../model/connection";

const SubsidiaryLedger = express.Router();
let dt: any = [];
const { CustomPrismaClient } = PrismaList();

SubsidiaryLedger.post("/subsidiary-ledger-report", async (req, res) => {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  let account: string = req.body.account;
  let DateFrom: any = format(new Date(req.body.dateFrom), "MM/dd/yyyy");
  let DateTo: any = format(new Date(req.body.dateTo), "MM/dd/yyyy");
  let subsi: number = req.body.subsi;
  let subsi_options: string = req.body.subsi_options;
  let field: number = req.body.field;
  let Balance = 0;
  let sFilter = " ";
  let Qry = "";


  const balanceForwarded: any = [];
  const report: any = [];
  if (account === "") account = "ALL";
  try {
    switch (subsi) {
      case 0:
        // Balances

        if (account !== "ALL") {
          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit,
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
              FROM (${qryJournal()}) qryJournal
            WHERE 
            ((qryJournal.Source_Type = 'BF' OR qryJournal.Source_Type = 'AB') 
            AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '
            ${new Date(DateFrom).getFullYear()}-${
              new Date(DateFrom).getMonth() + 1
            }-01' 
            AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
              new Date(DateTo),
              "yyyy-MM-dd"
            )}') 
            AND (qryJournal.GL_Acct = '${account}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
            ((qryJournal.Source_Type <> 'BFD' AND qryJournal.Source_Type <> 'BFS') 
            AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
              DateFrom
            ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
            AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
              new Date(DateTo),
              "yyyy-MM-dd"
            )}') AND (qryJournal.GL_Acct = '${account}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          }
        } else {
          // All GL Codes
          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE ((qryJournal.Source_Type = 'BF' OR qryJournal.Source_Type = 'AB') 
            AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
              DateFrom
            ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
            AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
              new Date(DateTo),
              "yyyy-MM-dd"
            )}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE ((qryJournal.Source_Type <> 'BFD' AND qryJournal.Source_Type <> 'BFS') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          }
        }
        if (dt.length > 0) {
          for (let i = 0; i < dt.length; i++) {
            const xsubsidiary_id = uuidV4();
            balanceForwarded.push({
              xsubsidiary_id,
              Date_Entry: format(new Date(DateFrom), "yyyy-MM-dd"),
              Sort_Number: 1,
              Source_Type: "BF",
              Source_No: format(new Date(DateTo), "yyyy-MM-dd"),
              Explanation: "Balance Forwarded",
              Debit: dt[i].mDebit,
              Credit: dt[i].mCredit,
              Bal: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Balance: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Address: field,
              GL_Acct: dt[i].GL_Acct,
            });
          }
        }
        break;
      case 1:
        sFilter = ` AND qryJournal.ID_No = '${subsi_options}'  `;
        // Balances
        if (account !== "ALL") {
          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct,
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit,
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
              (
               (qryJournal.Source_Type = 'BFD' OR qryJournal.Source_Type = 'AB') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
              ${sFilter}
            GROUP BY qryJournal.GL_Acct
            HAVING (qryJournal.GL_Acct = '${account}')
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE (
              (qryJournal.Source_Type <> 'BF' 
              AND qryJournal.Source_Type <> 'BFS')
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
              ${sFilter}
            GROUP BY qryJournal.GL_Acct
            HAVING (qryJournal.GL_Acct = '${account}')
            ORDER BY qryJournal.GL_Acct`;

            dt = await prisma.$queryRawUnsafe(Qry);
          }
        } else {
          // All GL Codes
          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE (
              (qryJournal.Source_Type = 'BFD' OR qryJournal.Source_Type = 'AB') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            ${sFilter} 
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
              (
               (qryJournal.Source_Type <> 'BF' 
              AND qryJournal.Source_Type <> 'BFS') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
              ${sFilter}
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            console.log(Qry);
            dt = await prisma.$queryRawUnsafe(Qry);
          }
        }

        if (dt.length > 0) {
          for (let i = 0; i < dt.length; i++) {
            const xsubsidiary_id = uuidV4();
            balanceForwarded.push({
              xsubsidiary_id,
              Date_Entry: format(new Date(DateFrom), "yyyy-MM-dd"),
              Sort_Number: 1,
              Source_Type: "BF",
              Source_No: format(new Date(DateTo), "yyyy-MM-dd"),
              Explanation: "Balance Forwarded",
              Debit: dt[i].mDebit,
              Credit: dt[i].mCredit,
              Bal: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Balance: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Address: field,
              GL_Acct: dt[i].GL_Acct,
            });
          }
        }
        break;
      case 2:
        sFilter = ` `;
        // Balances
        if (account !== "ALL") {
          sFilter = ` AND qryJournal.Sub_Acct = '${subsi_options}' `;

          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
              ((qryJournal.Sub_Acct = '${subsi_options}') 
              AND (qryJournal.Source_Type = 'BFS' OR qryJournal.Source_Type = 'AB') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            GROUP BY qryJournal.GL_Acct
            HAVING (qryJournal.GL_Acct = '${account}')
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit,
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE ((qryJournal.Sub_Acct = '${subsi_options}') 
              AND (qryJournal.Source_Type <> 'BF' 
              AND qryJournal.Source_Type <> 'BFD') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') < '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            GROUP BY qryJournal.GL_Acct
            HAVING (qryJournal.GL_Acct = '${account}')
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          }
        } else {
          // All GL Codes
          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
              ((qryJournal.Sub_Acct = '${subsi_options}') 
              AND (qryJournal.Source_Type = 'BFS' OR qryJournal.Source_Type = 'AB') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
              ((qryJournal.Sub_Acct = '${subsi_options}') 
              AND (qryJournal.Source_Type <> 'BF' 
              AND qryJournal.Source_Type <> 'BFD') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          }
        }
        if (dt.length > 0) {
          for (let i = 0; i < dt.length; i++) {
            const xsubsidiary_id = uuidV4();
            balanceForwarded.push({
              xsubsidiary_id,
              Date_Entry: format(new Date(DateFrom), "yyyy-MM-dd"),
              Sort_Number: 1,
              Source_Type: "BF",
              Source_No: format(new Date(DateTo), "yyyy-MM-dd"),
              Explanation: "Balance Forwarded",
              Debit: dt[i].mDebit,
              Credit: dt[i].mCredit,
              Bal: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Balance: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Address: field,
              GL_Acct: dt[i].GL_Acct,
            });
          }
        }
        break;
    }
    //Transaction
    if (account !== "ALL") {
      Qry = `
      SELECT
          qryJournal.Number,
          qryJournal.Hide_Code,
          qryJournal.Date_Entry,
          qryJournal.Source_Type,
          qryJournal.Source_No,
          IFNULL(qryJournal.Explanation,'') AS Explanation,
          IFNULL(qryJournal.Payto,'') AS Payto,
          qryJournal.GL_Acct, qryJournal.Sub_Acct,
          qryJournal.ID_No,
          qryJournal.mShort,
          qryJournal.mSub_Acct,
          qryJournal.mID,
          qryJournal.mDebit,
          qryJournal.mCredit,
          IFNULL(qryJournal.Check_Date,'') AS Check_Date,
          IFNULL(qryJournal.Checked,'') AS Checked,
          IFNULL(qryJournal.Bank, '') AS Bank,
          IFNULL(qryJournal.Remarks, '') AS Remarks
      FROM (${qryJournal()}) qryJournal
      WHERE
          ((date_format(qryJournal.Date_Entry,'%Y-%m-%d') >= '${format(
            new Date(DateFrom),
            "yyyy-MM-dd"
          )}'
          AND date_format(qryJournal.Date_Entry,'%Y-%m-%d') <= '${format(
            new Date(DateTo),
            "yyyy-MM-dd"
          )}')
          AND (qryJournal.Source_Type <> 'BF'
          AND qryJournal.Source_Type <> 'BFD'
          AND qryJournal.Source_Type <> 'BFS')
          AND (qryJournal.GL_Acct = '${account}')) 
          ${sFilter}
      ORDER BY qryJournal.Date_Entry, qryJournal.Number, qryJournal.Source_No, qryJournal.Auto`;
      dt = await prisma.$queryRawUnsafe(Qry);
    } else {
      // All GL Code
      Qry = `
      SELECT
        qryJournal.Number,
        qryJournal.Hide_Code,
        qryJournal.Date_Entry,
        qryJournal.Source_Type,
        qryJournal.Source_No,
        qryJournal.Explanation,
        qryJournal.Payto,
        qryJournal.GL_Acct,
        qryJournal.Sub_Acct,
        qryJournal.ID_No,
        qryJournal.mShort,
        qryJournal.mSub_Acct,
        qryJournal.mID,
        qryJournal.mDebit,
        qryJournal.mCredit,
        qryJournal.Check_Date,
        qryJournal.Checked,
        qryJournal.Bank,
        qryJournal.Remarks
      FROM (${qryJournal()}) qryJournal
      WHERE
        ((date_format(qryJournal.Date_Entry,'%Y-%m-%d') >= '${format(
          new Date(DateFrom),
          "yyyy-MM-dd"
        )}'
        AND date_format(qryJournal.Date_Entry,'%Y-%m-%d') <= '${format(
          new Date(DateTo),
          "yyyy-MM-dd"
        )}')
        AND (qryJournal.Source_Type <> 'BF'
        AND qryJournal.Source_Type <> 'BFD'
        AND qryJournal.Source_Type <> 'BFS'))
        ${sFilter}
       ORDER BY
       qryJournal.Date_Entry, qryJournal.Number, qryJournal.Source_No, qryJournal.Auto`;
      dt = await prisma.$queryRawUnsafe(Qry);
    }

    console.log(dt)
    if (dt.length > 0) {
      let dtBal: any = [];
      let lastAcct = "";
      let sParticular = "";
      for (let i = 0; i < dt.length; i++) {
        const xsubsidiary_id = uuidV4();
        if (lastAcct !== chkNull(dt[i].GL_Acct)) {
          lastAcct = chkNull(dt[i].GL_Acct);
          dtBal = balanceForwarded.filter(
            (itms: any) =>
              itms.GL_Acct === lastAcct &&
              itms.Explanation === "Balance Forwarded"
          );
          if (dtBal.length > 0) {
            Balance = dtBal[0].Balance;
          } else {
            Balance = 0;
          }
        }
        Balance =
          Balance + (parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit));

        const fieldList = ["Explanations", "Payee", "Remarks"];
        switch (fieldList[field]) {
          case "Explanations":
            sParticular = clrStr(dt[i].Explanation);
            break;
          case "Payee":
            sParticular = clrStr(dt[i].Payto);
            break;
          case "Remarks":
            sParticular = clrStr(dt[i].Remarks);
            break;
        }
        report.push({
          xsubsidiary_id: xsubsidiary_id,
          Date_Entry: format(new Date(dt[i].Date_Entry), "yyyy-MM-dd"),
          Sort_Number: Number(dt[i].Number),
          Source_Type: dt[i]["Hide_Code"],
          Source_No: dt[i].Source_No,
          Explanation: clrStr(dt[i].Explanation),
          Payto: clrStr(dt[i].Payto),
          GL_Acct: chkNull(dt[i].GL_Acct),
          Sub_Acct: dt[i].Sub_Acct,
          ID_No: clrStr(dt[i].ID_No),
          cGL_Acct: clrStr(chkNull(dt[i].mShort)),
          cSub_Acct: clrStr(dt[i].mSub_Acct),
          cID_No: clrStr(dt[i].mID),
          Debit: dt[i].mDebit,
          Credit: dt[i].mCredit,
          Bal: Math.abs(
            parseFloat(
              (parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit)).toFixed(4)
            )
          ),
          Balance: Math.abs(
            parseFloat(parseFloat(Balance.toString())?.toFixed(4))
          ),
          Check_Date: dt[i].Check_Date ? `${dt[i].Check_Date}` : null,
          Check_No: dt[i].Check ? `${dt[i].Check}` : null,
          Check_Bank: dt[i].Bank ? `${clrStr(dt[i].Bank)}` : null,
          Address: fieldList[field],
          Particulars: sParticular,
        });
      }
    }

    res.send({
      message: "Successuflly Get Report",
      success: true,
      report: JSON.stringify(report),
      reports: report,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      success: false,
    });
  }
});

SubsidiaryLedger.post("/subsidiary-ledger-report-desk", async (req, res) => {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  let account: string = req.body.account;
  let DateFrom: any = format(new Date(req.body.dateFrom), "MM/dd/yyyy");
  let DateTo: any = format(new Date(req.body.dateTo), "MM/dd/yyyy");
  let subsi: number = req.body.subsi;
  let subsi_options: string = req.body.subsi_options;
  let field: number = req.body.field;
  let Balance = 0;
  let sFilter = " ";
  let Qry = "";


  const balanceForwarded: any = [];
  const report: any = [];
  if (account === "") account = "ALL";
  try {
    switch (subsi) {
      case 0:
        // Balances

        if (account !== "ALL") {
          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit,
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
              FROM (${qryJournal()}) qryJournal
            WHERE 
            ((qryJournal.Source_Type = 'BF' OR qryJournal.Source_Type = 'AB') 
            AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '
            ${new Date(DateFrom).getFullYear()}-${
              new Date(DateFrom).getMonth() + 1
            }-01' 
            AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
              new Date(DateTo),
              "yyyy-MM-dd"
            )}') 
            AND (qryJournal.GL_Acct = '${account}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
            ((qryJournal.Source_Type <> 'BFD' AND qryJournal.Source_Type <> 'BFS') 
            AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
              DateFrom
            ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
            AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
              new Date(DateTo),
              "yyyy-MM-dd"
            )}') AND (qryJournal.GL_Acct = '${account}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          }
        } else {
          // All GL Codes
          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE ((qryJournal.Source_Type = 'BF' OR qryJournal.Source_Type = 'AB') 
            AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
              DateFrom
            ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
            AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
              new Date(DateTo),
              "yyyy-MM-dd"
            )}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE ((qryJournal.Source_Type <> 'BFD' AND qryJournal.Source_Type <> 'BFS') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          }
        }
        if (dt.length > 0) {
          for (let i = 0; i < dt.length; i++) {
            const xsubsidiary_id = uuidV4();
            balanceForwarded.push({
              xsubsidiary_id,
              Date_Entry: format(new Date(DateFrom), "yyyy-MM-dd"),
              Sort_Number: 1,
              Source_Type: "BF",
              Source_No: format(new Date(DateTo), "yyyy-MM-dd"),
              Explanation: "Balance Forwarded",
              Debit: dt[i].mDebit,
              Credit: dt[i].mCredit,
              Bal: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Balance: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Address: field,
              GL_Acct: dt[i].GL_Acct,
            });
          }
        }
        break;
      case 1:
        sFilter = ` AND qryJournal.ID_No = '${subsi_options}'  `;
        // Balances
        if (account !== "ALL") {
          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct,
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit,
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
              (
               (qryJournal.Source_Type = 'BFD' OR qryJournal.Source_Type = 'AB') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
              ${sFilter}
            GROUP BY qryJournal.GL_Acct
            HAVING (qryJournal.GL_Acct = '${account}')
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE (
              (qryJournal.Source_Type <> 'BF' 
              AND qryJournal.Source_Type <> 'BFS')
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
              ${sFilter}
            GROUP BY qryJournal.GL_Acct
            HAVING (qryJournal.GL_Acct = '${account}')
            ORDER BY qryJournal.GL_Acct`;

            dt = await prisma.$queryRawUnsafe(Qry);
          }
        } else {
          // All GL Codes
          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE (
              (qryJournal.Source_Type = 'BFD' OR qryJournal.Source_Type = 'AB') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            ${sFilter} 
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
              (
               (qryJournal.Source_Type <> 'BF' 
              AND qryJournal.Source_Type <> 'BFS') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
              ${sFilter}
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            console.log(Qry);
            dt = await prisma.$queryRawUnsafe(Qry);
          }
        }

        if (dt.length > 0) {
          for (let i = 0; i < dt.length; i++) {
            const xsubsidiary_id = uuidV4();
            balanceForwarded.push({
              xsubsidiary_id,
              Date_Entry: format(new Date(DateFrom), "yyyy-MM-dd"),
              Sort_Number: 1,
              Source_Type: "BF",
              Source_No: format(new Date(DateTo), "yyyy-MM-dd"),
              Explanation: "Balance Forwarded",
              Debit: dt[i].mDebit,
              Credit: dt[i].mCredit,
              Bal: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Balance: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Address: field,
              GL_Acct: dt[i].GL_Acct,
            });
          }
        }
        break;
      case 2:
        sFilter = ` `;
        // Balances
        if (account !== "ALL") {
          sFilter = ` AND qryJournal.Sub_Acct = '${subsi_options}' `;

          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
              ((qryJournal.Sub_Acct = '${subsi_options}') 
              AND (qryJournal.Source_Type = 'BFS' OR qryJournal.Source_Type = 'AB') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            GROUP BY qryJournal.GL_Acct
            HAVING (qryJournal.GL_Acct = '${account}')
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit,
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE ((qryJournal.Sub_Acct = '${subsi_options}') 
              AND (qryJournal.Source_Type <> 'BF' 
              AND qryJournal.Source_Type <> 'BFD') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') < '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            GROUP BY qryJournal.GL_Acct
            HAVING (qryJournal.GL_Acct = '${account}')
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          }
        } else {
          // All GL Codes
          if (
            new Date(
              new Date(DateFrom).getMonth() +
                1 +
                "/01/" +
                new Date(DateFrom).getFullYear()
            ) === new Date(DateFrom)
          ) {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
              ((qryJournal.Sub_Acct = '${subsi_options}') 
              AND (qryJournal.Source_Type = 'BFS' OR qryJournal.Source_Type = 'AB') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          } else {
            Qry = `
            SELECT 
              qryJournal.GL_Acct, 
              SUM(IFNULL(qryJournal.mDebit, 0)) AS mDebit, 
              SUM(IFNULL(qryJournal.mCredit, 0)) AS mCredit
            FROM (${qryJournal()}) qryJournal
            WHERE 
              ((qryJournal.Sub_Acct = '${subsi_options}') 
              AND (qryJournal.Source_Type <> 'BF' 
              AND qryJournal.Source_Type <> 'BFD') 
              AND ( date_format(qryJournal.Date_Query,'%Y-%m-%d') >= '${new Date(
                DateFrom
              ).getFullYear()}-${new Date(DateFrom).getMonth() + 1}-01' 
              AND  date_format(qryJournal.Date_Query,'%Y-%m-%d') <= '${format(
                new Date(DateTo),
                "yyyy-MM-dd"
              )}'))
            GROUP BY qryJournal.GL_Acct
            ORDER BY qryJournal.GL_Acct`;
            dt = await prisma.$queryRawUnsafe(Qry);
          }
        }
        if (dt.length > 0) {
          for (let i = 0; i < dt.length; i++) {
            const xsubsidiary_id = uuidV4();
            balanceForwarded.push({
              xsubsidiary_id,
              Date_Entry: format(new Date(DateFrom), "yyyy-MM-dd"),
              Sort_Number: 1,
              Source_Type: "BF",
              Source_No: format(new Date(DateTo), "yyyy-MM-dd"),
              Explanation: "Balance Forwarded",
              Debit: dt[i].mDebit,
              Credit: dt[i].mCredit,
              Bal: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Balance: parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit),
              Address: field,
              GL_Acct: dt[i].GL_Acct,
            });
          }
        }
        break;
    }
    //Transaction
    if (account !== "ALL") {
      Qry = `
      SELECT
          qryJournal.Number,
          qryJournal.Hide_Code,
          qryJournal.Date_Entry,
          qryJournal.Source_Type,
          qryJournal.Source_No,
          IFNULL(qryJournal.Explanation,'') AS Explanation,
          IFNULL(qryJournal.Payto,'') AS Payto,
          qryJournal.GL_Acct, qryJournal.Sub_Acct,
          qryJournal.ID_No,
          qryJournal.mShort,
          qryJournal.mSub_Acct,
          qryJournal.mID,
          qryJournal.mDebit,
          qryJournal.mCredit,
          IFNULL(qryJournal.Check_Date,'') AS Check_Date,
          IFNULL(qryJournal.Checked,'') AS Checked,
          IFNULL(qryJournal.Bank, '') AS Bank,
          IFNULL(qryJournal.Remarks, '') AS Remarks
      FROM (${qryJournal()}) qryJournal
      WHERE
          ((date_format(qryJournal.Date_Entry,'%Y-%m-%d') >= '${format(
            new Date(DateFrom),
            "yyyy-MM-dd"
          )}'
          AND date_format(qryJournal.Date_Entry,'%Y-%m-%d') <= '${format(
            new Date(DateTo),
            "yyyy-MM-dd"
          )}')
          AND (qryJournal.Source_Type <> 'BF'
          AND qryJournal.Source_Type <> 'BFD'
          AND qryJournal.Source_Type <> 'BFS')
          AND (qryJournal.GL_Acct = '${account}')) 
          ${sFilter}
      ORDER BY qryJournal.Date_Entry, qryJournal.Number, qryJournal.Source_No, qryJournal.Auto`;
      dt = await prisma.$queryRawUnsafe(Qry);
    } else {
      // All GL Code
      Qry = `
      SELECT
        qryJournal.Number,
        qryJournal.Hide_Code,
        qryJournal.Date_Entry,
        qryJournal.Source_Type,
        qryJournal.Source_No,
        qryJournal.Explanation,
        qryJournal.Payto,
        qryJournal.GL_Acct,
        qryJournal.Sub_Acct,
        qryJournal.ID_No,
        qryJournal.mShort,
        qryJournal.mSub_Acct,
        qryJournal.mID,
        qryJournal.mDebit,
        qryJournal.mCredit,
        qryJournal.Check_Date,
        qryJournal.Checked,
        qryJournal.Bank,
        qryJournal.Remarks
      FROM (${qryJournal()}) qryJournal
      WHERE
        ((date_format(qryJournal.Date_Entry,'%Y-%m-%d') >= '${format(
          new Date(DateFrom),
          "yyyy-MM-dd"
        )}'
        AND date_format(qryJournal.Date_Entry,'%Y-%m-%d') <= '${format(
          new Date(DateTo),
          "yyyy-MM-dd"
        )}')
        AND (qryJournal.Source_Type <> 'BF'
        AND qryJournal.Source_Type <> 'BFD'
        AND qryJournal.Source_Type <> 'BFS'))
        ${sFilter}
       ORDER BY
       qryJournal.Date_Entry, qryJournal.Number, qryJournal.Source_No, qryJournal.Auto`;
      dt = await prisma.$queryRawUnsafe(Qry);
    }

    console.log(dt)

    if (dt.length > 0) {
      let dtBal: any = [];
      let lastAcct = "";
      let sParticular = "";
      for (let i = 0; i < dt.length; i++) {
        const xsubsidiary_id = uuidV4();
        if (lastAcct !== chkNull(dt[i].GL_Acct)) {
          lastAcct = chkNull(dt[i].GL_Acct);
          dtBal = balanceForwarded.filter(
            (itms: any) =>
              itms.GL_Acct === lastAcct &&
              itms.Explanation === "Balance Forwarded"
          );
          if (dtBal.length > 0) {
            Balance = dtBal[0].Balance;
          } else {
            Balance = 0;
          }
        }
        Balance =
          Balance + (parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit));

        const fieldList = ["Explanations", "Payee", "Remarks"];
        switch (fieldList[field]) {
          case "Explanations":
            sParticular = clrStr(dt[i].Explanation);
            break;
          case "Payee":
            sParticular = clrStr(dt[i].Payto);
            break;
          case "Remarks":
            sParticular = clrStr(dt[i].Remarks);
            break;
        }
        report.push({
          xsubsidiary_id: xsubsidiary_id,
          Date_Entry: format(new Date(dt[i].Date_Entry), "yyyy-MM-dd"),
          Sort_Number: Number(dt[i].Number),
          Source_Type: dt[i]["Hide_Code"],
          Source_No: dt[i].Source_No,
          Explanation: clrStr(dt[i].Explanation),
          Payto: clrStr(dt[i].Payto),
          GL_Acct: chkNull(dt[i].GL_Acct),
          Sub_Acct: dt[i].Sub_Acct,
          ID_No: clrStr(dt[i].ID_No),
          cGL_Acct: clrStr(chkNull(dt[i].mShort)),
          cSub_Acct: clrStr(dt[i].mSub_Acct),
          cID_No: clrStr(dt[i].mID),
          Debit: dt[i].mDebit,
          Credit: dt[i].mCredit,
          Bal: Math.abs(
            parseFloat(
              (parseFloat(dt[i].mDebit) - parseFloat(dt[i].mCredit)).toFixed(4)
            )
          ),
          Balance: Math.abs(
            parseFloat(parseFloat(Balance.toString())?.toFixed(4))
          ),
          Check_Date: dt[i].Check_Date ? `${dt[i].Check_Date}` : null,
          Check_No: dt[i].Check ? `${dt[i].Check}` : null,
          Check_Bank: dt[i].Bank ? `${clrStr(dt[i].Bank)}` : null,
          Address: fieldList[field],
          Particulars: sParticular,
        });
      }
    }

    res.send({
      message: "Successuflly Get Report",
      success: true,
      data: report,
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

function chkNull(value: any) {
  return value ?? "";
}

function clrStr(str: string) {
  return str?.trim();
}
export default SubsidiaryLedger;
