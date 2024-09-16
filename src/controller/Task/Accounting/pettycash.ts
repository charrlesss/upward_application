import express from "express";
import {
  deletePettyCash,
  generatePettyCashID,
  getPettyLog,
  deleteJournalFromPettyCash,
  addJournalFromPettyCash,
  addPettyCash,
  findPettyCash,
  updatePettyCashID,
  searchPettyCash,
  loadSelectedPettyCash,
} from "../../../model/Task/Accounting/pettycash.model";
import generateUniqueUUID from "../../../lib/generateUniqueUUID";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";

const PettyCash = express.Router();

PettyCash.get("/get-petty-log", async (req, res) => {
  try {
    res.send({
      message: "Successfully get petty log",
      success: true,
      pettyLog: await getPettyLog(req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      pettyLog: [],
    });
  }
});

PettyCash.get("/get-petty-cash-id", async (req, res) => {
  try {
    res.send({
      message: "Successfully get petty cash id",
      success: true,
      pettyCashId: await generatePettyCashID(req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      pettyCashId: [],
    });
  }
});

PettyCash.post("/add-petty-cash", async (req, res) => {
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
    const { refNo, datePetty, payee, explanation, hasSelected, pettyCash } =
      req.body;
    if (
      hasSelected &&
      !(await saveUserLogsCode(req, "edit", refNo, "Petty Cash"))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    if (
      !hasSelected &&
      ((await findPettyCash(req.body.refNo, req)) as Array<any>).length > 1
    ) {
      return res.send({
        message: `${req.body.refNo} already exist!`,
        success: false,
      });
    }
    const totalAmount = pettyCash.reduce(
      (accumulator: number, currentValue: any) => {
        return accumulator + parseFloat(currentValue.amount.replace(/,/g, ""));
      },
      0
    );
    await deletePettyCash(refNo, req);
    pettyCash.forEach(async (item: any, i: number) => {
      addPettyCash(
        {
          Branch_Code: "HO",
          PC_Date: datePetty,
          PC_No: refNo,
          Payee: payee,
          Explanation: explanation,
          DRPurpose: item.purpose,
          Debit: parseFloat(item.amount.replace(/,/g, "")),
          DRAcct_Code: item.accountCode,
          DRShort: item.accountShort,
          Sub_Acct: item.sub_account,
          IDNo: item.clientID,
          ShortName: item.clientName,
          CRAcct_Code: "1.01.02",
          CRShort: "Petty Cash",
          Credit: i === 0 ? totalAmount : "0.00",
          DRVATType: item.vatType,
          DRInvoiceNo: item.invoice,
          VATItemNo: await generateUniqueUUID("petty_cash", "VATItemNo"),
        },
        req
      );
    });
    await deleteJournalFromPettyCash(refNo, req);
    pettyCash.forEach(async (item: any, i: number) => {
      await addJournalFromPettyCash(
        {
          Branch_Code: "HO",
          Date_Entry: datePetty,
          Source_Type: "PC",
          Source_No: refNo,
          Explanation: explanation,
          Payto: payee,
          GL_Acct: item.accountCode,
          cGL_Acct: item.accountShort,
          Sub_Acct: item.sub_account,
          ID_No: item.clientID,
          cID_No: item.clientName,
          Debit: parseFloat(item.amount.replace(/,/g, "")),
          Credit: "0.00",
          Remarks: item.purpose,
          VAT_Type: item.vatType,
          OR_Invoice_No: item.invoice,
          VATItemNo: parseInt(item.TempID),
          Source_No_Ref_ID: "",
        },
        req
      );
    });
    await addJournalFromPettyCash(
      {
        Branch_Code: "HO",
        Date_Entry: datePetty,
        Source_Type: "PC",
        Source_No: refNo,
        Explanation: explanation,
        Payto: payee,
        GL_Acct: "1.01.02",
        cGL_Acct: "Petty Cash",
        Sub_Acct: "HO",
        cSub_Acct: "Head Office",
        Credit: totalAmount,
        Remarks: "",
        ID_No: "UIA-1501-030",
        cID_No: "UIA EDSA OFFICE",
        Source_No_Ref_ID: "",
      },
      req
    );
    if (!hasSelected) {
      await updatePettyCashID(req.body.refNo.split("-")[1], req);
    }
    if (!hasSelected) {
      await saveUserLogs(req, refNo, "add", "Petty Cash");
    }
    res.send({
      message: hasSelected
        ? "Successfully update petty cash"
        : "Successfully add petty cash",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

PettyCash.get("/search-petty-cash", async (req, res) => {
  try {
    const { searchPettyCash: search } = req.query;

    res.send({
      message: "Successfully search petty cash",
      success: true,
      searchPettyCash: await searchPettyCash(search as string, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      searchPettyCash: [],
    });
  }
});

PettyCash.post("/load-selected-petty-cash", async (req, res) => {
  try {
    const { PC_No } = req.body;

    res.send({
      message: "Successfully search petty cash",
      success: true,
      loadSelectedPettyCash: await loadSelectedPettyCash(PC_No, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      pettyCash: [],
    });
  }
});

export default PettyCash;
