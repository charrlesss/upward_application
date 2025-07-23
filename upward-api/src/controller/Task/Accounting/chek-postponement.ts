import express from "express";
import { getUserById } from "../../../model/StoredProcedure";
import { format } from "date-fns";
import sendEmail from "../../../lib/sendEmail";
import generateRandomNumber from "../../../lib/generateRandomNumber";
import { defaultFormat } from "../../../lib/defaultDateFormat";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../controller";
import fs from "fs";
import PDFDocument from "pdfkit";
import { formatNumber } from "./collection";

const CheckPostponement = express.Router();
// const UMISEmailToSend = ["charlespalencia21@gmail.com"];
// const UCSMIEmailToSend = ["charlespalencia21@gmail.com"];

const UMISEmailToSend = [
  "upwardinsurance.grace@gmail.com",
  "lva_ancar@yahoo.com",
  "upwardinsurance.grace@gmail.com",
];
const UCSMIEmailToSend = [
  "upward.csmi@yahoo.com",
  "upward.csmi@gmail.com",
  "upwardinsurance.grace@gmail.com",
];

// ========================= REQUEST =================================

CheckPostponement.post(
  "/check-postponement/request/load-pnno",
  async (req, res) => {
    try {
      console.log(req.body);
      setTimeout(async () => {
        // Step 2: Create `tmp_numbers` table
        await prisma.$executeRawUnsafe(`
  CREATE TEMPORARY TABLE tmp_numbers (number INT);
`);

        // Step 3: Insert data into `tmp_numbers`
        await prisma.$executeRawUnsafe(`
  INSERT INTO tmp_numbers (number)
  SELECT x.i * 10 + y.i
  FROM (SELECT 0 i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) x,
       (SELECT 0 i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) y;
`);

        // Step 4: Create `TMP` table
        await prisma.$executeRawUnsafe(`
  CREATE TEMPORARY TABLE TMP AS
  SELECT
      DATE_ADD(CURDATE(), INTERVAL number DAY) AS \`Date\`,
      1 AS IsWorkDay,
      1 AS IsWeekDay
  FROM
      tmp_numbers;
`);

        // Step 5: Update `TMP` table based on holidays
        await prisma.$executeRawUnsafe(`
  UPDATE TMP
  SET IsWorkDay = 0
  WHERE \`Date\` IN (SELECT \`Date\` FROM holidays);
`);

        // Step 6: Update `TMP` table for weekends
        await prisma.$executeRawUnsafe(`
  UPDATE TMP
  SET IsWeekDay = 0, IsWorkDay = 0
  WHERE DAYOFWEEK(\`Date\`) IN (1, 7); -- Sunday = 1, Saturday = 7
`);

        // Step 7: Final SELECT query to fetch data
        const data = await prisma.$queryRawUnsafe(
          `

  select * from (
  SELECT 
      a.PNo,
      a.Name,
      'HO' AS BName
  FROM
      pdc a
  LEFT JOIN TMP c
      ON c.\`Date\` >= CURDATE() AND c.\`Date\` < a.Check_Date
  LEFT JOIN (
      SELECT 
          ID_No,
          SUM(IFNULL(Debit, 0) - IFNULL(Credit, 0)) AS Balance
      FROM
          journal
      WHERE GL_Acct = '1.03.01'
      GROUP BY ID_No
  ) d
      ON a.PNo = d.ID_No
  LEFT JOIN policy f
      ON a.PNo = f.policyno
  GROUP BY
      a.PNo, a.Name
  HAVING
      COUNT(c.\`Date\`) >= 3
  ) a
   where a.PNo like ?
  ORDER BY a.PNo;
`,
          `%${req.body.search}%`
        );
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`tmp_numbers\`;`);
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`TMP\`;`);

        res.send({
          success: true,
          message: "Successfully load pnnno",
          data,
        });
      }, 200);
    } catch (error: any) {
      console.log(`${CheckPostponement} : ${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.get(
  "/check-postponement/request/auto-id",
  async (req, res) => {
    try {
      const sql = `
      SELECT 
          CAST((YEAR(CURDATE()) % 100) AS CHAR) AS Year,
          lpad((COUNT(1) + 1), 4, '0') AS Count
      FROM 
          postponement
      WHERE 
          SUBSTRING(RPCDNo, 7, 2) = LPAD(YEAR(CURDATE()) % 100, 2, '0')
          AND Branch = 'HO';
      `;
      const data = await prisma.$queryRawUnsafe(sql);
      res.send({
        message: "Successfully Get ID",
        success: true,
        data,
      });
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/request/load-checks",
  async (req, res) => {
    try {
      await prisma.$executeRawUnsafe(`  
    DROP TEMPORARY TABLE IF EXISTS tmp_dates;
    `);
      await prisma.$executeRawUnsafe(`  
          CREATE TEMPORARY TABLE tmp_dates (
        Date DATE,
        IsWorkDay BOOLEAN,
        IsWeekDay BOOLEAN
    );
    `);
      await prisma.$executeRawUnsafe(`  
  INSERT INTO tmp_dates (Date, IsWorkDay, IsWeekDay)
  SELECT 
      DATE_ADD(CURDATE(), INTERVAL n DAY) AS Date,
      1 AS IsWorkDay,
      CASE WHEN DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL n DAY)) IN (1, 7) THEN 0 ELSE 1 END AS IsWeekDay
  FROM (
      SELECT a.N + b.N * 10 AS n
      FROM (
          SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
          UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
      ) a,
      (
          SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
      ) b
      ORDER BY n
      LIMIT 30
  ) numbers;
    `);

      await prisma.$executeRawUnsafe(`  
      UPDATE tmp_dates t
      JOIN holidays h ON t.Date = h.Date
      SET t.IsWorkDay = 0;
    `);

      await prisma.$executeRawUnsafe(`  
    UPDATE tmp_dates
    SET IsWorkDay = 0, IsWeekDay = 0
    WHERE DAYOFWEEK(Date) IN (1, 7);  
    `);

      const data = await prisma.$queryRawUnsafe(`
      SELECT '' as CheckNo
      union all
      SELECT 
        T.Check_No AS CheckNo
      FROM pdc T
      LEFT JOIN tmp_dates c 
          ON c.Date >= CURDATE() 
          AND c.Date <= T.Check_Date
          AND c.IsWorkDay = 1
      WHERE T.PNo = '${req.body.PNNo}'
      GROUP BY T.Check_No, T.Check_Date
      HAVING COUNT(c.Date) >= 3;
    `);

      res.send({
        message: "Successfully Get ID",
        success: true,
        data,
      });
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/request/load-checks-details",
  async (req, res) => {
    try {
      const data = await prisma.$queryRawUnsafe(`
        SELECT 
            Cast(Check_Date as Date) CheckDate,
      Bank,
      Check_No CheckNo,
      Check_Amnt Amount 
        FROM pdc  
          Where 
        Check_No = '${req.body.checkNo}' And PNo = '${req.body.PNNo}'
      limit 1
      `);
      res.send({
        message: "Successfully Get ID",
        success: true,
        data,
      });
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/request/load-rpcdno",
  async (req, res) => {
    try {
      const data = await prisma.$queryRawUnsafe(
        `  SELECT RPCDNo FROM postponement  Where Status = 'PENDING' and Branch = 'HO' and RPCDNo like ?`,
        `%${req.body.search}%`
      );

      res.send({
        message: "Successfully Saved",
        success: true,
        data,
      });
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/request/load-rpcd-details",
  async (req, res) => {
    try {
      const data = await prisma.$queryRawUnsafe(` 
       SELECT 
      PNNO,
      (SELECT DISTINCT
              (name)
          FROM
              pdc
          WHERE
              PNo = a.PNNo AND Check_No = a.CheckNo) AS 'Name',
      CheckNo,
      'Head Office' AS 'Branch Name',
      (SELECT 
              bank
          FROM
              pdc
          WHERE
              Check_No = a.CheckNo AND PNo = a.PNNO) AS 'Bank',
      (SELECT 
              Check_Amnt
          FROM
              pdc
          WHERE
              Check_No = a.CheckNo AND PNo = a.PNNO) AS 'check_Amnt',
      date_format(a.OldCheckDate ,'%m/%d/%Y') as OldCheckDate,
       date_format(a.NewCheckDate ,'%m/%d/%Y') as NewCheckDate,
      a.Reason,
      (SELECT 
              PaidVia
          FROM
              postponement
          WHERE
              RPCDNo = a.RPCD) AS 'PaidVia',
      (SELECT 
              Surplus
          FROM
              postponement
          WHERE
              RPCDNo = a.RPCD) AS 'Surplus',
      (SELECT 
              Deducted_to
          FROM
              postponement
          WHERE
              RPCDNo = a.RPCD) AS 'Deducted_to',
      (SELECT 
              PaidInfo
          FROM
              postponement
          WHERE
              RPCDNo = a.RPCD) AS 'PaidInfo'
  FROM
      (SELECT 
          *,
              (SELECT 
                      pnno
                  FROM
                      postponement
                  WHERE
                      RPCDNo = A.RPCD) AS 'PNNO'
      FROM
          postponement_detail A) a
  WHERE
      RPCD = '${req.body.RPCDNo}'  
      `);

      res.send({
        message: "Successfully Saved",
        success: true,
        data,
      });
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/request/check-is-pending",
  async (req, res) => {
    try {
      const data = await prisma.$queryRawUnsafe(`
            SELECT * FROM (
            SELECT 
             *,
              (SELECT PNNO FROM postponement WHERE RPCDNo = a.RPCDNo) AS PNNO,
              (SELECT status FROM postponement WHERE RPCDNo = a.RPCDNo) AS Status
              
            FROM postponement_detail a
          ) tbl 
          WHERE checkNo = '${req.body.checkNo}' AND Status = 'PENDING';
      `);
      res.send({
        message: "Successfully Get ID",
        success: true,
        data,
      });
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/request/saving",
  async (req, res) => {
    try {
      const department = req.cookies["up-dpm-login"];

      const user = await getUserById((req.user as any).UserId);
      const subtitle = `<h3>Check Deposit Postponement Request</h3>`;
      const text = getSelectedCheck(req.body.data);
      const Requested_By = user?.Username;
      const Requested_Date = new Date();
      const approvalCode = generateRandomNumber(6);

      // HEADER
      await prisma.postponement.create({
        data: {
          RPCDNo: req.body.RPCDNoRef,
          PNNo: req.body.PNNoRef,
          HoldingFees: parseFloat(
            req.body.HoldingFeesRef.replace(/,/g, "") || 0
          ).toFixed(2),
          PenaltyCharge: parseFloat(
            req.body.PenaltyChargeRef.replace(/,/g, "") || 0
          ).toFixed(2),
          PaidVia: req.body.HowToBePaidRef,
          PaidInfo: req.body.RemarksRef,
          Date: defaultFormat(new Date()),
          Status: "PENDING",
          Branch: req.body.BranchRef,
          Prepared_by: req.body.Prepared_By,
          Surplus: parseFloat(
            req.body.SurplusRef.replace(/,/g, "") || 0
          ).toFixed(2),
          Deducted_to: req.body.DeductedToRef,
        },
      });
      // DETAILS
      const selected = JSON.parse(req.body.data);
      for (const itm of selected) {
        await prisma.postponement_detail.create({
          data: {
            RPCDNo: uuidv4(),
            RPCD: req.body.RPCDNoRef,
            CheckNo: itm.CheckNo,
            OldCheckDate: defaultFormat(new Date(itm.OldDepositDate)),
            NewCheckDate: defaultFormat(new Date(itm.NewDate)),
            Reason: itm.Reason,
          },
        });
      }

      if (department === "UMIS") {
        for (const toEmail of UMISEmailToSend) {
          await sendRequestEmail({
            RPCD: req.body.RPCDNoRef,
            PNNo: req.body.PNNoRef,
            client: req.body.PNNoRef,
            text,
            Requested_Date,
            Requested_By,
            approvalCode,
            subtitle,
            holdingFee: req.body.HoldingFeesRef,
            penaltyCharge: req.body.PenaltyChargeRef,
            surplus: req.body.SurplusRef,
            paidVia: req.body.HowToBePaidRef,
            toEmail,
          });
          await prisma.postponement_auth_codes.create({
            data: {
              RPCD: req.body.RPCDNoRef,
              For_User: toEmail,
              Approved_Code: approvalCode.toString(),
              Disapproved_Code: "",
              postponement_auth_codes_id: uuidv4(),
            },
          });
        }
      } else {
        for (const toEmail of UCSMIEmailToSend) {
          await sendRequestEmail({
            RPCD: req.body.RPCDNoRef,
            PNNo: req.body.PNNoRef,
            client: req.body.PNNoRef,
            text,
            Requested_Date,
            Requested_By,
            approvalCode,
            subtitle,
            holdingFee: req.body.HoldingFeesRef,
            penaltyCharge: req.body.PenaltyChargeRef,
            surplus: req.body.SurplusRef,
            paidVia: req.body.HowToBePaidRef,
            toEmail,
          });
          await prisma.postponement_auth_codes.create({
            data: {
              RPCD: req.body.RPCDNoRef,
              For_User: toEmail,
              Approved_Code: approvalCode.toString(),
              Disapproved_Code: "",
              postponement_auth_codes_id: uuidv4(),
            },
          });
        }
      }

      res.send({
        message: "Successfully Saved",
        success: true,
        data: [],
      });
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.post("/check-postponement/request/edit", async (req, res) => {
  try {
    console.log(req.body);
    const department = req.cookies["up-dpm-login"];
    // HEADER
    await prisma.$queryRawUnsafe(
      `delete from postponement where RPCDNo = '${req.body.RPCDNoRef}'`
    );
    await prisma.postponement.create({
      data: {
        RPCDNo: req.body.RPCDNoRef,
        PNNo: req.body.PNNoRef,
        HoldingFees:
          req.body.HoldingFeesRef === "" ? "0.00" : req.body.HoldingFeesRef,
        PenaltyCharge:
          req.body.PenaltyChargeRef === "" ? "0.00" : req.body.PenaltyChargeRef,
        PaidVia: req.body.HowToBePaidRef,
        PaidInfo: req.body.RemarksRef,
        Date: defaultFormat(new Date()),
        Status: "PENDING",
        Branch: req.body.BranchRef,
        Prepared_by: req.body.Prepared_By,
        Surplus: req.body.SurplusRef === "" ? "0.00" : req.body.SurplusRef,
        Deducted_to:
          req.body.DeductedToRef === "" ? "0.00" : req.body.DeductedToRef,
      },
    });
    // DETAILS
    await prisma.$queryRawUnsafe(
      `delete from postponement_detail where RPCD = '${req.body.RPCDNoRef}'`
    );
    const selected = JSON.parse(req.body.data);
    for (const itm of selected) {
      await prisma.postponement_detail.create({
        data: {
          RPCDNo: uuidv4(),
          RPCD: req.body.RPCDNoRef,
          CheckNo: itm.CheckNo,
          OldCheckDate: defaultFormat(new Date(itm.OldDepositDate)),
          NewCheckDate: defaultFormat(new Date(itm.NewDate)),
          Reason: itm.Reason,
        },
      });
    }
    const user = await getUserById((req.user as any).UserId);
    const subtitle = `<h3>Check Deposit Postponement Request</h3>`;
    const text = getSelectedCheck(req.body.data);
    const Requested_By = user?.Username;
    const Requested_Date = new Date();
    const approvalCode = generateRandomNumber(6);

    await prisma.$queryRawUnsafe(
      `delete from postponement_auth_codes where RPCD = '${req.body.RPCDNoRef}'`
    );

    if (department === "UMIS") {
      for (const toEmail of UMISEmailToSend) {
        await sendRequestEmail({
          RPCD: req.body.RPCDNoRef,
          PNNo: req.body.PNNoRef,
          client: req.body.PNNoRef,
          text,
          Requested_Date,
          Requested_By,
          approvalCode,
          subtitle,
          holdingFee: req.body.HoldingFeesRef,
          penaltyCharge: req.body.PenaltyChargeRef,
          surplus: req.body.SurplusRef,
          paidVia: req.body.HowToBePaidRef,
          toEmail,
        });

        await prisma.postponement_auth_codes.create({
          data: {
            RPCD: req.body.RPCDNoRef,
            For_User: toEmail,
            Approved_Code: approvalCode.toString(),
            Disapproved_Code: "",
            postponement_auth_codes_id: uuidv4(),
          },
        });
      }
    } else {
      for (const toEmail of UCSMIEmailToSend) {
        await sendRequestEmail({
          RPCD: req.body.RPCDNoRef,
          PNNo: req.body.PNNoRef,
          client: req.body.PNNoRef,
          text,
          Requested_Date,
          Requested_By,
          approvalCode,
          subtitle,
          holdingFee: req.body.HoldingFeesRef,
          penaltyCharge: req.body.PenaltyChargeRef,
          surplus: req.body.SurplusRef,
          paidVia: req.body.HowToBePaidRef,
          toEmail,
        });

        await prisma.postponement_auth_codes.create({
          data: {
            RPCD: req.body.RPCDNoRef,
            For_User: toEmail,
            Approved_Code: approvalCode.toString(),
            Disapproved_Code: "",
            postponement_auth_codes_id: uuidv4(),
          },
        });
      }
    }
    res.send({
      message: `Update ${req.body.RPCDNoRef} Successfully`,
      success: true,
      data: [],
    });
  } catch (error: any) {
    console.log(`${error.message}`);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});
// ========================= APPROVED ===========================
CheckPostponement.post(
  "/check-postponement/approved/print",
  async (req, res) => {
    try {
      const data = (await prisma.$queryRawUnsafe(
        `   
        selecT 
          PNNO, 
          CheckNo, 
          'HO' as Branch,
          date_format(a.OldCheckDate,'%m/%d/%Y') as OldDepositDate,
          date_format(a.NewCheckDate,'%m/%d/%Y') as NewDate,
          CAST(DATEDIFF(a.NewCheckDate,  a.OldCheckDate) AS CHAR) AS Datediff,
          a.Reason, 
          (selecT distinct(name) from pdc where PNo = a.PnNo and Check_No = a.CheckNo) as 'Name', 
          (select bank from pdc where Check_No = a.CheckNo and PNo =a.PNNO ) as 'Bank', 
          (select Check_Amnt from pdc where Check_No = a.CheckNo and PNo =a.PNNO ) as 'Amount', 
          (seleCT PaidVia from postponement where RPCDNo = a.RPCD) as 'PaidVia', 
          (seleCT Surplus from postponement where RPCDNo = a.RPCD) as 'Surplus', 
          (seleCT Deducted_to from postponement where RPCDNo = a.RPCD) as 'Deducted_to',
          (seleCT PaidInfo from postponement where RPCDNo = a.RPCD) as 'PaidInfo' 
      from (
          seleCT *, 
          (selecT pnno from postponement where RPCDNo = A.RPCD) as 'PNNO' 
          from postponement_detail A) a 
      where RPCD = ?   
      order by OldDepositDate asc`,
        req.body.state.rcpnNo
      )) as Array<any>;

      const newData = data.map((itm: any, idx: number) => {
        itm.Amount = formatNumber(
          parseFloat(itm.Amount.toString().replace(/,/g, ""))
        );
        return { ...itm, ln: idx + 1 };
      });

      let PAGE_WIDTH = 612;
      let PAGE_HEIGHT = 792;

      const headers = [
        {
          label: "CHECK NO",
          key: "CheckNo",
          style: { align: "left", width: 60 },
        },
        {
          label: "OLD CHECK DATE",
          key: "OldDepositDate",
          style: { align: "left", width: 60 },
        },
        {
          label: "NEW CHECK DATE",
          key: "NewDate",
          style: { align: "left", width: 60 },
        },
        {
          label: "BANK",
          key: "Bank",
          style: { align: "left", width: 80 },
        },
        {
          label: "AMOUNT",
          key: "Amount",
          style: { align: "right", width: 60 },
        },
        {
          label: "PENALTY",
          key: "Penalty",
          style: { align: "right", width: 60 },
        },
        {
          label: "NUMBER OF DAYS",
          key: "Datediff",
          style: { align: "left", width: 60 },
        },
        {
          label: "REASON",
          key: "Reason",
          style: { align: "left", width: 80 },
        },
        { label: "SEQ", key: "ln", style: { align: "right", width: 30 } },
      ];

      const outputFilePath = "manok.pdf";
      const doc = new PDFDocument({
        size: [PAGE_WIDTH, PAGE_HEIGHT],
        margin: 0,
        bufferPages: true,
      });

      const writeStream = fs.createWriteStream(outputFilePath);
      doc.pipe(writeStream);
      doc.fontSize(12);
      doc.text(req.body.reportTitle, 0, 35, {
        align: "center",
        baseline: "middle",
      });
      doc.text("Post Date Checks Postponement Approved", 0, 52, {
        align: "center",
        baseline: "middle",
      });

      doc.fontSize(8);
      // first line
      doc.font("Helvetica-Bold");
      doc.text("P.N. No. :", 20, 85, {
        align: "left",
      });
      doc.font("Helvetica");
      doc.text(req.body.state.PNo, 85, 85, {
        align: "left",
      });
      doc.font("Helvetica-Bold");
      doc.text("Reference No :", PAGE_WIDTH - 150, 85, {
        align: "left",
      });
      doc.font("Helvetica");
      doc.text(req.body.state.rcpnNo, PAGE_WIDTH - 80, 85, {
        align: "left",
      });

      // second line
      doc.font("Helvetica-Bold");
      doc.text("Client Name  :", 20, 100, {
        align: "left",
      });
      doc.font("Helvetica");
      doc.text(req.body.state.Name, 85, 100, {
        align: "left",
      });

      let yAxis = 115 + 35;

      doc.font("Helvetica-Bold");

      let hx = 20;
      headers.forEach((colItm: any, colIndex: number) => {
        doc.text(colItm.label, hx, yAxis, {
          align: colItm.style.align === "right" ? "center" : colItm.style.align,
          width: colItm.style.width,
        });
        hx += colItm.style.width;
      });

      doc
        .moveTo(10, yAxis + 20)
        .lineTo(PAGE_WIDTH - 20, yAxis + 20)
        .stroke();

      yAxis += 27;

      doc.font("Helvetica");

      newData.forEach((rowItm: any, rowIndex: number) => {
        const rowHeight = Math.max(
          ...headers.map((itm: any) => {
            return doc.heightOfString(rowItm[itm.key], {
              width: itm.style.width - 5,
              align: itm.style.align,
            });
          })
        );
        let x = 20;
        headers.forEach((colItm: any, colIndex: number) => {
          doc.text(rowItm[colItm.key], x, yAxis, {
            align: colItm.style.align,
            width: colItm.style.width - 5,
          });
          x += colItm.style.width;
        });

        yAxis += rowHeight + 3;
      });
      let xs = 10;
      doc.text(
        `Received By : _______________________`,
        20 + xs,
        PAGE_HEIGHT - 70,
        {
          align: "left",
          width: 200,
        }
      );

      doc.text(
        `Printed ${format(new Date(), "MM/dd/yyyy hh:mm a")}`,
        20,
        PAGE_HEIGHT - 30,
        {
          align: "left",
        }
      );

      doc.text(`Page 1 of 1`, PAGE_WIDTH - 120, PAGE_HEIGHT - 30, {
        align: "right",
        width: 100,
      });

      doc.end();
      writeStream.on("finish", (e: any) => {
        console.log(`PDF created successfully at: ${outputFilePath}`);
        const readStream = fs.createReadStream(outputFilePath);
        readStream.pipe(res);

        readStream.on("end", () => {
          fs.unlink(outputFilePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            } else {
              console.log(`File ${outputFilePath} deleted successfully.`);
            }
          });
        });
      });
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);

CheckPostponement.post(
  "/check-postponement/approve/load-rpcdno",
  async (req, res) => {
    try {
      res.send({
        message: `Update ${req.body.search} Successfully`,
        success: true,
        data: await prisma.$queryRawUnsafe(
          ` Select RPCDNo from postponement  Where Status = 'PENDING' and RPCDNo like ?`,
          `%${req.body.search}%`
        ),
      });
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/approve/load-details",
  async (req, res) => {
    try {
      const qry = `
        selecT 
          PNNO, 
          CheckNo, 
          'HO' as Branch,
          date_format(a.OldCheckDate,'%m/%d/%Y') as OldDepositDate,
          date_format(a.NewCheckDate,'%m/%d/%Y') as NewDate,
          CAST(DATEDIFF(a.NewCheckDate,  a.OldCheckDate) AS CHAR) AS Datediff,
          a.Reason, 
          (selecT distinct(name) from pdc where PNo = a.PnNo and Check_No = a.CheckNo) as 'Name', 
          (select bank from pdc where Check_No = a.CheckNo and PNo =a.PNNO ) as 'Bank', 
          (select Check_Amnt from pdc where Check_No = a.CheckNo and PNo =a.PNNO ) as 'Amount', 
          (seleCT PaidVia from postponement where RPCDNo = a.RPCD) as 'PaidVia', 
          (seleCT Surplus from postponement where RPCDNo = a.RPCD) as 'Surplus', 
          (seleCT Deducted_to from postponement where RPCDNo = a.RPCD) as 'Deducted_to',
          (seleCT PaidInfo from postponement where RPCDNo = a.RPCD) as 'PaidInfo' 
      from (
          seleCT *, 
          (selecT pnno from postponement where RPCDNo = A.RPCD) as 'PNNO' 
          from postponement_detail A) a 
      where RPCD = ?   
      order by OldDepositDate asc
      `;
      console.log(qry);
      res.send({
        message: `Update ${req.body.RPCDNo} Successfully`,
        success: true,
        data: await prisma.$queryRawUnsafe(qry, req.body.RPCDNo),
      });
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/approve/confirmation",
  async (req, res) => {
    try {
      const isCodeFound: Array<any> = await prisma.$queryRawUnsafe(
        `selecT * from postponement_auth_codes where Approved_Code = '${req.body.code}'`
      );
      if (isCodeFound.length <= 0) {
        return res.send({
          message: `Invalid Authorization Code [${req.body.code}]!`,
          success: false,
          data: [],
        });
      }
      const dt: Array<any> = await prisma.$queryRawUnsafe(
        `selecT * from postponement_auth_codes where RPCD ='${isCodeFound[0].RPCD}' and used_by is not null`
      );
      if (dt.length <= 0) {
        res.send({
          message: `Are you sure you want to confirm this transaction?`,
          success: true,
          data: [
            {
              RPCD: isCodeFound[0].RPCD,
              code: req.body.code,
              mode: req.body.mode,
            },
          ],
        });
      } else {
        return res.send({
          message: `Request No. ${isCodeFound[0].RPCD} had already been approved/disapproved!`,
          success: false,
          data: [],
        });
      }
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/approve/con-confirmation",
  async (req, res) => {
    try {
      const department = req.cookies["up-dpm-login"];

      const user = await getUserById((req.user as any).UserId);

      const subtitle = `<h3>Check Deposit Postponement Request</h3>`;
      const text = getSelectedCheck(req.body.data);
      const Requested_By = user?.Username;
      const Requested_Date = new Date();
      const approvalCode = generateRandomNumber(6);

      if (department === "UMIS") {
        for (const toEmail of UMISEmailToSend) {
          await sendApprovedEmail({
            RPCD: req.body.RPCDNoRef,
            PNNo: req.body.PNNoRef,
            client: req.body.NameRef,
            text,
            Requested_Date,
            Requested_By,
            approvalCode,
            subtitle,
            holdingFee: req.body.HoldingFeesRef,
            penaltyCharge: req.body.PenaltyChargeRef,
            surplus: req.body.SurplusRef,
            paidVia: req.body.HowToBePaidRef,
            toEmail,
            isApproved: req.body.mode === "Approve",
            Approved_By: user?.Username,
            code: req.body.code,
          });
          await prisma.postponement_auth_codes.create({
            data: {
              RPCD: req.body.RPCDNoRef,
              For_User: toEmail,
              Approved_Code: approvalCode.toString(),
              Disapproved_Code: "",
              postponement_auth_codes_id: uuidv4(),
            },
          });
        }
      } else {
        for (const toEmail of UCSMIEmailToSend) {
          await sendApprovedEmail({
            RPCD: req.body.RPCDNoRef,
            PNNo: req.body.PNNoRef,
            client: req.body.NameRef,
            text,
            Requested_Date,
            Requested_By,
            approvalCode,
            subtitle,
            holdingFee: req.body.HoldingFeesRef,
            penaltyCharge: req.body.PenaltyChargeRef,
            surplus: req.body.SurplusRef,
            paidVia: req.body.HowToBePaidRef,
            toEmail,
            isApproved: req.body.mode === "Approve",
            Approved_By: user?.Username,
            code: req.body.code,
          });
          await prisma.postponement_auth_codes.create({
            data: {
              RPCD: req.body.RPCDNoRef,
              For_User: toEmail,
              Approved_Code: approvalCode.toString(),
              Disapproved_Code: "",
              postponement_auth_codes_id: uuidv4(),
            },
          });
        }
      }

      await prisma.$queryRawUnsafe(
        `update postponement_auth_codes set used_by ='${user?.Username}', used_datetime =now() where Approved_Code ='${req.body.code}'`
      );
      if (req.body.mode === "Approve") {
        const data = JSON.parse(req.body.data);
        for (const itm of data) {
          await prisma.$queryRawUnsafe(
            `Update pdc set Check_Date = '${itm[5]}' where PNo = '${req.body.PNNoRef}' and Check_No = '${itm[1]}'`
          );
        }
        await prisma.$queryRawUnsafe(
          `Update postponement set Status = 'APPROVED' WHERE RPCDNo = '${req.body.RPCD}' `
        );

        res.send({
          message: `Request has been approved.`,
          success: true,
          data: [],
        });
      } else {
        await prisma.$queryRawUnsafe(
          `Update postponement set Status = 'DISAPPROVED' WHERE RPCDNo = '${req.body.RPCD}' `
        );
        res.send({
          message: `Request has been disapproved.`,
          success: true,
          data: [],
        });
      }
    } catch (error: any) {
      console.log(`${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);

