import express from "express";
import {
  GenerateReturnCheckID,
  addNewReturnCheck,
  deleteReturnCheck,
  getBranchName,
  getCheckList,
  getCreditOnSelectedCheck,
  getDebitOnSelectedCheck,
  updateRCID,
  updatePDCFromReturnCheck,
  updateJournalFromReturnCheck,
  deleteJournalFromReturnCheck,
  addJournalFromReturnCheck,
  searchReturnChecks,
  getReturnCheckSearchFromJournal,
  getReturnCheckSearch,
  findReturnCheck,
} from "../../../model/Task/Accounting/return-checks.model";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import {
  __executeQuery,
  __executeQueryWithParams,
} from "../../../model/Task/Production/policy";
import { selectClient } from "../../../model/Task/Accounting/pdc.model";
import { format } from "date-fns";
const ReturnCheck = express.Router();
// new ============

ReturnCheck.post("/return-check/load-entries", async (req, res) => {
  const qry1 = await __executeQuery(
    `SELECT Account_ID, Short, BankAccounts.IDNo FROM BankAccounts LEFT JOIN Chart_Account ON BankAccounts.Account_ID = Chart_Account.Acct_Code WHERE Account_No = '${req.body.Account_No}'`,
    req
  );
  const qry2 = await __executeQuery(
    `
    SELECT 
      a.*, 
      if(b.ShortName is not null and b.ShortName <> '', b.ShortName ,'Head Office') as ShortName, 
      if(b.Acronym is not null and b.Acronym <> '', b.Acronym ,'HO') as SubAcct
  FROM
      Collection a
          LEFT JOIN
      (SELECT 
          b.ShortName, b.Acronym, a.IDNo
      FROM
          (SELECT 
          *
      FROM
          (SELECT 
          'Client' AS IDType,
              aa.entry_client_id AS IDNo,
              aa.sub_account,
              IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS Shortname,
              aa.entry_client_id AS client_id,
              aa.address
      FROM
          entry_client aa UNION ALL SELECT 
          'Agent' AS IDType,
              aa.entry_agent_id AS IDNo,
              aa.sub_account,
              CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS Shortname,
              aa.entry_agent_id AS client_id,
              aa.address
      FROM
          entry_agent aa UNION ALL SELECT 
          'Employee' AS IDType,
              aa.entry_employee_id AS IDNo,
              aa.sub_account,
              CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS Shortname,
              aa.entry_employee_id AS client_id,
              aa.address
      FROM
          entry_employee aa UNION ALL SELECT 
          'Supplier' AS IDType,
              aa.entry_supplier_id AS IDNo,
              aa.sub_account,
              IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS Shortname,
              aa.entry_supplier_id AS client_id,
              aa.address
      FROM
          entry_supplier aa UNION ALL SELECT 
          'Fixed Assets' AS IDType,
              aa.entry_fixed_assets_id AS IDNo,
              aa.sub_account,
              aa.fullname AS Shortname,
              aa.entry_fixed_assets_id AS client_id,
              aa.description AS address
      FROM
          entry_fixed_assets aa UNION ALL SELECT 
          'Others' AS IDType,
              aa.entry_others_id AS IDNo,
              aa.sub_account,
              aa.description AS Shortname,
              aa.entry_others_id AS client_id,
              aa.description AS address
      FROM
          entry_others aa) id_entry UNION ALL SELECT 
          'Policy' AS IDType,
              a.PolicyNo AS IDNo,
              b.sub_account,
              b.Shortname,
              a.IDNo AS client_id,
              b.address
      FROM
          policy a
      LEFT JOIN (SELECT 
          *
      FROM
          (SELECT 
          'Client' AS IDType,
              aa.entry_client_id AS IDNo,
              aa.sub_account,
              IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS Shortname,
              aa.entry_client_id AS client_id,
              aa.address
      FROM
          entry_client aa UNION ALL SELECT 
          'Agent' AS IDType,
              aa.entry_agent_id AS IDNo,
              aa.sub_account,
              CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS Shortname,
              aa.entry_agent_id AS client_id,
              aa.address
      FROM
          entry_agent aa UNION ALL SELECT 
          'Employee' AS IDType,
              aa.entry_employee_id AS IDNo,
              aa.sub_account,
              CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS Shortname,
              aa.entry_employee_id AS client_id,
              aa.address
      FROM
          entry_employee aa UNION ALL SELECT 
          'Supplier' AS IDType,
              aa.entry_supplier_id AS IDNo,
              aa.sub_account,
              IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS Shortname,
              aa.entry_supplier_id AS client_id,
              aa.address
      FROM
          entry_supplier aa UNION ALL SELECT 
          'Fixed Assets' AS IDType,
              aa.entry_fixed_assets_id AS IDNo,
              aa.sub_account,
              aa.fullname AS Shortname,
              aa.entry_fixed_assets_id AS client_id,
              aa.description AS address
      FROM
          entry_fixed_assets aa UNION ALL SELECT 
          'Others' AS IDType,
              aa.entry_others_id AS IDNo,
              aa.sub_account,
              aa.description AS Shortname,
              aa.entry_others_id AS client_id,
              aa.description AS address
      FROM
          entry_others aa) id_entry) b ON a.IDNo = b.IDNo) a
      LEFT JOIN sub_account b ON a.sub_account = b.Sub_Acct
      LEFT JOIN policy c ON a.IDNo = c.PolicyNo
      LEFT JOIN vpolicy d ON c.PolicyNo = d.PolicyNo) b ON b.IDNo = IF(a.CRLoanID <> ''
              AND a.CRLoanID IS NOT NULL,
          a.CRLoanID,
          a.ID_No)
  WHERE
      a.Official_Receipt = '${req.body.ORNo}'
          AND a.CRCode IS NOT NULL
    `,
    req
  );

  try {
    res.send({
      message: "Successfully Get New Return Check ID.",
      success: true,
      dt1: qry1,
      dt2: qry2,
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      dt1: [],
      dt2: [],
    });
  }
});

