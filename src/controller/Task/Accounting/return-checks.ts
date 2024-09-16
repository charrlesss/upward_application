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
const ReturnCheck = express.Router();

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
ReturnCheck.get("/get-check-list", async (req, res) => {
  try {
    const checkList = await getCheckList(
      req.query.checkListSearch as string,
      req
    );
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
