import { Request } from "express";
import { prisma } from "../../../controller/index";


export async function createPAPolicy(data: any, req: Request) {
  return await prisma.papolicy.create({ data });
}

export async function searchPAPolicySelected(policyNo: string) {
  const query = `
  select
       a.*,
    b.*,
    c.*,
    d.*,
    c.address as client_address
   FROM papolicy a
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
export async function searchPAPolicy(search: string) {
  const query = `
  select
      a.Account,
      a.PolicyNo,
      c.ShortName as client_fullname,
      date_format(b.DateIssued,'%m/%d/%Y') as _DateIssued
   FROM papolicy a
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
  a.PolicyNo like '%${search}%' OR
  c.ShortName like '%${search}%' 
  order by b.DateIssued desc
  limit 100
  `;
  return await prisma.$queryRawUnsafe(query);
}

export async function deletePAPolicy(PolicyNo: string, req: Request) {
  const query = `
  delete from papolicy 
  where 
   PolicyNo = '${PolicyNo}' 
  `;
  return await prisma.$queryRawUnsafe(query);
}
export async function findPAPolicy(PolicyNo: string, req: Request) {
  const query = `
  select *  from papolicy 
  where 
   PolicyNo = '${PolicyNo}' and TRIM(PolicyType) = 'PA'
  `;
  return await prisma.$queryRawUnsafe(query);
}

export async function deletePolicyByPAPolicy(PolicyNo: string, req: Request) {
  const query = `
  delete from policy 
  where 
   PolicyNo = '${PolicyNo}'
  `;
  return await prisma.$queryRawUnsafe(query);
}
