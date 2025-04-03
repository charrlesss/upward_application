import express from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import multer from "multer";
const prisma = new PrismaClient();
const Claims = express.Router();
import path from "path";
import fs from "fs-extra";
import { v4 as uuidV4 } from "uuid";
const uploadDir = path.join(__dirname, "./../../static/claim-files");
import { compareSync } from "bcrypt";
import PDFDocument from "pdfkit";
import { format } from "date-fns";

fs.ensureDirSync(uploadDir);
Claims.post("/get-claim-id", async (req, res): Promise<any> => {
  try {
    const currentMonth: any = await prisma.$queryRawUnsafe(`
      SELECT DATE_FORMAT(NOW(), '%y%m') AS current_month
    `);
    const monthPrefix = currentMonth[0].current_month; // e.g., "2503"

    // Get the last claim_id for the current month
    const lastClaim: any = await prisma.$queryRawUnsafe(`
      SELECT claim_id FROM claims.claims 
      WHERE claim_id LIKE '${monthPrefix}%' COLLATE utf8mb4_unicode_ci 
      ORDER BY claim_id DESC 
      LIMIT 1
    `);

    let newCounter = "001"; // Default if no existing claim_id

    if (lastClaim.length > 0 && lastClaim[0].claim_id) {
      const lastCounter = parseInt(lastClaim[0].claim_id.split("-")[1], 10);
      newCounter = String(lastCounter + 1).padStart(3, "0"); // Increment and format
    }

    const claimID = `${monthPrefix}-${newCounter}`;

    console.log("Generated Claim ID:", claimID);

    res.send({
      claimID,
      message: "Successfully Generate Claim ID.",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      claimID: "",
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Claims.post("/get-reference-id", async (req, res): Promise<any> => {
  try {
    const reference = await generateUniqueClaimID();
    res.send({
      reference,
      message: "Successfully Generate Claim ID.",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      reference: "",
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Claims.post("/selected-search-policy", async (req, res): Promise<any> => {
  try {
    const policyType = req.body.policyType.toUpperCase();
    let database = "";

    if (req.body.department === "UMIS") {
      database = "upward_insurance_umis";
    } else {
      database = "new_upward_insurance_ucsmi";
    }

    const totalGross = await prisma.$queryRawUnsafe(
      `SELECT TotalDue FROM ${database}.policy where PolicyNo = ?`,
      req.body.policyNo
    );
    const totalPaidDeposit = await prisma.$queryRawUnsafe(
      `SELECT  ifNull(SUM(Credit),0)  as totalDeposit FROM ${database}.journal where Source_Type = 'OR' and GL_Acct = '1.03.01' and ID_No = ?`,
      req.body.policyNo
    );
    const totalPaidReturned = await prisma.$queryRawUnsafe(
      `SELECT ifNull(SUM(Debit),0) as totalReturned FROM ${database}.journal where Source_Type = 'RC'   and GL_Acct = '1.03.01' and ID_No = ?`,
      req.body.policyNo
    );
    const totalDiscount = await prisma.$queryRawUnsafe(
      `SELECT ifNull(SUM(Debit),0)  as discount FROM upward_insurance_umis.journal where Source_Type = 'GL'  and GL_Acct = '7.10.15'   and ID_No = ?`,
      req.body.policyNo
    );

    if (policyType === "COM" || policyType === "TPL") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
          SELECT 
              a.IDNo,
              a.PolicyType,
              a.PolicyNo,
              '${
                database === "upward_insurance_umis" ? "UMIS" : "UCSMI"
              }' AS Department,
              IF(b.company <> ''
                      AND b.company IS NOT NULL,
                  b.company,
                  CONCAT(IF(b.lastname <> ''
                                  AND b.lastname IS NOT NULL,
                              CONCAT(b.lastname, ', '),
                              ''),
                          b.firstname,
                          IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                              CONCAT(', ', b.suffix),
                              ''))) AS Name,
              c.ChassisNo,
              c.MotorNo,
              c.CoverNo,
              c.ORNo,
              c.Model,
              c.Make,
              c.BodyType,
              c.PlateNo,
              a.Account,
              a.DateIssued,
              c.DateTo,
              c.DateFrom
          FROM
              ${database}.policy a
                  LEFT JOIN
              ${database}.entry_client b ON a.IDNo = b.entry_client_id
                  LEFT JOIN
              ${database}.vpolicy c ON a.PolicyNo = c.PolicyNo
          WHERE
              a.PolicyNo = ?
          `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else if (policyType === "FIRE") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
          SELECT 
              a.IDNo,
              a.PolicyType,
              a.PolicyNo,
              '${
                database === "upward_insurance_umis" ? "UMIS" : "UCSMI"
              }' AS Department,
              IF(b.company <> ''
                      AND b.company IS NOT NULL,
                  b.company,
                  CONCAT(IF(b.lastname <> ''
                                  AND b.lastname IS NOT NULL,
                              CONCAT(b.lastname, ', '),
                              ''),
                          b.firstname,
                          IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                              CONCAT(', ', b.suffix),
                              ''))) AS Name,
              c.*,
               a.DateIssued,
                c.DateTo,
                c.DateFrom
          FROM
              ${database}.policy a
                  LEFT JOIN
              ${database}.entry_client b ON a.IDNo = b.entry_client_id
                  LEFT JOIN
              ${database}.fpolicy c ON a.PolicyNo = c.PolicyNo
          WHERE
              a.PolicyNo = ?
          `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else if (policyType === "CGL") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
          SELECT 
              a.IDNo,
              a.PolicyType,
              a.PolicyNo,
              '${
                database === "upward_insurance_umis" ? "UMIS" : "UCSMI"
              }' AS Department,
              IF(b.company <> ''
                      AND b.company IS NOT NULL,
                  b.company,
                  CONCAT(IF(b.lastname <> ''
                                  AND b.lastname IS NOT NULL,
                              CONCAT(b.lastname, ', '),
                              ''),
                          b.firstname,
                          IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                              CONCAT(', ', b.suffix),
                              ''))) AS Name,
              c.*,
               a.DateIssued,
                c.PeriodFrom as DateFrom ,
                c.PeriodTo as DateTo
          FROM
              ${database}.policy a
                  LEFT JOIN
              ${database}.entry_client b ON a.IDNo = b.entry_client_id
                  LEFT JOIN
              ${database}.cglpolicy c ON a.PolicyNo = c.PolicyNo
          WHERE
              a.PolicyNo = ?
          `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else if (policyType === "MAR") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
          SELECT 
              a.IDNo,
              a.PolicyType,
              a.PolicyNo,
              '${
                database === "upward_insurance_umis" ? "UMIS" : "UCSMI"
              }' AS Department,
              IF(b.company <> ''
                      AND b.company IS NOT NULL,
                  b.company,
                  CONCAT(IF(b.lastname <> ''
                                  AND b.lastname IS NOT NULL,
                              CONCAT(b.lastname, ', '),
                              ''),
                          b.firstname,
                          IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                              CONCAT(', ', b.suffix),
                              ''))) AS Name,
              c.*,
              a.DateIssued,
              c.DateTo,
              c.DateFrom
          FROM
              ${database}.policy a
                  LEFT JOIN
              ${database}.entry_client b ON a.IDNo = b.entry_client_id
                  LEFT JOIN
              ${database}.mpolicy c ON a.PolicyNo = c.PolicyNo
          WHERE
              a.PolicyNo = ?
          `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else if (policyType === "MSPR") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
          SELECT 
              a.IDNo,
              a.PolicyType,
              a.PolicyNo,
              '${
                database === "upward_insurance_umis" ? "UMIS" : "UCSMI"
              }' AS Department,
              IF(b.company <> ''
                      AND b.company IS NOT NULL,
                  b.company,
                  CONCAT(IF(b.lastname <> ''
                                  AND b.lastname IS NOT NULL,
                              CONCAT(b.lastname, ', '),
                              ''),
                          b.firstname,
                          IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                              CONCAT(', ', b.suffix),
                              ''))) AS Name,
              c.*,
                a.DateIssued,
              c.PeriodFrom as DateFrom  ,
              c.PeriodTo as DateTo
          FROM
              ${database}.policy a
                  LEFT JOIN
              ${database}.entry_client b ON a.IDNo = b.entry_client_id
                  LEFT JOIN
              ${database}.msprpolicy c ON a.PolicyNo = c.PolicyNo
          WHERE
              a.PolicyNo = ?
          `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else if (policyType === "PA") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
          SELECT 
              a.IDNo,
              a.PolicyType,
              a.PolicyNo,
              '${
                database === "upward_insurance_umis" ? "UMIS" : "UCSMI"
              }' AS Department,
              IF(b.company <> ''
                      AND b.company IS NOT NULL,
                  b.company,
                  CONCAT(IF(b.lastname <> ''
                                  AND b.lastname IS NOT NULL,
                              CONCAT(b.lastname, ', '),
                              ''),
                          b.firstname,
                          IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                              CONCAT(', ', b.suffix),
                              ''))) AS Name,
              c.*,
               a.DateIssued,
                c.PeriodFrom as DateFrom ,
                c.PeriodTo as DateTo
          FROM
              ${database}.policy a
                  LEFT JOIN
              ${database}.entry_client b ON a.IDNo = b.entry_client_id
                  LEFT JOIN
              ${database}.papolicy c ON a.PolicyNo = c.PolicyNo
          WHERE
              a.PolicyNo = ?
          `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
          SELECT 
              a.IDNo,
              a.PolicyType,
              a.PolicyNo,
              '${
                database === "upward_insurance_umis" ? "UMIS" : "UCSMI"
              }' AS Department,
              IF(b.company <> ''
                      AND b.company IS NOT NULL,
                  b.company,
                  CONCAT(IF(b.lastname <> ''
                                  AND b.lastname IS NOT NULL,
                              CONCAT(b.lastname, ', '),
                              ''),
                          b.firstname,
                          IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                              CONCAT(', ', b.suffix),
                              ''))) AS Name,
              c.*,
               a.DateIssued,
                c.BidDate as DateTo,
                c.BidTime as DateFrom
          FROM
              ${database}.policy a
                  LEFT JOIN
              ${database}.entry_client b ON a.IDNo = b.entry_client_id
                  LEFT JOIN
              ${database}.bpolicy c ON a.PolicyNo = c.PolicyNo
          WHERE
              a.PolicyNo = ?
          `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    }
  } catch (error: any) {
    console.log(error.message);
    res.send({
      data: "",
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Claims.post("/search-claim", async (req, res): Promise<any> => {
  try {
    const qry = `
     SELECT 
        a.claim_id,
        b.IDNo,
        b.PolicyType,
        b.PolicyNo,
        b.Department,
        b.Name,
        b.ChassisNo,
        b.MotorNo
    FROM
        claims.claims a
            LEFT JOIN
        (SELECT 
            b.IDNo,
                b.PolicyType,
                b.PolicyNo,
                'UCSMI' AS Department,
                IF(c.company <> ''
                    AND c.company IS NOT NULL, c.company, CONCAT(IF(c.lastname <> ''
                    AND c.lastname IS NOT NULL, CONCAT(c.lastname, ', '), ''), c.firstname, IF(c.suffix <> '' AND c.suffix IS NOT NULL, CONCAT(', ', c.suffix), ''))) AS Name,
                d.ChassisNo,
                d.MotorNo
        FROM
            new_upward_insurance_ucsmi.policy b
        LEFT JOIN new_upward_insurance_ucsmi.entry_client c ON b.IDNo = c.entry_client_id
        LEFT JOIN new_upward_insurance_ucsmi.vpolicy d ON b.policyNo = d.PolicyNo 
        UNION ALL 
        SELECT 
            b.IDNo,
                b.PolicyType,
                b.PolicyNo,
                'UMIS' AS Department,
                IF(c.company <> ''
                    AND c.company IS NOT NULL, c.company, CONCAT(IF(c.lastname <> ''
                    AND c.lastname IS NOT NULL, CONCAT(c.lastname, ', '), ''), c.firstname, IF(c.suffix <> '' AND c.suffix IS NOT NULL, CONCAT(', ', c.suffix), ''))) AS Name,
                d.ChassisNo,
                d.MotorNo
        FROM
            upward_insurance_umis.policy b
        LEFT JOIN upward_insurance_umis.entry_client c ON b.IDNo = c.entry_client_id
        LEFT JOIN upward_insurance_umis.vpolicy d ON b.policyNo = d.PolicyNo) b ON a.policyNo = b.PolicyNo
    WHERE
        a.claim_id LIKE ?
            OR b.ChassisNo LIKE ?
            OR b.MotorNo LIKE ?
            OR b.PolicyNo LIKE ?
            OR b.IDNo LIKE ?
            OR b.Name LIKE ?
    ORDER BY claim_id
    LIMIT 100
      `;
    const data = await prisma.$queryRawUnsafe(
      qry,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`
    );
    res.send({
      data,
      message: "Successfully Generate Claim ID.",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      data: [],
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Claims.post("/search-policy", async (req, res): Promise<any> => {
  try {
    const qry = `
      SELECT 
          *
      FROM
          (SELECT 
              a.IDNo,
                  a.PolicyType,
                  a.PolicyNo,
                  'UCSMI' AS Department,
                  IF(b.company <> ''
                      AND b.company IS NOT NULL, b.company, CONCAT(IF(b.lastname <> ''
                      AND b.lastname IS NOT NULL, CONCAT(b.lastname, ', '), ''), b.firstname, IF(b.suffix <> '' AND b.suffix IS NOT NULL, CONCAT(', ', b.suffix), ''))) AS Name,
                  c.ChassisNo,
                  c.MotorNo
          FROM
              new_upward_insurance_ucsmi.policy a
          LEFT JOIN new_upward_insurance_ucsmi.entry_client b ON a.IDNo = b.entry_client_id
          LEFT JOIN new_upward_insurance_ucsmi.vpolicy c ON a.PolicyNo = c.PolicyNo 
          UNION ALL
           SELECT 
              a.IDNo,
                  a.PolicyType,
                  a.PolicyNo,
                  'UMIS' AS Department,
                  IF(b.company <> ''
                      AND b.company IS NOT NULL, b.company, CONCAT(IF(b.lastname <> ''
                      AND b.lastname IS NOT NULL, CONCAT(b.lastname, ', '), ''), b.firstname, IF(b.suffix <> '' AND b.suffix IS NOT NULL, CONCAT(', ', b.suffix), ''))) AS Name,
                  c.ChassisNo,
                  c.MotorNo
          FROM
              upward_insurance_umis.policy a
          LEFT JOIN upward_insurance_umis.entry_client b ON a.IDNo = b.entry_client_id
          LEFT JOIN upward_insurance_umis.vpolicy c ON a.PolicyNo = c.PolicyNo) a
      WHERE
          a.ChassisNo LIKE ?
              OR a.MotorNo LIKE ?
              OR a.PolicyNo LIKE ?
              OR a.IDNo LIKE ?
              OR a.Name LIKE ?
      ORDER BY NAME
      LIMIT 100
      `;
    const data = await prisma.$queryRawUnsafe(
      qry,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`
    );
    res.send({
      data,
      message: "Successfully Generate Claim ID.",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      data: [],
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Claims.post("/selected-search-claim", async (req, res): Promise<any> => {
  try {
    const policyType = req.body.policyType.toUpperCase();
    let database = "";

    if (req.body.department === "UMIS") {
      database = "upward_insurance_umis";
    } else {
      database = "new_upward_insurance_ucsmi";
    }

    const claimDetails: any = await prisma.$queryRawUnsafe(
      `
      SELECT 
            a.claim_id,
          b.claim_reference_no AS reference,
          b.claim_type AS claim_type,
          DATE_FORMAT(b.date_report, '%m/%d/%Y') AS date_report,
          DATE_FORMAT(b.date_accident, '%m/%d/%Y') AS date_accident,
          b.status AS status,
           ifnull( DATE_FORMAT(b.date_received, '%m/%d/%Y'),'') as date_receive,
          format(b.amount_claim, 2) AS amount_claim,
          format(b.amount_approved, 2) AS amount_approved,
          format(b.participation, 2) AS amount_participation,
          format(b.net_amount, 2) AS amount_net,
          b.name_ttpd AS name_ttpd,
          b.remarks AS remarks,
		      ifnull( DATE_FORMAT(b.date_approved, '%m/%d/%Y'),'') as date_approved,
          ifnull(b.date_approved,'') as date_approved_not_formated,
          DATE_FORMAT(b.date_report, '%Y-%m-%d') AS date_report_not_formated,
          DATE_FORMAT(b.date_accident, '%Y-%m-%d') AS date_accident_not_formated,
          ifnull( DATE_FORMAT(b.date_received, '%Y-%m-%d'), '') as date_receive_not_formated,
          document_id as documentId,
          claimStatus,
          documents as files

      FROM
          claims.claims a
              LEFT JOIN
          claims.claims_details b ON a.claim_id = b.claim_id
      WHERE
          a.claim_id = ?
      `,
      req.body.claim_id
    );
    const claimBasicDocument: any = await prisma.$queryRawUnsafe(`
      SELECT basicDocuments FROM claims.claims where claim_id = '${claimDetails[0].claim_id}';
      `);

    const totalGross = await prisma.$queryRawUnsafe(
      `SELECT TotalDue FROM ${database}.policy where PolicyNo = ?`,
      req.body.policyNo
    );
    const totalPaidDeposit = await prisma.$queryRawUnsafe(
      `SELECT  ifNull(SUM(Credit),0)  as totalDeposit FROM ${database}.journal where Source_Type = 'OR' and GL_Acct = '1.03.01' and ID_No = ?`,
      req.body.policyNo
    );
    const totalPaidReturned = await prisma.$queryRawUnsafe(
      `SELECT ifNull(SUM(Debit),0) as totalReturned FROM ${database}.journal where Source_Type = 'RC'   and GL_Acct = '1.03.01' and ID_No = ?`,
      req.body.policyNo
    );
    const totalDiscount = await prisma.$queryRawUnsafe(
      `SELECT ifNull(SUM(Debit),0)  as discount FROM upward_insurance_umis.journal where Source_Type = 'GL'  and GL_Acct = '7.10.15'   and ID_No = ?`,
      req.body.policyNo
    );

    if (policyType === "COM" || policyType === "TPL") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
            SELECT 
                a.IDNo,
                a.PolicyType,
                a.PolicyNo,
                'UCSMI' AS Department,
                IF(b.company <> ''
                        AND b.company IS NOT NULL,
                    b.company,
                    CONCAT(IF(b.lastname <> ''
                                    AND b.lastname IS NOT NULL,
                                CONCAT(b.lastname, ', '),
                                ''),
                            b.firstname,
                            IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                                CONCAT(', ', b.suffix),
                                ''))) AS Name,
                c.ChassisNo,
                c.MotorNo,
                c.CoverNo,
                c.ORNo,
                c.Model,
                c.Make,
                c.BodyType,
                c.PlateNo,
                a.Account,
                a.DateIssued,
                c.DateTo,
                c.DateFrom
            FROM
                ${database}.policy a
                    LEFT JOIN
                ${database}.entry_client b ON a.IDNo = b.entry_client_id
                    LEFT JOIN
                ${database}.vpolicy c ON a.PolicyNo = c.PolicyNo
            WHERE
                a.PolicyNo = ?
            `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        claim: {
          claimId: claimDetails[0].claim_id,
          policyNo: req.body.policyNo,
          claimDetails,
          basicDocument: claimBasicDocument[0].basicDocuments,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else if (policyType === "FIRE") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
            SELECT 
                a.IDNo,
                a.PolicyType,
                a.PolicyNo,
                'UCSMI' AS Department,
                IF(b.company <> ''
                        AND b.company IS NOT NULL,
                    b.company,
                    CONCAT(IF(b.lastname <> ''
                                    AND b.lastname IS NOT NULL,
                                CONCAT(b.lastname, ', '),
                                ''),
                            b.firstname,
                            IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                                CONCAT(', ', b.suffix),
                                ''))) AS Name,
                c.*,
                a.DateIssued,
                c.DateTo,
                c.DateFrom
            FROM
                ${database}.policy a
                    LEFT JOIN
                ${database}.entry_client b ON a.IDNo = b.entry_client_id
                    LEFT JOIN
                ${database}.fpolicy c ON a.PolicyNo = c.PolicyNo
            WHERE
                a.PolicyNo = ?
            `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        claim: {
          claimId: req.body.claim_id,
          policyNo: req.body.policyNo,
          claimDetails,
          basicDocument: claimBasicDocument[0].basicDocuments,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else if (policyType === "CGL") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
            SELECT 
                a.IDNo,
                a.PolicyType,
                a.PolicyNo,
                'UCSMI' AS Department,
                IF(b.company <> ''
                        AND b.company IS NOT NULL,
                    b.company,
                    CONCAT(IF(b.lastname <> ''
                                    AND b.lastname IS NOT NULL,
                                CONCAT(b.lastname, ', '),
                                ''),
                            b.firstname,
                            IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                                CONCAT(', ', b.suffix),
                                ''))) AS Name,
                c.*,
                a.DateIssued,
                c.PeriodFrom as DateFrom ,
                c.PeriodTo as DateTo
            FROM
                ${database}.policy a
                    LEFT JOIN
                ${database}.entry_client b ON a.IDNo = b.entry_client_id
                    LEFT JOIN
                ${database}.cglpolicy c ON a.PolicyNo = c.PolicyNo
            WHERE
                a.PolicyNo = ?
            `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        claim: {
          claimId: claimDetails[0].claim_id,
          policyNo: req.body.policyNo,
          claimDetails,
          basicDocument: claimBasicDocument[0].basicDocuments,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else if (policyType === "MAR") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
            SELECT 
                a.IDNo,
                a.PolicyType,
                a.PolicyNo,
                'UCSMI' AS Department,
                IF(b.company <> ''
                        AND b.company IS NOT NULL,
                    b.company,
                    CONCAT(IF(b.lastname <> ''
                                    AND b.lastname IS NOT NULL,
                                CONCAT(b.lastname, ', '),
                                ''),
                            b.firstname,
                            IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                                CONCAT(', ', b.suffix),
                                ''))) AS Name,
                c.*,
                a.DateIssued,
                c.DateTo,
                c.DateFrom
            FROM
                ${database}.policy a
                    LEFT JOIN
                ${database}.entry_client b ON a.IDNo = b.entry_client_id
                    LEFT JOIN
                ${database}.mpolicy c ON a.PolicyNo = c.PolicyNo
            WHERE
                a.PolicyNo = ?
            `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        claim: {
          claimId: claimDetails[0].claim_id,
          policyNo: req.body.policyNo,
          claimDetails,
          basicDocument: claimBasicDocument[0].basicDocuments,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else if (policyType === "MSPR") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
            SELECT 
                a.IDNo,
                a.PolicyType,
                a.PolicyNo,
                'UCSMI' AS Department,
                IF(b.company <> ''
                        AND b.company IS NOT NULL,
                    b.company,
                    CONCAT(IF(b.lastname <> ''
                                    AND b.lastname IS NOT NULL,
                                CONCAT(b.lastname, ', '),
                                ''),
                            b.firstname,
                            IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                                CONCAT(', ', b.suffix),
                                ''))) AS Name,
                c.*,
                 a.DateIssued,
                c.PeriodFrom as DateFrom  ,
                c.PeriodTo as DateTo
            FROM
                ${database}.policy a
                    LEFT JOIN
                ${database}.entry_client b ON a.IDNo = b.entry_client_id
                    LEFT JOIN
                ${database}.msprpolicy c ON a.PolicyNo = c.PolicyNo
            WHERE
                a.PolicyNo = ?
            `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        claim: {
          claimId: claimDetails[0].claim_id,
          policyNo: req.body.policyNo,
          claimDetails,
          basicDocument: claimBasicDocument[0].basicDocuments,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else if (policyType === "PA") {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
            SELECT 
                a.IDNo,
                a.PolicyType,
                a.PolicyNo,
                'UCSMI' AS Department,
                IF(b.company <> ''
                        AND b.company IS NOT NULL,
                    b.company,
                    CONCAT(IF(b.lastname <> ''
                                    AND b.lastname IS NOT NULL,
                                CONCAT(b.lastname, ', '),
                                ''),
                            b.firstname,
                            IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                                CONCAT(', ', b.suffix),
                                ''))) AS Name,
                c.*,
                 a.DateIssued,
                c.PeriodFrom as DateFrom ,
                c.PeriodTo as DateTo
            FROM
                ${database}.policy a
                    LEFT JOIN
                ${database}.entry_client b ON a.IDNo = b.entry_client_id
                    LEFT JOIN
                ${database}.papolicy c ON a.PolicyNo = c.PolicyNo
            WHERE
                a.PolicyNo = ?
            `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        claim: {
          claimId: claimDetails[0].claim_id,
          policyNo: req.body.policyNo,
          claimDetails,
          basicDocument: claimBasicDocument[0].basicDocuments,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    } else {
      res.send({
        data: await prisma.$queryRawUnsafe(
          `
            SELECT 
                a.IDNo,
                a.PolicyType,
                a.PolicyNo,
                'UCSMI' AS Department,
                IF(b.company <> ''
                        AND b.company IS NOT NULL,
                    b.company,
                    CONCAT(IF(b.lastname <> ''
                                    AND b.lastname IS NOT NULL,
                                CONCAT(b.lastname, ', '),
                                ''),
                            b.firstname,
                            IF(b.suffix <> '' AND b.suffix IS NOT NULL,
                                CONCAT(', ', b.suffix),
                                ''))) AS Name,
                c.*,
                a.DateIssued,
                c.BidDate as DateTo,
                c.BidTime as DateFrom
            FROM
                ${database}.policy a
                    LEFT JOIN
                ${database}.entry_client b ON a.IDNo = b.entry_client_id
                    LEFT JOIN
                ${database}.bpolicy c ON a.PolicyNo = c.PolicyNo
            WHERE
                a.PolicyNo = ?
            `,
          req.body.policyNo
        ),
        payment: {
          totalGross,
          totalPaidDeposit,
          totalPaidReturned,
          totalDiscount,
        },
        claim: {
          claimId: claimDetails[0].claim_id,
          policyNo: req.body.policyNo,
          claimDetails,
          basicDocument: claimBasicDocument[0].basicDocuments,
        },
        message: "Successfully Generate Claim ID.",
        success: true,
      });
    }
  } catch (error: any) {
    console.log(error.message);
    res.send({
      data: "",
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Claims.post("/delete-claim", async (req, res): Promise<any> => {
  try {
    const claimId = req.body.claimId;
    const claimDir = path.join(uploadDir, claimId);
    await prisma.$transaction(async (_prisma) => {
      if (
        req.body.isUpdate &&
        !(await saveUserLogsCode(req, "update", claimId, "Claims", _prisma))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }
      await _prisma.$queryRawUnsafe(
        "delete FROM claims.claims where claim_id = ? ",
        claimId
      );
      await _prisma.$queryRawUnsafe(
        "delete FROM claims.claims_details where claim_id = ? ",
        claimId
      );

      if (fs.existsSync(claimDir)) {
        await fs.rm(claimDir, { recursive: true });
      }
      await saveUserLogs(_prisma, req, claimId, "delete", "Claim");
    });

    res.send({
      message: `Successfully Delete Claim ID: ${claimId}`,
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = getFileExtension(file.originalname);
    cb(null, `${uuidV4()}${extension}`);
  },
});
const upload = multer({
  storage,
});

Claims.post("/generate-claim-sheet", async (req, res) => {
  try {
    let Department = req.body.departmentRef;

    let Assured = req.body.assuredRef;
    let UnitInsured = req.body.unitRef;
    let EngineNo = req.body.enigneRef;
    let ChassisNo = req.body.chassisRef;
    let PlateNo = req.body.plateRef;
    let TypeClaim = req.body.claimTypeRef;

    let DatePrepared = format(new Date(req.body.datePrepared), "MMMM dd, yyyy");
    let PolicyNo = req.body.policyNoRef;
    let DateAccident =
      req.body.dateAccidentRef !== ""
        ? format(new Date(req.body.dateAccidentRef), "MMMM dd, yyyy")
        : "";

    let DateIssued = format(new Date(req.body.dateIssuredRef), "MM/dd/yyyy");
    let DateFrom = format(new Date(req.body.dateFromRef), "MMMM dd, yyyy");
    let DateTo = format(new Date(req.body.dateToRef), "MMMM dd, yyyy");

    const outputFilePath = path.join(__dirname, "manok.pdf");
    let PAGE_WIDTH = 612;
    let PAGE_HEIGHT = 792;
    const MARGINS = {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    };

    let yAxis = MARGINS.top;

    const doc = new PDFDocument({
      margin: 0,
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      bufferPages: true,
    });
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);
    doc.font("Helvetica-Bold");
    doc.fontSize(14);
    doc.text(Department, MARGINS.left, yAxis, {
      width: PAGE_WIDTH - (MARGINS.left + MARGINS.right),
      align: "center",
    });
    const firstlineYAxis = yAxis + 30;
    doc
      .moveTo(MARGINS.left, firstlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, firstlineYAxis) // End position
      .stroke();

    yAxis += 50;
    doc.fontSize(20);
    doc.text("CLAIMS INFORMATION SHEET", MARGINS.left, yAxis, {
      width: PAGE_WIDTH - (MARGINS.left + MARGINS.right),
      align: "center",
    });

    const secondlineYAxis = yAxis + 35;
    doc
      .moveTo(MARGINS.left, secondlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, secondlineYAxis) // End position
      .stroke();

    const adjustThridLine = +40;
    const thridlineYAxis = yAxis + 160 + adjustThridLine;
    doc
      .moveTo(MARGINS.left, thridlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, thridlineYAxis) // End position
      .stroke();

    const fourthlineYAxis = yAxis + 175 + adjustThridLine;
    doc.font("Helvetica-Bold");
    doc.fontSize(11);
    doc.text("Insurance Coordinator", MARGINS.left + 2, fourthlineYAxis + 3, {
      width: PAGE_WIDTH - (MARGINS.left + MARGINS.right),
      align: "left",
    });

    doc
      .moveTo(MARGINS.left, fourthlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, fourthlineYAxis) // End position
      .stroke();
    // start Insurance Coordinator

    // end Insurance Coordinator
    const fifthlineYAxis = yAxis + 190 + adjustThridLine;
    doc
      .moveTo(MARGINS.left, fifthlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, fifthlineYAxis) // End position
      .stroke();

    const sixthlineYAxis = yAxis + 290 + adjustThridLine;
    doc
      .moveTo(MARGINS.left, sixthlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, sixthlineYAxis) // End position
      .stroke();
    doc.font("Helvetica-Bold");
    doc.fontSize(11);
    doc.text("Accounting", MARGINS.left + 2, sixthlineYAxis + 3, {
      width: PAGE_WIDTH - (MARGINS.left + MARGINS.right),
      align: "left",
    });

    const seventhlineYAxis = yAxis + 305 + adjustThridLine;
    doc
      .moveTo(MARGINS.left, seventhlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, seventhlineYAxis) // End position
      .stroke();

    // start Accounting

    // end Accounting
    const eighthlineYAxis = yAxis + 405 + adjustThridLine;
    doc
      .moveTo(MARGINS.left, eighthlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, eighthlineYAxis) // End position
      .stroke();

    doc.font("Helvetica-Bold");
    doc.fontSize(11);
    doc.text("Remarks:", MARGINS.left + 2, eighthlineYAxis + 3, {
      width: PAGE_WIDTH - (MARGINS.left + MARGINS.right),
      align: "left",
    });

    // start Remarks

    // end Remarks
    const ninthlineYAxis = yAxis + 520 + adjustThridLine;
    doc
      .moveTo(MARGINS.left, ninthlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, ninthlineYAxis) // End position
      .stroke();

    const tenthlineYAxis = yAxis + 535 + adjustThridLine;
    doc
      .moveTo(MARGINS.left, tenthlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, tenthlineYAxis) // End position
      .stroke();
    // start Signatures
    doc.font("Helvetica");
    doc.fontSize(10);

    doc.text("Prepared by", MARGINS.left + 20, tenthlineYAxis + 5, {
      width: 180,
      align: "left",
    });

    doc.text("Checked by", MARGINS.left + 180 + 30, tenthlineYAxis + 5, {
      width: 150,
      align: "left",
    });

    // end Signatures
    const eleventhlineYAxis = yAxis + 610 + adjustThridLine;
    doc
      .moveTo(MARGINS.left, eleventhlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, eleventhlineYAxis) // End position
      .stroke();

    doc.font("Helvetica-Bold");
    doc.fontSize(12);
    doc.text("Joy Dela Cruz", MARGINS.left + 20, eleventhlineYAxis - 32, {
      width: 150,
      align: "left",
    });

    doc.text("Gina Rondina", MARGINS.left + 12 + 200, eleventhlineYAxis - 32, {
      width: 150,
      align: "left",
    });
    doc.text(
      "Leo Aquino",
      MARGINS.left + 12 + 200 * 2,
      eleventhlineYAxis - 32,
      {
        width: 150,
        align: "left",
      }
    );

    doc.font("Helvetica");
    doc.fontSize(8);
    doc.text("Claims Assistant", MARGINS.left + 30, eleventhlineYAxis - 15, {
      width: 180,
      align: "left",
    });

    doc.text("Accounting", MARGINS.left + 30 + 200, eleventhlineYAxis - 15, {
      width: 200,
      align: "left",
    });
    doc.text("President", MARGINS.left + 30 + 200 * 2, eleventhlineYAxis - 15, {
      width: 200,
      align: "left",
    });

    // other Horizontal line
    doc
      .moveTo(MARGINS.left + 350, secondlineYAxis + 40) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, secondlineYAxis + 40) // End position
      .stroke();

    doc
      .moveTo(MARGINS.left + 350, secondlineYAxis + 80) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, secondlineYAxis + 80) // End position
      .stroke();

    doc.font("Helvetica-Bold");
    doc.fontSize(10);
    doc.text("Date Prepared", MARGINS.left + 352, secondlineYAxis + 5, {
      width: 150,
      align: "left",
    });

    doc.text("Policy No", MARGINS.left + 352, secondlineYAxis + 45, {
      width: 150,
      align: "left",
    });

    doc.text("Date of Accident", MARGINS.left + 352, secondlineYAxis + 85, {
      width: 150,
      align: "left",
    });

    doc.font("Helvetica-Bold");
    doc.fontSize(11);
    doc
      .moveTo(MARGINS.left + 350, sixthlineYAxis - 33) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, sixthlineYAxis - 33) // End position
      .stroke();

    doc.text("Angelo Dacula", MARGINS.left + 350, sixthlineYAxis - 30, {
      width: 160,
      align: "center",
    });

    // other veritcal line
    doc
      .moveTo(MARGINS.left + 350, secondlineYAxis) // Start position
      .lineTo(MARGINS.left + 350, thridlineYAxis) // End position
      .stroke();

    doc
      .moveTo(MARGINS.left, secondlineYAxis) // Start position
      .lineTo(MARGINS.left, thridlineYAxis) // End position
      .stroke();

    doc
      .moveTo(PAGE_WIDTH - MARGINS.right, secondlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, thridlineYAxis) // End position
      .stroke();

    doc
      .moveTo(MARGINS.left, fourthlineYAxis) // Start position
      .lineTo(MARGINS.left, ninthlineYAxis) // End position
      .stroke();

    doc
      .moveTo(PAGE_WIDTH - MARGINS.right, fourthlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, ninthlineYAxis) // End position
      .stroke();

    doc
      .moveTo(MARGINS.left, tenthlineYAxis) // Start position
      .lineTo(MARGINS.left, eleventhlineYAxis) // End position
      .stroke();

    doc
      .moveTo(PAGE_WIDTH - MARGINS.right, tenthlineYAxis) // Start position
      .lineTo(PAGE_WIDTH - MARGINS.right, eleventhlineYAxis) // End position
      .stroke();

    // details

    // assured name
    doc.text("Assured's Name", MARGINS.left + 3, secondlineYAxis + 3, {
      width: 90,
      align: "left",
    });

    doc.text(":", MARGINS.left + 3 + 90, secondlineYAxis + 3, {
      width: 5,
      align: "left",
    });

    const xAsix = MARGINS.left + 3 + 100;

    doc.text(Assured, xAsix, secondlineYAxis + 5, {
      width: 250,
      align: "left",
      height: 60,
    });

    let assuredH = 20;
    if (Assured !== "") {
      assuredH = doc.heightOfString(Assured, {
        width: 250,
        align: "left",
        height: 30,
      });
    }

    let adjustFromUnitInsured = assuredH + 5;
    // Unit Insured
    doc.text(
      "Unit Insured",
      MARGINS.left + 3,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 90,
        align: "left",
      }
    );

    doc.text(
      ":",
      MARGINS.left + 3 + 90,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 5,
        align: "left",
      }
    );

    doc.text(UnitInsured, xAsix, secondlineYAxis + adjustFromUnitInsured, {
      width: 250,
      align: "left",
      height: 30,
    });

    let UnitInsuredH = 20;
    if (UnitInsured !== "") {
      UnitInsuredH = doc.heightOfString(UnitInsured, {
        width: 250,
        align: "left",
        height: 30,
      });
    }

    adjustFromUnitInsured += UnitInsuredH + 3;
    // Engine No
    doc.text(
      "Engine No.",
      MARGINS.left + 3,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 90,
        align: "left",
      }
    );

    doc.text(
      ":",
      MARGINS.left + 3 + 90,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 5,
        align: "left",
      }
    );

    doc.text(EngineNo, xAsix, secondlineYAxis + adjustFromUnitInsured, {
      width: 250,
      align: "left",
      height: 30,
    });

    adjustFromUnitInsured += 18;
    // Chassis No
    doc.text(
      "Chassis No.",
      MARGINS.left + 3,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 90,
        align: "left",
      }
    );

    doc.text(
      ":",
      MARGINS.left + 3 + 90,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 5,
        align: "left",
      }
    );
    doc.text(ChassisNo, xAsix, secondlineYAxis + adjustFromUnitInsured, {
      width: 250,
      align: "left",
      height: 30,
    });
    adjustFromUnitInsured += 18;
    // Plate No
    doc.text(
      "Plate No.",
      MARGINS.left + 3,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 90,
        align: "left",
      }
    );

    doc.text(
      ":",
      MARGINS.left + 3 + 90,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 5,
        align: "left",
      }
    );
    doc.text(PlateNo, xAsix, secondlineYAxis + adjustFromUnitInsured, {
      width: 250,
      align: "left",
      height: 30,
    });
    adjustFromUnitInsured += 18;
    // Type of Claim
    doc.text(
      "Type of Claim.",
      MARGINS.left + 3,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 90,
        align: "left",
      }
    );

    doc.text(
      ":",
      MARGINS.left + 3 + 90,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 5,
        align: "left",
      }
    );
    doc.text(TypeClaim, xAsix, secondlineYAxis + adjustFromUnitInsured, {
      width: 250,
      align: "left",
      height: 30,
    });

    adjustFromUnitInsured += 140;
    doc.text(
      "Date Issued",
      MARGINS.left + 3,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 90,
        align: "center",
      }
    );
    doc.text(
      ":",
      MARGINS.left + 3 + 90,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 5,
        align: "left",
      }
    );
    doc.text(DateIssued, xAsix, secondlineYAxis + adjustFromUnitInsured, {
      width: 250,
      align: "left",
      height: 30,
    });

    adjustFromUnitInsured += 20;
    doc.text(
      "Inception date",
      MARGINS.left + 3,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 90,
        align: "center",
      }
    );
    doc.text(
      ":",
      MARGINS.left + 3 + 90,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 5,
        align: "left",
      }
    );
    doc.text(
      `${DateFrom} - ${DateTo}`,
      xAsix,
      secondlineYAxis + adjustFromUnitInsured,
      {
        width: 250,
        align: "left",
        height: 30,
      }
    );

    let adjustFromPrepared = 20;
    let xAsixFromPrepared = MARGINS.left + 3 + 350;
    doc.text(
      DatePrepared,
      xAsixFromPrepared,
      secondlineYAxis + adjustFromPrepared,
      {
        width: 250,
        align: "left",
        height: 30,
      }
    );
    adjustFromPrepared += 40;
    doc.text(
      PolicyNo,
      xAsixFromPrepared,
      secondlineYAxis + adjustFromPrepared,
      {
        width: 250,
        align: "left",
        height: 30,
      }
    );

    adjustFromPrepared += 40;
    doc.text(
      DateAccident,
      xAsixFromPrepared,
      secondlineYAxis + adjustFromPrepared,
      {
        width: 250,
        align: "left",
        height: 30,
      }
    );

    doc.end();

    writeStream.on("finish", () => {
      console.log(`PDF created successfully at: ${outputFilePath}`);

      const readStream = fs.createReadStream(outputFilePath);
      readStream.pipe(res);

      readStream.on("end", () => {
        res.end(); // Ensure response is properly closed
        fs.unlink(outputFilePath, (err: any) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log(`File ${outputFilePath} deleted successfully.`);
          }
        });
      });
      readStream.on("error", (err) => {
        console.error("Error reading file:", err);
        res.status(500).send("Error sending PDF");
      });
    });
  } catch (error: any) {
    if (error.code === "P2028") {
      res.send({
        data: [],
        message: `⚠️ Transaction cut off due to a network issue!`,
        success: false,
      });
    } else {
      res.send({
        data: [],
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
      });
    }
  }
});
Claims.post(
  "/save-claim",
  upload.fields([{ name: "files" }, { name: "basic" }]),
  async (req, res): Promise<any> => {
    try {
      const reqFile = req.files as any;
      const claimId = req.body.claimId;
      const policyDetails = JSON.parse(req.body.policyDetails);
      const __metadata = Array.isArray(req.body.metadata)
        ? req.body.metadata
        : [req.body.metadata];

      const filesArray = JSON.parse(req.body.filesArray);
      const uploadedFiles = (reqFile.files as Express.Multer.File[]) || [];

      const basicDocuments = JSON.parse(req.body.basicDocuments);
      const uploadedBasicFiles = (reqFile.basic as Express.Multer.File[]) || [];

      const mainDir = path.join(uploadDir, claimId);
      if (fs.existsSync(mainDir)) {
        fs.rmSync(mainDir, { recursive: true, force: true });
      }
      let updatedbasicDocuments = [];
      if (uploadedBasicFiles.length > 0) {
        updatedbasicDocuments = basicDocuments.map((itm: any) => {
          const newFileArray: any = [];
          uploadedBasicFiles.forEach((file) => {
            const [id] = file.originalname.split("-").slice(-1);
            if (itm.id === parseInt(id)) {
              newFileArray.push(file.filename);
            }
          });
          itm.files = newFileArray;

          return itm;
        });
      }

      await prisma.$transaction(async (__prisma) => {
        await __prisma.claims.create({
          data: {
            claim_id: claimId,
            policyNo: policyDetails.data[0].PolicyNo,
            department: policyDetails.data[0].Department,
            account: policyDetails.data[0].Account,
            assurename: policyDetails.data[0].Name,
            idno: policyDetails.data[0].IDNo,
            policyType: policyDetails.data[0].PolicyType,
            basicDocuments: JSON.stringify(updatedbasicDocuments),
          },
        });
        for (let index = 0; index < filesArray.length; index++) {
          const metadata = JSON.parse(__metadata[index]);
          const group = filesArray[index];
          const groupByRow: any = [];
          const detailsJsonByRow: any = [];

          group.forEach((items: any) => {
            const groupFiles: any = [];
            const groupFilename: any = [];

            uploadedFiles.forEach((file) => {
              const [reference, document_id, column_id] = file.originalname
                .split("-")
                .slice(-3);

              if (
                items.reference === reference &&
                items.document_id === document_id &&
                items.id.toString() === column_id
              ) {
                groupFiles.push(file);
                groupFilename.push(file.filename);
              }
            });
            detailsJsonByRow.push({
              id: items.id,
              label: items.label,
              files: groupFilename,
              document_id: items.document_id,
              required: items.required,
              primaryDocuments: items.primaryDocuments,
              others: items.others,
            });
            groupByRow.push(groupFiles);
          });

          const filesToSave = groupByRow.flat(Infinity);
          const claimDir = path.join(
            uploadDir,
            claimId,
            metadata.reference,
            metadata.documentId
          );
          if (!fs.existsSync(claimDir)) {
            fs.mkdirSync(claimDir, { recursive: true });
          }

          filesToSave.forEach((file: Express.Multer.File) => {
            const sourceImagePath = path.join(uploadDir, file.filename);
            const targetImagePath = path.join(claimDir, file.filename);
            fs.copyFile(sourceImagePath, targetImagePath, (err) => {
              if (err) {
                console.error("Error copying file:", err);
              } else {
                console.log("Image copied successfully to:", targetImagePath);
                fs.unlink(sourceImagePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error("Error deleting source file:", unlinkErr);
                  } else {
                    console.log("Source file deleted:", sourceImagePath);
                  }
                });
              }
            });
          });

          await __prisma.claims_details.create({
            data: {
              claim_id: claimId,
              claim_reference_no: metadata.reference,
              document_id: metadata.documentId,
              claim_type: metadata.claim_type,
              date_report: new Date(metadata.date_report_not_formated),
              date_accident: new Date(metadata.date_accident_not_formated),
              date_received:
                metadata.date_receive_not_formated !== ""
                  ? new Date(metadata.date_receive_not_formated)
                  : null,
              date_approved:
                metadata.date_approved_not_formated !== ""
                  ? new Date(metadata.date_approved_not_formated)
                  : null,
              status: metadata.status,
              claimStatus: metadata.claimStatus,
              amount_claim: metadata.amount_claim.replace(/,/g, ""),
              amount_approved: metadata.amount_approved.replace(/,/g, ""),
              participation: metadata.amount_participation.replace(/,/g, ""),
              net_amount: metadata.amount_net.replace(/,/g, ""),
              name_ttpd: metadata.name_ttpd.replace(/,/g, ""),
              remarks: metadata.remarks,
              documents: JSON.stringify(detailsJsonByRow),
            },
          });
        }

        const basicDir = path.join(uploadDir, claimId);
        if (uploadedBasicFiles) {
          if (uploadedBasicFiles.length > 0) {
            uploadedBasicFiles.forEach((file: Express.Multer.File) => {
              const sourceImagePath = path.join(uploadDir, file.filename);
              const targetImagePath = path.join(basicDir, file.filename);
              fs.copyFile(sourceImagePath, targetImagePath, (err) => {
                if (err) {
                  console.error("Error copying file:", err);
                } else {
                  console.log("Image copied successfully to:", targetImagePath);
                  fs.unlink(sourceImagePath, (unlinkErr) => {
                    if (unlinkErr) {
                      console.error("Error deleting source file:", unlinkErr);
                    } else {
                      console.log("Source file deleted:", sourceImagePath);
                    }
                  });
                }
              });
            });
          }
        }

        await saveUserLogs(__prisma, req, claimId, "save", "Claim");
      });

      res.send({
        data: [],
        message: "Successfully Save Claim.",
        success: true,
      });
    } catch (error: any) {
      console.log(error);
      if (error.code === "P2028") {
        res.send({
          data: [],
          message: `⚠️ Transaction cut off due to a network issue!`,
          success: false,
        });
      } else {
        res.send({
          data: [],
          message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
          success: false,
        });
      }
    }
  }
);
Claims.post(
  "/update-claim",
  upload.fields([{ name: "files" }, { name: "basic" }]),
  async (req, res): Promise<any> => {
    try {
      const reqFile = req.files as any;
      const claimId = req.body.claimId;
      const mainDir = path.join(uploadDir, claimId);

      await prisma.$transaction(async (_prisma) => {
        await fs.access(mainDir); // Check if the directory exists
        await fs.rm(mainDir, { recursive: true, force: true });

        if (
          !(await saveUserLogsCode(req, "update", claimId, "Claim", _prisma))
        ) {
          return res.send({ message: "Invalid User Code", success: false });
        }

        await prisma.$queryRawUnsafe(
          `DELETE FROM claims.claims where claim_id = ?`,
          claimId
        );
        await prisma.$queryRawUnsafe(
          `DELETE FROM claims.claims_details where claim_id = ?`,
          claimId
        );

        const policyDetails = JSON.parse(req.body.policyDetails);
        const __metadata = Array.isArray(req.body.metadata)
          ? req.body.metadata
          : [req.body.metadata];

        const filesArray = JSON.parse(req.body.filesArray);
        const uploadedFiles = reqFile.files as Express.Multer.File[];

        const basicDocuments = JSON.parse(req.body.basicDocuments);
        const uploadedBasicFiles =
          (reqFile.basic as Express.Multer.File[]) || [];
        let updatedbasicDocuments = [];
        if (uploadedBasicFiles.length > 0) {
          updatedbasicDocuments = basicDocuments.map((itm: any) => {
            const newFileArray: any = [];
            uploadedBasicFiles.forEach((file) => {
              const [id] = file.originalname.split("-").slice(-1);
              if (itm.id === parseInt(id)) {
                newFileArray.push(file.filename);
              }
            });
            itm.files = newFileArray;

            return itm;
          });
        }

        await _prisma.claims.create({
          data: {
            claim_id: claimId,
            policyNo: policyDetails.data[0].PolicyNo,
            department: policyDetails.data[0].Department,
            account: policyDetails.data[0].Account,
            assurename: policyDetails.data[0].Name,
            idno: policyDetails.data[0].IDNo,
            policyType: policyDetails.data[0].PolicyType,
            basicDocuments: JSON.stringify(updatedbasicDocuments),
          },
        });
        for (let index = 0; index < filesArray.length; index++) {
          const metadata = JSON.parse(__metadata[index]);
          const group = filesArray[index];
          const groupByRow: any = [];
          const detailsJsonByRow: any = [];

          group.forEach((items: any) => {
            const groupFiles: any = [];
            const groupFilename: any = [];

            uploadedFiles.forEach((file) => {
              const [reference, document_id, column_id] = file.originalname
                .split("-")
                .slice(-3);

              if (
                items.reference === reference &&
                items.document_id === document_id &&
                items.id.toString() === column_id
              ) {
                groupFiles.push(file);
                groupFilename.push(file.filename);
              }
            });
            detailsJsonByRow.push({
              id: items.id,
              label: items.label,
              files: groupFilename,
              document_id: items.document_id,
              required: items.required,
              primaryDocuments: items.primaryDocuments,
              others: items.others,
            });
            groupByRow.push(groupFiles);
          });

          const filesToSave = groupByRow.flat(Infinity);
          const claimDir = path.join(
            uploadDir,
            claimId,
            metadata.reference,
            metadata.documentId
          );
          if (!fs.existsSync(claimDir)) {
            fs.mkdirSync(claimDir, { recursive: true });
          }

          for (const file of filesToSave) {
            const sourceImagePath = path.join(uploadDir, file.filename);
            const targetImagePath = path.join(claimDir, file.filename);

            try {
              // Check if source file exists
              await fs.access(sourceImagePath);

              // Copy file
              await fs.copyFile(sourceImagePath, targetImagePath);
              console.log("Image copied successfully to:", targetImagePath);

              // Delete source file
              await fs.unlink(sourceImagePath);
              console.log("Source file deleted:", sourceImagePath);
            } catch (err) {
              console.error("Error handling file:", file.filename, err);
            }
          }
          filesToSave.forEach((file: Express.Multer.File) => {
            const sourceImagePath = path.join(uploadDir, file.filename);
            const targetImagePath = path.join(claimDir, file.filename);
            fs.copyFile(sourceImagePath, targetImagePath, (err) => {
              if (err) {
                console.error("Error copying file:", err);
              } else {
                console.log("Image copied successfully to:", targetImagePath);
                fs.unlink(sourceImagePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error("Error deleting source file:", unlinkErr);
                  } else {
                    console.log("Source file deleted:", sourceImagePath);
                  }
                });
              }
            });
          });

          await _prisma.claims_details.create({
            data: {
              claim_id: claimId,
              claim_reference_no: metadata.reference,
              document_id: metadata.documentId,
              claim_type: metadata.claim_type,
              date_report: new Date(metadata.date_report_not_formated),
              date_accident: new Date(metadata.date_accident_not_formated),
              date_received:
                metadata.date_receive_not_formated !== ""
                  ? new Date(metadata.date_receive_not_formated)
                  : null,
              date_approved:
                metadata.date_approved_not_formated !== ""
                  ? new Date(metadata.date_approved_not_formated)
                  : null,
              status: metadata.status,
              claimStatus: metadata.claimStatus,
              amount_claim: metadata.amount_claim.replace(/,/g, ""),
              amount_approved: metadata.amount_approved.replace(/,/g, ""),
              participation: metadata.amount_participation.replace(/,/g, ""),
              net_amount: metadata.amount_net.replace(/,/g, ""),
              name_ttpd: metadata.name_ttpd.replace(/,/g, ""),
              remarks: metadata.remarks,
              documents: JSON.stringify(detailsJsonByRow),
            },
          });
        }
        const basicDir = path.join(uploadDir, claimId);
        if (uploadedBasicFiles) {
          if (uploadedBasicFiles.length > 0) {
            uploadedBasicFiles.forEach((file: Express.Multer.File) => {
              const sourceImagePath = path.join(uploadDir, file.filename);
              const targetImagePath = path.join(basicDir, file.filename);
              fs.copyFile(sourceImagePath, targetImagePath, (err) => {
                if (err) {
                  console.error("Error copying file:", err);
                } else {
                  console.log("Image copied successfully to:", targetImagePath);
                  fs.unlink(sourceImagePath, (unlinkErr) => {
                    if (unlinkErr) {
                      console.error("Error deleting source file:", unlinkErr);
                    } else {
                      console.log("Source file deleted:", sourceImagePath);
                    }
                  });
                }
              });
            });
          }
        }

        await saveUserLogs(_prisma, req, claimId, "update", "Claim");
      });

      res.send({
        data: [],
        message: "Successfully Save Claim.",
        success: true,
      });
    } catch (error: any) {
      console.log(error);
      if (error.code === "P2028") {
        res.send({
          data: [],
          message: `⚠️ Transaction cut off due to a network issue!`,
          success: false,
        });
      } else {
        res.send({
          data: [],
          message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
          success: false,
        });
      }
    }
  }
);
function getFileExtension(filename: string) {
  let dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) return null; // No extension found
  return filename.substring(dotIndex).split(/[^a-zA-Z0-9.]/)[0];
}
async function getUserById(UserId: string) {
  return await prisma.users.findUnique({
    where: { UserId },
  });
}
export async function saveUserLogsCode(
  req: any,
  action: string,
  dataString: string,
  module: string,
  _prisma: any
) {
  const user = await getUserById((req.user as any).UserId);

  if (
    compareSync(
      req.body.userCodeConfirmation,
      user?.userConfirmationCode as string
    )
  ) {
    await _prisma.system_logs.create({
      data: {
        action,
        username: user?.Username as string,
        dataString,
        createdAt: new Date(),
        user_id: user?.UserId as string,
        module,
        account_type: user?.AccountType as string,
      },
    });

    return true;
  }
  return false;
}
export async function saveUserLogs(
  _prisma: any,
  req: any,
  dataString: string,
  action: string,
  module: string
) {
  const user = await getUserById((req.user as any).UserId);
  await _prisma.system_logs.create({
    data: {
      action,
      username: user?.Username as string,
      dataString,
      createdAt: new Date(),
      user_id: user?.UserId as string,
      module,
      account_type: user?.AccountType as string,
    },
  });
}
async function generateUniqueClaimID() {
  let uniqueID;
  let exists = true;

  while (exists) {
    uniqueID = Math.floor(100000000 + Math.random() * 900000000);

    // Check if it exists
    const rows = (await prisma.$queryRawUnsafe(
      "SELECT COUNT(*) AS count FROM claims_details WHERE claim_reference_no = ?",
      uniqueID
    )) as Array<any>;
    if (parseInt(rows[0].count) === 0) {
      exists = false;
    }
  }

  return `${uniqueID}`;
}

export default Claims;
