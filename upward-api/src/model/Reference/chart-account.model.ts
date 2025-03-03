import { Request } from "express";
import { prisma } from "../../controller/index";


export async function findChartAccount(Acct_Code: string, req:Request) {

  return await prisma.chart_account.findUnique({ where: { Acct_Code } });
}

export async function addChartAccount(data: any, req:Request) {
  return await prisma.chart_account.create({ data });
}

export async function updateChartAccount(data: any, req:Request) {
  return await prisma.chart_account.update({
    data,
    where: { Acct_Code: data.Acct_Code },
  });
}
export async function deleteChartAccount(data: any, req:Request) {
  return await prisma.chart_account.delete({
    where: { Acct_Code: data.Acct_Code },
  });
}

export async function getChartAccount(search: string) {
  const qry = `
    SELECT 
    IF(a.IDNo = 0, '', 'YES') AS IDNo,
    IF(a.SubAccnt = 0, '', 'YES') AS SubAccnt,
    IF(a.Inactive = 0, '', 'YES') AS Inactive,
    a.Acct_Code,
    a.Acct_Title,
    a.Short,
    a.Acct_Type,
    a.Account
    FROM
      chart_account a
    WHERE
        a.Acct_Code LIKE '%${search}%'
        OR a.Acct_Title LIKE '%${search}%'
        OR a.Short LIKE '%${search}%'
    `
    console.log(qry)
  return await prisma.$queryRawUnsafe(qry);
}
