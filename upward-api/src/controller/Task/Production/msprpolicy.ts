import express, { Request } from "express";
import promiseAll from "../../../lib/promise-all";
import {
  createJournal,
  createPolicy,
  deleteJournalBySource,
  deletePolicy,
  findPolicy,
  getClientById,
} from "../../../model/Task/Production/vehicle-policy";
import {
  createMSPRPolicy,
  deleteMsprPolicy,
  deletePolicyFromMspr,
  getMSPRRate,
  searchMsprPolicy,
  searchSelectedMsprPolicy,
} from "../../../model/Task/Production/mspr-policy";

import {
  getSubAccount,
  getPolicyAccount,
  __executeQuery,
} from "../../../model/Task/Production/policy";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { convertToPassitive } from "../../../lib/convertToPassitive";
import { defaultFormat } from "../../../lib/defaultDateFormat";

const MSPRPolicy = express.Router();

MSPRPolicy.get("/mspr/get-account", async (req, res) => {
  try {
    res.send({
      message: "Successfully get data",
      success: true,
      account: await __executeQuery(
        `SELECT '' as Account union all SELECT Account FROM policy_account where MSPR = true;`
      ),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      account: [],
    });
  }
});

MSPRPolicy.post("/add-mspr-policy", async (req, res) => {
  convertToPassitive(req);
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: "CAN'T SAVE, ADMIN IS FOR VIEWING ONLY!",
      success: false,
    });
  }

  const { subAccountRef, clientIDRef, accountRef, policyNoRef } = req.body;
  try {
    if (await findPolicy(policyNoRef, req)) {
      return res.send({
        message: "Unable to save! Policy No. already exists!",
        success: false,
      });
    }
    // get Commision rate
    const rate = (
      (await getMSPRRate(accountRef, "MSPR", req)) as Array<any>
    )[0];

    if (rate == null || rate == undefined) {
      return res.send({
        message: "Please setup commission rate for this account and Line",
        success: false,
      });
    }

    const subAccount = (
      (await getClientById(clientIDRef, req)) as Array<any>
    )[0];
    const strArea =
      subAccount.Acronym === "" ? subAccountRef : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;
    await insertMSPRPolicy({ ...req.body, cStrArea, strArea }, req);
    await saveUserLogs(req, policyNoRef, "add", "MSPR Policy");
    res.send({ message: "Create MSPR Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
MSPRPolicy.post("/update-mspr-policy", async (req, res) => {
  convertToPassitive(req);
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: "CAN'T UPDATE, ADMIN IS FOR VIEWING ONLY!",
      success: false,
    });
  }
  const { subAccountRef, clientIDRef, accountRef, policyNoRef, policyType } =
    req.body;
  try {
    if (!(await saveUserLogsCode(req, "update", policyNoRef, "MSPR Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //get Commision rate
    const rate = (
      (await getMSPRRate(accountRef, "MSPR", req)) as Array<any>
    )[0];

    if (rate == null || rate == undefined) {
      return res.send({
        message: "Please setup commission rate for this account and Line",
        success: false,
      });
    }

    const subAccount = (
      (await getClientById(clientIDRef, req)) as Array<any>
    )[0];
    const strArea =
      subAccount.Acronym === "" ? subAccountRef : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;

    //delete policy
    await deletePolicyFromMspr(policyNoRef, req);
    // //delete v policy
    await deleteMsprPolicy(policyNoRef, req);
    // //delete journal
    await deleteJournalBySource(policyNoRef, "PL", req);

    // insert fire policy
    await insertMSPRPolicy({ ...req.body, cStrArea, strArea }, req);

    res.send({ message: "Update MSPR Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

MSPRPolicy.post("/search-mspr-policy", async (req, res) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      data: await searchMsprPolicy(req.body.search),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});

MSPRPolicy.post("/selected-search-mspr-policy", async (req, res) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      data: await searchSelectedMsprPolicy(req.body.policyNo),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});

MSPRPolicy.post("/delete-mspr-policy", async (req, res) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: "CAN'T DELETE, ADMIN IS FOR VIEWING ONLY!",
      success: false,
    });
  }
  const { PolicyNo } = req.body;
  try {
    if (!(await saveUserLogsCode(req, "delete", PolicyNo, "MSPR Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //delete policy
    await deletePolicyFromMspr(PolicyNo, req);
    // //delete v policy
    await deleteMsprPolicy(PolicyNo, req);

    await saveUserLogs(req, PolicyNo, "delete", "MSPR Policy");
    res.send({ message: "Delete MSPR Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

async function insertMSPRPolicy(
  {
    subAccountRef,
    clientIDRef,
    clientNameRef,
    agentIdRef,
    agentCommisionRef,
    accountRef,
    policyNoRef,
    dateFromRef,
    dateToRef,
    dateIssuedRef,
    premisesAddressRef,
    moneyRoutesFromRef,
    moneyRoutesToRef,
    safeStrongroomDescRef,
    methodTransportationRef,
    guardsMinimumNumberRef,
    messengerMaximumNumberRef,
    sectionIRef,
    sectionIBRef,
    sectionIIRef,
    premium1Ref,
    premium2Ref,
    premium3Ref,
    netPremiumRef,
    vatRef,
    docstampRef,
    _localGovTaxRef,
    totalDueRef,
    strArea,
    cStrArea,
    careOfRef
  }: any,
  req: Request
) {
  dateFromRef = defaultFormat(new Date(dateFromRef));
  dateToRef = defaultFormat(new Date(dateToRef));
  dateIssuedRef = defaultFormat(new Date(dateIssuedRef));

  //create  Policy
  await createPolicy(
    {
      IDNo: clientIDRef,
      Account: accountRef,
      SubAcct: subAccountRef,
      PolicyType: "MSPR",
      PolicyNo: policyNoRef,
      DateIssued: dateIssuedRef,
      TotalPremium: parseFloat(netPremiumRef.replace(/,/g, "")),
      Vat: parseFloat(vatRef.replace(/,/g, "")).toFixed(2),
      DocStamp: parseFloat(docstampRef.replace(/,/g, "")).toFixed(2),
      FireTax: "0",
      LGovTax: parseFloat(_localGovTaxRef.replace(/,/g, "")).toFixed(2),
      Notarial: "0",
      Misc: "0",
      TotalDue: parseFloat(totalDueRef.replace(/,/g, "")).toFixed(2),
      TotalPaid: "0",
      Journal: false,
      AgentID: agentIdRef,
      AgentCom: agentCommisionRef,
    },
    req
  );

  await createMSPRPolicy(
    {
      PolicyNo: policyNoRef,
      Account: accountRef,
      Location: premisesAddressRef,
      PeriodFrom: dateFromRef,
      PeriodTo: dateToRef,
      OriginPoint: moneyRoutesFromRef,
      DestinationPoint: moneyRoutesToRef,
      Saferoom: safeStrongroomDescRef,
      Method: methodTransportationRef,
      Guard: parseFloat(guardsMinimumNumberRef.replace(/,/g, "")),
      Messenger: parseFloat(messengerMaximumNumberRef.replace(/,/g, "")),
      SecI: parseFloat(sectionIRef.replace(/,/g, "")),
      SecIPremium: parseFloat(premium1Ref.replace(/,/g, "")),
      SecIB: parseFloat(sectionIBRef.replace(/,/g, "")),
      SecIPremiumB: premium2Ref.replace(/,/g, ""),
      SecII: parseFloat(sectionIIRef.replace(/,/g, "")),
      SecIIPremium: parseFloat(premium3Ref.replace(/,/g, "")),
      careOf: careOfRef,
    },
    req
  );

  //debit
  await createJournal(
    {
      Branch_Code: subAccountRef,
      Date_Entry: dateIssuedRef,
      Source_Type: "PL",
      Source_No: policyNoRef,
      Explanation: "MSPR Production",
      GL_Acct: "1.03.01",
      Sub_Acct: strArea,
      ID_No: policyNoRef,
      cGL_Acct: "Premium Receivable",
      cSub_Acct: cStrArea,
      cID_No: clientNameRef,
      Debit: parseFloat(totalDueRef.replace(/,/g, "")).toFixed(2),
      Credit: "0",
      TC: "P/R",
      Remarks: "",
      Source_No_Ref_ID: "MSPR",
    },
    req
  );

  //credit
  await createJournal(
    {
      Branch_Code: subAccountRef,
      Date_Entry: dateIssuedRef,
      Source_Type: "PL",
      Source_No: policyNoRef,
      Explanation: "MSPR Production",
      GL_Acct: "4.02.01",
      Sub_Acct: strArea,
      ID_No: policyNoRef,
      cGL_Acct: "A/P",
      cSub_Acct: cStrArea,
      cID_No: clientNameRef,
      Debit: "0",
      Credit: parseFloat(totalDueRef.replace(/,/g, "")).toFixed(2),
      TC: "A/P",
      Remarks: "",
      Source_No_Ref_ID: "MSPR",
    },
    req
  );
}

function validateNumber(input: string) {
  const sanitizedInput = input.replace(/,/g, "");

  if (isNaN(Number(sanitizedInput))) {
    return "0";
  } else {
    return input;
  }
}

export default MSPRPolicy;
