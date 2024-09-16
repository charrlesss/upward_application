import { Request } from "express";
import { PrismaList } from "../../connection";
const { CustomPrismaClient } = PrismaList();

export async function getMarineRate(account: string, line: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    select Rate from Rates 
    where 
    Account = '${account}' 
    and Line = '${line}' 
    `;
  return await prisma.$queryRawUnsafe(query);
}
export async function createMarinePolicy(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.mpolicy.create({
    data,
  });
}
export async function searchMarinePolicy(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    select a.*,b.*, 
    if(c.company = '', concat(c.firstname,', ',c.middlename,', ',c.lastname) , c.company) as client_fullname,
    concat(d.firstname,', ',d.middlename,', ',d.lastname) as agent_fullname,
    c.address,
    c.sale_officer,
    date_format(b.DateIssued,'%m/%d/%Y') as _DateIssued
     FROM mpolicy a
    left join policy b
    on a.PolicyNo = b.PolicyNo 
    left join entry_client c on b.IDNo = c.entry_client_id
    left join entry_agent d on b.AgentID = d.entry_agent_id
    where 
    a.PolicyNo like '%${search}%' or
    c.firstname like '%${search}%' or
    c.lastname like '%${search}%' or
    c.middlename like '%${search}%' 
    order by b.DateIssued desc
    limit 100
    `;
  return await prisma.$queryRawUnsafe(query);
}
export async function createWords(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.words.create({
    data,
  });
}
export async function deleteWords(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    delete from words where Wordings = 'Mpolicy' and (SType = 1 OR SType = 0)
`);
}
export async function getWords(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    select * from words where Wordings = 'Mpolicy' and (SType = 1 OR SType = 0)
`);
}
export async function deleteMarinePolicy(PolicyNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.mpolicy.delete({
    where: {
      PolicyNo,
    },
  });
}

export async function deletePolicyFromMarine(policyNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  delete from policy 
  where 
  PolicyType = 'MAR' and PolicyNo = '${policyNo}'
  `;
  return await prisma.$queryRawUnsafe(query);
}
