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
  searchSelectedBondsPolicy,
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
import { defaultFormat } from "../../../lib/defaultDateFormat";
import { prisma } from "../..";

const BondPolicy = express.Router();

BondPolicy.get("/bond/get-bond-subline", async (req, res) => {
  try {
    res.send({
      message: "Create Bonds Policy Successfully",
      data: await prisma?.$queryRawUnsafe(
        `select '' as  SubLineName union all select SubLineName from subline where line = 'Bonds'`
      ),
      success: true,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});
BondPolicy.post("/bond/get-account", async (req, res) => {
  try {
    if (req.body.policyType === "G02") {
      res.send({
        message: "Create Bonds Policy Successfully",
        data: await prisma?.$queryRawUnsafe(
          `SELECT Account FROM policy_account WHERE G02 = true ORDER BY Account`
        ),
        success: true,
      });
    } else if (req.body.policyType === "G13") {
      res.send({
        message: "Create Bonds Policy Successfully",
        data: await prisma?.$queryRawUnsafe(
          `SELECT Account FROM policy_account WHERE G13 = true ORDER BY Account`
        ),
        success: true,
      });
    } else if (req.body.policyType === "G16") {
      res.send({
        message: "Create Bonds Policy Successfully",
        data: await prisma?.$queryRawUnsafe(
          `SELECT Account FROM policy_account WHERE  G16 = true ORDER BY Account`
        ),
        success: true,
      });
    } else {
      res.send({
        message: "Create Bonds Policy Successfully",
        data: await prisma?.$queryRawUnsafe(
          `SELECT Account FROM policy_account    ORDER BY Account`
        ),
        success: true,
      });
    }
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});

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
  const { subAccountRef, clientIDRef, accountRef, policyNoRef, policyTypeRef } =
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
      (await getBondRate(accountRef, policyTypeRef, req)) as Array<any>
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
    await insertBondsPolicy({ ...req.body, cStrArea, strArea }, req);

    await saveUserLogs(req, policyNoRef, "add", "Bonds Policy");
    res.send({ message: "Create Bonds Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
BondPolicy.post("/search-bonds-policy", async (req, res) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      data: await searchBondsPolicy(req.body.search, req),
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
BondPolicy.post("/get-search-selected-bonds-policy", async (req, res) => {
  try {
    res.send({
      message: "Successfully search data",
      success: true,
      data: await searchSelectedBondsPolicy(req.body.policyNo),
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
  const { subAccountRef, clientIDRef, accountRef, policyNoRef, policyTypeRef } =
    req.body;
  try {
    if (!(await saveUserLogsCode(req, "edit", policyNoRef, "Bonds Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //get Commision rate
    const rate = (
      (await getBondRate(accountRef, policyTypeRef, req)) as Array<any>
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
    await deletePolicyFromBond(policyTypeRef, policyNoRef, req);
    // //delete v policy
    await deleteBondsPolicy(policyTypeRef, policyNoRef, req);
    // //delete journal
    await deleteJournalBySource(policyNoRef, "PL", req);

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
    subAccountRef,
    clientIDRef,
    clientNameRef,
    agentIdRef,
    agentCommisionRef,
    accountRef,
    policyNoRef,
    policyTypeRef,
    biddingDateRef,
    timeRef,
    dateIssuedRef,
    validityRef,
    officerRef,
    positionRef,
    unitRef,
    obligeeRef,
    name1Ref,
    tcn1Ref,
    il1Ref,
    di1Ref,
    name2Ref,
    tcn2Ref,
    il2Ref,
    di2Ref,
    insuredValueRef,
    percentageRef,
    totalPremiumRef,
    vatRef,
    docstampRef,
    _localGovTaxRef,
    umisRef,
    principalRef,
    totalDueRef,
    strArea,
    cStrArea,
    careOfRef
  }: any,
  req: Request
) {
  //create  Policy
  // timeRef = defaultFormat(new Date(timeRef))
  biddingDateRef = defaultFormat(new Date(biddingDateRef));
  dateIssuedRef = defaultFormat(new Date(dateIssuedRef));
  di2Ref = defaultFormat(new Date(di2Ref));
  di1Ref = defaultFormat(new Date(di1Ref));

  const now = new Date();
  const [hours, minutes] = timeRef.split(":").map(Number); // Extract hours & minutes

  // Create a Date object with the current date and extracted time
  const bidTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  await createPolicy(
    {
      IDNo: clientIDRef,
      Account: accountRef,
      SubAcct: subAccountRef,
      PolicyType: policyTypeRef,
      PolicyNo: policyNoRef,
      DateIssued: dateIssuedRef,
      TotalPremium: parseFloat(totalPremiumRef.toString().replace(/,/g, "")),
      Vat: parseFloat(vatRef.replace(/,/g, "")).toFixed(2),
      DocStamp: parseFloat(docstampRef.replace(/,/g, "")).toFixed(2),
      FireTax: "0",
      LGovTax: parseFloat(_localGovTaxRef.replace(/,/g, "")).toFixed(2),
      Notarial: parseFloat(umisRef.replace(/,/g, "")).toFixed(2),
      Misc: parseFloat(principalRef.replace(/,/g, "")).toFixed(2),
      TotalDue: parseFloat(totalDueRef.replace(/,/g, "")).toFixed(2),
      TotalPaid: "0",
      Journal: false,
      AgentID: agentIdRef,
      AgentCom: agentCommisionRef,
    },
    req
  );
  //create bond Policy
  await createBondsPolicy(
    {
      PolicyNo: policyNoRef,
      Account: accountRef,
      PolicyType: policyTypeRef,
      UnitDetail: unitRef,
      Obligee: obligeeRef,
      BidDate: biddingDateRef,
      BidTime: bidTime,
      NotaryName: name1Ref,
      TaxCerNo: tcn1Ref,
      IssuedLocation: il1Ref,
      NIssued: di1Ref,
      CapacityAs: name2Ref,
      TaxCerNoCorp: tcn2Ref,
      IssuedLoctCorp: il2Ref,
      CIssued: di2Ref,
      BondValue: parseFloat(insuredValueRef.replace(/,/g, "")),
      Percentage: percentageRef,
      Officer: officerRef,
      OPosition: positionRef,
      Validity: validityRef,
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
      Explanation: "Bonds Production",
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
      Source_No_Ref_ID: "Bonds",
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
      Explanation: "Bonds Production",
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
      Source_No_Ref_ID: "Bonds",
    },
    req
  );
}

export default BondPolicy;
