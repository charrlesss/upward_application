import { Request } from "express";
import { PrismaList } from "../../connection";
import { Prisma } from "@prisma/client";
const { CustomPrismaClient } = PrismaList();

export async function getTPL_IDS(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  //   SELECT
  //   MIN(Source_No) AS Source_No,
  //   MIN(CAST(Credit AS DECIMAL (18 , 2 ))) as Cost ,
  //   Source_No_Ref_ID
  // FROM
  //   journal
  // WHERE
  //       Explanation = 'CTPL Registration'
  //       AND Credit > 0
  //       AND Remarks IS NULL
  //       AND Source_No like '%${search}%'
  // GROUP BY Source_No_Ref_ID
  // ORDER BY Source_No ASC
  return await prisma.$queryRawUnsafe(`
    SELECT 
        *
    FROM
        (SELECT 
            CONCAT(REGEXP_REPLACE(MIN(a.Source_No), '[0-9]', ''), MIN(b.SourceNo)) AS Source_No,
                MIN(b.Cost) AS Cost,
                a.Source_No_Ref_ID
        FROM
            journal a
        INNER JOIN (SELECT 
            (CAST(Credit AS DECIMAL (18 , 2 ))) AS Cost,
                Source_No_Ref_ID,
                CAST(REGEXP_REPLACE(Source_No, '[^0-9]', '') AS UNSIGNED) AS SourceNo,
                Source_No
        FROM
            journal a
        WHERE
            Explanation = 'CTPL Registration'
                AND Credit > 0
                AND Remarks IS NULL
        ORDER BY SourceNo) b ON a.Source_No = b.Source_No
        GROUP BY a.Source_No_Ref_ID
        ORDER BY MIN(b.SourceNo)) a
    WHERE
        a.Source_No LIKE '%${search}%'

  `);
}

