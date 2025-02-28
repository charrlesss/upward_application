import { Request } from "express";
import { prisma } from "../../../controller/index";


export async function createCGLPolicy(data: any, req: Request) {

  return await prisma.cglpolicy.create({ data });
}

export async function searchCGLPolicySelected(policyNo: string) {

  const query = `
     select 
       
          c.*,
          d.*,
          a.*,
          b.*,
          c.address as client_address
       
        FROM cglpolicy a
        left join policy b
        on a.PolicyNo = b.PolicyNo 
        left join (
			 SELECT 
            IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
              aa.entry_client_id AS IDNo,
              aa.sub_account,
                    aa.address,
                    aa.sale_officer
          FROM
            entry_client aa
        ) c on b.IDNo = c.IDNo
         left join (
        SELECT 
          a.entry_agent_id AS agentIDNo,
        CONCAT(IF(a.lastname <> ''
                              AND a.lastname IS NOT NULL,
                          CONCAT(a.lastname, ', '),
                          ''),
                      a.firstname) AS agentName,
          'Client' AS IDType
      FROM
          entry_agent  a
    ) d on b.AgentID = d.agentIDNo
    where 
    a.PolicyNo = '${policyNo}'
      `;
  return await prisma.$queryRawUnsafe(query);
}
export async function searchCGLPolicy(search: string) {

  const query = `
     select 
          a.Account,
          a.PolicyNo,
          c.ShortName as client_fullname,
          date_format(b.DateIssued,'%m/%d/%Y') as _DateIssued
        FROM cglpolicy a
        left join policy b
        on a.PolicyNo = b.PolicyNo 
        left join (
			 SELECT 
            IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
              aa.entry_client_id AS IDNo,
              aa.sub_account,
                    aa.address,
                    aa.sale_officer
          FROM
            entry_client aa
        ) c on b.IDNo = c.IDNo
        left join entry_agent d on b.AgentID = d.entry_agent_id
      where 
        a.PolicyNo like '%${search}%' or
        c.ShortName like '%${search}%' 
        order by b.DateIssued desc
      limit 100
      `;
  return await prisma.$queryRawUnsafe(query);
}


export async function deleteCGLPolicy(PolicyNo: string, req: Request) {

  const query = `
    delete from cglpolicy 
    where 
     PolicyNo = '${PolicyNo}' 
    `;
  return await prisma.$queryRawUnsafe(query);
}

export async function deletePolicyByCGL(PolicyNo: string, req: Request) {

  const query = `
    delete from policy 
    where 
    PolicyNo = '${PolicyNo}' and TRIM(PolicyType) = 'CGL'
    `;
  return await prisma.$queryRawUnsafe(query);
}
