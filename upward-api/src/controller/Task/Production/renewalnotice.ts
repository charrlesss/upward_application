import express, { Request, Response } from "express";
import { __executeQuery } from "../../../model/Task/Production/policy";
import { prisma } from "../..";
import PDFReportGenerator from "../../../lib/pdf-generator";
import { format } from "date-fns";
import path from "path";
import { formatNumber } from "../Accounting/collection";

const RenewalNotice = express.Router();

RenewalNotice.post("/get-balance", async (req, res) => {
  try {
    const totalGross = await prisma.$queryRawUnsafe(
      `SELECT TotalDue FROM policy where PolicyNo = ?`,
      req.body.policyNo
    );
    const totalPaidDeposit = await prisma.$queryRawUnsafe(
      `SELECT  ifNull(SUM(Credit),0)  as totalDeposit FROM journal where Source_Type = 'OR' and GL_Acct = '1.03.01' and ID_No = ?`,
      req.body.policyNo
    );
    const totalPaidReturned = await prisma.$queryRawUnsafe(
      `SELECT ifNull(SUM(Debit),0) as totalReturned FROM journal where Source_Type = 'RC'   and GL_Acct = '1.03.01' and ID_No = ?`,
      req.body.policyNo
    );
    const totalDiscount = await prisma.$queryRawUnsafe(
      `SELECT ifNull(SUM(Debit),0)  as discount FROM journal where Source_Type = 'GL'  and GL_Acct = '7.10.15'   and ID_No = ?`,
      req.body.policyNo
    );

    res.send({
      message: "Search Successfully",
      success: true,
      payment: {
        totalGross,
        totalPaidDeposit,
        totalPaidReturned,
        totalDiscount,
      },
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data: [] });
  }
});
RenewalNotice.post("/search-policy-renewal-notice-com", async (req, res) => {
  try {
    const qry = `
           SELECT 
          date_format(Policy.DateIssued,'%M  %d, %Y') AS Date, 
          Policy.PolicyNo, 
          Policy.Account, 
          ID_Entry.cID_No AS Name,
          VPolicy.ChassisNo,
          EstimatedValue,
          SecIIPercent,
          BodilyInjury,
          PropertyDamage,
          PersonalAccident,
          Sec4A,
          Sec4B,
          Sec4C
        FROM policy as Policy
        LEFT JOIN vpolicy as VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo 
        LEFT JOIN ( 
          SELECT 
                        a.entry_client_id as IDNo,
                            sub_account,
                            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                    FROM
                        entry_client a UNION ALL SELECT 
                        a.entry_supplier_id as IDNo,
                            sub_account,
                            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                    FROM
                        entry_supplier a UNION ALL SELECT 
                        a.entry_employee_id as IDNo,
                            sub_account,
                            IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                    FROM
                        entry_employee a UNION ALL SELECT 
                        a.entry_fixed_assets_id as IDNo, sub_account, a.fullname AS cID_No
                    FROM
                        entry_fixed_assets a UNION ALL SELECT 
                        a.entry_others_id as IDNo, sub_account, a.description AS cID_No
                    FROM
                        entry_others a UNION ALL SELECT 
                        a.entry_agent_id as IDNo,
                            sub_account,
                            IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                    FROM
                        entry_agent a
        ) ID_Entry  ON Policy.IDNo = ID_Entry.IDNo
        WHERE 
        (
          (VPolicy.ChassisNo LIKE ?) 
          OR (VPolicy.MotorNo LIKE ?) 
          OR (VPolicy.PlateNo LIKE ?) 
          OR (ID_Entry.cID_No LIKE ?) 
          OR (Policy.PolicyNo LIKE ?) 
          OR (Policy.Account LIKE ?)
          OR (ID_Entry.IDNo LIKE ?)
        )
        AND Policy.PolicyType = 'COM'
        ORDER BY Policy.DateIssued desc
        limit 500`;
    const params = [
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
    ];

    res.send({
      message: "Search Successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(qry, ...params),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data: [] });
  }
});
RenewalNotice.post("/search-policy-renewal-notice-fire", async (req, res) => {
  try {
    const qry = `
           SELECT 
                date_format(a.DateIssued,'%M  %d, %Y') AS Date, 
                a.PolicyNo, 
                a.Account, 
                c.cID_No AS Name,
                '' as ChassisNo,
                PropertyInsured
            FROM
                policy a
                    LEFT JOIN
                fpolicy b ON a.PolicyNo = b.PolicyNo
                    LEFT JOIN
                (SELECT 
                    a.entry_client_id AS IDNo,
                        sub_account,
                        IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                FROM
                    entry_client a UNION ALL SELECT 
                    a.entry_supplier_id AS IDNo,
                        sub_account,
                        IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                FROM
                    entry_supplier a UNION ALL SELECT 
                    a.entry_employee_id AS IDNo,
                        sub_account,
                        IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                FROM
                    entry_employee a UNION ALL SELECT 
                    a.entry_fixed_assets_id AS IDNo,
                        sub_account,
                        a.fullname AS cID_No
                FROM
                    entry_fixed_assets a UNION ALL SELECT 
                    a.entry_others_id AS IDNo,
                        sub_account,
                        a.description AS cID_No
                FROM
                    entry_others a UNION ALL SELECT 
                    a.entry_agent_id AS IDNo,
                        sub_account,
                        IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                FROM
                    entry_agent a) c ON a.IDNo = c.IDNo
            WHERE
            a.PolicyType = 'FIRE' and
            (a.PolicyNo like ?
            OR a.IDNo like ?
            OR c.cID_No like ?
            OR a.Account like ?)
            ORDER BY a.DateIssued desc
            limit 500
      `;
    const params = [
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
    ];

    res.send({
      message: "Search Successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(qry, ...params),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data: [] });
  }
});
RenewalNotice.post("/search-policy-renewal-notice-mar", async (req, res) => {
  try {
    const qry = `
           SELECT 
                date_format(a.DateIssued,'%M  %d, %Y') AS Date, 
                a.PolicyNo, 
                a.Account, 
                c.cID_No AS Name,
                '' as ChassisNo,
                SubjectInsured,
                AdditionalInfo
            FROM
                policy a
                    LEFT JOIN
                mpolicy b ON a.PolicyNo = b.PolicyNo
                    LEFT JOIN
                (SELECT 
                    a.entry_client_id AS IDNo,
                        sub_account,
                        IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                FROM
                    entry_client a UNION ALL SELECT 
                    a.entry_supplier_id AS IDNo,
                        sub_account,
                        IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                FROM
                    entry_supplier a UNION ALL SELECT 
                    a.entry_employee_id AS IDNo,
                        sub_account,
                        IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                FROM
                    entry_employee a UNION ALL SELECT 
                    a.entry_fixed_assets_id AS IDNo,
                        sub_account,
                        a.fullname AS cID_No
                FROM
                    entry_fixed_assets a UNION ALL SELECT 
                    a.entry_others_id AS IDNo,
                        sub_account,
                        a.description AS cID_No
                FROM
                    entry_others a UNION ALL SELECT 
                    a.entry_agent_id AS IDNo,
                        sub_account,
                        IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                FROM
                    entry_agent a) c ON a.IDNo = c.IDNo
            WHERE
            a.PolicyType = 'MAR' and
           ( a.PolicyNo like ?
            OR a.IDNo like ?
            OR c.cID_No like ?
            OR a.Account like ?)
            ORDER BY a.DateIssued desc
            limit 500
      `;
    const params = [
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
    ];

    res.send({
      message: "Search Successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(qry, ...params),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data: [] });
  }
});
RenewalNotice.post("/search-policy-renewal-notice-pa", async (req, res) => {
  try {
    const qry = `
           SELECT 
                date_format(a.DateIssued,'%M  %d, %Y') AS Date, 
                a.PolicyNo, 
                a.Account, 
                c.cID_No AS Name,
                '' as ChassisNo
            FROM
                policy a
                    LEFT JOIN
                papolicy b ON a.PolicyNo = b.PolicyNo
                    LEFT JOIN
                (SELECT 
                    a.entry_client_id AS IDNo,
                        sub_account,
                        IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                FROM
                    entry_client a UNION ALL SELECT 
                    a.entry_supplier_id AS IDNo,
                        sub_account,
                        IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                FROM
                    entry_supplier a UNION ALL SELECT 
                    a.entry_employee_id AS IDNo,
                        sub_account,
                        IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                FROM
                    entry_employee a UNION ALL SELECT 
                    a.entry_fixed_assets_id AS IDNo,
                        sub_account,
                        a.fullname AS cID_No
                FROM
                    entry_fixed_assets a UNION ALL SELECT 
                    a.entry_others_id AS IDNo,
                        sub_account,
                        a.description AS cID_No
                FROM
                    entry_others a UNION ALL SELECT 
                    a.entry_agent_id AS IDNo,
                        sub_account,
                        IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                FROM
                    entry_agent a) c ON a.IDNo = c.IDNo
            WHERE
             a.PolicyType = 'PA' and
            (a.PolicyNo like ?
            OR a.IDNo like ?
            OR c.cID_No like ?
            OR a.Account like ?)
            ORDER BY a.DateIssued desc
            limit 500
      `;
    const params = [
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
    ];

    res.send({
      message: "Search Successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(qry, ...params),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data: [] });
  }
});
RenewalNotice.post("/generate-renewal-notice-pdf", async (req, res) => {
  try {
    if (req.body.PolicyType === "COM") {
      PDFCOM(res, req);
    } else if (req.body.PolicyType === "FIRE") {
      PDFFIRE(res, req);
    } else if (req.body.PolicyType === "MAR") {
      PDFMAR(res, req);
    } else if (req.body.PolicyType === "PA") {
      PDFPA(res, req);
    } else {
      PDFCOM(res, req);
    }
  } catch (err: any) {
    console.log(err.message);
    res.send({ message: err.message, success: false, data: [] });
  }
});
async function PDFCOM(res: Response, req: Request) {
  const data: any = await prisma.$queryRawUnsafe(
    `
          SELECT 
          *
         
        FROM policy as Policy
        LEFT JOIN vpolicy as VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo 
        LEFT JOIN ( 
          SELECT 
                        a.entry_client_id as IDNo,
                            sub_account,
                            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                    FROM
                        entry_client a UNION ALL SELECT 
                        a.entry_supplier_id as IDNo,
                            sub_account,
                            IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                    FROM
                        entry_supplier a UNION ALL SELECT 
                        a.entry_employee_id as IDNo,
                            sub_account,
                            IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                    FROM
                        entry_employee a UNION ALL SELECT 
                        a.entry_fixed_assets_id as IDNo, sub_account, a.fullname AS cID_No
                    FROM
                        entry_fixed_assets a UNION ALL SELECT 
                        a.entry_others_id as IDNo, sub_account, a.description AS cID_No
                    FROM
                        entry_others a UNION ALL SELECT 
                        a.entry_agent_id as IDNo,
                            sub_account,
                            IF(a.lastname IS NOT NULL
                                AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                    FROM
                        entry_agent a
        ) ID_Entry  ON Policy.IDNo = ID_Entry.IDNo
        WHERE 
        Policy.PolicyNo = ?
    `,
    req.body.PolicyNo
  );

  let PAGE_WIDTH = 594;
  let PAGE_HEIGHT = 841;

  const props: any = {
    data: [],
    columnWidths: [90, 80, 150, 80, 60, 80, 80, 60],
    headers: [],
    keys: [],
    title: "",
    adjustTitleFontSize: 6,
    setRowFontSize: 10,
    BASE_FONT_SIZE: 6,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    MARGIN: { top: 80, right: 20, bottom: 30, left: 20 },
    beforeDraw: (
      pdfReportGenerator: PDFReportGenerator,
      doc: PDFKit.PDFDocument
    ) => {
      doc.image(
        path.join(path.dirname(__dirname), "../../../static/image/logo.png"),
        30,
        20,
        {
          fit: [120, 120],
        }
      );
      doc.fontSize(60);
      doc.font("Helvetica-Bold");
      doc.text("UPWARD", 155, 30);

      if (process.env.DEPARTMENT === "UMIS") {
        doc.fontSize(9);
        doc.text("MANAGEMENT INSURANCE SERVICES", 245, 80);
      }
      if (process.env.DEPARTMENT === "UCSMI") {
        doc.fontSize(9);
        doc.text("CONSULTANCY SERVICES AND MANAGEMENT INC.", 190, 80);
      }
      doc.fontSize(20);
      doc.text("RENEWAL NOTICE", 0, 120, {
        width: PAGE_WIDTH,
        align: "center",
      });

      doc.fontSize(10);

      const PAGE_WIDTH_WITH_MARGIN = PAGE_WIDTH - 60;

      doc.text(format(new Date(), "MMMM dd, yyyy"), 30, 150, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "right",
      });
      if (data.length > 0) {
        doc.text(data[0].cID_No, 30, 165, {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        });
      }

      doc.fontSize(9);
      doc.font("Helvetica");
      doc.text("Dear Ma'am/Sir,", 30, 190, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.font("Helvetica-Bold");

      doc.text(
        "Greetings from Upward Management Insurance Services!",
        70,
        216,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      doc.font("Helvetica");

      doc.text("This is to respectfully remind you about your ", 70, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });
      doc.font("Helvetica-Bold");
      doc.text("Comprehensive Insurance Coverage", 250, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });
      doc.font("Helvetica");
      doc.text("which will expire on the date ", 410, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.text(
        "Indicated below. With that, we are hoping that you will continue to trust our company by rendering good insurance service, and for being covered and protected beyond that date. Also, your insurance coverage is adjusted to the current market value.",
        30,
        250,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );
      let pdy = 285;
      let nextpdy = pdy;
      // ====================
      if (data.length > 0) {
        const policyDetails = [
          { label: "Policy No.", value: data[0].PolicyNo },
          { label: "Plate No.", value: data[0].PlateNo },
          { label: "Chassis No.", value: data[0].ChassisNo },
          { label: "Motor No.", value: data[0].MotorNo },
          {
            label: "Expiration Date",
            value: format(new Date(data[0].DateTo), "MMMM dd, yyyy"),
          },
          {
            label: "Unit Insured",
            value:
              `${data[0].Model} ${data[0].Make} ${data[0].BodyType}`.trim(),
          },
          {
            label: "Mortgagee",
            value: data[0].Mortgagee,
          },
          {
            label: "Remarks",
            value: data[0].Remarks,
          },
        ];
        const policyPaymentDetailsLabel = [
          { label: "Total Loss/ Own Damage/Theft" },
          { label: "Acts of Nature" },
          { label: "Excess Bodily Injury" },
          { label: "Third Party Property Damage" },
          { label: "Auto Passenger Accident" },
          { label: req.body.comPassenger1Ref },
          { label: "Sub-Total" },
          { label: "Doc. Stamp" },
          { label: "EVAT" },
          { label: "LGT" },
          { label: "GROSS PREMIUM" },
        ];
        function stringToNum(value: any) {
          return parseFloat(value.toString().replace(/,/g, ""));
        }

        const evsv1 = stringToNum(data[0].EstimatedValue);
        const ownDamage = stringToNum(data[0].ODamage);
        const newEvsv1 = evsv1 - evsv1 * 0.1;
        const newEvsvComSec3 =
          newEvsv1 * (parseFloat(req.body.premiumSec3Ref) / 100);

        const evsv2 = stringToNum(data[0].EstimatedValue);
        const aog = stringToNum(data[0].AOG);
        const newEvsv2 = evsv1 - evsv1 * 0.1;
        const newEvsvComCustomPercent =
          newEvsv2 * (parseFloat(req.body.premiumAOFRef) / 100);

        const bodilyInjury1 = stringToNum(data[0].BodilyInjury);
        const secIVA = stringToNum(data[0].Sec4A);
        const bodilyInjury2 = stringToNum(req.body.sumInsuredEBIRef);
        const editablesecIVA = stringToNum(req.body.premiumEBIRef);

        const propertyDamage1 = stringToNum(data[0].PropertyDamage);
        const secIVB = stringToNum(data[0].Sec4B);
        const propertyDamage2 = stringToNum(req.body.sumInsuredTPPDRef);
        const editablesecIVB = stringToNum(req.body.premiumTPPDRef);

        const personalAccident1 = stringToNum(data[0].PersonalAccident);
        const others = stringToNum(data[0].Sec4C);
        const personalAccident2 = stringToNum(data[0].PersonalAccident);
        const editableOthers = stringToNum(req.body.premiumAPARef);

        const subTotal1 = stringToNum(data[0].TotalPremium);
        const subTotal2 =
          newEvsvComSec3 +
          newEvsvComCustomPercent +
          editablesecIVA +
          editablesecIVB +
          editableOthers;

        const docStamp1 = stringToNum(data[0].DocStamp);
        const docStamp2 = subTotal2 * 0.125;

        const evat1 = stringToNum(data[0].Vat);
        const evat2 = subTotal2 * 0.12;

        const lgt1 = stringToNum(data[0].LGovTax);
        const lgt2 = subTotal2 * (parseFloat(req.body.premiumAOGRef) / 100);

        const grossPrem1 = stringToNum(data[0].TotalDue);
        const grossPrem2 = subTotal2 + docStamp2 + evat2 + lgt2;

        const policyPaymentDetails = [
          {
            value1: formatNumber(evsv1),
            value2: formatNumber(ownDamage),
            value3: formatNumber(newEvsv1),
            value4: formatNumber(newEvsvComSec3),
          },
          {
            value1: formatNumber(evsv2),
            value2: formatNumber(aog),
            value3: formatNumber(newEvsv2),
            value4: formatNumber(newEvsvComCustomPercent),
          },
          {
            value1: formatNumber(bodilyInjury1),
            value2: formatNumber(secIVA),
            value3: formatNumber(bodilyInjury2),
            value4: formatNumber(editablesecIVA),
          },
          {
            value1: formatNumber(propertyDamage1),
            value2: formatNumber(secIVB),
            value3: formatNumber(propertyDamage2),
            value4: formatNumber(editablesecIVB),
          },
          {
            value1: formatNumber(personalAccident1),
            value2: formatNumber(others),
            value3: formatNumber(personalAccident2),
            value4: formatNumber(editableOthers),
          },
          {
            value1: "",
            value2: "",
            value3: req.body.comPassenger2Ref,
            value4: "",
          },
          {
            value1: "",
            value2: formatNumber(subTotal1),
            value3: "",
            value4: formatNumber(subTotal2),
          },
          {
            value1: "",
            value2: formatNumber(docStamp1),
            value3: "",
            value4: formatNumber(docStamp2),
          },
          {
            value1: "",
            value2: formatNumber(evat1),
            value3: "",
            value4: formatNumber(evat2),
          },
          {
            value1: "",
            value2: formatNumber(lgt1),
            value3: "",
            value4: formatNumber(lgt2),
          },
          {
            value1: "",
            value2: formatNumber(grossPrem1),
            value3: "",
            value4: formatNumber(grossPrem2),
          },
        ];
        for (let i = 0; i < policyDetails.length; i++) {
          const itm = policyDetails[i];
          doc.font("Helvetica");
          const valueHeight = doc.heightOfString(itm.value, {
            width: PAGE_WIDTH_WITH_MARGIN - 160,
            align: "left",
          });

          doc.text(itm.label, 30, pdy, {
            width: 150,
            align: "left",
          });
          doc.font("Helvetica-Bold");
          doc.text(":", 170, pdy, {
            width: PAGE_WIDTH_WITH_MARGIN,
            align: "left",
          });
          doc.text(itm.value, 215, pdy, {
            width: PAGE_WIDTH_WITH_MARGIN - 160,
            align: "left",
          });
          pdy += (Math.round(valueHeight) || 10) + 1;
        }
        doc.font("Helvetica");
        pdy = pdy + 40;
        doc.fontSize(8);
        doc.text("Previous Policy", 200, pdy - 25, {
          width: 160,
          align: "center",
        });
        doc.text("Quotation for your Renewal", 200 + 190, pdy - 25, {
          width: 160,
          align: "center",
        });

        doc.fontSize(9);
        doc.font("Helvetica-Bold");
        doc.text("Sum Insured", 200, pdy - 10, {
          width: 80,
          align: "center",
        });

        doc.text("Premium", 200 + 85, pdy - 10, {
          width: 80,
          align: "center",
        });

        doc
          .moveTo(200 + 170, pdy - 10) // starting point (x, y)
          .lineTo(200 + 170, pdy + 145) // ending point (x, y)
          .stroke();
        doc
          .moveTo(200 + 172, pdy - 10) // starting point (x, y)
          .lineTo(200 + 172, pdy + 145) // ending point (x, y)
          .stroke();

        doc.text("Sum Insured", 200 + 190, pdy - 10, {
          width: 80,
          align: "center",
        });

        doc.text("Premium", 200 + 170 + 80 + 25, pdy - 10, {
          width: 80,
          align: "center",
        });

        doc.font("Helvetica");

        nextpdy = pdy;
        for (let i = 0; i < policyPaymentDetailsLabel.length; i++) {
          const itm = policyPaymentDetailsLabel[i];
          doc.font("Helvetica");
          nextpdy += 12;
          doc.text(itm.label, 30, nextpdy, {
            width: PAGE_WIDTH_WITH_MARGIN,
            align: "left",
          });
          if (i !== 5) {
            doc.font("Helvetica-Bold");
            doc.text(":", 170, nextpdy, {
              width: PAGE_WIDTH_WITH_MARGIN,
              align: "left",
            });
          }
        }

        nextpdy = pdy;
        for (let i = 0; i < policyPaymentDetails.length; i++) {
          const itm = policyPaymentDetails[i];
          doc.font("Helvetica");
          nextpdy += 12;

          doc.text(itm.value1, 200, nextpdy, {
            width: 80,
            align: "right",
          });

          if (i === 6) {
            doc.font("Helvetica-Bold");
          }

          if (i === policyPaymentDetails.length - 1) {
            doc.font("Helvetica-Bold");
            doc.fontSize(10);
            doc.text(itm.value2, 200 + 85, nextpdy, {
              width: 80,
              align: "right",
            });
          } else {
            doc.text(itm.value2, 200 + 85, nextpdy, {
              width: 80,
              align: "right",
            });
          }

          if (i !== 5) {
            doc.text(itm.value3, 200 + 190, nextpdy, {
              width: 80,
              align: "right",
            });

            if (i === policyPaymentDetails.length - 1) {
              doc.font("Helvetica-Bold");
              doc.fontSize(10);
              doc.text(itm.value4, 200 + 170 + 80 + 25, nextpdy, {
                width: 80,
                align: "right",
              });
            } else {
              doc.text(itm.value4, 200 + 170 + 80 + 25, nextpdy, {
                width: 80,
                align: "right",
              });
            }
          } else {
            doc.text(itm.value3, 200 + 174, nextpdy, {
              width: 160,
              align: "left",
            });

            doc
              .moveTo(200 + 170 + 80 + 25, nextpdy + 9) // starting point (x, y)
              .lineTo(200 + 170 + 80 + 25 + 80, nextpdy + 9) // ending point (x, y)
              .stroke();

            doc
              .moveTo(200 + 85, nextpdy + 9) // starting point (x, y)
              .lineTo(200 + 85 + 80, nextpdy + 9) // ending point (x, y)
              .stroke();
          }

          if (i === policyPaymentDetails.length - 2) {
            doc
              .moveTo(200 + 170 + 80 + 25, nextpdy + 9) // starting point (x, y)
              .lineTo(200 + 170 + 80 + 25 + 80, nextpdy + 9) // ending point (x, y)
              .stroke();
            doc
              .moveTo(200 + 85, nextpdy + 9) // starting point (x, y)
              .lineTo(200 + 85 + 80, nextpdy + 9) // ending point (x, y)
              .stroke();
          }

          if (i === policyPaymentDetails.length - 1) {
            doc
              .moveTo(200 + 170 + 80 + 25, nextpdy + 10) // starting point (x, y)
              .lineTo(200 + 170 + 80 + 25 + 80, nextpdy + 10) // ending point (x, y)
              .stroke();
            doc
              .moveTo(200 + 170 + 80 + 25, nextpdy + 12) // starting point (x, y)
              .lineTo(200 + 170 + 80 + 25 + 80, nextpdy + 12) // ending point (x, y)
              .stroke();

            doc
              .moveTo(200 + 85, nextpdy + 10) // starting point (x, y)
              .lineTo(200 + 85 + 80, nextpdy + 10) // ending point (x, y)
              .stroke();
            doc
              .moveTo(200 + 85, nextpdy + 12) // starting point (x, y)
              .lineTo(200 + 85 + 80, nextpdy + 12) // ending point (x, y)
              .stroke();
          }
        }
      }

      // ====================
      doc.font("Helvetica");
      doc.fontSize(9);
      nextpdy = nextpdy + 30;
      doc.text(
        "For further details and queries, please feel free to get in touch with us. Again, thank you for considering our company for your protection and security.",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      nextpdy = nextpdy + 30;
      doc.text("Very truly yours,", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("Checked by:", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });

      nextpdy = nextpdy + 30;

      doc.font("Helvetica-Bold");
      doc.fontSize(10);
      doc.text("ANGELO DACULA", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("MARY GRACE LLANERA", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });
      nextpdy = nextpdy + 12;
      doc.font("Helvetica-Bold");
      doc.fontSize(11);
      doc.text("UNDER WRITING ADMIN", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("OPERATION SUPERVISOR", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });
      nextpdy = nextpdy + 15;
      doc.text(
        "-------------------------------------------------------------------------------------------------------------------------------------------------",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      doc.fontSize(9);

      nextpdy = nextpdy + 15;

      doc.text(
        "Instruction Slip (Please check for instruction):",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );
      nextpdy = nextpdy + 25;
      doc.text("____ FOR RENEWAL", 30, nextpdy, {
        width: 200,
        align: "left",
      });
      doc.text("____ NON RENEWAL", 30 + 200, nextpdy, {
        width: 200,
        align: "left",
      });
      nextpdy = nextpdy + 25;
      doc.text(
        "NOTE: RENEWAL WILL ONLY TAKE EFFECT IF THE CURRENT POLICY'S PREMIUM IS FULLY PAID",
        30,
        nextpdy,
        {
          width: 230,
          align: "left",
        }
      );
      nextpdy = nextpdy + 15;

      doc.text("___________________________________", 30, nextpdy, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "right",
      });
      nextpdy = nextpdy + 12;

      doc.text(
        "SIGNATURE OVER PRINTED NAME",
        PAGE_WIDTH_WITH_MARGIN - 142,
        nextpdy,
        {
          width: 170,
          align: "center",
        }
      );

      doc.text(
        "Address | 1197 Azure Business Center EDSA Muñoz, Quezon City - Telephone Numbers | 8441 - 8977 to 78 | 8374 - 0742 Mobile Number | 0919 - 078 - 5547 / 0919 - 078 - 5543",
        30,
        pdfReportGenerator.PAGE_HEIGHT - 35,
        {
          align: "center",
          width: PAGE_WIDTH_WITH_MARGIN,
        }
      );

      // SIGNATURE OVER PRINTED NAME
    },
    beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {},
    drawPageNumber: (
      doc: PDFKit.PDFDocument,
      currentPage: number,
      totalPages: number,
      pdfReportGenerator: any
    ) => {},
  };
  const pdfReportGenerator = new PDFReportGenerator(props);
  return pdfReportGenerator.generatePDF(res, false);
}
async function PDFFIRE(res: Response, req: Request) {
  const data: any = await prisma.$queryRawUnsafe(
    `
    SELECT 
          cID_No,
            a.PolicyNo,
            InsuredValue,
            ifnull(Location,'') as Location,
            DateTo,
            ifnull(PropertyInsured,'') as PropertyInsured,
            ifnull(Mortgage,'s') as Mortgage,
            TotalDue
            FROM
                policy a
                    LEFT JOIN
                fpolicy b ON a.PolicyNo = b.PolicyNo
                    LEFT JOIN
                (SELECT 
                    a.entry_client_id AS IDNo,
                        sub_account,
                        IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                FROM
                    entry_client a UNION ALL SELECT 
                    a.entry_supplier_id AS IDNo,
                        sub_account,
                        IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                FROM
                    entry_supplier a UNION ALL SELECT 
                    a.entry_employee_id AS IDNo,
                        sub_account,
                        IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                FROM
                    entry_employee a UNION ALL SELECT 
                    a.entry_fixed_assets_id AS IDNo,
                        sub_account,
                        a.fullname AS cID_No
                FROM
                    entry_fixed_assets a UNION ALL SELECT 
                    a.entry_others_id AS IDNo,
                        sub_account,
                        a.description AS cID_No
                FROM
                    entry_others a UNION ALL SELECT 
                    a.entry_agent_id AS IDNo,
                        sub_account,
                        IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                FROM
                    entry_agent a) c ON a.IDNo = c.IDNo
            WHERE
            a.PolicyType = 'FIRE' and
           a.PolicyNo = ?
    `,
    req.body.PolicyNo
  );

  let PAGE_WIDTH = 594;
  let PAGE_HEIGHT = 841;
  const props: any = {
    data: [],
    columnWidths: [90, 80, 150, 80, 60, 80, 80, 60],
    headers: [],
    keys: [],
    title: "",
    adjustTitleFontSize: 6,
    setRowFontSize: 10,
    BASE_FONT_SIZE: 6,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    MARGIN: { top: 80, right: 20, bottom: 30, left: 20 },
    beforeDraw: (
      pdfReportGenerator: PDFReportGenerator,
      doc: PDFKit.PDFDocument
    ) => {
      doc.image(
        path.join(path.dirname(__dirname), "../../../static/image/logo.png"),
        30,
        20,
        {
          fit: [120, 120],
        }
      );
      doc.fontSize(60);
      doc.font("Helvetica-Bold");
      doc.text("UPWARD", 155, 30);

      if (process.env.DEPARTMENT === "UMIS") {
        doc.fontSize(9);
        doc.text("MANAGEMENT INSURANCE SERVICES", 245, 80);
      }
      if (process.env.DEPARTMENT === "UCSMI") {
        doc.fontSize(9);
        doc.text("CONSULTANCY SERVICES AND MANAGEMENT INC.", 190, 80);
      }
      doc.fontSize(20);
      doc.text("RENEWAL NOTICE", 0, 120, {
        width: PAGE_WIDTH,
        align: "center",
      });

      doc.fontSize(10);

      const PAGE_WIDTH_WITH_MARGIN = PAGE_WIDTH - 60;

      doc.text("MAY 17, 2025", 30, 150, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "right",
      });

      doc.text("ALBER SALIM GRANADA MASSAB JR. ", 30, 165, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.fontSize(9);
      doc.font("Helvetica");
      doc.text("Dear Ma'am/Sir,", 30, 190, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.font("Helvetica-Bold");

      doc.text(
        "Greetings from Upward Management Insurance Services!",
        70,
        216,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      doc.font("Helvetica");

      doc.text("This is to respectfully remind you about your ", 70, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });
      doc.font("Helvetica-Bold");
      doc.text("Fire Insurance Coverage", 250, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });
      doc.font("Helvetica");
      doc.text("which will expire on the date Indicated below.", 360, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.text(
        " With that, we are hoping that you will continue to trust our company by rendering good insurance service, and for being covered and protected beyond that date. Also, your insurance coverage is adjusted to the current market value.",
        30,
        250,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      let pdy = 285;
      if (data.length > 0) {
        const policyDetails = [
          { label: "Assured's Name", value: data[0].cID_No },
          { label: "Policy No.", value: data[0].PolicyNo },
          {
            label: "Amount of Insurance",
            value: formatNumber(
              parseFloat(data[0].InsuredValue.toString().replace(/,/g, ""))
            ),
          },
          { label: "Location Risk", value: data[0].Location },
          {
            label: "Expiration Date",
            value: format(new Date(data[0].DateTo), "MMMM dd, yyyy"),
          },
          { label: "Property Insured", value: req.body.FirePropertyInsured },
          { label: "Mortgagee", value: req.body.FireMortgagee },
          {
            label: "Gross Premium",
            value: formatNumber(
              parseFloat(data[0].TotalDue.toString().replace(/,/g, ""))
            ),
          },
        ];
        for (let i = 0; i < policyDetails.length; i++) {
          const itm = policyDetails[i];
          doc.font("Helvetica");
          const valueHeight = doc.heightOfString(itm.value, {
            width: PAGE_WIDTH_WITH_MARGIN - 160,
            align: "left",
          });
          if (i === 6) {
            pdy += (Math.round(valueHeight) || 10) + 15;
          } else {
            pdy += (Math.round(valueHeight) || 10) + 1;
          }

          doc.text(itm.label, 70, pdy, {
            width: 150,
            align: "left",
          });
          doc.font("Helvetica-Bold");
          doc.text(":", 220, pdy, {
            width: PAGE_WIDTH_WITH_MARGIN,
            align: "left",
          });
          doc.text(itm.value, 240, pdy, {
            width: PAGE_WIDTH_WITH_MARGIN - 160,
            align: "left",
          });
        }
      }

      let nextpdy = pdy;

      nextpdy = pdy;

      doc.font("Helvetica");
      doc.fontSize(9);
      nextpdy = nextpdy + 30;
      doc.text(
        "For further details and queries, please feel free to get in touch with us. Again, thank you for considering our company for your protection and security.",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      nextpdy = nextpdy + 30;
      doc.text("Very truly yours,", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("Checked by:", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });

      nextpdy = nextpdy + 30;

      doc.font("Helvetica-Bold");
      doc.fontSize(10);
      doc.text("ANGELO DACULA", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("MARY GRACE LLANERA", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });
      nextpdy = nextpdy + 12;
      doc.font("Helvetica-Bold");
      doc.fontSize(11);
      doc.text("UNDER WRITING ADMIN", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("OPERATION SUPERVISOR", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });
      nextpdy = nextpdy + 15;
      doc.text(
        "-------------------------------------------------------------------------------------------------------------------------------------------------",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      doc.fontSize(9);

      nextpdy = nextpdy + 15;

      doc.text(
        "Instruction Slip (Please check for instruction):",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );
      nextpdy = nextpdy + 25;
      doc.text("____ FOR RENEWAL", 30, nextpdy, {
        width: 200,
        align: "left",
      });
      doc.text("____ NON RENEWAL", 30 + 200, nextpdy, {
        width: 200,
        align: "left",
      });
      nextpdy = nextpdy + 25;
      doc.text(
        "NOTE: RENEWAL WILL ONLY TAKE EFFECT IF THE CURRENT POLICY'S PREMIUM IS FULLY PAID",
        30,
        nextpdy,
        {
          width: 230,
          align: "left",
        }
      );
      nextpdy = nextpdy + 15;

      doc.text("___________________________________", 30, nextpdy, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "right",
      });
      nextpdy = nextpdy + 12;

      doc.text(
        "SIGNATURE OVER PRINTED NAME",
        PAGE_WIDTH_WITH_MARGIN - 150,
        nextpdy,
        {
          width: 170,
          align: "center",
        }
      );

      doc.text(
        "Address | 1197 Azure Business Center EDSA Muñoz, Quezon City - Telephone Numbers | 8441 - 8977 to 78 | 8374 - 0742 Mobile Number | 0919 - 078 - 5547 / 0919 - 078 - 5543",
        30,
        pdfReportGenerator.PAGE_HEIGHT - 35,
        {
          align: "center",
          width: PAGE_WIDTH_WITH_MARGIN,
        }
      );

      // SIGNATURE OVER PRINTED NAME
    },
    beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {},
    drawPageNumber: (
      doc: PDFKit.PDFDocument,
      currentPage: number,
      totalPages: number,
      pdfReportGenerator: any
    ) => {},
  };
  const pdfReportGenerator = new PDFReportGenerator(props);
  return pdfReportGenerator.generatePDF(res, false);
}
async function PDFMAR(res: Response, req: Request) {
  const data: any = await prisma.$queryRawUnsafe(
    `
    SELECT 
               *
            FROM
                policy a
                    LEFT JOIN
                mpolicy b ON a.PolicyNo = b.PolicyNo
                    LEFT JOIN
                (SELECT 
                    a.entry_client_id AS IDNo,
                        sub_account,
                        IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                FROM
                    entry_client a UNION ALL SELECT 
                    a.entry_supplier_id AS IDNo,
                        sub_account,
                        IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
                FROM
                    entry_supplier a UNION ALL SELECT 
                    a.entry_employee_id AS IDNo,
                        sub_account,
                        IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                FROM
                    entry_employee a UNION ALL SELECT 
                    a.entry_fixed_assets_id AS IDNo,
                        sub_account,
                        a.fullname AS cID_No
                FROM
                    entry_fixed_assets a UNION ALL SELECT 
                    a.entry_others_id AS IDNo,
                        sub_account,
                        a.description AS cID_No
                FROM
                    entry_others a UNION ALL SELECT 
                    a.entry_agent_id AS IDNo,
                        sub_account,
                        IF(a.lastname IS NOT NULL
                            AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
                FROM
                    entry_agent a) c ON a.IDNo = c.IDNo
            WHERE
            a.PolicyType = 'MAR' and
            a.PolicyNo = ?
    `,
    req.body.PolicyNo
  );

  let PAGE_WIDTH = 594;
  let PAGE_HEIGHT = 841;
  const props: any = {
    data: [],
    columnWidths: [90, 80, 150, 80, 60, 80, 80, 60],
    headers: [],
    keys: [],
    title: "",
    adjustTitleFontSize: 6,
    setRowFontSize: 10,
    BASE_FONT_SIZE: 6,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    MARGIN: { top: 80, right: 20, bottom: 30, left: 20 },
    beforeDraw: (
      pdfReportGenerator: PDFReportGenerator,
      doc: PDFKit.PDFDocument
    ) => {
      doc.image(
        path.join(path.dirname(__dirname), "../../../static/image/logo.png"),
        30,
        20,
        {
          fit: [120, 120],
        }
      );
      doc.fontSize(60);
      doc.font("Helvetica-Bold");
      doc.text("UPWARD", 155, 30);

      if (process.env.DEPARTMENT === "UMIS") {
        doc.fontSize(9);
        doc.text("MANAGEMENT INSURANCE SERVICES", 245, 80);
      }
      if (process.env.DEPARTMENT === "UCSMI") {
        doc.fontSize(9);
        doc.text("CONSULTANCY SERVICES AND MANAGEMENT INC.", 190, 80);
      }
      doc.fontSize(20);
      doc.text("RENEWAL NOTICE", 0, 120, {
        width: PAGE_WIDTH,
        align: "center",
      });

      doc.fontSize(10);

      const PAGE_WIDTH_WITH_MARGIN = PAGE_WIDTH - 60;

      doc.text("MAY 17, 2025", 30, 150, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "right",
      });

      doc.text("ALBER SALIM GRANADA MASSAB JR. ", 30, 165, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.fontSize(9);
      doc.font("Helvetica");
      doc.text("Dear Ma'am/Sir,", 30, 190, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.font("Helvetica-Bold");

      doc.text(
        "Greetings from Upward Management Insurance Services!",
        70,
        216,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      doc.font("Helvetica");

      doc.text("This is to respectfully remind you about your ", 70, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });
      doc.font("Helvetica-Bold");
      doc.text("Marine Insurance Coverage", 250, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });
      doc.font("Helvetica");
      doc.text("which will expire on the date Indicated below.", 373, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.text(
        "With that, we are hoping that you will continue to trust our company by rendering good insurance service, and for being covered and protected beyond that date. Also, your insurance coverage is adjusted to the current market value.",
        30,
        250,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      let pdy = 285;
      if (data.length > 0) {
        const policyDetails = [
          { label: "ASSURED NAME", value: data[0].cID_No },
          { label: "RENEWING POLICY NO.", value: data[0].PolicyNo },
          {
            label: "AMOUNT OF INSURANCE",
            value: formatNumber(
              parseFloat(data[0].InsuredValue.toString().replace(/,/g, ""))
            ),
          },
          {
            label: "LOCATION",
            value: `Point of Origin:${data[0].PointOfOrigin}\nPoint of Destination:${data[0].PointOfOrigin}`,
          },
          {
            label: "PERIOD OF INSURANCE",
            value: format(new Date(data[0].DateTo), "MMMM dd, yyyy"),
          },
          { label: "PROPERTY INSURED", value: data[0].SubjectInsured },
          {
            label: "MORTGAGEE",
            value: req.body.MarMortgageeRef,
          },
          {
            label: "ADDITIONAL INFO",
            value: req.body.MarAdditionalInfoRef,
          },
          {
            label: "TOTAL PREMIUM",
            value: formatNumber(
              parseFloat(data[0].TotalDue.toString().replace(/,/g, ""))
            ),
          },
        ];
        for (let i = 0; i < policyDetails.length; i++) {
          const itm = policyDetails[i];
          doc.font("Helvetica");
          const valueHeight = doc.heightOfString(itm.value, {
            width: PAGE_WIDTH_WITH_MARGIN - 160,
            align: "left",
          });

          doc.text(itm.label, 70, pdy, {
            width: 150,
            align: "left",
          });
          doc.font("Helvetica-Bold");
          doc.text(":", 220, pdy, {
            width: PAGE_WIDTH_WITH_MARGIN,
            align: "left",
          });
          doc.text(itm.value, 240, pdy, {
            width: PAGE_WIDTH_WITH_MARGIN - 160,
            align: "left",
          });

          if (i === 5 || i === 7) {
            pdy += (Math.round(valueHeight) || 10) + 10;
          } else {
            pdy += (Math.round(valueHeight) || 10) + 1;
          }
        }
      }

      let nextpdy = pdy;

      nextpdy = pdy;

      doc.font("Helvetica");
      doc.fontSize(9);
      nextpdy = nextpdy + 30;
      doc.text(
        "For further details and queries, please feel free to get in touch with us. Again, thank you for considering our company for your protection and security.",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      nextpdy = nextpdy + 30;
      doc.text("Very truly yours,", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("Checked by:", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });

      nextpdy = nextpdy + 30;

      doc.font("Helvetica-Bold");
      doc.fontSize(10);
      doc.text("ANGELO DACULA", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("MARY GRACE LLANERA", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });
      nextpdy = nextpdy + 12;
      doc.font("Helvetica-Bold");
      doc.fontSize(11);
      doc.text("UNDER WRITING ADMIN", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("OPERATION SUPERVISOR", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });
      nextpdy = nextpdy + 15;
      doc.text(
        "-------------------------------------------------------------------------------------------------------------------------------------------------",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      doc.fontSize(9);

      nextpdy = nextpdy + 15;

      doc.text(
        "Instruction Slip (Please check for instruction):",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );
      nextpdy = nextpdy + 25;
      doc.text("____ FOR RENEWAL", 30, nextpdy, {
        width: 200,
        align: "left",
      });
      doc.text("____ NON RENEWAL", 30 + 200, nextpdy, {
        width: 200,
        align: "left",
      });
      nextpdy = nextpdy + 25;
      doc.text(
        "NOTE: RENEWAL WILL ONLY TAKE EFFECT IF THE CURRENT POLICY'S PREMIUM IS FULLY PAID",
        30,
        nextpdy,
        {
          width: 230,
          align: "left",
        }
      );
      nextpdy = nextpdy + 15;

      doc.text("___________________________________", 30, nextpdy, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "right",
      });
      nextpdy = nextpdy + 12;

      doc.text(
        "SIGNATURE OVER PRINTED NAME",
        PAGE_WIDTH_WITH_MARGIN - 150,
        nextpdy,
        {
          width: 170,
          align: "center",
        }
      );

      doc.text(
        "Address | 1197 Azure Business Center EDSA Muñoz, Quezon City - Telephone Numbers | 8441 - 8977 to 78 | 8374 - 0742 Mobile Number | 0919 - 078 - 5547 / 0919 - 078 - 5543",
        30,
        pdfReportGenerator.PAGE_HEIGHT - 35,
        {
          align: "center",
          width: PAGE_WIDTH_WITH_MARGIN,
        }
      );

      // SIGNATURE OVER PRINTED NAME
    },
    beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {},
    drawPageNumber: (
      doc: PDFKit.PDFDocument,
      currentPage: number,
      totalPages: number,
      pdfReportGenerator: any
    ) => {},
  };
  const pdfReportGenerator = new PDFReportGenerator(props);
  return pdfReportGenerator.generatePDF(res, false);
}
async function PDFPA(res: Response, req: Request) {
  const data: any = await prisma.$queryRawUnsafe(
    `
       SELECT 
          *
        FROM
            policy a
                LEFT JOIN
            papolicy b ON a.PolicyNo = b.PolicyNo
                LEFT JOIN
            (SELECT 
                a.entry_client_id AS IDNo,
                    sub_account,
                    IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                        AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
            FROM
                entry_client a UNION ALL SELECT 
                a.entry_supplier_id AS IDNo,
                    sub_account,
                    IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                        AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
            FROM
                entry_supplier a UNION ALL SELECT 
                a.entry_employee_id AS IDNo,
                    sub_account,
                    IF(a.lastname IS NOT NULL
                        AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
            FROM
                entry_employee a UNION ALL SELECT 
                a.entry_fixed_assets_id AS IDNo,
                    sub_account,
                    a.fullname AS cID_No
            FROM
                entry_fixed_assets a UNION ALL SELECT 
                a.entry_others_id AS IDNo,
                    sub_account,
                    a.description AS cID_No
            FROM
                entry_others a UNION ALL SELECT 
                a.entry_agent_id AS IDNo,
                    sub_account,
                    IF(a.lastname IS NOT NULL
                        AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
            FROM
                entry_agent a) c ON a.IDNo = c.IDNo
        WHERE
            a.PolicyType = 'PA'
            and a.PolicyNo = ?
    `,
    req.body.PolicyNo
  );

  let PAGE_WIDTH = 594;
  let PAGE_HEIGHT = 841;
  const props: any = {
    data: [],
    columnWidths: [90, 80, 150, 80, 60, 80, 80, 60],
    headers: [],
    keys: [],
    title: "",
    adjustTitleFontSize: 6,
    setRowFontSize: 10,
    BASE_FONT_SIZE: 6,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    MARGIN: { top: 80, right: 20, bottom: 30, left: 20 },
    beforeDraw: (
      pdfReportGenerator: PDFReportGenerator,
      doc: PDFKit.PDFDocument
    ) => {
      doc.image(
        path.join(path.dirname(__dirname), "../../../static/image/logo.png"),
        30,
        20,
        {
          fit: [120, 120],
        }
      );
      doc.fontSize(60);
      doc.font("Helvetica-Bold");
      doc.text("UPWARD", 155, 30);

      if (process.env.DEPARTMENT === "UMIS") {
        doc.fontSize(9);
        doc.text("MANAGEMENT INSURANCE SERVICES", 245, 80);
      }
      if (process.env.DEPARTMENT === "UCSMI") {
        doc.fontSize(9);
        doc.text("CONSULTANCY SERVICES AND MANAGEMENT INC.", 190, 80);
      }
      doc.fontSize(20);
      doc.text("RENEWAL NOTICE", 0, 120, {
        width: PAGE_WIDTH,
        align: "center",
      });

      doc.fontSize(10);

      const PAGE_WIDTH_WITH_MARGIN = PAGE_WIDTH - 60;

      doc.text("MAY 17, 2025", 30, 150, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "right",
      });

      doc.text("ALBER SALIM GRANADA MASSAB JR. ", 30, 165, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.fontSize(9);
      doc.font("Helvetica");
      doc.text("Dear Ma'am/Sir,", 30, 190, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.font("Helvetica-Bold");

      doc.text(
        "Greetings from Upward Management Insurance Services!",
        70,
        216,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      doc.font("Helvetica");

      doc.text("This is to respectfully remind you about your ", 70, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });
      doc.font("Helvetica-Bold");
      doc.text("Comprehensive Insurance Coverage", 250, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });
      doc.font("Helvetica");
      doc.text("which will expire on the date ", 410, 240, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "left",
      });

      doc.text(
        "Indicated below. With that, we are hoping that you will continue to trust our company by rendering good insurance service, and for being covered and protected beyond that date. Also, your insurance coverage is adjusted to the current market value.",
        30,
        250,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      let pdy = 285;
      if (data.length > 0) {
        const policyDetails = [
          { label: "Assured Name", value: data[0].cID_No },
          { label: "Policy No.", value: data[0].PolicyNo },
          {
            label: "Expiration Date",
            value: format(new Date(data[0].PeriodTo), "MMMM dd, yyyy"),
          },
          { label: "Property Insured", value: req.body.PAPropertyInsured },
          {
            label: "Total Premium",
            value: formatNumber(
              parseFloat(data[0].TotalPremium.toString().replace(/,/g, ""))
            ),
          },
        ];

        for (let i = 0; i < policyDetails.length; i++) {
          const itm = policyDetails[i];
          doc.font("Helvetica");
          const valueHeight = doc.heightOfString(itm.value, {
            width: PAGE_WIDTH_WITH_MARGIN - 160,
            align: "left",
          });

          if (i === policyDetails.length - 1) {
            pdy += (Math.round(valueHeight) || 10) + 10;
          } else {
            pdy += (Math.round(valueHeight) || 10) + 1;
          }

          doc.text(itm.label, 70, pdy, {
            width: 150,
            align: "left",
          });
          doc.font("Helvetica-Bold");
          doc.text(":", 220, pdy, {
            width: PAGE_WIDTH_WITH_MARGIN,
            align: "left",
          });

          doc.text(itm.value, 240, pdy, {
            width: PAGE_WIDTH_WITH_MARGIN - 160,
            align: "left",
          });
        }
      }

      let nextpdy = pdy;

      nextpdy = pdy;

      doc.font("Helvetica");
      doc.fontSize(9);
      nextpdy = nextpdy + 30;
      doc.text(
        "For further details and queries, please feel free to get in touch with us. Again, thank you for considering our company for your protection and security.",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      nextpdy = nextpdy + 30;
      doc.text("Very truly yours,", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("Checked by:", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });

      nextpdy = nextpdy + 30;

      doc.font("Helvetica-Bold");
      doc.fontSize(10);
      doc.text("ANGELO DACULA", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("MARY GRACE LLANERA", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });
      nextpdy = nextpdy + 12;
      doc.font("Helvetica-Bold");
      doc.fontSize(11);
      doc.text("UNDER WRITING ADMIN", 30, nextpdy, {
        width: 300,
        align: "left",
      });

      doc.text("OPERATION SUPERVISOR", 30 + 300, nextpdy, {
        width: 300,
        align: "left",
      });
      nextpdy = nextpdy + 15;
      doc.text(
        "-------------------------------------------------------------------------------------------------------------------------------------------------",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );

      doc.fontSize(9);

      nextpdy = nextpdy + 15;

      doc.text(
        "Instruction Slip (Please check for instruction):",
        30,
        nextpdy,
        {
          width: PAGE_WIDTH_WITH_MARGIN,
          align: "left",
        }
      );
      nextpdy = nextpdy + 25;
      doc.text("____ FOR RENEWAL", 30, nextpdy, {
        width: 200,
        align: "left",
      });
      doc.text("____ NON RENEWAL", 30 + 200, nextpdy, {
        width: 200,
        align: "left",
      });
      nextpdy = nextpdy + 25;
      doc.text(
        "NOTE: RENEWAL WILL ONLY TAKE EFFECT IF THE CURRENT POLICY'S PREMIUM IS FULLY PAID",
        30,
        nextpdy,
        {
          width: 230,
          align: "left",
        }
      );
      nextpdy = nextpdy + 15;

      doc.text("___________________________________", 30, nextpdy, {
        width: PAGE_WIDTH_WITH_MARGIN,
        align: "right",
      });
      nextpdy = nextpdy + 12;

      doc.text(
        "SIGNATURE OVER PRINTED NAME",
        PAGE_WIDTH_WITH_MARGIN - 150,
        nextpdy,
        {
          width: 170,
          align: "center",
        }
      );

      doc.text(
        "Address | 1197 Azure Business Center EDSA Muñoz, Quezon City - Telephone Numbers | 8441 - 8977 to 78 | 8374 - 0742 Mobile Number | 0919 - 078 - 5547 / 0919 - 078 - 5543",
        30,
        pdfReportGenerator.PAGE_HEIGHT - 35,
        {
          align: "center",
          width: PAGE_WIDTH_WITH_MARGIN,
        }
      );

      // SIGNATURE OVER PRINTED NAME
    },
    beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {},
    drawPageNumber: (
      doc: PDFKit.PDFDocument,
      currentPage: number,
      totalPages: number,
      pdfReportGenerator: any
    ) => {},
  };
  const pdfReportGenerator = new PDFReportGenerator(props);
  return pdfReportGenerator.generatePDF(res, false);
}

export default RenewalNotice;
