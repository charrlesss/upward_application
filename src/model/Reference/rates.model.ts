import { Request } from "express";
import { PrismaList } from "../connection";
const { CustomPrismaClient } = PrismaList();

interface RateType {
  Account: string;
  Line: string;
  Type: string;
  Rate: string;
}

export async function addRate(data: RateType, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.rates.create({ data });
}
export async function searchRate(
  mortgageeSearch: string,
  hasLimit: boolean = false,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  SELECT 
    a.ID,
    a.Account,
    a.Line,
    a.Type,
    a.Rate,
    (DATE_FORMAT(a.createdAt, '%Y-%m-%d')) as createdAt
  FROM
    rates a
    where
        a.ID like '%${mortgageeSearch}%'
        OR a.Account like '%${mortgageeSearch}%'
        OR a.Line like '%${mortgageeSearch}%'
        OR a.Type like '%${mortgageeSearch}%'
        OR a.Rate like '%${mortgageeSearch}%'
    ORDER BY a.Account asc
    limit 500
    `;
  return await prisma.$queryRawUnsafe(query);
}
export async function getPolicyAccounts(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = ` 
    SELECT 
        a.Account
    FROM
      policy_account a
    `;
  return await prisma.$queryRawUnsafe(query);
}
export async function getBonds(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = ` 
    SELECT 
        a.SublineName
    FROM
      subline a
    WHERE
    a.Line = 'Bonds';
    `;
  return await prisma.$queryRawUnsafe(query);
}
export async function getFire(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = ` 
      SELECT 
          a.SublineName
      FROM
        subline a
      WHERE
      a.Line = 'Fire';
      `;
  return await prisma.$queryRawUnsafe(query);
}
export async function updateRate(
  ID: string,
  Type: string,
  Rate: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.rates.update({ where: { ID }, data: { Type, Rate } });
}
export async function addRates(data: RateType, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  await prisma.rates.create({ data });
}
export async function deleteRate(ID: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  await prisma.rates.delete({ where: { ID } });
}