ReturnCheck.post("/get-check-list", async (req, res) => {
  try {
    const checkList = await getCheckList(req.body.search, req);
    res.send({
      message: "Successfully Get Check List",
      success: true,
      checkList,
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      checkList: [],
    });
  }
});

ReturnCheck.get("/return-checks/generate-id", async (req, res) => {
  try {
    const yyMM = format(new Date(), "yyMM");
    const rows: any = await __executeQuery(
      `
      SELECT CONCAT(
        SUBSTRING(RC_No, 1, LENGTH(RC_No) - 8), 
        LEFT(RIGHT(RC_No, 8), 4), 
        '-', 
        LPAD(CAST(RIGHT(RC_No, 3) AS UNSIGNED) + 1, 3, '0')
      ) AS NewRefCode
      FROM Return_Checks
      WHERE LEFT(RIGHT(RC_No, 8), 4) = DATE_FORMAT(CURDATE(), '%y%m')
      GROUP BY RC_No
      ORDER BY CAST(RIGHT(RC_No, 3) AS UNSIGNED) DESC
      LIMIT 1;
      `,
      req
    );

    let newRefCode = `${yyMM}-001`;

    if (rows.length > 0) {
      newRefCode = rows[0].NewRefCode;
    }

    res.send({
      message: "Successfully Get Check List",
      success: true,
      newRefCode,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      newRefCode: "",
    });
  }
});

