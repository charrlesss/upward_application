import { Request } from "express";
import { PrismaList } from "../connection";
const { CustomPrismaClient } = PrismaList();

export async function findChartAccount(Acct_Code: string, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.chart_account.findUnique({ where: { Acct_Code } });
}

export async function addChartAccount(data: any, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.chart_account.create({ data });
}

export async function updateChartAccount(data: any, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.chart_account.update({
    data,
    where: { Acct_Code: data.Acct_Code },
  });
}
export async function deleteChartAccount(data: any, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  return await prisma.chart_account.delete({
    where: { Acct_Code: data.Acct_Code },
  });
}

export async function getChartAccount(chartAccountSearch: string, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const qry = `
    SELECT 
    IF(a.IDNo = 0, 'NO', 'YES') AS IDNo,
    IF(a.SubAccnt = 0, 'NO', 'YES') AS SubAccnt,
    IF(a.Inactive = 0, 'NO', 'YES') AS Inactive,
    a.Acct_Code,
    a.Acct_Title,
    a.Short,
    a.Acct_Type,
    a.Account
    FROM
      chart_account a
    WHERE
        a.Acct_Code LIKE '%${chartAccountSearch}%'
        OR a.Acct_Title LIKE '%${chartAccountSearch}%'
        OR a.Short LIKE '%${chartAccountSearch}%'
    `
    console.log(qry)
  return await prisma.$queryRawUnsafe(qry);
}
