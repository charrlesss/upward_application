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
  createBondsPolicy,
  deleteBondsPolicy,
  deletePolicyFromBond,
  getAllBondsType,
  getBondRate,
  searchBondsPolicy,
} from "../../../model/Task/Production/bond-policy";
import {
  getSubAccount,
  getPolicyAccount,
  getPolicyType,
} from "../../../model/Task/Production/policy";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { convertToPassitive } from "../../../lib/convertToPassitive";

const BondPolicy = express.Router();
BondPolicy.get("/get-bond-acc-type", async (req, res) => {
  try {
    const bonds = ((await getAllBondsType(req)) as any).map(
      (d: any) => d.SublineName
    );
    const string = bonds.join(" = 1 AND ") + " = 1";
    res.send({
      message: "Create Bonds Policy Successfully",
      string: `SELECT * FROM policy_account a where ${string}`,
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
BondPolicy.get("/get-bonds-policy", (req, res) => {
  try {
    promiseAll([
      getSubAccount(req),
      getPolicyAccount("G02", req),
      getPolicyAccount("G13", req),
      getPolicyAccount("G16", req),
      getPolicyType("Bonds", req),
    ]).then(([sub_account, g1, g13, g16, policy_type]: any) => {
      res.send({
        message: "Successfully get data",
        success: true,
        bondsPolicy: {
          sub_account,
          policy_account: {
            G02: g1,
            G13: g13,
            G16: g16,
          },
          policy_type,
        },
      });
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      bondsPolicy: null,
    });
  }
});
BondPolicy.post("/add-bonds-policy", async (req, res) => {
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
  const { sub_account, client_id, PolicyAccount, PolicyNo, policyType } =
    req.body;

  try {
    if (await findPolicy(PolicyNo, req)) {
      return res.send({
        message: "Unable to save! Policy No. already exists!",
        success: false,
      });
    }
    //get Commision rate
    const rate = (
      (await getBondRate(PolicyAccount, policyType, req)) as Array<any>
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
    await insertBondsPolicy({ ...req.body, cStrArea, strArea }, req);

    await saveUserLogs(req, PolicyNo, "add", "Bonds Policy");
    res.send({ message: "Create Bonds Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
BondPolicy.get("/search-bonds-policy", async (req, res) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      bondsPolicy: await searchBondsPolicy(
        req.query.searchBondsPolicy as string,
        req
      ),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      bondsPolicy: null,
    });
  }
});
BondPolicy.post("/update-bonds-policy", async (req, res) => {
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
    if (!(await saveUserLogsCode(req, "edit", PolicyNo, "Bonds Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //get Commision rate
    const rate = (
      (await getBondRate(PolicyAccount, policyType, req)) as Array<any>
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

    //delete policy
    await deletePolicyFromBond(policyType, PolicyNo, req);
    // //delete v policy
    await deleteBondsPolicy(policyType, PolicyNo, req);
    // //delete journal
    await deleteJournalBySource(PolicyNo, "PL", req);

    req.body.DateIssued = new Date(req.body.DateIssued).toISOString();
    // insert fire policy
    await insertBondsPolicy({ ...req.body, cStrArea, strArea }, req);

    res.send({ message: "Update Bonds Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
BondPolicy.post("/delete-bonds-policy", async (req, res) => {
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
  const { PolicyAccount, PolicyNo, policyType } = req.body;
  try {
    if (!(await saveUserLogsCode(req, "delete", PolicyNo, "Bonds Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    //delete policy
    await deletePolicyFromBond(policyType, PolicyNo, req);
    //delete v policy
    await deleteBondsPolicy(policyType, PolicyNo, req);
    res.send({ message: "Delete Bonds Policy Successfully", success: true });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
async function insertBondsPolicy(
  {
    sub_account,
    client_id,
    client_name,
    agent_id,
    agent_com,
    PolicyAccount,
    PolicyNo,
    policyType,
    biddingDate,
    time,
    DateIssued,
    validity,
    officer,
    position,
    unit,
    obligee,
    officerName,
    officerTaxCertNo,
    officerIssuedLoc,
    officerDateIssued,
    insuranceCapacity,
    insuranceOfficerTaxCert,
    insuranceIssuedLoc,
    insuranceDateIssued,
    insuredValue,
    percentagePremium,
    totalPremium,
    vat,
    docStamp,
    localGovTax,
    umis,
    principal,
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
      PolicyType: policyType,
      PolicyNo: PolicyNo,
      DateIssued,
      TotalPremium: parseFloat(parseFloat(totalPremium).toFixed(2)),
      Vat: vat,
      DocStamp: docStamp,
      FireTax: "0",
      LGovTax: localGovTax,
      Notarial: umis,
      Misc: principal,
      TotalDue: totalDue,
      TotalPaid: "0",
      Journal: false,
      AgentID: agent_id,
      AgentCom: agent_com,
    },
    req
  );
  //create bond Policy
  await createBondsPolicy(
    {
      PolicyNo: PolicyNo,
      Account: PolicyAccount,
      PolicyType: policyType,
      UnitDetail: unit,
      Obligee: obligee,
      BidDate: biddingDate,
      BidTime: time,
      NotaryName: officerName,
      TaxCerNo: officerTaxCertNo,
      IssuedLocation: officerIssuedLoc,
      NIssued: officerDateIssued,
      CapacityAs: insuranceCapacity,
      TaxCerNoCorp: insuranceOfficerTaxCert,
      IssuedLoctCorp: insuranceIssuedLoc,
      CIssued: insuranceDateIssued,
      BondValue: insuredValue,
      Percentage: percentagePremium,
      Officer: officer,
      OPosition: position,
      Validity: validity,
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
      Explanation: "Bonds Production",
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
      Source_No_Ref_ID: "Bonds",
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
      Explanation: "Bonds Production",
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
      Source_No_Ref_ID: "Bonds",
    },
    req
  );
}

export default BondPolicy;
