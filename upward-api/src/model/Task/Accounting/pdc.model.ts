import { Request } from "express";
import { PrismaList } from "../../connection";
import { prisma } from "../../../controller/index";

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
export const withPolicy = `
SELECT 
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
                OR c.PolicyType = 'TPL', CONCAT('C: ', d.ChassisNo, '  ', 'E: ', d.MotorNo), '') AS remarks,
            IFNULL(d.ChassisNo, '') AS chassis,
             a.address
    FROM
        (SELECT 
        *
    FROM
        (SELECT 
        'Client' AS IDType,
            a.entry_client_id AS IDNo,
            sub_account,
            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ',if(a.suffix is not null and a.suffix <> '' , concat(a.suffix,'.'),'')), CONCAT(a.lastname, ', ', a.firstname, ' ', if(a.suffix is not null and a.suffix <> '' , concat(a.suffix,'.'),'')))) AS Shortname,
            a.entry_client_id AS client_id,
            a.address
    FROM
        entry_client a UNION ALL SELECT 
        'Supplier' AS IDType,
            a.entry_supplier_id AS IDNo,
            sub_account,
            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS Shortname,
            a.entry_supplier_id AS client_id,
            a.address
    FROM
        entry_supplier a UNION ALL SELECT 
        'Employee' AS IDType,
            a.entry_employee_id AS IDNo,
            sub_account,
            IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS Shortname,
            a.entry_employee_id AS client_id,
            a.address
    FROM
        entry_employee a UNION ALL SELECT 
        'Fixed Assets' AS IDType,
            a.entry_fixed_assets_id AS IDNo,
            sub_account,
            a.fullname AS Shortname,
            a.entry_fixed_assets_id AS client_id,
            a.description AS address
    FROM
        entry_fixed_assets a UNION ALL SELECT 
        'Others' AS IDType,
            a.entry_others_id AS IDNo,
            sub_account,
            a.description AS cID_No,
            a.entry_others_id AS client_id,
            a.remarks AS address
    FROM
        entry_others a UNION ALL SELECT 
        'Agent' AS IDType,
            a.entry_agent_id AS IDNo,
            sub_account,
            IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS Shortname,
            a.entry_agent_id AS client_id,
            a.address
    FROM
        entry_agent a) id_entry UNION ALL SELECT 
        'Policy' AS IDType,
            a.PolicyNo AS IDNo,
            b.sub_account,
            b.Shortname,
            a.IDNo AS client_id,
            b.address
    FROM
        policy a
    LEFT JOIN (SELECT 
        *
    FROM
        (SELECT 
        'Client' AS IDType,
            a.entry_client_id AS IDNo,
            sub_account,
            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', if(a.suffix is not null and a.suffix <> '' , concat(a.suffix,'.'),'')), CONCAT(a.lastname, ', ', a.firstname, ' ', if(a.suffix is not null and a.suffix <> '' , concat(a.suffix,'.'),'')))) AS Shortname,
            a.entry_client_id AS client_id,
            a.address
    FROM
        entry_client a UNION ALL SELECT 
        'Supplier' AS IDType,
            a.entry_supplier_id AS IDNo,
            sub_account,
            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS Shortname,
            a.entry_supplier_id AS client_id,
            a.address
    FROM
        entry_supplier a UNION ALL SELECT 
        'Employee' AS IDType,
            a.entry_employee_id AS IDNo,
            sub_account,
            IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS Shortname,
            a.entry_employee_id AS client_id,
            a.address
    FROM
        entry_employee a UNION ALL SELECT 
        'Fixed Assets' AS IDType,
            a.entry_fixed_assets_id AS IDNo,
            sub_account,
            a.fullname AS Shortname,
            a.entry_fixed_assets_id AS client_id,
            a.description AS address
    FROM
        entry_fixed_assets a UNION ALL SELECT 
        'Others' AS IDType,
            a.entry_others_id AS IDNo,
            sub_account,
            a.description AS cID_No,
            a.entry_others_id AS client_id,
            a.remarks AS address
    FROM
        entry_others a UNION ALL SELECT 
        'Agent' AS IDType,
            a.entry_agent_id AS IDNo,
            sub_account,
            IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS Shortname,
            a.entry_agent_id AS client_id,
            a.address
    FROM
        entry_agent a) id_entry) b ON a.IDNo = b.IDNo) a
    LEFT JOIN sub_account b ON a.sub_account = b.Sub_Acct
    LEFT JOIN policy c ON a.IDNo = c.PolicyNo
    LEFT JOIN vpolicy d ON c.PolicyNo = d.PolicyNo
`;
export async function checkClientID(id: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    ` SELECT * FROM (${withPolicy}) a where a.IDNo = '${id}'`
  );
}

