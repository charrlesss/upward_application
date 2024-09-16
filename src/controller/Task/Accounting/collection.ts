import express from "express";
import {
  TransactionAndChartAccount,
  collectionIDGenerator,
  createCollection,
  createJournal,
  deleteCollection,
  deleteFromJournalToCollection,
  findORnumber,
  getClientCheckedList,
  getCollections,
  getDrCodeAndTitle,
  getSearchCollection,
  getTransactionBanksDetails,
  getTransactionBanksDetailsDebit,
  getTransactionDescription,
  printModel,
  updateCollectionIDSequence,
  updatePDCCheck,
} from "../../../model/Task/Accounting/collection.model";

import { format } from "date-fns";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";

const Collection = express.Router();

Collection.get("/get-client-checked-by-id", async (req, res) => {
  const { PNo, searchCheckedList } = req.query;

  try {
    const data1 = await getClientCheckedList(
      searchCheckedList as string,
      PNo as string,
      req
    );
    res.send({
      message: "get Data Successfully",
      success: true,
      clientCheckedList: JSON.parse(
        JSON.stringify(data1, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      ),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      clientCheckedList: [],
    });
  }
});

Collection.get("/get-transaction-code-title", async (req, res) => {
  try {
    console.log(await getTransactionDescription(req));
    res.send({
      message: "Get Data Successfully",
      success: true,
      banktransaction: await getTransactionBanksDetails(req),
      transactionDesc: await getTransactionDescription(req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      banktransaction: [],
      transactionDesc: [],
    });
  }
});

Collection.get("/get-new-or-number", async (req, res) => {
  try {
    res.send({
      message: "Get New OR Number Successfully",
      success: true,
      ORNo: await collectionIDGenerator(req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      ORNo: [],
    });
  }
});

Collection.post("/add-collection", async (req, res) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: `CAN'T SAVE, ADMIN IS FOR VIEWING ONLY!`,
      success: false,
    });
  }

  try {
    const isFind = await findORnumber(req.body.ORNo, req);
    if (isFind.length > 0) {
      return res.send({
        message: `${req.body.ORNo} Already Exists!`,
        success: false,
        collectionID: null,
      });
    }

    AddCollection(req);
    await updateCollectionIDSequence(
      {
        last_count: req.body.ORNo,
        year: req.body.ORNo.split(".")[0].slice(0, 2),
        month: req.body.ORNo.split(".")[0].slice(-2),
      },
      req
    );
    const newID = await collectionIDGenerator(req);
    await saveUserLogs(req, req.body.ORNo, "add", "Collection");
    res.send({
      message: "Create Collection Successfully!",
      success: true,
      collectionID: newID,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      collectionID: null,
    });
  }
});

