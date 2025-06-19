import express, { Request, Response } from "express";
import promiseAll from "../../../lib/promise-all";
import {
  createJournal,
  createPolicy,
  deleteJournalBySource,
  deletePolicy,
  findPolicy,
  getClientById,
} from "../../../model/Task/Production/vehicle-policy";
import { getMSPRRate } from "../../../model/Task/Production/mspr-policy";
import {
  createPAPolicy,
  searchPAPolicy,
  deletePAPolicy,
  deletePolicyByPAPolicy,
  searchPAPolicySelected,
} from "../../../model/Task/Production/pa-ppolicy";

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

const PAPolicy = express.Router();

PAPolicy.get("/pa/get-account", async (req, res) => {
  try {
    res.send({
      message: "Successfully get data",
      success: true,
      account: await __executeQuery(
        `SELECT '' as Account union all SELECT Account FROM policy_account where PA = true;`
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

PAPolicy.post("/add-pa-policy", async (req, res) => {
  console.log(req.body);
  convertToPassitive(req);
  const { subAccountRef, clientIDRef, accountRef, policyNoRef } = req.body;

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

  try {
    if (await findPolicy(policyNoRef, req)) {
      return res.send({
        message: "Unable to save! Policy No. already exists!",
        success: false,
      });
    }
    // get Commision rate
    const rate = ((await getMSPRRate(accountRef, "PA", req)) as Array<any>)[0];

    if (rate == null) {
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
    req.body.sumInsuredRef = parseFloat(
      req.body.sumInsuredRef.toString().replace(/,/, "")
    ).toFixed(2);
    await insertPaPolicy({ ...req.body, cStrArea, strArea }, req);
    await saveUserLogs(req, policyNoRef, "add", "PA Policy");
    res.send({ message: "Create PA Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

PAPolicy.post(
  "/selected-search-pa-policy",
  async (req: Request, res: Response) => {
    try {
      res.send({
        message: "Successfully search data",
        success: true,
        data: await searchPAPolicySelected(req.body.policyNo),
      });
    } catch (error: any) {
      console.log(error.message);

      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        vehiclePolicy: null,
      });
    }
  }
);

PAPolicy.post("/search-pa-policy", async (req, res) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      data: await searchPAPolicy(req.body.search),
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

PAPolicy.post("/update-pa-policy", async (req, res) => {
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

  const { subAccountRef, clientIDRef, accountRef, policyNoRef } = req.body;
  try {
    if (!(await saveUserLogsCode(req, "update", policyNoRef, "PA Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    //get Commision rate
    const rate = ((await getMSPRRate(accountRef, "PA", req)) as Array<any>)[0];
    if (rate === null || rate === undefined) {
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
    await deletePolicyByPAPolicy(policyNoRef, req);
    // //delete PA policy
    await deletePAPolicy(policyNoRef, req);
    // //delete journal
    await deleteJournalBySource(policyNoRef, "PL", req);

    // insert pa policy
    await insertPaPolicy({ ...req.body, cStrArea, strArea }, req);

    res.send({ message: "Update PA Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

PAPolicy.post("/delete-pa-policy", async (req, res) => {
  const { PolicyAccount, PolicyNo } = req.body;
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

  try {
    if (!(await saveUserLogsCode(req, "delete", PolicyNo, "PA Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //delete policy
    await deletePolicyByPAPolicy(PolicyNo, req);
    //delete pa policy
    await deletePAPolicy(PolicyNo, req);

    await saveUserLogs(req, PolicyNo, "delete", "PA Policy");
    res.send({ message: "Delete PA Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

async function insertPaPolicy(
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
    propertyInsuredRef,
    netPremiumRef,
    vatRef,
    docstampRef,
    _localGovTaxRef,
    totalDueRef,
    strArea,
    cStrArea,
    sumInsuredRef,
    careOfRef,
  }: any,
  req: Request
) {
  dateFromRef = defaultFormat(new Date(dateFromRef));
  dateToRef = defaultFormat(new Date(dateToRef));
  dateIssuedRef = defaultFormat(new Date(dateIssuedRef));

  //   create  Policy
  await createPolicy(
    {
      IDNo: clientIDRef,
      Account: accountRef,
      SubAcct: subAccountRef,
      PolicyType: "PA",
      PolicyNo: policyNoRef,
      DateIssued: dateIssuedRef,
      TotalPremium: parseFloat(netPremiumRef.toString().replace(/,/g, "")),
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

  // create PA Policy
  await createPAPolicy(
    {
      PolicyNo: policyNoRef,
      Account: accountRef,
      Location: propertyInsuredRef,
      PeriodFrom: dateFromRef,
      PeriodTo: dateToRef,
      sumInsured: parseFloat(sumInsuredRef.replace(/,/g, "")),
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
      Explanation: "PA Production",
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
      Source_No_Ref_ID: "PA",
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
      Explanation: "PA Production",
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
      Source_No_Ref_ID: "PA",
    },
    req
  );
}

export default PAPolicy;
