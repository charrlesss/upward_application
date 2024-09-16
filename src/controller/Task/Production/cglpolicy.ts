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
  createCGLPolicy,
  deleteCGLPolicy,
  deletePolicyByCGL,
  searchCGLPolicy,
} from "../../../model/Task/Production/cgl-policy";
import {
  getSubAccount,
  getPolicyAccount,
} from "../../../model/Task/Production/policy";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { convertToPassitive } from "../../../lib/convertToPassitive";

const CGLPolicy = express.Router();

CGLPolicy.get("/get-cgl-policy", (req, res) => {
  try {
    promiseAll([getSubAccount(req), getPolicyAccount("CGL", req)]).then(
      ([sub_account, policy_account]: any) => {
        res.send({
          message: "Successfully get data",
          success: true,
          cglPolicy: {
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
      cglPolicy: null,
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
      (await getMSPRRate(PolicyAccount, "CGL", req)) as Array<any>
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
    await insertCGLPolicy({ ...req.body, cStrArea, strArea }, req);
    await saveUserLogs(req, PolicyNo, "add", "CGL Policy");
    res.send({ message: "Create CGL Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

CGLPolicy.get("/search-cgl-policy", async (req, res) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      cglPolicy: await searchCGLPolicy(
        req.query.searchCglPolicy as string,
        req
      ),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      cglPolicy: null,
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
  const { sub_account, client_id, PolicyAccount, PolicyNo } = req.body;
  try {
    if (!(await saveUserLogsCode(req, "edit", PolicyNo, "CGL Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //get Commision rate
    const rate = (
      (await getMSPRRate(PolicyAccount, "CGL", req)) as Array<any>
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

    await deleteCGLPolicy(PolicyNo, req);
    await deletePolicyByCGL(PolicyNo, req);
    await deleteJournalBySource(PolicyNo, "PL", req);

    req.body.sumInsured = parseFloat(
      req.body.sumInsured.toString().replace(/,/, "")
    ).toFixed(2);
    req.body.DateIssued = new Date(req.body.DateIssued).toISOString();

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
    blPremium,
    pdPremium,
    netPremium,
    vat,
    docStamp,
    localGovTax,
    totalDue,
    premisisOperation,
    strArea,
    cStrArea,
    address,
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
      PolicyType: "CGL",
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

  // create CGL Policy
  await createCGLPolicy(
    {
      PolicyNo,
      Account: PolicyAccount,
      Location: premisisOperation,
      PeriodFrom: DateFrom,
      PeriodTo: DateTo,
      LimitA: blPremium,
      LimitB: pdPremium,
      address,
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
      Explanation: "CGL Production",
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
      Source_No_Ref_ID: "CGL",
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
      Explanation: "CGL Production",
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
      Source_No_Ref_ID: "CGL",
    },
    req
  );
}

export default CGLPolicy;
