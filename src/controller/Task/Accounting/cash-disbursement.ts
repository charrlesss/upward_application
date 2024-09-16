import express from "express";
import {
  AddNewCashDisbursement,
  AddNewJournalFromCashDisbursement,
  GenerateCashDisbursementID,
  DeleteNewCashDisbursement,
  DeleteNewJournalFromCashDisbursement,
  updateCashDisbursementID,
  findCashDisbursement,
  searchCashDisbursement,
  findSearchSelectedCashDisbursement,
  insertVoidJournalFromCashDisbursement,
  insertVoidCashDisbursement,
} from "../../../model/Task/Accounting/cash-disbursement.model";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
const CashDisbursement = express.Router();

CashDisbursement.get("/cash-disbursement/generate-id", async (req, res) => {
  try {
    res.send({
      message: "Successfully get cash disbursement id",
      success: true,
      generatedId: await GenerateCashDisbursementID(req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      generatedId: [],
    });
  }
});

CashDisbursement.post(
  "/cash-disbursement/add-cash-disbursement",
  async (req, res) => {
    const { userAccess }: any = await VerifyToken(
      req.cookies["up-ac-login"] as string,
      process.env.USER_ACCESS as string
    );
    if (userAccess.includes("ADMIN")) {
      return res.send({
        message: `CAN'T ${
          req.body.hasSelected ? "UPDATE" : "SAVE"
        }, ADMIN IS FOR VIEWING ONLY!`,
        success: false,
      });
    }

    try {
      if (
        req.body.hasSelected &&
        !(await saveUserLogsCode(
          req,
          "edit",
          req.body.refNo,
          "Cash-Disbursement"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }

      const cashDisbursement = (await findCashDisbursement(
        req.body.refNo,
        req
      )) as Array<any>;
      if (cashDisbursement.length > 0 && !req.body.hasSelected) {
        return res.send({
          message: `${req.body.refNo} already exist!`,
          success: true,
        });
      }
      await DeleteNewCashDisbursement(req.body.refNo, req);
      await DeleteNewJournalFromCashDisbursement(req.body.refNo, req);
      req.body.cashDisbursement.forEach(async (item: any, index: number) => {
        await AddNewCashDisbursement(
          {
            Branch_Code: item.BranchCode,
            Date_Entry: req.body.dateEntry,
            Source_Type: "CV",
            Source_No: req.body.refNo,
            Explanation: req.body.explanation,
            Particulars: req.body.particulars,
            Payto: item.Payto,
            Address: item.address,
            GL_Acct: item.code,
            cGL_Acct: item.acctName,
            cSub_Acct: item.subAcctName,
            cID_No: item.ClientName,
            Debit: parseFloat(item.debit.replace(/,/g, "")),
            Credit: parseFloat(item.credit.replace(/,/g, "")),
            Check_No: item.code === "1.01.10" ? item.checkNo : "",
            Check_Date: item.code === "1.01.10" ? item.checkDate : "",
            Remarks: item.remarks,
            Sub_Acct: item.subAcct,
            ID_No: item.IDNo,
            TC: item.TC_Code,
            VAT_Type: item.vatType,
            OR_Invoice_No: item.invoice,
            VATItemNo: parseInt(item.TempID),
          },
          req
        );
        await AddNewJournalFromCashDisbursement(
          {
            Branch_Code: "HO",
            Date_Entry: req.body.dateEntry,
            Source_Type: "CV",
            Source_No: req.body.refNo,
            Explanation: req.body.explanation,
            Particulars: req.body.particulars,
            Payto: item.Payto,
            Address: item.address,
            GL_Acct: item.code,
            cGL_Acct: item.acctName,
            cSub_Acct: item.subAcctName,
            cID_No: item.ClientName,
            Debit: parseFloat(item.debit.replace(/,/g, "")),
            Credit: parseFloat(item.credit.replace(/,/g, "")),
            Check_No: item.code === "1.01.10" ? item.checkNo : "",
            Check_Date: item.code === "1.01.10" ? item.checkDate : "",
            Remarks: item.remarks,
            Sub_Acct: "HO",
            ID_No: item.IDNo,
            TC: item.TC_Code,
            VAT_Type: item.vatType,
            OR_Invoice_No: item.invoice,
            VATItemNo: parseInt(item.TempID),
            Source_No_Ref_ID: "",
          },
          req
        );
      });

      if (!req.body.hasSelected) {
        await updateCashDisbursementID(req.body.refNo.split("-")[1], req);
        await saveUserLogs(req, req.body.refNo, "add", "Cash-Disbursement");
      }

      res.send({
        message: req.body.hasSelected
          ? `Successfully update ${req.body.refNo}  in cash disbursement`
          : `Successfully add new ${req.body.refNo} in cash disbursement`,
        success: true,
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

CashDisbursement.post(
  "/cash-disbursement/void-cash-disbursement",
  async (req, res) => {
    const { userAccess }: any = await VerifyToken(
      req.cookies["up-ac-login"] as string,
      process.env.USER_ACCESS as string
    );
    if (userAccess.includes("ADMIN")) {
      return res.send({
        message: `CAN'T VOID, ADMIN IS FOR VIEWING ONLY!`,
        success: false,
      });
    }

    try {
      if (
        !(await saveUserLogsCode(
          req,
          "void",
          req.body.refNo,
          "Cash-Disbursement"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }

      await DeleteNewCashDisbursement(req.body.refNo, req);
      await insertVoidJournalFromCashDisbursement(
        req.body.refNo,
        req.body.dateEntry,
        req
      );
      await DeleteNewJournalFromCashDisbursement(req.body.refNo, req);
      await insertVoidCashDisbursement(req.body.refNo, req.body.dateEntry, req);
      await saveUserLogs(req, req.body.refNo, "void", "Cash-Disbursement");
      res.send({
        message: `Successfully void ${req.body.refNo} in cash disbursement`,
        success: true,
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

CashDisbursement.get(
  "/cash-disbursement/search-cash-disbursement",
  async (req, res) => {
    try {
      const { searchCashDisbursement: search } = req.query;
      res.send({
        message: "Successfully get search cash disbursement",
        success: true,
        search: await searchCashDisbursement(search as string, req),
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        search: [],
      });
    }
  }
);

CashDisbursement.post(
  "/cash-disbursement/get-selected-search-cash-disbursement",
  async (req, res) => {
    try {
      const selectedCashDisbursement = await findSearchSelectedCashDisbursement(
        req.body.Source_No,
        req
      );
      res.send({
        message: "Successfully get selected search in cash disbursement",
        success: true,
        selectedCashDisbursement,
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        selectedCashDisbursement: [],
      });
    }
  }
);

export default CashDisbursement;
