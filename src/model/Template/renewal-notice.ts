import { TemplateRenewalNotice } from "../db/stored-procedured";
import { PrismaList } from "../connection";
const { CustomPrismaClient } = PrismaList();

export async function getClients(search: string) {
  const query = `
  SELECT 
    Policy.PolicyNo,
    client.Shortname AS Shortname,
    Policy.PolicyType AS PolicyType
FROM
    (SELECT 
        *
    FROM
        Policy
    WHERE
        Policy.PolicyType <> 'TPL' AND 
        Policy.PolicyType <> 'G02' AND
        Policy.PolicyType <> 'G13' AND
        Policy.PolicyType <> 'G16' AND
        Policy.PolicyType <> 'MSPR') AS Policy
        LEFT JOIN
    (SELECT 
        *
    FROM
        VPolicy
    WHERE
        VPolicy.PolicyType <> 'TPL') AS VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo
        LEFT JOIN
    MPolicy ON Policy.PolicyNo = MPolicy.PolicyNo
        LEFT JOIN
    PAPolicy ON Policy.PolicyNo = PAPolicy.PolicyNo
        LEFT JOIN
    CGLPolicy ON Policy.PolicyNo = CGLPolicy.PolicyNo
        LEFT JOIN
    FPolicy ON Policy.PolicyNo = FPolicy.PolicyNo
        LEFT JOIN
    (SELECT 
            aa.entry_client_id AS IDNo,
            aa.sub_account,
            if(aa.company = '', CONCAT(aa.lastname, ',', aa.firstname), aa.company) as Shortname
    FROM
        entry_client aa UNION ALL SELECT 
            aa.entry_agent_id AS IDNo,
            NULL AS sub_account,
            CONCAT(aa.lastname, ',', aa.firstname) AS Shortname
    FROM
        entry_agent aa UNION ALL SELECT 
            aa.entry_employee_id AS IDNo,
            aa.sub_account,
            CONCAT(aa.lastname, ',', aa.firstname) AS Shortname
    FROM
        entry_employee aa UNION ALL SELECT 
            aa.entry_supplier_id AS IDNo,
            NULL AS sub_account,
            if(aa.company = '', CONCAT(aa.lastname, ',', aa.firstname), aa.company) as Shortname
    FROM
        entry_supplier aa UNION ALL SELECT 
            aa.entry_fixed_assets_id AS IDNo,
            NULL AS sub_account,
            aa.fullname AS Shortname
    FROM
        entry_fixed_assets aa UNION ALL SELECT 
            aa.entry_others_id AS IDNo,
            NULL AS sub_account,
            aa.description AS Shortname
    FROM
        entry_others aa) client ON Policy.IDNo = client.IDNo
WHERE
        Policy.PolicyNo LIKE '%${search}%'
        OR client.Shortname LIKE '%${search}%'
        OR Policy.PolicyType LIKE '%${search}%'
LIMIT 500
    `;
  const prisma = CustomPrismaClient("UMIS");

  return await prisma.$queryRawUnsafe(query);
}

export async function getSelectedClient(policyType: string, policyNo: string) {
  const prisma = CustomPrismaClient("UMIS");

  const query = TemplateRenewalNotice(policyType, policyNo);

  console.log(query);
  return await prisma.$queryRawUnsafe(query);
}
