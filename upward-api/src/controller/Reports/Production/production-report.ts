import express from "express";
import { format } from "date-fns";
import {
  parseDate,
  ProductionReport,
} from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";
import PDFReportGenerator from "../../../lib/pdf-generator";

import { drawExcel } from "../../../lib/excel-generator";
import { arch } from "os";

const ProductionReports = express.Router();

const { CustomPrismaClient } = PrismaList();

ProductionReports.post("/production-report", async (req, res) => {
  try {
    const isucsmi = process.env.DEPARTMENT === "UCSMI";

    const title = req.body.title;
    const formatValue = req.body.format;

    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    let dateFrom = format(parseDate(req.body.FDate), "yyyy-MM-dd");
    let dateTo = format(parseDate(req.body.TDate), "yyyy-MM-dd");
    const reportString = ProductionReport(
      dateFrom,
      dateTo,
      req.body.cmbOrder,
      req.body.cmbSubAcct,
      parseInt(req.body.cmbType),
      "",
      req.body.cmbpolicy,
      req.body.cmbSort
    );
    const data: Array<any> = await prisma.$queryRawUnsafe(reportString);

    if (formatValue === 0) {
      if (req.body.cmbSubAcct === "TPL") {
        const newData = data.map((itm: any) => {
          itm.PLimit = formatNumber(
            parseFloat(itm.PLimit.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.Misc = formatNumber(
            parseFloat(itm.Misc.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: format(new Date(itm.DateIssued), "MM/dd/yyyy"),
            AssuredName: itm.AssuredName,
            PolicyNo: itm.PolicyNo,
            CoverNo: itm.CoverNo,
            EffictiveDate: format(new Date(itm.EffictiveDate), "MM/dd/yyyy"),
            PLimit: itm.PLimit,
            Premium: itm.TotalPremium,
            Subtotal: itm.TotalPremium,
            DocStamp: itm.DocStamp,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            Misc: itm.Misc,
            TotalDue: itm.TotalDue,
          };
        });
        newData.push({
          DateIssued: `No. of Records: ${data.length}`,
          AssuredName: "",
          PolicyNo: "",
          CoverNo: "",
          EffictiveDate: "",
          PLimit: "",
          Premium: "",
          Subtotal: formatNumber(getSum(newData, "Subtotal")),
          DocStamp: formatNumber(getSum(newData, "DocStamp")),
          Vat: formatNumber(getSum(newData, "Vat")),
          LGovTax: formatNumber(getSum(newData, "LGovTax")),
          Misc: formatNumber(getSum(newData, "Misc")),
          TotalDue: formatNumber(getSum(newData, "TotalDue")),
        });
        const props: any = {
          data: newData,
          columnWidths: [
            90, 280, 110, 90, 110, 100, 100, 100, 100, 100, 100, 100, 100,
          ],
          headers: [
            { headerName: "DATE ISSUED", textAlign: "left" },
            { headerName: "ASSURED NAME", textAlign: "left" },
            { headerName: "POLICY NO", textAlign: "left" },
            { headerName: "COC NO", textAlign: "left" },
            { headerName: "EFFECTIVE DATE", textAlign: "left" },
            { headerName: "TPL COVERAGE", textAlign: "left" },
            { headerName: "PREMIUM", textAlign: "right" },
            { headerName: "SUB - TOTAL", textAlign: "right" },
            { headerName: "DOC. STAMP", textAlign: "right" },
            { headerName: "EVAT ", textAlign: "right" },
            { headerName: "LGT", textAlign: "right" },
            { headerName: "STRADCOM", textAlign: "right" },
            { headerName: "TOTAL", textAlign: "right" },
          ],
          keys: [
            "DateIssued",
            "AssuredName",
            "PolicyNo",
            "CoverNo",
            "EffictiveDate",
            "PLimit",
            "Premium",
            "Subtotal",
            "DocStamp",
            "Vat",
            "LGovTax",
            "Misc",
            "TotalDue",
          ],
          title,
          PAGE_WIDTH: 22 * 72,
          PAGE_HEIGHT: 8.5 * 72,
          MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
          beforeDraw: (pdfReportGenerator: any) => {
            pdfReportGenerator.SpanRow(newData.length - 1, 0, 3);
            pdfReportGenerator.boldRow(newData.length - 1);

            pdfReportGenerator.borderColumnInRow(
              newData.length - 1,
              [
                { column: 7, key: "Subtotal" },
                { column: 8, key: "DocStamp" },
                { column: 9, key: "Vat" },
                { column: 10, key: "LGovTax" },
                { column: 11, key: "Misc" },
                { column: 12, key: "TotalDue" },
              ],
              {
                top: true,
                bottom: false,
                left: false,
                right: false,
              }
            );
          },
          beforePerPageDraw: (
            pdfReportGenerator: any,
            doc: PDFKit.PDFDocument
          ) => {
            doc.font("Helvetica");
            doc.text(
              "Prepared By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 - 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Checked By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Noted By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 + 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
          },
          drawPageNumber: (
            doc: PDFKit.PDFDocument,
            currentPage: number,
            totalPages: number,
            pdfReportGenerator: any
          ) => {
            console.log("pageNumberText");

            doc.font("Helvetica");
            const pageNumberText = `Page ${currentPage}`;
            doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
              align: "right",
              width: 100,
            });
          },
        };
        const pdfReportGenerator = new PDFReportGenerator(props);
        return pdfReportGenerator.generatePDF(res);
      } else if (req.body.cmbSubAcct === "COM") {
        const newData = data.map((itm: any) => {
          itm.InsuredValue = formatNumber(
            parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
          );
          itm.PLimit = formatNumber(
            parseFloat(itm.PLimit.toString().replace(/,/g, ""))
          );
          itm.Sec4A = formatNumber(
            parseFloat(itm.Sec4A.toString().replace(/,/g, ""))
          );
          itm.Sec4B = formatNumber(
            parseFloat(itm.Sec4B.toString().replace(/,/g, ""))
          );
          itm.Sec4C = formatNumber(
            parseFloat(itm.Sec4C.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: format(new Date(itm.DateIssued), "MM/dd/yyyy"),
            PolicyNo: itm.PolicyNo,
            AssuredName: itm.AssuredName,
            EffictiveDate: format(new Date(itm.EffictiveDate), "MM/dd/yyyy"),
            InsuredValue: itm.InsuredValue,
            PLimit: itm.PLimit,
            Sec4A: itm.Sec4A,
            Sec4B: itm.Sec4B,
            Sec4C: itm.Sec4C,
            TotalPremium: itm.TotalPremium,
            DocStamp: itm.DocStamp,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            TotalDue: itm.TotalDue,
            ChassisNo: itm.ChassisNo,
          };
        });
        newData.push({
          DateIssued: `No. of Records: ${data.length}`,
          PolicyNo: "",
          AssuredName: "",
          EffictiveDate: "",
          InsuredValue: "",
          PLimit: formatNumber(getSum(newData, "PLimit")),
          Sec4A: formatNumber(getSum(newData, "Sec4A")),
          Sec4B: formatNumber(getSum(newData, "Sec4B")),
          Sec4C: formatNumber(getSum(newData, "Sec4C")),
          TotalPremium: formatNumber(getSum(newData, "TotalPremium")),
          DocStamp: formatNumber(getSum(newData, "DocStamp")),
          Vat: formatNumber(getSum(newData, "Vat")),
          LGovTax: formatNumber(getSum(newData, "LGovTax")),
          TotalDue: formatNumber(getSum(newData, "TotalDue")),
          ChassisNo: "",
        });

        let headers: Array<any> = [];
        let keys: Array<any> = [];

        if (isucsmi) {
          (keys = [
            "DateIssued",
            "PolicyNo",
            "AssuredName",
            "ChassisNo",
            "InsuredValue",
            "PLimit",
            "Sec4A",
            "Sec4B",
            "Sec4C",
            "TotalPremium",
            "DocStamp",
            "Vat",
            "LGovTax",
            "TotalDue",
          ]),
            (headers = [
              { headerName: "DATE ISSUED", textAlign: "left" },
              { headerName: "POLICY NO", textAlign: "left" },
              { headerName: "ASSURED NAME", textAlign: "left" },
              { headerName: "CHASSIS NO", textAlign: "left" },
              { headerName: "SUM INSURED", textAlign: "right" },
              { headerName: "LD PREMIUM", textAlign: "right" },
              { headerName: "ETPL BI PREMIUM", textAlign: "right" },
              { headerName: "PD PREMIUM", textAlign: "right" },
              { headerName: "PAR PREMIUM", textAlign: "right" },
              { headerName: "SUB - TOTAL", textAlign: "right" },
              { headerName: "DOC. STAMP", textAlign: "right" },
              { headerName: "EVAT ", textAlign: "right" },
              { headerName: "LGT", textAlign: "right" },
              { headerName: "TOTAL", textAlign: "right" },
            ]);
        } else {
          (keys = [
            "DateIssued",
            "PolicyNo",
            "AssuredName",
            "EffictiveDate",
            "InsuredValue",
            "PLimit",
            "Sec4A",
            "Sec4B",
            "Sec4C",
            "TotalPremium",
            "DocStamp",
            "Vat",
            "LGovTax",
            "TotalDue",
          ]),
            (headers = [
              { headerName: "DATE ISSUED", textAlign: "left" },
              { headerName: "POLICY NO", textAlign: "left" },
              { headerName: "ASSURED NAME", textAlign: "left" },
              { headerName: "EFFECTIVE DATE", textAlign: "left" },
              { headerName: "SUM INSURED", textAlign: "right" },
              { headerName: "LD PREMIUM", textAlign: "right" },
              { headerName: "ETPL BI PREMIUM", textAlign: "right" },
              { headerName: "PD PREMIUM", textAlign: "right" },
              { headerName: "PAR PREMIUM", textAlign: "right" },
              { headerName: "SUB - TOTAL", textAlign: "right" },
              { headerName: "DOC. STAMP", textAlign: "right" },
              { headerName: "EVAT ", textAlign: "right" },
              { headerName: "LGT", textAlign: "right" },
              { headerName: "TOTAL", textAlign: "right" },
            ]);
        }

        const props: any = {
          data: newData,
          columnWidths: [
            90, 100, 200, 140, 110, 100, 100, 100, 100, 100, 100, 100, 100, 100,
          ],
          headers,
          keys,
          title,
          PAGE_WIDTH: 21.5 * 72,
          PAGE_HEIGHT: 8.5 * 72,
          MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
          beforeDraw: (pdfReportGenerator: any) => {
            pdfReportGenerator.SpanRow(newData.length - 1, 0, 3);
            pdfReportGenerator.boldRow(newData.length - 1);
            pdfReportGenerator.borderColumnInRow(
              newData.length - 1,
              [
                { column: 5, key: "PLimit" },
                { column: 6, key: "Sec4A" },
                { column: 7, key: "Sec4B" },
                { column: 8, key: "Sec4C" },
                { column: 9, key: "TotalPremium" },
                { column: 10, key: "Vat" },
                { column: 11, key: "DocStamp" },
                { column: 12, key: "LGovTax" },
                { column: 13, key: "TotalDue" },
              ],
              {
                top: true,
                bottom: false,
                left: false,
                right: false,
              }
            );
          },
          beforePerPageDraw: (
            pdfReportGenerator: any,
            doc: PDFKit.PDFDocument
          ) => {
            doc.font("Helvetica");
            doc.text(
              "Prepared By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 - 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Checked By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Noted By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 + 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
          },
          drawPageNumber: (
            doc: PDFKit.PDFDocument,
            currentPage: number,
            totalPages: number,
            pdfReportGenerator: any
          ) => {
            console.log("pageNumberText");

            doc.font("Helvetica");
            const pageNumberText = `Page ${currentPage}`;
            doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
              align: "right",
              width: 100,
            });
          },
        };
        const pdfReportGenerator = new PDFReportGenerator(props);
        return pdfReportGenerator.generatePDF(res);
      } else if (
        req.body.cmbSubAcct === "MAR" ||
        req.body.cmbSubAcct === "MSPR" ||
        req.body.cmbSubAcct === "CGL"
      ) {
        const newData = data.map((itm: any) => {
          itm.InsuredValue = formatNumber(
            parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: format(new Date(itm.DateIssued), "MM/dd/yyyy"),
            PolicyNo: itm.PolicyNo,
            AssuredName: itm.AssuredName,
            EffictiveDate: format(new Date(itm.EffictiveDate), "MM/dd/yyyy"),
            InsuredValue: itm.InsuredValue,
            TotalPremium: itm.TotalPremium,
            DocStamp: itm.DocStamp,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            TotalDue: itm.TotalDue,
          };
        });
        newData.push({
          DateIssued: `No. of Records: ${data.length}`,
          PolicyNo: "",
          AssuredName: "",
          EffictiveDate: "",
          InsuredValue: "",
          TotalPremium: formatNumber(getSum(newData, "TotalPremium")),
          DocStamp: formatNumber(getSum(newData, "DocStamp")),
          Vat: formatNumber(getSum(newData, "Vat")),
          LGovTax: formatNumber(getSum(newData, "LGovTax")),
          TotalDue: formatNumber(getSum(newData, "TotalDue")),
        });

        const props: any = {
          data: newData,
          columnWidths: [90, 100, 250, 90, 100, 100, 100, 100, 100, 100],
          headers: [
            { headerName: "DATE ISSUED", textAlign: "left" },
            { headerName: "POLICY NO", textAlign: "left" },
            { headerName: "ASSURED NAME", textAlign: "left" },
            { headerName: "EFFECTIVE DATE", textAlign: "left" },
            { headerName: "SUM INSURED", textAlign: "right" },
            { headerName: "PREMIUM", textAlign: "right" },
            { headerName: "DOC. STAMP", textAlign: "right" },
            { headerName: "EVAT ", textAlign: "right" },
            { headerName: "LGT", textAlign: "right" },
            { headerName: "TOTAL", textAlign: "right" },
          ],
          keys: [
            "DateIssued",
            "PolicyNo",
            "AssuredName",
            "EffictiveDate",
            "InsuredValue",
            "TotalPremium",
            "DocStamp",
            "Vat",
            "LGovTax",
            "TotalDue",
          ],
          title,
          PAGE_WIDTH: 16 * 72,
          PAGE_HEIGHT: 8.5 * 72,
          MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
          beforeDraw: (pdfReportGenerator: any) => {
            pdfReportGenerator.SpanRow(newData.length - 1, 0, 3);
            pdfReportGenerator.boldRow(newData.length - 1);
            pdfReportGenerator.borderColumnInRow(
              newData.length - 1,
              [
                { column: 5, key: "TotalPremium" },
                { column: 6, key: "Vat" },
                { column: 7, key: "DocStamp" },
                { column: 8, key: "LGovTax" },
                { column: 9, key: "TotalDue" },
              ],
              {
                top: true,
                bottom: false,
                left: false,
                right: false,
              }
            );
          },
          beforePerPageDraw: (
            pdfReportGenerator: any,
            doc: PDFKit.PDFDocument
          ) => {
            doc.font("Helvetica");
            doc.text(
              "Prepared By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 - 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Checked By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Noted By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 + 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
          },
          drawPageNumber: (
            doc: PDFKit.PDFDocument,
            currentPage: number,
            totalPages: number,
            pdfReportGenerator: any
          ) => {
            console.log("pageNumberText");

            doc.font("Helvetica");
            const pageNumberText = `Page ${currentPage}`;
            doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
              align: "right",
              width: 100,
            });
          },
        };
        const pdfReportGenerator = new PDFReportGenerator(props);
        return pdfReportGenerator.generatePDF(res);
      } else if (req.body.cmbSubAcct === "PA") {
        const qry = `
        SELECT 
            date_format(a.dateissued,'%m/%d/%Y') as DateIssued,
            endorsement_no as  PolicyNo,
            name as AssuredName, 
            date_format(a.datefrom,'%m/%d/%Y') as EffictiveDate,
            format(suminsured,2) as InsuredValue,
            format(totalpremium,2) as TotalPremium,
            format(docstamp,2) as DocStamp,
            format(vat,2) as Vat,
            format(lgovtax,2) as LGovTax,
            format(totaldue,2)  as TotalDue,
            policyNo
        FROM
            gpa_endorsement a
        WHERE
            a.dateissued <= '${dateTo}'
                AND a.dateissued >= '${dateFrom}'
                order by  a.endorsement_no`;

        const dataEd: Array<any> = await prisma.$queryRawUnsafe(qry);

        const newData = data.map((itm: any) => {
          itm.InsuredValue = formatNumber(
            parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: format(new Date(itm.DateIssued), "MM/dd/yyyy"),
            PolicyNo: itm.PolicyNo,
            AssuredName: itm.AssuredName,
            EffictiveDate: format(new Date(itm.EffictiveDate), "MM/dd/yyyy"),
            InsuredValue: itm.InsuredValue,
            TotalPremium: itm.TotalPremium,
            DocStamp: itm.DocStamp,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            TotalDue: itm.TotalDue,
          };
        });

        const combined:Array<any> = [];
        newData.forEach((policy) => {
          combined.push(policy); // Add policy first
          const relatedEndorsements = dataEd.filter(
            (e) => e.policyNo === policy.PolicyNo
          );
          combined.push(...relatedEndorsements); // Then push its endorsements
        });

        combined.push({
          DateIssued: `No. of Records: ${data.length}`,
          PolicyNo: "",
          AssuredName: "",
          EffictiveDate: "",
          InsuredValue: "",
          TotalPremium: formatNumber(getSum(combined, "TotalPremium")),
          DocStamp: formatNumber(getSum(combined, "DocStamp")),
          Vat: formatNumber(getSum(combined, "Vat")),
          LGovTax: formatNumber(getSum(combined, "LGovTax")),
          TotalDue: formatNumber(getSum(combined, "TotalDue")),
        });

        const props: any = {
          data: combined,
          columnWidths: [90, 100, 250, 90, 100, 100, 100, 100, 100, 100],
          headers: [
            { headerName: "DATE ISSUED", textAlign: "left" },
            { headerName: "POLICY NO", textAlign: "left" },
            { headerName: "ASSURED NAME", textAlign: "left" },
            { headerName: "EFFECTIVE DATE", textAlign: "left" },
            { headerName: "SUM INSURED", textAlign: "right" },
            { headerName: "PREMIUM", textAlign: "right" },
            { headerName: "DOC. STAMP", textAlign: "right" },
            { headerName: "EVAT ", textAlign: "right" },
            { headerName: "LGT", textAlign: "right" },
            { headerName: "TOTAL", textAlign: "right" },
          ],
          keys: [
            "DateIssued",
            "PolicyNo",
            "AssuredName",
            "EffictiveDate",
            "InsuredValue",
            "TotalPremium",
            "DocStamp",
            "Vat",
            "LGovTax",
            "TotalDue",
          ],
          title,
          PAGE_WIDTH: 16 * 72,
          PAGE_HEIGHT: 8.5 * 72,
          MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
          beforeDraw: (pdfReportGenerator: any) => {
            pdfReportGenerator.SpanRow(combined.length - 1, 0, 3);
            pdfReportGenerator.boldRow(combined.length - 1);
            pdfReportGenerator.borderColumnInRow(
              combined.length - 1,
              [
                { column: 5, key: "TotalPremium" },
                { column: 6, key: "Vat" },
                { column: 7, key: "DocStamp" },
                { column: 8, key: "LGovTax" },
                { column: 9, key: "TotalDue" },
              ],
              {
                top: true,
                bottom: false,
                left: false,
                right: false,
              }
            );
          },
          beforePerPageDraw: (
            pdfReportGenerator: any,
            doc: PDFKit.PDFDocument
          ) => {
            doc.font("Helvetica");
            doc.text(
              "Prepared By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 - 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Checked By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Noted By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 + 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
          },
          drawPageNumber: (
            doc: PDFKit.PDFDocument,
            currentPage: number,
            totalPages: number,
            pdfReportGenerator: any
          ) => {
            console.log("pageNumberText");

            doc.font("Helvetica");
            const pageNumberText = `Page ${currentPage}`;
            doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
              align: "right",
              width: 100,
            });
          },
        };
        const pdfReportGenerator = new PDFReportGenerator(props);
        return pdfReportGenerator.generatePDF(res);
      } else if (req.body.cmbSubAcct === "FIRE") {
        const newData = data.map((itm: any) => {
          itm.InsuredValue = formatNumber(
            parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.FireTax = formatNumber(
            parseFloat(itm.FireTax.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: format(new Date(itm.DateIssued), "MM/dd/yyyy"),
            PolicyNo: itm.PolicyNo,
            AssuredName: itm.AssuredName,
            EffictiveDate: format(new Date(itm.EffictiveDate), "MM/dd/yyyy"),
            InsuredValue: itm.InsuredValue,
            TotalPremium: itm.TotalPremium,
            DocStamp: itm.DocStamp,
            FireTax: itm.FireTax,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            TotalDue: itm.TotalDue,
          };
        });
        newData.push({
          DateIssued: `No. of Records: ${data.length}`,
          PolicyNo: "",
          AssuredName: "",
          EffictiveDate: "",
          InsuredValue: "",
          TotalPremium: formatNumber(getSum(newData, "TotalPremium")),
          DocStamp: formatNumber(getSum(newData, "DocStamp")),
          FireTax: formatNumber(getSum(newData, "FireTax")),
          Vat: formatNumber(getSum(newData, "Vat")),
          LGovTax: formatNumber(getSum(newData, "LGovTax")),
          TotalDue: formatNumber(getSum(newData, "TotalDue")),
        });

        const props: any = {
          data: newData,
          columnWidths: [90, 100, 250, 90, 100, 100, 100, 100, 100, 100, 100],
          headers: [
            { headerName: "DATE ISSUED", textAlign: "left" },
            { headerName: "POLICY NO", textAlign: "left" },
            { headerName: "ASSURED NAME", textAlign: "left" },
            { headerName: "EFFECTIVE DATE", textAlign: "left" },
            { headerName: "SUM INSURED", textAlign: "right" },
            { headerName: "PREMIUM", textAlign: "right" },
            { headerName: "DOC. STAMP", textAlign: "right" },
            { headerName: "F.S. TAX", textAlign: "right" },
            { headerName: "EVAT ", textAlign: "right" },
            { headerName: "LGT", textAlign: "right" },
            { headerName: "TOTAL", textAlign: "right" },
          ],
          keys: [
            "DateIssued",
            "PolicyNo",
            "AssuredName",
            "EffictiveDate",
            "InsuredValue",
            "TotalPremium",
            "DocStamp",
            "FireTax",
            "Vat",
            "LGovTax",
            "TotalDue",
          ],
          title,
          PAGE_WIDTH: 18 * 72,
          PAGE_HEIGHT: 8.5 * 72,
          MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
          beforeDraw: (pdfReportGenerator: any) => {
            pdfReportGenerator.SpanRow(newData.length - 1, 0, 3);
            pdfReportGenerator.boldRow(newData.length - 1);
            pdfReportGenerator.borderColumnInRow(
              newData.length - 1,
              [
                { column: 5, key: "TotalPremium" },
                { column: 6, key: "DocStamp" },
                { column: 7, key: "FireTax" },
                { column: 8, key: "Vat" },
                { column: 9, key: "LGovTax" },
                { column: 10, key: "TotalDue" },
              ],
              {
                top: true,
                bottom: false,
                left: false,
                right: false,
              }
            );
          },
          beforePerPageDraw: (
            pdfReportGenerator: any,
            doc: PDFKit.PDFDocument
          ) => {
            doc.font("Helvetica");
            doc.text(
              "Prepared By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 - 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Checked By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Noted By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 + 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
          },
          drawPageNumber: (
            doc: PDFKit.PDFDocument,
            currentPage: number,
            totalPages: number,
            pdfReportGenerator: any
          ) => {
            console.log("pageNumberText");

            doc.font("Helvetica");
            const pageNumberText = `Page ${currentPage}`;
            doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
              align: "right",
              width: 100,
            });
          },
        };
        const pdfReportGenerator = new PDFReportGenerator(props);
        return pdfReportGenerator.generatePDF(res);
      } else {
        const newData = data.map((itm: any) => {
          itm.InsuredValue = formatNumber(
            parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.Misc = formatNumber(
            parseFloat(itm.Misc.toString().replace(/,/g, ""))
          );
          itm.Notarial = formatNumber(
            parseFloat(itm.Notarial.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: format(new Date(itm.DateIssued), "MM/dd/yyyy"),
            PolicyNo: itm.PolicyNo,
            AssuredName: itm.AssuredName,
            EffictiveDate: format(new Date(itm.EffictiveDate), "MM/dd/yyyy"),
            InsuredValue: itm.InsuredValue,
            TotalPremium: itm.TotalPremium,
            Misc: itm.Misc,
            Notarial: itm.Notarial,
            DocStamp: itm.DocStamp,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            TotalDue: itm.TotalDue,
          };
        });
        newData.push({
          DateIssued: `No. of Records: ${data.length}`,
          PolicyNo: "",
          AssuredName: "",
          EffictiveDate: "",
          InsuredValue: "",
          TotalPremium: formatNumber(getSum(newData, "TotalPremium")),
          Misc: formatNumber(getSum(newData, "Misc")),
          Notarial: formatNumber(getSum(newData, "Notarial")),
          DocStamp: formatNumber(getSum(newData, "DocStamp")),
          Vat: formatNumber(getSum(newData, "Vat")),
          LGovTax: formatNumber(getSum(newData, "LGovTax")),
          TotalDue: formatNumber(getSum(newData, "TotalDue")),
        });

        const props: any = {
          data: newData,
          columnWidths: [
            90, 100, 250, 90, 100, 100, 100, 100, 100, 100, 100, 100,
          ],
          headers: [
            { headerName: "DATE ISSUED", textAlign: "left" },
            { headerName: "POLICY NO", textAlign: "left" },
            { headerName: "ASSURED NAME", textAlign: "left" },
            { headerName: "EFFECTIVE DATE", textAlign: "left" },
            { headerName: "SUM INSURED", textAlign: "right" },
            { headerName: "PREMIUM", textAlign: "right" },
            { headerName: "MISC FEE", textAlign: "right" },
            { headerName: "NOTARIAL FEE", textAlign: "right" },
            { headerName: "DOC. STAMP", textAlign: "right" },
            { headerName: "EVAT ", textAlign: "right" },
            { headerName: "LGT", textAlign: "right" },
            { headerName: "TOTAL", textAlign: "right" },
          ],
          keys: [
            "DateIssued",
            "PolicyNo",
            "AssuredName",
            "EffictiveDate",
            "InsuredValue",
            "TotalPremium",
            "Misc",
            "Notarial",
            "DocStamp",
            "Vat",
            "LGovTax",
            "TotalDue",
          ],
          title,
          PAGE_WIDTH: 19 * 72,
          PAGE_HEIGHT: 8.5 * 72,
          MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
          beforeDraw: (pdfReportGenerator: any) => {
            pdfReportGenerator.SpanRow(newData.length - 1, 0, 3);
            pdfReportGenerator.boldRow(newData.length - 1);
            pdfReportGenerator.borderColumnInRow(
              newData.length - 1,
              [
                { column: 5, key: "TotalPremium" },
                { column: 6, key: "Misc" },
                { column: 7, key: "Notarial" },
                { column: 8, key: "DocStamp" },
                { column: 9, key: "Vat" },
                { column: 10, key: "LGovTax" },
                { column: 11, key: "TotalDue" },
              ],
              {
                top: true,
                bottom: false,
                left: false,
                right: false,
              }
            );
          },
          beforePerPageDraw: (
            pdfReportGenerator: any,
            doc: PDFKit.PDFDocument
          ) => {
            doc.font("Helvetica");
            doc.text(
              "Prepared By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 - 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Checked By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
            doc.text(
              "Noted By:",
              pdfReportGenerator.PAGE_WIDTH / 2 - 100 + 300,
              pdfReportGenerator.PAGE_HEIGHT - 50,
              {
                align: "right",
                width: 100,
              }
            );
          },
          drawPageNumber: (
            doc: PDFKit.PDFDocument,
            currentPage: number,
            totalPages: number,
            pdfReportGenerator: any
          ) => {
            console.log("pageNumberText");

            doc.font("Helvetica");
            const pageNumberText = `Page ${currentPage}`;
            doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
              align: "right",
              width: 100,
            });
          },
        };
        const pdfReportGenerator = new PDFReportGenerator(props);
        return pdfReportGenerator.generatePDF(res);
      }
    } else {
      const newData = data.map((itm: any) => {
        itm.InsuredValue = formatNumber(
          parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
        );
        itm.TotalDue = formatNumber(
          parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
        );

        return {
          DateIssued: itm.DateIssued,
          AssuredName: itm.AssuredName,
          PolicyNo: itm.PolicyNo,
          EffictiveDate: itm.EffictiveDate,
          InsuredValue: itm.InsuredValue,
          Make: itm.Make,
          BodyType: itm.BodyType,
          PlateNo: itm.PlateNo,
          ChassisNo: itm.ChassisNo,
          MotorNo: itm.MotorNo,
          TotalDue: itm.TotalDue,
          Mortgagee: itm.Mortgagee,
        };
      });
      newData.push({
        DateIssued: `No. of Records: ${data.length}`,
        AssuredName: "",
        PolicyNo: "",
        EffictiveDate: "",
        InsuredValue: "",
        Make: "",
        BodyType: "",
        PlateNo: "",
        ChassisNo: "",
        MotorNo: "",
        TotalDue: formatNumber(getSum(newData, "TotalDue")),
        Mortgagee: "",
      });

      const props: any = {
        data: newData,
        columnWidths: [90, 250, 100, 90, 90, 150, 150, 150, 150, 150, 100, 200],
        headers: [
          { headerName: "DATE ISSUED", textAlign: "left" },
          { headerName: "ASSURED NAME", textAlign: "left" },
          { headerName: "POLICY NO", textAlign: "left" },
          { headerName: "EFFECTIVE DATE", textAlign: "left" },
          { headerName: "SUM INSURED", textAlign: "right" },
          { headerName: "MAKE", textAlign: "left" },
          { headerName: "BODY TYPE", textAlign: "left" },
          { headerName: "PLATE NO", textAlign: "left" },
          { headerName: "CHASSIS NO", textAlign: "left" },
          { headerName: "ENGINE NO", textAlign: "left" },
          { headerName: "TOTAL", textAlign: "right" },
          { headerName: "MORTGAGEE", textAlign: "left" },
        ],
        keys: [
          "DateIssued",
          "AssuredName",
          "PolicyNo",
          "EffictiveDate",
          "InsuredValue",
          "Make",
          "BodyType",
          "PlateNo",
          "ChassisNo",
          "MotorNo",
          "TotalDue",
          "Mortgagee",
        ],
        title,
        PAGE_WIDTH: 23.5 * 72,
        PAGE_HEIGHT: 8.5 * 72,
        MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
        beforeDraw: (pdfReportGenerator: any) => {
          pdfReportGenerator.SpanRow(newData.length - 1, 0, 3);
          pdfReportGenerator.boldRow(newData.length - 1);
          pdfReportGenerator.borderColumnInRow(
            newData.length - 1,
            [{ column: 10, key: "TotalDue" }],
            {
              top: true,
              bottom: false,
              left: false,
              right: false,
            }
          );
        },
        beforePerPageDraw: (
          pdfReportGenerator: any,
          doc: PDFKit.PDFDocument
        ) => {
          doc.font("Helvetica");
          doc.text(
            "Prepared By:",
            pdfReportGenerator.PAGE_WIDTH / 2 - 100 - 300,
            pdfReportGenerator.PAGE_HEIGHT - 50,
            {
              align: "right",
              width: 100,
            }
          );
          doc.text(
            "Checked By:",
            pdfReportGenerator.PAGE_WIDTH / 2 - 100,
            pdfReportGenerator.PAGE_HEIGHT - 50,
            {
              align: "right",
              width: 100,
            }
          );
          doc.text(
            "Noted By:",
            pdfReportGenerator.PAGE_WIDTH / 2 - 100 + 300,
            pdfReportGenerator.PAGE_HEIGHT - 50,
            {
              align: "right",
              width: 100,
            }
          );
        },
        drawPageNumber: (
          doc: PDFKit.PDFDocument,
          currentPage: number,
          totalPages: number,
          pdfReportGenerator: any
        ) => {
          doc.font("Helvetica");
          const pageNumberText = `Page ${currentPage}`;
          doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
            align: "right",
            width: 100,
          });
        },
      };
      const pdfReportGenerator = new PDFReportGenerator(props);
      return pdfReportGenerator.generatePDF(res);
    }
  } catch (err: any) {
    console.log(err);
    res.send({ message: "SERVER ERROR", success: false, data: [] });
  }
});
ProductionReports.post("/production-report-to-excel", async (req, res) => {
  try {
    const isucsmi = process.env.DEPARTMENT === "UCSMI";

    const title = req.body.title;
    const formatValue = req.body.format;
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    let dateFrom = format(parseDate(req.body.FDate), "yyyy-MM-dd");
    let dateTo = format(parseDate(req.body.TDate), "yyyy-MM-dd");
    const reportString = ProductionReport(
      dateFrom,
      dateTo,
      req.body.cmbOrder,
      req.body.cmbSubAcct,
      parseInt(req.body.cmbType),
      "",
      req.body.cmbpolicy,
      req.body.cmbSort
    );
    // console.log(reportString)
    const data: Array<any> = await prisma.$queryRawUnsafe(reportString);

    if (formatValue === 0) {
      if (req.body.cmbSubAcct === "TPL") {
        const newData = data.map((itm: any) => {
          itm.PLimit = formatNumber(
            parseFloat(itm.PLimit.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.Misc = formatNumber(
            parseFloat(itm.Misc.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: format(new Date(itm.DateIssued), "MM/dd/yyyy"),
            AssuredName: itm.AssuredName,
            PolicyNo: itm.PolicyNo,
            CoverNo: itm.CoverNo,
            EffictiveDate: format(new Date(itm.EffictiveDate), "MM/dd/yyyy"),
            PLimit: itm.PLimit,
            Premium: itm.TotalPremium,
            Subtotal: itm.TotalPremium,
            DocStamp: itm.DocStamp,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            Misc: itm.Misc,
            TotalDue: itm.TotalDue,
          };
        });
        newData.push({
          DateIssued: `No. of Records: ${data.length}`,
          AssuredName: "",
          PolicyNo: "",
          CoverNo: "",
          EffictiveDate: "",
          PLimit: "",
          Premium: "",
          Subtotal: formatNumber(getSum(newData, "Subtotal")),
          DocStamp: formatNumber(getSum(newData, "DocStamp")),
          Vat: formatNumber(getSum(newData, "Vat")),
          LGovTax: formatNumber(getSum(newData, "LGovTax")),
          Misc: formatNumber(getSum(newData, "Misc")),
          TotalDue: formatNumber(getSum(newData, "TotalDue")),
        });
        drawExcel(res, {
          columns: [
            { key: "DateIssued", width: 14 },
            { key: "AssuredName", width: 55 },
            { key: "PolicyNo", width: 25 },
            { key: "CoverNo", width: 25 },
            { key: "EffictiveDate", width: 16 },
            { key: "PLimit", width: 16 },
            { key: "Premium", width: 17 },
            { key: "Subtotal", width: 17 },
            { key: "DocStamp", width: 17 },
            { key: "Vat", width: 17 },
            { key: "LGovTax", width: 17 },
            { key: "Misc", width: 17 },
            { key: "TotalDue", width: 17 },
          ],
          data: newData,
          beforeDraw: (props: any, worksheet: any) => {
            title.split("\n").forEach((t: string, idx: number) => {
              const tt = worksheet.addRow([t]);
              props.mergeCells(
                idx + 1,
                props.alphabet[0],
                props.alphabet[props.columns.length - 1]
              );
              const alignColumns = props.alphabet.slice(
                0,
                props.columns.length
              );
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
              "DATE ISSUED",
              "ASSURED NAME",
              "POLICY NO",
              "COC NO",
              "EFFECTIVE DATE",
              "TPL COVERAGE",
              "PREMIUM",
              "SUB - TOTAL",
              "DOC. STAMP",
              "EVAT",
              "LGT",
              "STRADCOM",
              "TOTAL",
            ]);
            headerRow.font = { bold: true };
            props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
              bottom: { style: "thin" },
            });
          },
          onDraw: (props: any, rowItm: any, rowIdx: number) => {
            props.setAlignment(
              rowIdx + 6,
              ["F", "G", "H", "I", "J", "K", "L", "M"],
              { horizontal: "right", vertical: "middle" }
            );
          },
          afterDraw: (props: any, worksheet: any) => {
            props.boldText(props.data.length + 6, [
              "A",
              "F",
              "G",
              "H",
              "I",
              "J",
              "K",
              "L",
              "M",
            ]);
            props.addBorder(
              props.data.length + 6,
              ["F", "G", "H", "I", "J", "K", "L", "M"],
              {
                top: { style: "thin" },
              }
            );
            props.setAlignment(
              props.data.length + 6,
              ["F", "G", "H", "I", "J", "K", "L", "M"],
              { horizontal: "right", vertical: "middle" }
            );
            props.mergeCells(props.data.length + 6, "A", "E");

            worksheet.addRow([]);
            worksheet.addRow([]);
            worksheet.addRow([]);
            const sig = worksheet.addRow([
              "Prepared By:                                                                                                                        Checked By:                                                                                                                        Noted By:",
            ]);
            props.mergeCells(
              props.data.length + 10,
              props.alphabet[0],
              props.alphabet[props.columns.length - 1]
            );
            const alignColumns = props.alphabet.slice(
              0,
              props.columns.length - 2
            );
            props.setAlignment(props.data.length + 10, alignColumns, {
              horizontal: "center",
              vertical: "middle",
            });
            sig.font = { bold: true };
          },
        });
      } else if (req.body.cmbSubAcct === "COM") {
        const newData = data.map((itm: any) => {
          itm.InsuredValue = formatNumber(
            parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
          );
          itm.PLimit = formatNumber(
            parseFloat(itm.PLimit.toString().replace(/,/g, ""))
          );
          itm.Sec4A = formatNumber(
            parseFloat(itm.Sec4A.toString().replace(/,/g, ""))
          );
          itm.Sec4B = formatNumber(
            parseFloat(itm.Sec4B.toString().replace(/,/g, ""))
          );
          itm.Sec4C = formatNumber(
            parseFloat(itm.Sec4C.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: format(new Date(itm.DateIssued), "MM/dd/yyyy"),
            PolicyNo: itm.PolicyNo,
            AssuredName: itm.AssuredName,
            EffictiveDate: format(new Date(itm.EffictiveDate), "MM/dd/yyyy"),
            InsuredValue: itm.InsuredValue,
            PLimit: itm.PLimit,
            Sec4A: itm.Sec4A,
            Sec4B: itm.Sec4B,
            Sec4C: itm.Sec4C,
            TotalPremium: itm.TotalPremium,
            DocStamp: itm.DocStamp,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            TotalDue: itm.TotalDue,
            ChassisNo: itm.ChassisNo,
          };
        });
        newData.push({
          DateIssued: `No. of Records: ${data.length}`,
          PolicyNo: "",
          AssuredName: "",
          EffictiveDate: "",
          InsuredValue: "",
          PLimit: formatNumber(getSum(newData, "PLimit")),
          Sec4A: formatNumber(getSum(newData, "Sec4A")),
          Sec4B: formatNumber(getSum(newData, "Sec4B")),
          Sec4C: formatNumber(getSum(newData, "Sec4C")),
          TotalPremium: formatNumber(getSum(newData, "TotalPremium")),
          DocStamp: formatNumber(getSum(newData, "DocStamp")),
          Vat: formatNumber(getSum(newData, "Vat")),
          LGovTax: formatNumber(getSum(newData, "LGovTax")),
          TotalDue: formatNumber(getSum(newData, "TotalDue")),
          ChassisNo: "",
        });
        let columns: Array<any> = [];
        let headerRowData: Array<any> = [];

        if (isucsmi) {
          columns = [
            { key: "DateIssued", width: 14 },
            { key: "PolicyNo", width: 25 },
            { key: "AssuredName", width: 55 },
            { key: "ChassisNo", width: 16 },
            { key: "InsuredValue", width: 16 },
            { key: "PLimit", width: 17 },
            { key: "Sec4A", width: 17 },
            { key: "Sec4B", width: 17 },
            { key: "Sec4C", width: 17 },
            { key: "TotalPremium", width: 17 },
            { key: "DocStamp", width: 17 },
            { key: "Vat", width: 17 },
            { key: "LGovTax", width: 17 },
            { key: "TotalDue", width: 17 },
          ];
          headerRowData = [
            "DATE ISSUED",
            "POLICY NO",
            "ASSURED NAME",
            "CHASSIS NO",
            "SUM INSURED",
            "LD PREMIUM",
            "ETPL BI PREMIUM",
            "PD PREMIUM",
            "PAR PREMIUM",
            "SUB - TOTAL",
            "DOC. STAMP",
            "EVAT",
            "LGT",
            "TOTAL",
          ];
        } else {
          columns = [
            { key: "DateIssued", width: 14 },
            { key: "PolicyNo", width: 25 },
            { key: "AssuredName", width: 55 },
            { key: "EffictiveDate", width: 16 },
            { key: "InsuredValue", width: 16 },
            { key: "PLimit", width: 17 },
            { key: "Sec4A", width: 17 },
            { key: "Sec4B", width: 17 },
            { key: "Sec4C", width: 17 },
            { key: "TotalPremium", width: 17 },
            { key: "DocStamp", width: 17 },
            { key: "Vat", width: 17 },
            { key: "LGovTax", width: 17 },
            { key: "TotalDue", width: 17 },
          ];
          headerRowData = [
            "DATE ISSUED",
            "POLICY NO",
            "ASSURED NAME",
            "EFFECTIVE DATE",
            "SUM INSURED",
            "LD PREMIUM",
            "ETPL BI PREMIUM",
            "PD PREMIUM",
            "PAR PREMIUM",
            "SUB - TOTAL",
            "DOC. STAMP",
            "EVAT",
            "LGT",
            "TOTAL",
          ];
        }

        drawExcel(res, {
          columns,
          data: newData,
          beforeDraw: (props: any, worksheet: any) => {
            title.split("\n").forEach((t: string, idx: number) => {
              const tt = worksheet.addRow([t]);
              props.mergeCells(
                idx + 1,
                props.alphabet[0],
                props.alphabet[props.columns.length - 1]
              );
              const alignColumns = props.alphabet.slice(
                0,
                props.columns.length
              );
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
            const headerRow = worksheet.addRow(headerRowData);
            headerRow.font = { bold: true };
            props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
              bottom: { style: "thin" },
            });
          },
          onDraw: (props: any, rowItm: any, rowIdx: number) => {
            props.setAlignment(
              rowIdx + 6,
              ["E", "F", "G", "H", "I", "J", "K", "L", "M", "N"],
              { horizontal: "right", vertical: "middle" }
            );
          },
          afterDraw: (props: any, worksheet: any) => {
            props.boldText(props.data.length + 6, [
              "A",
              "F",
              "G",
              "H",
              "I",
              "J",
              "K",
              "L",
              "M",
              "N",
            ]);
            props.addBorder(
              props.data.length + 6,
              ["F", "G", "H", "I", "J", "K", "L", "M", "N"],
              {
                top: { style: "thin" },
              }
            );
            props.setAlignment(
              props.data.length + 6,
              ["E", "F", "G", "H", "I", "J", "K", "L", "M", "N"],
              { horizontal: "right", vertical: "middle" }
            );
            props.mergeCells(props.data.length + 6, "A", "E");

            worksheet.addRow([]);
            worksheet.addRow([]);
            worksheet.addRow([]);
            const sig = worksheet.addRow([
              "Prepared By:                                                                                                                        Checked By:                                                                                                                        Noted By:",
            ]);
            props.mergeCells(
              props.data.length + 10,
              props.alphabet[0],
              props.alphabet[props.columns.length - 1]
            );
            const alignColumns = props.alphabet.slice(
              0,
              props.columns.length - 2
            );
            props.setAlignment(props.data.length + 10, alignColumns, {
              horizontal: "center",
              vertical: "middle",
            });
            sig.font = { bold: true };
          },
        });
      } else if (
        req.body.cmbSubAcct === "MAR" ||
        req.body.cmbSubAcct === "MSPR" ||
        req.body.cmbSubAcct === "CGL"
      ) {
        const newData = data.map((itm: any) => {
          itm.InsuredValue = formatNumber(
            parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: format(new Date(itm.DateIssued), "MM/dd/yyyy"),
            PolicyNo: itm.PolicyNo,
            AssuredName: itm.AssuredName,
            EffictiveDate: format(new Date(itm.EffictiveDate), "MM/dd/yyyy"),
            InsuredValue: itm.InsuredValue,
            TotalPremium: itm.TotalPremium,
            DocStamp: itm.DocStamp,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            TotalDue: itm.TotalDue,
          };
        });
        newData.push({
          DateIssued: `No. of Records: ${data.length}`,
          PolicyNo: "",
          AssuredName: "",
          EffictiveDate: "",
          InsuredValue: "",
          TotalPremium: formatNumber(getSum(newData, "TotalPremium")),
          DocStamp: formatNumber(getSum(newData, "DocStamp")),
          Vat: formatNumber(getSum(newData, "Vat")),
          LGovTax: formatNumber(getSum(newData, "LGovTax")),
          TotalDue: formatNumber(getSum(newData, "TotalDue")),
        });

        drawExcel(res, {
          columns: [
            { key: "DateIssued", width: 14 },
            { key: "PolicyNo", width: 25 },
            { key: "AssuredName", width: 55 },
            { key: "EffictiveDate", width: 16 },
            { key: "InsuredValue", width: 25 },
            { key: "TotalPremium", width: 16 },
            { key: "DocStamp", width: 17 },
            { key: "Vat", width: 17 },
            { key: "LGovTax", width: 17 },
            { key: "TotalDue", width: 17 },
          ],
          data: newData,
          beforeDraw: (props: any, worksheet: any) => {
            title.split("\n").forEach((t: string, idx: number) => {
              const tt = worksheet.addRow([t]);
              props.mergeCells(
                idx + 1,
                props.alphabet[0],
                props.alphabet[props.columns.length - 1]
              );
              const alignColumns = props.alphabet.slice(
                0,
                props.columns.length
              );
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
              "DATE ISSUED",
              "POLICY NO",
              "ASSURED NAME",
              "EFFECTIVE DATE",
              "SUM INSURED",
              "PREMIUM",
              "DOC. STAMP",
              "EVAT",
              "LGT",
              "TOTAL",
            ]);
            headerRow.font = { bold: true };
            props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
              bottom: { style: "thin" },
            });
          },
          onDraw: (props: any, rowItm: any, rowIdx: number) => {
            props.setAlignment(rowIdx + 6, ["F", "G", "H", "I", "J"], {
              horizontal: "right",
              vertical: "middle",
            });
          },
          afterDraw: (props: any, worksheet: any) => {
            props.boldText(props.data.length + 6, [
              "A",
              "F",
              "G",
              "H",
              "I",
              "J",
            ]);
            props.addBorder(props.data.length + 6, ["F", "G", "H", "I", "J"], {
              top: { style: "thin" },
            });
            props.setAlignment(
              props.data.length + 6,
              ["F", "G", "H", "I", "J"],
              { horizontal: "right", vertical: "middle" }
            );
            props.mergeCells(props.data.length + 6, "A", "E");

            worksheet.addRow([]);
            worksheet.addRow([]);
            worksheet.addRow([]);
            const sig = worksheet.addRow([
              "Prepared By:                                                                                                                        Checked By:                                                                                                                        Noted By:",
            ]);
            props.mergeCells(
              props.data.length + 10,
              props.alphabet[0],
              props.alphabet[props.columns.length - 1]
            );
            const alignColumns = props.alphabet.slice(
              0,
              props.columns.length - 2
            );
            props.setAlignment(props.data.length + 10, alignColumns, {
              horizontal: "center",
              vertical: "middle",
            });
            sig.font = { bold: true };
          },
        });
      } else if (req.body.cmbSubAcct === "PA") {
        const qry = `
        SELECT 
            date_format(a.dateissued,'%m/%d/%Y') as DateIssued,
            endorsement_no as  PolicyNo,
            name as AssuredName, 
            date_format(a.datefrom,'%m/%d/%Y') as EffictiveDate,
            format(suminsured,2) as InsuredValue,
            format(totalpremium,2) as TotalPremium,
            format(docstamp,2) as DocStamp,
            format(vat,2) as Vat,
            format(lgovtax,2) as LGovTax,
            format(totaldue,2)  as TotalDue,
            policyNo
        FROM
            gpa_endorsement a
        WHERE
            a.dateissued <= '${dateTo}'
                AND a.dateissued >= '${dateFrom}'
                order by  a.endorsement_no`;

        const dataEd: Array<any> = await prisma.$queryRawUnsafe(qry);

        const newData = data.map((itm: any) => {
          itm.InsuredValue = formatNumber(
            parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: format(new Date(itm.DateIssued), "MM/dd/yyyy"),
            PolicyNo: itm.PolicyNo,
            AssuredName: itm.AssuredName,
            EffictiveDate: format(new Date(itm.EffictiveDate), "MM/dd/yyyy"),
            InsuredValue: itm.InsuredValue,
            TotalPremium: itm.TotalPremium,
            DocStamp: itm.DocStamp,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            TotalDue: itm.TotalDue,
          };
        });

        const combined:Array<any> = [];
        newData.forEach((policy) => {
          combined.push(policy); // Add policy first
          const relatedEndorsements = dataEd.filter(
            (e) => e.policyNo === policy.PolicyNo
          );
          combined.push(...relatedEndorsements); // Then push its endorsements
        });

        combined.push({
          DateIssued: `No. of Records: ${data.length}`,
          PolicyNo: "",
          AssuredName: "",
          EffictiveDate: "",
          InsuredValue: "",
          TotalPremium: formatNumber(getSum(combined, "TotalPremium")),
          DocStamp: formatNumber(getSum(combined, "DocStamp")),
          Vat: formatNumber(getSum(combined, "Vat")),
          LGovTax: formatNumber(getSum(combined, "LGovTax")),
          TotalDue: formatNumber(getSum(combined, "TotalDue")),
        });

        drawExcel(res, {
          columns: [
            { key: "DateIssued", width: 14 },
            { key: "PolicyNo", width: 25 },
            { key: "AssuredName", width: 55 },
            { key: "EffictiveDate", width: 16 },
            { key: "InsuredValue", width: 25 },
            { key: "TotalPremium", width: 16 },
            { key: "DocStamp", width: 17 },
            { key: "Vat", width: 17 },
            { key: "LGovTax", width: 17 },
            { key: "TotalDue", width: 17 },
          ],
          data: combined,
          beforeDraw: (props: any, worksheet: any) => {
            title.split("\n").forEach((t: string, idx: number) => {
              const tt = worksheet.addRow([t]);
              props.mergeCells(
                idx + 1,
                props.alphabet[0],
                props.alphabet[props.columns.length - 1]
              );
              const alignColumns = props.alphabet.slice(
                0,
                props.columns.length
              );
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
              "DATE ISSUED",
              "POLICY NO",
              "ASSURED NAME",
              "EFFECTIVE DATE",
              "SUM INSURED",
              "PREMIUM",
              "DOC. STAMP",
              "EVAT",
              "LGT",
              "TOTAL",
            ]);
            headerRow.font = { bold: true };
            props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
              bottom: { style: "thin" },
            });
          },
          onDraw: (props: any, rowItm: any, rowIdx: number) => {
            props.setAlignment(rowIdx + 6, ["F", "G", "H", "I", "J"], {
              horizontal: "right",
              vertical: "middle",
            });
          },
          afterDraw: (props: any, worksheet: any) => {
            props.boldText(props.data.length + 6, [
              "A",
              "F",
              "G",
              "H",
              "I",
              "J",
            ]);
            props.addBorder(props.data.length + 6, ["F", "G", "H", "I", "J"], {
              top: { style: "thin" },
            });
            props.setAlignment(
              props.data.length + 6,
              ["F", "G", "H", "I", "J"],
              { horizontal: "right", vertical: "middle" }
            );
            props.mergeCells(props.data.length + 6, "A", "E");

            worksheet.addRow([]);
            worksheet.addRow([]);
            worksheet.addRow([]);
            const sig = worksheet.addRow([
              "Prepared By:                                                                                                                        Checked By:                                                                                                                        Noted By:",
            ]);
            props.mergeCells(
              props.data.length + 10,
              props.alphabet[0],
              props.alphabet[props.columns.length - 1]
            );
            const alignColumns = props.alphabet.slice(
              0,
              props.columns.length - 2
            );
            props.setAlignment(props.data.length + 10, alignColumns, {
              horizontal: "center",
              vertical: "middle",
            });
            sig.font = { bold: true };
          },
        });
      } else if (req.body.cmbSubAcct === "FIRE") {
        const newData = data.map((itm: any) => {
          itm.InsuredValue = formatNumber(
            parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.FireTax = formatNumber(
            parseFloat(itm.FireTax.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: itm.DateIssued,
            PolicyNo: itm.PolicyNo,
            AssuredName: itm.AssuredName,
            EffictiveDate: itm.EffictiveDate,
            InsuredValue: itm.InsuredValue,
            TotalPremium: itm.TotalPremium,
            DocStamp: itm.DocStamp,
            FireTax: itm.FireTax,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            TotalDue: itm.TotalDue,
          };
        });
        newData.push({
          DateIssued: `No. of Records: ${data.length}`,
          PolicyNo: "",
          AssuredName: "",
          EffictiveDate: "",
          InsuredValue: "",
          TotalPremium: formatNumber(getSum(newData, "TotalPremium")),
          DocStamp: formatNumber(getSum(newData, "DocStamp")),
          FireTax: formatNumber(getSum(newData, "FireTax")),
          Vat: formatNumber(getSum(newData, "Vat")),
          LGovTax: formatNumber(getSum(newData, "LGovTax")),
          TotalDue: formatNumber(getSum(newData, "TotalDue")),
        });

        drawExcel(res, {
          columns: [
            { key: "DateIssued", width: 14 },
            { key: "PolicyNo", width: 25 },
            { key: "AssuredName", width: 55 },
            { key: "EffictiveDate", width: 16 },
            { key: "InsuredValue", width: 25 },
            { key: "TotalPremium", width: 16 },
            { key: "DocStamp", width: 17 },
            { key: "FireTax", width: 17 },
            { key: "Vat", width: 17 },
            { key: "LGovTax", width: 17 },
            { key: "TotalDue", width: 17 },
          ],
          data: newData,
          beforeDraw: (props: any, worksheet: any) => {
            title.split("\n").forEach((t: string, idx: number) => {
              const tt = worksheet.addRow([t]);
              props.mergeCells(
                idx + 1,
                props.alphabet[0],
                props.alphabet[props.columns.length - 1]
              );
              const alignColumns = props.alphabet.slice(
                0,
                props.columns.length
              );
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
              "DATE ISSUED",
              "POLICY NO",
              "ASSURED NAME",
              "EFFECTIVE DATE",
              "SUM INSURED",
              "PREMIUM",
              "DOC. STAMP",
              "F.S. TAX",
              "EVAT",
              "LGT",
              "TOTAL",
            ]);
            headerRow.font = { bold: true };
            props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
              bottom: { style: "thin" },
            });
          },
          onDraw: (props: any, rowItm: any, rowIdx: number) => {
            props.setAlignment(rowIdx + 6, ["F", "G", "H", "I", "J", "K"], {
              horizontal: "right",
              vertical: "middle",
            });
          },
          afterDraw: (props: any, worksheet: any) => {
            props.boldText(props.data.length + 6, [
              "A",
              "F",
              "G",
              "H",
              "I",
              "J",
              "K",
            ]);
            props.addBorder(
              props.data.length + 6,
              ["F", "G", "H", "I", "J", "K"],
              {
                top: { style: "thin" },
              }
            );
            props.setAlignment(
              props.data.length + 6,
              ["F", "G", "H", "I", "J", "K"],
              { horizontal: "right", vertical: "middle" }
            );
            props.mergeCells(props.data.length + 6, "A", "E");

            worksheet.addRow([]);
            worksheet.addRow([]);
            worksheet.addRow([]);
            const sig = worksheet.addRow([
              "Prepared By:                                                                                                                        Checked By:                                                                                                                        Noted By:",
            ]);
            props.mergeCells(
              props.data.length + 10,
              props.alphabet[0],
              props.alphabet[props.columns.length - 1]
            );
            const alignColumns = props.alphabet.slice(
              0,
              props.columns.length - 2
            );
            props.setAlignment(props.data.length + 10, alignColumns, {
              horizontal: "center",
              vertical: "middle",
            });
            sig.font = { bold: true };
          },
        });
      } else {
        const newData = data.map((itm: any) => {
          itm.InsuredValue = formatNumber(
            parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
          );
          itm.TotalPremium = formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          );
          itm.Misc = formatNumber(
            parseFloat(itm.Misc.toString().replace(/,/g, ""))
          );
          itm.Notarial = formatNumber(
            parseFloat(itm.Notarial.toString().replace(/,/g, ""))
          );
          itm.DocStamp = formatNumber(
            parseFloat(itm.DocStamp.toString().replace(/,/g, ""))
          );
          itm.Vat = formatNumber(
            parseFloat(itm.Vat.toString().replace(/,/g, ""))
          );
          itm.LGovTax = formatNumber(
            parseFloat(itm.LGovTax.toString().replace(/,/g, ""))
          );
          itm.TotalDue = formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          );

          return {
            DateIssued: itm.DateIssued,
            PolicyNo: itm.PolicyNo,
            AssuredName: itm.AssuredName,
            EffictiveDate: itm.EffictiveDate,
            InsuredValue: itm.InsuredValue,
            TotalPremium: itm.TotalPremium,
            Misc: itm.Misc,
            Notarial: itm.Notarial,
            DocStamp: itm.DocStamp,
            Vat: itm.Vat,
            LGovTax: itm.LGovTax,
            TotalDue: itm.TotalDue,
          };
        });
        newData.push({
          DateIssued: `No. of Records: ${data.length}`,
          PolicyNo: "",
          AssuredName: "",
          EffictiveDate: "",
          InsuredValue: "",
          TotalPremium: formatNumber(getSum(newData, "TotalPremium")),
          Misc: formatNumber(getSum(newData, "Misc")),
          Notarial: formatNumber(getSum(newData, "Notarial")),
          DocStamp: formatNumber(getSum(newData, "DocStamp")),
          Vat: formatNumber(getSum(newData, "Vat")),
          LGovTax: formatNumber(getSum(newData, "LGovTax")),
          TotalDue: formatNumber(getSum(newData, "TotalDue")),
        });

        drawExcel(res, {
          columns: [
            { key: "DateIssued", width: 14 },
            { key: "PolicyNo", width: 25 },
            { key: "AssuredName", width: 55 },
            { key: "EffictiveDate", width: 16 },
            { key: "InsuredValue", width: 25 },
            { key: "TotalPremium", width: 16 },
            { key: "Misc", width: 17 },
            { key: "Notarial", width: 17 },
            { key: "DocStamp", width: 17 },
            { key: "Vat", width: 17 },
            { key: "LGovTax", width: 17 },
            { key: "TotalDue", width: 17 },
          ],
          data: newData,
          beforeDraw: (props: any, worksheet: any) => {
            title.split("\n").forEach((t: string, idx: number) => {
              const tt = worksheet.addRow([t]);
              props.mergeCells(
                idx + 1,
                props.alphabet[0],
                props.alphabet[props.columns.length - 1]
              );
              const alignColumns = props.alphabet.slice(
                0,
                props.columns.length
              );
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
              "DATE ISSUED",
              "POLICY NO",
              "ASSURED NAME",
              "EFFECTIVE DATE",
              "SUM INSURED",
              "PREMIUM",
              "MISC FEE",
              "NOTARIAL FEE",
              "DOC. STAMP",
              "EVAT",
              "LGT",
              "TOTAL",
            ]);
            headerRow.font = { bold: true };
            props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
              bottom: { style: "thin" },
            });
          },
          onDraw: (props: any, rowItm: any, rowIdx: number) => {
            props.setAlignment(
              rowIdx + 6,
              ["F", "G", "H", "I", "J", "K", "L"],
              { horizontal: "right", vertical: "middle" }
            );
          },
          afterDraw: (props: any, worksheet: any) => {
            props.boldText(props.data.length + 6, [
              "A",
              "F",
              "G",
              "H",
              "I",
              "J",
              "K",
              "L",
            ]);
            props.addBorder(
              props.data.length + 6,
              ["F", "G", "H", "I", "J", "K", "L"],
              {
                top: { style: "thin" },
              }
            );
            props.setAlignment(
              props.data.length + 6,
              ["F", "G", "H", "I", "J", "K", "L"],
              { horizontal: "right", vertical: "middle" }
            );
            props.mergeCells(props.data.length + 6, "A", "E");

            worksheet.addRow([]);
            worksheet.addRow([]);
            worksheet.addRow([]);
            const sig = worksheet.addRow([
              "Prepared By:                                                                                                                        Checked By:                                                                                                                        Noted By:",
            ]);
            props.mergeCells(
              props.data.length + 10,
              props.alphabet[0],
              props.alphabet[props.columns.length - 1]
            );
            const alignColumns = props.alphabet.slice(
              0,
              props.columns.length - 2
            );
            props.setAlignment(props.data.length + 10, alignColumns, {
              horizontal: "center",
              vertical: "middle",
            });
            sig.font = { bold: true };
          },
        });
      }
    } else {
      const newData = data.map((itm: any) => {
        itm.InsuredValue = formatNumber(
          parseFloat(itm.InsuredValue.toString().replace(/,/g, ""))
        );
        itm.TotalDue = formatNumber(
          parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
        );

        return {
          DateIssued: itm.DateIssued,
          AssuredName: itm.AssuredName,
          PolicyNo: itm.PolicyNo,
          EffictiveDate: itm.EffictiveDate,
          InsuredValue: itm.InsuredValue,
          Make: itm.Make,
          BodyType: itm.BodyType,
          PlateNo: itm.PlateNo,
          ChassisNo: itm.ChassisNo,
          MotorNo: itm.MotorNo,
          TotalDue: itm.TotalDue,
          Mortgagee: itm.Mortgagee,
        };
      });
      newData.push({
        DateIssued: `No. of Records: ${data.length}`,
        AssuredName: "",
        PolicyNo: "",
        EffictiveDate: "",
        InsuredValue: "",
        Make: "",
        BodyType: "",
        PlateNo: "",
        ChassisNo: "",
        MotorNo: "",
        TotalDue: formatNumber(getSum(newData, "TotalDue")),
        Mortgagee: "",
      });

      drawExcel(res, {
        columns: [
          { key: "DateIssued", width: 14 },
          { key: "AssuredName", width: 55 },
          { key: "PolicyNo", width: 25 },
          { key: "EffictiveDate", width: 16 },
          { key: "InsuredValue", width: 25 },
          { key: "Make", width: 30 },
          { key: "BodyType", width: 30 },
          { key: "PlateNo", width: 30 },
          { key: "ChassisNo", width: 30 },
          { key: "MotorNo", width: 30 },
          { key: "TotalDue", width: 17 },
          { key: "Mortgagee", width: 55 },
        ],
        data: newData,
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
            "DATE ISSUED",
            "ASSURED NAME",
            "POLICY NO",
            "EFFECTIVE DATE",
            "SUM INSURED",
            "MAKE",
            "BODY TYPE",
            "PLATE NO",
            "CHASSIS NO",
            "ENGINE NO",
            "TOTAL",
            "MORTGAGEE",
          ]);
          headerRow.font = { bold: true };
          props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
            bottom: { style: "thin" },
          });
        },
        onDraw: (props: any, rowItm: any, rowIdx: number) => {
          props.setAlignment(rowIdx + 6, ["E", "K"], {
            horizontal: "right",
            vertical: "middle",
          });
        },
        afterDraw: (props: any, worksheet: any) => {
          props.boldText(props.data.length + 6, ["K"]);
          props.addBorder(props.data.length + 6, ["K"], {
            top: { style: "thin" },
          });
          props.setAlignment(props.data.length + 6, ["K"], {
            horizontal: "right",
            vertical: "middle",
          });
          props.mergeCells(props.data.length + 6, "A", "E");

          worksheet.addRow([]);
          worksheet.addRow([]);
          worksheet.addRow([]);
          const sig = worksheet.addRow([
            "Prepared By:                                                                                                                        Checked By:                                                                                                                        Noted By:",
          ]);
          props.mergeCells(
            props.data.length + 10,
            props.alphabet[0],
            props.alphabet[props.columns.length - 1]
          );
          const alignColumns = props.alphabet.slice(
            0,
            props.columns.length - 2
          );
          props.setAlignment(props.data.length + 10, alignColumns, {
            horizontal: "center",
            vertical: "middle",
          });
          sig.font = { bold: true };
        },
      });
    }

    // Create a new workbook and worksheet
  } catch (err: any) {
    console.log(err);
    res.send({ message: "SERVER ERROR", success: false, data: [] });
  }
});

