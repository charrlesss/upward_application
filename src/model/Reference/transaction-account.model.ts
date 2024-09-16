import { Request } from "express";
import { PrismaList } from "../connection";
const { CustomPrismaClient } = PrismaList();

export async function findTransactionCode(Code: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.transaction_code.findUnique({ where: { Code } });
}

export async function addTransactionCode(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.transaction_code.create({ data });
}

export async function updateTransactionCode(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.transaction_code.update({
    data,
    where: { Code: data.Code },
  });
}

export async function deleteTransactionCode(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.transaction_code.delete({ where: { Code: data.Code } });
}

export async function getTransactionCode(
  transactionCodeSearch: any,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

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
