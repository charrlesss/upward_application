import { Request } from "express";
import { PrismaList } from "../connection";
const { CustomPrismaClient } = PrismaList();

export async function addBankAccount(data: any, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.bankaccounts.create({ data });
}

export async function updateBankAccount(data: any, Auto: string, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.bankaccounts.update({ data, where: { Auto } });
}
export async function removeBankAccount(Auto: string, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.bankaccounts.delete({ where: { Auto } });
}

export async function getBankAccount(bankAccountSearch: string, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

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

export async function searchClient(search: string, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

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
