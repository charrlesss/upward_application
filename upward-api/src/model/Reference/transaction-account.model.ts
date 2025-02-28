import { Request } from "express";
import { prisma } from "../../controller/index";


export async function findTransactionCode(Code: string, req: Request) {

  return await prisma.transaction_code.findUnique({ where: { Code } });
}

export async function addTransactionCode(data: any, req: Request) {

  return await prisma.transaction_code.create({ data });
}

export async function updateTransactionCode(data: any, req: Request) {

  return await prisma.transaction_code.update({
    data,
    where: { Code: data.Code },
  });
}

export async function deleteTransactionCode(data: any, req: Request) {

  return await prisma.transaction_code.delete({ where: { Code: data.Code } });
}

export async function getTransactionCode(
  transactionCodeSearch: any,
  req: Request
) {

  return await prisma.$queryRawUnsafe(`
    SELECT 
    IF(a.Inactive = 0, 'NO', 'YES') AS Inactive,
    a.Code,
    a.Description,
    a.Acct_Code
    FROM
      transaction_code a
    WHERE
    a.Acct_Code LIKE '%${transactionCodeSearch}%'
        OR a.Code LIKE '%${transactionCodeSearch}%'
    `);
}
