import { Request } from "express";
import { prisma } from "../../controller/index";

export async function getPettyCashTransaction(
  transactionCodeSearch: any,
  req: Request
) {

  return await prisma.$queryRawUnsafe(`
      SELECT 
        IF(a.Inactive = 0, 'NO', 'YES') AS Inactive,
        a.Petty_Log,
        a.Purpose,
        a.Acct_Code,
        a.Short
        FROM
          petty_log a
      WHERE
        a.Acct_Code LIKE '%${transactionCodeSearch}%'
        OR a.Short LIKE '%${transactionCodeSearch}%'
         OR a.Purpose LIKE '%${transactionCodeSearch}%'
      `);
}

export async function addPettyCashTransaction(data: any, req: Request) {

  return await prisma.petty_log.create({ data });
}

export async function updatePettyCashTransaction(data: any, req: Request) {

  return await prisma.petty_log.update({
    data,
    where: { Petty_Log: data.Petty_Log },
  });
}
export async function deletePettyCashTransaction(data: any, req: Request) {

  return await prisma.petty_log.delete({
    where: { Petty_Log: data.Petty_Log },
  });
}
