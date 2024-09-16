import { Request } from "express";
import { PrismaList } from "../../connection";
const { CustomPrismaClient } = PrismaList();

export async function getInsuranceList(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `SELECT distinct Account FROM policy_account;`;
  return await prisma.$queryRawUnsafe(qry);
}

export async function claimSelectedPolicy(PolicyNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const qry = `
    select * from (
        SELECT 
        a.PolicyType as policy,
        ifnull(b.Account,'') as Account ,
        ifnull(b.PlateNo,'') as PlateNo ,
        ifnull(b.Model,'') as Model ,
        ifnull(b.BodyType,'') as BodyType ,
        ifnull(b.Make,'') as Make ,
        ifnull(b.ChassisNo,'') as ChassisNo ,
        ifnull(b.MotorNo,'') as MotorNo ,
        ifnull(b.ORNo,'') as ORNo ,
        ifnull(b.CoverNo,'') as CoverNo ,
        ifnull(b.BLTFileNo,'') as BLTFileNo ,
        a.PolicyNo ,
        ifnull(b.DateFrom ,
              ifnull(c.DateFrom ,
              ifnull(d.DateFrom ,ifnull(e.PeriodFrom,ifnull(f.PeriodFrom,g.PeriodFrom))))) as DateFrom,
        ifnull(b.DateTo ,
        ifnull(c.DateTo ,
        ifnull(d.DateTo ,ifnull(e.PeriodTo,ifnull(f.PeriodTo,g.PeriodTo))))) as DateTo,
        i.totaDue,
        i.totalpaid,
        i.balance,
        i.remitted
        FROM policy a
        LEFT JOIN vpolicy b on a.PolicyNo = b.PolicyNo
        LEFT JOIN fpolicy c on a.PolicyNo = c.PolicyNo
        LEFT JOIN mpolicy d on a.PolicyNo = d.PolicyNo
        LEFT JOIN msprpolicy e on a.PolicyNo = e.PolicyNo
        LEFT JOIN cglpolicy f on a.PolicyNo = f.PolicyNo
        LEFT JOIN papolicy g on a.PolicyNo = g.PolicyNo
        LEFT JOIN (
      ${comnputationQry()}
        ) i on  a.PolicyNo = i.PolicyNo
              where 
              ifnull(b.DateFrom ,
              ifnull(c.DateFrom ,
              ifnull(d.DateFrom ,ifnull(e.PeriodFrom,ifnull(f.PeriodFrom,g.PeriodFrom)))))  is not null
              AND TRIM(a.PolicyType) in ('TPL','COM','MAR','FIRE','PA','CGL') 
        ) a
            where  
          a.PolicyNo = '${PolicyNo}' 
  `;
  return await prisma.$queryRawUnsafe(qry);
}

