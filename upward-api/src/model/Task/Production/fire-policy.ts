import { Request } from "express";
import { prisma } from "../../../controller/index";

export async function getRateType(Line: string, req: Request) {
  return await prisma.$queryRawUnsafe(
    `
    select Type from rates a where  a.Line = ? group by TYPE
  `,
    Line
  );
}

export async function createFirePolicy(
  {
    PolicyNo,
    Account,
    BillNo,
    DateFrom,
    DateTo,
    Location,
    PropertyInsured,
    Constraction,
    Occupancy,
    Boundaries,
    Mortgage,
    Warranties,
    InsuredValue,
    Percentage,
  }: any,
  req: Request
) {
  return await prisma.fpolicy.create({
    data: {
      PolicyNo,
      Account,
      BillNo,
      DateFrom,
      DateTo,
      Location,
      PropertyInsured,
      Constraction,
      Occupancy,
      Boundaries,
      Mortgage,
      Warranties,
      InsuredValue,
      Percentage,
    },
  });
}

export async function searchFirePolicy(search: string, req: Request) {
  const query = `
  select 
      a.Account,
      a.PolicyNo,
      c.ShortName as client_fullname,
      date_format(b.DateIssued,'%m/%d/%Y') as _DateIssued
   FROM fpolicy a
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
  )  c on b.IDNo = c.IDNo
  left join entry_agent d on b.AgentID = d.entry_agent_id
  where 
  a.PolicyNo like ? or
  c.ShortName like ? 
  order by b.DateIssued desc
  limit 100
  `;
  return await prisma.$queryRawUnsafe(query,`%${search}%`,`%${search}%`);
}

export async function searchFirePolicySelected(policyNo: string) {
  const query = `
  select 
    c.*,
    d.*,
    a.*,
    b.*,
   
    c.address as client_address
   FROM fpolicy a
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
    )  c on b.IDNo = c.IDNo
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
  return await prisma.$queryRawUnsafe(query,policyNo);
}

export async function deleteFirePolicy(policyNo: string, req: Request) {
  const query = `
  delete from fpolicy 
  where 
   PolicyNo = ?
  `;
  return await prisma.$queryRawUnsafe(query,policyNo);
}

export async function deletePolicyFromFire(policyNo: string, req: Request) {
  const query = `
  delete from policy 
  where 
  PolicyType = 'FIRE' and PolicyNo = ?
  `;
  return await prisma.$queryRawUnsafe(query,policyNo);
}