ReturnCheck.post("/return-checks/return-checks-search", async (req, res) => {
  try {
    const qry = `
      SELECT 
        date_format(RC_Date,'%M %d %Y') AS RefDate,
        RC_No AS RefNo,
        Explanation
      FROM Return_Checks
      WHERE (Left(Explanation,7)<>'-- Void') AND 
      (RC_No LIKE '%${req.body.search}%' OR Explanation LIKE '%${req.body.search}%')
      GROUP BY RC_Date, RC_No, Explanation 
      ORDER BY RC_Date desc , RC_No desc
      `;
    console.log(qry);
    res.send({
      message: `Successfully Search Return Checks.`,
      success: true,
      data: await __executeQuery(qry, req),
    });
  } catch (error: any) {
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});

ReturnCheck.post(
  "/return-checks/return-checks-search-selected",
  async (req, res) => {
    try {
      const qry1 = `SELECT * FROM Return_Checks WHERE RC_No = '${req.body.RefNo}' ORDER BY nSort`;
      const qry2 = `SELECT * FROM Journal WHERE Source_Type = 'RC' and Source_No = '${req.body.RefNo}'`;
      const data1 = await __executeQuery(qry1, req);
      const data2 = await __executeQuery(qry2, req);

      const replacer = (key:any, value:any) => (typeof value === 'bigint' ? value.toString() : value);

      res.send({
        message: `Successfully Search Return Checks.`,
        success: true,
        data1: JSON.stringify(data1, replacer),
        data2: JSON.stringify(data2, replacer),
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data1: [],
        data2: [],
      });
    }
  }
);

ReturnCheck.post("/return-checks/save", async (req, res) => {
  try {
    const BranchCode = "HO";
    const BranchName = "Head Office";
    await __executeQuery(
      `DELETE FROM Return_Checks WHERE RC_No ='${req.body.refNo}'`,
      req
    );

    req.body.dgvSelChecks.forEach(async (selCheckItm: any, index: number) => {
      const insertQuery = `
      INSERT INTO \`return_checks\`
      (\`Area\`,
      \`RC_Date\`,
      \`RC_No\`,
      \`Explanation\`,
      \`Check_No\`,
      \`Date_Deposit\`,
       \`Amount\`,
       \`Reason\`,
       \`Bank\`,
       \`Check_Date\`,
       \`Date_Return\`,
       \`SlipCode\`,
       \`ORNum\`,
       \`BankAccnt\`,
       \`nSort\`,
      \`Date_Collect\`,
      \`Temp_RCNo\`)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);
    `;
      await __executeQueryWithParams(
        insertQuery,
        [
          BranchCode,
          req.body.date,
          req.body.refNo,
          req.body.explanation,
          selCheckItm[4],
          selCheckItm[3],
          parseFloat(selCheckItm[6].toString().replace(/,/g, "")),
          selCheckItm[9],
          selCheckItm[7],
          selCheckItm[5],
          selCheckItm[10],
          selCheckItm[2],
          selCheckItm[0],
          selCheckItm[8],
          (index + 1).toString().padStart(2, "00"),
          selCheckItm[1],
          `${req.body.refNo}${(parseInt(req.body.refNo.split("-")[1]) + index)
            .toString()
            .padStart(2, "0")}`,
        ],
        req
      );

      await __executeQueryWithParams(
        `UPDATE PDC SET SlipCode = '', ORNum = '' WHERE Check_No = ?`,
        [selCheckItm[4]],
        req
      );

      // Update Journal
      await __executeQueryWithParams(
        `UPDATE Journal SET TC = 'RTC' WHERE Check_No = ? AND Source_No = ? AND Source_Type = 'OR'`,
        [selCheckItm[4], selCheckItm[0]],
        req
      );
    });

    await __executeQueryWithParams(
      `DELETE FROM Journal WHERE Source_No = ? AND Source_Type = 'RC'`,
      [req.body.refNo],
      req
    );

    for (const accountingEntrItm of req.body.dgvAccountingEntry) {
      const journalQuery = `
      INSERT INTO \`journal\`
      (\`Branch_Code\`,
      \`Date_Entry\`,

      \`Source_Type\`,
      \`Source_No\`,
      \`Explanation\`,
      \`GL_Acct\`,
      \`cGL_Acct\`,
      \`Sub_Acct\`,
      \`cSub_Acct\`,
      \`ID_No\`,
      \`cID_No\`,
      \`Debit\`,

      \`Credit\`,
      \`Check_Date\`,
      \`Check_No\`,
      \`Check_Bank\`,
      \`Check_Return\`,
      \`Check_Deposit\`,
      \`Check_Collect\`,
      \`Check_Reason\`,
      \`TC\`,
      \`Source_No_Ref_ID\`)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);
    `;
      await __executeQueryWithParams(
        journalQuery,
        [
          BranchCode,
          req.body.date,
          "RC",
          req.body.refNo,
          req.body.explanation,
          accountingEntrItm[0],
          accountingEntrItm[1],
          BranchCode,
          BranchName,
          accountingEntrItm[4],

          accountingEntrItm[5],
          parseFloat(accountingEntrItm[2].toString().replace(/,/g, "")),
          parseFloat(accountingEntrItm[3].toString().replace(/,/g, "")),
          accountingEntrItm[10],
          accountingEntrItm[8],
          accountingEntrItm[9],
          accountingEntrItm[11],
          accountingEntrItm[14],
          accountingEntrItm[15],
          accountingEntrItm[12],

          "RTC",
          "",
        ],
        req
      );
    }
    await updateRCID(req.body.refNo.split("-")[1], req);

    await saveUserLogs(
      req,
      req.body.refNo,
      req.body.mode === "add" ? "edit" : "update",
      "Return Check"
    );
    res.send({
      message: "Successfully Save Return Check",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      checkList: [],
    });
  }
});
ReturnCheck.post("/return-checks/update", async (req, res) => {
  try {
    const { userAccess }: any = await VerifyToken(
      req.cookies["up-ac-login"] as string,
      process.env.USER_ACCESS as string
    );

    if (userAccess.includes("ADMIN")) {
      return res.send({
        message: `CAN'T UPDATE, ADMIN IS FOR VIEWING ONLY!`,
        success: false,
      });
    }


    if (!(await saveUserLogsCode(req, "update", req.body.refNo, "Return Checks"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    const BranchCode = "HO";
    const BranchName = "Head Office";
    await __executeQuery(
      `DELETE FROM Return_Checks WHERE RC_No ='${req.body.refNo}'`,
      req
    );

    req.body.dgvSelChecks.forEach(async (selCheckItm: any, index: number) => {
      const insertQuery = `
      INSERT INTO \`return_checks\`
      (\`Area\`,
      \`RC_Date\`,
      \`RC_No\`,
      \`Explanation\`,
      \`Check_No\`,
      \`Date_Deposit\`,
       \`Amount\`,
       \`Reason\`,
       \`Bank\`,
       \`Check_Date\`,
       \`Date_Return\`,
       \`SlipCode\`,
       \`ORNum\`,
       \`BankAccnt\`,
       \`nSort\`,
      \`Date_Collect\`,
      \`Temp_RCNo\`)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);
    `;
      await __executeQueryWithParams(
        insertQuery,
        [
          BranchCode,
          req.body.date,
          req.body.refNo,
          req.body.explanation,
          selCheckItm[4],
          selCheckItm[3],
          parseFloat(selCheckItm[6].toString().replace(/,/g, "")),
          selCheckItm[9],
          selCheckItm[7],
          selCheckItm[5],
          selCheckItm[10],
          selCheckItm[2],
          selCheckItm[0],
          selCheckItm[8],
          (index + 1).toString().padStart(2, "00"),
          selCheckItm[1],
          `${req.body.refNo}${(parseInt(req.body.refNo.split("-")[1]) + index)
            .toString()
            .padStart(2, "0")}`,
        ],
        req
      );

      await __executeQueryWithParams(
        `UPDATE PDC SET SlipCode = '', ORNum = '' WHERE Check_No = ?`,
        [selCheckItm[4]],
        req
      );

      // Update Journal
      await __executeQueryWithParams(
        `UPDATE Journal SET TC = 'RTC' WHERE Check_No = ? AND Source_No = ? AND Source_Type = 'OR'`,
        [selCheckItm[4], selCheckItm[0]],
        req
      );
    });

    await __executeQueryWithParams(
      `DELETE FROM Journal WHERE Source_No = ? AND Source_Type = 'RC'`,
      [req.body.refNo],
      req
    );

    for (const accountingEntrItm of req.body.dgvAccountingEntry) {
      const journalQuery = `
      INSERT INTO \`journal\`
      (\`Branch_Code\`,
      \`Date_Entry\`,

      \`Source_Type\`,
      \`Source_No\`,
      \`Explanation\`,
      \`GL_Acct\`,
      \`cGL_Acct\`,
      \`Sub_Acct\`,
      \`cSub_Acct\`,
      \`ID_No\`,
      \`cID_No\`,
      \`Debit\`,

      \`Credit\`,
      \`Check_Date\`,
      \`Check_No\`,
      \`Check_Bank\`,
      \`Check_Return\`,
      \`Check_Deposit\`,
      \`Check_Collect\`,
      \`Check_Reason\`,
      \`TC\`,
      \`Source_No_Ref_ID\`)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);
    `;
      await __executeQueryWithParams(
        journalQuery,
        [
          BranchCode,
          req.body.date,
          "RC",
          req.body.refNo,
          req.body.explanation,
          accountingEntrItm[0],
          accountingEntrItm[1],
          BranchCode,
          BranchName,
          accountingEntrItm[4],

          accountingEntrItm[5],
          parseFloat(accountingEntrItm[2].toString().replace(/,/g, "")),
          parseFloat(accountingEntrItm[3].toString().replace(/,/g, "")),
          accountingEntrItm[10],
          accountingEntrItm[8],
          accountingEntrItm[9],
          accountingEntrItm[11],
          accountingEntrItm[14],
          accountingEntrItm[15],
          accountingEntrItm[12],

          "RTC",
          "",
        ],
        req
      );
    }

    await saveUserLogs(
      req,
      req.body.refNo,
      req.body.mode === "add" ? "edit" : "update",
      "Return Check"
    );
    res.send({
      message: "Successfully Save Return Check",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      checkList: [],
    });
  }
});
//// old ===============

ReturnCheck.get("/get-new-return-check-id", async (req, res) => {
  try {
    res.send({
      message: "Successfully Get New Return Check ID.",
      success: true,
      returnCheckID: await GenerateReturnCheckID(req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      returnCheckID: [],
    });
  }
});

ReturnCheck.post("/get-modal-return-check-data", async (req, res) => {
  try {
    res.send({
      message: "Successfully Get Modal Data",
      success: true,
      credit: await getCreditOnSelectedCheck(req.body.BankAccount, req),
      debit: await getDebitOnSelectedCheck(req.body.Official_Receipt, req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      credit: [],
      debit: [],
    });
  }
});
ReturnCheck.post("/add-return-check", async (req, res) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: `CAN'T ${
        req.body.isUpdated ? "UPDATE" : "SAVE"
      }, ADMIN IS FOR VIEWING ONLY!`,
      success: false,
    });
  }
  try {
    if (
      req.body.isUpdated &&
      !(await saveUserLogsCode(req, "edit", req.body.RefNo, "Return Check"))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    if (
      !req.body.isUpdated &&
      ((await findReturnCheck(req.body.RefNo, req)) as Array<any>).length > 0
    ) {
      return res.send({
        message: `${req.body.RefNo} already exists!`,
        success: false,
        isClearableError: false,
        credit: [],
        debit: [],
      });
    }

    await deleteReturnCheck(req.body.RefNo, req);
    req.body.selected.forEach(async (items: any, index: number) => {
      await addNewReturnCheck(
        {
          Area: req.body.BranchCode,
          RC_Date: req.body.DateReturn,
          RC_No: req.body.RefNo,
          Explanation: req.body.Explanation,
          Check_No: items.Check_No,
          Date_Deposit: new Date(items.DepoDate).toISOString(),
          Amount: parseFloat(items.Amount.replace(/,/g, "")).toFixed(2),
          Reason: items.Reason,
          Bank: items.Bank,
          Check_Date: items.Check_Date,
          Date_Return: items.Return_Date,
          SlipCode: items.DepoSlip,
          ORNum: items.OR_NO,
          BankAccnt: items.Bank_Account,
          nSort: (index + 1).toString().padStart(2, "00"),
          Date_Collect: new Date(items.OR_Date),
          Temp_RCNo: `${req.body.RefNo}${(
            parseInt(req.body.RefNo.split("-")[1]) + index
          )
            .toString()
            .padStart(2, "0")}`,
        },
        req
      );
      await updatePDCFromReturnCheck(items.Check_No, req);
      await updateJournalFromReturnCheck(items.Check_No, items.DepoSlip, req);
    });

    await deleteJournalFromReturnCheck(req.body.RefNo, req);

    req.body.accountingEntry.forEach(async (items: any) => {
      await addJournalFromReturnCheck(
        {
          Branch_Code: req.body.BranchCode,
          Date_Entry: req.body.DateReturn,
          Source_Type: "RC",
          Source_No: req.body.RefNo,
          Explanation: req.body.Explanation,
          GL_Acct: items.Code,
          cGL_Acct: items.AccountName,
          Sub_Acct: items.SubAcct,
          cSub_Acct: items.SubAcctName,
          ID_No: items.IDNo,
          cID_No: items.Identity,
          Debit: parseFloat(items.Debit?.toString().replace(/,/g, "")).toFixed(
            2
          ),
          Credit: parseFloat(
            items.Credit?.toString().replace(/,/g, "")
          ).toFixed(2),
          Check_Date: items.Check_Date,
          Check_No: items.Check_No,
          Check_Bank: items.Bank,
          Check_Return: items.Check_Return,
          Check_Deposit: items.DepoDate,
          Check_Collect: items.Date_Collection,
          Check_Reason: items.Check_Reason,
          TC: "RTC",
          Source_No_Ref_ID: "",
        },
        req
      );
    });
    await updateRCID(req.body.RefNo.split("-")[1], req);
    if (!req.body.isUpdated) {
      await saveUserLogs(req, req.body.RefNo, "add", "Return Check");
    }

    res.send({
      message: req.body.isUpdated
        ? "Successfully update return check"
        : "Successfully add return check",
      success: true,
      isClearableError: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      credit: [],
      debit: [],
      isClearableError: false,
    });
  }
});
ReturnCheck.get("/search-return-checks", async (req, res) => {
  const { searchReturnChecks: search } = req.query;
  try {
    res.send({
      message: "Successfully search return check",
      success: true,
      returnCheckSearch: await searchReturnChecks(search as string, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      returnCheckSearch: [],
    });
  }
});
ReturnCheck.post(
  "/get-search-selected-checks-information",
  async (req, res) => {
    try {
      res.send({
        message: "Successfully search return check",
        success: true,
        accountingEntry: await getReturnCheckSearchFromJournal(
          req.body.RC_No,
          req
        ),
        selected: await getReturnCheckSearch(req.body.RC_No, req),
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
      });
    }
  }
);

export default ReturnCheck;
