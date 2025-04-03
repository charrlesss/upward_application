import express from "express";
import { PrismaClient } from "@prisma/client";
import { saveUserLogs, saveUserLogsCode } from "./Claims";
import PDFDocument from "pdfkit";
import { format } from "date-fns";
import fs from "fs";
import path from "path";
import { drawExcel } from "../lib/excel-generator";
const prisma = new PrismaClient();
const Report = express.Router();

const reportQry = ({ select, where }: { select: string; where: string }) => `
SELECT 
    ${select}
FROM
    claims.claims a
        LEFT JOIN
    claims.claims_details b ON a.claim_id = b.claim_id
    left join (
	     SELECT 
              a.IDNo,
                  a.PolicyType,
                  a.PolicyNo,
                  'UCSMI' AS Department,
                  IF(b.company <> ''
                      AND b.company IS NOT NULL, b.company, CONCAT(IF(b.lastname <> ''
                      AND b.lastname IS NOT NULL, CONCAT(b.lastname, ', '), ''), b.firstname, IF(b.suffix <> '' AND b.suffix IS NOT NULL, CONCAT(', ', b.suffix), ''))) AS Name,
                  c.ChassisNo,
                  c.MotorNo,
                   c.PlateNo,
                  concat(c.Make,' ',c.BodyType,' ',c.Model,' ',c.Color ) as unit_insured
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
                  c.MotorNo,
                  c.PlateNo,
                  concat(c.Make,' ',c.BodyType,' ',c.Model,' ',c.Color ) as unit_insured
          FROM
              upward_insurance_umis.policy a
          LEFT JOIN upward_insurance_umis.entry_client b ON a.IDNo = b.entry_client_id
          LEFT JOIN upward_insurance_umis.vpolicy c ON a.PolicyNo = c.PolicyNo
    ) c on a.policyNo = c.PolicyNo
${where} 
`;
Report.post("/report/get-insurance-provider", async (req, res) => {
  try {
    const [account] = await prisma.$transaction([
      prisma.$queryRawUnsafe(
        `
        SELECT 'All' as account
        union all
        SELECT account FROM claims.claims group by account;`
      ),
    ]);

    res.send({
      message: "Successfully Get Report.",
      success: true,
      data: account,
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
});

// Settled
Report.post("/report/approved-settled-pdf", async (req, res) => {
  try {
    const DateFrom = format(new Date(req.body.dateFrom), "yyyy-MM-dd");
    const DateTo = format(new Date(req.body.dateTo), "yyyy-MM-dd");

    const qry = reportQry({
      select: `
        c.Name,
        c.unit_insured,
        a.policyNo,
        c.ChassisNo,
        c.MotorNo,
        c.PlateNo,
        b.date_received,
        b.date_report,
        b.claim_type,
        format(b.amount_claim,2) as amount_claim,
        b.amount_approved,
        b.participation,
        b.net_amount,
        b.name_ttpd,
        b.claimStatus,
        b.date_approved,
        if(b.status = 'Approved','Settled',b.status) as status
      `,
      where: `
      where 
        b.status = 'Approved'
        and  str_to_date(b.date_approved,'%Y-%m-%d') >= '${DateFrom}'
        and  str_to_date(b.date_approved,'%Y-%m-%d') <= '${DateTo}'
        ${
          req.body.department === "All"
            ? ""
            : `and a.department = '${req.body.department}'`
        }
         ${
           req.body.claimType === "All"
             ? ""
             : `and b.claim_type = '${req.body.claimType}'`
         }
        ${
          req.body.status === "All"
            ? ""
            : `and b.claimStatus = '${req.body.status}'`
        }
         ${
           req.body.status === "All"
             ? ""
             : `and b.account = '${req.body.insurance}'`
         }
       
      `,
    });
    console.log(qry);
    const result: any = await prisma.$queryRawUnsafe(qry);

    const data = result.map((itm: any) => {
      itm.date_report = format(new Date(itm.date_report), "MM/dd/yyyy");
      itm.date_received = format(new Date(itm.date_received), "MM/dd/yyyy");
      itm.date_approved =
        itm.date_approved !== ""
          ? format(new Date(itm.date_approved), "MM/dd/yyyy")
          : "";
      return itm;
    });
    const headers = [
      {
        label: "Name of Client",
        key: "Name",
        style: { width: 150, textAlign: "left" },
      },
      {
        label: "Unit Insured",
        key: "unit_insured",
        style: { width: 150, textAlign: "left" },
      },
      {
        label: "Policy No#",
        key: "policyNo",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Engine No#",
        key: "MotorNo",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Plate No#",
        key: "PlateNo",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Chassis No#",
        key: "ChassisNo",
        style: { width: 120, textAlign: "left" },
      },
      {
        label: "Date Received",
        key: "date_received",
        style: { width: 65, textAlign: "left" },
      },
      {
        label: "Date of Claim",
        key: "date_report",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Type of Claim",
        key: "claim_type",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Amount of Claim",
        key: "amount_claim",
        style: { width: 80, textAlign: "right" },
      },
      {
        label: "Date Settled",
        key: "date_approved",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Status of Claim",
        key: "status",
        style: { width: 80, textAlign: "left" },
      },
    ];

    const outputFilePath = path.join(__dirname, "manok.pdf");

    const PAGE_WIDTH = 1240; // A4 Portrait width
    const PAGE_HEIGHT = 595; // A4 Portrait height
    const MARGINS = {
      top: 100,
      bottom: 50,
      left: 20,
      right: 20,
    };
    const rowFontSize = 9;
    const doc = new PDFDocument({
      margin: 0,
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      bufferPages: true,
    });
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);

    function getRowHeight(itm: any, headers: any) {
      const rowHeight = Math.max(
        ...headers.map((hItm: any) => {
          return doc.heightOfString(itm[hItm.key] || "-", {
            width: hItm.style.width - 5,
            align: hItm.style.textAlign,
          });
        }),
        rowFontSize + 1
      );

      return rowHeight + 5;
    }
    function addPageHeader(header: Array<any>, y: number, _x: any = 0) {
      doc.font("Helvetica-Bold");
      doc.fontSize(11);
      const rowHeight = Math.max(
        ...header.map((itm) =>
          doc.heightOfString(itm.label, { width: itm.style.width })
        ),
        10
      );
      let x = MARGINS.left + _x;
      header.forEach((itm) => {
        if (itm.key === "ID_No") {
          doc.text(itm.label, x, y, {
            width: header[2].style.width - 5 + (header[3].style.width - 5),
            align: "center",
          });
        } else {
          doc.text(itm.label, x, y, {
            width: itm.style.width - 5,
            align:
              itm.style.textAlign === "right" ? "center" : itm.style.textAlign,
          });
        }
        x += itm.style.width + 5;
      });
      return y + rowHeight + 5;
    }
    function drawTitle() {
      doc.font("Helvetica-Bold");
      doc.fontSize(12);
      doc.text(req.body.title, 20, 30);
    }

    drawTitle();
    let currentPage = 1;
    let yAxis = MARGINS.top;
    yAxis = addPageHeader(headers, yAxis);

    data.forEach((itm: any, idx: number) => {
      let rowHeight = getRowHeight(itm, headers);

      if (yAxis + rowHeight > PAGE_HEIGHT - MARGINS.bottom) {
        currentPage = currentPage + 1;
        doc.addPage({
          size: [PAGE_WIDTH, PAGE_HEIGHT],
          margin: 0,
          bufferPages: true,
        });
        drawTitle();
        yAxis = addPageHeader(headers, MARGINS.top);
      }

      let x = MARGINS.left;
      headers.forEach((hItm: any) => {
        const value = itm[hItm.key] || "-";
        doc.font("Helvetica");
        doc.fontSize(10);
        doc.text(value, x, yAxis, {
          width: hItm.style.width - 5,
          align: value === "-" ? "center" : hItm.style.textAlign,
        });
        x += hItm.style.width + 5;
      });

      yAxis += rowHeight;
    });

    yAxis += 5;

    const range = doc.bufferedPageRange();
    let i;
    let end;

    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.text(
        `Page ${i + 1} of ${range.count}`,
        PAGE_WIDTH - 80,
        PAGE_HEIGHT - 30
      );
      doc.text(
        `Printed ${format(new Date(), "MM/dd/yyyy hh:mm a")}`,
        20,
        PAGE_HEIGHT - 30
      );
    }

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
});
Report.post("/report/approved-settled-excel", async (req, res) => {
  try {
    const DateFrom = format(new Date(req.body.dateFrom), "yyyy-MM-dd");
    const DateTo = format(new Date(req.body.dateTo), "yyyy-MM-dd");

    const qry = reportQry({
      select: `
        c.Name,
        c.unit_insured,
        a.policyNo,
        c.ChassisNo,
        c.MotorNo,
        c.PlateNo,
        b.date_received,
        b.date_report,
        b.claim_type,
        format(b.amount_claim,2) as amount_claim,
        b.amount_approved,
        b.participation,
        b.net_amount,
        b.name_ttpd,
        b.claimStatus,
        b.date_approved,
        if(b.status = 'Approved','Settled',b.status) as status
      `,
      where: `
      where 
        b.status = 'Approved'
        and  str_to_date(b.date_approved,'%Y-%m-%d') >= '${DateFrom}'
        and  str_to_date(b.date_approved,'%Y-%m-%d') <= '${DateTo}'
        ${
          req.body.department === "All"
            ? ""
            : `and a.department = '${req.body.department}'`
        }
         ${
           req.body.claimType === "All"
             ? ""
             : `and b.claim_type = '${req.body.claimType}'`
         }
        ${
          req.body.status === "All"
            ? ""
            : `and b.claimStatus = '${req.body.status}'`
        }
         ${
           req.body.status === "All"
             ? ""
             : `and b.account = '${req.body.insurance}'`
         }
       
      `,
    });
    console.log(qry);
    const result: any = await prisma.$queryRawUnsafe(qry);

    const data = result.map((itm: any) => {
      itm.date_report = format(new Date(itm.date_report), "MM/dd/yyyy");
      itm.date_received = format(new Date(itm.date_received), "MM/dd/yyyy");
      itm.date_approved =
        itm.date_approved !== ""
          ? format(new Date(itm.date_approved), "MM/dd/yyyy")
          : "";
      return itm;
    });

    const title = req.body.title;
    drawExcel(res, {
      columns: [
        { key: "Name", width: 70 },
        { key: "unit_insured", width: 70 },
        { key: "policyNo", width: 25 },
        { key: "MotorNo", width: 25 },
        { key: "PlateNo", width: 25 },
        { key: "ChassisNo", width: 30 },
        { key: "date_received", width: 22 },
        { key: "date_report", width: 22 },
        { key: "claim_type", width: 22 },
        { key: "amount_claim", width: 22 },
        { key: "date_approved", width: 22 },
        { key: "status", width: 22 },
      ],
      data: data,
      beforeDraw: (props: any, worksheet: any) => {
        title.split("\n").forEach((t: string, idx: number) => {
          const tt = worksheet.addRow([t]);
          props.mergeCells(
            idx + 1,
            props.alphabet[0],
            props.alphabet[props.columns.length - 1]
          );
          const alignColumns = props.alphabet.slice(0, props.columns.length);
          props.setAlignment(1, alignColumns, {
            horizontal: "left",
            vertical: "middle",
          });
          tt.font = { bolder: true };
        });
        props.setFontSize([1, 2, 3], 12);

        worksheet.addRow([]);
        worksheet.addRow([]);
        // Now, insert the column header row after the custom rows (row 3)
        const headerRow = worksheet.addRow([
          "Name of Client",
          "Unit Insured",
          "Policy No#",
          "Engine No#",
          "Plate No#",
          "Chassis No#",
          "Date Received",
          "Date of Claim",
          "Type of Claim",
          "Amount of Claim",
          "Date Settled",
          "Status of Claim",
        ]);
        headerRow.font = { bold: true };
        props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
          bottom: { style: "thin" },
        });
      },
      onDraw: (props: any, rowItm: any, rowIdx: number) => {
        props.setAlignment(rowIdx + 7, ["J"], {
          horizontal: "right",
          vertical: "middle",
        });
      },
      afterDraw: (props: any, worksheet: any) => {},
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
});

// Ongoing
Report.post("/report/ongoing-pdf", async (req, res) => {
  try {
    const qry = reportQry({
      select: `
        c.Name,
        c.unit_insured,
        a.policyNo,
        c.ChassisNo,
        c.MotorNo,
        c.PlateNo,
        b.date_received,
        b.date_report,
        b.claim_type,
        format(b.amount_claim,2) as amount_claim,
        b.amount_approved,
        b.participation,
        b.net_amount,
        b.name_ttpd,
        b.claimStatus,
        b.date_approved,
        if(b.status = 'Approved','Settled',b.status) as status
      `,
      where: `
      where 
        b.status = 'Ongoing'
        ${
          req.body.department === "All"
            ? ""
            : `and a.department = '${req.body.department}'`
        }
         ${
           req.body.claimType === "All"
             ? ""
             : `and b.claim_type = '${req.body.claimType}'`
         }
        ${
          req.body.status === "All"
            ? ""
            : `and b.claimStatus = '${req.body.status}'`
        }
         ${
           req.body.status === "All"
             ? ""
             : `and b.account = '${req.body.insurance}'`
         }
       
      `,
    });
    const result: any = await prisma.$queryRawUnsafe(qry);

    const data = result.map((itm: any) => {
      itm.date_report = format(new Date(itm.date_report), "MM/dd/yyyy");
      itm.date_received = format(new Date(itm.date_received), "MM/dd/yyyy");
      itm.date_approved =
        itm.date_approved !== ""
          ? format(new Date(itm.date_approved), "MM/dd/yyyy")
          : "";
      return itm;
    });
    const headers = [
      {
        label: "Name of Client",
        key: "Name",
        style: { width: 150, textAlign: "left" },
      },
      {
        label: "Unit Insured",
        key: "unit_insured",
        style: { width: 150, textAlign: "left" },
      },
      {
        label: "Policy No#",
        key: "policyNo",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Engine No#",
        key: "MotorNo",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Plate No#",
        key: "PlateNo",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Chassis No#",
        key: "ChassisNo",
        style: { width: 120, textAlign: "left" },
      },
      {
        label: "Date Received",
        key: "date_received",
        style: { width: 65, textAlign: "left" },
      },
      {
        label: "Date of Claim",
        key: "date_report",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Type of Claim",
        key: "claim_type",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Amount of Claim",
        key: "amount_claim",
        style: { width: 80, textAlign: "right" },
      },
      {
        label: "Participation",
        key: "participation",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "NET Amount",
        key: "net_amount",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Name of TPPD",
        key: "name_ttpd",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Status of Claim",
        key: "status",
        style: { width: 80, textAlign: "left" },
      },
    ];

    const outputFilePath = path.join(__dirname, "manok.pdf");

    const PAGE_WIDTH = 1240; // A4 Portrait width
    const PAGE_HEIGHT = 595; // A4 Portrait height
    const MARGINS = {
      top: 100,
      bottom: 50,
      left: 20,
      right: 20,
    };
    const rowFontSize = 9;
    const doc = new PDFDocument({
      margin: 0,
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      bufferPages: true,
    });
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);

    function getRowHeight(itm: any, headers: any) {
      const rowHeight = Math.max(
        ...headers.map((hItm: any) => {
          return doc.heightOfString(itm[hItm.key] || "-", {
            width: hItm.style.width - 5,
            align: hItm.style.textAlign,
          });
        }),
        rowFontSize + 1
      );

      return rowHeight + 5;
    }
    function addPageHeader(header: Array<any>, y: number, _x: any = 0) {
      doc.font("Helvetica-Bold");
      doc.fontSize(11);
      const rowHeight = Math.max(
        ...header.map((itm) =>
          doc.heightOfString(itm.label, { width: itm.style.width })
        ),
        10
      );
      let x = MARGINS.left + _x;
      header.forEach((itm) => {
        if (itm.key === "ID_No") {
          doc.text(itm.label, x, y, {
            width: header[2].style.width - 5 + (header[3].style.width - 5),
            align: "center",
          });
        } else {
          doc.text(itm.label, x, y, {
            width: itm.style.width - 5,
            align:
              itm.style.textAlign === "right" ? "center" : itm.style.textAlign,
          });
        }
        x += itm.style.width + 5;
      });
      return y + rowHeight + 5;
    }
    function drawTitle() {
      doc.font("Helvetica-Bold");
      doc.fontSize(12);
      doc.text(req.body.title, 20, 30);
    }

    drawTitle();
    let currentPage = 1;
    let yAxis = MARGINS.top;
    yAxis = addPageHeader(headers, yAxis);

    data.forEach((itm: any, idx: number) => {
      let rowHeight = getRowHeight(itm, headers);

      if (yAxis + rowHeight > PAGE_HEIGHT - MARGINS.bottom) {
        currentPage = currentPage + 1;
        doc.addPage({
          size: [PAGE_WIDTH, PAGE_HEIGHT],
          margin: 0,
          bufferPages: true,
        });
        drawTitle();
        yAxis = addPageHeader(headers, MARGINS.top);
      }

      let x = MARGINS.left;
      headers.forEach((hItm: any) => {
        const value = itm[hItm.key] || "-";
        doc.font("Helvetica");
        doc.fontSize(10);
        doc.text(value, x, yAxis, {
          width: hItm.style.width - 5,
          align: value === "-" ? "center" : hItm.style.textAlign,
        });
        x += hItm.style.width + 5;
      });

      yAxis += rowHeight;
    });

    yAxis += 5;

    const range = doc.bufferedPageRange();
    let i;
    let end;

    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.text(
        `Page ${i + 1} of ${range.count}`,
        PAGE_WIDTH - 80,
        PAGE_HEIGHT - 30
      );
      doc.text(
        `Printed ${format(new Date(), "MM/dd/yyyy hh:mm a")}`,
        20,
        PAGE_HEIGHT - 30
      );
    }

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
});
Report.post("/report/ongoing-excel", async (req, res) => {
  try {
    const qry = reportQry({
      select: `
        c.Name,
        c.unit_insured,
        a.policyNo,
        c.ChassisNo,
        c.MotorNo,
        c.PlateNo,
        b.date_received,
        b.date_report,
        b.claim_type,
        format(b.amount_claim,2) as amount_claim,
        b.amount_approved,
        b.participation,
        b.net_amount,
        b.name_ttpd,
        b.claimStatus,
        b.date_approved,
        if(b.status = 'Approved','Settled',b.status) as status
      `,
      where: `
      where 
        b.status = 'Ongoing'
        ${
          req.body.department === "All"
            ? ""
            : `and a.department = '${req.body.department}'`
        }
         ${
           req.body.claimType === "All"
             ? ""
             : `and b.claim_type = '${req.body.claimType}'`
         }
        ${
          req.body.status === "All"
            ? ""
            : `and b.claimStatus = '${req.body.status}'`
        }
         ${
           req.body.status === "All"
             ? ""
             : `and b.account = '${req.body.insurance}'`
         }
       
      `,
    });
    const result: any = await prisma.$queryRawUnsafe(qry);

    const data = result.map((itm: any) => {
      itm.date_report = format(new Date(itm.date_report), "MM/dd/yyyy");
      itm.date_received = format(new Date(itm.date_received), "MM/dd/yyyy");
      itm.date_approved =
        itm.date_approved !== ""
          ? format(new Date(itm.date_approved), "MM/dd/yyyy")
          : "";
      return itm;
    });

    const title = req.body.title;
    drawExcel(res, {
      columns: [
        { key: "Name", width: 70 },
        { key: "unit_insured", width: 70 },
        { key: "policyNo", width: 25 },
        { key: "MotorNo", width: 25 },
        { key: "PlateNo", width: 25 },
        { key: "ChassisNo", width: 30 },
        { key: "date_received", width: 22 },
        { key: "date_report", width: 22 },
        { key: "claim_type", width: 22 },
        { key: "amount_claim", width: 22 },
        { key: "date_approved", width: 22 },
        { key: "status", width: 22 },
      ],
      data: data,
      beforeDraw: (props: any, worksheet: any) => {
        title.split("\n").forEach((t: string, idx: number) => {
          const tt = worksheet.addRow([t]);
          props.mergeCells(
            idx + 1,
            props.alphabet[0],
            props.alphabet[props.columns.length - 1]
          );
          const alignColumns = props.alphabet.slice(0, props.columns.length);
          props.setAlignment(1, alignColumns, {
            horizontal: "left",
            vertical: "middle",
          });
          tt.font = { bolder: true };
        });
        props.setFontSize([1, 2, 3], 12);

        worksheet.addRow([]);
        worksheet.addRow([]);
        // Now, insert the column header row after the custom rows (row 3)
        const headerRow = worksheet.addRow([
          "Name of Client",
          "Unit Insured",
          "Policy No#",
          "Engine No#",
          "Plate No#",
          "Chassis No#",
          "Date Received",
          "Date of Claim",
          "Type of Claim",
          "Amount of Claim",
          "Date Settled",
          "Status of Claim",
        ]);
        headerRow.font = { bold: true };
        props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
          bottom: { style: "thin" },
        });
      },
      onDraw: (props: any, rowItm: any, rowIdx: number) => {
        props.setAlignment(rowIdx + 7, ["J"], {
          horizontal: "right",
          vertical: "middle",
        });
      },
      afterDraw: (props: any, worksheet: any) => {},
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
});

// Denied
Report.post("/report/denied-pdf", async (req, res) => {
  try {
    const qry = reportQry({
      select: `
        c.Name,
        c.unit_insured,
        a.policyNo,
        c.ChassisNo,
        c.MotorNo,
        c.PlateNo,
        b.date_received,
        b.date_report,
        b.claim_type,
        format(b.amount_claim,2) as amount_claim,
        b.amount_approved,
        b.participation,
        b.net_amount,
        b.name_ttpd,
        b.claimStatus,
        b.date_approved,
        if(b.status = 'Approved','Settled',b.status) as status
      `,
      where: `
      where 
        b.status = 'Denied'
        ${
          req.body.department === "All"
            ? ""
            : `and a.department = '${req.body.department}'`
        }
         ${
           req.body.claimType === "All"
             ? ""
             : `and b.claim_type = '${req.body.claimType}'`
         }
        ${
          req.body.status === "All"
            ? ""
            : `and b.claimStatus = '${req.body.status}'`
        }
         ${
           req.body.status === "All"
             ? ""
             : `and b.account = '${req.body.insurance}'`
         }
       
      `,
    });
    console.log(qry);
    const result: any = await prisma.$queryRawUnsafe(qry);

    const data = result.map((itm: any) => {
      itm.date_report = format(new Date(itm.date_report), "MM/dd/yyyy");
      itm.date_received = format(new Date(itm.date_received), "MM/dd/yyyy");
      itm.date_approved =
        itm.date_approved !== ""
          ? format(new Date(itm.date_approved), "MM/dd/yyyy")
          : "";
      return itm;
    });
    const headers = [
      {
        label: "Name of Client",
        key: "Name",
        style: { width: 150, textAlign: "left" },
      },
      {
        label: "Unit Insured",
        key: "unit_insured",
        style: { width: 150, textAlign: "left" },
      },
      {
        label: "Policy No#",
        key: "policyNo",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Engine No#",
        key: "MotorNo",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Chassis No#",
        key: "ChassisNo",
        style: { width: 120, textAlign: "left" },
      },
      {
        label: "Date Received",
        key: "date_received",
        style: { width: 65, textAlign: "left" },
      },
      {
        label: "Date of Claim",
        key: "date_report",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Type of Claim",
        key: "claim_type",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Amount of Claim",
        key: "amount_claim",
        style: { width: 80, textAlign: "right" },
      },
      {
        label: "Name of TPPD",
        key: "name_ttpd,",
        style: { width: 250, textAlign: "left" },
      },
      {
        label: "Status of Claim",
        key: "status",
        style: { width: 80, textAlign: "left" },
      },
    ];

    const outputFilePath = path.join(__dirname, "manok.pdf");

    const PAGE_WIDTH = 1240; // A4 Portrait width
    const PAGE_HEIGHT = 595; // A4 Portrait height
    const MARGINS = {
      top: 100,
      bottom: 50,
      left: 20,
      right: 20,
    };
    const rowFontSize = 9;
    const doc = new PDFDocument({
      margin: 0,
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      bufferPages: true,
    });
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);

    function getRowHeight(itm: any, headers: any) {
      const rowHeight = Math.max(
        ...headers.map((hItm: any) => {
          return doc.heightOfString(itm[hItm.key] || "-", {
            width: hItm.style.width - 5,
            align: hItm.style.textAlign,
          });
        }),
        rowFontSize + 1
      );

      return rowHeight + 5;
    }
    function addPageHeader(header: Array<any>, y: number, _x: any = 0) {
      doc.font("Helvetica-Bold");
      doc.fontSize(11);
      const rowHeight = Math.max(
        ...header.map((itm) =>
          doc.heightOfString(itm.label, { width: itm.style.width })
        ),
        10
      );
      let x = MARGINS.left + _x;
      header.forEach((itm) => {
        if (itm.key === "ID_No") {
          doc.text(itm.label, x, y, {
            width: header[2].style.width - 5 + (header[3].style.width - 5),
            align: "center",
          });
        } else {
          doc.text(itm.label, x, y, {
            width: itm.style.width - 5,
            align:
              itm.style.textAlign === "right" ? "center" : itm.style.textAlign,
          });
        }
        x += itm.style.width + 5;
      });
      return y + rowHeight + 5;
    }
    function drawTitle() {
      doc.font("Helvetica-Bold");
      doc.fontSize(12);
      doc.text(req.body.title, 20, 30);
    }

    drawTitle();
    let currentPage = 1;
    let yAxis = MARGINS.top;
    yAxis = addPageHeader(headers, yAxis);

    data.forEach((itm: any, idx: number) => {
      let rowHeight = getRowHeight(itm, headers);

      if (yAxis + rowHeight > PAGE_HEIGHT - MARGINS.bottom) {
        currentPage = currentPage + 1;
        doc.addPage({
          size: [PAGE_WIDTH, PAGE_HEIGHT],
          margin: 0,
          bufferPages: true,
        });
        drawTitle();
        yAxis = addPageHeader(headers, MARGINS.top);
      }

      let x = MARGINS.left;
      headers.forEach((hItm: any) => {
        const value = itm[hItm.key] || "-";
        doc.font("Helvetica");
        doc.fontSize(10);
        doc.text(value, x, yAxis, {
          width: hItm.style.width - 5,
          align: value === "-" ? "center" : hItm.style.textAlign,
        });
        x += hItm.style.width + 5;
      });

      yAxis += rowHeight;
    });

    yAxis += 5;

    const range = doc.bufferedPageRange();
    let i;
    let end;

    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.text(
        `Page ${i + 1} of ${range.count}`,
        PAGE_WIDTH - 80,
        PAGE_HEIGHT - 30
      );
      doc.text(
        `Printed ${format(new Date(), "MM/dd/yyyy hh:mm a")}`,
        20,
        PAGE_HEIGHT - 30
      );
    }

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
});
Report.post("/report/denied-excel", async (req, res) => {
  try {
    const qry = reportQry({
      select: `
        c.Name,
        c.unit_insured,
        a.policyNo,
        c.ChassisNo,
        c.MotorNo,
        c.PlateNo,
        b.date_received,
        b.date_report,
        b.claim_type,
        format(b.amount_claim,2) as amount_claim,
        b.amount_approved,
        b.participation,
        b.net_amount,
        b.name_ttpd,
        b.claimStatus,
        b.date_approved,
        if(b.status = 'Approved','Settled',b.status) as status
      `,
      where: `
      where 
        b.status = 'Denied'
        ${
          req.body.department === "All"
            ? ""
            : `and a.department = '${req.body.department}'`
        }
         ${
           req.body.claimType === "All"
             ? ""
             : `and b.claim_type = '${req.body.claimType}'`
         }
        ${
          req.body.status === "All"
            ? ""
            : `and b.claimStatus = '${req.body.status}'`
        }
         ${
           req.body.status === "All"
             ? ""
             : `and b.account = '${req.body.insurance}'`
         }
       
      `,
    });
    console.log(qry);
    const result: any = await prisma.$queryRawUnsafe(qry);

    const data = result.map((itm: any) => {
      itm.date_report = format(new Date(itm.date_report), "MM/dd/yyyy");
      itm.date_received = format(new Date(itm.date_received), "MM/dd/yyyy");
      itm.date_approved =
        itm.date_approved !== ""
          ? format(new Date(itm.date_approved), "MM/dd/yyyy")
          : "";
      return itm;
    });

    const title = req.body.title;
    drawExcel(res, {
      columns: [
        { key: "Name", width: 70 },
        { key: "unit_insured", width: 70 },
        { key: "policyNo", width: 25 },
        { key: "MotorNo", width: 25 },
        { key: "PlateNo", width: 25 },
        { key: "ChassisNo", width: 30 },
        { key: "date_received", width: 22 },
        { key: "date_report", width: 22 },
        { key: "claim_type", width: 22 },
        { key: "amount_claim", width: 22 },
        { key: "name_ttpd", width: 22 },
        { key: "status", width: 22 },
      ],
      data: data,
      beforeDraw: (props: any, worksheet: any) => {
        title.split("\n").forEach((t: string, idx: number) => {
          const tt = worksheet.addRow([t]);
          props.mergeCells(
            idx + 1,
            props.alphabet[0],
            props.alphabet[props.columns.length - 1]
          );
          const alignColumns = props.alphabet.slice(0, props.columns.length);
          props.setAlignment(1, alignColumns, {
            horizontal: "left",
            vertical: "middle",
          });
          tt.font = { bolder: true };
        });
        props.setFontSize([1, 2, 3], 12);

        worksheet.addRow([]);
        worksheet.addRow([]);
        // Now, insert the column header row after the custom rows (row 3)
        const headerRow = worksheet.addRow([
          "Name of Client",
          "Unit Insured",
          "Policy No#",
          "Engine No#",
          "Plate No#",
          "Chassis No#",
          "Date Received",
          "Date of Claim",
          "Type of Claim",
          "Amount of Claim",
          "Name of TPPD",
          "Status of Claim",
        ]);
        headerRow.font = { bold: true };
        props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
          bottom: { style: "thin" },
        });
      },
      onDraw: (props: any, rowItm: any, rowIdx: number) => {
        props.setAlignment(rowIdx + 7, ["J"], {
          horizontal: "right",
          vertical: "middle",
        });
      },
      afterDraw: (props: any, worksheet: any) => {},
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
});

// Cancel
Report.post("/report/cancel-pdf", async (req, res) => {
  try {
    const qry = reportQry({
      select: `
        c.Name,
        c.unit_insured,
        a.policyNo,
        c.ChassisNo,
        c.MotorNo,
        c.PlateNo,
        b.date_received,
        b.date_report,
        b.claim_type,
        format(b.amount_claim,2) as amount_claim,
        b.amount_approved,
        b.participation,
        b.net_amount,
        b.name_ttpd,
        b.claimStatus,
        b.date_approved,
        if(b.status = 'Approved','Settled',b.status) as status
      `,
      where: `
      where 
        b.status = 'Cancel'
        ${
          req.body.department === "All"
            ? ""
            : `and a.department = '${req.body.department}'`
        }
         ${
           req.body.claimType === "All"
             ? ""
             : `and b.claim_type = '${req.body.claimType}'`
         }
        ${
          req.body.status === "All"
            ? ""
            : `and b.claimStatus = '${req.body.status}'`
        }
         ${
           req.body.status === "All"
             ? ""
             : `and b.account = '${req.body.insurance}'`
         }
       
      `,
    });

    const result: any = await prisma.$queryRawUnsafe(qry);

    const data = result.map((itm: any) => {
      itm.date_report = format(new Date(itm.date_report), "MM/dd/yyyy");
      itm.date_received = format(new Date(itm.date_received), "MM/dd/yyyy");
      itm.date_approved =
        itm.date_approved !== ""
          ? format(new Date(itm.date_approved), "MM/dd/yyyy")
          : "";
      return itm;
    });
    const headers = [
      {
        label: "Name of Client",
        key: "Name",
        style: { width: 150, textAlign: "left" },
      },
      {
        label: "Unit Insured",
        key: "unit_insured",
        style: { width: 150, textAlign: "left" },
      },
      {
        label: "Policy No#",
        key: "policyNo",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Chassis No#",
        key: "ChassisNo",
        style: { width: 120, textAlign: "left" },
      },
      {
        label: "Plate No#",
        key: "PlateNo",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Date Received",
        key: "date_received",
        style: { width: 65, textAlign: "left" },
      },
      {
        label: "Date of Claim",
        key: "date_report",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Type of Claim",
        key: "claim_type",
        style: { width: 80, textAlign: "left" },
      },
      {
        label: "Amount of Claim",
        key: "amount_claim",
        style: { width: 80, textAlign: "right" },
      },
      {
        label: "Amount Approved",
        key: "amount_approved",
        style: { width: 80, textAlign: "right" },
      },
      {
        label: "Name of TTPD",
        key: "name_ttpd",
        style: { width: 100, textAlign: "left" },
      },
      {
        label: "Status of Claim",
        key: "status",
        style: { width: 80, textAlign: "left" },
      },
    ];

    const outputFilePath = path.join(__dirname, "manok.pdf");

    const PAGE_WIDTH = 1240; // A4 Portrait width
    const PAGE_HEIGHT = 595; // A4 Portrait height
    const MARGINS = {
      top: 100,
      bottom: 50,
      left: 20,
      right: 20,
    };
    const rowFontSize = 9;
    const doc = new PDFDocument({
      margin: 0,
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      bufferPages: true,
    });
    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);

    function getRowHeight(itm: any, headers: any) {
      const rowHeight = Math.max(
        ...headers.map((hItm: any) => {
          return doc.heightOfString(itm[hItm.key] || "-", {
            width: hItm.style.width - 5,
            align: hItm.style.textAlign,
          });
        }),
        rowFontSize + 1
      );

      return rowHeight + 5;
    }
    function addPageHeader(header: Array<any>, y: number, _x: any = 0) {
      doc.font("Helvetica-Bold");
      doc.fontSize(11);
      const rowHeight = Math.max(
        ...header.map((itm) =>
          doc.heightOfString(itm.label, { width: itm.style.width })
        ),
        10
      );
      let x = MARGINS.left + _x;
      header.forEach((itm) => {
        if (itm.key === "ID_No") {
          doc.text(itm.label, x, y, {
            width: header[2].style.width - 5 + (header[3].style.width - 5),
            align: "center",
          });
        } else {
          doc.text(itm.label, x, y, {
            width: itm.style.width - 5,
            align:
              itm.style.textAlign === "right" ? "center" : itm.style.textAlign,
          });
        }
        x += itm.style.width + 5;
      });
      return y + rowHeight + 5;
    }
    function drawTitle() {
      doc.font("Helvetica-Bold");
      doc.fontSize(12);
      doc.text(req.body.title, 20, 30);
    }

    drawTitle();
    let currentPage = 1;
    let yAxis = MARGINS.top;
    yAxis = addPageHeader(headers, yAxis);

    data.forEach((itm: any, idx: number) => {
      let rowHeight = getRowHeight(itm, headers);

      if (yAxis + rowHeight > PAGE_HEIGHT - MARGINS.bottom) {
        currentPage = currentPage + 1;
        doc.addPage({
          size: [PAGE_WIDTH, PAGE_HEIGHT],
          margin: 0,
          bufferPages: true,
        });
        drawTitle();
        yAxis = addPageHeader(headers, MARGINS.top);
      }

      let x = MARGINS.left;
      headers.forEach((hItm: any) => {
        const value = itm[hItm.key] || "-";
        doc.font("Helvetica");
        doc.fontSize(10);
        doc.text(value, x, yAxis, {
          width: hItm.style.width - 5,
          align: value === "-" ? "center" : hItm.style.textAlign,
        });
        x += hItm.style.width + 5;
      });

      yAxis += rowHeight;
    });

    yAxis += 5;

    const range = doc.bufferedPageRange();
    let i;
    let end;

    for (
      i = range.start, end = range.start + range.count, range.start <= end;
      i < end;
      i++
    ) {
      doc.switchToPage(i);
      doc.text(
        `Page ${i + 1} of ${range.count}`,
        PAGE_WIDTH - 80,
        PAGE_HEIGHT - 30
      );
      doc.text(
        `Printed ${format(new Date(), "MM/dd/yyyy hh:mm a")}`,
        20,
        PAGE_HEIGHT - 30
      );
    }

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
});
Report.post("/report/cancel-excel", async (req, res) => {
  try {
    const qry = reportQry({
      select: `
        c.Name,
        c.unit_insured,
        a.policyNo,
        c.ChassisNo,
        c.MotorNo,
        c.PlateNo,
        b.date_received,
        b.date_report,
        b.claim_type,
        format(b.amount_claim,2) as amount_claim,
        b.amount_approved,
        b.participation,
        b.net_amount,
        b.name_ttpd,
        b.claimStatus,
        b.date_approved,
        if(b.status = 'Approved','Settled',b.status) as status
      `,
      where: `
      where 
        b.status = 'Cancel'
        ${
          req.body.department === "All"
            ? ""
            : `and a.department = '${req.body.department}'`
        }
         ${
           req.body.claimType === "All"
             ? ""
             : `and b.claim_type = '${req.body.claimType}'`
         }
        ${
          req.body.status === "All"
            ? ""
            : `and b.claimStatus = '${req.body.status}'`
        }
         ${
           req.body.status === "All"
             ? ""
             : `and b.account = '${req.body.insurance}'`
         }
       
      `,
    });
    console.log(qry);
    const result: any = await prisma.$queryRawUnsafe(qry);

    const data = result.map((itm: any) => {
      itm.date_report = format(new Date(itm.date_report), "MM/dd/yyyy");
      itm.date_received = format(new Date(itm.date_received), "MM/dd/yyyy");
      itm.date_approved =
        itm.date_approved !== ""
          ? format(new Date(itm.date_approved), "MM/dd/yyyy")
          : "";
      return itm;
    });

    const title = req.body.title;
    drawExcel(res, {
      columns: [
        { key: "Name", width: 70 },
        { key: "unit_insured", width: 70 },
        { key: "policyNo", width: 25 },
        { key: "ChassisNo", width: 30 },
        { key: "PlateNo", width: 25 },
        { key: "date_received", width: 22 },
        { key: "date_report", width: 22 },
        { key: "claim_type", width: 22 },
        { key: "amount_claim", width: 22 },
        { key: "amount_approved", width: 22 },
        { key: "name_ttpd", width: 22 },
        { key: "status", width: 22 },
      ],
      data: data,
      beforeDraw: (props: any, worksheet: any) => {
        title.split("\n").forEach((t: string, idx: number) => {
          const tt = worksheet.addRow([t]);
          props.mergeCells(
            idx + 1,
            props.alphabet[0],
            props.alphabet[props.columns.length - 1]
          );
          const alignColumns = props.alphabet.slice(0, props.columns.length);
          props.setAlignment(1, alignColumns, {
            horizontal: "left",
            vertical: "middle",
          });
          tt.font = { bolder: true };
        });
        props.setFontSize([1, 2, 3], 12);

        worksheet.addRow([]);
        worksheet.addRow([]);
        // Now, insert the column header row after the custom rows (row 3)
        const headerRow = worksheet.addRow([
          "Name of Client",
          "Unit Insured",
          "Policy No#",
          "Chassis No#",
          "Plate No#",
          "Date Received",
          "Date of Claim",
          "Type of Claim",
          "Amount of Claim",
          "Amount Approved",
          "Name of TPPD",
          "Status of Claim",
        ]);
        headerRow.font = { bold: true };
        props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
          bottom: { style: "thin" },
        });
      },
      onDraw: (props: any, rowItm: any, rowIdx: number) => {
        props.setAlignment(rowIdx + 7, ["J"], {
          horizontal: "right",
          vertical: "middle",
        });
      },
      afterDraw: (props: any, worksheet: any) => {},
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
});
export default Report;