export async function claimsPolicy(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
  select 
      a.PolicyNo,
      a.IDNo,
      h.Shortname as AssuredName,
      ifnull(ChassisNo,'') as ChassisNo
  FROM policy a
      LEFT JOIN vpolicy b on a.PolicyNo = b.PolicyNo
      LEFT JOIN fpolicy c on a.PolicyNo = c.PolicyNo
      LEFT JOIN mpolicy d on a.PolicyNo = d.PolicyNo
      LEFT JOIN msprpolicy e on a.PolicyNo = e.PolicyNo
      LEFT JOIN cglpolicy f on a.PolicyNo = f.PolicyNo
      LEFT JOIN papolicy g on a.PolicyNo = g.PolicyNo
      LEFT JOIN (
      SELECT 
            "Client" as IDType,
            aa.entry_client_id AS IDNo,
            aa.sub_account,
            if(aa.option = "individual", CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''),aa.firstname), aa.company) as Shortname,
            aa.entry_client_id as client_id,
            aa.address 
          FROM
            entry_client aa
          union all
          SELECT 
            "Agent" as IDType,
            aa.entry_agent_id AS IDNo,
            aa.sub_account,
            CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname, ', '),''), aa.firstname) AS Shortname,
            aa.entry_agent_id as client_id,
            aa.address
          FROM
            entry_agent aa
          union all
          SELECT 
            "Employee" as IDType,
            aa.entry_employee_id AS IDNo,
            aa.sub_account,
            CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname , ', '),''), aa.firstname) AS Shortname,
            aa.entry_employee_id as client_id,
            aa.address  
          FROM
            entry_employee aa
          union all
          SELECT 
            "Supplier" as IDType,
            aa.entry_supplier_id AS IDNo,
            aa.sub_account,
            if(aa.option = "individual", CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname, ', '),''),aa.firstname), aa.company) as Shortname,
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
            aa.description as address
          FROM
            entry_fixed_assets aa
          union all
          SELECT 
            "Others" as IDType,
            aa.entry_others_id AS IDNo,
            aa.sub_account,
            aa.description AS Shortname,
            aa.entry_others_id as client_id,
            aa.description as address
          FROM
            entry_others aa
      ) h on a.IDNo = h.IDNo
      where 
      a.PolicyNo like '%${search}%' OR 
      a.IDNo  like '%${search}%' OR 
      ChassisNo like '%${search}%'
      order by PolicyNo
      limit 100
  `;
  return await prisma.$queryRawUnsafe(qry);
}
function comnputationQry() {
  return `
  select 
  format(a.TotalDue,2) as totaDue,
    ifnull(format(b.balance,2) , format(a.TotalDue,2)) as balance , 
    format(ifnull(a.TotalDue - b.balance , 0),2) as  totalpaid,
    a.PolicyNo,
    format(ifnull(c.remitted,0),2) as remitted
    from policy a
    left join
    (
      SELECT  
        SUM(a.Debit) as Debit, 
        SUM(a.Credit) as Credit,
        b.PolicyNo,
        MAX(b.TotalDue) as TotalDue,
        if(SUM(a.Debit) > SUM(a.Credit), MAX(b.TotalDue) - (SUM(a.Debit) + MAX(c.Discount)) , MAX(b.TotalDue) -(SUM(a.Credit) + MAX(c.Discount))  ) as balance
      FROM journal a
      left join policy b on a.ID_No = b.PolicyNo
      left join (
        SELECT 
          MAX(b.Debit) AS Discount , MAX(a.ID_No) as PolicyNo
        FROM
          upward_insurance_umis.journal a
            LEFT JOIN
          upward_insurance_umis.journal_voucher b ON a.ID_No = b.ID_No
        WHERE
             a.GL_Acct = '7.10.15'
            AND a.cGL_Acct = 'Discount'
        GROUP BY a.GL_Acct
          ) c on a.ID_No = c.PolicyNo
      where a.Source_Type = 'OR' and  a.GL_Acct = '1.03.01'
      group by b.PolicyNo 



    ) b on a.PolicyNo = b.PolicyNo
    left join (
    SELECT 
            IF(SUM(a.Debit) > SUM(a.Credit),
              SUM(a.Debit),
              SUM(a.Credit)) AS remitted,
          b.PolicyNo
            FROM
              journal a
                LEFT JOIN
              policy b ON a.ID_No = b.PolicyNo
            WHERE
              a.Explanation LIKE '%remit%'
                AND a.Source_Type = 'GL'
                AND a.GL_Acct = '4.02.01'
                group by PolicyNo
    ) c on a.PolicyNo = c.PolicyNo
  `;
}
export async function claimnsPolicyComputation(id: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
  select  * from (
    ${comnputationQry()}
  ) d
  where d.PolicyNo = '${id}'
  `;
  return await prisma.$queryRawUnsafe(qry);
}
export async function GenerateClaimsID(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT 
    concat(
      DATE_FORMAT(NOW(), '%y%m'),
      '-',
      'C',
      IF(a.year <> date_format(NOW(),'%y'),
      '001', 
        concat(
          LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),
          a.last_count + 1)
        ) 
      ) as id   
  FROM
    id_sequence a
  WHERE
    a.type = 'claims'`);
}
export async function createClaim(
  { claims, claims_details }: any,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  await prisma.claims.create({ data: claims });
  await prisma.claims_details.create({ data: claims_details });
}
export async function createClaimDetails(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  await prisma.claims_details.create({ data });
}
export async function createClaims(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  await prisma.claims.create({ data });
}

export async function updateClaimIDSequence(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
      update id_sequence a
      set a.last_count = '${data.last_count}', a.year= '${data.year}', a.month= '${data.month}'
      where a.type ='claims'
    `);
}
export async function searchClaims(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
  SELECT 
      a.claims_id,
      MAX(b.AssuredName) AS AssuredName,
      MAX(b.PolicyNo) AS PolicyNo,
      MAX(b.ChassisNo) AS ChassisNo,
      MAX(b.PlateNo) AS PlateNo,
      MAX(b.claim_type) AS claim_type,
      MAX(a.dateAccident) AS dateAccident,
      MAX(a.dateReported) AS dateReported,
      MAX(a.dateInspected) AS dateInspected,
      MAX(a.remarks) AS remarks,
      MAX(a.department) AS department
  FROM
      claims a
          LEFT JOIN
      claims_details b ON a.claims_id = b.claims_id
  WHERE
      a.claims_id LIKE '%${search}%'
          OR b.AssuredName LIKE '%${search}%'
          OR b.PolicyNo LIKE '%${search}%'
          OR b.ChassisNo LIKE '%${search}%'
          OR b.MotorNo LIKE '%${search}%'
          OR b.Make LIKE '%${search}%'
          OR b.PlateNo LIKE '%${search}%'
          OR b.IDNo LIKE '%${search}%'
          OR b.BLTFileNo LIKE '%${search}%'
          OR b.BodyType LIKE '%${search}%'
          OR b.CoverNo LIKE '%${search}%'
          OR b.ORNo LIKE '%${search}%'
          OR b.Account LIKE '%${search}%'
          OR b.Model LIKE '%${search}%'
  GROUP BY a.claims_id 
  LIMIT 30
`;

  return await prisma.$queryRawUnsafe(qry);
}
export async function selectedData(claims_id: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT
      a.claims_id,
      a.policy,
      a.claim_type,
      a.insurance,
      a.PolicyNo,
      a.PlateNo,
      a.Model,
      a.BodyType,
      a.Make,
      a.ChassisNo,
      a.MotorNo,
      a.ORNo,
      a.CoverNo,
      a.BLTFileNo,
      a.AssuredName,
      a.IDNo,
      a.Account,
      a.status,
      a.others,
      a.basic,
      a.insuranceFile,
      a.claim_details_id,
      a.claims_no,
      a.DateReceived,
      a.DateClaim,
      ifnull(format(a.AmountClaim ,2),'0.00') as AmountClaim,
      ifnull(format(a.AmountApproved ,2),'0.00') as AmountApproved,
      NameTPPD,
      i.totaDue,
      i.totalpaid,
      i.balance,
      i.remitted,
      ifnull(c.DateFrom ,
      ifnull(d.DateFrom ,
      ifnull(e.DateFrom ,ifnull(f.PeriodFrom,ifnull(g.PeriodFrom,h.PeriodFrom))))) as DateFrom,
      ifnull(c.DateTo ,
      ifnull(d.DateTo ,
      ifnull(e.DateTo ,ifnull(f.PeriodTo,ifnull(g.PeriodTo,h.PeriodTo))))) as DateTo
  FROM claims_details a
  LEFT JOIN  policy b on a.PolicyNo = b.PolicyNo
  LEFT JOIN vpolicy c on a.PolicyNo = c.PolicyNo
  LEFT JOIN fpolicy d on a.PolicyNo = d.PolicyNo
  LEFT JOIN mpolicy e on a.PolicyNo = e.PolicyNo
  LEFT JOIN msprpolicy f on a.PolicyNo = f.PolicyNo
  LEFT JOIN cglpolicy g on a.PolicyNo = g.PolicyNo
  LEFT JOIN papolicy h on a.PolicyNo = h.PolicyNo
  LEFT JOIN (${comnputationQry()}) i on a.PolicyNo = i.PolicyNo
  where a.claims_id = '${claims_id}';
  `);
}
export async function deleteClaims(claims_id: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  await prisma.$transaction([
    prisma.claims.delete({ where: { claims_id } }),
    prisma.claims_details.deleteMany({
      where: {
        claims_id,
      },
    }),
  ]);
}
function reportQry(header: string, where: string) {
  return `
SELECT * FROM (
  SELECT 
  '${header}' as AssuredName,
  '' AS UnitInsured,
  '' AS PolicyNo,
  '' AS ChassisNo,
  '' AS PlateNo,
  '' AS DateReceived,
  '' AS DateClaim,
  '' AS claim_type,
  '' AS AmountClaim,
  '' AS AmountApproved,
  '' AS dateInspected,
  '' AS NameTPPD,
  '' AS status,
  '1' AS header
UNION ALL 
  SELECT 
  b.AssuredName,
  IF(b.Model = '' AND b.Make = ''
          AND b.BodyType = '',
      '---',
      CONCAT(b.Model, ' ', b.Make, ' ', b.BodyType)) AS UnitInsured,
  b.PolicyNo,
  IF(b.ChassisNo = '', '---', b.ChassisNo) AS ChassisNo,
  IF(b.PlateNo = '', '---', b.PlateNo) AS PlateNo,
  IF(b.DateReceived IS NULL,
      '---',
      DATE_FORMAT(b.DateReceived, '%m/%d/%Y')) AS DateReceived,
  IF(b.DateClaim IS NULL,
      '---',
      DATE_FORMAT(b.DateClaim, '%m/%d/%Y')) AS DateClaim,
  b.claim_type,
  b.AmountClaim,
  b.AmountApproved,
  IF(a.dateInspected IS NULL,
      '---',
      DATE_FORMAT(a.dateInspected, '%m/%d/%Y')) AS dateInspected,
  IF(b.NameTPPD = '', '---', b.NameTPPD) AS NameTPPD,
  b.status,
  '0' AS header
FROM
  claims a
      LEFT JOIN
  claims_details b ON a.claims_id = b.claims_id
  ${where}
  order by PolicyNo asc
) a 
  `;
}

