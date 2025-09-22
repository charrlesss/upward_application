import express from "express";
import {
  AddNewCashDisbursement,
  AddNewJournalFromCashDisbursement,
  GenerateCashDisbursementID,
  DeleteNewCashDisbursement,
  DeleteNewJournalFromCashDisbursement,
  updateCashDisbursementID,
  findCashDisbursement,
  searchCashDisbursement,
  findSearchSelectedCashDisbursement,
  insertVoidJournalFromCashDisbursement,
  insertVoidCashDisbursement,
  getClientFromPayTo,
} from "../../../model/Task/Accounting/cash-disbursement.model";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { __executeQuery } from "../../../model/Task/Production/policy";
import PDFReportGenerator from "../../../lib/pdf-generator";
import { format } from "date-fns";
import {
  formatNumber,
  getSum,
} from "../../Reports/Production/production-report";
import PDFDocument from "pdfkit";
import fs from "fs";
import { getCashPayTo } from "../../../model/Task/Accounting/pdc.model";

const CashDisbursement = express.Router();

CashDisbursement.get("/cash-disbursement/generate-id", async (req, res) => {
  try {
    res.send({
      message: "Successfully get cash disbursement id",
      success: true,
      generatedId: await GenerateCashDisbursementID(req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      generatedId: [],
    });
  }
});
CashDisbursement.post(
  "/cash-disbursement/get-selected-search-cash-disbursement",
  async (req, res) => {
    try {
      const selectedCashDisbursement = await findSearchSelectedCashDisbursement(
        req.body.Source_No,
        req
      );
      res.send({
        message: "Successfully get selected search in cash disbursement",
        success: true,
        selectedCashDisbursement,
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        selectedCashDisbursement: [],
        PrintDetails1: [],
        PrintDetails2: [],
      });
    }
  }
);
CashDisbursement.post(
  "/cash-disbursement/add-cash-disbursement",
  async (req, res) => {
    const { userAccess }: any = await VerifyToken(
      req.cookies["up-ac-login"] as string,
      process.env.USER_ACCESS as string
    );
    if (userAccess.includes("ADMIN")) {
      return res.send({
        message: `CAN'T ${
          req.body.hasSelected ? "UPDATE" : "SAVE"
        }, ADMIN IS FOR VIEWING ONLY!`,
        success: false,
      });
    }

    try {
      console.log(req.body.cashDisbursement);
      if (
        req.body.hasSelected &&
        !(await saveUserLogsCode(
          req,
          "edit",
          req.body.refNo,
          "Cash-Disbursement"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }

      const cashDisbursement = (await findCashDisbursement(
        req.body.refNo,
        req
      )) as Array<any>;
      if (cashDisbursement.length > 0 && !req.body.hasSelected) {
        return res.send({
          message: `${req.body.refNo} already exist!`,
          success: true,
        });
      }
      await DeleteNewCashDisbursement(req.body.refNo, req);
      await DeleteNewJournalFromCashDisbursement(req.body.refNo, req);
      req.body.cashDisbursement.forEach(async (item: any, index: number) => {
        await AddNewCashDisbursement(
          {
            Branch_Code: item.BranchCode,
            Date_Entry: req.body.dateEntry,
            Source_Type: "CV",
            Source_No: req.body.refNo,
            Explanation: req.body.explanation,
            Particulars: req.body.particulars,
            Payto: item.Payto,
            Address: item.address,
            GL_Acct: item.code,
            cGL_Acct: item.acctName,
            cSub_Acct: item.subAcctName,
            cID_No: item.ClientName,
            Debit: parseFloat(item.debit.replace(/,/g, "")),
            Credit: parseFloat(item.credit.replace(/,/g, "")),
            Check_No: item.code === "1.01.10" ? item.checkNo : "",
            Check_Date: item.code === "1.01.10" ? item.checkDate : "",
            Remarks: item.remarks,
            Sub_Acct: item.subAcct,
            ID_No: item.IDNo,
            TC: item.TC_Code,
            VAT_Type: item.vatType,
            OR_Invoice_No: item.invoice,
            VATItemNo: parseInt(item.TempID),
          },
          req
        );
        await AddNewJournalFromCashDisbursement(
          {
            Branch_Code: "HO",
            Date_Entry: req.body.dateEntry,
            Source_Type: "CV",
            Source_No: req.body.refNo,
            Explanation: req.body.explanation,
            Particulars: req.body.particulars,
            Payto: item.Payto,
            Address: item.address,
            GL_Acct: item.code,
            cGL_Acct: item.acctName,
            cSub_Acct: item.subAcctName,
            cID_No: item.ClientName,
            Debit: parseFloat(item.debit.replace(/,/g, "")),
            Credit: parseFloat(item.credit.replace(/,/g, "")),
            Check_No: item.code === "1.01.10" ? item.checkNo : "",
            Check_Date: item.code === "1.01.10" ? item.checkDate : "",
            Remarks: item.remarks,
            Sub_Acct: "HO",
            ID_No: item.IDNo,
            TC: item.TC_Code,
            VAT_Type: item.vatType,
            OR_Invoice_No: item.invoice,
            VATItemNo: parseInt(item.TempID),
            Source_No_Ref_ID: "",
          },
          req
        );
      });

      if (!req.body.hasSelected) {
        await updateCashDisbursementID(req.body.refNo.split("-")[1], req);
        await saveUserLogs(req, req.body.refNo, "add", "Cash-Disbursement");
      }

      res.send({
        message: req.body.hasSelected
          ? `Successfully update ${req.body.refNo}  in cash disbursement`
          : `Successfully add new ${req.body.refNo} in cash disbursement`,
        success: true,
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
      });
    }
  }
);
CashDisbursement.post(
  "/cash-disbursement/void-cash-disbursement",
  async (req, res) => {
    const { userAccess }: any = await VerifyToken(
      req.cookies["up-ac-login"] as string,
      process.env.USER_ACCESS as string
    );
    if (userAccess.includes("ADMIN")) {
      return res.send({
        message: `CAN'T VOID, ADMIN IS FOR VIEWING ONLY!`,
        success: false,
      });
    }

    try {
      if (
        !(await saveUserLogsCode(
          req,
          "void",
          req.body.refNo,
          "Cash-Disbursement"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }

      await DeleteNewCashDisbursement(req.body.refNo, req);
      await insertVoidJournalFromCashDisbursement(
        req.body.refNo,
        req.body.dateEntry,
        req
      );
      await DeleteNewJournalFromCashDisbursement(req.body.refNo, req);
      await insertVoidCashDisbursement(req.body.refNo, req.body.dateEntry, req);
      await saveUserLogs(req, req.body.refNo, "void", "Cash-Disbursement");
      res.send({
        message: `Successfully void ${req.body.refNo} in cash disbursement`,
        success: true,
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
      });
    }
  }
);
CashDisbursement.post("/cash-disbursement/print", async (req, res) => {
  try {
    console.log(req.body);
    if (req.body.check) {
      const outputFilePath = "manok.pdf";
      const doc = new PDFDocument({
        size: [612, 792],
        margin: 0,
      });
      const writeStream = fs.createWriteStream(outputFilePath);
      doc.pipe(writeStream);
      doc.font("Helvetica-Bold");
      doc.fontSize(9);
      const text1 = req.body.Payto;
      const __textHeight1 = doc.heightOfString(text1, { width: 310 });
      let textH1 = 53;
      if (__textHeight1 > 11) {
        textH1 = textH1 + 11 - __textHeight1;
      }
      doc.text(text1, 75, textH1, {
        align: "left",
        width: 310,
      });

      drawTextWithLetterSpacing(
        doc,
        format(new Date(req.body.checkDate), "MM"),
        430,
        25,
        2
      );
      drawTextWithLetterSpacing(
        doc,
        format(new Date(req.body.checkDate), "dd"),
        465,
        25,
        2
      );
      drawTextWithLetterSpacing(
        doc,
        format(new Date(req.body.checkDate), "yyyy"),
        500,
        25,
        5
      );
      doc.text(req.body.credit, 430, 50, {
        align: "center",
        width: 100,
      });

      const text = `${AmountToWords(
        parseFloat(req.body.credit.toString().replace(/,/g, ""))
      )}`;
      const __textHeight = doc.heightOfString(text, { width: 500 });
      let textH = 75;
      if (__textHeight > 11) {
        textH = textH + 11 - __textHeight;
      }
      doc.text(text, 50, textH, {
        align: "left",
        width: 500,
        height: __textHeight,
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
      return;
    } else {
      const PrintPayeeDetails: any = await __executeQuery(
        `
        SELECT 
      cGL_Acct AS Account,
      cSub_Acct AS SubAccount,
      cID_No AS Identity,
      FORMAT(CAST(REPLACE(Debit, ',', '') AS DECIMAL(10, 2)), 2) as Debit,
      FORMAT(CAST(REPLACE(Credit, ',', '') AS DECIMAL(10, 2)), 2) as Credit,
      Source_No AS CvNo, 
      Date_Entry AS DateApproved, 
      Payto AS PayeeName,
      Particulars, 
      Address,
      Check_No AS CheckNo,
      Check_Date AS CheckDate,
      FORMAT(CAST(REPLACE(DebitTotal, ',', '') AS DECIMAL(10, 2)), 2) as DebitTotal,
      FORMAT(CAST(REPLACE(CreditTotal, ',', '') AS DECIMAL(10, 2)), 2) as CreditTotal
      FROM 
      journal AS J 
      INNER JOIN (
        SELECT 
        Source_No AS CvNo,
        format(SUM(Debit),2) AS DebitTotal,
        format(SUM(Debit),2) AS CreditTotal 
        FROM journal WHERE
        LEFT(Explanation,7) <> '-- Void' AND 
        Source_Type = 'CV' AND 
        Source_No = '${req.body.Source_No}' GROUP BY Source_No 
      ) AS T ON J.Source_No = T.CvNo 
      WHERE LEFT(Explanation,7) <> '-- Void' AND 
        Source_Type = 'CV' AND 
        Source_No = '${req.body.Source_No}' AND 
        (Check_No IS NOT NUll AND Check_No <> '') 
      ORDER BY debit Desc, credit
      `,
        req
      );
      const PrintTable: any = await __executeQuery(
        `
      SELECT 
        cGL_Acct AS Account,
        cID_No AS Identity,
        FORMAT(CAST(REPLACE(Debit, ',', '') AS DECIMAL(10, 2)), 2) as Debit, 
        FORMAT(CAST(REPLACE(Credit, ',', '') AS DECIMAL(10, 2)), 2) as Credit
      FROM journal 
      WHERE LEFT(Explanation,7) <> '-- Void' AND
      Source_Type = 'CV' AND 
      Source_No = '${req.body.Source_No}' 
      ORDER BY Credit
      `,
        req
      );

      console.log(PrintTable);

      PrintTable.push({
        Account: "",
        Identity: "",
        Debit: formatNumber(getSum(PrintTable, "Debit")),
        Credit: formatNumber(getSum(PrintTable, "Credit")),
      });

      let PAGE_WIDTH = 612;
      let PAGE_HEIGHT = 792;
      const props: any = {
        data: PrintTable,
        BASE_FONT_SIZE: 8,
        columnWidths: [100, 295, 100, 100],
        headers: [
          { headerName: "ACCOUNT", width: "200px", textAlign: "left" },
          { headerName: "IDENTITY", width: "277px", textAlign: "left" },
          { headerName: "DEBIT", width: "100px", textAlign: "right" },
          { headerName: "CREDIT", width: "100px", textAlign: "right" },
        ],
        keys: ["Account", "Identity", "Debit", "Credit"],
        title: "",
        PAGE_WIDTH,
        PAGE_HEIGHT,
        MARGIN: { top: 420, right: 10, bottom: 120, left: 10 },
        beforeDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {
          doc.fontSize(9);
          doc.font("Helvetica-Bold");
          pdfReportGenerator.boldRow(PrintTable.length - 1);
          pdfReportGenerator.borderColumnInRow(
            PrintTable.length - 1,
            [
              { column: 0, key: "Account" },
              { column: 1, key: "Identity" },
              { column: 2, key: "Debit" },
              { column: 3, key: "Credit" },
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
          let adjustHeigth = 20;
          doc.fontSize(15);
          doc.text(req.body.reportTitle, 0, 40, {
            align: "center",
            baseline: "middle",
          });
          doc.fontSize(9);
          doc.text("1197 Edsa Katipunan Quezon City", 0, 58, {
            align: "center",
            baseline: "middle",
          });
          doc.fontSize(8);
          doc.text("Tel 374-0472 / 441-8977-78", 0, 70, {
            align: "center",
            baseline: "middle",
          });

          doc.fontSize(9);
          // first line
          doc.font("Helvetica-Bold");
          doc.text("Pay To. :", 20, 85 + adjustHeigth, {
            align: "left",
          });

          const x = 70;
          const y = 85 + adjustHeigth;

          doc.font("Helvetica");
          const textWidth = 390;
          const textHeight = doc.currentLineHeight();
          doc.text(PrintPayeeDetails[0].PayeeName, x, y, {
            align: "left",
            width: 400,
          });

          doc.font("Helvetica-Bold");
          doc.text("CV No. :", textWidth + 100, 85 + adjustHeigth, {
            align: "left",
          });

          doc.font("Helvetica");
          doc.text(
            PrintPayeeDetails[0].CvNo,
            textWidth + 100 + 40,
            85 + adjustHeigth,
            {
              align: "left",
            }
          );

          doc.font("Helvetica-Bold");
          doc.text("Address. :", 20, 110 + adjustHeigth, {
            align: "left",
          });

          doc.font("Helvetica");
          doc.text(PrintPayeeDetails[0].Address || "", x, 110 + adjustHeigth, {
            align: "left",
            width: 400,
          });

          doc.font("Helvetica-Bold");
          doc.text("Date :", textWidth + 100, 110 + adjustHeigth, {
            align: "left",
          });

          doc.font("Helvetica");
          doc.text(
            format(new Date(PrintPayeeDetails[0].DateApproved), "MM/dd/yyyy"),
            textWidth + 100 + 40,
            110 + adjustHeigth,
            {
              align: "left",
            }
          );

          doc
            .moveTo(5, 130 + adjustHeigth)
            .lineTo(PAGE_WIDTH - 10, 130 + adjustHeigth)
            .stroke();

          doc
            .moveTo(5, 145 + adjustHeigth)
            .lineTo(PAGE_WIDTH - 10, 145 + adjustHeigth)
            .stroke();

          doc
            .moveTo(450, 130 + adjustHeigth)
            .lineTo(450, 240 + adjustHeigth)
            .stroke();

          doc.font("Helvetica-Bold");
          doc.text("PARTICULARS", 5, 133 + adjustHeigth, {
            align: "center",
            width: 450,
          });

          doc.font("Helvetica-Bold");
          doc.text("AMOUNT", 460, 133 + adjustHeigth, {
            align: "center",
            width: 140,
          });

          // payment
          doc.text("In Payment for :", 20, 152 + adjustHeigth, {
            align: "left",
            width: 80,
            height: 60,
          });
          doc.font("Helvetica");
          doc.text(PrintPayeeDetails[0].Particulars, 90, 152 + adjustHeigth, {
            align: "left",
            width: 365,
            height: 60,
          });
          // end payment

          // amount total
          doc.font("Helvetica-Bold");

          doc.text(
            `PHP ${PrintPayeeDetails[0].CreditTotal}`,
            460,
            225 + adjustHeigth,
            {
              align: "center",
              width: 140,
              height: 10,
            }
          );
          // amount total end
          doc.font("Helvetica-Bold");

          // Printed Check
          doc.text("Printed Check :", 20, 222 + adjustHeigth, {
            align: "left",
            width: 80,
            height: 15,
          });
          doc.font("Helvetica");

          doc.text(
            `( ${PrintPayeeDetails[0].CheckNo} ), ${format(
              new Date(PrintPayeeDetails[0].CheckDate),
              "MM/dd/yyyy"
            )}`,
            90,
            222 + adjustHeigth,
            {
              align: "left",
              width: 365,
              height: 15,
            }
          );

          doc
            .moveTo(5, 240 + adjustHeigth)
            .lineTo(PAGE_WIDTH - 10, 240 + adjustHeigth)
            .stroke();

          // Printed Check end
          const minHeight = PAGE_HEIGHT - 140;

          doc
            .moveTo(5, minHeight)
            .lineTo(PAGE_WIDTH - 10, minHeight)
            .stroke();

          doc
            .moveTo(5, PAGE_HEIGHT - 50)
            .lineTo(PAGE_WIDTH - 10, PAGE_HEIGHT - 50)
            .stroke();

          doc
            .moveTo(5, minHeight)
            .lineTo(5, PAGE_HEIGHT - 50)
            .stroke();

          doc
            .moveTo(PAGE_WIDTH - 10, minHeight)
            .lineTo(PAGE_WIDTH - 10, PAGE_HEIGHT - 50)
            .stroke();

          // first section
          doc
            .moveTo(200, minHeight)
            .lineTo(200, PAGE_HEIGHT - 50)
            .stroke();

          doc.font("Helvetica-Bold");
          doc.text("Prepared By :", 20, minHeight + 20, {
            align: "left",
            width: 80,
          });

          doc.text("Checked By :", 20, minHeight + 55, {
            align: "left",
            width: 80,
          });

          doc.text("Approved  By :", 230, minHeight + 10, {
            align: "left",
            width: 80,
          });
          doc
            .moveTo(200, minHeight + 25)
            .lineTo(320, minHeight + 25)
            .stroke();

          // second section
          doc
            .moveTo(320, minHeight)
            .lineTo(320, PAGE_HEIGHT - 50)
            .stroke();
          // third section

          doc.fontSize(8);
          doc.font("Helvetica-Bold");
          doc.text(
            `I/We Acknowledge the receipt of the sum in Philippine Pesos`,
            330,
            PAGE_HEIGHT - 132,
            {
              align: "left",
              width: 270,
            }
          );

          doc.text(
            `${AmountToWords(
              parseFloat(
                PrintPayeeDetails[0].CreditTotal.toString().replace(/,/g, "")
              )
            )}  (P${PrintPayeeDetails[0].CreditTotal})`,
            330,
            PAGE_HEIGHT - 117,
            {
              align: "left",
              width: 270,
            }
          );

          doc.text(`Received By:`, 330, PAGE_HEIGHT - 75, {
            align: "left",
          });
          const __textHeight = doc.heightOfString(
            PrintPayeeDetails[0].PayeeName,
            { width: 115 }
          );
          doc.text(
            PrintPayeeDetails[0].PayeeName,
            385,
            PAGE_HEIGHT - 65 - __textHeight,
            {
              align: "center",
              width: 115,
              height: __textHeight,
            }
          );

          doc
            .moveTo(385, PAGE_HEIGHT - 65)
            .lineTo(500, PAGE_HEIGHT - 65)
            .stroke();

          doc.fontSize(7);
          doc.text("Printed Name", 385, PAGE_HEIGHT - 60, {
            align: "center",
            width: 115,
          });

          doc
            .moveTo(535, PAGE_HEIGHT - 65)
            .lineTo(590, PAGE_HEIGHT - 65)
            .stroke();

          doc.text("Date", 535, PAGE_HEIGHT - 60, {
            align: "center",
            width: 65,
          });

          doc.text(`Date :`, 510, PAGE_HEIGHT - 75, {
            align: "left",
            width: 100,
          });
          doc.fontSize(9);
        },
        drawPageNumber: (
          doc: PDFKit.PDFDocument,
          currentPage: number,
          totalPages: number,
          pdfReportGenerator: any
        ) => {
          doc.font("Helvetica");
          const pageNumberText = `Page ${currentPage}`;
          doc.text(
            pageNumberText,
            PAGE_WIDTH - 120,
            pdfReportGenerator.PAGE_HEIGHT - 35,
            {
              align: "right",
              width: 100,
            }
          );

          doc.text(
            format(new Date(), "MM/dd/yyyy"),
            -45,
            pdfReportGenerator.PAGE_HEIGHT - 35,
            {
              align: "right",
              width: 100,
            }
          );
        },
      };
      const pdfReportGenerator = new PDFReportGenerator(props);
      return pdfReportGenerator.generatePDF(res);
    }
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
CashDisbursement.post("/cash-disbursement/search-pay-to", async (req, res) => {
  try {
    const data = await getCashPayTo(req.body.search);
    res.send({
      data,
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      bondsPolicy: null,
    });
  }
});
CashDisbursement.post(
  "/cash-disbursement/search-cash-disbursement",
  async (req, res) => {
    try {
      res.send({
        message: "Successfully get search cash disbursement",
        success: true,
        data: await searchCashDisbursement(req.body.search, req),
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);

export function AmountToWords(amount: number) {
  const formattedAmount = amount.toFixed(2);
  const ln = formattedAmount.length - 3;
  const a = numberToWords(parseInt(formattedAmount.substring(0, ln), 10));
  const b = formattedAmount.substring(ln + 1);

  let c;
  if (b === "00") {
    c = a + " ONLY";
  } else {
    c = a + " and " + b + "/100 only";
  }

  return c.toUpperCase().trim();
}
function numberToWords(num: number) {
  if (num === 0) return "zero";

  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "ten",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const thousands = ["", "thousand", "million", "billion"];

  function numberToWordsHelper(n: any) {
    let str = "";

    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " hundred ";
      n %= 100;
    }

    if (n >= 11 && n <= 19) {
      str += teens[n - 10] + " ";
    } else {
      if (n >= 10) {
        str += tens[Math.floor(n / 10)] + " ";
      }
      n %= 10;
      if (n > 0) {
        str += ones[n] + " ";
      }
    }

    return str.trim();
  }

  let word = "";
  let i = 0;

  while (num > 0) {
    const currentPart = num % 1000;
    if (currentPart !== 0) {
      word = numberToWordsHelper(currentPart) + " " + thousands[i] + " " + word;
    }
    num = Math.floor(num / 1000);
    i++;
  }

  return word.trim();
}
const drawTextWithLetterSpacing = (
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  letterSpacing: number
) => {
  let currentX = x;

  // Loop through each character in the text
  for (let char of text) {
    doc.text(char, currentX, y, { continued: true });
    currentX += doc.widthOfString(char) + letterSpacing; // Move X position by char width + spacing
  }

  doc.text("", currentX, y); // Close the continued text
};

export default CashDisbursement;