export async function getRateFromTPLUpdate(Source_No: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT 
      MIN(Source_No) AS Source_No,
      MIN(CAST(Credit AS DECIMAL (18 , 2 ))) as Cost ,
      Source_No_Ref_ID
  FROM
      journal
  WHERE
          Explanation = 'CTPL Registration'
          AND Credit > 0
          AND Remarks IS NULL 
          AND Source_No = '${Source_No}'
  GROUP BY Source_No_Ref_ID
  ORDER BY Source_No ASC
  `);
}

export async function createJournal(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.journal.create({ data });
}

export async function deleteJournal(Source_No_Ref_ID: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.journal.deleteMany({
    where: {
      Source_No_Ref_ID,
    },
  });
}

export async function findManyJournal(Source_No_Ref_ID: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.journal.findMany({
    where: {
      Source_No_Ref_ID,
    },
  });
}

export async function updateJournal(
  Source_No: string,
  Cost: string,
  AutoNo: bigint,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.journal.update({
    data: {
      Credit: Cost,
      Source_No,
    },
    where: {
      AutoNo,
    },
  });
}

export async function findPolicy(PolicyNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.policy.findUnique({ where: { PolicyNo } });
}
export async function getPolicy(
  account: string,
  form_type: string,
  policy_no: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const query = `
  SELECT * FROM policy 
  WHERE 
  Account = '${account}'
  AND PolicyType = '${form_type}' 
  AND PolicyNo = '${policy_no}'
  `;
  return await prisma.$queryRawUnsafe(query);
}
export async function getRate(
  account: string,
  line: string,
  type: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const query = `
  select Rate from Rates 
  where 
  trim(Account) = '${account.trim()}' 
  and trim(Line) = '${line}' 
  and trim(Type) = '${type}'
  `;
  return await prisma.$queryRawUnsafe(query);
}

export async function getClientById(entry_client_id: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const query = `
  SELECT 
    b.*
  FROM 
  entry_client a
    LEFT JOIN
  sub_account b ON a.sub_account = b.Sub_Acct
  where a.entry_client_id ='${entry_client_id}'
  `;
  console.log(query);

  return await prisma.$queryRawUnsafe(query);
}

export async function deletePolicyByVehicle(
  form_type: string,
  policyNo: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const query = `
  delete from policy 
  where 
  PolicyType = '${form_type}' 
  and PolicyNo = '${policyNo}'
  `;
  console.log(query);
  return await prisma.$queryRawUnsafe(query);
}

export async function deletePolicy(
  subAccount: string,
  form_type: string,
  policyNo: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const query = `
  delete from policy 
  where 
  Account = '${subAccount}' 
  and PolicyType = '${form_type}' 
  and PolicyNo = '${policyNo}'
  `;
  console.log(query);
  return await prisma.$queryRawUnsafe(query);
}

export async function deleteVehiclePolicy(
  form_type: string,
  policyNo: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const query = `
  delete from vpolicy 
  where 
   PolicyNo = '${policyNo}'
  `;
  return await prisma.$queryRawUnsafe(query);
}

export async function deleteJournalBySource(
  source_no: string,
  source_type: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const query = `
  delete from journal 
  where 
  Source_No = '${source_no}' 
  and Source_Type = '${source_type}'
  `;
  return await prisma.$queryRawUnsafe(query);
}

export async function deleteTPLFromJournalBySource(
  source_no: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const query = `
  delete from journal 
  where 
  Source_No = '${source_no}' 
  and Source_Type = 'GL'
  and Explanation <> 'CTPL Registration'
  `;
  return await prisma.$queryRawUnsafe(query);
}

export async function createPolicy(
  data: {
    IDNo: string;
    Account: string;
    SubAcct: string;
    PolicyType: string;
    PolicyNo: string;
    DateIssued: Date;
    TotalPremium: number;
    Vat: string;
    DocStamp: string;
    FireTax: string;
    LGovTax: string;
    Notarial: string;
    Misc: string;
    TotalDue: string;
    TotalPaid: string;
    Journal: boolean;
    AgentID: string;
    AgentCom: string;
  },
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.policy.create({
    data,
  });
}

export async function createVehiclePolicy(
  data: {
    PolicyNo: string;
    Account: string;
    PolicyType: string;
    CoverNo: string;
    ORNo: string;
    DateFrom: string;
    DateTo: string;
    Model: string;
    Make: string;
    BodyType: string;
    Color: string;
    BLTFileNo: string;
    PlateNo: string;
    ChassisNo: string;
    MotorNo: string;
    AuthorizedCap: string;
    UnladenWeight: string;
    TPL: string;
    TPLLimit: string;
    PremiumPaid: string;
    EstimatedValue: string;
    Aircon: string;
    Stereo: string;
    Magwheels: string;
    Others: string;
    OthersAmount: string;
    Deductible: string;
    Towing: string;
    RepairLimit: string;
    BodilyInjury: string;
    PropertyDamage: string;
    PersonalAccident: string;
    SecI: string;
    SecIIPercent: string;
    ODamage: string;
    Theft: string;
    Sec4A: string;
    Sec4B: string;
    Sec4C: string;
    AOG: string;
    MortgageeForm: boolean;
    Mortgagee: string;
    Denomination: string;
    AOGPercent: string;
    LocalGovTaxPercent: string;
    TPLTypeSection_I_II: string;
    Remarks: string;
  },
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.vpolicy.create({
    data,
  });
}

export async function createJournalInVP(
  data: {
    Branch_Code: string;
    Date_Entry: string;
    Source_Type: string;
    Source_No: string;
    Explanation: string;
    GL_Acct: string;
    Sub_Acct: string;
    ID_No: string;
    cGL_Acct: string;
    cSub_Acct: string;
    cID_No: string;
    Debit: number;
    Credit: number;
    TC: string;
    Remarks: string;
    Source_No_Ref_ID: string;
  },
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.journal.create({
    data,
  });
}

export async function updateJournalByPolicy(
  Source_No: string,
  Explanation: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.journal.updateMany({
    where: {
      Source_No,
      AND: {
        Explanation,
      },
    },
    data: {
      Remarks: "Used",
    },
  });
}

export async function getTempPolicyID(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.$queryRawUnsafe(`
  select
  concat(
  'TP-',
  right('000000',6 - LENGTH(CAST(CAST(substring(IF(
      a.PolicyNo = '' OR a.PolicyNo IS NULL,'1',a.PolicyNo), 4) as SIGNED) + 1 As SIGNED))),
  IF(
     a.PolicyNo = '' OR a.PolicyNo IS NULL,
      '1',
    CAST(substring(a.PolicyNo,4) as SIGNED) +1
    )
  ) AS tempPolicy_No
   from (
    SELECT  MAX(PolicyNo) as PolicyNo FROM vpolicy a where left(a.PolicyNo ,2) = 'TP' and a.PolicyType = 'COM' ORDER BY a.PolicyNo ASC
  ) a`);
}

export async function searchDataVPolicy(
  search: string,
  policyType: string,
  isTemp: boolean,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const qry = `
      SELECT 
        a.*,
        b.*,
        if(c.option = 'individual', concat(c.firstname,if(c.middlename = '' OR c.middlename is null,'',concat(',',c.middlename)), if(c.lastname = '' OR c.lastname is null,'',concat(',',c.lastname)) ),c.company) as client_fullname,
        c.address as address,
        concat(c.firstname,if(c.middlename = '' OR c.middlename is null,'',concat(',',c.middlename)), if(c.lastname = '' OR c.lastname is null,'',concat(',',c.lastname)) ) as agent_fullname,
        c.sale_officer,
        date_format(a.DateIssued,'%m/%d/%Y') as _DateIssued
      FROM
        policy a
            LEFT JOIN
          vpolicy b ON a.PolicyNo = b.PolicyNo
          left join entry_client c on a.IDNo = c.entry_client_id 
          left join entry_agent d on a.AgentID = d.entry_agent_id 
              WHERE 

            b.PolicyNo is not null and
            a.PolicyNo is not null and
            a.PolicyType = '${policyType}' and
        ${
          isTemp
            ? "left(a.PolicyNo,3) = 'TP-'and"
            : "left(a.PolicyNo,3) != 'TP-' and"
        }
        (
            a.PolicyNo like '%${search}%' or
            c.firstname like '%${search}%' or 
            c.lastname like '%${search}%' or
            b.ChassisNo like '%${search}%'
        )
      ORDER BY a.PolicyNo desc
      LIMIT 100 
  `;
  console.log(qry);
  return await prisma.$queryRawUnsafe(qry);
}

export async function getCostByTPL(Source_No: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
       SELECT 
				  (Source_No) AS Source_No,
				  (CAST(Credit AS DECIMAL (18 , 2 ))) as Cost ,
				  Source_No_Ref_ID
			  FROM
				  journal
			  WHERE
					  Explanation = 'CTPL Registration'
					  AND Credit > 0
            AND Source_No = '${Source_No}'
      `);
}
