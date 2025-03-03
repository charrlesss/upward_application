import { Request } from "express";
import { prisma } from "../../controller/index";

export async function getPettyCashTransaction(search: string) {
  return await prisma.$queryRawUnsafe(`
         SELECT 
          Purpose,
          Chart_Account.Acct_Code AS Code,
          Chart_Account.Acct_Title AS Account_Name,
          IF(Petty_Log.InActive = 1, 'Yes', '') AS Inactive,
          Petty_Log.Petty_Log
      FROM
          Petty_Log
              INNER JOIN
          Chart_Account ON Petty_Log.Acct_Code = Chart_Account.Acct_Code
      WHERE
          (Purpose LIKE '%${search}%')

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
export async function searchChartAccountPettyCash(search: string) {
  return await prisma.$queryRawUnsafe(`
    SELECT 
    Acct_Code AS Code, Acct_Title AS Title, Short AS Short_Name
FROM
    Chart_Account
WHERE
    Acct_Type = 'Detail' AND Inactive = 0
        AND (Acct_Code LIKE '%${search}%' OR Short LIKE '%${search}%'
        OR Acct_Title LIKE '%${search}%')
ORDER BY Acct_Code
    `);
}
