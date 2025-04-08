import { Request } from "express";
import { PrismaList } from "../../connection";
import { prisma } from "../../../controller/index";

const clientDetails = `
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
      if(a.IDType = 'Policy' and c.PolicyType = "COM" OR c.PolicyType = "TPL",concat('C: ',c.ChassisNo,'  ','E: ',c.MotorNo),'') as remarks
    FROM
        (
         SELECT 
  "Client" as IDType,
  aa.entry_client_id AS IDNo,
  aa.sub_account,
  if(aa.option = "individual", CONCAT(IF(aa.lastname is not null, CONCAT(aa.lastname, ', '), ''),aa.firstname), aa.company) as Shortname,
  aa.entry_client_id as client_id  
FROM
  entry_client aa
union all
SELECT 
  "Agent" as IDType,
  aa.entry_agent_id AS IDNo,
  aa.sub_account,
  CONCAT(IF(aa.lastname, CONCAT(aa.lastname is not null, ', '),''), aa.firstname) AS Shortname,
  aa.entry_agent_id as client_id  
FROM
  entry_agent aa
union all
SELECT 
  "Employee" as IDType,
  aa.entry_employee_id AS IDNo,
  aa.sub_account,
  CONCAT(IF(aa.lastname, CONCAT(aa.lastname is not null, ', '),''), aa.firstname) AS Shortname,
  aa.entry_employee_id as client_id
FROM
  entry_employee aa
union all
SELECT 
  "Supplier" as IDType,
  aa.entry_supplier_id AS IDNo,
  aa.sub_account,
  if(aa.option = "individual", CONCAT(IF(aa.lastname is not null, CONCAT(aa.lastname, ', '),''),aa.firstname), aa.company) as Shortname,
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
        select 
          'Policy' AS IDType,
          a.PolicyNo AS IDNo,
          b.sub_account,
          IF(b.option = 'individual', CONCAT(IF(b.lastname is not null, CONCAT(b.lastname, ', '), ''), b.firstname), b.company) AS Shortname,
          a.IDNo AS client_id
        FROM
            policy a
        LEFT JOIN entry_client b ON a.IDNo = b.entry_client_id
      ) a
      left join sub_account b on a.sub_account = b.Sub_Acct
      left join vpolicy c on a.IDNo = c.PolicyNo
    ) a
    WHERE
     a.Name is not null 
`;

export async function getCheckList(search: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    `
        SELECT 
    Temp_SlipCode AS Deposit_Slip,
    date_format(deposit.Temp_SlipDate,'%m/%d/%Y' ) AS Depo_Date,
    deposit.Check_No AS Check_No,
    date_format(deposit.Check_Date ,'%m/%d/%Y') as Check_Date,
    FORMAT(deposit.Credit, 2) AS Amount,
    deposit.Bank,
    Official_Receipt,
     date_format(Date_OR,'%m/%d/%Y' )AS Date_OR,
    deposit_slip.BankAccount
FROM
    (deposit
    LEFT JOIN deposit_slip ON deposit.Temp_SlipCode = deposit_slip.SlipCode)
        LEFT JOIN
    (SELECT 
        Official_Receipt, Date_OR
    FROM
        collection
    GROUP BY Official_Receipt , Date_OR) OR_Number ON deposit.Ref_No = OR_Number.Official_Receipt
GROUP BY deposit.Temp_SlipCode , deposit.Temp_SlipDate , deposit.Ref_No , OR_Number.Date_OR , deposit_slip.BankAccount , deposit.Credit , deposit.Check_Date , deposit.Check_No , deposit.Bank , Official_Receipt 
HAVING (((OR_Number.Date_OR) IS NOT NULL)
    AND ((deposit.Check_No) <> ''))
    AND (Check_No LIKE ? OR Bank LIKE ?)
ORDER BY deposit.Check_Date Desc
LIMIT 100
  `,
    `%${search}%`,
    `%${search}%`
  );
}
//// ================ old
export async function GenerateReturnCheckID(req: Request) {
  return await prisma.$queryRawUnsafe(`
    SELECT 
      concat(DATE_FORMAT(NOW(), '%y%m'),'-',if(concat(a.year,a.month) <> DATE_FORMAT(NOW(), '%y%m'),'001',
      concat(LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),a.last_count + 1))) as return_check_id   
    FROM
        id_sequence a
    WHERE
      a.type = 'return-check'`);
}

