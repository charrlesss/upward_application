import { Request } from "express";
import { PrismaList } from "../../connection";
const { CustomPrismaClient } = PrismaList();

export async function createCGLPolicy(data: any, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.cglpolicy.create({ data });
}

export async function searchCGLPolicy(search: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
      select a.*,b.*, 
        if(c.company = '', concat(c.firstname,', ',c.middlename,', ',c.lastname) , c.company) as client_fullname,
        concat(d.firstname,', ',d.middlename,', ',d.lastname) as agent_fullname,
        c.address,
        format(a.sumInsured,2) as sumInsured,
        a.address  as cgl_address,
        c.sale_officer,
        date_format(b.DateIssued , '%m/%d/%Y') as DateIssued
        FROM cglpolicy a
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

export async function deleteCGLPolicy(PolicyNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    delete from cglpolicy 
    where 
     PolicyNo = '${PolicyNo}' 
    `;
  return await prisma.$queryRawUnsafe(query);
}

export async function deletePolicyByCGL(PolicyNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
    delete from policy 
    where 
    PolicyNo = '${PolicyNo}' and TRIM(PolicyType) = 'CGL'
    `;
  return await prisma.$queryRawUnsafe(query);
}
