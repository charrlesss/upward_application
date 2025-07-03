import { Request } from "express";
import { prisma } from "../../controller/index";

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

export async function checkedAccountIsExisting(AccountCode: any) {

  return await prisma.$queryRawUnsafe(
    `select * from policy_account where AccountCode = ?`, AccountCode
  );
}

export async function createPolicyAccount(
  policyAccount: PolicyAccountType,
  req: Request
) {
  return await prisma.policy_account.create({ data: policyAccount });
}

export async function searchPolicy(
  policySearch: string,
  hasLimit: boolean = false
) {
  const query = ` 
  SELECT 
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
    a.PA,
    a.CGL,
    a.Inactive,
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
  data:any
) {
  const qry = `
  UPDATE \`policy_account\`
  SET
  \`Account\` = ?,
  \`Description\` = ?,
  \`AccountCode\` = ?,
  \`COM\` = ?,
  \`TPL\` = ?,
  \`MAR\` = ?,
  \`FIRE\` = ?,
  \`G02\` = ?,
  \`G13\` = ?,
  \`G16\` = ?,
  \`MSPR\` = ?,
  \`PA\` = ?,
  \`CGL\` = ?,
  \`Inactive\` = ?
  WHERE \`AccountCode\` = ?;
  
  `;
    return await prisma.$queryRawUnsafe(
      qry,
      data.Account,
      data.Description,
      data.AccountCode,
      data.COM,
      data.TPL,
      data.MAR,
      data.FIRE,
      data.G02,
      data.G13,
      data.G16,
      data.MSPR,
      data.PA,
      data.CGL,
      data.Inactive,
      data.AccountCode
    );
}
export async function deletePolicyAccount(Account: string, req: Request) {
  console.log(`delete from policy_account where Account='${Account}'`);
  return await prisma.$queryRawUnsafe(
    `delete from policy_account where AccountCode='${Account}'`
  );
}
