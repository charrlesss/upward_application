import { format } from "date-fns";
import { PrismaList } from "../../connection";
import { Request } from "express";
const { CustomPrismaClient } = PrismaList();

export async function GenerateGeneralJournalID(req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
      SELECT 
        concat(DATE_FORMAT(NOW(), '%y%m'),'-',if(concat(a.year,a.month) <> DATE_FORMAT(NOW(), '%y%m'),'001',concat(LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),a.last_count + 1))) as general_journal_id   
      FROM
          id_sequence a
      WHERE
        a.type = 'general-journal'`);
}

export async function getChartOfAccount(search: string, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
    SELECT 
        a.Acct_Code, a.Acct_Title, a.Short
    FROM
          chart_account a
    WHERE
        (a.Acct_Code LIKE '%${search}%'
            OR a.Acct_Title LIKE '%${search}%'
            OR a.Short LIKE '%${search}%')
            AND a.Inactive = 0
            AND a.Acct_Type = 'Detail'
            ORDER BY a.Acct_Code ASC
    LIMIT 100;
    `);
}

export async function getPolicyIdClientIdRefId(search: string, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
  SELECT 
    a.*,
    b.ShortName  as Sub_ShortName,
    b.Acronym,
    LPAD(ROW_NUMBER() OVER (), 3, '0') AS TempID
  FROM
    (SELECT 
    'Client' AS Type,
    aa.entry_client_id AS IDNo,
    aa.sub_account,
   if(aa.company <> '',aa.company, CONCAT(aa.lastname, ', ', aa.firstname)) AS Shortname,
    aa.address
FROM
      entry_client aa 
UNION ALL SELECT 
    'Agent' AS Type,
    aa.entry_agent_id AS IDNo,
    aa.sub_account,
    CONCAT(aa.lastname, ', ', aa.firstname) AS Shortname,
    aa.address
FROM
      entry_agent aa 
UNION ALL SELECT 
    'Employee' AS Type,
    aa.entry_employee_id AS IDNo,
    aa.sub_account,
    CONCAT(aa.lastname, ', ', aa.firstname) AS Shortname,
    aa.address
FROM
      entry_employee aa 
UNION ALL SELECT 
    'Supplier' AS Type,
    aa.entry_supplier_id AS IDNo,
    aa.sub_account,
    if(aa.company <> '',aa.company, CONCAT(aa.lastname, ', ', aa.firstname)) AS Shortname,
    aa.address
FROM
      entry_supplier aa 
UNION ALL SELECT 
    'Fixed Assets' AS Type,
    aa.entry_fixed_assets_id AS IDNo,
    aa.sub_account,
    aa.fullname AS Shortname,
    CONCAT(aa.description, ' - ', aa.remarks) AS address
FROM
      entry_fixed_assets aa 
UNION ALL SELECT 
    'Others' AS Type,
    aa.entry_others_id AS IDNo,
    aa.sub_account,
    aa.description AS Shortname,
    CONCAT(aa.description, ' - ', aa.remarks) AS address
FROM
      entry_others aa UNION ALL SELECT 
        'Policy Type' AS Type, a.IDNo, b.sub_account, b.Shortname, b.address
    FROM
          policy a
    LEFT JOIN (SELECT 
        aa.entry_client_id AS IDNo,
            CONCAT(aa.lastname, ', ', aa.firstname) AS Shortname,
            aa.sub_account,
            aa.address
    FROM
          entry_client aa UNION ALL SELECT 
        aa.entry_agent_id AS IDNo,
            CONCAT(aa.lastname, ', ', aa.firstname) AS Shortname,
            aa.sub_account,
            aa.address
    FROM
          entry_agent aa UNION ALL SELECT 
        aa.entry_employee_id AS IDNo,
            CONCAT(aa.lastname, ', ', aa.firstname) AS Shortname,
            aa.sub_account,
            aa.address
    FROM
          entry_employee aa UNION ALL SELECT 
        aa.entry_supplier_id AS IDNo,
            CONCAT(aa.lastname, ', ', aa.firstname) AS Shortname,
            aa.sub_account,
            aa.address
    FROM
          entry_supplier aa UNION ALL SELECT 
        aa.entry_fixed_assets_id AS IDNo,
            aa.fullname AS Shortname,
            aa.sub_account,
              CONCAT(aa.description, ' - ', aa.remarks) AS address
    FROM
          entry_fixed_assets aa UNION ALL SELECT 
        aa.entry_others_id AS IDNo,
            aa.description AS Shortname,
            aa.sub_account,
             CONCAT(aa.description, ' - ', aa.remarks) AS address
    FROM
          entry_others aa) b ON a.IDNo = b.IDNo) a
        LEFT JOIN
      sub_account b ON a.sub_account = b.Sub_Acct
    WHERE
    a.IDNo LIKE '%${search}%'
        OR a.Shortname LIKE '%${search}%'
    ORDER BY a.Shortname
    LIMIT 500;
      `);
}

export async function getTransactionAccount(search: string, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
    SELECT 
        a.Code, a.Description
    FROM
          transaction_code a
    WHERE
        (a.Code LIKE '%${search}%'
            OR a.Description LIKE '%${search}%')
    ORDER BY a.Description
    LIMIT 500;
    `);
}

