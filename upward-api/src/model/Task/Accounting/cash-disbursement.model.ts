import { format } from "date-fns";
import { PrismaList } from "../../connection";
import { Request } from "express";
import { prisma } from "../../../controller/index";

// const { CustomPrismaClient } = PrismaList();

export const selectClientWithoutMiddleName = `
SELECT 
  "Client" as IDType,
  aa.entry_client_id AS IDNo,
  aa.sub_account,
  if(aa.option = "individual", CONCAT(aa.firstname,' ',aa.lastname), aa.company) as Shortname,
  aa.entry_client_id as client_id,
  aa.address 
FROM
  entry_client aa
  union all
  SELECT 
  "Agent" as IDType,
  aa.entry_agent_id AS IDNo,
  aa.sub_account,
  CONCAT(aa.firstname,' ',aa.lastname) AS Shortname,
  aa.entry_agent_id as client_id,
  aa.address
FROM
  entry_agent aa
  union all
  SELECT 
  "Employee" as IDType,
  aa.entry_employee_id AS IDNo,
  aa.sub_account,
  CONCAT(aa.firstname,' ',aa.lastname) AS Shortname,
  aa.entry_employee_id as client_id,
  aa.address  
FROM
  entry_employee aa
union all
SELECT 
  "Supplier" as IDType,
  aa.entry_supplier_id AS IDNo,
  aa.sub_account,
  if(aa.option = "individual", CONCAT(aa.firstname,' ',aa.lastname), aa.company) as Shortname,
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

export const selectClient = `
SELECT 
  "Client" as IDType,
  aa.entry_client_id AS IDNo,
  aa.sub_account,
  if(aa.option = "individual", CONCAT(aa.firstname ,ifnull(aa.middlename,''),' ',aa.lastname), aa.company) as Shortname,
  aa.entry_client_id as client_id,
  aa.address 
FROM
  entry_client aa
  union all
  SELECT 
  "Agent" as IDType,
  aa.entry_agent_id AS IDNo,
  aa.sub_account,
  CONCAT(aa.firstname ,ifnull(aa.middlename,''),' ',aa.lastname) AS Shortname,
  aa.entry_agent_id as client_id,
  aa.address
FROM
  entry_agent aa
  union all
  SELECT 
  "Employee" as IDType,
  aa.entry_employee_id AS IDNo,
  aa.sub_account,
  CONCAT(aa.firstname ,ifnull(aa.middlename,''),' ',aa.lastname) AS Shortname,
  aa.entry_employee_id as client_id,
  aa.address  
FROM
  entry_employee aa
union all
SELECT 
  "Supplier" as IDType,
  aa.entry_supplier_id AS IDNo,
  aa.sub_account,
  if(aa.option = "individual", CONCAT(aa.firstname ,ifnull(aa.middlename,''),' ',aa.lastname), aa.company) as Shortname,
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

const withPolicy = `
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
            IFNULL(d.ChassisNo, '') AS chassis
    FROM
        (SELECT * FROM (${selectClient}) id_entry 
		UNION ALL SELECT 
        'Policy' AS IDType,
            a.PolicyNo AS IDNo,
            b.sub_account,
            b.Shortname,
            a.IDNo AS client_id,
            b.address
    FROM
        policy a
    LEFT JOIN (
    SELECT 
        *
    FROM
        (${selectClient}) id_entry) b ON a.IDNo = b.IDNo) a
    LEFT JOIN sub_account b ON a.sub_account = b.Sub_Acct
    LEFT JOIN policy c ON a.IDNo = c.PolicyNo
    LEFT JOIN vpolicy d ON c.PolicyNo = d.PolicyNo

`;

const withPolicyWithoutMiddleName = `
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
            IFNULL(d.ChassisNo, '') AS chassis
    FROM
        (SELECT * FROM (${selectClientWithoutMiddleName}) id_entry 
		UNION ALL SELECT 
        'Policy' AS IDType,
            a.PolicyNo AS IDNo,
            b.sub_account,
            b.Shortname,
            a.IDNo AS client_id,
            b.address
    FROM
        policy a
    LEFT JOIN (
    SELECT 
        *
    FROM
        (${selectClientWithoutMiddleName}) id_entry) b ON a.IDNo = b.IDNo) a
    LEFT JOIN sub_account b ON a.sub_account = b.Sub_Acct
    LEFT JOIN policy c ON a.IDNo = c.PolicyNo
    LEFT JOIN vpolicy d ON c.PolicyNo = d.PolicyNo

`;

export async function getClientFromPayTo(search: string, req: Request) {
  const qry = `
 SELECT 
    *
FROM
    (${withPolicyWithoutMiddleName}) a
WHERE
    a.Name IS NOT NULL AND a.IDNo LIKE '%${search}%'
        OR a.chassis LIKE '%${search}%'
        OR a.Name LIKE '%${search}%'
ORDER BY CASE
    WHEN name REGEXP '^[A-Za-z]' THEN 1
    WHEN name LIKE 'APARES%' THEN 0
    ELSE 2
END , name ASC
limit 500      

  `;

  console.log(qry);

  return await prisma.$queryRawUnsafe(qry);
}

export async function GenerateCashDisbursementID(req: Request) {
  return await prisma.$queryRawUnsafe(`
       SELECT 
      
        concat(
        DATE_FORMAT(NOW(), '%y'),
        if(a.month <> DATE_FORMAT(NOW(), '%m') ,DATE_FORMAT(NOW(), '%m'),a.month),
        '-', 
        concat(LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),a.last_count + 1)
       )
        
         as id   
      FROM
          id_sequence a
      WHERE
        a.type = 'cash-disbursement'`);
}

