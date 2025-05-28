import { Request } from "express";
import { prisma } from "../../../controller/index";

export async function getMarineRate(
  account: string,
  line: string,
  req: Request
) {
  const query = `
    select Rate from rates 
    where 
    Account = ? 
    and Line = ? 
    `;
  console.log(query);
  return await prisma.$queryRawUnsafe(query, account, line);
}
export async function createMarinePolicy(data: any, req: Request) {
  return await prisma.mpolicy.create({
    data,
  });
}
export async function searchMarinePolicy(search: string, req: Request) {
  const query = `
select  a.Account,
      a.PolicyNo,
      c.ShortName as client_fullname,
      date_format(b.DateIssued,'%m/%d/%Y') as _DateIssued
     FROM mpolicy a
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
    a.PolicyNo like ? or
    c.ShortName like ? 
    order by b.DateIssued desc
    limit 100

    `;
  return await prisma.$queryRawUnsafe(query, `%${search}%`, `%${search}%`);
}
export async function createWords(data: any, req: Request) {
  return await prisma.words.create({
    data,
  });
}
export async function deleteWords(req: Request) {
  return await prisma.$queryRawUnsafe(`
    delete from words where Wordings = 'Mpolicy' and (SType = 1 OR SType = 0)
`);
}
export async function getWords(req: Request) {
  return await prisma.$queryRawUnsafe(`
    select * from words where Wordings = 'Mpolicy' and (SType = 1 OR SType = 0)
`);
}
export async function deleteMarinePolicy(PolicyNo: string, req: Request) {
  const query = `
  delete from mpolicy 
  where 
    PolicyNo = ?
  `;
  return await prisma.$queryRawUnsafe(query, PolicyNo);
}

export async function deletePolicyFromMarine(policyNo: string, req: Request) {
  const query = `
  delete from policy 
  where 
  PolicyType = 'MAR' and PolicyNo = ?
  `;
  return await prisma.$queryRawUnsafe(query, policyNo);
}
export async function getSearchMarinePolicySelected(policyNo: string) {
  const query = `
 select  
   a.*,
    b.*,
    c.*,
    d.*,
    c.address as client_address
     FROM mpolicy a
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
    a.PolicyNo = ?
  `;
  return await prisma.$queryRawUnsafe(query, policyNo);
}