export async function getPdcPolicyIdAndCLientId(search: string, req: Request) {
  const qry = `
 SELECT 
    *
FROM
    (${withPolicy}) a
WHERE
    a.Name IS NOT NULL AND a.IDNo LIKE '%${search}%'
        OR a.chassis LIKE '%${search}%'
        OR a.Name LIKE '%${search}%'
ORDER BY CASE
    WHEN name REGEXP '^[A-Za-z]' THEN 1
    WHEN name LIKE 'APARES%' THEN 0
    ELSE 2
END , name ASC
limit 50      

  `;

  console.log(qry);

  return await prisma.$queryRawUnsafe(qry);
}

export async function getCashPayTo(search: string) {
  const _withPolicy = `
SELECT 
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
                OR c.PolicyType = 'TPL', CONCAT('C: ', d.ChassisNo, '  ', 'E: ', d.MotorNo), '') AS remarks,
            IFNULL(d.ChassisNo, '') AS chassis,
             a.address
    FROM
        (SELECT 
        *
    FROM
        (
        
     SELECT 
        'Client' AS IDType,
            a.entry_client_id AS IDNo,
            sub_account,
            IF(a.option = 'company', a.company, concat(a.firstname ,if(a.lastname is not null and a.lastname <> '' , concat(', ',a.lastname ,' '),' ') ,if(a.suffix is not null and a.suffix <> '' , concat(a.suffix,'.'),''))) AS Shortname,
            a.entry_client_id AS client_id,
            a.address
    FROM
        entry_client a UNION ALL SELECT 
        'Supplier' AS IDType,
            a.entry_supplier_id AS IDNo,
            sub_account,
           IF(a.option = 'company', a.company, concat(a.firstname ,if(a.lastname is not null and a.lastname <> '' , concat(', ',a.lastname,' '),'') )) AS Shortname,

            a.entry_supplier_id AS client_id,
            a.address
    FROM
        entry_supplier a UNION ALL SELECT 
        'Employee' AS IDType,
            a.entry_employee_id AS IDNo,
            sub_account,
            IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', a.firstname, CONCAT(a.firstname, ' ',a.lastname)) AS Shortname,
            a.entry_employee_id AS client_id,
            a.address
    FROM
        entry_employee a UNION ALL SELECT 
        'Fixed Assets' AS IDType,
            a.entry_fixed_assets_id AS IDNo,
            sub_account,
            a.fullname AS Shortname,
            a.entry_fixed_assets_id AS client_id,
            a.description AS address
    FROM
        entry_fixed_assets a UNION ALL SELECT 
        'Others' AS IDType,
            a.entry_others_id AS IDNo,
            sub_account,
            a.description AS cID_No,
            a.entry_others_id AS client_id,
            a.remarks AS address
    FROM
        entry_others a UNION ALL SELECT 
        'Agent' AS IDType,
            a.entry_agent_id AS IDNo,
            sub_account,
            IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', CONCAT(a.firstname), CONCAT(a.firstname, ' ', a.lastname)) AS Shortname,
            a.entry_agent_id AS client_id,
            a.address
    FROM
        entry_agent a
        
        ) id_entry 
        UNION ALL 
        
SELECT 
        'Policy' AS IDType,
            a.PolicyNo AS IDNo,
            b.sub_account,
            b.Shortname,
            a.IDNo AS client_id,
            b.address
    FROM
        policy a
    LEFT JOIN (SELECT 
        *
    FROM
        (
        SELECT 
        'Client' AS IDType,
            a.entry_client_id AS IDNo,
            sub_account,
            IF(a.option = 'company', a.company, concat(a.firstname ,if(a.lastname is not null and a.lastname <> '' , concat(', ',a.lastname,' '),' ') ,if(a.suffix is not null and a.suffix <> '' , concat(a.suffix,'.'),''))) AS Shortname,
            a.entry_client_id AS client_id,
            a.address
    FROM
        entry_client a UNION ALL SELECT 
        'Supplier' AS IDType,
            a.entry_supplier_id AS IDNo,
            sub_account,
           IF(a.option = 'company', a.company, concat(a.firstname ,if(a.lastname is not null and a.lastname <> '' , concat(', ',a.lastname,' '),'') )) AS Shortname,

            a.entry_supplier_id AS client_id,
            a.address
    FROM
        entry_supplier a UNION ALL SELECT 
        'Employee' AS IDType,
            a.entry_employee_id AS IDNo,
            sub_account,
            IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', a.firstname, CONCAT(a.firstname, ' ',a.lastname)) AS Shortname,
            a.entry_employee_id AS client_id,
            a.address
    FROM
        entry_employee a UNION ALL SELECT 
        'Fixed Assets' AS IDType,
            a.entry_fixed_assets_id AS IDNo,
            sub_account,
            a.fullname AS Shortname,
            a.entry_fixed_assets_id AS client_id,
            a.description AS address
    FROM
        entry_fixed_assets a UNION ALL SELECT 
        'Others' AS IDType,
            a.entry_others_id AS IDNo,
            sub_account,
            a.description AS cID_No,
            a.entry_others_id AS client_id,
            a.remarks AS address
    FROM
        entry_others a UNION ALL SELECT 
        'Agent' AS IDType,
            a.entry_agent_id AS IDNo,
            sub_account,
            IF(a.lastname IS NOT NULL
                AND TRIM(a.lastname) = '', CONCAT(a.firstname), CONCAT(a.firstname, ' ', a.lastname)) AS Shortname,
            a.entry_agent_id AS client_id,
            a.address
    FROM
        entry_agent a
        ) id_entry) b ON a.IDNo = b.IDNo) a
    LEFT JOIN sub_account b ON a.sub_account = b.Sub_Acct
    LEFT JOIN policy c ON a.IDNo = c.PolicyNo
    LEFT JOIN vpolicy d ON c.PolicyNo = d.PolicyNo
  `;
  const qry = `
 SELECT 
    *
FROM
    (${_withPolicy}) a
WHERE
    a.Name IS NOT NULL AND a.IDNo LIKE '%${search}%'
        OR a.chassis LIKE '%${search}%'
        OR a.Name LIKE '%${search}%'
ORDER BY  a.Name
limit 50      

  `;

  return await prisma.$queryRawUnsafe(qry);
}
export async function getPdcBanks(search: string, req: Request) {
  const query = `
    SELECT a.Bank_Code, a.Bank FROM   bank a where  a.Bank_Code like '%${search}%' OR a.Bank like '%${search}%' limit 50; 
    `;
  return await prisma.$queryRawUnsafe(query);
}
export async function findPdc(Ref_No: string, req: Request) {
  return await prisma.pdc.findMany({ where: { Ref_No } });
}
export async function pdcUploads(data: any, req: Request) {
  return await prisma.pdc_uploads.create({ data });
}
export async function pdcUploadsUpdate(data: any, req: Request) {
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
  // return await prisma.pdc.deleteMany({ where: { Ref_No } });
  return await prisma.$queryRawUnsafe(
    `DELETE FROM PDC  where Ref_No ='${Ref_No}' `
  );
}
export async function createPDC(data: any, req: Request) {
  return await prisma.pdc.create({ data });
}
export async function searchPDC(search: any, req: Request) {
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
    ORDER BY a.Ref_No DESC
    LIMIT 50
  `);
}
export async function getSearchPDCheck(ref_no: any, req: Request) {
  const qry = `
    SELECT 
      a.Ref_No,
      a.Name,
      DATE_FORMAT(a.Date, '%Y-%m-%d') as  Date,
      a.Remarks,
      a.PNo,
      a.IDNo,
      a.Check_No,
      DATE_FORMAT(a.Check_Date, '%Y-%m-%d') AS Check_Date,
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
        order by  a.Check_Date
  `;
  console.log(qry);
  return await prisma.$queryRawUnsafe(qry);
}
export async function pdcIDGenerator(req: Request) {
  return await prisma.$queryRawUnsafe(`
  SELECT 
        concat(
        if(
        a.year <> DATE_FORMAT(NOW(), '%y'),
        DATE_FORMAT(NOW(), '%y'),
        a.year),
        '.', 
        if(a.year <> DATE_FORMAT(NOW(), '%y'),'0001',concat(LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),a.last_count + 1))
       )
         as pdcID   

  FROM
      id_sequence a
  WHERE
    type = 'pdc';
`);
}
export async function updatePDCIDSequence(data: any, req: Request) {
  return await prisma.$queryRawUnsafe(`
      update  id_sequence a
      set a.last_count = '${data.last_count}', a.year= '${data.year}', a.month= '${data.month}'
      where a.type ='pdc'
    `);
}
