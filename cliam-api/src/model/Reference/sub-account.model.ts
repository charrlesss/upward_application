import { Request } from "express";
import { prisma } from "../../controller/index";

interface SubAccountType {
  Acronym: string;
  ShortName: string;
  Description: string;
}
export async function createSubAccount(data: SubAccountType, req: Request) {
  return await prisma.sub_account.create({ data });
}
export async function updateSubAccount(
  data: SubAccountType,
  Sub_Acct: string,
  req: Request
) {
  return await prisma.sub_account.update({ data, where: { Sub_Acct } });
}
export async function deleteSubAccount(Sub_Acct: string, req: Request) {
  return await prisma.sub_account.delete({ where: { Sub_Acct } });
}

export async function searchSubAccount(search: string) {
  const query = ` 
  SELECT 
    a.Sub_Acct,
    a.Acronym,
    a.ShortName,
    a.Description,
    (DATE_FORMAT(a.createdAt, '%Y-%m-%d')) as createdAt
  FROM
    sub_account a
  where 
  a.Acronym like '%${search}%'
  OR a.ShortName like '%${search}%'
  OR a.Description like '%${search}%'
  ORDER BY a.createdAt desc  limit 500
`;

  return await prisma.$queryRawUnsafe(query);
}
