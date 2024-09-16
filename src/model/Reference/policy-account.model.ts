import { Request } from "express";
import { PrismaList } from "../connection";
const { CustomPrismaClient } = PrismaList();

interface PolicyAccountType {
  Account: string;
  Description: string;
  AccountCode: string;
  COM: boolean;
  TPL: boolean;
  MAR: boolean;
  FIRE: boolean;
  G02: boolean;
  G13: boolean;
  G16: boolean;
  MSPR: boolean;
  PA: boolean;
  CGL: boolean;
  Inactive: boolean;
}

export async function checkedAccountIsExisting(Account: string,req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.policy_account.findUnique({ where: { Account } });
}

export async function createPolicyAccount(policyAccount: PolicyAccountType,req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.policy_account.create({ data: policyAccount });
}

export async function searchPolicy(
  policySearch: string,
  hasLimit: boolean = false
,req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = ` SELECT 
  a.Account,
  a.Description,
  a.AccountCode,
  a.COM,
  a.TPL,
  a.MAR,
  a.FIRE,
  a.G02,
  a.G13,
  a.G16,
  a.MSPR,
  a.CGL,
  (DATE_FORMAT(a.createdAt, '%Y-%m-%d')) as createdAt
FROM
  policy_account a
where 
a.Account like '%${policySearch}%'
OR a.Description like '%${policySearch}%'
OR a.AccountCode like '%${policySearch}%'
ORDER BY a.createdAt desc 
${hasLimit ? "" : "limit 500"}`;
  return await prisma.$queryRawUnsafe(query);
}

export async function updatePolicyAccount(
  policyAccount: PolicyAccountType,
  Account: string
,req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.policy_account.update({
    data: policyAccount,
    where: { Account },
  });
}
export async function deletePolicyAccount(Account: string,req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.policy_account.delete({
    where: { Account },
  });
}
