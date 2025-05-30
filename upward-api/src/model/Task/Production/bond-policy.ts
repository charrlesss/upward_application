import { Request } from "express";
import { PrismaList } from "../../connection";
import { prisma } from "../../../controller/index";

export async function getBondRate(account: string, type: string, req: Request) {
  const query = `
    SELECT * FROM rates WHERE
     Account = ? 
     AND Line = 'Bonds'
     AND Type = ?
      `;
  return await prisma.$queryRawUnsafe(query, account, type);
}

export async function createMarinePolicy(data: any, req: Request) {
  return await prisma.mpolicy.create({
    data,
  });
}

export async function createBondsPolicy(data: any, req: Request) {
  return await prisma.bpolicy.create({
    data: data,
  });
}

export async function searchBondsPolicy(search: string, req: Request) {
  const query = `
    select  
       a.Account,
      a.PolicyNo,
      c.ShortName as client_fullname,
      date_format(b.DateIssued,'%m/%d/%Y') as _DateIssued
    FROM bpolicy a
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
export async function searchSelectedBondsPolicy(policyNo: string) {
  const query = `
    select
        c.*,
        d.*,
        a.*,
        b.*,
        c.address as client_address
    FROM bpolicy a
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

export async function deleteBondsPolicy(
  PolicyType: string,
  PolicyNo: string,
  req: Request
) {
  const query = `
  delete from bpolicy 
  where 
   PolicyNo = ?
  `;
  return await prisma.$queryRawUnsafe(query, PolicyNo);
}

export async function deletePolicyFromBond(
  policyType: string,
  PolicyNo: string,
  req: Request
) {
  const query = `
  delete from policy 
  where 
  PolicyType in (SELECT SublineName FROM subline where Line = 'Bonds') and PolicyNo = ?
  `;
  return await prisma.$queryRawUnsafe(query, PolicyNo);
}

// SELECT SublineName FROM subline where Line = 'Bonds';
export async function deletePolicyFromBonds(policyNo: string, req: Request) {
  const query = `
  delete from policy 
  where  
  PolicyType = 'FIRE' and PolicyNo = ?
  `;
  return await prisma.$queryRawUnsafe(query, policyNo);
}

export async function getAllBondsType(req: Request) {
  return await prisma.$queryRawUnsafe(`
  SELECT SublineName FROM subline where Line = 'Bonds'
  `);
}

// export async function getAllAccount(,req: Request) {
//   let qry = "";
//   const d: any = await getAllBondsType();

//   return await prisma.$queryRawUnsafe(`
//   SELECT SublineName FROM subline where Line = 'Bonds'
//   `);
// }
