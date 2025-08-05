import express from "express";
import { prisma } from "../..";
import path from "path";
import { format } from "date-fns";
import { selectClient } from "../../../model/Task/Accounting/pdc.model";
import { formatNumber } from "../Accounting/collection";
import PDFReportGenerator from "../../../lib/pdf-generator";

const StatementOfAccount = express.Router();

StatementOfAccount.post("/soa/search-by-policy", async (req, res) => {
  const data = await prisma.$queryRawUnsafe(
    `
SELECT 
    a.PolicyType,
    a.PolicyNo,
    DATE_FORMAT(a.DateIssued, '%m/%d/%Y') AS DateIssued,
    c.IDNo,
    c.Shortname,
    b.used,
    format(d.Debit, 2) AS totalDue,
    format(d.Credit, 2) AS payment,
    format((d.Debit - d.Credit), 2) balance
FROM
    policy a
        LEFT JOIN
    (SELECT 
        IF(policy_no IS NULL, 'No', 'Yes') AS used, policy_no
    FROM
        soa_policy
    GROUP BY policy_no) b ON a.PolicyNo = b.policy_no
        LEFT JOIN
    (SELECT 
        'Client' AS IDType,
            aa.entry_client_id AS IDNo,
            aa.sub_account,
            IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS Shortname,
            aa.entry_client_id AS client_id,
            aa.address
    FROM
        entry_client aa UNION ALL SELECT 
        'Agent' AS IDType,
            aa.entry_agent_id AS IDNo,
            aa.sub_account,
            CONCAT(IF(aa.lastname IS NOT NULL
                AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS Shortname,
            aa.entry_agent_id AS client_id,
            aa.address
    FROM
        entry_agent aa UNION ALL SELECT 
        'Employee' AS IDType,
            aa.entry_employee_id AS IDNo,
            aa.sub_account,
            CONCAT(IF(aa.lastname IS NOT NULL
                AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS Shortname,
            aa.entry_employee_id AS client_id,
            aa.address
    FROM
        entry_employee aa UNION ALL SELECT 
        'Supplier' AS IDType,
            aa.entry_supplier_id AS IDNo,
            aa.sub_account,
            IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS Shortname,
            aa.entry_supplier_id AS client_id,
            aa.address
    FROM
        entry_supplier aa UNION ALL SELECT 
        'Fixed Assets' AS IDType,
            aa.entry_fixed_assets_id AS IDNo,
            aa.sub_account,
            aa.fullname AS Shortname,
            aa.entry_fixed_assets_id AS client_id,
            aa.description AS address
    FROM
        entry_fixed_assets aa UNION ALL SELECT 
        'Others' AS IDType,
            aa.entry_others_id AS IDNo,
            aa.sub_account,
            aa.description AS Shortname,
            aa.entry_others_id AS client_id,
            aa.description AS address
    FROM
        entry_others aa) c ON a.IDNo = c.IDNo
        LEFT JOIN
    (SELECT 
        SUM(journal.Debit) AS Debit,
            SUM(journal.Credit) AS Credit,
            journal.ID_No
    FROM
        journal
    WHERE
        journal.Date_Entry
            AND journal.Source_Type NOT IN ('BF' , 'BFD', 'BFS')
            AND journal.GL_Acct = '1.03.01'
    GROUP BY journal.ID_No) d ON a.IDNo = d.ID_No or a.PolicyNo  = d.ID_No
    where 
     (
        a.PolicyNo like ? 
        OR  c.IDNo like ?   
        OR c.Shortname like ?  
    )
     order by a.DateIssued desc
     limit 500

  `,
    `%${req.body.search}%`,
    `%${req.body.search}%`,
    `%${req.body.search}%`
  );
  try {
    res.send({
      message: "Successfully Policy Details",
      success: true,
      data,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});
StatementOfAccount.post("/soa/search-by-client", async (req, res) => {
  const data = await prisma.$queryRawUnsafe(
    `
   SELECT 
    address, IDNo, Shortname
  FROM
      (
   SELECT 
        "Client" as IDType,
        aa.entry_client_id AS IDNo,
        aa.sub_account,
        if(aa.option = "individual", CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''),aa.firstname), aa.company) as Shortname,
        aa.entry_client_id as client_id,
        aa.address 
      FROM
        entry_client aa
      union all
  SELECT 
          'Agent' AS IDType,
              aa.entry_agent_id AS IDNo,
              aa.sub_account,
              CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS Shortname,
              aa.entry_agent_id AS client_id,
              aa.address
      FROM
          entry_agent aa UNION ALL SELECT 
          'Employee' AS IDType,
              aa.entry_employee_id AS IDNo,
              aa.sub_account,
              CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS Shortname,
              aa.entry_employee_id AS client_id,
              aa.address
      FROM
          entry_employee aa UNION ALL SELECT 
          'Supplier' AS IDType,
              aa.entry_supplier_id AS IDNo,
              aa.sub_account,
              IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                  AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS Shortname,
              aa.entry_supplier_id AS client_id,
              aa.address
      FROM
          entry_supplier aa UNION ALL SELECT 
          'Fixed Assets' AS IDType,
              aa.entry_fixed_assets_id AS IDNo,
              aa.sub_account,
              aa.fullname AS Shortname,
              aa.entry_fixed_assets_id AS client_id,
              aa.description AS address
      FROM
          entry_fixed_assets aa UNION ALL SELECT 
          'Others' AS IDType,
              aa.entry_others_id AS IDNo,
              aa.sub_account,
              aa.description AS Shortname,
              aa.entry_others_id AS client_id,
              aa.description AS address
      FROM
          entry_others aa) a
  WHERE
      a.Shortname LIKE  ?
      OR a.IDNo LIKE    ?
      OR a.address LIKE ?
  `,
    `%${req.body.search}%`,
    `%${req.body.search}%`,
    `%${req.body.search}%`
  );
  try {
    res.send({
      message: "Successfully Policy Details",
      success: true,
      data,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});
StatementOfAccount.post("/soa/generate-reference", async (req, res) => {
  const qry = `
    SELECT
    IF(
      ref.reference_no IS NULL,
      CONCAT(DATE_FORMAT(CURDATE(), '%m%y'), '-000001'),
      CONCAT(
        DATE_FORMAT(CURDATE(), '%m%y'), '-',
        LPAD(CAST(SUBSTRING_INDEX(ref.reference_no, '-', -1) AS UNSIGNED) + 1, 6, '0')
      )
    ) AS reference_no
  FROM (
    SELECT reference_no
    FROM soa
    ORDER BY reference_no DESC
    LIMIT 1
  ) AS ref
  RIGHT JOIN (SELECT 1) AS dummy ON TRUE;
  `;
  try {
    res.send({
      message: "Successfully Policy Details",
      success: true,
      reference_no: await prisma.$queryRawUnsafe(qry),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      reference_no: [],
    });
  }
});
StatementOfAccount.post("/soa/save", async (req, res) => {
  console.log(req.body);
  await prisma.soa.create({
    data: {
      reference_no: req.body.reference_no,
      idno: req.body.idno,
      name: req.body.name,
      address: req.body.address,
      attachment: req.body.attachment,
    },
  });

  for (const itm of req.body.tableData) {
    await prisma.soa_policy.create({
      data: {
        reference_no: req.body.reference_no,
        policy_no: itm.PolicyNo,
      },
    });
  }

  try {
    res.send({
      message: "Successfully Policy Details",
      success: true,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
StatementOfAccount.post("/soa/search-soa", async (req, res) => {
  const data = await prisma.$queryRawUnsafe(
    `SELECT reference_no,name FROM soa where 
    reference_no like ? OR name like ?`,
    `%${req.body.search}%`,
    `%${req.body.search}%`
  );

  try {
    res.send({
      message: "Successfully Policy Details",
      success: true,
      data,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});
StatementOfAccount.post("/soa/search-soa-selected", async (req, res) => {
  const state = await prisma.$queryRawUnsafe(
    `SELECT * FROM soa where reference_no = ?;`,
    req.body.reference_no
  );
  const data = await prisma.$queryRawUnsafe(
    ` SELECT 
          b.PolicyType,
          b.PolicyNo,
          date_format(b.DateIssued,'%m/%d/%Y') as DateIssued,
          c.IDNo,
          c.Shortname
      FROM soa_policy a
      left join policy b on a.policy_no = b.PolicyNo
      left join (
      SELECT 
        "Client" as IDType,
        aa.entry_client_id AS IDNo,
        aa.sub_account,
        if(aa.option = "individual", CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''),aa.firstname), aa.company) as Shortname,
        aa.entry_client_id as client_id,
        aa.address 
      FROM
        entry_client aa
      union all
      SELECT 
        "Agent" as IDType,
        aa.entry_agent_id AS IDNo,
        aa.sub_account,
        CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname, ', '),''), aa.firstname) AS Shortname,
        aa.entry_agent_id as client_id,
        aa.address
      FROM 
        entry_agent aa
      union all
      SELECT 
        "Employee" as IDType,
        aa.entry_employee_id AS IDNo,
        aa.sub_account,
        CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname , ', '),''), aa.firstname) AS Shortname,
        aa.entry_employee_id as client_id,
        aa.address  
      FROM
        entry_employee aa
      union all
      SELECT 
        "Supplier" as IDType,
        aa.entry_supplier_id AS IDNo,
        aa.sub_account,
        if(aa.option = "individual", CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname, ', '),''),aa.firstname), aa.company) as Shortname,
        aa.entry_supplier_id as client_id,
        aa.address
      FROM
        entry_supplier aa
      union all
      SELECT 
        "Fixed Assets" as IDType,
        aa.entry_fixed_assets_id AS IDNo,
        aa.sub_account,
        aa.fullname AS Shortname,
        aa.entry_fixed_assets_id as client_id,
        aa.description as address
      FROM
        entry_fixed_assets aa
      union all
      SELECT 
        "Others" as IDType,
        aa.entry_others_id AS IDNo,
        aa.sub_account,
        aa.description AS Shortname,
        aa.entry_others_id as client_id,
        aa.description as address
      FROM
        entry_others aa
      )  c on c.IDNo = b.IDNo
where a.reference_no = ?;`,
    req.body.reference_no
  );

  try {
    res.send({
      message: "Successfully Policy Details",
      success: true,
      data,
      state,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
      state: [],
    });
  }
});
StatementOfAccount.post("/soa/search-soa-by-policy", async (req, res) => {
  const data = await prisma.$queryRawUnsafe(
    `SELECT reference_no, policy_no FROM soa_policy where policy_no like ?;`,
    `%${req.body.search}%`
  );
  console.log(data);

  try {
    res.send({
      message: "Successfully Policy Details",
      success: true,
      data,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});
StatementOfAccount.post("/soa/search-endorsement", async (req, res) => {
  const data = await prisma.$queryRawUnsafe(
    `SELECT * FROM gpa_endorsement where policyNo like ?;`,
    `%${req.body.search}%`
  );

  const r = `
  
   SELECT 
    a.*,
    format(b.Debit,2) as totalDue,
    format(b.Credit , 2) as Payment,
    format((b.Debit - b.Credit) , 2) as Balance
FROM
    policy a
left join (
SELECT 
    SUM(journal.Debit) AS Debit,
    SUM(journal.Credit) AS Credit,
    journal.ID_No
FROM
    journal
WHERE
    journal.Source_Type NOT IN ('BF' , 'BFD', 'BFS')
        AND journal.GL_Acct = '1.03.01'
        group by journal.ID_No
) b on a.PolicyNo = b.ID_No
where (b.Debit - b.Credit) > 0
  `;

  try {
    res.send({
      message: "Successfully Policy Details",
      success: true,
      data,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});
StatementOfAccount.post("/soa/print", async (req, res) => {
  const qry = (policytablename: string, policies: string) => `
  SELECT * FROM ${policytablename} a 
  left join policy b on a.PolicyNo = b.PolicyNo
  left join (${selectClient}) c on b.IDNo = c.IDNo
  where a.PolicyNo in ('${policies}') ;`;
  const data: Array<any> = [];

  // const careOf: Array<any> = await prisma.$queryRawUnsafe(
  //   `
  //   SELECT
  //     careOf, address
  //   FROM
  //       careof
  //   WHERE
  //       careOf = ? AND inactive = 0;`,
  //   req.body.careOf
  // );

  for (const itm of req.body.data) {
    if (itm.Type === "COM") {
      const COMDATA = (await prisma.$queryRawUnsafe(
        qry("vpolicy", itm.data.join("','"))
      )) as Array<any>;

      if (COMDATA.length > 0) {
        data.push({
          PolicyNo: "COMPREHENSIVE",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          header: true,
        });
        for (const itm of COMDATA) {
          const newData: Array<any> = [
            {
              PolicyNo: itm.PolicyNo,
              Insured: itm.Shortname,
              Premium: formatNumber(
                parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
              ),
              From: format(new Date(itm.DateFrom), "MM/dd/yyyy"),
              To: format(new Date(itm.DateTo), "MM/dd/yyyy"),
              GrossPremium: formatNumber(
                parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
              ),
              solo: false,
            },
            {
              PolicyNo: "",
              Insured: `${itm.Model} ${itm.Make} ${itm.BodyType}`,
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              solo: true,
            },
            {
              PolicyNo: "",
              Insured: itm.PlateNo,
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              solo: true,
            },
            {
              PolicyNo: "",
              Insured: itm.ChassisNo,
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              solo: true,
            },
            {
              PolicyNo: "",
              Insured: "",
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              gapPerRow: true,
            },
          ];
          data.push(...newData);
        }
        data.push({
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gap: true,
        });
      }
    } else if (itm.Type === "FIRE") {
      const FIREDATA = (await prisma.$queryRawUnsafe(
        qry("fpolicy", itm.data.join("','"))
      )) as Array<any>;
      if (FIREDATA.length > 0) {
        data.push({
          PolicyNo: "FIRE",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          header: true,
        });
        for (const itm of FIREDATA) {
          const newData: Array<any> = [
            {
              PolicyNo: itm.PolicyNo,
              Insured: itm.Shortname,
              Premium: formatNumber(
                parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
              ),
              From: format(new Date(itm.DateFrom), "MM/dd/yyyy"),
              To: format(new Date(itm.DateTo), "MM/dd/yyyy"),
              GrossPremium: formatNumber(
                parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
              ),
              solo: false,
            },
            {
              PolicyNo: "",
              Insured: itm.Location,
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              solo: true,
            },
            {
              PolicyNo: "",
              Insured: "",
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              gapPerRow: true,
            },
          ];
          data.push(...newData);
        }
        data.push({
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gap: true,
        });
      }
    } else if (itm.Type === "MAR") {
      const MARINEDATA = (await prisma.$queryRawUnsafe(
        qry("mpolicy", itm.data.join("','"))
      )) as Array<any>;
      if (MARINEDATA.length > 0) {
        data.push({
          PolicyNo: "MARINE",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          header: true,
        });
        for (const itm of MARINEDATA) {
          const newData: Array<any> = [
            {
              PolicyNo: itm.PolicyNo,
              Insured: itm.Shortname,
              Premium: formatNumber(
                parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
              ),
              From: format(new Date(itm.DateFrom), "MM/dd/yyyy"),
              To: format(new Date(itm.DateTo), "MM/dd/yyyy"),
              GrossPremium: formatNumber(
                parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
              ),
              solo: false,
            },
            {
              PolicyNo: "",
              Insured: "",
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              gapPerRow: true,
            },
          ];
          data.push(...newData);
        }
        data.push({
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gap: true,
        });
      }
    } else if (itm.Type === "PA") {
      const PADATA = (await prisma.$queryRawUnsafe(
        qry("papolicy", itm.data.join("','"))
      )) as Array<any>;

      if (PADATA.length > 0) {
        data.push({
          PolicyNo: "GPA",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          header: true,
        });
        for (const itm of PADATA) {
          const newData: Array<any> = [
            {
              PolicyNo: itm.PolicyNo,
              Insured: itm.Shortname,
              Premium: formatNumber(
                parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
              ),
              From: format(new Date(itm.PeriodFrom), "MM/dd/yyyy"),
              To: format(new Date(itm.PeriodTo), "MM/dd/yyyy"),
              GrossPremium: formatNumber(
                parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
              ),
              solo: false,
            },
            {
              PolicyNo: "",
              Insured: "",
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              gapPerRow: true,
            },
          ];
          data.push(...newData);
        }
        data.push({
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gap: true,
        });
      }
    } else if (itm.Type === "ED") {
      const EDDATA = (await prisma.$queryRawUnsafe(
        `SELECT * FROM gpa_endorsement where endorsement_no in  ('${itm.data.join(
          "','"
        )}')`
      )) as Array<any>;

      if (EDDATA.length > 0) {
        if (!data.some((itm: any) => itm.PolicyNo === "GPA")) {
          data.push({
            PolicyNo: "GPA",
            Insured: "",
            Premium: "",
            From: "",
            To: "",
            GrossPremium: "",
            header: true,
          });
        }

        for (const itm of EDDATA) {
          const newData: Array<any> = [
            {
              PolicyNo: itm.endorsement_no,
              Insured: formatNumber(
                parseFloat(itm.suminsured.toString().replace(/,/g, ""))
              ),
              Premium: formatNumber(
                parseFloat(itm.totalpremium.toString().replace(/,/g, ""))
              ),
              From: format(new Date(itm.datefrom), "MM/dd/yyyy"),
              To: format(new Date(itm.dateto), "MM/dd/yyyy"),
              GrossPremium: formatNumber(
                parseFloat(itm.totaldue.toString().replace(/,/g, ""))
              ),
              solo: false,
            },
          ];
          if (typeof itm.deleted === "string" && itm.deleted !== "") {
            newData.push({
              PolicyNo: "",
              Insured: `DELETED:  ${itm.deleted}`,
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              solo: true,
              endorsement: true,
            });
          }
          if (typeof itm.replacement === "string" && itm.replacement !== "") {
            newData.push({
              PolicyNo: "",
              Insured: `REPLACEMENT:  ${itm.replacement}`,
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              solo: true,
              endorsement: true,
            });
          }
          if (typeof itm.additional === "string" && itm.additional !== "") {
            newData.push({
              PolicyNo: "",
              Insured: `ADDITIONAL:  ${itm.additional}`,
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              solo: true,
              endorsement: true,
            });
          }

          newData[1].PolicyNo = "ENDORSEMENT";

          newData.push({
            PolicyNo: "",
            Insured: "",
            Premium: "",
            From: "",
            To: "",
            GrossPremium: "",
            gap: true,
          });

          data.push(...newData);
        }
      }
    } else if (itm.Type === "CGL") {
      const CGLDATA = (await prisma.$queryRawUnsafe(
        qry("cglpolicy", itm.data.join("','"))
      )) as Array<any>;
      if (CGLDATA.length > 0) {
        data.push({
          PolicyNo: "CGL & CARI",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          header: true,
        });
        for (const itm of CGLDATA) {
          const newData: Array<any> = [
            {
              PolicyNo: itm.PolicyNo,
              Insured: itm.Shortname,
              Premium: formatNumber(
                parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
              ),
              From: format(new Date(itm.PeriodFrom), "MM/dd/yyyy"),
              To: format(new Date(itm.PeriodTo), "MM/dd/yyyy"),
              GrossPremium: formatNumber(
                parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
              ),
              solo: false,
            },
            {
              PolicyNo: "",
              Insured: itm.PolicyNo,
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              solo: true,
            },
            {
              PolicyNo: "",
              Insured: "",
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              gapPerRow: true,
            },
          ];
          data.push(...newData);
        }
        data.push({
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gap: true,
        });
      }
    } else {
      const BONDSDATA = (await prisma.$queryRawUnsafe(
        qry("bpolicy", itm.data.join("','"))
      )) as Array<any>;
      if (BONDSDATA.length > 0) {
        data.push({
          PolicyNo: "BONDS",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          header: true,
        });
        for (const itm of BONDSDATA) {
          const newData: Array<any> = [
            {
              PolicyNo: itm.PolicyNo,
              Insured: itm.Shortname,
              Premium: formatNumber(
                parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
              ),
              From: format(new Date(itm.BidDate), "MM/dd/yyyy"),
              To: bondsYear(itm),
              GrossPremium: formatNumber(
                parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
              ),
              solo: false,
            },
            {
              PolicyNo: bondsPolicy(itm),
              Insured: itm.Obligee,
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              solo: true,
            },
            {
              PolicyNo: "",
              Insured: "",
              Premium: "",
              From: "",
              To: "",
              GrossPremium: "",
              gapPerRow: true,
            },
          ];
          data.push(...newData);
        }
        data.push({
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gap: true,
        });
      }
    }
  }

  // const MSPRDATA = (await prisma.$queryRawUnsafe(
  //   qry("msprpolicy")
  // )) as Array<any>;

  const getTotal = data.reduce((t, itm) => {
    return (
      t +
      parseFloat(
        (itm.GrossPremium && itm.GrossPremium !== "" ? itm.GrossPremium : 0)
          .toString()
          .replace(/,/g, "")
      )
    );
  }, 0);
  data.push({
    PolicyNo: "",
    Insured: "",
    Premium: "",
    From: "",
    To: "",
    GrossPremium: formatNumber(getTotal),
    total: true,
  });

  function bondsYear(itm: any) {
    const PolicyType = itm.PolicyType.trim();
    if (PolicyType === "G02") {
      return "120 Days";
    } else if (
      ["G13", "G31", "G02", "G16", "G40", "G41", "G42"].includes(PolicyType)
    ) {
      return "1YR";
    } else if (PolicyType === "JCL15") {
      return "1YR";
    } else if (PolicyType === "JCL7") {
      return "2YRS";
    } else if (PolicyType === "C9") {
      return "1YR";
    } else {
      return "";
    }
  }
  function bondsPolicy(itm: any) {
    const PolicyType = itm.PolicyType.trim();
    if (PolicyType === "G13" || PolicyType === "G31") {
      return "PERFORMANCE BOND";
    } else if (PolicyType === "G02") {
      return "BIDDER'S BOND";
    } else if (PolicyType === "G16") {
      return "SURETY BOND";
    } else if (PolicyType === "G40") {
      return "SURETY BOND";
    } else if (PolicyType === "G41") {
      return "WARRANTY BOND";
    } else if (PolicyType === "G42") {
      return "RETENTION BOND";
    } else if (PolicyType === "JCL15") {
      return "APPEAL BOND";
    } else if (PolicyType === "JCL7") {
      return "HEIR'S BOND";
    } else if (PolicyType === "C9") {
      return "JUDICIAL BOND";
    } else {
      return "";
    }
  }

  const headerIndexes = getIndexes(
    data,
    (item: any) =>
      item?.header === true || item?.solo === false || item?.total === true
  );
  const gapPerRowIndexes = getIndexes(
    data,
    (item: any) => item?.gapPerRow === true
  );
  const getSolo = getIndexes(
    data,
    (item: any) => item?.solo === true && item?.endorsement
  );
  let PAGE_WIDTH = 660;
  let PAGE_HEIGHT = 841;

  const props: any = {
    addHeader: false,
    addHeaderPerpage: false,
    data: data,
    columnWidths: [150, 200, 70, 60, 60, 80],
    headers: [
      { headerName: "POLICY NO", textAlign: "left" },
      { headerName: "INSURED", textAlign: "left" },
      { headerName: "PREMIUM", textAlign: "right" },
      { headerName: "FROM", textAlign: "left" },
      { headerName: "TO", textAlign: "left" },
      { headerName: "GROSS PREMIUM", textAlign: "right" },
    ],
    keys: ["PolicyNo", "Insured", "Premium", "From", "To", "GrossPremium"],
    title: "",
    adjustTitleFontSize: 6,
    setRowFontSize: 6,
    BASE_FONT_SIZE: 6,
    adjustRowHeight: 8,
    addHeaderBorderTop: true,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    MARGIN: { top: 190, right: 20, bottom: 30, left: 20 },
    addDrawingOnHeader: (doc: PDFKit.PDFDocument, startY: number) => {
      doc.fontSize(7);

      doc
        .moveTo(20, startY + 10)
        .lineTo(PAGE_WIDTH - 20, startY + 10)
        .stroke();

      doc.text("COVERAGE", 450, startY + 14, {
        width: 70,
        align: "center",
      });
      doc.fontSize(7);
    },
    beforeDraw: (
      pdfReportGenerator: PDFReportGenerator,
      doc: PDFKit.PDFDocument
    ) => {
      let yAxis = 20;
      // doc.image(
      //   path.join(path.dirname(__dirname), "../../../static/image/logo.png"),
      //   30,
      //   yAxis,
      //   {
      //     fit: [120, 120],
      //   }
      // );

      yAxis += 10;
      // doc.fontSize(60);
      // doc.font("Helvetica-Bold");
      // doc.text("UPWARD", 155, yAxis);
      yAxis += 70;

      // if (process.env.DEPARTMENT === "UMIS") {
      //   doc.fontSize(9);
      //   doc.text("MANAGEMENT INSURANCE SERVICES", 245, yAxis);
      // }
      // if (process.env.DEPARTMENT === "UCSMI") {
      //   doc.fontSize(9);
      //   doc.text("CONSULTANCY SERVICES AND MANAGEMENT INC.", 190, yAxis);
      // }

      yAxis += 40;
      doc.font("Helvetica-Bold");
      doc.fontSize(8);
      doc.text("STATEMENT OF ACCOUNT", 30, yAxis, {
        width: PAGE_WIDTH - 30,
        align: "center",
      });

      yAxis += 10;
      doc.text(`${format(new Date(), "MMMM dd, yyyy")}`, 30, yAxis, {
        width: PAGE_WIDTH - 30,
        align: "center",
      });

      yAxis += 10;
      // doc.fontSize(9);
      // doc.text(`Ref. No. : ${req.body.refNo}`, 30, yAxis, {
      //   width: PAGE_WIDTH - 60,
      //   align: "right",
      // });
      doc.fontSize(8);

      const arrayHeaderData = [
        { label: "ACCT. NAME", value: req.body.name },
        { label: "ADDRESS", value: req.body.address },
        { label: "ACCT. BAL.", value: formatNumber(getTotal) },
      ];

      for (const itm of arrayHeaderData) {
        yAxis += 12;
        doc.text(itm.label, 30, yAxis, {
          width: 70,
          align: "left",
        });
        doc.text(`:`, 100, yAxis, {
          width: 10,
          align: "left",
        });
        if (itm.label === "ACCT. BAL.") {
          doc.text(itm.value, 130, yAxis, {
            width: 60,
            align: "right",
          });
          doc
            .moveTo(130, yAxis - 3)
            .lineTo(195, yAxis - 3)
            .stroke();

          yAxis += 10;

          doc.moveTo(130, yAxis).lineTo(195, yAxis).stroke();
          yAxis += 2;
          doc.moveTo(130, yAxis).lineTo(195, yAxis).stroke();
        } else {
          doc.text(itm.value, 130, yAxis, {
            width: PAGE_WIDTH - 30,
            align: "left",
          });
        }
      }

      headerIndexes.forEach((itm: any) => {
        pdfReportGenerator.boldRow(itm);
      });
      getSolo.forEach((itm: any) => {
        pdfReportGenerator.SpanRow(itm, 1, 5);
        pdfReportGenerator.boldRow(
          itm,
          (
            doc: any,
            cellValue: any,
            startY_: any,
            startX: any,
            colWidth: any,
            textHeader: any
          ) => {
            if (cellValue.includes("DELETED:")) {
              doc.font("Helvetica-Bold");
              const [label, value] = cellValue?.toString().split("DELETED:");
              doc.text("DELETED:", startX + 5, startY_, {
                width: 75,
                align: textHeader,
              });
              doc.font("Helvetica");
              doc.text(value.trim(), startX + 75, startY_, {
                width: colWidth - 10 + 75,
                align: textHeader,
              });
            } else if (cellValue.includes("REPLACEMENT:")) {
              doc.font("Helvetica-Bold");
              const [label, value] = cellValue
                ?.toString()
                .split("REPLACEMENT:");

              doc.text("REPLACEMENT:", startX + 5, startY_, {
                width: 75,
                align: textHeader,
              });
              doc.font("Helvetica");
              doc.text(value.trim(), startX + 75, startY_, {
                width: colWidth - 10 + 75,
                align: textHeader,
              });
            } else if (cellValue.includes("ADDITIONAL:")) {
              doc.font("Helvetica-Bold");
              const [label, value] = cellValue?.toString().split("ADDITIONAL:");

              doc.text("ADDITIONAL:", startX + 5, startY_, {
                width: 75,
                align: textHeader,
              });
              doc.font("Helvetica");
              doc.text(value.trim(), startX + 75, startY_, {
                width: colWidth - 10 + 75,
                align: textHeader,
              });
            } else {
              doc.font("Helvetica");
              doc.text(cellValue?.toString() || "", startX + 5, startY_, {
                width: colWidth - 10,
                align: textHeader,
              });
            }
          }
        );
      });

      // ||
      //         cellValue.includes("REPLACEMENT:") ||
      //         cellValue.includes("ADDITIONAL:")

      return yAxis;
    },
    drawOnColumn: (row: any, doc: PDFKit.PDFDocument, startY: number) => {
      if (row.header) {
        startY = startY + 13;
        if (row.PolicyNo === "COMPREHENSIVE") {
          doc.moveTo(25, startY).lineTo(95, startY).stroke();
          doc.moveTo(25, startY).lineTo(95, startY).stroke();
        } else if (row.PolicyNo === "FIRE") {
          doc.moveTo(25, startY).lineTo(43, startY).stroke();
          doc.moveTo(25, startY).lineTo(43, startY).stroke();
        } else if (row.PolicyNo === "MARINE") {
          doc.moveTo(25, startY).lineTo(56, startY).stroke();
          doc.moveTo(25, startY).lineTo(56, startY).stroke();
        } else if (row.PolicyNo === "BONDS") {
          doc.moveTo(25, startY).lineTo(53, startY).stroke();
          doc.moveTo(25, startY).lineTo(53, startY).stroke();
        } else if (row.PolicyNo === "GPA") {
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
        } else if (row.PolicyNo === "CGL") {
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
        }
      } else if (row.total) {
        doc
          .moveTo(PAGE_WIDTH - 80, startY + 2)
          .lineTo(PAGE_WIDTH - 20, startY + 2)
          .stroke();
        startY += 15;
        doc
          .moveTo(PAGE_WIDTH - 80, startY)
          .lineTo(PAGE_WIDTH - 20, startY)
          .stroke();
        startY += 2;
        doc
          .moveTo(PAGE_WIDTH - 80, startY)
          .lineTo(PAGE_WIDTH - 20, startY)
          .stroke();
      }
    },
    beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {
      let yAxis = 20;
      doc.image(
        path.join(path.dirname(__dirname), "../../../static/image/logo.png"),
        30,
        yAxis,
        {
          fit: [120, 120],
        }
      );

      yAxis += 10;
      doc.fontSize(60);
      doc.font("Helvetica-Bold");
      doc.text("UPWARD", 155, yAxis);
      yAxis += 50;

      if (process.env.DEPARTMENT === "UMIS") {
        doc.fontSize(9);
        doc.text("MANAGEMENT INSURANCE SERVICES", 245, yAxis);
      }
      if (process.env.DEPARTMENT === "UCSMI") {
        doc.fontSize(9);
        doc.text("CONSULTANCY SERVICES AND MANAGEMENT INC.", 190, yAxis);
      }

      yAxis += 60;
      doc.fontSize(9);
      doc.text(`Ref. No. : ${req.body.reference_no}`, 30, yAxis, {
        width: PAGE_WIDTH - 60,
        align: "right",
      });
      doc.text(
        "Address | 1197 Azure Business Center EDSA Muñoz, Quezon City -  Telephone Numbers | 9441 - 8977 to 78 | 8374 - 0742 ",
        30,
        PAGE_HEIGHT - 30,
        {
          width: PAGE_WIDTH - 30,
          align: "center",
        }
      );
      doc.text(
        "Mobile Numbers | 0919 - 078 - 5547 / 0919 - 078 - 5546 / 0919 - 078 - 5543",
        30,
        PAGE_HEIGHT - 18,
        {
          width: PAGE_WIDTH - 30,
          align: "center",
        }
      );
    },
    addRowHeight: (rowIndex: number) => {
      if (gapPerRowIndexes.includes(rowIndex)) {
        return 8;
      }
      return 0;
    },
    drawPageNumber: (
      doc: PDFKit.PDFDocument,
      currentPage: number,
      totalPages: number,
      pdfReportGenerator: any
    ) => {},
    drawSubReport: (doc: PDFKit.PDFDocument, startY: number) => {
      startY += 10;
      doc.fontSize(10);
      doc.font("Helvetica-Bold");
      doc.text(req.body.attachment, 30, startY, {
        width: PAGE_WIDTH - 30,
        align: "center",
      });

      startY += 30;

      doc.fontSize(7);
      doc.font("Helvetica");
      doc.text("Prepared by:", 100, startY, {
        width: 100,
        align: "center",
      });
      doc.text("Checked by:", 250, startY, {
        width: 100,
        align: "center",
      });
      doc.text("Noted by:", 400, startY, {
        width: 100,
        align: "center",
      });

      startY += 30;
      doc.fontSize(7);
      doc.font("Helvetica-Bold");
      doc.text("ADacula", 100, startY, {
        width: 100,
        align: "center",
      });
      doc.text("MGBLlanera", 250, startY, {
        width: 100,
        align: "center",
      });
      doc.text("LVAquino", 400, startY, {
        width: 100,
        align: "center",
      });
      startY += 20;
      doc.text(
        "Received by:       ________________________________",
        30,
        startY,
        {
          width: 300,
          align: "left",
        }
      );
      startY += 15;
      doc.text(
        "Date:                    ________________________________",
        30,
        startY,
        {
          width: 300,
          align: "left",
        }
      );
      startY += 15;
      doc.fontSize(7);
      doc.text(
        `"Please check your Statement of Account immediately and feel free to call us for nay questions within 30 days from`,
        30,
        startY,
        {
          width: 500,
          align: "left",
        }
      );
      startY += 9;
      doc.text(
        `date of receipt. Otherwise, Upward Management Services will deem the statement true and correct"`,
        30,
        startY,
        {
          width: 500,
          align: "left",
        }
      );
      startY += 9;
      doc.text(
        `"As per Insurance Code, no cancellation of policy after 90 days from the date of issuance"`,
        30,
        startY,
        {
          width: 500,
          align: "left",
        }
      );
    },
  };
  const pdfReportGenerator = new PDFReportGenerator(props);
  return pdfReportGenerator.generatePDF(res, false);
});
StatementOfAccount.post("/soa/generate-soa-careof", async (req, res) => {
  const qry = (policytablename: string) => `
  SELECT * FROM ${policytablename} a 
  left join policy b on a.PolicyNo = b.PolicyNo
  left join (${selectClient}) c on b.IDNo = c.IDNo
  where a.careOf = '${req.body.careOf}';`;

  const careOf: Array<any> = await prisma.$queryRawUnsafe(
    `
    SELECT 
      careOf, address
    FROM
        careof
    WHERE
        careOf = ? AND inactive = 0;`,
    req.body.careOf
  );

  const COMDATA = (await prisma.$queryRawUnsafe(qry("vpolicy"))) as Array<any>;
  const FIREDATA = (await prisma.$queryRawUnsafe(qry("fpolicy"))) as Array<any>;
  const MARINEDATA = (await prisma.$queryRawUnsafe(
    qry("mpolicy")
  )) as Array<any>;

  const BONDSDATA = (await prisma.$queryRawUnsafe(
    qry("bpolicy")
  )) as Array<any>;
  // const MSPRDATA = (await prisma.$queryRawUnsafe(
  //   qry("msprpolicy")
  // )) as Array<any>;

  const PADATA = (await prisma.$queryRawUnsafe(qry("papolicy"))) as Array<any>;
  const CGLDATA = (await prisma.$queryRawUnsafe(
    qry("cglpolicy")
  )) as Array<any>;

  const data: Array<any> = [];
  if (COMDATA.length > 0) {
    data.push({
      PolicyNo: "COMPREHENSIVE",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of COMDATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.DateFrom), "MM/dd/yyyy"),
          To: format(new Date(itm.DateTo), "MM/dd/yyyy"),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: "",
          Insured: `${itm.Model} ${itm.Make} ${itm.BodyType}`,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: itm.PlateNo,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: itm.ChassisNo,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }
  if (FIREDATA.length > 0) {
    data.push({
      PolicyNo: "FIRE",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of FIREDATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.DateFrom), "MM/dd/yyyy"),
          To: format(new Date(itm.DateTo), "MM/dd/yyyy"),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: "",
          Insured: itm.Location,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }
  if (MARINEDATA.length > 0) {
    data.push({
      PolicyNo: "MARINE",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of MARINEDATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.DateFrom), "MM/dd/yyyy"),
          To: format(new Date(itm.DateTo), "MM/dd/yyyy"),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }
  if (BONDSDATA.length > 0) {
    data.push({
      PolicyNo: "BONDS",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of BONDSDATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.BidDate), "MM/dd/yyyy"),
          To: bondsYear(itm),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: bondsPolicy(itm),
          Insured: itm.Obligee,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }
  if (PADATA.length > 0) {
    data.push({
      PolicyNo: "GPA",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of PADATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.PeriodFrom), "MM/dd/yyyy"),
          To: format(new Date(itm.PeriodTo), "MM/dd/yyyy"),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }
  if (CGLDATA.length > 0) {
    data.push({
      PolicyNo: "CGL",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of CGLDATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.PeriodFrom), "MM/dd/yyyy"),
          To: format(new Date(itm.PeriodTo), "MM/dd/yyyy"),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: "",
          Insured: itm.PolicyNo,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }

  const getTotal = data.reduce((t, itm) => {
    return (
      t +
      parseFloat(
        (itm.GrossPremium && itm.GrossPremium !== "" ? itm.GrossPremium : 0)
          .toString()
          .replace(/,/g, "")
      )
    );
  }, 0);

  data.push({
    PolicyNo: "",
    Insured: "",
    Premium: "",
    From: "",
    To: "",
    GrossPremium: formatNumber(getTotal),
    total: true,
  });

  function bondsYear(itm: any) {
    const PolicyType = itm.PolicyType.trim();
    if (PolicyType === "G02") {
      return "120 Days";
    } else if (
      ["G13", "G31", "G02", "G16", "G40", "G41", "G42"].includes(PolicyType)
    ) {
      return "1YR";
    } else if (PolicyType === "JCL15") {
      return "1YR";
    } else if (PolicyType === "JCL7") {
      return "2YRS";
    } else if (PolicyType === "C9") {
      return "1YR";
    } else {
      return "";
    }
  }
  function bondsPolicy(itm: any) {
    const PolicyType = itm.PolicyType.trim();
    if (PolicyType === "G13" || PolicyType === "G31") {
      return "PERFORMANCE BOND";
    } else if (PolicyType === "G02") {
      return "BIDDER'S BOND";
    } else if (PolicyType === "G16") {
      return "SURETY BOND";
    } else if (PolicyType === "G40") {
      return "SURETY BOND";
    } else if (PolicyType === "G41") {
      return "WARRANTY BOND";
    } else if (PolicyType === "G42") {
      return "RETENTION BOND";
    } else if (PolicyType === "JCL15") {
      return "APPEAL BOND";
    } else if (PolicyType === "JCL7") {
      return "HEIR'S BOND";
    } else if (PolicyType === "C9") {
      return "JUDICIAL BOND";
    } else {
      return "";
    }
  }

  const headerIndexes = getIndexes(
    data,
    (item: any) =>
      item?.header === true || item?.solo === false || item?.total === true
  );

  const gapPerRowIndexes = getIndexes(
    data,
    (item: any) => item?.gapPerRow === true
  );

  let PAGE_WIDTH = 660;
  let PAGE_HEIGHT = 841;

  const props: any = {
    addHeader: false,
    addHeaderPerpage: false,
    data: data,
    columnWidths: [150, 200, 70, 60, 60, 80],
    headers: [
      { headerName: "POLICY NO", textAlign: "left" },
      { headerName: "INSURED", textAlign: "left" },
      { headerName: "PREMIUM", textAlign: "right" },
      { headerName: "FROM", textAlign: "left" },
      { headerName: "TO", textAlign: "left" },
      { headerName: "GROSS PREMIUM", textAlign: "right" },
    ],
    keys: ["PolicyNo", "Insured", "Premium", "From", "To", "GrossPremium"],
    title: "",
    adjustTitleFontSize: 6,
    setRowFontSize: 6,
    BASE_FONT_SIZE: 6,
    adjustRowHeight: 8,
    addHeaderBorderTop: true,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    MARGIN: { top: 160, right: 20, bottom: 30, left: 20 },
    addDrawingOnHeader: (doc: PDFKit.PDFDocument, startY: number) => {
      doc.fontSize(7);

      doc
        .moveTo(20, startY + 10)
        .lineTo(PAGE_WIDTH - 20, startY + 10)
        .stroke();

      doc.text("COVERAGE", 450, startY + 14, {
        width: 70,
        align: "center",
      });
      doc.fontSize(7);
    },
    beforeDraw: (
      pdfReportGenerator: PDFReportGenerator,
      doc: PDFKit.PDFDocument
    ) => {
      let yAxis = 20;
      // doc.image(
      //   path.join(path.dirname(__dirname), "../../../static/image/logo.png"),
      //   30,
      //   yAxis,
      //   {
      //     fit: [120, 120],
      //   }
      // );

      yAxis += 10;
      // doc.fontSize(60);
      // doc.font("Helvetica-Bold");
      // doc.text("UPWARD", 155, yAxis);
      yAxis += 50;

      // if (process.env.DEPARTMENT === "UMIS") {
      //   doc.fontSize(9);
      //   doc.text("MANAGEMENT INSURANCE SERVICES", 245, yAxis);
      // }
      // if (process.env.DEPARTMENT === "UCSMI") {
      //   doc.fontSize(9);
      //   doc.text("CONSULTANCY SERVICES AND MANAGEMENT INC.", 190, yAxis);
      // }

      yAxis += 40;
      doc.font("Helvetica-Bold");
      doc.fontSize(8);
      doc.text("STATEMENT OF ACCOUNT", 30, yAxis, {
        width: PAGE_WIDTH - 30,
        align: "center",
      });

      yAxis += 10;
      doc.text(`${format(new Date(), "MMMM dd, yyyy")}`, 30, yAxis, {
        width: PAGE_WIDTH - 30,
        align: "center",
      });

      yAxis += 10;
      // doc.fontSize(9);
      // doc.text(`Ref. No. : ${req.body.refNo}`, 30, yAxis, {
      //   width: PAGE_WIDTH - 60,
      //   align: "right",
      // });
      doc.fontSize(8);

      const arrayHeaderData = [
        { label: "ACCT. NAME", value: careOf[0].careOf },
        { label: "ADDRESS", value: careOf[0].address },
        { label: "ACCT. BAL.", value: formatNumber(getTotal) },
      ];

      for (const itm of arrayHeaderData) {
        yAxis += 12;
        doc.text(itm.label, 30, yAxis, {
          width: 70,
          align: "left",
        });
        doc.text(`:`, 100, yAxis, {
          width: 10,
          align: "left",
        });
        if (itm.label === "ACCT. BAL.") {
          doc.text(itm.value, 130, yAxis, {
            width: 60,
            align: "right",
          });
          doc
            .moveTo(130, yAxis - 3)
            .lineTo(195, yAxis - 3)
            .stroke();

          yAxis += 10;

          doc.moveTo(130, yAxis).lineTo(195, yAxis).stroke();
          yAxis += 2;
          doc.moveTo(130, yAxis).lineTo(195, yAxis).stroke();
        } else {
          doc.text(itm.value, 130, yAxis, {
            width: PAGE_WIDTH - 30,
            align: "left",
          });
        }
      }

      headerIndexes.forEach((itm: any) => {
        pdfReportGenerator.boldRow(itm);
      });
      return yAxis;
    },
    drawOnColumn: (row: any, doc: PDFKit.PDFDocument, startY: number) => {
      if (row.header) {
        startY = startY + 13;
        if (row.PolicyNo === "COMPREHENSIVE") {
          doc.moveTo(25, startY).lineTo(95, startY).stroke();
          doc.moveTo(25, startY).lineTo(95, startY).stroke();
        } else if (row.PolicyNo === "FIRE") {
          doc.moveTo(25, startY).lineTo(43, startY).stroke();
          doc.moveTo(25, startY).lineTo(43, startY).stroke();
        } else if (row.PolicyNo === "MARINE") {
          doc.moveTo(25, startY).lineTo(56, startY).stroke();
          doc.moveTo(25, startY).lineTo(56, startY).stroke();
        } else if (row.PolicyNo === "BONDS") {
          doc.moveTo(25, startY).lineTo(53, startY).stroke();
          doc.moveTo(25, startY).lineTo(53, startY).stroke();
        } else if (row.PolicyNo === "GPA") {
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
        } else if (row.PolicyNo === "CGL") {
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
        }
      } else if (row.total) {
        doc
          .moveTo(PAGE_WIDTH - 80, startY + 2)
          .lineTo(PAGE_WIDTH - 20, startY + 2)
          .stroke();
        startY += 15;
        doc
          .moveTo(PAGE_WIDTH - 80, startY)
          .lineTo(PAGE_WIDTH - 20, startY)
          .stroke();
        startY += 2;
        doc
          .moveTo(PAGE_WIDTH - 80, startY)
          .lineTo(PAGE_WIDTH - 20, startY)
          .stroke();
      }
    },
    beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {
      let yAxis = 20;
      doc.image(
        path.join(path.dirname(__dirname), "../../../static/image/logo.png"),
        30,
        yAxis,
        {
          fit: [120, 120],
        }
      );

      yAxis += 10;
      doc.fontSize(60);
      doc.font("Helvetica-Bold");
      doc.text("UPWARD", 155, yAxis);
      yAxis += 50;

      if (process.env.DEPARTMENT === "UMIS") {
        doc.fontSize(9);
        doc.text("MANAGEMENT INSURANCE SERVICES", 245, yAxis);
      }
      if (process.env.DEPARTMENT === "UCSMI") {
        doc.fontSize(9);
        doc.text("CONSULTANCY SERVICES AND MANAGEMENT INC.", 190, yAxis);
      }

      yAxis += 60;
      doc.fontSize(9);
      doc.text(`Ref. No. : ${req.body.refNo}`, 30, yAxis, {
        width: PAGE_WIDTH - 60,
        align: "right",
      });
      doc.text(
        "Address | 1197 Azure Business Center EDSA Muñoz, Quezon City -  Telephone Numbers | 9441 - 8977 to 78 | 8374 - 0742 ",
        30,
        PAGE_HEIGHT - 30,
        {
          width: PAGE_WIDTH - 30,
          align: "center",
        }
      );
      doc.text(
        "Mobile Numbers | 0919 - 078 - 5547 / 0919 - 078 - 5546 / 0919 - 078 - 5543",
        30,
        PAGE_HEIGHT - 18,
        {
          width: PAGE_WIDTH - 30,
          align: "center",
        }
      );
    },
    addRowHeight: (rowIndex: number) => {
      if (gapPerRowIndexes.includes(rowIndex)) {
        return 8;
      }
      return 0;
    },
    drawPageNumber: (
      doc: PDFKit.PDFDocument,
      currentPage: number,
      totalPages: number,
      pdfReportGenerator: any
    ) => {},
    drawSubReport: (doc: PDFKit.PDFDocument, startY: number) => {
      startY += 10;
      doc.fontSize(10);
      doc.font("Helvetica-Bold");
      doc.text(req.body.attachment, 30, startY, {
        width: PAGE_WIDTH - 30,
        align: "center",
      });

      startY += 30;

      doc.fontSize(7);
      doc.font("Helvetica");
      doc.text("Prepared by:", 100, startY, {
        width: 100,
        align: "center",
      });
      doc.text("Checked by:", 250, startY, {
        width: 100,
        align: "center",
      });
      doc.text("Noted by:", 400, startY, {
        width: 100,
        align: "center",
      });

      startY += 30;
      doc.fontSize(7);
      doc.font("Helvetica-Bold");
      doc.text("ADacula", 100, startY, {
        width: 100,
        align: "center",
      });
      doc.text("MGBLlanera", 250, startY, {
        width: 100,
        align: "center",
      });
      doc.text("LVAquino", 400, startY, {
        width: 100,
        align: "center",
      });
      startY += 20;
      doc.text(
        "Received by:       ________________________________",
        30,
        startY,
        {
          width: 300,
          align: "left",
        }
      );
      startY += 15;
      doc.text(
        "Date:                    ________________________________",
        30,
        startY,
        {
          width: 300,
          align: "left",
        }
      );
      startY += 15;
      doc.fontSize(7);
      doc.text(
        `"Please check your Statement of Account immediately and feel free to call us for nay questions within 30 days from`,
        30,
        startY,
        {
          width: 500,
          align: "left",
        }
      );
      startY += 9;
      doc.text(
        `date of receipt. Otherwise, Upward Management Services will deem the statement true and correct"`,
        30,
        startY,
        {
          width: 500,
          align: "left",
        }
      );
      startY += 9;
      doc.text(
        `"As per Insurance Code, no cancellation of policy after 90 days from the date of issuance"`,
        30,
        startY,
        {
          width: 500,
          align: "left",
        }
      );
    },
  };
  const pdfReportGenerator = new PDFReportGenerator(props);
  return pdfReportGenerator.generatePDF(res, false);
});

const getIndexes = (array: Array<any>, condition: any) => {
  return array.reduce((indexes, item, index) => {
    if (condition(item)) {
      indexes.push(index); // Store the index if condition is met
    }
    return indexes;
  }, []);
};

const printQuery = (policies: string) => `
SELECT 
    *
FROM
    policy AS Policy
        LEFT JOIN
    bpolicy AS BPolicy ON Policy.PolicyNo = BPolicy.PolicyNo
        LEFT JOIN
    vpolicy ON Policy.PolicyNo = vpolicy.PolicyNo
        LEFT JOIN
    mpolicy AS MPolicy ON Policy.PolicyNo = MPolicy.PolicyNo
        LEFT JOIN
    papolicy AS PAPolicy ON Policy.PolicyNo = PAPolicy.PolicyNo
        LEFT JOIN
    cglpolicy AS CGLPolicy ON Policy.PolicyNo = CGLPolicy.PolicyNo
        LEFT JOIN
    msprpolicy AS MSPRPolicy ON Policy.PolicyNo = MSPRPolicy.PolicyNo
        LEFT JOIN
    fpolicy AS FPolicy ON Policy.PolicyNo = FPolicy.PolicyNo
     LEFT JOIN (
    select * from (SELECT 
    if(aa.option = "individual", CONCAT(IF(aa.lastname is not null and trim(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''),aa.firstname), aa.company) as ShortName,
    aa.entry_client_id AS IDNo,
    aa.firstname,
    aa.middlename,
    aa.company,
    aa.address,
    aa.option AS options,
    aa.sub_account,
    aa.createdAt,
    aa.update AS updatedAt,
    aa.client_contact_details_id AS contact_details_id,
    NULL AS description,
    NULL AS remarks,
	NULL AS VAT_Type,
    NULL AS tin_no
FROM
    entry_client aa 
UNION ALL SELECT 
    CONCAT(IF(aa.lastname is not null and trim(aa.lastname) <> '', CONCAT(aa.lastname, ', '),''), aa.firstname) AS ShortName,
    aa.entry_agent_id AS IDNo,
    aa.firstname,
    aa.middlename,
    NULL AS company,
    aa.address,
    NULL AS options,
    NULL AS sub_account,
    aa.createdAt,
    aa.update AS updatedAt,
    aa.agent_contact_details_id AS contact_details_id,
    NULL AS description,
    NULL AS remarks,
	NULL AS VAT_Type,
    NULL AS tin_no
FROM
    entry_agent aa 
UNION ALL SELECT 
    CONCAT(IF(aa.lastname is not null and trim(aa.lastname) <> '', CONCAT(aa.lastname, ', '),''), aa.firstname) AS ShortName,
    aa.entry_employee_id AS IDNo,
    aa.firstname,
    aa.middlename,
    NULL AS company,
    aa.address,
    NULL AS options,
    aa.sub_account,
    aa.createdAt,
    aa.update AS updatedAt,
    NULL AS contact_details_id,
    NULL AS description,
    NULL AS remarks,
	NULL AS VAT_Type,
    NULL AS tin_no
FROM
    entry_employee aa 
UNION ALL SELECT 
    aa.fullname AS ShortName,
    aa.entry_fixed_assets_id AS IDNo,
    NULL AS firstname,
    NULL AS middlename,
    NULL AS company,
    NULL AS address,
    NULL AS options,
    NULL AS sub_account,
    aa.createdAt,
    aa.update AS updatedAt,
    NULL AS contact_details_id,
    aa.description,
    aa.remarks,
	NULL AS VAT_Type,
    NULL AS tin_no
FROM
    entry_fixed_assets aa 
UNION ALL SELECT 
    aa.description AS ShortName,
    aa.entry_others_id AS IDNo,
    NULL AS firstname,
    NULL AS middlename,
    NULL AS company,
    NULL AS address,
    NULL AS options,
    NULL AS sub_account,
    aa.createdAt,
    aa.update AS updatedAt,
    NULL AS contact_details_id,
    NULL AS description,
    NULL AS remarks,
	NULL AS VAT_Type,
    NULL AS tin_no
FROM
    entry_others aa
 UNION ALL SELECT 
    if(aa.option = "individual", CONCAT(IF(aa.lastname is not null and trim(aa.lastname) <> '',  CONCAT(aa.lastname, ', '), ''),aa.firstname), aa.company) as ShortName,
    aa.entry_supplier_id AS IDNo,
    aa.firstname,
    aa.middlename,
    aa.company,
    aa.address,
    aa.option as options,
    NULL AS sub_account,
    aa.createdAt,
    aa.update AS updatedAt,
    aa.supplier_contact_details_id as  contact_details_id,
    NULL AS description,
    NULL AS remarks,
    aa.VAT_Type,
    aa.tin_no
FROM
    entry_supplier aa) id_entry
    ) client ON Policy.IDNo = client.IDNo
    left join gpa_endorsement on gpa_endorsement.policyNo =  PAPolicy.PolicyNo
    where Policy.PolicyNo in ${policies}
`;
export default StatementOfAccount;