ProductionReports.get("/policy-account", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    res.send({
      message: "Data Successfully Get",
      success: true,
      data: await prisma.$queryRawUnsafe(`
        select 'ALL' as Account
        union 
          select Account from policy_account
        `),
    });
  } catch (err: any) {
    console.log(err);
    res.send({ message: "SERVER ERROR", success: false, data: [] });
  }
});

ProductionReports.post("/get-production-report-desk", async (req, res) => {
  try {
    console.log(req.body);
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    let dateFrom = format(parseDate(req.body.FDate), "yyyy-MM-dd");
    let dateTo = format(parseDate(req.body.TDate), "yyyy-MM-dd");

    const reportString = ProductionReport(
      dateFrom,
      dateTo,
      req.body.cmbOrder,
      req.body.cmbSubAcct,
      parseInt(req.body.cmbType),
      "",
      req.body.cmbpolicy,
      req.body.cmbSort
    );
    // console.log(reportString)
    const data: Array<any> = await prisma.$queryRawUnsafe(reportString);

    res.send({
      success: true,
      message: "Successfully get production report ",
      data,
    });
  } catch (err: any) {
    res.send({ message: "SERVER ERROR", success: false, data: [] });
  }
});

export function formatNumber(num: number) {
  return (num || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
export function getSum(data: Array<any>, key: string): number {
  if (data.length <= 0) {
    return 0;
  }












































  
  return data.reduce((total: number, row: any) => {
    total += parseFloat((row[key] || 0).toString().replace(/,/g, ""));
    return total;
  }, 0);
}

export default ProductionReports;
