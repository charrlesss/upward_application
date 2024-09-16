import { Request } from "express";
import { PrismaList } from "../../connection";
import { selectClient } from "./pdc.model";
const { CustomPrismaClient } = PrismaList();

export async function getClientCheckedList(
  search: string,
  PNo: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
   SELECT 
        CAST(ROW_NUMBER() OVER () AS CHAR) AS temp_id,
        a.Check_No,
        DATE_FORMAT(a.Check_Date, '%m/%d/%Y') as Check_Date,
        FORMAT(CAST(REPLACE(a.Check_Amnt, ',', '') AS DECIMAL(10,2)), 2) as  Amount,
        CONCAT(a.Bank, ' / ', a.Branch) as Bank_Branch,
        a.Remarks,
        a.Bank,
        a.Branch,
        a.Check_Remarks,
        b.Bank as BankName
    FROM
          pdc a
    LEFT JOIN   bank b ON a.Bank = b.Bank_Code
    WHERE
        (a.Check_No LIKE '%${search}%' OR a.Bank LIKE '%${search}%'
            OR a.Branch LIKE '%${search}%')
            AND (a.PNo = '${PNo}')
            AND (a.ORNum IS NULL OR a.ORNum = '')
    ORDER BY a.Check_Date
    LIMIT 100
    `;

  console.log("check list -", query);
  return await prisma.$queryRawUnsafe(query);
}

export async function getTransactionBanksDetails(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `SELECT 
            *
        FROM
              transaction_code a
                LEFT JOIN
              chart_account b ON a.Acct_Code = b.Acct_Code
        WHERE
        a.code = 'CHK' OR a.code = 'CSH'`;
  return await prisma.$queryRawUnsafe(query);
}

export async function getTransactionBanksDetailsDebit(
  code: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `SELECT 
            *
        FROM
              transaction_code a
                LEFT JOIN
              chart_account b ON a.Acct_Code = b.Acct_Code
        WHERE
        a.code = '${code}'`;
  return await prisma.$queryRawUnsafe(query);
}

export async function postTransactionBanksDetails(code: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `SELECT 
            *
        FROM
              transaction_code a
                LEFT JOIN
              chart_account b ON a.Acct_Code = b.Acct_Code
        WHERE
         a.Acct_Code = '${code}'`;
  return await prisma.$queryRawUnsafe(query);
}

export async function getTransactionDescription(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
        SELECT 
            a.Description as label,
            b.Acct_Code,
            b.Acct_Title,
            a.Code
        FROM
              transaction_code a
                LEFT JOIN
              chart_account b ON a.Acct_Code = b.Acct_Code
        WHERE
            b.Acct_Code IS NOT NULL
        ORDER BY Description`;
  return await prisma.$queryRawUnsafe(query);
}

export async function createCollection(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.collection.create({ data });
}

export async function upteCollection(data: any, Temp_OR: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.collection.update({ data, where: { Temp_OR } });
}

export async function updatePDCCheck(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    UPDATE  pdc a
        SET a.ORNum ='${data.ORNum}'
    WHERE a.PNo = '${data.PNo}' AND a.Check_No = '${data.CheckNo}'
`);
}

export async function deleteFromJournalToCollection(
  ORNo: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
      DELETE from   journal a
      WHERE a.Source_Type = 'OR' AND a.Source_No = '${ORNo}'
  `);
}

export async function createJournal(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.journal.create({ data });
}

export async function collectionIDGenerator(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    SELECT 
      concat(LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),a.last_count + 1) as collectionID 
    FROM
        id_sequence a
    WHERE
      type = 'collection';`);
}

export async function updateCollectionIDSequence(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
      update  id_sequence a
      set 
        a.last_count = '${data.last_count}',
        a.year = DATE_FORMAT(NOW(), '%y'),
        a.month = DATE_FORMAT(NOW(), '%m')
      where a.type ='collection'
    `);
}
export async function findORnumber(ORNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.collection.findMany({
    where: { Official_Receipt: ORNo },
  });
}

export async function getCollections(
  searchCollectionInput: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    SELECT 
        date_format(MAX(a.Date),'%m/%d/%Y') AS Date,
        a.Official_Receipt AS 'ORNo',
        MAX(a.Name) AS Name
    FROM
          collection a
    WHERE
        LEFT(a.Name, 7) <> '-- Void'
            AND (a.Official_Receipt LIKE '%${searchCollectionInput}%'
            OR Name LIKE '%${searchCollectionInput}%')
    GROUP BY a.Official_Receipt
    ORDER BY MAX(a.Date) DESC , Name
    LIMIT 100
  `);
}
export async function getSearchCollection(ORNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT 
    a.*, 
    b.Bank_Code, 
    b.Bank AS BankName,
    TRIM(BOTH ' ' FROM SUBSTRING_INDEX(a.Bank, '/', -1)) as Branch
  FROM
      collection a
        LEFT JOIN
      bank b ON b.Bank_Code = TRIM(BOTH ' ' FROM SUBSTRING_INDEX(a.Bank, '/', 1))
  WHERE
    a.Official_Receipt = '${ORNo}'
  ORDER BY a.Temp_OR
  `);
}

export async function deleteCollection(Official_Receipt: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    DELETE FROM   collection a WHERE a.Official_Receipt ='${Official_Receipt}'
  `);
}

export async function updateCollection(data: any, Temp_OR: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.collection.update({ data: data, where: { Temp_OR } });
}

export async function TransactionAndChartAccount(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  SELECT 
  b.Acct_Code, b.Acct_Title
FROM
    transaction_code a
      LEFT JOIN
    chart_account b ON a.Acct_Code = b.Acct_Code
WHERE
  a.Description = '${search}'    `;
  return await prisma.$queryRawUnsafe(query);
}

export async function getDrCodeAndTitle(code: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.$queryRawUnsafe(`
    SELECT 
    b.Acct_Code, 
    b.Acct_Title FROM upward_insurance_umis.transaction_code  a left join upward_insurance_umis.chart_account b on a.Acct_Code = b.Acct_Code where Code = '${code}'
  `);
}

export async function printModel(req: Request, OR_Num: string) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const qry = `
    SELECT 
    Official_Receipt, 
    CONCAT(IFNULL(ID_Entry.Shortname, PID.Shortname), 
    ' (', IFNULL(PID.IDNo, ID_Entry.IDNo), ')') AS Payor,
    IF(PID.address = '' OR PID.address is null, ID_Entry.address, PID.address) AS PayorAddress,
    DATE_FORMAT(Date_OR, '%M %d, %Y') AS DateOR,
    Amount AS ORAmount 
    FROM 
    (SELECT Official_Receipt, ID_No, Date_OR, format(SUM(CAST(REPLACE(Debit, ',', '') AS DECIMAL(10,2)) ) , 2) AS Amount 
    FROM Collection
    WHERE Official_Receipt = '${OR_Num}' 
    GROUP BY Official_Receipt, ID_No, Date_OR) AS ORCollection 
    LEFT JOIN Policy ON ORCollection.ID_No = Policy.PolicyNo 
    LEFT JOIN (${selectClient}) PID ON Policy.IDNo = PID.IDNo 
    LEFT JOIN (${selectClient}) ID_Entry ON ORCollection.ID_No = ID_Entry.IDNo
  `;
  const qry1 = `SELECT * FROM Collection WHERE  Official_Receipt = '${OR_Num}'`;

  console.log(qry);
  return {
    data: await prisma.$queryRawUnsafe(qry),
    data1: await prisma.$queryRawUnsafe(qry1),
  };
}
