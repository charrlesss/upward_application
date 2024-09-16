import { Request } from "express";
import { PrismaList } from "../../connection";
const { CustomPrismaClient } = PrismaList();

export const selectClient = `
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
`;

export async function getPdcPolicyIdAndCLientId(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
    select * from (
    SELECT 
      a.IDType as Type,
      a.IDNo,
      a.sub_account,
      a.Shortname as Name,
      a.client_id,
      a.ShortName as sub_shortname,
      b.ShortName,
      b.Acronym,
      if(a.IDType = 'Policy' and c.PolicyType = "COM" OR c.PolicyType = "TPL",concat('C: ',c.ChassisNo,'  ','E: ',c.MotorNo),'') as remarks,
      ifnull(c.ChassisNo,'') as chassis
    FROM
        (
         ${selectClient}
        union all
        select 
          'Policy' AS IDType,
          a.PolicyNo AS IDNo,
          b.sub_account,
          IF(b.option = 'individual', CONCAT(IF(b.lastname is not null AND b.lastname <> '', CONCAT(b.lastname, ', '), ''), b.firstname), b.company) AS Shortname,
          a.IDNo AS client_id,
          b.address
        FROM
            policy a
        LEFT JOIN entry_client b ON a.IDNo = b.entry_client_id
      ) a
      left join sub_account b on a.sub_account = b.Sub_Acct
      left join vpolicy c on a.IDNo = c.PolicyNo
    ) a

    WHERE
     a.Name is not null and
      a.IDNo LIKE '%${search}%'
      OR a.Name LIKE '%${search}%'
    ORDER BY a.Name
    LIMIT 50`;

  console.log(qry);

  return await prisma.$queryRawUnsafe(qry);
}
export async function getPdcBanks(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    SELECT a.Bank_Code, a.Bank FROM   bank a where  a.Bank_Code like '%${search}%' OR a.Bank like '%${search}%' limit 100; 
    `;
  return await prisma.$queryRawUnsafe(query);
}
export async function findPdc(Ref_No: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.pdc.findMany({ where: { Ref_No } });
}
export async function pdcUploads(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.pdc_uploads.create({ data });
}
export async function pdcUploadsUpdate(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.pdc_uploads.updateMany({
    data: {
      upload: data.upload,
    },
    where: {
      ref_no: data.ref_no,
    },
  });
}
export async function getPdcUpload(ref_no: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT 
    a.upload
  FROM
      pdc_uploads a 
  WHERE
  a.Ref_No = '${ref_no}'
  `);
}
export async function deletePdcByRefNo(Ref_No: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.pdc.deleteMany({ where: { Ref_No } });
}
export async function createPDC(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.pdc.create({ data });
}
export async function searchPDC(search: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    SELECT 
        a.Ref_No,
        DATE_FORMAT(a.Date, '%m/%d/%Y') AS Date,
        a.Name
    FROM
          pdc a
    WHERE
        LEFT(a.Name, 7) <> '--Void'
            AND (a.Ref_No LIKE '%${search}%' OR a.Name LIKE '%${search}%')
    GROUP BY a.Ref_No , a.Date , a.Name
    ORDER BY a.Date DESC , a.Name
    LIMIT 100
  `);
}
export async function getSearchPDCheck(ref_no: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const qry = `
    SELECT 
      a.Ref_No,
      a.Name,
      a.Date,
      a.Remarks,
      a.PNo,
      a.IDNo,
      a.Check_No,
      DATE_FORMAT(a.Check_Date, '%m/%d/%Y') AS Check_Date,
      a.Check_Amnt,
      d.Bank AS BankName,
      d.Bank_Code as BankCode,
      a.Branch,
      a.Check_Remarks,
      a.SlipCode AS Deposit_Slip,
      DATE_FORMAT(a.DateDepo, '%m/%d/%Y') AS DateDeposit,
      a.ORNum AS OR_No,
      LPAD(ROW_NUMBER() OVER (), 3, '0') AS SEQ,
      c.Acronym,
      b.sub_account
    FROM
        pdc a
            LEFT JOIN
        (${selectClient}
          UNION ALL SELECT 
            'Policy' AS IDType,
            a.PolicyNo AS IDNo,
            b.sub_account,
            IF(b.option = 'individual', CONCAT(IF(b.lastname, CONCAT(b.lastname is not null, ', '), ''), b.firstname), b.company) AS Shortname,
            a.IDNo AS client_id,
            b.address
        FROM
            policy a
        LEFT JOIN entry_client b ON a.IDNo = b.entry_client_id) b ON a.PNo = b.IDNo
        left join sub_account c on b.sub_account = c.Sub_Acct
        LEFT JOIN bank d ON a.Bank = d.Bank_Code
        WHERE
        a.Ref_No = '${ref_no}'
  `;
  console.log(qry);
  return await prisma.$queryRawUnsafe(qry);
}
export async function pdcIDGenerator(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT 
    concat(DATE_FORMAT(NOW(), '%y'),'.',if(concat(a.year,a.month) <> DATE_FORMAT(NOW(), '%y%m'),'0001',concat(LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),a.last_count + 1))) as pdcID   
  FROM
      id_sequence a
  WHERE
    type = 'pdc';
;`);
}
export async function updatePDCIDSequence(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
      update  id_sequence a
      set a.last_count = '${data.last_count}', a.year= '${data.year}', a.month= '${data.month}'
      where a.type ='pdc'
    `);
}
