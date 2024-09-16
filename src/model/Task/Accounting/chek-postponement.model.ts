import { Request } from "express";
import { PrismaList } from "../../connection";
import { selectClient } from "./pdc.model";
const { CustomPrismaClient } = PrismaList();

export async function searchPDCCLients(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
 SELECT 
    PNo, max(Name) as Name, 'HO' AS branch_code, 'Head Office' AS branch_name
FROM
    pdc a
WHERE
    PDC_Status = 'Stored' 
    group by PNo
  `;

  return await prisma.$queryRawUnsafe(qry);
}

export async function checkPostponementRequestAutoID(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    SELECT 
      concat('CDPR-',a.year, LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),a.last_count + 1) as pullout_request
    FROM
        id_sequence a
    WHERE
      type = 'check-postponement';
  ;`);
}
export async function getCheckPostponementPNNo(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    SELECT 
        a.PNo, MAX(a.IDNo) as IDNo, MAX(a.Name) as Name , MAX(c.ShortName) as branch
    FROM
          pdc a
        left join (
        SELECT 
            "Client" as IDType,
            aa.entry_client_id AS IDNo,
            aa.sub_account,
            if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
            aa.entry_client_id as client_id,
            aa.address
        FROM
              entry_client aa
            union all
        SELECT 
            "Agent" as IDType,
            aa.entry_agent_id AS IDNo,
            aa.sub_account,
            CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
            aa.entry_agent_id as client_id,
            aa.address
        FROM
              entry_agent aa
            union all
        SELECT 
            "Employee" as IDType,
            aa.entry_employee_id AS IDNo,
            aa.sub_account,
            CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
            aa.entry_employee_id as client_id,
            aa.address
        FROM
              entry_employee aa
        union all
        SELECT 
            "Supplier" as IDType,
            aa.entry_supplier_id AS IDNo,
            aa.sub_account,
            if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
            aa.entry_supplier_id as client_id,
            aa.address
        FROM
              entry_supplier aa
            union all
        SELECT 
            "Fixed Assets" as IDType,
            aa.entry_fixed_assets_id AS IDNo,
            aa.sub_account,
            aa.fullname AS Shortname,
            aa.entry_fixed_assets_id as client_id,
            CONCAT(aa.description, " - ", aa.remarks) AS address
        FROM
              entry_fixed_assets aa
            union all
        SELECT 
            "Others" as IDType,
            aa.entry_others_id AS IDNo,
            aa.sub_account,
            aa.description AS Shortname,
            aa.entry_others_id as client_id,
            CONCAT(aa.description, " - ", aa.remarks) AS address
        FROM
              entry_others aa
        
        ) b on a.IDNo = b.IDNo
        left join   sub_account c on b.sub_account = c.Sub_Acct
        WHERE 
            
            a.PDC_Status = 'Stored' and 
            (
              a.PNo LIKE '%${search}%' OR
              a.IDNo LIKE '%${search}%' OR
              a.Name LIKE '%${search}%' 
            )
    GROUP BY a.PNo
    LIMIT 100;
    `;
  return await prisma.$queryRawUnsafe(query);
}

export async function getRCPNList(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
   Select RPCDNo from Postponement Where Status = 'PENDING'
  ;`);
}

export async function getRCPNDetails(req: Request, RPCDNo: string) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
   SELECT 
    a.RPCDNo,
    a.PNNo,
    a.HoldingFees,
    a.PenaltyCharge,
    a.Surplus,
    a.Deducted_to,
    a.PaidVia,
    a.PaidInfo,
    a.PaidDate,
    a.ClientBranch,
    b.*,
    c.Name,
    b.reason,
    b.NewCheckDate,
    a.Requested_By,
    a.Requested_Date
