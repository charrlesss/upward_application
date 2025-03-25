import express, { Request, Response } from "express";
import {
  findPolicy,
  getClientById,
  createPolicy,
  createJournal,
  deletePolicy,
  deleteJournalBySource,
} from "../../../model/Task/Production/vehicle-policy";
import promiseAll from "../../../lib/promise-all";
import {
  createMarinePolicy,
  createWords,
  deleteWords,
  getMarineRate,
  searchMarinePolicy,
  getWords,
  deleteMarinePolicy,
  deletePolicyFromMarine,
  getSearchMarinePolicySelected
} from "../../../model/Task/Production/marine-policy";

import {
  getSubAccount,
  getPolicyAccount,
  __executeQuery,
} from "../../../model/Task/Production/policy";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { convertToPassitive } from "../../../lib/convertToPassitive";
import { format } from "date-fns";
import { defaultFormat } from "../../../lib/defaultDateFormat";

const MarinePolicy = express.Router();

MarinePolicy.get("/marine/get-account", async (req, res) => {
  try {
    res.send({
      message: "Successfully get data",
      success: true,
      account: await __executeQuery(
        `SELECT '' as Account union all SELECT Account FROM policy_account where MAR = true;`
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

MarinePolicy.get("/marine/get-words", async (req, res) => {
  try {
    res.send({
      message: "Successfully get data",
      success: true,
      words: await __executeQuery(
        `SELECT * FROM Words WHERE Wordings = 'MPolicy' `
      ),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      words: [],
    });
  }
});

MarinePolicy.get("/get-marine-policy", (req, res) => {
  try {
    promiseAll([
      getSubAccount(req),
      getPolicyAccount("MAR", req),
      getWords(req),
    ]).then(([sub_account, policy_account, words]: any) => {
      res.send({
        message: "Successfully get data",
        success: true,
        marinePolicy: {
          sub_account,
          policy_account,
          words,
        },
      });
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      marinePolicy: null,
    });
  }
});

MarinePolicy.post("/add-marine-policy", async (req, res) => {
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
    //get Commision rate
    const rate = (
      (await getMarineRate(accountRef, "Marine", req)) as Array<any>
    )[0];

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
    await insertMarinePolicy({ ...req.body, cStrArea, strArea }, req);
    await saveUserLogs(req, policyNoRef, "add", "Marine Policy");
    res.send({ message: "Create Marine Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

MarinePolicy.post(
  "/search-marine-policy",
  async (req: Request, res: Response) => {
    try {
      res.send({
        message: "Successfully search data",
        success: true,
        data: await searchMarinePolicy(req.body.search, req),
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);

MarinePolicy.post(
  "/get-selected-search-marine-policy",
  async (req: Request, res: Response) => {
    try {
      res.send({
        message: "Successfully search data",
        success: true,
        data: await getSearchMarinePolicySelected(req.body.policyNo),
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);

MarinePolicy.post("/update-marine-policy", async (req, res) => {
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
    if (
      !(await saveUserLogsCode(req, "update", policyNoRef, "Marine Policy"))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //get Commision rate
    const rate = (
      (await getMarineRate(accountRef, "Marine", req)) as Array<any>
    )[0];
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

    //delete policy
    await deletePolicyFromMarine(policyNoRef, req);
    //delete m policy
    await deleteMarinePolicy(policyNoRef, req);
    //delete journal
    await deleteJournalBySource(policyNoRef, "PL", req);

    // insert fire policy
    await insertMarinePolicy({ ...req.body, cStrArea, strArea }, req);
    res.send({ message: "Update Marine Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

MarinePolicy.post("/delete-marine-policy", async (req, res) => {
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
    if (!(await saveUserLogsCode(req, "delete", PolicyNo, "Marine Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //delete policy
    await deletePolicyFromMarine(PolicyNo, req);
    // //delete m policy
    await deleteMarinePolicy(PolicyNo, req);

    res.send({
      message: "Delete Marine Policy Successfully",
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

async function insertMarinePolicy(
  {
    sub_account,
    clientIDRef,
    clientNameRef,
    agentIdRef,
    agentCommisionRef,
    accountRef,
    policyNoRef,
    dateFromRef,
    dateToRef,
    dateIssuedRef,
    insuredValueRef,
    percentageRef,
    totalPremiumRef,
    vatRef,
    docstampRef,
    _localGovTaxRef,
    totalDueRef,
    locationRef,
    consigneeRef,
    subjectMatterInsuredRef,
    vesselRef,
    additionalInformationRef,
    pointOriginRef,
    pointDestinationRef,
    remarks1Ref,
    remarks2Ref,
    strArea,
    cStrArea,
  }: any,
  req: Request
) {
  console.log(req.body)
  dateFromRef = defaultFormat(new Date(dateFromRef));
  dateToRef = defaultFormat(new Date(dateToRef));
  dateIssuedRef = defaultFormat(new Date(dateIssuedRef));

  await createPolicy(
    {
      IDNo: clientIDRef,
      Account: accountRef,
      SubAcct: sub_account,
      PolicyType: "MAR",
      PolicyNo: policyNoRef,
      DateIssued: dateIssuedRef,
      TotalPremium: parseFloat(totalPremiumRef.replace(/,/g, "")),
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

  await createMarinePolicy(
    {
      PolicyNo: policyNoRef,
      Account: accountRef,
      Location: locationRef,
      DateFrom: dateFromRef,
      DateTo: dateToRef,
      PointOfOrigin: pointOriginRef,
      PointofDestination: pointDestinationRef,
      Vessel: vesselRef,
      AdditionalInfo: additionalInformationRef,
      SubjectInsured: subjectMatterInsuredRef,
      Consignee: consigneeRef,
      InsuredValue: parseFloat(insuredValueRef.replace(/,/g, "")),
      Percentage: percentageRef,
    },
    req
  );
  await deleteWords(req);
  for (let i = 0; i <= 1; i++) {
    const wording = "MPolicy";
    const sType = i === 0 ? false : true;
    const phrase = i === 0 ?   remarks2Ref : remarks1Ref;
    await createWords(
      {
        Wordings: wording,
        SType: sType,
        Phrase: phrase,
      },
      req
    );
  }
  //debit
  await createJournal(
    {
      Branch_Code: sub_account,
      Date_Entry: dateIssuedRef,
      Source_Type: "PL",
      Source_No: policyNoRef,
      Explanation: "Marine Production",
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
      Source_No_Ref_ID: "MAR",
    },
    req
  );
  //credit
  await createJournal(
    {
      Branch_Code: sub_account,
      Date_Entry: dateIssuedRef,
      Source_Type: "PL",
      Source_No: policyNoRef,
      Explanation: "Marine Production",
      GL_Acct: "4.02.01",
      Sub_Acct: strArea,
      ID_No: policyNoRef,
      cGL_Acct: "A/P",
      cSub_Acct: cStrArea,
      cID_No: clientNameRef,
      Debit: 0,
      Credit: parseFloat(totalDueRef.replace(/,/g,'')).toFixed(2),
      TC: "A/P",
      Remarks: "",
      Source_No_Ref_ID: "MAR",
    },
    req
  );
}
export default MarinePolicy;