function reportQryDesk(header: string, where: string) {
  return `
SELECT * FROM (
  SELECT 
  '${header}' as G,
  b.AssuredName,
  IF(b.Model = '' AND b.Make = ''
          AND b.BodyType = '',
      '---',
      CONCAT(b.Model, ' ', b.Make, ' ', b.BodyType)) AS UnitInsured,
  b.PolicyNo,
  IF(b.ChassisNo = '', '---', b.ChassisNo) AS ChassisNo,
  IF(b.PlateNo = '', '---', b.PlateNo) AS PlateNo,
  IF(b.DateReceived IS NULL,
      '---',
      DATE_FORMAT(b.DateReceived, '%m/%d/%Y')) AS DateReceived,
  IF(b.DateClaim IS NULL,
      '---',
      DATE_FORMAT(b.DateClaim, '%m/%d/%Y')) AS DateClaim,
  b.claim_type,
  b.AmountClaim,
  b.AmountApproved,
  IF(a.dateInspected IS NULL,
      '---',
      DATE_FORMAT(a.dateInspected, '%m/%d/%Y')) AS dateInspected,
  IF(b.NameTPPD = '', '---', b.NameTPPD) AS NameTPPD,
  b.status,
  '0' AS header
FROM
  claims a
      LEFT JOIN
  claims_details b ON a.claims_id = b.claims_id
  ${where}
  order by PolicyNo asc
) a 
  `;
}
export async function claimReport(
  addWhere: string,
  status: number,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  let qry = "";
  if (status === 0) {
    qry = `
    ${reportQry(
      "ONGOING CLAIMS",
      ` where b.status <> 1 AND b.status <> 2 ${addWhere}`
    )}
    union all
    ${reportQry("DENIED CLAIMS", ` where b.status = 1 ${addWhere}`)}
    union all
    ${reportQry("SETTLED CLAIMS", ` where b.status = 2 ${addWhere}`)}
  `;
  } else if (status === 1) {
    qry = `
    ${reportQry(
      "ONGOING CLAIMS",
      ` where b.status <> 1 AND b.status <> 2 ${addWhere}`
    )}
  `;
  } else if (status === 2) {
    qry = `
    ${reportQry("DENIED CLAIMS", ` where b.status = 1 ${addWhere}`)}
  `;
  } else {
    qry = `
    ${reportQry("SETTLED CLAIMS", ` where b.status = 2 ${addWhere}`)}
  `;
  }

  console.log(qry);
  return await prisma.$queryRawUnsafe(qry);
}
export async function claimReportDesk(
  addWhere: string,
  status: number,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  let qry = "";
  if (status === 0) {
    qry = `
    ${reportQryDesk(
      "ONGOING CLAIMS",
      ` where b.status <> 1 AND b.status <> 2 ${addWhere}`
    )}
    union all
    ${reportQryDesk("DENIED CLAIMS", ` where b.status = 1 ${addWhere}`)}
    union all
    ${reportQryDesk("SETTLED CLAIMS", ` where b.status = 2 ${addWhere}`)}
  `;
  } else if (status === 1) {
    qry = `
    ${reportQryDesk(
      "ONGOING CLAIMS",
      ` where b.status <> 1 AND b.status <> 2 ${addWhere}`
    )}
  `;
  } else if (status === 2) {
    qry = `
    ${reportQryDesk("DENIED CLAIMS", ` where b.status = 1 ${addWhere}`)}
  `;
  } else {
    qry = `
    ${reportQryDesk("SETTLED CLAIMS", ` where b.status = 2 ${addWhere}`)}
  `;
  }

  console.log(qry);
  return await prisma.$queryRawUnsafe(qry);
}