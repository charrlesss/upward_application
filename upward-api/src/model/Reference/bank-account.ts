import { Request } from "express";
import { prisma } from "../../controller/index";

export async function searchBankAccountsModel(search: string) {
  const qry = `
     SELECT 
    Account_No AS Account_Number,
    Account_Name AS Account_Name,
    Account_Type AS Account_Type,
    BankAccounts.Desc AS Bank_Name,
    BankAccounts.Option,
    BankAccounts.Account_ID,
    IF(BankAccounts.InActive = 1, 'Yes', '') AS Inactive,
    Auto,
    BankAccounts.IDNo AS ID_No,
    Identity,
    Bank,
    Chart_Account.Acct_Title
FROM
    BankAccounts
        LEFT JOIN
    Bank ON BankAccounts.Desc = Bank.Bank_Code
        LEFT JOIN
    Chart_Account ON BankAccounts.Account_ID = Chart_Account.Acct_Code
WHERE
    Account_No LIKE '%${search}%'
        OR Account_Name LIKE '%${search}%'
        LIMIT 100
      `;
  return await prisma.$queryRawUnsafe(qry);
}
export async function searchBankModel(search: string) {
  const qry = `
      SELECT  Bank_Code AS Code, 
      Bank AS Bank_Name 
      FROM Bank  
      WHERE Inactive = 0 
      AND (Bank_Code LIKE '%${search}%' OR  Bank LIKE '%${search}%') ORDER BY Bank
      limit 100
      `;
  return await prisma.$queryRawUnsafe(qry);
}
export async function searchChartAccountModel(search: string) {
  const qry = `
    SELECT 
    Acct_Code AS Code, 
    Acct_Title AS Title, 
    Short
      FROM
      Chart_Account
      WHERE
      Inactive = 0
            AND (Acct_Code LIKE '%%' OR Short LIKE '%%'
            OR Acct_Title LIKE '%%')
      ORDER BY Acct_Code
      LIMIT 100
      `;
  return await prisma.$queryRawUnsafe(qry);
}
export async function searchClientModel(search: string) {
  const qry = `
    SELECT 
    IDNo, client_name AS Name, IDType
FROM
   (SELECT 
            id_entry.IDNo,
            IFNULL(b.Acronym, 'HO') AS Sub_Acct,
            IFNULL(b.ShortName, 'Head Office') AS ShortName,
            id_entry.ShortName as client_name,
            IDType
            
        FROM
            (SELECT 
                IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                        AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
                    aa.entry_client_id AS IDNo,
                    aa.sub_account,
                    'Client' as IDType
            FROM
                entry_client aa UNION ALL SELECT 
                CONCAT(IF(aa.lastname IS NOT NULL
                        AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
                    aa.entry_agent_id AS IDNo,
                    aa.sub_account,
                    'Agent' as IDType
            FROM
                entry_agent aa UNION ALL SELECT 
                CONCAT(IF(aa.lastname IS NOT NULL
                        AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
                    aa.entry_employee_id AS IDNo,
                    aa.sub_account,
                    'Employee' as IDType
            FROM
                entry_employee aa UNION ALL SELECT 
                aa.fullname AS ShortName,
                    aa.entry_fixed_assets_id AS IDNo,
                    sub_account,
                    'Fixed Assets' as IDType
            FROM
                entry_fixed_assets aa UNION ALL SELECT 
                aa.description AS ShortName,
                    aa.entry_others_id AS IDNo,
                    aa.sub_account,
                    'Others' as IDType
            FROM
                entry_others aa UNION ALL SELECT 
                IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                        AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
                    aa.entry_supplier_id AS IDNo,
                    aa.sub_account,
                    'Supplier' as IDType
            FROM
                entry_supplier aa) id_entry
                LEFT JOIN
            sub_account b ON id_entry.sub_account = b.Sub_Acct) ID_Entry
WHERE
         (IDNo LIKE '%${search}%'
        OR client_name LIKE '%${search}%')
ORDER BY client_name
limit 100
      `;
  return await prisma.$queryRawUnsafe(qry);
}

export async function addBankAccount(data: any, req: Request) {
  return await prisma.bankaccounts.create({ data });
}

export async function updateBankAccount(data: any, Auto: string, req: Request) {
  return await prisma.bankaccounts.update({ data, where: { Auto } });
}
export async function removeBankAccount(Auto: string, req: Request) {
  return await prisma.bankaccounts.delete({ where: { Auto } });
}

export async function getBankAccount(bankAccountSearch: string, req: Request) {
  return await prisma.$queryRawUnsafe(`
      SELECT 
            a.*, b.Bank AS BankName, c.Acct_Title AS Account_ID_Name
      FROM
            bankaccounts a
            LEFT JOIN
            bank b ON a.Desc = b.Bank_Code
            LEFT JOIN
            chart_account c ON a.Account_ID = c.Acct_Code
      WHERE
            a.Account_No LIKE '%${bankAccountSearch}%'
            OR a.Account_Name LIKE '%${bankAccountSearch}%'
            OR a.Account_Type LIKE '%${bankAccountSearch}%'
            OR a.Identity LIKE '%${bankAccountSearch}%'
            OR a.IDNo LIKE '%${bankAccountSearch}%'
            OR a.Account_ID LIKE '%${bankAccountSearch}%'
      LIMIT 100;
    `);
}

export async function searchClient(search: string, req: Request) {
  return await prisma.$queryRawUnsafe(`
  select 
      a.IDType,
      a.IDNo,
      a.sub_account,
      a.Shortname as Name,
      a.client_id,
      LPAD(ROW_NUMBER() OVER (), 3, '0') AS ID,
      a.address
    from (
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
    ) a
      WHERE
        a.IDNo LIKE '%${search}%'
      OR a.Shortname LIKE '%${search}%'
        ORDER BY a.Shortname
        LIMIT 100
    `);
}