export async function getCreditOnSelectedCheck(
  BankAccount: string,
  req: Request
) {
  return await prisma.$queryRawUnsafe(
    `
  SELECT 
    a.Account_ID , a.IDNo, b.Acct_Title, a.Desc,a.Identity
FROM
      bankaccounts a
        LEFT JOIN
      chart_account b ON a.Account_ID = b.Acct_Code
WHERE
    a.Account_No = ?;
  `,
    BankAccount
  );
}
export async function getDebitOnSelectedCheck(
  Official_Receipt: string,
  req: Request
) {
  const qry = `
  SELECT 
      
      a.CRCode,
      a.CRTitle,
      a.Credit,
      a.CRLoanID,
      a.ID_No,
      a.CRLoanName,
      a.Short,
      b.ShortName as SubAcctName,
      b.Acronym as SubAcctCode, 
      LPAD(ROW_NUMBER() OVER (), 3, '0') AS TempID
  FROM
        collection a
         left join (
          ${clientDetails}
        ) b on a.ID_No = b.IDNo
  WHERE
      a.Official_Receipt = ?
      AND a.CRCode <> ''
      
  `;
  // dito na stop
  console.log(qry);
  return await prisma.$queryRawUnsafe(qry, Official_Receipt);
}
export async function getBranchName(req: Request) {
  return await prisma.$queryRawUnsafe(
    `SELECT a.ShortName FROM  sub_account a where a.Acronym = 'HO'`
  );
}
export async function deleteReturnCheck(RC_No: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    `
    delete from   return_checks where RC_NO = ?
  `,
    RC_No
  );
}
export async function addNewReturnCheck(data: any, req: Request) {
  return await prisma.return_checks.create({ data });
}
export async function updatePDCFromReturnCheck(Check_No: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    `
    UPDATE  pdc a SET a.SlipCode ='', a.ORNum='' WHERE  a.Check_No = ?
  `,
    Check_No
  );
}
export async function updateJournalFromReturnCheck(
  Check_No: string,
  SlipCode: string,
  req: Request
) {
  return await prisma.$queryRawUnsafe(
    `
    UPDATE  journal a 
    SET a.TC ='RTC'  
    WHERE  a.Check_No = ? AND a.Source_No = ? AND a.Source_Type ='OR'
  `,
    Check_No,
    SlipCode
  );
}
export async function deleteJournalFromReturnCheck(
  SlipCode: string,
  req: Request
) {
  return await prisma.$queryRawUnsafe(
    `
  DELETE FROM   journal a WHERE a.Source_No = ? AND a.Source_Type = 'RC'`,
    SlipCode
  );
}
export async function addJournalFromReturnCheck(data: any, req: Request) {
  return await prisma.journal.create({ data });
}
export async function updateRCID(last_count: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    `
  UPDATE  id_sequence a 
    SET 
        a.last_count = ?,
        a.year = DATE_FORMAT(NOW(), '%y'),
        month = DATE_FORMAT(NOW(), '%m')
    WHERE
        a.type = 'return-check'
  `,
    last_count
  );
}
export async function searchReturnChecks(search: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    `
    SELECT 
      DATE_FORMAT(RC_Date, '%m/%d/%Y') AS RC_Date,
      RC_No,
      Explanation
    FROM
        return_checks
    WHERE
      LEFT(Explanation, 7) <> '-- Void'
          AND (RC_No LIKE ?
          OR Explanation LIKE ?)
    GROUP BY RC_Date , RC_No , Explanation
    ORDER BY RC_No desc , RC_Date desc
    LIMIT 50;
  `,
    `%${search}%`,
    `%${search}%`
  );
}
export async function getReturnCheckSearchFromJournal(
  RC_No: string,
  req: Request
) {
  return await prisma.$queryRawUnsafe(
    `
  SELECT 
    a.Branch_Code  as BranchCode,
    date_format(a.Date_Entry ,'%m/%d/%y') as DateReturn,
    a.Source_Type, 
    a.Source_No, 
    a.Explanation,
    a.GL_Acct as Code,
    a.cGL_Acct as AccountName,
    a.Sub_Acct as SubAcct,
    a.cSub_Acct as SubAcctName,
    a.ID_No as IDNo,
    a.cID_No as IDNo,
    format(a.Debit,2) as Debit,
    format(a.Credit,2) as Credit,
    date_format(date(str_to_date(a.Check_Date,'%m/%d/%Y')), '%m/%d/%y') as Check_Date,
    a.Check_No Check_No,
    a.Check_Bank as Bank,
    date_format(date(str_to_date(a.Check_Return,'%m/%d/%Y')), '%m/%d/%y')  as Check_Return,
    a.Check_Deposit as DepoDate,
    a.Check_Collect  as Date_Collection,
    a.Check_Reason,
    a.TC,
    LPAD(ROW_NUMBER() OVER (), 3, '0') as TempID
  FROM
      journal a
  WHERE
    a.Source_Type = 'RC' AND
    a.Source_No = ?
    order by a.Check_No, Code desc
      `,
    RC_No
  );
}
export async function getReturnCheckSearch(RC_No: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    `
  SELECT 
    a.Area as BranchCode, 
    a.RC_Date,
    a.RC_No,
    a.Explanation, 
    a.Check_No, 
    DATE_FORMAT(a.Date_Deposit ,'%m/%d/%y')  AS DepoDate,
    a.Amount,
    a.Reason, 
    a.Bank, 
    date_format(date(str_to_date(a.Check_Date,'%m/%d/%Y')), '%m/%d/%y') as Check_Date, 
    a.Date_Return  AS Return_Date,
    a.SlipCode AS DepoSlip, 
    a.ORNum AS OR_NO, 
    a.BankAccnt AS Bank_Account,
    a.nSort,
    DATE_FORMAT(a.Date_Collect ,'%m/%d/%y')  AS OR_Date,
    a.Temp_RCNo,
    a.Temp_RCNo as TempID
  FROM
      return_checks a
  WHERE
    a.RC_No = ?
      `,
    RC_No
  );
}
export async function findReturnCheck(RC_No: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    `
    select * from   return_checks where RC_NO = ?
  `,
    RC_No
  );
}