export async function AddNewCashDisbursement(data: any, req: Request) {
  return await prisma.cash_disbursement.create({ data });
}
export async function AddNewJournalFromCashDisbursement(
  data: any,
  req: Request
) {
  return await prisma.journal.create({ data });
}

export async function DeleteNewCashDisbursement(
  Source_No: string,
  req: Request
) {
  return await prisma.cash_disbursement.deleteMany({
    where: {
      Source_No,
      AND: {
        Source_Type: "CV",
      },
    },
  });
}

export async function DeleteNewJournalFromCashDisbursement(
  Source_No: string,
  req: Request
) {
  return await prisma.journal.deleteMany({
    where: {
      Source_No,
      AND: {
        Source_Type: "CV",
      },
    },
  });
}

export async function updateCashDisbursementID(
  last_count: string,
  req: Request
) {
  return await prisma.$queryRawUnsafe(`
      UPDATE  id_sequence a 
        SET 
            a.last_count = '${last_count}',
            a.year = DATE_FORMAT(NOW(), '%y'),
            month = DATE_FORMAT(NOW(), '%m')
        WHERE
            a.type = 'cash-disbursement'
      `);
}

export async function findCashDisbursement(Source_No: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    `SELECT * FROM  cash_disbursement where Source_No = ? and Source_Type = 'CV'`,
    Source_No
  );
}
export async function findSearchSelectedCashDisbursement(
  Source_No: string,
  req: Request
) {
  return await prisma.$queryRawUnsafe(
    `
    SELECT 
        Branch_Code,
        Date_Entry as dateEntry,
        Source_No as refNo,
        Explanation as explanation,
        Particulars as particulars,
        Payto as Payto,
        Address as address,
        GL_Acct as code,
        cGL_Acct as acctName,
        cSub_Acct as subAcctName,
        cID_No as ClientName,
        Debit as debit,
        Credit as credit,
        Check_No as checkNo ,
        Check_Date as checkDate ,
        Remarks as remarks,
        Sub_Acct as subAcct,
        ID_No as IDNo,
        TC as TC_Code,
        VAT_Type as vatType,
        OR_Invoice_No as invoice,
        VATItemNo,
         CAST(ROW_NUMBER() OVER () AS CHAR) as TempID
    FROM 
      cash_disbursement 
      where 
      Source_No = ? and Source_Type = 'CV' and GL_Acct <> '1.01.10'
      union all 
      SELECT 
        Branch_Code,
        Date_Entry as dateEntry,
        Source_No as refNo,
        Explanation as explanation,
        Particulars as particulars,
        Payto as Payto,
        Address as address,
        GL_Acct as code,
        cGL_Acct as acctName,
        cSub_Acct as subAcctName,
        cID_No as ClientName,
        Debit as debit,
        Credit as credit,
        Check_No as checkNo ,
        Check_Date as checkDate ,
        Remarks as remarks,
        Sub_Acct as subAcct,
        ID_No as IDNo,
        TC as TC_Code,
        VAT_Type as vatType,
        OR_Invoice_No as invoice,
        VATItemNo,
         CAST(ROW_NUMBER() OVER () AS CHAR) as TempID
    FROM 
      cash_disbursement 
      where 
      Source_No = ? and Source_Type = 'CV' and GL_Acct = '1.01.10'
      `,
    Source_No,
    Source_No
  );
}
export async function searchCashDisbursement(search: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    `
    SELECT 
        DATE_FORMAT(a.Date_Entry, '%m/%d/%Y') AS Date_Entry,
        a.Source_No,
        a.Explanation
    FROM
        (SELECT 
            Date_Entry, Source_No, Explanation
        FROM
            cash_disbursement
        GROUP BY Date_Entry , Source_No , Explanation
        ORDER BY Date_Entry DESC) a
    WHERE
        LEFT(a.Explanation, 7) <> '-- Void'
            AND (a.Source_No LIKE ?
            OR a.Explanation LIKE ?)
            ORDER BY a.Date_Entry  desc, Source_No desc 
    LIMIT 500;
    `,
    `%${search}%`,
    `%${search}%`
  );
}

export async function insertVoidJournalFromCashDisbursement(
  refNo: string,
  dateEntry: string,
  req: Request
) {
  return await prisma.$queryRawUnsafe(`
  INSERT INTO
    journal 
  (Branch_Code,Date_Entry,Source_Type,Source_No,Explanation,Source_No_Ref_ID)
  VALUES ('HO',"${new Date(dateEntry)}",'CV','${refNo}','-- Void(${format(
    new Date(),
    "MM/dd/yyyy"
  )}) --','')
  `);
}

export async function insertVoidCashDisbursement(
  refNo: string,
  dateEntry: string,
  req: Request
) {
  return await prisma.$queryRawUnsafe(
    `
  INSERT INTO
    cash_disbursement 
  (Branch_Code,Date_Entry,Source_Type,Source_No,Explanation)
  VALUES ('HO',?,'CV',?,'-- Void(${format(new Date(), "MM/dd/yyyy")}) --')
  `,
    format(new Date(dateEntry), "yyyy-MM-dd HH:mm:ss.SSS"),
    refNo
  );
}
