import express, { Request, Response } from "express";
import {
  findPolicy,
  getClientById,
  deleteJournalBySource,
  deletePolicy,
  createPolicy,
  createJournal,
  getRate,
} from "../../../model/Task/Production/vehicle-policy";
import promiseAll from "../../../lib/promise-all";
import {
  createFirePolicy,
  deleteFirePolicy,
  deletePolicyFromFire,
  getRateType,
  searchFirePolicy,
  searchFirePolicySelected,
} from "../../../model/Task/Production/fire-policy";

import {
  getAgents,
  getClients,
  getPolicyAccount,
  getSubAccount,
  getMortgagee,
  __executeQuery,
} from "../../../model/Task/Production/policy";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { convertToPassitive } from "../../../lib/convertToPassitive";
import { format } from "date-fns";
import { defaultFormat } from "../../../lib/defaultDateFormat";
const FirePolicy = express.Router();


///// new //////
FirePolicy.get("/fire/get-occupancy",async (req,res)=>{
  try {
    res.send({
      message: "Successfully get data",
      success: true,
      occupancy: await __executeQuery(`select '' as SubLineName union all select SubLineName from subline  where line = 'Fire';`)
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      occupancy: [],
    });
  }

})
FirePolicy.get("/fire/get-account",async (req,res)=>{
  try {
    res.send({
      message: "Successfully get data",
      success: true,
      account: await __executeQuery(`SELECT '' as Account union all SELECT Account FROM policy_account where FIRE = true;`)
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      account: [],
    });
  }

})
FirePolicy.get("/fire/get-mortgagee",async (req,res)=>{
  try {
    res.send({
      message: "Successfully get data",
      success: true,
      mortgagee: await __executeQuery(`SELECT '' as Mortgagee union all SELECT Mortgagee FROM mortgagee where Policy = 'FIRE';`)
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      mortgagee: [],
    });
  }

})


