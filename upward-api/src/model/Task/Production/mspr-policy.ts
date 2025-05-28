import { Request } from "express";
import { PrismaList } from "../../connection";
import { prisma } from "../../../controller/index";

export async function getMSPRRate(Account: string, Line: string, req: Request) {
  const query = `select * from rates where trim(Account)= ? AND  Line = ?`;
  console.log(query);
  return await prisma.$queryRawUnsafe(query, Account.trim(), Line);
}
export async function createMSPRPolicy(data: any, req: Request) {
  return await prisma.msprpolicy.create({ data });
}

export async function searchMsprPolicy(search: string) {
  const query = `
select 
      a.Account,
          a.PolicyNo,
          c.ShortName as client_fullname,
          date_format(b.DateIssued,'%m/%d/%Y') as _DateIssued
     FROM msprpolicy a
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

export async function searchSelectedMsprPolicy(policyNo: string) {
  const query = `
select 
        a.*,
      b.*,
      c.*,
      d.*,
      c.address as client_address
     FROM msprpolicy a
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

export async function deleteMsprPolicy(PolicyNo: string, req: Request) {
  const query = `
  delete from msprpolicy 
  where 
  PolicyNo = ?
  `;
  return await prisma.$queryRawUnsafe(query, PolicyNo);
}

export async function deletePolicyFromMspr(policyNo: string, req: Request) {
  const query = `
  delete from policy 
  where 
  PolicyType = 'MSPR' and PolicyNo = ?
  `;
  return await prisma.$queryRawUnsafe(query, policyNo);
}