Collection.get("/get-collection-data-search", async (req, res) => {
  const { ORNo } = req.query;
  try {
    res.send({
      message: "Search Collection Successfully",
      success: true,
      collection: await getSearchCollection(ORNo as string, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      collection: [],
    });
  }
});
Collection.get("/search-collection", async (req, res) => {
  const { searchCollectionInput } = req.query;
  try {
    console.log(searchCollectionInput);
    res.send({
      message: "Search Collection Successfully",
      success: true,
      collection: await getCollections(searchCollectionInput as string, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      collection: [],
    });
  }
});

Collection.post("/update-collection", async (req, res) => {
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

  try {
    if (!(await saveUserLogsCode(req, "edit", req.body.ORNo, "Collection"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    await deleteCollection(req.body.ORNo, req);
    AddCollection(req);
    res.send({
      message: "Update Collection Successfully!",
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

Collection.post("/get-drcode-drtitle-from-collection", async (req, res) => {
  try {
    console.log(req.body);
    const data = await getDrCodeAndTitle(req.body.code, req);
    res.send({
      message: "get DR Code and DR Title Collection Successfully!",
      success: true,
      data,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

Collection.post("/on-print", async (req, res) => {
  try {
    console.log(req.body);
    const { data, data1 } = await printModel(req, req.body.ORNo);
    res.send({
      message: "Print Collection Successfully!",
      success: true,
      data,
      data1,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

async function AddCollection(req: any) {
  const debit = JSON.parse(req.body.debit);
  const credit = JSON.parse(req.body.credit);

  const TotalRows =
    debit.length >= credit.length ? debit.length : credit.length;

  for (let i = 0; i <= TotalRows - 1; i++) {
    let Payment = "";
    let Debit = "0";
    let CheckNo = "";
    let CheckDate = "";
    let Bank = "";
    let DRCode = "";
    let DRTitle = "";
    let SlipCode = "";
    let DRCtr = "";
    let DRRemarks = "";
    let Purpose = "";
    let Credit = "0";
    let CRRemarks = "";
    let CRCode = "";
    let CRTitle = "";
    let CRLoanID = "";
    let CRLoanName = "";
    let CRVatType = "";
    let CRInvoiceNo = "";

    if (i <= debit.length - 1) {
      Payment = debit[i].Payment;
      Debit = debit[i].Amount;
      CheckNo = debit[i].Check_No;
      CheckDate = debit[i].Check_Date;
      Bank = debit[i].Bank_Branch;
      DRCode = debit[i].Acct_Code;
      DRTitle = debit[i].Acct_Title;
      SlipCode = debit[i].Deposit_Slip;
      DRCtr = debit[i].Cntr;
      DRRemarks = debit[i].Remarks;
    }
    if (i <= credit.length - 1) {
      Purpose = credit[i].transaction;
      Credit = credit[i].amount;
      CRRemarks = credit[i].Remarks;
      CRCode = credit[i].Code;
      CRTitle = credit[i].Title;
      CRLoanID = credit[i].Account_No;
      CRLoanName = credit[i].Name;
      CRVatType = credit[i].VATType;
      CRInvoiceNo = credit[i].invoiceNo;
    }

    const ColDate =
      i === 0
        ? format(new Date(req.body.Date), "yyyy-MM-dd HH:mm:ss.SSS")
        : null;
    const OR = i === 0 ? req.body.ORNo : "";
    const PNo = i === 0 ? req.body.PNo : "";
    const Name = i === 0 ? req.body.Name : "";

    const newCollection = {
      Date: `${ColDate}`,
      ORNo: OR,
      IDNo: PNo,
      Name: Name,
      Payment: Payment,
      Debit: Debit,
      Check_No: CheckNo,
      Check_Date: CheckDate,
      Bank: Bank,
      DRCode: DRCode,
      DRTitle: DRTitle,
      SlipCode: SlipCode,
      DRRemarks: DRRemarks,
      Purpose: Purpose,
      Credit: Credit,
      CRRemarks: CRRemarks,
      CRCode: CRCode,
      CRTitle: CRTitle,
      CRLoanID: CRLoanID,
      CRLoanName: CRLoanName,
      ID_No: req.body.PNo,
      Official_Receipt: req.body.ORNo,
      Temp_OR: `${req.body.ORNo}${(i + 1).toString().padStart(2, "0")}`,
      Status: "HO",
      Date_OR: format(new Date(req.body.Date), "yyyy-MM-dd HH:mm:ss.SSS"),
      Short: req.body.Name,
      CRVATType: CRVatType,
      CRInvoiceNo: CRInvoiceNo,
    };

    await createCollection(newCollection, req);

    if (i <= debit.length - 1) {
      if (debit[i].Payment.trim().toLowerCase() === "check") {
        await updatePDCCheck(
          {
            ORNum: OR.toUpperCase(),
            PNo: req.body.PNo,
            CheckNo: CheckNo,
          },
          req
        );
      }
    }
  }

  await deleteFromJournalToCollection(req.body.ORNo, req);
  for (let i = 0; i <= debit.length - 1; i++) {
    const [transaction] = (await getTransactionBanksDetailsDebit(
      debit[i].TC,
      req
    )) as Array<any>;

    const Payment = debit[i].Payment;
    const Debit = debit[i].Amount;
    const CheckNo = debit[i].Check_No ?? "";
    const CheckDate = debit[i].Check_Date ?? "";
    const Bank = debit[i].Bank_Branch ?? "";
    const DRCode = transaction.Acct_Code;
    const DRTitle = transaction.Acct_Title;
    const DRRemarks = debit[i].TC;

    await createJournal(
      {
        Branch_Code: "HO",
        Date_Entry: req.body.Date,
        Source_Type: "OR",
        Source_No: req.body.ORNo.toUpperCase(),
        Explanation: `${Payment} Collection at Head Office`,
        Check_No: CheckNo,
        Check_Date: CheckDate,
        Check_Bank: Bank,
        Payto: req.body.Name,
        GL_Acct: DRCode,
        cGL_Acct: DRTitle,
        Sub_Acct: "HO",
        cSub_Acct: "Upward Insurance Agency",
        ID_No: req.body.PNo,
        cID_No: req.body.Name,
        Debit: Debit.replaceAll(",", ""),
        TC: DRRemarks,
        Source_No_Ref_ID: "",
      },
      req
    );
  }

  for (let i = 0; i <= credit.length - 1; i++) {
    const Purpose = credit[i].transaction;
    const Credit = credit[i].amount;
    const CRRemarks = credit[i].Remarks;
    const CRCode = credit[i].Code;
    const CRTitle = credit[i].Title;
    const CRVatType = credit[i].VATType;
    const CRInvoiceNo = credit[i].invoiceNo;

    const CRLoanID = credit[i].Account_No;
    const CRLoanName = credit[i].Name;
    const TC = credit[i].TC;

    await createJournal(
      {
        Branch_Code: "HO",
        Date_Entry: req.body.Date,
        Source_Type: "OR",
        Source_No: req.body.ORNo.toUpperCase(),
        GL_Acct: CRCode,
        cGL_Acct: CRTitle,
        ID_No: CRLoanID,
        cID_No: CRLoanName,
        Explanation: Purpose,
        Sub_Acct: "HO",
        cSub_Acct: "Upward Insurance Agency",
        Credit: Credit.replaceAll(",", ""),
        Remarks: CRRemarks,
        TC: TC,
        VAT_Type: CRVatType,
        OR_Invoice_No: CRInvoiceNo,
        Source_No_Ref_ID: "",
      },
      req
    );
  }
}
export default Collection;