/////// old /////////
FirePolicy.get("/get-fire-policy", async (req: Request, res: Response) => {
  try {
    promiseAll([
      getSubAccount(req),
      getPolicyAccount("FIRE", req),
      getMortgagee("FIRE", req),
      getRateType("Fire", req),
    ]).then(([sub_account, policy_account, mortgagee, subline]: any) => {
      res.send({
        message: "Successfully get data",
        success: true,
        firePolicy: {
          sub_account,
          policy_account,
          mortgagee,
          subline,
        },
      });
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      firePolicy: null,
    });
  }
});
FirePolicy.get(
  "/search-agent-fire-policy",
  async (req: Request, res: Response) => {
    try {
      res.send({
        message: "Successfully get data",
        success: true,
        agents: await getAgents(req.query.searchAgent as string, false, req),
      });
    } catch (error: any) {
      console.log(error.message);

      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        agents: null,
      });
    }
  }
);
FirePolicy.get(
  "/search-client-fire-policy",
  async (req: Request, res: Response) => {
    try {
      res.send({
        message: "Successfully get data",
        success: true,
        clients: await getClients(req.query.searchClient as string, false, req),
      });
    } catch (error: any) {
      console.log(error.message);

      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        clients: null,
      });
    }
  }
);
FirePolicy.post("/search-fire-policy", async (req: Request, res: Response) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      data: await searchFirePolicy(
        req.body.search,
        req
      ),
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
FirePolicy.post("/selected-search-fire-policy", async (req: Request, res: Response) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      data: await searchFirePolicySelected(req.body.policyNo),
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



async function insertFirePolicy(
  {
    subAccountRef,
    clientIDRef,
    clientNameRef,
    agentIdRef,
    agentCommisionRef,
    accountRef,
    policyNoRef,
    billNoRef,
    dateFromRef,
    dateToRef,
    dateIssuedRef,
    locationRiskRef,
    propertyInsuredRef,
    constructionRef,
    occupancyRef,
    boundariesRef,
    mortgageeSelect,
    warrientiesRef,
    insuredValueRef,
    percentageRef,
    totalPremiumRef,
    vatRef,
    docstampRef,
    _localGovTaxRef,
    totalDueRef,
    strArea,
    cStrArea,
    fsTaxRef
  }: any,
  req: Request
) {

  dateFromRef = defaultFormat(new Date(dateFromRef))
  dateToRef = defaultFormat(new Date(dateToRef))
  dateIssuedRef = defaultFormat(new Date(dateIssuedRef))

  function formatNumber(num: number) {
    return (num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  await createPolicy(
    {
      IDNo: clientIDRef,
      Account: accountRef,
      SubAcct: subAccountRef,
      PolicyType: "FIRE",
      PolicyNo: policyNoRef,
      DateIssued:dateIssuedRef,
      TotalPremium: parseFloat(totalPremiumRef.replace(/,/g, '')),
      Vat: (parseFloat(vatRef.replace(/,/g, ''))).toFixed(2),
      DocStamp: (parseFloat(docstampRef.replace(/,/g, ''))).toFixed(2),
      FireTax: (parseFloat(fsTaxRef.replace(/,/g, ''))).toFixed(2),
      LGovTax: (parseFloat(_localGovTaxRef.replace(/,/g, ''))).toFixed(2),
      Notarial: "0",
      Misc: "0",
      TotalDue: (parseFloat(totalDueRef.replace(/,/g, ''))).toFixed(2),
      TotalPaid: "0",
      Journal: false,
      AgentID: agentIdRef,
      AgentCom: agentCommisionRef,
    },
    req
  );

  await createFirePolicy(
    {
      PolicyNo:policyNoRef,
      Account: accountRef,
      BillNo: billNoRef,
      DateFrom: dateFromRef,
      DateTo: dateToRef,
      Location: locationRiskRef,
      PropertyInsured: propertyInsuredRef,
      Constraction: constructionRef,
      Occupancy: occupancyRef,
      Boundaries: boundariesRef,
      Mortgage: mortgageeSelect,
      Warranties: warrientiesRef,
      InsuredValue:(parseFloat(insuredValueRef.replace(/,/g, ''))).toFixed(2) ,
      Percentage: percentageRef,
    },
    req
  );

  await createJournal(
    {
      Branch_Code: subAccountRef,
      Date_Entry: dateIssuedRef,
      Source_No: policyNoRef,
      Source_Type: "PL",
      Explanation: "Fire Production",
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
      Source_No_Ref_ID: "FIRE",
    },
    req
  );

  await createJournal(
    {
      Branch_Code: subAccountRef,
      Date_Entry: dateIssuedRef,
      Source_No: policyNoRef,
      Source_Type: "PL",
      Explanation: "Fire Production",
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
      Source_No_Ref_ID: "FIRE",
    },
    req
  );
}
FirePolicy.post("/add-fire-policy", async (req, res) => {
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

  const { subAccountRef, clientIDRef, accountRef, policyNoRef, occupancyRef } =
    req.body;
  try {
    if (await findPolicy(policyNoRef, req)) {
      return res.send({
        message: "Unable to save! Policy No. already exists!",
        success: false,
      });
    }
    //get Commision rate
    const rate = (
      (await getRate(accountRef, "Fire", occupancyRef, req)) as Array<any>
    )[0];

    if (rate == null) {
      return res.send({
        message: "Please setup commission rate for this account and Line",
        success: false,
      });
    }

    const subAccount = ((await getClientById(clientIDRef, req)) as Array<any>)[0];
    const strArea =
      subAccount.Acronym === "" ? subAccountRef : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;
    await insertFirePolicy({ ...req.body, cStrArea, strArea }, req);
    await saveUserLogs(req, policyNoRef, "add", "Fire Policy");
    res.send({ message: "Create Fire Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
FirePolicy.post("/update-fire-policy", async (req, res) => {
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
  const { subAccountRef, clientIDRef, accountRef, policyNoRef, occupancyRef } =
    req.body;
  try {
    if (!(await saveUserLogsCode(req, "edit", policyNoRef, "Fire Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //get Commision rate
    const rate = (
      (await getRate(accountRef, "Fire", occupancyRef, req)) as Array<any>
    )[0];

    if (rate == null) {
      return res.send({
        message: "Please setup commission rate for this account and Line",
        success: false,
      });
    }

    const subAccount = ((await getClientById(clientIDRef, req)) as Array<any>)[0];
    const strArea =
      subAccount.Acronym === "" ? subAccountRef : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;


    //delete policy
    await deletePolicyFromFire(policyNoRef, req);
    //delete v policy
    await deleteFirePolicy(policyNoRef, req);
    //delete journal
    await deleteJournalBySource(policyNoRef, "PL", req);

    // insert fire policy
    await insertFirePolicy({ ...req.body, cStrArea, strArea }, req);
    res.send({ message: "Update Fire Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
FirePolicy.post("/delete-fire-policy", async (req, res) => {
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
  const { PolicyAccount, form_type, PolicyNo } = req.body;
  try {
    if (!(await saveUserLogsCode(req, "delete", PolicyNo, "Fire Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //delete policy
    await deletePolicyFromFire(PolicyNo, req);
    // //delete v policy
    await deleteFirePolicy(PolicyNo, req);
    res.send({
      message: "Delete Fire Policy Successfully",
      success: true,
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

export default FirePolicy;
