import { Request } from "express";
import { PrismaList } from "../../connection";
const { CustomPrismaClient } = PrismaList();

export async function load_pnno(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
      SELECT PNo, MIN(Name) AS Name, MIN(Name) AS label
    FROM pdc  
    WHERE PDC_Status = 'Stored' 
    GROUP BY PNo 
    ORDER BY PNo DESC;
  `;

  return await prisma.$queryRawUnsafe(qry);
}

export async function loadChecks(req: Request, PNo: string) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
  SELECT 
    DISTINCT PDC_ID as temp_id, 
    date_format(Check_Date , '%Y-%m-%d') as Check_Date,
    Bank, 
    Check_No, 
    FORMAT(CAST(REPLACE(Check_Amnt, ',', '') AS DECIMAL(15,2)), 2) as Check_Amnt, 
    ifnull((seleCT (selecT STATus from PullOut_Request where  RCPNo = a.RCPNo) as 'Status' 
    from PullOut_Request_Details  a where 
    (selecT STATus from PullOut_Request where  RCPNo = a.RCPNo) in ('PENDING','APPROVED') 
    and (selecT PNNo from PullOut_Request where  RCPNo = a.RCPNo)  = '${PNo}'
    and CheckNo = pd.Check_No),'--') as 'Status', 
    ifnull((seleCT RCPNO 
  from PullOut_Request_Details  a where 
  (selecT STATus from PullOut_Request where  RCPNo = a.RCPNo) in ('PENDING','APPROVED')  
  and (selecT PNNo from PullOut_Request where  RCPNo = a.RCPNo)  = '${PNo}'
  and CheckNo = pd.Check_No),'--') as 'RCPNO' 
  FROM pdc PD 
  WHERE PNo = '${PNo}' AND PDC_Status = 'Stored' ORDER BY Check_No
  `;

  return await prisma.$queryRawUnsafe(qry);
}

export async function loadRCPN(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
  Select distinct a.RCPNo as label, a.RCPNo, Reason, b.Name,b.PNo From PullOut_Request a
left join pdc b  on a.PNNo = b.PNo
Where a.Branch = 'HO' and Status = 'PENDING' Order by RCPNo
  `;
  return await prisma.$queryRawUnsafe(qry);
}

export async function loadRCPNApproved(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
      Select Distinct B.RCPNo 
        From pdc A 
        Inner join ( Select A.RCPNo, A.PNNo, b.CheckNo, a.Status 
                    From PullOut_Request A 
                  INNER JOIN PullOut_Request_Details B ON A.RCPNo = B.RCPNo ) B ON A.PNo = B.PNNo AND A.Check_No = B.CheckNo 
        WHERE PDC_Status = 'Stored' and b.Status = 'APPROVED' 
        Order by B.RCPNo
    `;
  return await prisma.$queryRawUnsafe(qry);
}

export async function loadRCPNApprovedList(req: Request, RCPN: string) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  let whr = "";
  if (RCPN !== "") {
    whr = ` and b.RCPNo = '${RCPN}' `;
  }
  const qry = `
       Select B.RCPNo, b.PNNo, a.Name, count(b.CheckNo) NoOfChecks, b.Reason
        From pdc A 
        Inner join ( Select A.RCPNo, A.PNNo, b.CheckNo, a.Status, a.Reason 
        			    From PullOut_Request A 
        			    INNER JOIN PullOut_Request_Details B  ON A.RCPNo = B.RCPNo ) B ON A.PNo = B.PNNo AND A.Check_No = B.CheckNo 
        WHERE PDC_Status = 'Stored' and b.Status = 'APPROVED' ${whr}
        Group by B.RCPNo, b.PNNo, a.Name, b.Reason 
        Order by B.RCPNo
    `;
    
  return await prisma.$queryRawUnsafe(qry);
}
// =======

export async function pulloutRequestAutoID(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT 
    concat('HOPO',a.year, LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),a.last_count + 1) as pullout_request
  FROM
      id_sequence a
  WHERE
    type = 'pullout';
;`);
}

export async function deletePulloutRequest(req: Request, RCPNo: string) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    Delete from pullOut_request where RCPNo = '${RCPNo}'
;`);
}

export async function deletePulloutRequestDetails(req: Request, RCPNo: string) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.$queryRawUnsafe(`
    Delete from pullout_request_details where RCPNo = '${RCPNo}'
;`);
}

