import express, { Request, Response } from "express";
import {
  getTPL_IDS,
  findPolicy,
  getRate,
  getClientById,
  deleteJournalBySource,
  deleteVehiclePolicy,
  deletePolicy,
  createPolicy,
  createVehiclePolicy,
  createJournalInVP,
  updateJournalByPolicy,
  getTempPolicyID,
  searchDataVPolicy,
  deletePolicyByVehicle,
  getRateFromTPLUpdate,
  deleteTPLFromJournalBySource,
  getCostByTPL,
  // ======= new ===
  searchClientByNameOrByID,
  searchAgentByNameOrByID,
  getPolicyAccount,
  getPolicyMortgagee,
  getPolicyDenomination,
  getPolicySubAccount,
  generateTempID,
} from "../../../model/Task/Production/vehicle-policy";
import {
  __executeQuery,
  getAgents,
  getClients,
} from "../../../model/Task/Production/policy";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { convertToPassitive } from "../../../lib/convertToPassitive";
import { defaultFormat } from "../../../lib/defaultDateFormat";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const VehiclePolicy = express.Router();

VehiclePolicy.post("/search-client-by-id-or-name", async (req, res) => {
  try {
    res.send({
      message: "search data successfully",
      success: true,
      data: await searchClientByNameOrByID(req.body.search, req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      tempId: [],
    });
  }
});
VehiclePolicy.post("/search-agent-by-id-or-name", async (req, res) => {
  try {
    res.send({
      message: "search data successfully",
      success: true,
      data: await searchAgentByNameOrByID(req.body.search, req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      tempId: [],
    });
  }
});
VehiclePolicy.post("/account", async (req, res) => {
  try {
    const policy = req.body.policy;
    let whr = "";
    if (policy === "COM") {
      whr = " WHERE COM = true";
    }
    if (policy === "TPL") {
      whr = " WHERE TPL = true";
    }
    res.send({
      message: "search data successfully",
      success: true,
      data: await getPolicyAccount(whr, req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      tempId: [],
    });
  }
});
VehiclePolicy.post("/mortgagee", async (req, res) => {
  try {
    const policy = req.body.policy;
    let whr = "";
    if (policy === "COM") {
      whr = ` WHERE Policy = 'Comprehensive'`;
    }
    if (policy === "TPL") {
      whr = ` WHERE Policy = 'TPL'`;
    }
    res.send({
      message: "search data successfully",
      success: true,
      data: await getPolicyMortgagee(whr, req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      tempId: [],
    });
  }
});
VehiclePolicy.post("/denomination", async (req, res) => {
  try {
    const policy = req.body.policy;
    const account = req.body.account;
    let whr = "";

    if (policy === "COM") {
      whr = ` where Line = 'Vehicle' and SUBSTRING(Type,1,3) ='COM' `;
    }
    if (policy === "TPL") {
      whr = ` where Line = 'Vehicle' and SUBSTRING(Type,1,3) ='TPL' `;
    }

    if (account && account !== "") {
      whr = whr + ` and Account ='${account}' `;
    }

    res.send({
      message: "search data successfully",
      success: true,
      data: await getPolicyDenomination(whr, req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      tempId: [],
    });
  }
});
VehiclePolicy.get("/sub-account", async (req, res) => {
  try {
    res.send({
      message: "search data successfully",
      success: true,
      data: await getPolicySubAccount(req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      tempId: [],
    });
  }
});
VehiclePolicy.post("/search-policy", async (req, res) => {
  try {
    res.send({
      message: "Search Successfully",
      success: true,
      data: await __executeQuery(
        `
        SELECT 
          date_format(Policy.DateIssued,'%M  %d, %Y') AS Date, 
          Policy.PolicyNo, 
          Policy.Account, 
          ID_Entry.cID_No AS Name,
          VPolicy.ChassisNo
        FROM policy as Policy
        LEFT JOIN vpolicy as VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo 
        LEFT JOIN ( 
          SELECT 
                        a.entry_client_id as IDNo,
                            sub_account,
                            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                    FROM
                        entry_client a UNION ALL SELECT 
                        a.entry_supplier_id as IDNo,
                            sub_account,
                            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                    FROM
                        entry_supplier a UNION ALL SELECT 
                        a.entry_employee_id as IDNo,
                            sub_account,
                            IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                    FROM
                        entry_employee a UNION ALL SELECT 
                        a.entry_fixed_assets_id as IDNo, sub_account, a.fullname AS cID_No
                    FROM
                        entry_fixed_assets a UNION ALL SELECT 
                        a.entry_others_id as IDNo, sub_account, a.description AS cID_No
                    FROM
                        entry_others a UNION ALL SELECT 
                        a.entry_agent_id as IDNo,
                            sub_account,
                            IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                    FROM
                        entry_agent a
        ) ID_Entry  ON Policy.IDNo = ID_Entry.IDNo
        WHERE 
        
        ((VPolicy.ChassisNo LIKE '%${req.body.search}%') 
        OR (VPolicy.MotorNo LIKE '%${req.body.search}%') 
        OR (VPolicy.PlateNo LIKE '%${req.body.search}%') 
        OR (ID_Entry.cID_No LIKE '%${req.body.search}%') 
        OR (Policy.PolicyNo LIKE '%${req.body.search}%') 
        OR (Policy.Account LIKE '%${req.body.search}%')
        OR (ID_Entry.IDNo LIKE '%${req.body.search}%'))
        AND Policy.PolicyType = 'COM' AND SUBSTRING(Policy.PolicyNo,1,2) <> 'TP'
        ORDER BY Policy.DateIssued desc
        limit 500
        `,
        req
      ),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data: [] });
  }
});
VehiclePolicy.post("/search-policy-selected", async (req, res) => {
  try {
    const data1 = await prisma.$queryRawUnsafe(
      `
       SELECT 
            Policy.*, 
            INS.cID_No AS InsName, 
            INS.address AS InsAdd, 
            ifnull(AGNT.cID_No,'') AS AgentName 
          FROM policy as Policy
          LEFT JOIN (
          SELECT 
                          a.entry_client_id as IDNo,
                              sub_account,
                              IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                  AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No,
                                  a.address
                      FROM
                          entry_client a 
                          UNION ALL SELECT 
                          a.entry_supplier_id as IDNo,
                              sub_account,
                              IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                  AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No,
                  a.address
                      FROM
                          entry_supplier a 
                          UNION ALL SELECT 
                          a.entry_employee_id as IDNo,
                              sub_account,
                              IF(a.lastname IS NOT NULL
                                  AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No,
                  a.address
                      FROM
                          entry_employee a 
                          UNION ALL SELECT 
                          a.entry_fixed_assets_id as IDNo, sub_account, a.fullname AS cID_No,
                  a.description as address
                      FROM
                          entry_fixed_assets a 
                          UNION ALL SELECT 
                          a.entry_others_id as IDNo, sub_account, a.description AS cID_No,
                          a.remarks as address
                    
                      FROM
                          entry_others a 
                          UNION ALL SELECT 
                          a.entry_agent_id as IDNo,
                              sub_account,
                              IF(a.lastname IS NOT NULL
                                  AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No,
                  a.address
                      FROM
                          entry_agent a
          ) INS ON Policy.IDNo = INS.IDNo 
          LEFT JOIN (
            SELECT 
                          a.entry_client_id as IDNo,
                              sub_account,
                              IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                  AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No,
                                  a.address
                      FROM
                          entry_client a 
                          UNION ALL SELECT 
                          a.entry_supplier_id as IDNo,
                              sub_account,
                              IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                  AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No,
                  a.address
                      FROM
                          entry_supplier a 
                          UNION ALL SELECT 
                          a.entry_employee_id as IDNo,
                              sub_account,
                              IF(a.lastname IS NOT NULL
                                  AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No,
                  a.address
                      FROM
                          entry_employee a 
                          UNION ALL SELECT 
                          a.entry_fixed_assets_id as IDNo, sub_account, a.fullname AS cID_No,
                  a.description as address
                      FROM
                          entry_fixed_assets a 
                          UNION ALL SELECT 
                          a.entry_others_id as IDNo, sub_account, a.description AS cID_No,
                          a.remarks as address
                    
                      FROM
                          entry_others a 
                          UNION ALL SELECT 
                          a.entry_agent_id as IDNo,
                              sub_account,
                              IF(a.lastname IS NOT NULL
                                  AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No,
                  a.address
                      FROM
                          entry_agent a
          ) AS AGNT ON Policy.AgentID = AGNT.IDNo 
          WHERE Account = '${req.body.account}' And PolicyType = '${req.body.policy}' And PolicyNo = '${req.body.policyNo}'
        `
    );
    const data2 = await prisma.$queryRawUnsafe(
      `SELECT *, ifNull(Denomination,'') as 'Denomi' FROM vpolicy as VPolicy WHERE Account = '${req.body.account}' And PolicyType = '${req.body.policy}' And PolicyNo = '${req.body.policyNo}'`
    );

    const data3 = await prisma.$queryRawUnsafe(
      `
     SELECT 
                MIN(Source_No) as Source_No,
                MIN(Debit) as Cost
            FROM
                journal
            WHERE
                cGL_Acct = 'CTPL Inventory'
                    AND Explanation = 'CTPL Registration'
                    AND (Remarks <> '' OR Remarks IS not NULL)
                    AND Source_No = '${req.body.policyNo}'
                    group by Source_No_Ref_ID
                    order by Source_No;`
    );

    res.send({
      message: "Search Successfully",
      success: true,
      data1,
      data2,
      data3,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data1: [], data2: [] });
  }
});
VehiclePolicy.post("/save", async (req, res) => {
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
    let dt: any = await prisma.$queryRawUnsafe(
      `SELECT * FROM policy as Policy  WHERE PolicyNo = '${req.body.policyNoRef}' `
    );
    if (req.body.mode !== "update" && dt.length > 0) {
      return res.send({
        message: "Unable to save! Policy No. already exists!",
        success: false,
        data: [],
      });
    }

    //get Commision rate
    dt = await prisma.$queryRawUnsafe(
      `select Rate from rates where Account = '${req.body.accountRef}' and Line = 'Vehicle' and Type = '${req.body.dinomination}'`
    );

    // const rate = (
    //   (await getRate(
    //     req.body.accountRef,
    //     "Vehicle",
    //     req.body.dinomination,
    //     req
    //   )) as Array<any>
    // )[0];
    
    // if (rate == null) {
    //   return res.send({
    //     message: "Please setup commission rate for this account and Line",
    //     success: false,
    //   });
    // }

    const subAccount = (
      (await getClientById(req.body.clientIDRef, req)) as Array<any>
    )[0];
    const strArea =
      subAccount.Acronym === "" ? req.body.subAccountRef : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;

    // const strArea = "HO";
    // const cStrArea = "Head Office";
    await insertNewVPolicy({ ...req.body, cStrArea, strArea }, req);

    await saveUserLogs(req, req.body.policyNoRef, "add", "Vehicle Policy");
    res.send({ message: "Create Vehicle Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false });
  }
});
VehiclePolicy.post("/com-update-regular", async (req, res) => {
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

  try {
    if (
      !(await saveUserLogsCode(
        req,
        "update",
        req.body.policyNoRef,
        "Vehicle Policy"
      ))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    // get Commision rate
    const rate = (
      (await getRate(
        req.body.accountRef,
        "Vehicle",
        req.body.dinomination,
        req
      )) as Array<any>
    )[0];

    if (rate == null) {
      return res.send({
        message: "Please setup commission rate for this account and Line",
        success: false,
      });
    }

    const subAccount = (
      (await getClientById(req.body.clientIDRef, req)) as Array<any>
    )[0];
    const strArea =
      subAccount.Acronym === "" ? req.body.subAccountRef : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;

    //delete policy
    await deletePolicyByVehicle(req.body.policy, req.body.policyNoRef, req);
    //delete v policy
    await deleteVehiclePolicy(req.body.policy, req.body.policyNoRef, req);
    //delete journal
    await deleteJournalBySource(req.body.policyNoRef, "PL", req);
    // insert policy
    await insertNewVPolicy({ ...req.body, cStrArea, strArea }, req);
    res.send({ message: "Update Vehicle Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false });
  }
});

VehiclePolicy.post("/com-update-regular-tpl", async (req, res) => {
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

  try {
    if (
      !(await saveUserLogsCode(
        req,
        "update",
        req.body.policyNoRef,
        "Vehicle Policy"
      ))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    //get Commision rate
    // const rate = (
    //   (await getRate(
    //     req.body.accountRef,
    //     "Vehicle",
    //     req.body.dinomination,
    //     req
    //   )) as Array<any>
    // )[0];

    // if (rate == null) {
    //   return res.send({
    //     message: "Please setup commission rate for this account and Line",
    //     success: false,
    //   });
    // }

    const subAccount = (
      (await getClientById(req.body.clientIDRef, req)) as Array<any>
    )[0];
    const strArea =
      subAccount.Acronym === "" ? req.body.subAccountRef : subAccount.Acronym;
    const cStrArea = subAccount.ShortName;

    //delete policy
    await deletePolicyByVehicle(req.body.policy, req.body.policyNoRef, req);
    //delete v policy
    await deleteVehiclePolicy(req.body.policy, req.body.policyNoRef, req);
    //delete journal
    await deleteJournalBySource(req.body.policyNoRef, "PL", req);
    // insert policy
    await insertNewVPolicy({ ...req.body, cStrArea, strArea }, req);
    res.send({ message: "Update Vehicle Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false });
  }
});

//// TEMP
VehiclePolicy.get("/temp-id", async (req, res) => {
  try {
    res.send({
      message: "Get Temp ID Successfully",
      success: true,
      data: await generateTempID(req),
    });
  } catch (err: any) {
    res.send({ message: err.message, success: false, data: [] });
  }
});
VehiclePolicy.post("/search-policy-temp", async (req, res) => {
  try {
    res.send({
      message: "Search Successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(
        `
        SELECT 
          date_format(Policy.DateIssued,'%M  %d, %Y') AS Date, 
          Policy.PolicyNo, Policy.Account, 
          ID_Entry.cID_No AS Name
        FROM policy as Policy
        LEFT JOIN  vpolicy as VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo 
        LEFT JOIN ( 
          SELECT 
                        a.entry_client_id as IDNo,
                            sub_account,
                            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                    FROM
                        entry_client a UNION ALL SELECT 
                        a.entry_supplier_id as IDNo,
                            sub_account,
                            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                    FROM
                        entry_supplier a UNION ALL SELECT 
                        a.entry_employee_id as IDNo,
                            sub_account,
                            IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                    FROM
                        entry_employee a UNION ALL SELECT 
                        a.entry_fixed_assets_id as IDNo, sub_account, a.fullname AS cID_No
                    FROM
                        entry_fixed_assets a UNION ALL SELECT 
                        a.entry_others_id as IDNo, sub_account, a.description AS cID_No
                    FROM
                        entry_others a UNION ALL SELECT 
                        a.entry_agent_id as IDNo,
                            sub_account,
                            IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                    FROM
                        entry_agent a
        ) ID_Entry  ON Policy.IDNo = ID_Entry.IDNo
        WHERE 
        
        ((VPolicy.ChassisNo LIKE '%${req.body.search}%') 
        OR (VPolicy.MotorNo LIKE '%${req.body.search}%') 
        OR (VPolicy.PlateNo LIKE '%${req.body.search}%') 
        OR (ID_Entry.cID_No LIKE '%${req.body.search}%') 
        OR (Policy.PolicyNo LIKE '%${req.body.search}%') 
        OR (Policy.Account LIKE '%${req.body.search}%')
        OR (ID_Entry.IDNo LIKE '%${req.body.search}%'))
        AND Policy.PolicyType = 'COM' AND SUBSTRING(Policy.PolicyNo,1,2) = 'TP'
        ORDER BY Policy.DateIssued desc
        limit 500
        `
      ),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data: [] });
  }
});

// TPL
VehiclePolicy.post("/get-tpl-id", async (req, res) => {
  try {
    res.send({
      message: "Search Successfully",
      success: true,
      data: await getTPL_IDS(req.body.search as string, req),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data: [] });
  }
});

VehiclePolicy.post("/search-policy-tpl", async (req, res) => {
  try {
    res.send({
      message: "Search Successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(
        `
        SELECT 
          date_format(Policy.DateIssued,'%M  %d, %Y') AS Date, 
          Policy.PolicyNo, Policy.Account, 
          ID_Entry.cID_No AS Name
        FROM policy as Policy
        LEFT JOIN  vpolicy as VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo 
        LEFT JOIN ( 
          SELECT 
                        a.entry_client_id as IDNo,
                            sub_account,
                            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                    FROM
                        entry_client a UNION ALL SELECT 
                        a.entry_supplier_id as IDNo,
                            sub_account,
                            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                    FROM
                        entry_supplier a UNION ALL SELECT 
                        a.entry_employee_id as IDNo,
                            sub_account,
                            IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                    FROM
                        entry_employee a UNION ALL SELECT 
                        a.entry_fixed_assets_id as IDNo, sub_account, a.fullname AS cID_No
                    FROM
                        entry_fixed_assets a UNION ALL SELECT 
                        a.entry_others_id as IDNo, sub_account, a.description AS cID_No
                    FROM
                        entry_others a UNION ALL SELECT 
                        a.entry_agent_id as IDNo,
                            sub_account,
                            IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                    FROM
                        entry_agent a
        ) ID_Entry  ON Policy.IDNo = ID_Entry.IDNo
        WHERE 
        
        ((VPolicy.ChassisNo LIKE '%${req.body.search}%') 
        OR (VPolicy.MotorNo LIKE '%${req.body.search}%') 
        OR (VPolicy.PlateNo LIKE '%${req.body.search}%') 
        OR (ID_Entry.cID_No LIKE '%${req.body.search}%') 
        OR (Policy.PolicyNo LIKE '%${req.body.search}%') 
        OR (Policy.Account LIKE '%${req.body.search}%')
        OR (ID_Entry.IDNo LIKE '%${req.body.search}%'))
        AND Policy.PolicyType = 'TPL' AND SUBSTRING(Policy.PolicyNo,1,2) <> 'TP'
        ORDER BY Policy.DateIssued desc
        limit 500
        `
      ),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data: [] });
  }
});

// =================== old  ===================
async function insertNewVPolicy(
  {
    policy,
    dateFromRef,
    dateToRef,
    dateIssuedRef,
    clientIDRef,
    clientNameRef,
    accountRef,
    subAccountRef,
    policyNoRef,
    totalPremiumRef,
    vatRef,
    docstampRef,
    _localGovTaxRef,
    stradComRef,
    totalDueRef,
    agentIdRef,
    agentCommisionRef,
    corNoRef,
    orNoRef,
    modelRef,
    makeRef,
    typeOfBodyRef,
    plateNoRef,
    chassisNoRef,
    motorNoRef,
    colorRef,
    bltFileNoRef,
    authorizedCapacityRef,
    unladenWeightRef,
    premiumPaidRef,
    estimatedValueSchedVehicleRef,
    airconRef,
    stereoRef,
    magwheelsRef,
    othersSpecifyRef,
    othersSpecifyRef_,
    DeductibleRef,
    towingRef,
    authorizedRepairLimitRef,
    bodyInjuryRef,
    propertyDamageRef,
    personalAccidentRef,
    sectionI_IIRef,
    sectionIIIRef,
    ownDamageRef,
    theftRef,
    sectionIVARef,
    sectionIVBRef,
    othersRef,
    _aogRef,
    mortgageecheckRef,
    mortgageeSelect,
    dinomination,
    aogRef,
    localGovTaxRef,
    typeRef,
    strArea,
    cStrArea,
    Source_No_Ref_ID = "",
    form_action,
    rateCostRef = 0,
    remarksRef,
  }: any,
  req: Request
) {
  let DateFrom: any = defaultFormat(new Date(dateFromRef));
  let DateTo: any = defaultFormat(new Date(dateToRef));
  let DateIssued: any = defaultFormat(new Date(dateIssuedRef));

  await createPolicy(
    {
      IDNo: clientIDRef,
      Account: accountRef,
      SubAcct: subAccountRef,
      PolicyType: policy,
      PolicyNo: policyNoRef,
      DateIssued,
      TotalPremium: parseFloat(totalPremiumRef.replace(/,/g, "")),
      Vat: parseFloat(vatRef.replace(/,/g, "")).toFixed(2),
      DocStamp: parseFloat(docstampRef.replace(/,/g, "")).toFixed(2),
      FireTax: "0",
      LGovTax: parseFloat(_localGovTaxRef.replace(/,/g, "")).toFixed(2),
      Notarial: "0",
      Misc: parseFloat(stradComRef.replace(/,/g, "")).toFixed(2),
      TotalDue: parseFloat(totalDueRef.replace(/,/g, "")).toFixed(2),
      TotalPaid: "0",
      Journal: false,
      AgentID: agentIdRef,
      AgentCom: agentCommisionRef,
    },
    req
  );
  // insert vehicle policy
  await createVehiclePolicy(
    {
      PolicyNo: policyNoRef,
      Account: accountRef,
      PolicyType: policy,
      CoverNo: corNoRef,
      ORNo: orNoRef,
      DateFrom,
      DateTo,
      Model: modelRef,
      Make: makeRef,
      BodyType: typeOfBodyRef,
      Color: colorRef,
      BLTFileNo: bltFileNoRef,
      PlateNo: plateNoRef,
      ChassisNo: chassisNoRef,
      MotorNo: motorNoRef,
      AuthorizedCap: authorizedCapacityRef,
      UnladenWeight: unladenWeightRef,
      TPL: "",
      TPLLimit: "0.00",
      PremiumPaid: parseFloat(
        premiumPaidRef.toString().replace(/,/g, "")
      ).toFixed(2),
      EstimatedValue: parseFloat(
        estimatedValueSchedVehicleRef.toString().replace(/,/g, "")
      ).toFixed(2),
      Aircon: parseFloat(airconRef.toString().replace(/,/g, "")).toFixed(2),
      Stereo: parseFloat(stereoRef.toString().replace(/,/g, "")).toFixed(2),
      Magwheels: parseFloat(magwheelsRef.toString().replace(/,/g, "")).toFixed(
        2
      ),
      Others: othersSpecifyRef,
      OthersAmount: parseFloat(
        othersSpecifyRef_.toString().replace(/,/g, "")
      ).toFixed(2),
      Deductible: parseFloat(
        DeductibleRef.toString().replace(/,/g, "")
      ).toFixed(2),
      Towing: parseFloat(towingRef.toString().replace(/,/g, "")).toFixed(2),
      RepairLimit: parseFloat(
        authorizedRepairLimitRef.toString().replace(/,/g, "")
      ).toFixed(2),
      BodilyInjury: parseFloat(
        bodyInjuryRef.toString().replace(/,/g, "")
      ).toFixed(2),
      PropertyDamage: parseFloat(
        propertyDamageRef.toString().replace(/,/g, "")
      ).toFixed(2),
      PersonalAccident: parseFloat(
        personalAccidentRef.toString().replace(/,/g, "")
      ).toFixed(2),
      SecI: parseFloat(sectionI_IIRef.toString().replace(/,/g, "")).toFixed(2),
      SecIIPercent: parseFloat(
        sectionIIIRef.toString().replace(/,/g, "")
      ).toFixed(2),
      ODamage: parseFloat(ownDamageRef.toString().replace(/,/g, "")).toFixed(2),
      Theft: parseFloat(theftRef.toString().replace(/,/g, "")).toFixed(2),
      Sec4A: parseFloat(sectionIVARef.toString().replace(/,/g, "")).toFixed(2),
      Sec4B: parseFloat(sectionIVBRef.toString().replace(/,/g, "")).toFixed(2),
      Sec4C: parseFloat(othersRef.replace(/,/g, "")).toFixed(2),
      AOG: parseFloat(_aogRef.replace(/,/g, "")).toFixed(2),
      MortgageeForm: mortgageecheckRef,
      Mortgagee: mortgageeSelect,
      Denomination: dinomination,
      AOGPercent: parseFloat(aogRef.toString().replace(/,/g, "")).toFixed(2),
      LocalGovTaxPercent: parseFloat(
        localGovTaxRef.toString().replace(/,/g, "")
      ).toFixed(2),
      TPLTypeSection_I_II: typeRef,
      Remarks: remarksRef,
    },
    req
  );

  if (policyNoRef.includes("TP-")) {
    await createJournalInVP(
      {
        Branch_Code: subAccountRef,
        Date_Entry: DateIssued,
        Source_Type: "PL",
        Source_No: policyNoRef,
        Explanation: `${policy} Production`,
        GL_Acct: "1.03.03",
        Sub_Acct: strArea,
        ID_No: policyNoRef,
        cGL_Acct: "Premium Receivable",
        cSub_Acct: cStrArea,
        cID_No: clientNameRef,
        Debit: parseFloat(totalDueRef.toString().replace(/,/g, "")),
        Credit: 0,
        TC: "P/R",
        Remarks: "",
        Source_No_Ref_ID,
      },
      req
    );
  } else {
    await createJournalInVP(
      {
        Branch_Code: subAccountRef,
        Date_Entry: DateIssued,
        Source_Type: "PL",
        Source_No: policyNoRef,
        Explanation: `${policy} Production`,
        GL_Acct: "1.03.01",
        Sub_Acct: strArea,
        ID_No: policyNoRef,
        cGL_Acct: "Premium Receivable",
        cSub_Acct: cStrArea,
        cID_No: clientNameRef,
        Debit: parseFloat(totalDueRef.toString().replace(/,/g, "")),
        Credit: 0,
        TC: "P/R",
        Remarks: "",
        Source_No_Ref_ID,
      },
      req
    );
  }

  if (policyNoRef.includes("TP-")) {
    await createJournalInVP(
      {
        Branch_Code: subAccountRef,
        Date_Entry: DateIssued,
        Source_Type: "PL",
        Source_No: policyNoRef,
        Explanation: `${policy} Production`,
        GL_Acct: "4.02.07",
        Sub_Acct: strArea,
        ID_No: policyNoRef,
        cGL_Acct: "A/P",
        cSub_Acct: cStrArea,
        cID_No: clientNameRef,
        Debit: 0,
        Credit: parseFloat(totalDueRef.toString().replace(/,/g, "")),
        TC: "A/P",
        Remarks: "",
        Source_No_Ref_ID,
      },
      req
    );
  } else {
    await createJournalInVP(
      {
        Branch_Code: subAccountRef,
        Date_Entry: DateIssued,
        Source_Type: "PL",
        Source_No: policyNoRef,
        Explanation: `${policy} Production`,
        GL_Acct: "4.02.01",
        Sub_Acct: strArea,
        ID_No: policyNoRef,
        cGL_Acct: "A/P",
        cSub_Acct: cStrArea,
        cID_No: clientNameRef,
        Debit: 0,
        Credit: parseFloat(totalDueRef.toString().replace(/,/g, "")),
        TC: "A/P",
        Remarks: "",
        Source_No_Ref_ID,
      },
      req
    );
  }

  if (form_action === "REG" && policy === "TPL") {
    await updateJournalByPolicy(policyNoRef, "CTPL Registration", req);
    await createJournalInVP(
      {
        Branch_Code: subAccountRef,
        Date_Entry: DateIssued,
        Source_Type: "GL",
        Source_No: policyNoRef,
        Explanation: `${policy} Production`,
        GL_Acct: "4.02.01",
        Sub_Acct: strArea,
        ID_No: policyNoRef,
        cGL_Acct: "A/P",
        cSub_Acct: cStrArea,
        cID_No: clientNameRef,
        Debit: parseFloat(totalDueRef.toString().replace(/,/g, "")),
        Credit: 0,
        TC: "P/R",
        Remarks: "",
        Source_No_Ref_ID,
      },
      req
    );
    await createJournalInVP(
      {
        Branch_Code: subAccountRef,
        Date_Entry: DateIssued,
        Source_Type: "GL",
        Source_No: policyNoRef,
        Explanation: `${policy} Production`,
        GL_Acct: "1.04.01",
        Sub_Acct: strArea,
        ID_No: policyNoRef,
        cGL_Acct: "CTPL Inventory",
        cSub_Acct: cStrArea,
        cID_No: clientNameRef,
        Debit: 0,
        Credit: parseFloat(rateCostRef.toString().replace(/,/g, "")),
        TC: "CTI",
        Remarks: "",
        Source_No_Ref_ID,
      },
      req
    );
    await createJournalInVP(
      {
        Branch_Code: subAccountRef,
        Date_Entry: DateIssued,
        Source_Type: "GL",
        Source_No: policyNoRef,
        Explanation: `${policy} Production`,
        GL_Acct: "6.01.10",
        Sub_Acct: strArea,
        ID_No: policyNoRef,
        cGL_Acct: "CTPL Income",
        cSub_Acct: cStrArea,
        cID_No: clientNameRef,
        Debit: 0,
        Credit:
          parseFloat(totalDueRef.toString().replace(/,/g, "")) -
          parseFloat(rateCostRef.toString().replace(/,/g, "")),
        TC: "CIN",
        Remarks: "",
        Source_No_Ref_ID,
      },
      req
    );
  }
}
VehiclePolicy.get(
  "/get-vehicle-policy-temp-id",
  async (req: Request, res: Response) => {
    try {
      res.send({
        message: "Successfully get data",
        success: true,
        tempId: await getTempPolicyID(req),
      });
    } catch (error: any) {
      console.log(error.message);

      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        tempId: [],
      });
    }
  }
);
VehiclePolicy.get(
  "/search-client-vehicle-policy",
  async (req: Request, res: Response) => {
    try {
      res.send({
        message: "Successfully search data",
        success: true,
        vehiclePolicy: {
          clients: await getClients(
            req.query.clientSearch as string,
            true,
            req
          ),
        },
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
VehiclePolicy.get(
  "/search-agent-vehicle-policy",
  async (req: Request, res: Response) => {
    try {
      res.send({
        message: "Successfully search data",
        success: true,
        vehiclePolicy: {
          agents: await getAgents(req.query.agentSearch as string, true, req),
        },
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
VehiclePolicy.get(
  "/tpl-ids-vehicle-policy",
  async (req: Request, res: Response) => {
    try {
      res.send({
        message: "Successfully search data",
        success: true,
        tpl_ids: await getTPL_IDS(req.query.tplIDSearch as string, req),
      });
    } catch (error: any) {
      console.log(error.message);

      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        tpl_ids: [],
      });
    }
  }
);
VehiclePolicy.post("/tpl-add-vehicle-policy", async (req, res) => {
  // convertToPassitive(req);
  const { sub_account, client_id, PolicyAccount, PolicyNo, Denomination } =
    req.body;
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

    //get Commision rate
    const rate = (
      (await getRate(PolicyAccount, "Vehicle", Denomination, req)) as Array<any>
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

    // const strArea = "HO";
    // const cStrArea = "Head Office";
    await insertNewVPolicy({ ...req.body, cStrArea, strArea }, req);

    await saveUserLogs(req, PolicyNo, "add", "Vehicle Policy");
    res.send({ message: "Create Vehicle Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false });
  }
});
VehiclePolicy.post("/tpl-update-vehicle-policy", async (req, res) => {
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
  const {
    form_type,
    sub_account,
    client_id,
    PolicyAccount,
    PolicyNo,
    Denomination,
  } = req.body;
  try {
    if (!(await saveUserLogsCode(req, "update", PolicyNo, "Vehicle Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    //get Commision rate
    const rate = (
      (await getRate(PolicyAccount, "Vehicle", Denomination, req)) as Array<any>
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

    const cost: any = await getCostByTPL(PolicyNo, req);
    req.body.rateCost = cost[0].Cost;
    //delete policy
    await deletePolicyByVehicle(form_type, PolicyNo, req);
    //delete v policy
    await deleteVehiclePolicy(form_type, PolicyNo, req);
    //delete journal
    await deleteTPLFromJournalBySource(PolicyNo, req);
    // await deleteJournalBySource(PolicyNo, "PL", req);

    // insert policy
    await insertNewVPolicy({ ...req.body, cStrArea, strArea }, req);
    res.send({ message: "Update Vehicle Policy Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false });
  }
});
VehiclePolicy.get("/tpl-search-vehicle-policy", async (req, res) => {
  const { form_type, form_action, search } = req.query;
  const getSearch = await searchDataVPolicy(
    search as string,
    form_type as string,
    (form_action as string) === "TEMP",
    req
  );
  res.send({
    message: "Search Successfully",
    success: true,
    searchVPolicy: getSearch,
  });
});
VehiclePolicy.post("/tpl-delete-vehicle-policy", async (req, res) => {
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
    if (!(await saveUserLogsCode(req, "delete", PolicyNo, "Vehicle Policy"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    //delete policy
    await deletePolicyByVehicle(form_type, PolicyNo, req);
    // //delete v policy
    await deleteVehiclePolicy(form_type, PolicyNo, req);

    await saveUserLogs(req, PolicyNo, "delete", "Vehicle Policy");
    res.send({
      message: "Delete Vehicle Policy Successfully",
      success: true,
    });
  } catch (err: any) {
    res.send({
      message: err.message,
      success: false,
    });
  }
});

export default VehiclePolicy;
