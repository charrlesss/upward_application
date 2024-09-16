import { format } from "date-fns";
import { PrismaList } from "../../connection";
import { Request } from "express";
const { CustomPrismaClient } = PrismaList();

export async function GenerateCashDisbursementID(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
      SELECT 
        concat(DATE_FORMAT(NOW(), '%y%m'),'-', LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),a.last_count + 1) as id   
      FROM
          id_sequence a
      WHERE
        a.type = 'cash-disbursement'`);
}

export async function AddNewCashDisbursement(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.cash_disbursement.create({ data });
}
export async function AddNewJournalFromCashDisbursement(
  data: any,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.journal.create({ data });
}

export async function DeleteNewCashDisbursement(
  Source_No: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

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
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

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
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

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
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(
    `SELECT * FROM  cash_disbursement where Source_No = '${Source_No}' and Source_Type = 'CV'`
  );
}
export async function findSearchSelectedCashDisbursement(
  Source_No: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(
    `SELECT 
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
        VATItemNo as TempID
    FROM 
      cash_disbursement 
      where 
      Source_No = '${Source_No}' and Source_Type = 'CV'`
  );
}
export async function searchCashDisbursement(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(
    `
    SELECT 
      DATE_FORMAT(Date_Entry, '%m/%d/%Y') AS Date_Entry, 
          Source_No , 
          Explanation 
      FROM 
            cash_disbursement
      WHERE 
          LEFT(Explanation, 7) <> '-- Void' 
          AND (Source_No LIKE '%${search}%' OR Explanation LIKE '%${search}%')
      GROUP BY 
          Date_Entry, Source_No, Explanation 
      ORDER BY 
          Date_Entry DESC, Source_No, Explanation 
      LIMIT 100;
    `
  );
}

export async function insertVoidJournalFromCashDisbursement(
  refNo: string,
  dateEntry: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

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
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  INSERT INTO
    cash_disbursement 
  (Branch_Code,Date_Entry,Source_Type,Source_No,Explanation)
  VALUES ('HO','${format(
    new Date(dateEntry),
    "yyyy-MM-dd HH:mm:ss.SSS"
  )}','CV','${refNo}','-- Void(${format(new Date(), "MM/dd/yyyy")}) --')
  `);
}