/// ============================

function getSelectedCheck(selected: string) {
  let tbodyText = "";
  JSON.parse(selected).forEach((item: any) => {
    tbodyText += generateTextTable(item);
  });
  return tbodyText;
}
function generateTextTable(item: any) {
  return `
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px">${item.CheckNo}</td>
    <td style="border: 1px solid #ddd; padding: 8px">${item.Bank}</td>
    <td style="border: 1px solid #ddd; padding: 8px">₱${item.Amount}</td>
    <td style="border: 1px solid #ddd; padding: 8px">${item.OldDepositDate}</td>
    <td style="border: 1px solid #ddd; padding: 8px">${item.NewDate}</td>
    <td style="border: 1px solid #ddd; padding: 8px">${item.Datediff}</td>
    <td style="border: 1px solid #ddd; padding: 8px">${item.Reason}</td>
  </tr>`;
}
async function sendRequestEmail(props: any) {
  const {
    RPCD,
    PNNo,
    client,
    text,
    Requested_Date,
    Requested_By,
    approvalCode,
    subtitle,
    holdingFee,
    penaltyCharge,
    surplus,
    paidVia,
    toEmail,
  } = props;
  const totalFee =
    parseFloat(holdingFee.replace(/,/g, "")) +
    parseFloat(penaltyCharge.replace(/,/g, "")) +
    parseFloat(surplus.replace(/,/g, ""));
  const strong1 = `
    font-family: Arial, Helvetica, sans-serif;
            font-size: 14px;
            color: #334155;
          
    `;
  const strong2 = `font-family: 'Courier New', Courier, monospace;
    font-size: 16px;`;
  const th = ` border: 1px solid #ddd;
    padding: 8px;
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #64748b;
    color: white;`;
  await sendEmail(
    { user: "upwardumis2020@gmail.com", pass: "vapw ridu eorg ukxd" },
    "upwardumis2020@gmail.com",
    `${toEmail}`,
    "For Approval",
    `
  <div
    style="
      background-color: #64748b;
      color: white;
      padding: 7px;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      text-align: center;
    "
  >
    <h2>UPWARD</h2>
    ${subtitle}
    
  </div>
  <div style="text-align: center">
    <p>
      <strong
        style="${strong1}"
        >RCPD No. : </strong
      ><strong
        style="${strong2}"
        >${RPCD}</strong
      >
    </p>
    <p>
      <strong
        style="${strong1}"
        >PN No. : </strong
      ><strong
        style="${strong2}"
        >${PNNo}</strong
      >
    </p>
    <p>
      <strong
        style="${strong1}"
        >Branch : </strong
      ><strong
        style="${strong2}"
        >HO</strong
      >
    </p>
    <p>
    <strong
      style="${strong1}"
      >Account Name : </strong
    ><strong
      style="${strong2}"
      >${client}</strong
    >
    ${
      approvalCode
        ? `<p>
      <strong
        style="${strong1}"
        >Approval Code : </strong
      ><strong
        style="${strong2} color:green;font-weight: bold;"
        >${approvalCode}</strong
      >
    </p>`
        : ""
    }
  </div>
  <table
    style="
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
    "
  >
    <thead>
      <tr>
        <th
          style="${th}"
        >
          Check No.
        </th>
        <th
          style="${th}"
        >
          Bank
        </th>
        <th
          style="${th}"
        >
          Amount
        </th>
        <th
          style="${th}"
        >
          Old Deposite Date
        </th>
        <th
          style="${th}"
        >
          New Deposite Date
        </th>
        <th
          style="${th}"
        >
          Date Difference
        </th>
        <th
          style="${th}"
        >
          Reason
        </th>
      </tr>
    </thead>
    <tbody>
      ${text}
    </tbody>
  </table>
  <br />
  <br />
  <div
    style="
      text-align: center;
      font-size: 14px;
      font-family: 'Courier New', Courier, monospace;
    "
  >
    <p>Total Fees:<span style="font-weight: 600; color: #334155;">${totalFee}</span></p>
    <p style="font-weight: 200">
    How to be paid:<span style="font-weight: 600;color: #334155;">
      ${paidVia}
    </span>
    </p>
    <p>Other Informations</p>
  </div>
  <br />
  <br />
  <div
    style="
      text-align: center;
      font-size: 14px;
      font-family: 'Courier New', Courier, monospace;
    "
  >
    <p>Request By:<span style="font-weight: 600; color: #334155;">${Requested_By}</span></p>
    <p style="font-weight: 200">
      Request Date:<span style="font-weight: 600;color: #334155;">${format(
        Requested_Date,
        "MM/dd/yyyy"
      )}</span>
    </p>
    <p>This is a computer generated E-mail</p>
  </div>
    `
  );
}
async function sendApprovedEmail(props: any) {
  const {
    RPCD,
    PNNo,
    client,
    text,
    Requested_Date,
    Requested_By,
    subtitle,
    holdingFee,
    penaltyCharge,
    surplus,
    paidVia,
    isApproved,
    username,
    code,
    Approved_By,
    toEmail,
  } = props;
  const totalFee =
    parseFloat(holdingFee.replace(/,/g, "")) +
    parseFloat(penaltyCharge.replace(/,/g, "")) +
    parseFloat(surplus.replace(/,/g, ""));
  const strong1 = `
    font-family: Arial, Helvetica, sans-serif;
            font-size: 14px;
            color: #334155;
          
    `;
  const strong2 = `font-family: 'Courier New', Courier, monospace;
    font-size: 16px;`;
  const th = ` border: 1px solid #ddd;
    padding: 8px;
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color:${isApproved ? "green" : "#b91c1c"};
    color: white;`;
  await sendEmail(
    { user: "upwardumis2020@gmail.com", pass: "vapw ridu eorg ukxd" },
    "upwardumis2020@gmail.com",
    `${toEmail}`,
    `${isApproved ? "Approved" : "Disapproved"}`,
    `
  <div
    style="
      background-color: ${isApproved ? "green" : "#b91c1c"};
      color: white;
      padding: 7px;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      text-align: center;
    "
  >
    <h2>UPWARD</h2>
    ${subtitle}
  </div>
  <div style="text-align: center">
  <p>
      <strong
        style="${strong1}"
        >Status : </strong
      ><strong
        style="${strong2}"
        >${
          isApproved
            ? "<span style='color:green'>APPROVED</span>"
            : "<span style='color:#b91c1c'>DISAPPROVED</span>"
        }</strong
      >
    </p>
    <p>
      <strong
        style="${strong1}"
        >RCPD No. : </strong
      ><strong
        style="${strong2}"
        >${RPCD}</strong
      >
    </p>
    <p>
      <strong
        style="${strong1}"
        >PN No. : </strong
      ><strong
        style="${strong2}"
        >${PNNo}</strong
      >
    </p>
    <p>
      <strong
        style="${strong1}"
        >Branch : </strong
      ><strong
        style="${strong2}"
        >Head Office</strong
      >
    </p>
    <p>
    <strong
      style="${strong1}"
      >Account Name : </strong
    ><strong
      style="${strong2}"
      >${client}</strong
    >
    </p>

    <p>
    <strong
      style="${strong1}"
      >Approved By: </strong
    ><strong
      style="${strong2}"
      >${Approved_By}</strong
    >
    </p>
   <p>
    <strong
      style="${strong1}"
      >Approved Code: </strong
    ><strong
      style="${strong2} color:green;font-weight: bold;"
      >${code}</strong
    >
    </p>
  </div>
  <table
    style="
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
    "
  >
    <thead>
      <tr>
        <th
          style="${th}"
        >
          Check No.
        </th>
        <th
          style="${th}"
        >
          Bank
        </th>
        <th
          style="${th}"
        >
          Amount
        </th>
        <th
          style="${th}"
        >
          Old Deposite Date
        </th>
        <th
          style="${th}"
        >
          New Deposite Date
        </th>
        <th
          style="${th}"
        >
          Date Difference
        </th>
        <th
          style="${th}"
        >
          Reason
        </th>
      </tr>
    </thead>
    <tbody>
      ${text}
    </tbody>
  </table>
  <br />
  <br />
  <div
    style="
      text-align: center;
      font-size: 14px;
      font-family: 'Courier New', Courier, monospace;
    "
  >
    <p>Total Fees:<span style="font-weight: 600; color: #334155;">${totalFee}</span></p>
    <p style="font-weight: 200">
    How to be paid:<span style="font-weight: 600;color: #334155;">
      ${paidVia}
    </span>
    </p>
    <p>Other Informations</p>
  </div>
  <br />
  <br />
  <div
    style="
      text-align: center;
      font-size: 14px;
      font-family: 'Courier New', Courier, monospace;
    "
  >
    <p>Request By:<span style="font-weight: 600; color: #334155;">${Requested_By}</span></p>
    <p style="font-weight: 200">
      Request Date:<span style="font-weight: 600;color: #334155;">${format(
        new Date(Requested_Date),
        "MM/dd/yyyy"
      )}</span>
    </p>
    <p>This is a computer generated E-mail</p>
  </div>
    `
  );
}

export default CheckPostponement;