export async function addJournalVoucher(data: any, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return prisma.journal_voucher.create({ data });
}
export async function addJournalFromJournalVoucher(data: any, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return prisma.journal.create({ data });
}

export async function updateGeneralJournalID(last_count: string, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
      UPDATE  id_sequence a 
        SET 
            a.last_count = '${last_count}',
            a.year = DATE_FORMAT(NOW(), '%y'),
            month = DATE_FORMAT(NOW(), '%m')
        WHERE
            a.type = 'general-journal'
      `);
}
export async function deleteGeneralJournal(Source_No: string, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
    DELETE
    FROM
          journal_voucher a
    WHERE
      a.Source_No = '${Source_No}'
          AND a.Source_Type = 'GL'
      `);
}

export async function deleteJournalFromGeneralJournal(
  Source_No: string,
  req: Request
) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
      DELETE
      FROM
            journal a
      WHERE
        a.Source_No = '${Source_No}'
            AND a.Source_Type = 'GL'
        `);
}
export async function findeGeneralJournal(Source_No: string, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(
    `SELECT * FROM  journal_voucher where Source_No = '${Source_No}'`
  );
}
export async function voidGeneralJournal(Source_No: string, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
        DELETE
        FROM
              journal_voucher a
        WHERE
          a.Source_No = '${Source_No}'
              AND a.Source_Type = 'GL'
          `);
}
export async function insertVoidGeneralJournal(
  refNo: string,
  dateEntry: string,
  req: Request
) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
  INSERT INTO
    journal_voucher 
  (Branch_Code,Date_Entry,Source_Type,Source_No,Explanation)
  VALUES ('HO',"${format(
    new Date(dateEntry),
    "yyyy-MM-dd HH:mm:ss.SSS"
  )}",'GL','${refNo}','-- Void(${format(new Date(), "MM/dd/yyyy")}) --')
  `);
}

export async function voidJournalFromGeneralJournal(
  Source_No: string,
  req: Request
) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
    DELETE
    FROM
          journal a
    WHERE
      a.Source_No = '${Source_No}'
          AND a.Source_Type = 'GL'
      `);
}

export async function insertVoidJournalFromGeneralJournal(
  refNo: string,
  dateEntry: string,
  req: Request
) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
  INSERT INTO
    journal 
  (Branch_Code,Date_Entry,Source_Type,Source_No,Explanation,Source_No_Ref_ID)
  VALUES ('HO',"${dateEntry}",'GL','${refNo}','-- Void(${format(
    new Date(),
    "MM/dd/yyyy"
  )}) --','')
  `);
}

export async function searchGeneralJournal(search: string, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
    SELECT 
        date_format(Date_Entry , '%m/%d/%Y') as Date_Entry,
         Source_No, Explanation
    FROM
          journal_voucher
    WHERE
        LEFT(Explanation, 7) <> '-- Void'
            AND (Source_No LIKE '%${search}%'
            OR Explanation LIKE '%${search}%')
    GROUP BY Date_Entry , Source_No , Explanation
    ORDER BY Date_Entry DESC , Source_No DESC

      `);
}

export async function getSelectedSearchGeneralJournal(
  Source_No: string,
  req: Request
) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return await prisma.$queryRawUnsafe(`
  SELECT 
        a.Branch_Code as BranchCode,
        a.Date_Entry as dateEntry,
        a.Source_No as refNo,
        a.Explanation as explanation,
        a.GL_Acct as code,
        a.cGL_Acct as acctName,
        a.cSub_Acct as subAcctName,
        a.cID_No as ClientName,
        FORMAT(a.Debit,2) as debit,
        FORMAT(a.Credit,2) as credit,
        a.TC as TC_Code,
        a.Remarks as remarks,
        a.Sub_Acct as subAcct,
        a.ID_No as IDNo, 
        a.VAT_Type as vatType,
        OR_Invoice_No as invoice,
        a.VATItemNo AS TempID
    FROM
      journal_voucher a where a.Source_No ='${Source_No}' order by a.VATItemNo
      `);
}

