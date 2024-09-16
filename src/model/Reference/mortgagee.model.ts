import { PrismaClient } from "@prisma/client";
import { PrismaList } from "../connection";
import { Request } from "express";
const { CustomPrismaClient } = PrismaList();

interface MortgageeType {
  Mortgagee: string;
  Policy: string;
}

export async function findMortgagee(Mortgagee: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.mortgagee.findUnique({ where: { Mortgagee } });
}
export async function deleteMortgagee(Mortgagee: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.mortgagee.delete({ where: { Mortgagee } });
}
export async function addMortgagee(data: MortgageeType, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.mortgagee.create({ data });
}
export async function updateMortgagee(
  { Policy, Mortgagee }: MortgageeType,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.mortgagee.update({
    data: {
      Policy,
    },
    where: {
      Mortgagee,
    },
  });
}
export async function getMortgageePolicy(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query1 = `
    SELECT 
        a.Policy
    FROM
          mortgagee a
    GROUP BY a.Policy;
    `;
  return await prisma.$queryRawUnsafe(query1);
}
export async function searchMortgagee(
  mortgageeSearch: string,
  hasLimit: boolean = false,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query2 = `
    SELECT 
        a.Mortgagee,
        a.Policy,
        (DATE_FORMAT(a.createdAt, '%Y-%m-%d')) as createdAt
    FROM
          mortgagee a
        where 
            a.Mortgagee like '%${mortgageeSearch}%'
            OR a.Policy like '%${mortgageeSearch}%'
        ORDER BY a.Policy asc
        limit 500
    `;
  return await prisma.$queryRawUnsafe(query2);
}
