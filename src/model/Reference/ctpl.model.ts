import { Request } from "express";
import { PrismaList } from "../connection";
const { CustomPrismaClient } = PrismaList();

interface CTPLType {
  Prefix: string;
  Type: string;
  NumSeriesFrom: string;
  NumSeriesTo: string;
  Cost: string;
  CreatedBy: string;
  ctplId: any;
}

export async function searchCTPL(
  ctplSearch: string,
  hasLimit: boolean = false,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
      SELECT 
          a.ctplId,
          a.Prefix,
          a.ctplType,
          a.NumSeriesFrom,
          a.CreatedBy,
          CAST( a.Cost AS DECIMAL(10, 2)) as Cost,
          a.NumSeriesTo,
          (DATE_FORMAT(a.createdAt, '%Y-%m-%d')) as createdAt
      FROM
            ctplregistration a
          where 
          a.Prefix like '%${ctplSearch}%'
          OR  a.Cost like '%${ctplSearch}%'
          OR  a.NumSeriesFrom like '%${ctplSearch}%'
          OR  a.NumSeriesTo like '%${ctplSearch}%'
          ORDER BY a.Prefix asc
          limit 100
      `;
  const data = await prisma.$queryRawUnsafe(query);

  const convertCostToFixed = (data: any) => {
    return data.map((item: any) => ({
      ...item,
      Cost: parseFloat(item.Cost).toFixed(2),
    }));
  };

  return convertCostToFixed(data);
}
export async function getPrefix(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.ctplprefix.findMany({ select: { prefixName: true } });
}
export async function getType(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.ctpltype.findMany({ select: { typeName: true } });
}
export async function addCTPL(data: CTPLType, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.ctplregistration.create({ data });
}
export async function updateCTPL(data: CTPLType, ctplId: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.ctplregistration.update({
    data: {
      Prefix: data.Prefix,
      Cost: data.Cost,
    },
    where: { ctplId },
  });
}
export async function deleteCTPL(ctplId: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.ctplregistration.delete({ where: { ctplId } });
}

export async function findCtplById(ctplId: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.ctplregistration.findUnique({ where: { ctplId } });
}
export async function findCtplfExist(
  where: {
    Prefix: string;
    NumSeriesFrom: string;
    NumSeriesTo: string;
  },
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
      SELECT 
        *
    FROM
          ctplregistration a
    WHERE
    a.Prefix = '${where.Prefix}'
        AND a.NumSeriesFrom = '${where.NumSeriesFrom}'
        AND a.NumSeriesTo = '${where.NumSeriesTo}'`);
}
