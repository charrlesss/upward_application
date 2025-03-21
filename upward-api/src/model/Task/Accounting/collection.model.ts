import { Request } from "express";
import { PrismaList } from "../../connection";
import { selectClient } from "./pdc.model";
import { prisma } from "../../../controller/index";


export async function getClientCheckedList(
  search: string,
  PNo: string,
  req: Request
) {

  const query = `
   SELECT 
        CAST(ROW_NUMBER() OVER () AS CHAR) AS temp_id,
        a.Check_No,
        DATE_FORMAT(a.Check_Date, '%m/%d/%Y') as Check_Date,
        FORMAT(CAST(REPLACE(a.Check_Amnt, ',', '') AS DECIMAL(20,2)), 2) as  Amount,
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
    LIMIT 50
    `;

  console.log("check list -", query);
  return await prisma.$queryRawUnsafe(query);
}

export async function getTransactionBanksDetails(req: Request) {

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

  const query = `
        SELECT Transaction_Code.*, Chart_Account.Acct_Title from Transaction_Code LEFT JOIN Chart_Account ON Transaction_Code.Acct_Code = Chart_Account.Acct_Code WHERE Chart_Account.Acct_Code IS NOT NULL ORDER BY Description`;
  return await prisma.$queryRawUnsafe(query);
}

export async function createCollection(data: any, req: Request) {

  return await prisma.collection.create({ data });
}

export async function upteCollection(data: any, Temp_OR: string, req: Request) {

  return await prisma.collection.update({ data, where: { Temp_OR } });
}

export async function updatePDCCheck(data: any, req: Request) {

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

  return await prisma.$queryRawUnsafe(`
      DELETE from   journal a
      WHERE a.Source_Type = 'OR' AND a.Source_No = '${ORNo}'
  `);
}

export async function createJournal(data: any, req: Request) {

  return await prisma.journal.create({ data });
}

export async function collectionIDGenerator(req: Request) {

  return await prisma.$queryRawUnsafe(`
    SELECT 
      concat(LEFT(a.last_count ,length(a.last_count) -length(a.last_count + 1)),a.last_count + 1) as collectionID 
    FROM
        id_sequence a
    WHERE
      type = 'collection';`);
}

export async function updateCollectionIDSequence(data: any, req: Request) {

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

  return await prisma.collection.findMany({
    where: { Official_Receipt: ORNo },
  });
}

export async function getCollections(
  searchCollectionInput: string,
  req: Request
) {

  return await prisma.$queryRawUnsafe(`
     SELECT 
        date_format(a.Date_OR,'%Y-%m-%d')  as Date_OR,
        a.ORNo,
        a.Name
		   
          FROM
                collection a
      WHERE
          Date IS NOT NULL
      AND (a.Official_Receipt LIKE '%${searchCollectionInput}%'
                  OR Name LIKE '%${searchCollectionInput}%')
                  ORDER BY CAST(a.ORNo AS DECIMAL) DESC
      limit 50;

  `);
}
export async function getSearchCollection(ORNo: string, req: Request) {

  return await prisma.$queryRawUnsafe(`
  SELECT 
    a.Date, 
    a.ORNo, 
    a.IDNo, 
    a.Name, 
	a.Payment, 
    a.Bank,
	a.Check_Date,
	a.Check_No,
	a.DRCode,
	a.DRTitle,
	a.DRRemarks,
    a.Debit,
    a.Purpose,
    c.Acct_Code  as CRCode,
    c.Acct_Title as CRTitle,
    a.Credit,
    a.CRRemarks,
    a.ID_No,
    a.Official_Receipt,
	a.Temp_OR,
	a.Date_OR,
	a.Short,
	a.SlipCode,
	a.Status,
	a.CRLoanID,
	a.CRLoanName,
	a.CRRemarks2,
    a.CRVATType,
    a.CRInvoiceNo,
	c.Code as TC,
    date_format(a.Date_OR,'%Y-%m-%d') as Date_OR,
    b.Bank_Code, 
    b.Bank AS BankName,
    TRIM(BOTH ' ' FROM SUBSTRING_INDEX(a.Bank, '/', -1)) as Branch
  FROM
      collection a
        LEFT JOIN
      bank b ON b.Bank_Code = TRIM(BOTH ' ' FROM SUBSTRING_INDEX(a.Bank, '/', 1))
     left join  (
     select Chart_Account.* ,Transaction_Code.Description ,Transaction_Code.Code from Transaction_Code LEFT JOIN Chart_Account ON Transaction_Code.Acct_Code = Chart_Account.Acct_Code 
     ) c on a.Purpose = c.Description 
  WHERE
    a.Official_Receipt = '${ORNo}'
  ORDER BY a.Temp_OR

  `);
}

export async function deleteCollection(Official_Receipt: string, req: Request) {

  return await prisma.$queryRawUnsafe(`
    DELETE FROM   collection a WHERE a.Official_Receipt ='${Official_Receipt}'
  `);
}

export async function updateCollection(data: any, Temp_OR: any, req: Request) {

  return await prisma.collection.update({ data: data, where: { Temp_OR } });
}

export async function TransactionAndChartAccount(search: string, req: Request) {

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
  return await prisma.$queryRawUnsafe(`
    SELECT 
      b.Acct_Code, 
      b.Acct_Title FROM 
    transaction_code  a 
    left join chart_account 
    b on a.Acct_Code = b.Acct_Code 
    where Code = '${code}'
  `);
}

export async function printModel(req: Request, OR_Num: string) {

  const qry = `
    SELECT 
    Official_Receipt, 
    CONCAT(IFNULL(ID_Entry.Shortname, PID.Shortname), 
    ' (', IFNULL(PID.IDNo, ID_Entry.IDNo), ')') AS Payor,
    IF(PID.address = '' OR PID.address is null, ID_Entry.address, PID.address) AS PayorAddress,
    DATE_FORMAT(Date_OR, '%M %d, %Y') AS DateOR,
    Amount AS ORAmount 
    FROM 
    (SELECT Official_Receipt, ID_No, Date_OR, format(SUM(CAST(REPLACE(Debit, ',', '') AS DECIMAL(20,2)) ) , 2) AS Amount 
    FROM collection
    WHERE Official_Receipt = '${OR_Num}' 
    GROUP BY Official_Receipt, ID_No, Date_OR) AS ORCollection 
    LEFT JOIN Policy ON ORCollection.ID_No = Policy.PolicyNo 
    LEFT JOIN (${selectClient}) PID ON Policy.IDNo = PID.IDNo 
    LEFT JOIN (${selectClient}) ID_Entry ON ORCollection.ID_No = ID_Entry.IDNo
  `;
  const qry1 = `SELECT * FROM collection WHERE  Official_Receipt = '${OR_Num}'`;

  return {
    data: await prisma.$queryRawUnsafe(qry),
    data1: await prisma.$queryRawUnsafe(qry1),
  };
}