FROM
    postponement a
        LEFT JOIN
    (SELECT 
        PDC_ID,
            DATE_FORMAT(Check_Date, '%m/%d/%Y') AS Check_Date,
            Bank,
            Check_No,
            FORMAT(CAST(REPLACE(Check_Amnt, ',', '') AS DECIMAL(10,2)), 2) as  Check_Amnt,
            IFNULL(Status, '--') AS Status,
            PNo,
            reason,
            date_format(NewCheckDate , '%m/%d/%Y') as NewCheckDate,
            LPAD(ROW_NUMBER() OVER (), 3, '0') as temp_id
    FROM
        PDC PD
    LEFT JOIN (SELECT 
        bb.CheckNo, aa.Status, bb.reason, bb.NewCheckDate
    FROM
        postponement aa
    LEFT JOIN postponement_detail bb ON aa.RPCDNo = bb.RPCD AND bb.cancel = 0) b ON PD.Check_No = b.CheckNo
    WHERE
        PDC_Status = 'Stored'
            AND Status IN ('PENDING' , 'APPROVED', 'DECLINED')
    ORDER BY Check_No) b ON a.PNNo = b.PNo
        LEFT JOIN
    (SELECT 
        *
    FROM
        (SELECT 
        a.IDType AS Type,
            a.IDNo,
            a.sub_account,
            a.Shortname AS Name,
            a.client_id,
            a.ShortName AS sub_shortname,
            b.ShortName,
            b.Acronym,
            IF(a.IDType = 'Policy'
                AND c.PolicyType = 'COM'
                OR c.PolicyType = 'TPL', CONCAT('C: ', c.ChassisNo, '  ', 'E: ', c.MotorNo), '') AS remarks
    FROM
        (SELECT 
        'Client' AS IDType,
            aa.entry_client_id AS IDNo,
            aa.sub_account,
            IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS Shortname,
            aa.entry_client_id AS client_id
    FROM
        entry_client aa UNION ALL SELECT 
        'Agent' AS IDType,
            aa.entry_agent_id AS IDNo,
            aa.sub_account,
            CONCAT(IF(aa.lastname IS NOT NULL
                AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS Shortname,
            aa.entry_agent_id AS client_id
    FROM
        entry_agent aa UNION ALL SELECT 
        'Employee' AS IDType,
            aa.entry_employee_id AS IDNo,
            aa.sub_account,
            CONCAT(IF(aa.lastname IS NOT NULL
                AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS Shortname,
            aa.entry_employee_id AS client_id
    FROM
        entry_employee aa UNION ALL SELECT 
        'Supplier' AS IDType,
            aa.entry_supplier_id AS IDNo,
            aa.sub_account,
            IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS Shortname,
            aa.entry_supplier_id AS client_id
    FROM
        entry_supplier aa UNION ALL SELECT 
        'Fixed Assets' AS IDType,
            aa.entry_fixed_assets_id AS IDNo,
            aa.sub_account,
            aa.fullname AS Shortname,
            aa.entry_fixed_assets_id AS client_id
    FROM
        entry_fixed_assets aa UNION ALL SELECT 
        'Others' AS IDType,
            aa.entry_others_id AS IDNo,
            aa.sub_account,
            aa.description AS Shortname,
            aa.entry_others_id AS client_id
    FROM
        entry_others aa UNION ALL SELECT 
        'Policy' AS IDType,
            a.PolicyNo AS IDNo,
            b.sub_account,
            IF(b.option = 'individual', CONCAT(IF(b.lastname IS NOT NULL
                AND b.lastname <> '', CONCAT(b.lastname, ', '), ''), b.firstname), b.company) AS Shortname,
            a.IDNo AS client_id
    FROM
        policy a
    LEFT JOIN entry_client b ON a.IDNo = b.entry_client_id) a
    LEFT JOIN sub_account b ON a.sub_account = b.Sub_Acct
    LEFT JOIN vpolicy c ON a.IDNo = c.PolicyNo) a) c ON a.PNNo = c.IDNo
  where a.RPCDNo = '${RPCDNo}'
  `;

  return await prisma.$queryRawUnsafe(qry);
}

export async function getSelectedCheckPostponementPNNo(
  PNNo: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
      SELECT 
          PDC_ID,
          date_format(Check_Date , '%m/%d/%Y') as Check_Date,
          Bank,
          Check_No,
          Check_Amnt,
          ifnull(Status,'--') as Status
      FROM
            PDC PD
          left join (
            SELECT bb.CheckNo,aa.Status FROM  postponement aa
                left join  postponement_detail bb on aa.RPCDNo = bb.RPCD and bb.cancel = 0 and  aa.Status <> 'CANCEL'
                ) b on PD.Check_No = b.CheckNo 
      WHERE
        PNo = '${PNNo}'
        AND PDC_Status = 'Stored'
        ORDER BY Check_No
    ;`;
  return await prisma.$queryRawUnsafe(query);
}

export async function deleteOnUpdate(req: Request, RPCDNo: string) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  await prisma.$queryRawUnsafe(`Delete from Postponement where RPCDNo = '${RPCDNo}'`);
  await prisma.$queryRawUnsafe(`Delete from Postponement_Detail where RPCD ='${RPCDNo}' `);
}

export async function searchEditPostponentRequest(
  search: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  SELECT 
    RPCDNo,
    PNNo,
    Deducted_to,
    ClientBranch,
    format(HoldingFees,2) AS holdingFee,
    format(PenaltyCharge,2) AS penaltyCharge,
    format(Surplus,2) AS surplus,
    Deducted_to AS deductedTo,
    PaidVia AS paidVia,
    PaidInfo AS paidInfo,
    date_format(PaidDate,'%Y-%m-%d') AS paidDate,
    Requested_By,
    Requested_Date,
    format(CAST(REPLACE(HoldingFees, ',', '') AS DECIMAL) + CAST(REPLACE(PenaltyCharge, ',', '') AS DECIMAL) + CAST(REPLACE(Surplus, ',', '') AS DECIMAL),2) AS total
  FROM
      postponement a
  WHERE
    Status = 'PENDING' AND
    (
      RPCDNo LIKE '%${search}%' OR 
      PNNo LIKE '%${search}%' OR 
      Deducted_to LIKE '%${search}%'
    )
  `;
  return await prisma.$queryRawUnsafe(query);
}
export async function searchSelectedEditPostponentRequest(
  RPCD: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    SELECT 
        b.Check_No,
        b.Bank,
        b.Check_Amnt,
        DATE_FORMAT(b.Check_Date, '%Y-%m-%d') AS Check_Date,
        DATE_FORMAT(a.NewCheckDate, '%Y-%m-%d') AS New_Check_Date,
        ABS(DATEDIFF(a.NewCheckDate, b.Check_Date)) AS DateDiff,
        a.Reason,
        c.Status,
        LPAD(ROW_NUMBER() OVER (), 3, '0') as temp_id
    FROM
          postponement_detail a
            LEFT JOIN
          pdc b ON a.CheckNo = b.Check_No
        LEFT JOIN 
          postponement c on a.RPCD = c.RPCDNo
    WHERE
      RPCD = '${RPCD}' AND
      a.cancel = 0 AND
      c.Status = 'PENDING'
    ;`;
  return await prisma.$queryRawUnsafe(query);
}
export async function updateOnCancelPostponentRequest(
  RPCD: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    update    postponement a set a.Status = 'CANCEL'  where a.RPCDNo = '${RPCD}'
    ;`;
  return await prisma.$queryRawUnsafe(query);
}
export async function updateOnCancelPostponentRequestDetails(
  RPCD: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    update    postponement_detail a set a.cancel = 1  where a.RPCD = '${RPCD}'
    ;`;
  return await prisma.$queryRawUnsafe(query);
}
export async function createPostponement(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.postponement.create({ data });
}
export async function createPostponementDetails(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.postponement_detail.create({ data });
}
export async function approvalCodePostponement(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.postponement_auth_codes.create({ data });
}
export async function updatePostponementStatus(
  isApproved: boolean,
  RPCDNo: string,
  Approved_By: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  UPDATE  postponement a 
  SET 
      a.Status = '${isApproved ? "APPROVED" : "DISAPPROVED"}',
      a.Approved_By = '${Approved_By}',
      a.Approved_Date = now()
  WHERE
      a.RPCDNo = '${RPCDNo}';
  `;
  return await prisma.$queryRawUnsafe(query);
}
export async function findApprovalPostponementCode(
  code: string,
  RPCD: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    SELECT * FROM   postponement_auth_codes a where a.Approved_Code  = '${code}' AND a.RPCD='${RPCD}';
  `;
  return await prisma.$queryRawUnsafe(query);
}
export async function updateApprovalPostponementCode(
  Used_By: string,
  RPCDNo: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  UPDATE  postponement_auth_codes a 
  SET 
      a.Used_By = '${Used_By}',
      a.Used_DateTime = now()
  WHERE
      a.RPCD = '${RPCDNo}';
  `;
  return await prisma.$queryRawUnsafe(query);
}
