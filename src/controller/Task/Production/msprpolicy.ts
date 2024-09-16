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
} from "../../../model/Task/Production/mspr-policy";

import {
  getSubAccount,
  getPolicyAccount,
} from "../../../model/Task/Production/policy";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { convertToPassitive } from "../../../lib/convertToPassitive";

const MSPRPolicy = express.Router();

MSPRPolicy.get("/get-mspr-policy", (req, res) => {
  try {
    promiseAll([getSubAccount(req), getPolicyAccount("MSPR", req)]).then(
      ([sub_account, policy_account]: any) => {
        res.send({
          message: "Successfully get data",
          success: true,
          msprPolicy: {
            sub_account,
            policy_account,
          },
        });
      }
    );
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      bondsPolicy: null,
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

  const { sub_account, client_id, PolicyAccount, PolicyNo } = req.body;
  try {
    if (await findPolicy(PolicyNo, req)) {
      return res.send({
        message: "Unable to save! Policy No. already exists!",
        success: false,
      });
    }
    // get Commision rate
    const rate = (
      (await getMSPRRate(PolicyAccount, "MSPR", req)) as Array<any>
    )[0];

    if (rate == null || rate == undefined) {
      return res.send({
        message: "Please setup commission rate for this account and Line",
        success: false,
      });
    }

    const subAccount = ((await getClientById(client_id, req)) as Array<any>)[0];
    const strArea =
      subAccount.Acronym === "" ? sub_account : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;
    await insertMSPRPolicy({ ...req.body, cStrArea, strArea }, req);
    await saveUserLogs(req, PolicyNo, "add", "MSPR Policy");
    res.send({ message: "Create MSPR Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

MSPRPolicy.get("/search-mspr-policy", async (req, res) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      msprPolicy: await searchMsprPolicy(
        req.query.searchMsprPolicy as string,
        req
      ),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      msprPolicy: null,
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
  const { sub_account, client_id, PolicyAccount, PolicyNo, policyType } =
    req.body;
  try {
    if (!(await saveUserLogsCode(req, "update", PolicyNo, "MSPR Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //get Commision rate
    const rate = (
      (await getMSPRRate(PolicyAccount, "MSPR", req)) as Array<any>
    )[0];

    if (rate == null || rate == undefined) {
      return res.send({
        message: "Please setup commission rate for this account and Line",
        success: false,
      });
    }

    const subAccount = ((await getClientById(client_id, req)) as Array<any>)[0];
    const strArea =
      subAccount.Acronym === "" ? sub_account : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;

    //delete policy
    await deletePolicyFromMspr(PolicyNo, req);
    // //delete v policy
    await deleteMsprPolicy(PolicyNo, req);
    // //delete journal
    await deleteJournalBySource(PolicyNo, "PL", req);

    req.body.DateIssued = new Date(req.body.DateIssued).toISOString();

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
    sub_account,
    client_id,
    client_name,
    agent_id,
    agent_com,
    PolicyAccount,
    PolicyNo,
    DateFrom,
    DateTo,
    DateIssued,
    pAddress,
    moneyRoutesFrom,
    moneyRoutesTo,
    safeDesc,
    methodTrans,
    guardsMinNum,
    messengerMaxNum,
    sec1,
    sec2,
    sec3,
    prem1,
    prem2,
    prem3,
    netPremium,
    vat,
    docStamp,
    localGovTax,
    totalDue,
    strArea,
    cStrArea,
  }: any,
  req: Request
) {
  //create  Policy
  await createPolicy(
    {
      IDNo: client_id,
      Account: PolicyAccount,
      SubAcct: sub_account,
      PolicyType: "MSPR",
      PolicyNo: PolicyNo,
      DateIssued,
      TotalPremium: parseFloat(parseFloat(netPremium).toFixed(2)),
      Vat: vat,
      DocStamp: docStamp,
      FireTax: "0",
      LGovTax: localGovTax,
      Notarial: "0",
      Misc: "0",
      TotalDue: totalDue,
      TotalPaid: "0",
      Journal: false,
      AgentID: agent_id,
      AgentCom: agent_com,
    },
    req
  );

  await createMSPRPolicy(
    {
      PolicyNo,
      Account: PolicyAccount,
      Location: pAddress,
      PeriodFrom: DateFrom,
      PeriodTo: DateTo,
      OriginPoint: moneyRoutesFrom,
      DestinationPoint: moneyRoutesTo,
      Saferoom: safeDesc,
      Method: methodTrans,
      Guard: parseFloat(parseFloat(validateNumber(guardsMinNum)).toFixed(2)),
      Messenger: parseFloat(
        parseFloat(validateNumber(messengerMaxNum)).toFixed(2)
      ),
      SecI: validateNumber(sec1),
      SecIPremium: validateNumber(prem1),
      SecIB: validateNumber(sec2),
      SecIPremiumB: prem2,
      SecII: validateNumber(sec3),
      SecIIPremium: validateNumber(prem3),
    },
    req
  );

  //debit
  await createJournal(
    {
      Branch_Code: sub_account,
      Date_Entry: DateIssued,
      Source_Type: "PL",
      Source_No: PolicyNo,
      Explanation: "MSPR Production",
      GL_Acct: "1.03.01",
      Sub_Acct: strArea,
      ID_No: PolicyNo,
      cGL_Acct: "Premium Receivable",
      cSub_Acct: cStrArea,
      cID_No: client_name,
      Debit: parseFloat(totalDue).toFixed(2),
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
      Branch_Code: sub_account,
      Date_Entry: DateIssued,
      Source_Type: "PL",
      Source_No: PolicyNo,
      Explanation: "MSPR Production",
      GL_Acct: "4.02.01",
      Sub_Acct: strArea,
      ID_No: PolicyNo,
      cGL_Acct: "A/P",
      cSub_Acct: cStrArea,
      cID_No: client_name,
      Debit: "0",
      Credit: parseFloat(totalDue).toFixed(2),
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