export async function doRPTTransactionLastRow(req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return prisma.$queryRawUnsafe(`
  SELECT 
    b.ShortName as subAcctName , b.Acronym as BranchCode, a.description as ClientName , a.entry_others_id as IDNo
  FROM
        entry_others a
          LEFT JOIN
        sub_account b ON a.sub_account = b.Sub_Acct
  WHERE
      a.entry_others_id = 'O-0124-001';
    `);
}
export async function doMonthlyProduction(
  account: string,
  month: number,
  year: number,
  req: Request
) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return prisma.$queryRawUnsafe(`
  SELECT 
    PolicyNo as IDNo,
    P.SubAcct as subAcctName,
    TotalDue as debit,
    PolicyNo as ClientName,
    LPAD(ROW_NUMBER() OVER (), 3, '0') AS TempID
  FROM
      Policy P
  WHERE
    Account = '${account}'
        AND MONTH(DateIssued) = ${month}
        AND YEAR(DateIssued) = ${year}
    `);
}

export async function doRPTTransaction(
  from: string,
  to: string,
  Mortgagee: string,
  req: Request
) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


  return prisma.$queryRawUnsafe(`
  SELECT 
      d.ShortName as subAcctName,
      d.Acronym as BranchCode,
      d.ClientName,
      FORMAT(REPLACE((TotalDue - ifnull(b.TotalPaid, 0)), ',', ''), 2)  AS credit,
      a.PolicyNo,
      a.IDNo, 
      b.TotalPaid,
      c.Mortgagee,
      d.address,
      LPAD(ROW_NUMBER() OVER (), 3, '0') AS TempID
      FROM
            policy a
              LEFT JOIN
          (SELECT 
              IDNo,
              SUM(CONVERT(REPLACE(debit, ',', ''),DECIMAL(10,2)) ) AS 'TotalPaid'
          FROM
                collection
          GROUP BY IDNo) b ON b.IDNo = a.PolicyNo
        left join  (
          SELECT a.IDNo, a.address, a.Shortname as ClientName,a.sub_account , b.ShortName , b.Acronym from (
          
    SELECT 
    'Client' AS Type,
    aa.entry_client_id AS IDNo,
    aa.sub_account,
    CONCAT(aa.lastname, ', ', aa.firstname) AS Shortname,
    aa.address
FROM
      entry_client aa 
UNION ALL SELECT 
    'Agent' AS Type,
    aa.entry_agent_id AS IDNo,
    aa.sub_account,
    CONCAT(aa.lastname, ', ', aa.firstname) AS Shortname,
    aa.address
FROM
      entry_agent aa 
UNION ALL SELECT 
    'Employee' AS Type,
    aa.entry_employee_id AS IDNo,
    aa.sub_account,
    CONCAT(aa.lastname, ', ', aa.firstname) AS Shortname,
    aa.address
FROM
      entry_employee aa 
UNION ALL SELECT 
    'Supplier' AS Type,
    aa.entry_supplier_id AS IDNo,
    aa.sub_account,
    CONCAT(aa.lastname, ', ', aa.firstname) AS Shortname,
    aa.address
FROM
      entry_supplier aa 
UNION ALL SELECT 
    'Fixed Assets' AS Type,
    aa.entry_fixed_assets_id AS IDNo,
    aa.sub_account,
    aa.fullname AS Shortname,
    CONCAT(aa.description, ' - ', aa.remarks) AS address
FROM
      entry_fixed_assets aa 
UNION ALL SELECT 
    'Others' AS Type,
    aa.entry_others_id AS IDNo,
    aa.sub_account,
    aa.description AS Shortname,
    CONCAT(aa.description, ' - ', aa.remarks) AS address
FROM
      entry_others aa
           ) a
          left join   sub_account b on a.sub_account = b.Sub_Acct
          ) d on a.IDNo = d.IDNo
              INNER JOIN
            vpolicy c ON c.PolicyNo = a.PolicyNo
          
      WHERE
          (
            TotalDue - ifnull(b.TotalPaid, 0)) <> 0
            AND a.PolicyType = 'TPL'
            AND c.Mortgagee = '${Mortgagee}'
            AND (CAST(a.DateIssued AS DATE) >= STR_TO_DATE('${from}', '%m-%d-%Y') 
            AND CAST(a.DateIssued AS DATE) <= STR_TO_DATE('${to}', '%m-%d-%Y')
          )
      ORDER BY a.DateIssued
    `);
}
