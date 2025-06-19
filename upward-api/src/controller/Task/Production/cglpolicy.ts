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
  createCGLPolicy,
  deleteCGLPolicy,
  deletePolicyByCGL,
  searchCGLPolicy,
  searchCGLPolicySelected,
} from "../../../model/Task/Production/cgl-policy";
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

const CGLPolicy = express.Router();

CGLPolicy.get("/cgl/get-account", async (req, res) => {
  try {
    res.send({
      message: "Successfully get data",
      success: true,
      account: await __executeQuery(
        `SELECT '' as Account union all SELECT Account FROM policy_account where CGL = true;`
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

CGLPolicy.post("/selected-search-cgl-policy", async (req: Request, res: Response) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      data: await searchCGLPolicySelected(req.body.policyNo),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      vehiclePolicy: null,
    });
  }
});
CGLPolicy.post("/add-cgl-policy", async (req, res) => {
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
    const rate = ((await getMSPRRate(accountRef, "CGL", req)) as Array<any>)[0];

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
    await insertCGLPolicy({ ...req.body, cStrArea, strArea }, req);
    await saveUserLogs(req, policyNoRef, "add", "CGL Policy");
    res.send({ message: "Create CGL Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

CGLPolicy.post("/search-cgl-policy", async (req, res) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      data: await searchCGLPolicy(req.body.search),
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

CGLPolicy.post("/update-cgl-policy", async (req, res) => {
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
    if (!(await saveUserLogsCode(req, "edit", policyNoRef, "CGL Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //get Commision rate
    const rate = ((await getMSPRRate(accountRef, "CGL", req)) as Array<any>)[0];

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

    await deleteCGLPolicy(policyNoRef, req);
    await deletePolicyByCGL(policyNoRef, req);
    await deleteJournalBySource(policyNoRef, "PL", req);



    // insert CGL policy
    await insertCGLPolicy({ ...req.body, cStrArea, strArea }, req);

    res.send({ message: "Update CGL Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

CGLPolicy.post("/delete-cgl-policy", async (req, res) => {
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
  const { PolicyAccount, PolicyNo } = req.body;
  try {
    if (!(await saveUserLogsCode(req, "delete", PolicyNo, "CGL Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    await deleteCGLPolicy(PolicyNo, req);
    await deletePolicyByCGL(PolicyNo, req);
    res.send({ message: "Delete CGL Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

async function insertCGLPolicy(
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
    blPremium,
    pdPremium,
    netPremiumRef,
    vatRef,
    docstampRef,
    _localGovTaxRef,
    totalDueRef,
    premisesOperationsRef,
    strArea,
    cStrArea,
    addressRef,
    sumInsuredRef,
    careOfRef
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
      PolicyType: "CGL",
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

  // create CGL Policy
  await createCGLPolicy(
    {
      PolicyNo: policyNoRef,
      Account: accountRef,
      Location: premisesOperationsRef,
      PeriodFrom: dateFromRef,
      PeriodTo: dateToRef,
      LimitA: parseFloat((blPremium || "0.00").replace(/,/g, "")),
      LimitB: parseFloat((pdPremium || "0.00").replace(/,/g, "")),
      address: addressRef,
      sumInsured: parseFloat((sumInsuredRef || "0.00").replace(/,/g, "")),
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
      Explanation: "CGL Production",
      GL_Acct: "1.03.01",
      Sub_Acct: strArea,
      ID_No: policyNoRef,
      cGL_Acct: "Premium Receivable",
      cSub_Acct: cStrArea,
      cID_No: clientNameRef,
      Debit: parseFloat(totalDueRef.replace(/,/g,'')).toFixed(2),
      Credit: "0",
      TC: "P/R",
      Remarks: "",
      Source_No_Ref_ID: "CGL",
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
      Explanation: "CGL Production",
      GL_Acct: "4.02.01",
      Sub_Acct: strArea,
      ID_No: policyNoRef,
      cGL_Acct: "A/P",
      cSub_Acct: cStrArea,
      cID_No: clientNameRef,
      Debit: "0",
      Credit: parseFloat(totalDueRef.replace(/,/g,'')).toFixed(2),
      TC: "A/P",
      Remarks: "",
      Source_No_Ref_ID: "CGL",
    },
    req
  );
}

export default CGLPolicy;
