import { Request } from "express";
import { PrismaList } from "../../connection";
import { clients_view } from "../../db/views";
const { CustomPrismaClient } = PrismaList();

export async function getPolicySummary(policyNo: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const qryString = clients_view();
  const query = `
      SELECT 
        a.PolicyNo,
        a.PolicyType,
        a.DateIssued,
        a.Account,
        b.Mortgagee,
        concat(d.lastname,' ',d.firstname) as agent_fullname,
        c.sale_officer,
        a.TotalDue,
        e.IDNo,
        e.ShortName,
        e.address,
        e.options,
        f.ShortName as subShortName,
        g.email,
        g.mobile,
        g.telephone
    FROM
      policy a
          LEFT JOIN
      vpolicy b ON a.PolicyNo = b.PolicyNo
      left join entry_client c on a.IDNo = c.entry_client_id 
      left join entry_agent d on a.AgentID = d.entry_agent_id 
      left join (${qryString}) e on a.IDNo = e.IDNo
      left join sub_account f on e.sub_account = f.Sub_Acct
      left join contact_details g on e.contact_details_id = g.contact_details_id
		WHERE 
		  a.PolicyNo = '${policyNo}'
        `;
  console.log(query);
  return await prisma.$queryRawUnsafe(query);
}
export async function getClientDetailsFromPolicy(
  clientId: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
  const qryString = clients_view();
  const query = `
          select 
            a.* ,
            b.ShortName as subShortName,
            b.Acronym,
            c.email,
            c.mobile,
            c.telephone
          from (${qryString}) a
          left join sub_account b on a.sub_account = b.Sub_Acct
          left join contact_details c on a.contact_details_id = c.contact_details_id
          where a.IDNo = '${clientId}'
        `;
  console.log(query);
  return await prisma.$queryRawUnsafe(query);
}
export async function getClients(
  search: string,
  hasLimit: boolean = false,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
        SELECT
        a.entry_client_id,
        a.address,
        IF(a.option = 'individual', concat(a.firstname,' ',a.middlename,' ',a.lastname), a.company) AS fullname,
        a.sale_officer,
        'Client' AS entry_type
        FROM
          entry_client a
        where
        a.entry_client_id like '%${search}%'
        OR a.firstname like '%${search}%'
        OR a.lastname like '%${search}%'
        OR a.company like '%${search}%'
        ORDER BY a.createdAt desc
        limit 50
        `;
  console.log(query);
  return await prisma.$queryRawUnsafe(query);
}

export async function getAgents(
  search: string,
  hasLimit: boolean = false,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
      SELECT
      a.entry_agent_id,
      concat(a.firstname,' ',a.middlename,' ',a.lastname) as fullname,
      'Agent' AS entry_type
      FROM
        entry_agent a
      where
      a.entry_agent_id like '%${search}%'
      OR a.firstname like '%${search}%'
      OR a.lastname like '%${search}%'
      ORDER BY a.createdAt desc
      limit 250
      `;
  return await prisma.$queryRawUnsafe(query);
}

export async function getPolicyAccount(type: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.policy_account.findMany({
    select: {
      Account: true,
    },
    where: {
      [type]: {
        equals: true,
      },
    },
  });
}

export async function policyAccounts(Line: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
    SELECT 
        MAX(Account) as Account 
    FROM
          rates
    WHERE
        Line = '${Line}'  
    GROUP BY Account
    ORDER BY Account asc

  `);
}
export async function policyTypes(Line: string, Account: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT 
      TYPE
    FROM
          rates
    WHERE
        Line = '${Line}' AND
        Account = '${Account}'
    GROUP BY TYPE
    ORDER BY TYPE asc
  `);
}

export async function getPolicyAccountType(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  select SubLineName from subline where line = 'Bonds'
  `);
}

export async function getPolicyAccountByBonds(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT Account ,G02, G13, G16 FROM  policy_account WHERE G16 = 1 OR G02 = 1 OR G13 =1 ORDER BY Account
  `);
}

export async function getPolicyAccounts(
  type: string,
  line: string,
  req: Request
) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(`
  SELECT 
    MAX(Account) as Account
  FROM
      rates
  WHERE
  Line = '${line}'
      AND SUBSTRING(type, 1, 3) = '${type}'
  group by Account
  ORDER BY Account asc
  `);
}

export async function getPolicyType(Line: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.subline.findMany({
    select: {
      SublineName: true,
    },
    where: {
      Line,
    },
  });
}

export async function getRates(type: string, Account: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  select distinct type from   rates where Line = 'Vehicle' and SUBSTRING(type,1,3) = '${type}' and Account = '${Account}'
`;
  console.log(query);
  return await prisma.$queryRawUnsafe(query);
}

export async function getSubAccount(req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const query = `
  SELECT a.Acronym FROM   sub_account a order by Acronym;`;
  return await prisma.$queryRawUnsafe(query);
}
export async function getMortgagee(type: string, req: Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const equals: any = {
    COM: "Comprehensive",
    TPL: "TPL",
    FIRE: "FIRE",
  };

  return await prisma.mortgagee.findMany({
    select: {
      Mortgagee: true,
    },
    where: {
      Policy: {
        equals: equals[type],
      },
    },
  });
}
