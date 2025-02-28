import express from "express";
import { format } from "date-fns";
import { mapColumnsToKeys } from "./report-fields";
import { exportToExcel } from "./report-to-excel";
import { RenewalNoticeReport } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";
import PDFReportGenerator from "../../../lib/pdf-generator";

const RenewalReport = express.Router();


const { CustomPrismaClient } = PrismaList();

RenewalReport.post("/renewal-notice", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    let { date, policy, type, account, title } = req.body;

    const query = RenewalNoticeReport(
      policy,
      account,
      type,
      date
    );
    const data: any = await prisma.$queryRawUnsafe(query);


    if (policy === 'FIRE') {
      const newData = data.map((itm: any) => {
        itm.TotalPremium = formatNumber(parseFloat(itm.TotalPremium.toString().replace(/,/g, '')))
        itm.InsuredValue = formatNumber(parseFloat(itm.InsuredValue.toString().replace(/,/g, '')))

        return {
          PolicyNo: itm.PolicyNo,
          Expiration: itm.Expiration,
          AssuredName: itm.AssuredName,
          InsuredValue: itm.InsuredValue,
          Account: itm.Account,
          TotalPremium: itm.TotalPremium,
          Mortgagee: itm.Mortgagee,
        }
      })
      newData.push({
        PolicyNo: '',
        Expiration: '',
        AssuredName: '',
        InsuredValue: '',
        Account: '',
        TotalPremium: `TOTAL :           ${formatNumber(getSum(newData, 'TotalPremium'))}`,
        Mortgagee: '',
      })

      const props: any = {
        data: newData,
        columnWidths: [120, 100, 250, 90, 200, 100, 200],
        headers: [
          { headerName: 'POLICY NO', textAlign: "left" },
          { headerName: 'EXPIRATION', textAlign: "left" },
          { headerName: 'ASSURED NAME', textAlign: "left" },
          { headerName: 'INSURED VALUE', textAlign: "right" },
          { headerName: 'Account', textAlign: "left" },
          { headerName: 'TOTAL PREMIUM', textAlign: "right" },
          { headerName: 'MORTGAGEE', textAlign: "left" },
        ],
        keys: [
          'PolicyNo',
          'Expiration',
          'AssuredName',
          'InsuredValue',
          'Account',
          'TotalPremium',
          'Mortgagee',
        ],
        title,
        PAGE_WIDTH: 16 * 72,
        PAGE_HEIGHT: 8.5 * 72,
        MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
        beforeDraw: (pdfReportGenerator: any) => {
          pdfReportGenerator.SpanRow(newData.length - 1, 4, 2, 'TotalPremium', "right");
          pdfReportGenerator.boldRow(newData.length - 1);
          pdfReportGenerator.borderColumnInRow(newData.length - 1, [
            { column: 4, key: 'TotalPremium' }
          ], {
            top: true,
            bottom: false,
            left: false,
            right: false
          });

        },
        beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {
          doc.font('Helvetica');
          doc.text("Prepared By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100) - 300), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
          doc.text("Checked By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100)), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
          doc.text("Noted By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100) + 300), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
        },
        drawPageNumber: (doc: PDFKit.PDFDocument, currentPage: number, totalPages: number, pdfReportGenerator: any) => {
          console.log('pageNumberText')

          doc.font('Helvetica');
          const pageNumberText = `Page ${currentPage} of ${totalPages}`;
          doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
            align: 'right',
            width: 100
          });


        }
      }
      const pdfReportGenerator = new PDFReportGenerator(props)
      return pdfReportGenerator.generatePDF(res)
    }
    if (policy === 'MAR') {
      const newData = data.map((itm: any) => {
        itm.TotalPremium = formatNumber(parseFloat(itm.TotalPremium.toString().replace(/,/g, '')))
        itm.InsuredValue = formatNumber(parseFloat(itm.InsuredValue.toString().replace(/,/g, '')))

        return {
          PolicyNo: itm.PolicyNo,
          Expiration: itm.Expiration,
          AssuredName: itm.AssuredName,
          InsuredValue: itm.InsuredValue,
          Account: itm.Account,
          TotalPremium: itm.TotalPremium,
        }
      })
      newData.push({
        PolicyNo: '',
        Expiration: '',
        AssuredName: '',
        InsuredValue: '',
        Account: '',
        TotalPremium: `TOTAL :           ${formatNumber(getSum(newData, 'TotalPremium'))}`,
      })

      const props: any = {
        data: newData,
        columnWidths: [120, 100, 300, 90, 200, 100],
        headers: [
          { headerName: 'POLICY NO', textAlign: "left" },
          { headerName: 'EXPIRATION', textAlign: "left" },
          { headerName: 'ASSURED NAME', textAlign: "left" },
          { headerName: 'INSURED VALUE', textAlign: "right" },
          { headerName: 'Account', textAlign: "left" },
          { headerName: 'TOTAL PREMIUM', textAlign: "right" },
        ],
        keys: [
          'PolicyNo',
          'Expiration',
          'AssuredName',
          'InsuredValue',
          'Account',
          'TotalPremium',
        ],
        title,
        PAGE_WIDTH: 14 * 72,
        PAGE_HEIGHT: 8.5 * 72,
        MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
        beforeDraw: (pdfReportGenerator: any) => {
          pdfReportGenerator.SpanRow(newData.length - 1, 4, 2, 'TotalPremium', "right");
          pdfReportGenerator.boldRow(newData.length - 1);
          pdfReportGenerator.borderColumnInRow(newData.length - 1, [
            { column: 4, key: 'TotalPremium' }
          ], {
            top: true,
            bottom: false,
            left: false,
            right: false
          });

        },
        beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {
          doc.font('Helvetica');
          doc.text("Prepared By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100) - 300), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
          doc.text("Checked By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100)), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
          doc.text("Noted By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100) + 300), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
        },
        drawPageNumber: (doc: PDFKit.PDFDocument, currentPage: number, totalPages: number, pdfReportGenerator: any) => {
          console.log('pageNumberText')

          doc.font('Helvetica');
          const pageNumberText = `Page ${currentPage} of ${totalPages}`;
          doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
            align: 'right',
            width: 100
          });


        }
      }
      const pdfReportGenerator = new PDFReportGenerator(props)
      return pdfReportGenerator.generatePDF(res)
    }
    if (policy === 'PA') {
      const newData = data.map((itm: any) => {
        itm.TotalPremium = formatNumber(parseFloat(itm.TotalPremium.toString().replace(/,/g, '')))

        return {
          PolicyNo: itm.PolicyNo,
          Expiration: itm.Expiration,
          AssuredName: itm.AssuredName,
          Account: itm.Account,
          Location: itm.Location,
          TotalPremium: itm.TotalPremium,
        }
      })
      newData.push({
        PolicyNo: '',
        Expiration: '',
        AssuredName: '',
        Account: '',
        Location: '',
        TotalPremium: `TOTAL :           ${formatNumber(getSum(newData, 'TotalPremium'))}`,
      })

      const props: any = {
        data: newData,
        columnWidths: [120, 100, 300, 150, 250, 100],
        headers: [
          { headerName: 'POLICY NO', textAlign: "left" },
          { headerName: 'EXPIRATION', textAlign: "left" },
          { headerName: 'ASSURED NAME', textAlign: "left" },
          { headerName: 'Account', textAlign: "left" },
          { headerName: 'DISCRIPTION', textAlign: "left" },
          { headerName: 'TOTAL PREMIUM', textAlign: "right" },
        ],
        keys: [
          'PolicyNo',
          'Expiration',
          'AssuredName',
          'Account',
          'Location',
          'TotalPremium',
        ],
        title,
        PAGE_WIDTH: 15 * 72,
        PAGE_HEIGHT: 8.5 * 72,
        MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
        beforeDraw: (pdfReportGenerator: any) => {
          pdfReportGenerator.SpanRow(newData.length - 1, 4, 2, 'TotalPremium', "right");

          pdfReportGenerator.boldRow(newData.length - 1);
          pdfReportGenerator.borderColumnInRow(newData.length - 1, [
            { column: 4, key: 'TotalPremium' }
          ], {
            top: true,
            bottom: false,
            left: false,
            right: false
          });

        },
        beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {
          doc.font('Helvetica');
          doc.text("Prepared By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100) - 300), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
          doc.text("Checked By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100)), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
          doc.text("Noted By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100) + 300), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
        },
        drawPageNumber: (doc: PDFKit.PDFDocument, currentPage: number, totalPages: number, pdfReportGenerator: any) => {
          console.log('pageNumberText')

          doc.font('Helvetica');
          const pageNumberText = `Page ${currentPage} of ${totalPages}`;
          doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
            align: 'right',
            width: 100
          });


        }
      }
      const pdfReportGenerator = new PDFReportGenerator(props)
      return pdfReportGenerator.generatePDF(res)
    } else {
      const newData = data.map((itm: any) => {
        itm.TotalPremium = formatNumber(parseFloat(itm.TotalPremium.toString().replace(/,/g, '')))
        itm.InsuredValue = formatNumber(parseFloat(itm.InsuredValue.toString().replace(/,/g, '')))

        return {
          PolicyNo: itm.PolicyNo,
          Expiration: itm.Expiration,
          AssuredName: itm.AssuredName,
          InsuredValue: itm.InsuredValue,
          PlateNo: itm.PlateNo,
          ChassisNo: itm.ChassisNo,
          MotorNo: itm.MotorNo,
          TotalPremium: itm.TotalPremium,
          Mortgagee: itm.Mortgagee,
        }
      })
      newData.push({
        PolicyNo: '',
        Expiration: '',
        AssuredName: '',
        InsuredValue: '',
        PlateNo: '',
        ChassisNo: '',
        MotorNo: '',
        TotalPremium:`TOTAL :           ${formatNumber(getSum(newData, 'TotalPremium'))}`,
        Mortgagee: '',
      })

      const props: any = {
        data: newData,
        columnWidths: [120, 100, 250, 90, 100, 150, 150, 100, 200],
        headers: [
          { headerName: 'POLICY NO', textAlign: "left" },
          { headerName: 'EXPIRATION', textAlign: "left" },
          { headerName: 'ASSURED NAME', textAlign: "left" },
          { headerName: 'INSURED VALUE', textAlign: "right" },
          { headerName: 'PLATE NO.', textAlign: "left" },
          { headerName: 'CHASSIS NO', textAlign: "left" },
          { headerName: 'ENGINE NO', textAlign: "left" },
          { headerName: 'TOTAL PREMIUM', textAlign: "right" },
          { headerName: 'MORTGAGEE', textAlign: "left" },
        ],
        keys: [
          'PolicyNo',
          'Expiration',
          'AssuredName',
          'InsuredValue',
          'PlateNo',
          'ChassisNo',
          'MotorNo',
          'TotalPremium',
          'Mortgagee',
        ],
        title,
        PAGE_WIDTH: 18 * 72,
        PAGE_HEIGHT: 8.5 * 72,
        MARGIN: { top: 20, right: 10, bottom: 80, left: 10 },
        beforeDraw: (pdfReportGenerator: any) => {
          pdfReportGenerator.SpanRow(newData.length - 1, 6, 2, 'TotalPremium', "right");
          pdfReportGenerator.boldRow(newData.length - 1);
          pdfReportGenerator.borderColumnInRow(newData.length - 1, [
            { column: 6, key: 'TotalPremium' }
          ], {
            top: true,
            bottom: false,
            left: false,
            right: false
          });

        },
        beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {
          doc.font('Helvetica');
          doc.text("Prepared By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100) - 300), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
          doc.text("Checked By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100)), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
          doc.text("Noted By:", (((pdfReportGenerator.PAGE_WIDTH / 2) - 100) + 300), pdfReportGenerator.PAGE_HEIGHT - 50, {
            align: 'right',
            width: 100,
          });
        },
        drawPageNumber: (doc: PDFKit.PDFDocument, currentPage: number, totalPages: number, pdfReportGenerator: any) => {
          console.log('pageNumberText')

          doc.font('Helvetica');
          const pageNumberText = `Page ${currentPage} of ${totalPages}`;
          doc.text(pageNumberText, 10, pdfReportGenerator.PAGE_HEIGHT - 70, {
            align: 'right',
            width: 100
          });


        }
      }
      const pdfReportGenerator = new PDFReportGenerator(props)
      return pdfReportGenerator.generatePDF(res)
    }

  } catch (error: any) {
    console.log(error.message)
    res.send({
      report: [],
      message: error.message,
      success: false
    });
  }
});

RenewalReport.post("/export-excel-renewal-notice", async (req, res) => {
  exportToExcel({
    req,
    res,
    callback({
      state,
      header,
      rowLengthTextDisplayIndex,
      sheet,
      sendFile,
      letterList,
    }) {
      sendFile();
    },
  });
});
export default RenewalReport;


function formatNumber(num: number) {
  return (num || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
function getSum(data: Array<any>, key: string): number {
  if (data.length <= 0) {
    return 0
  }
  return data.reduce((total: number, row: any) => {
    total += parseFloat(row[key].toString().replace(/,/g, ''))
    return total
  }, 0)
}