export async function pulloutRequestPNoWithName(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT 
      a.PNo, MAX(a.IDNo) as IDNo, MAX(a.Name) as Name
  FROM
        pdc a
      WHERE 
        a.PDC_Status = 'Stored' and
          (
            a.PNo LIKE '%${search}%' OR
            a.IDNo LIKE '%${search}%' OR
            a.Name LIKE '%${search}%' 
          )
  GROUP BY a.PNo
  LIMIT 100;
;`);
}
export async function getSelectedRequestCheck(PNNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  SELECT DISTINCT
    PDC_ID,
    CAST(ROW_NUMBER() OVER () AS CHAR) AS temp_id,
    date_format(Check_Date , '%m/%d/%Y') as Check_Date,
    Bank,
    Check_No,
    Check_Amnt,
    IFNULL((SELECT 
                    (SELECT 
                                Status
                            FROM
                                PullOut_Request
                            WHERE
                                RCPNo = a.RCPNo) AS 'Status'
                FROM
                    PullOut_Request_Details a
                WHERE
                    (SELECT 
                            Status
                        FROM
                            PullOut_Request
                        WHERE
							   Status <> 'CANCEL' AND
                            RCPNo = a.RCPNo) IN ('PENDING' , 'APPROVED','DISAPPROVED')
                        AND (SELECT 
                            PNNo
                        FROM
                            PullOut_Request
                        WHERE
                            RCPNo = a.RCPNo) = '${PNNo}'
                           
                        AND CheckNo = pd.Check_No and cancel = 0),
            '--') AS 'Status',
    IFNULL((SELECT 
                    RCPNO
                FROM
                      PullOut_Request_Details a
                WHERE
                    (SELECT 
                            Status
                        FROM
                              PullOut_Request
                        WHERE
                          Status <> 'CANCEL' AND
                            RCPNo = a.RCPNo) IN ('PENDING' , 'APPROVED','DISAPPROVED')
                        AND (SELECT 
                            PNNo
                        FROM
                            PullOut_Request
                        WHERE
                            RCPNo = a.RCPNo) = '${PNNo}'
						
                        AND CheckNo = pd.Check_No and cancel = 0),
            '--') AS 'RCPNO'
  FROM
      pdc PD
  WHERE
    PNo = '${PNNo}'
        AND PDC_Status = 'Stored'
  ORDER BY Check_No

  `;
  return await prisma.$queryRawUnsafe(query);
}
export async function getSelectedEditRequestCheck(RCPNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    SELECT 
    c.PDC_ID,
    CAST(ROW_NUMBER() OVER () AS CHAR) AS temp_id,
    date_format(Check_Date , '%m/%d/%Y') as Check_Date,
    Bank,
    Check_No,
    Check_Amnt,
    b.Status,
    a.RCPNo as RCPNO
  FROM
      pullout_request_details a
        LEFT JOIN
      pullout_request b ON a.RCPNo = b.RCPNo
    LEFT JOIN
    pdc  c ON a.CheckNo = c.Check_No AND b.PNNo = c.PNo
    where a.RCPNo = '${RCPNo}'
    ORDER BY Check_No
  `;
  return await prisma.$queryRawUnsafe(query);
}
export async function checkPNNo(PNNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.pullout_request.findMany({ where: { PNNo } });
}
export async function createPulloutRequest(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.pullout_request.create({ data });
}
export async function updatePulloutRequest(
  data: any,
  RCPNo: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.pullout_request.update({ data, where: { RCPNo } });
}
export async function updatePulloutRequestDetails(RCPNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(
    `update   pullout_request_details a set a.cancel = 1 where RCPNo = '${RCPNo}';`
  );
}
export async function createPulloutRequestDetails(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.pullout_request_details.create({ data });
}
export async function updateAnyId(type: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    UPDATE  id_sequence a
      INNER JOIN
    (SELECT 
      *
    FROM
        id_sequence bb
    WHERE
      bb.type = '${type}'
    LIMIT 1) AS b ON a.type = b.type 
    SET 
    a.last_count = LPAD(SUBSTRING((b.last_count), - 4) + 1,
          4,
          '0')
    WHERE
    a.type = '${type}'
  `);
}
export async function searchPulloutRequestOnEdit(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  SELECT 
      a.RCPNo,
      a.PNNo,
      b.Name,
      a.reason
    FROM
          pullout_request a
            LEFT JOIN
        (SELECT 
        a.IDType,
        a.IDNo,
        a.sub_account,
      a.Shortname as Name,
        a.client_id,
        LPAD(ROW_NUMBER() OVER (), 3, '0') AS ID
      FROM
        (
    SELECT 
          "Client" as IDType,
                aa.entry_client_id AS IDNo,
          aa.sub_account,
          if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
              aa.entry_client_id as client_id  
            FROM
                  entry_client aa
                union all
          SELECT 
          "Agent" as IDType,
                aa.entry_agent_id AS IDNo,
          aa.sub_account,
          CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                aa.entry_agent_id as client_id  
            FROM
                  entry_agent aa
                union all
          SELECT 
          "Employee" as IDType,
                aa.entry_employee_id AS IDNo,
          aa.sub_account,
          CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                aa.entry_employee_id as client_id
            FROM
                  entry_employee aa
          union all
          SELECT 
          "Supplier" as IDType,
                aa.entry_supplier_id AS IDNo,
          aa.sub_account,
          if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                aa.entry_supplier_id as client_id
            FROM
                  entry_supplier aa
                union all
          SELECT 
          "Fixed Assets" as IDType,
                aa.entry_fixed_assets_id AS IDNo,
          aa.sub_account,
          aa.fullname AS Shortname,
                aa.entry_fixed_assets_id as client_id
            FROM
                  entry_fixed_assets aa
                union all
          SELECT 
          "Others" as IDType,
                aa.entry_others_id AS IDNo,
          aa.sub_account,
          aa.description AS Shortname,
                aa.entry_others_id as client_id
            FROM
                  entry_others aa
        union all
      SELECT 
        'Policy ID' AS IDType,
        aa.PolicyNo as IDNo,
        bb.sub_account,
        bb.Shortname,
            aa.IDNo as client_id
      FROM
          policy aa
      LEFT JOIN
        (SELECT 
          "Client" as IDType,
                aa.entry_client_id AS IDNo,
          aa.sub_account,
          if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
              aa.entry_client_id as client_id  
            FROM
                  entry_client aa
                union all
          SELECT 
          "Agent" as IDType,
                aa.entry_agent_id AS IDNo,
          aa.sub_account,
          CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                aa.entry_agent_id as client_id  
            FROM
                  entry_agent aa
                union all
          SELECT 
          "Employee" as IDType,
                aa.entry_employee_id AS IDNo,
          aa.sub_account,
          CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                aa.entry_employee_id as client_id
            FROM
                  entry_employee aa
          union all
          SELECT 
          "Supplier" as IDType,
                aa.entry_supplier_id AS IDNo,
          aa.sub_account,
          if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                aa.entry_supplier_id as client_id
            FROM
                  entry_supplier aa
                union all
          SELECT 
          "Fixed Assets" as IDType,
                aa.entry_fixed_assets_id AS IDNo,
          aa.sub_account,
          aa.fullname AS Shortname,
                aa.entry_fixed_assets_id as client_id
            FROM
                  entry_fixed_assets aa
                union all
          SELECT 
          "Others" as IDType,
                aa.entry_others_id AS IDNo,
          aa.sub_account,
          aa.description AS Shortname,
                aa.entry_others_id as client_id
            FROM
                  entry_others aa ) bb ON aa.IDNo = bb.IDNo
        ) a
      
        ) b on b.IDNo =  a.PNNo
        WHERE
        a.Status = 'PENDING' and (
          a.PNNo LIKE '%${search}%'
          OR b.Name LIKE '%${search}%'
          OR a.RCPNo LIKE '%${search}%'
        )
      `;
  return await prisma.$queryRawUnsafe(query);
}
export async function approvedPullout(
  RCPNo: string,
  username: string,
  isApproved: boolean,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  update  pullout_request a
      set 
        a.Status = '${isApproved ? "APPROVED" : "DISAPPROVED"}',
        a.Approved_By = '${username}',
        a.Approved_Date= now()
    WHERE
    a.RCPNo ='${RCPNo}'      
  `;
  return prisma.$queryRawUnsafe(query);
}
export async function insertApprovalCode(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.pullout_auth_codes.create({ data });
}

export async function existApprovalCode(
  RCPN: string,
  Approved_Code: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT 
    *
  FROM
      pullout_auth_codes a
  WHERE
    a.RCPN = '${RCPN}'
        AND a.Approved_Code = '${Approved_Code}' and used_by is null`);
}

export async function updateApprovalCode(
  RCPN: string,
  Approved_Code: string,
  used_by: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  update 
      pullout_auth_codes a set a.used_by='${used_by}', a.used_datetime=NOW()
  WHERE
    a.RCPN = '${RCPN}'
        AND a.Approved_Code = '${Approved_Code}'`);
}
// sender = upwardumis2020@gmail.com , pass = vapw ridu eorg
// upwardinsurance.grace@gmail.com
// lva_ancar@yahoo.com
