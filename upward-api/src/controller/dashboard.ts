import express from "express";
import { PrismaList } from "../model/connection";
import { qry_id_policy_sub } from "../model/db/views";
import { __executeQuery } from "../model/Task/Production/policy";
import { prisma } from ".";
const Dashboard = express.Router();
const { CustomPrismaClient } = PrismaList();
const { IDEntryWithPolicy } = qry_id_policy_sub();

const cglqry = `
        SELECT
            if('CGL' = 'COM' OR 'CGL' = 'TPL','1' ,'0') as isVPolicy,
            'CGL' as  header,
            c.client_name as AssuredName,
            a.PolicyNo,
            format(b.sumInsured,2) as InsuredValue,
            '' as unit ,
            '' as ChassisNo,
            date_format(b.PeriodTo ,'%m/%d/%Y') as DateExpired
        FROM
              policy a
            LEFT JOIN
              cglpolicy b ON a.PolicyNo = b.PolicyNo
            LEFT JOIN
              (${IDEntryWithPolicy}) c ON a.IDNo = c.IDNo
            where
            a.PolicyType = 'CGL' and
            date_format(b.PeriodTo ,'%Y-%m-%d') between DATE_SUB(LAST_DAY(now()), INTERVAL DAY(LAST_DAY(now())) - 1 DAY) and LAST_DAY(DATE_ADD(now(), INTERVAL 1 MONTH))
`;

const palqry = `
SELECT
            if('PA' = 'COM' OR 'PA' = 'TPL','1' ,'0') as isVPolicy,
            'PA' as  header,
            c.client_name as AssuredName,
            a.PolicyNo,
            format(b.sumInsured,2) as InsuredValue,
            '' as unit ,
            '' as ChassisNo,
            date_format(b.PeriodTo ,'%m/%d/%Y') as DateExpired
        FROM
              policy a
            LEFT JOIN
              papolicy b ON a.PolicyNo = b.PolicyNo
            LEFT JOIN
              (${IDEntryWithPolicy}) c ON a.IDNo = c.IDNo
            where
            a.PolicyType = 'PA' and
            date_format(b.PeriodTo ,'%Y-%m-%d') between DATE_SUB(LAST_DAY(now()), INTERVAL DAY(LAST_DAY(now())) - 1 DAY) and LAST_DAY(DATE_ADD(now(), INTERVAL 1 MONTH))

`;

const marqry = `
     SELECT
            if('MAR' = 'COM' OR 'MAR' = 'TPL','1' ,'0') as isVPolicy,
            'MAR' as  header,
            c.client_name as AssuredName,
            a.PolicyNo,
            format(b.InsuredValue,2) as InsuredValue,
            '' as unit ,
            '' as ChassisNo,
            date_format(b.DateTo,'%m/%d/%Y') as DateExpired
        FROM
              policy a
            LEFT JOIN
              mpolicy b ON a.PolicyNo = b.PolicyNo
            LEFT JOIN
              (${IDEntryWithPolicy}) c ON a.IDNo = c.IDNo
            where
            a.PolicyType = 'MAR' and
            date_format(b.DateTo,'%Y-%m-%d') between DATE_SUB(LAST_DAY(now()), INTERVAL DAY(LAST_DAY(now())) - 1 DAY) and LAST_DAY(DATE_ADD(now(), INTERVAL 1 MONTH))
`;

const fireqry = `

  SELECT
  if('FIRE' = 'COM' OR 'FIRE' = 'TPL','1' ,'0') as isVPolicy,
  'FIRE' as  header,
  c.client_name as AssuredName,
  a.PolicyNo,
  format(b.InsuredValue,2) as InsuredValue,
  '' as unit ,
  '' as ChassisNo,
  date_format(b.DateTo,'%m/%d/%Y') as DateExpired
  FROM
    policy a
  LEFT JOIN
    fpolicy b ON a.PolicyNo = b.PolicyNo
  LEFT JOIN
    (${IDEntryWithPolicy}) c ON a.IDNo = c.IDNo
  where
  a.PolicyType = 'FIRE' and
  date_format(b.DateTo,'%Y-%m-%d') between DATE_SUB(LAST_DAY(now()), INTERVAL DAY(LAST_DAY(now())) - 1 DAY) and LAST_DAY(DATE_ADD(now(), INTERVAL 1 MONTH))
  `;

