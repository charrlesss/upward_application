
import { Request } from "express";
import { prisma } from "../../controller/index";


interface MortgageeType {
  Mortgagee: string;
  Policy: string;
}

export async function findMortgagee(Mortgagee: string, req: Request) {

  return await prisma.mortgagee.findUnique({ where: { Mortgagee } });
}
export async function deleteMortgagee(Mortgagee: string, req: Request) {

  return await prisma.mortgagee.delete({ where: { Mortgagee } });
}
export async function addMortgagee(data: MortgageeType, req: Request) {

  return await prisma.mortgagee.create({ data });
}
export async function updateMortgagee(
  { Policy, Mortgagee }: MortgageeType,
  req: Request
) {

  return await prisma.mortgagee.update({
    data: {
      Policy,
    },
    where: {
      Mortgagee,
    },
  });
}
export async function getMortgageePolicy() {

  const query1 = `
    SELECT 
        a.Policy
    FROM
          mortgagee a
    GROUP BY a.Policy;
    `;
  return await prisma.$queryRawUnsafe(query1);
}
export async function getMortgagee() {

  const query1 = `
    SELECT 
        a.Mortgagee
    FROM
          Mortgagee a
    `;
  return await prisma.$queryRawUnsafe(query1);
}
export async function searchMortgagee(
  mortgageeSearch: string,
) {

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
