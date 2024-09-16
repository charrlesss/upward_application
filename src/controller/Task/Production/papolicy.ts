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
import { getMSPRRate } from "../../../model/Task/Production/mspr-policy";
import {
  createPAPolicy,
  searchPAPolicy,
  deletePAPolicy,
  deletePolicyByPAPolicy,
  findPAPolicy,
} from "../../../model/Task/Production/pa-ppolicy";

import {
  getSubAccount,
  getPolicyAccount,
} from "../../../model/Task/Production/policy";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { convertToPassitive } from "../../../lib/convertToPassitive";

const PAPolicy = express.Router();

PAPolicy.get("/get-pa-policy", (req, res) => {
  try {
    promiseAll([getSubAccount(req), getPolicyAccount("PA", req)]).then(
      ([sub_account, policy_account]: any) => {
        res.send({
          message: "Successfully get data",
          success: true,
          paPolicy: {
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
      paPolicy: null,
    });
  }
});

PAPolicy.post("/add-pa-policy", async (req, res) => {
  convertToPassitive(req);
  const { sub_account, client_id, PolicyAccount, PolicyNo } = req.body;

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
    if (await findPolicy(PolicyNo, req)) {
      return res.send({
        message: "Unable to save! Policy No. already exists!",
        success: false,
      });
    }
    // get Commision rate
    const rate = (
      (await getMSPRRate(PolicyAccount, "PA", req)) as Array<any>
    )[0];

    if (rate == null) {
      return res.send({
        message: "Please setup commission rate for this account and Line",
        success: false,
      });
    }

    const subAccount = ((await getClientById(client_id, req)) as Array<any>)[0];
    const strArea =
      subAccount.Acronym === "" ? sub_account : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;
    req.body.sumInsured = parseFloat(
      req.body.sumInsured.toString().replace(/,/, "")
    ).toFixed(2);
    await insertPaPolicy({ ...req.body, cStrArea, strArea }, req);
    await saveUserLogs(req, PolicyNo, "add", "PA Policy");
    res.send({ message: "Create PA Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

PAPolicy.get("/search-pa-policy", async (req, res) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      paPolicy: await searchPAPolicy(req.query.searchPaPolicy as string, req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      paPolicy: null,
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

  const { sub_account, client_id, PolicyAccount, PolicyNo } = req.body;
  try {
    if (!(await saveUserLogsCode(req, "update", PolicyNo, "PA Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    //get Commision rate
    const rate = (
      (await getMSPRRate(PolicyAccount, "PA", req)) as Array<any>
    )[0];
    if (rate === null || rate === undefined) {
      return res.send({
        message: "Please setup commission rate for this account and Line",
        success: false,
      });
    }

    const subAccount = ((await getClientById(client_id, req)) as Array<any>)[0];
    const strArea =
      subAccount.Acronym === "" ? sub_account : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;

    req.body.DateIssued = new Date(req.body.DateIssued).toISOString();

    //delete policy
    await deletePolicyByPAPolicy(PolicyNo, req);
    // //delete PA policy
    await deletePAPolicy(PolicyNo, req);
    // //delete journal
    await deleteJournalBySource(PolicyNo, "PL", req);

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
    propertyInsured,
    netPremium,
    vat,
    docStamp,
    localGovTax,
    totalDue,
    strArea,
    cStrArea,
    sumInsured,
  }: any,
  req: Request
) {
  //   create  Policy
  await createPolicy(
    {
      IDNo: client_id,
      Account: PolicyAccount,
      SubAcct: sub_account,
      PolicyType: "PA",
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

  // create PA Policy
  await createPAPolicy(
    {
      PolicyNo,
      Account: PolicyAccount,
      Location: propertyInsured,
      PeriodFrom: DateFrom,
      PeriodTo: DateTo,
      sumInsured,
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
      Explanation: "PA Production",
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
      Source_No_Ref_ID: "PA",
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
      Explanation: "PA Production",
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
      Source_No_Ref_ID: "PA",
    },
    req
  );
}

export default PAPolicy;