const comqry = `
     SELECT
            if('COM' = 'COM' OR 'COM' = 'TPL','1' ,'0') as isVPolicy,
            'COM' as  header,
            c.client_name as AssuredName,
            a.PolicyNo,
            format(b.EstimatedValue,2) as InsuredValue,
             ifnull(concat(b.Model,' ',b.Make,' ',b.BodyType),'') as unit ,
            ifnull(b.ChassisNo,'') as ChassisNo,
            date_format(b.DateTo,'%m/%d/%Y') as DateExpired
        FROM
              policy a
            LEFT JOIN
              vpolicy b ON a.PolicyNo = b.PolicyNo
            LEFT JOIN
              (${IDEntryWithPolicy}) c ON a.IDNo = c.IDNo
            where
            a.PolicyType = 'COM' and
            date_format(b.DateTo,'%Y-%m-%d') between DATE_SUB(LAST_DAY(now()), INTERVAL DAY(LAST_DAY(now())) - 1 DAY) and LAST_DAY(DATE_ADD(now(), INTERVAL 1 MONTH))
`;

const tplqry = `
SELECT
            if('TPL' = 'COM' OR 'TPL' = 'TPL','1' ,'0') as isVPolicy,
            'TPL' as  header,
            c.client_name  as AssuredName,
            a.PolicyNo,
            format(b.EstimatedValue,2) as InsuredValue,
             ifnull(concat(b.Model,' ',b.Make,' ',b.BodyType),'') as unit ,
            ifnull(b.ChassisNo,'') as ChassisNo,
            date_format(b.DateTo,'%m/%d/%Y') as DateExpired
        FROM
              policy a
            LEFT JOIN
              vpolicy b ON a.PolicyNo = b.PolicyNo
            LEFT JOIN
              (${IDEntryWithPolicy}) c ON a.IDNo = c.IDNo
            where
            a.PolicyType = 'TPL' and
            date_format(b.DateTo,'%Y-%m-%d') between DATE_SUB(LAST_DAY(now()), INTERVAL DAY(LAST_DAY(now())) - 1 DAY) and LAST_DAY(DATE_ADD(now(), INTERVAL 1 MONTH))
             

`;
Dashboard.post("/get-renewal-this-month", async (req, res) => {
  const policy = req.body.policy;
  try {
    let qry = "";
    const policies = ["TPL", "COM", "FIRE", "MAR", "PA", "CGL"];
    if (policies.includes(policy)) {
      if (policy === "TPL") {
        qry = tplqry;
      } else if (policy === "COM") {
        qry = comqry;
      } else if (policy === "FIRE") {
        qry = fireqry;
      } else if (policy === "MAR") {
        qry = marqry;
      } else if (policy === "PA") {
        qry = palqry;
      } else if (policy === "CGL") {
        qry = cglqry;
      }

      const renewal = await prisma.$queryRawUnsafe(qry);
      return res.send({
        message: `Successfully Get Renewal This Month`,
        success: true,
        renewal,
      });
    } else {
      return res.send({
        message: `Successfully Get Renewal This Month`,
        success: true,
        renewal: [],
      });
    }
  } catch (err: any) {
    res.send({ message: err.message, success: false });
  }
});

Dashboard.get("/get-claims-notice", async (req, res) => {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  const claimType = [
    "OWN DAMAGE",
    "LOST/CARNAP",
    "VTPL-PROPERTY DAMAGE",
    "VTPL-BODILY INJURY",
    "THIRD PARTY-DEATH",
  ];

  const claimsStatus = [
    "With Lacking Documents",
    "With LOA",
    "Submitted to Insurance Company",
    "For Evaluation",
    "For Inspection",
    "For Check Prep",
    "Denied",
    "Done",
    "",
  ];
  const qry = `SELECT 
  a.claims_id,
  b.PolicyNo,
  b.AssuredName,
  DATE_FORMAT(a.dateAccident, '%m/%d/%Y') AS dateAccident,
  DATE_FORMAT(a.dateReported, '%m/%d/%Y') AS dateReported,
  b.status,
  b.claim_type
FROM
    claims a
      LEFT JOIN
    claims_details b ON a.claims_id = b.claims_id
WHERE
  status <> 1 and status <> 2`;

  try {
    const claims: any = await prisma.$queryRawUnsafe(qry);
    const claimsStatusSort = claimsStatus.sort();
    claims.map((itm: any) => {
      itm.status = claimsStatusSort[parseInt(itm.status?.toString())];
      itm.claim_type = claimType[parseInt(itm.claim_type?.toString())];
      return itm;
    });
    res.send({
      message: `Successfully Get Claims Notice`,
      claims,
      success: true,
    });
  } catch (err: any) {
    res.send({ message: err.message, success: false });
  }
});

export default Dashboard;
