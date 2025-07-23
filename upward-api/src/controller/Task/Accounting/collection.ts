import express, { Response } from "express";
import {
  TransactionAndChartAccount,
  collectionIDGenerator,
  createCollection,
  createJournal,
  deleteCollection,
  deleteFromJournalToCollection,
  findORnumber,
  getClientCheckedList,
  getCollections,
  getDrCodeAndTitle,
  getOutputTax,
  getSearchCheckFromClientId,
  getSearchCollection,
  getTransactionBanksDetails,
  getTransactionBanksDetailsDebit,
  getTransactionDescription,
  printModel,
  searchCheckFromClientId,
  updateCollectionIDSequence,
  updatePDCCheck,
} from "../../../model/Task/Accounting/collection.model";

import { format } from "date-fns";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { qry_id_policy_sub } from "../../../model/db/views";
import { executeQuery } from "../../../model/Task/Production/policy";
import { defaultFormat } from "../../../lib/defaultDateFormat";
import { checkClientID } from "../../../model/Task/Accounting/pdc.model";
import PDFDocument from "pdfkit";
import fs from "fs";
import { AmountToWords } from "./cash-disbursement";
import { getSum } from "../../Reports/Production/production-report";

const Collection = express.Router();

/// NEW
Collection.post("/search-checks-from-client-id", async (req, res) => {
  try {
    console.log(req.body);
    const data = await searchCheckFromClientId(req.body.search, req.body.PNo);
    res.send({
      message: "get Data Successfully",
      success: true,
      data,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      clientCheckedList: [],
    });
  }
});
Collection.post("/get-search-checks-from-client-id", async (req, res) => {
  try {
    console.log(req.body);

    const data = await getSearchCheckFromClientId(
      req.body.checkNo,
      req.body.PNo
    );
    res.send({
      message: "get Data Successfully",
      success: true,
      data,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      clientCheckedList: [],
    });
  }
});
Collection.get("/get-data-from-output-tax", async (req, res) => {
  try {
    res.send({
      message: "get Data Successfully",
      success: true,
      data: await getOutputTax(),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      clientCheckedList: [],
    });
  }
});

/// OLD
Collection.get("/get-client-checked-by-id", async (req, res) => {
  const { PNo, searchCheckedList } = req.query;

  try {
    const data1 = await getClientCheckedList(
      searchCheckedList as string,
      PNo as string,
      req
    );
    res.send({
      message: "get Data Successfully",
      success: true,
      clientCheckedList: JSON.parse(
        JSON.stringify(data1, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      ),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      clientCheckedList: [],
    });
  }
});
Collection.get("/get-transaction-code-title", async (req, res) => {
  try {
    res.send({
      message: "Get Data Successfully",
      success: true,
      banktransaction: await getTransactionBanksDetails(req),
      transactionDesc: await getTransactionDescription(req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      banktransaction: [],
      transactionDesc: [],
    });
  }
});
Collection.get("/get-new-or-number", async (req, res) => {
  try {
    res.send({
      message: "Get New OR Number Successfully",
      success: true,
      ORNo: await collectionIDGenerator(req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      ORNo: [],
    });
  }
});
Collection.post("/add-collection", async (req, res) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  const client = (await checkClientID(req.body.PNo, req)) as Array<any>;
  if (client.length <= 0) {
    return res.send({
      message: `${req.body.PNo} is not Found!`,
      success: false,
      collectionID: null,
    });
  }
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: `CAN'T SAVE, ADMIN IS FOR VIEWING ONLY!`,
      success: false,
    });
  }

  try {
    const isFind = await findORnumber(req.body.ORNo, req);
    if (isFind.length > 0) {
      return res.send({
        message: `${req.body.ORNo} Already Exists!`,
        success: false,
        collectionID: null,
      });
    }

    AddCollection(req);
    await updateCollectionIDSequence(
      {
        last_count: req.body.ORNo,
        year: req.body.ORNo.split(".")[0].slice(0, 2),
        month: req.body.ORNo.split(".")[0].slice(-2),
      },
      req
    );
    const newID = await collectionIDGenerator(req);
    await saveUserLogs(req, req.body.ORNo, "add", "Collection");
    res.send({
      message: "Create Collection Successfully!",
      success: true,
      collectionID: newID,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      collectionID: null,
    });
  }
});
Collection.post("/get-collection-data-search", async (req, res) => {
  try {
    res.send({
      message: "Search Collection Successfully",
      success: true,
      collection: await getSearchCollection(req.body.ORNo as string, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      collection: [],
    });
  }
});
Collection.get("/search-collection", async (req, res) => {
  const { searchCollectionInput } = req.query;
  try {
    console.log(searchCollectionInput);
    res.send({
      message: "Search Collection Successfully",
      success: true,
      collection: await getCollections(searchCollectionInput as string, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      collection: [],
    });
  }
});
Collection.post("/search-collection", async (req, res) => {
  try {
    res.send({
      message: "Search Collection Successfully",
      success: true,
      data: await getCollections(req.body.search, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      collection: [],
    });
  }
});
Collection.post("/update-collection", async (req, res) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: `CAN'T UPDATE, ADMIN IS FOR VIEWING ONLY!`,
      success: false,
    });
  }

  const client = (await checkClientID(req.body.PNo, req)) as Array<any>;
  if (client.length <= 0) {
    return res.send({
      message: `${req.body.PNo} is not Found!`,
      success: false,
      collectionID: null,
    });
  }

  try {
    if (!(await saveUserLogsCode(req, "edit", req.body.ORNo, "Collection"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    await deleteCollection(req.body.ORNo, req);
    AddCollection(req);
    res.send({
      message: "Update Collection Successfully!",
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
Collection.post("/get-drcode-drtitle-from-collection", async (req, res) => {
  try {
    console.log(req.body);
    const data = await getDrCodeAndTitle(req.body.code, req);
    res.send({
      message: "get DR Code and DR Title Collection Successfully!",
      success: true,
      data,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Collection.post("/print-or", async (req, res) => {
  try {
    const dataCollection = (await getSearchCollection(
      req.body.ORNo as string,
      req
    )) as Array<any>;
    const debit: Array<any> = [];
    const credit: Array<any> = [];

    const ORNo = dataCollection[0].ORNo;
    const Date_OR = dataCollection[0].Date_OR;
    const ID_No = dataCollection[0].CRLoanID;
    const CRLoanName = dataCollection[0].CRLoanName;

    for (let i = 0; i <= dataCollection.length - 1; i++) {
      if (
        dataCollection[i].Payment !== null &&
        dataCollection[i].Payment.toString() !== ""
      ) {
        const isCash = dataCollection[i].Payment === "Cash";
        debit.push({
          Payment: dataCollection[i].Payment,
          Amount: formatNumber(
            parseFloat(dataCollection[i].Debit.toString().replace(/,/g, ""))
          ),
          Check_No: isCash ? "" : dataCollection[i].Check_No,
          Check_Date: isCash
            ? ""
            : format(new Date(dataCollection[i].Check_Date), "yyyy-MM-dd"),
          Bank_Branch: isCash ? "" : dataCollection[i].Bank,
          Acct_Code: dataCollection[i].DRCode,
          Acct_Title: dataCollection[i].DRTitle,
          Deposit_Slip: dataCollection[i].SlipCode,
          Cntr: "",
          Remarks: dataCollection[i].DRRemarks,
          TC: isCash ? "CSH" : "CHK",
          Bank: dataCollection[i].Bank_Code,
          BankName: dataCollection[i].BankName,
        });
      }

      if (
        dataCollection[i].Purpose !== null &&
        dataCollection[i].Purpose.toString() !== ""
      ) {
        credit.push({
          temp_id: `${i}`,
          transaction: dataCollection[i].Purpose,
          amount: formatNumber(
            parseFloat(dataCollection[i].Credit.toString().replace(/,/g, ""))
          ),
          Remarks: dataCollection[i].CRRemarks,
          Code: dataCollection[i].CRCode,
          Title: dataCollection[i].CRTitle,
          TC: dataCollection[i].TC,
          Account_No: dataCollection[i].CRLoanID,
          Name: dataCollection[i].CRLoanName,
          VATType: dataCollection[i].CRVATType,
          invoiceNo: dataCollection[i].CRInvoiceNo,
        });
      }
    }

    const dataToPrint = {
      ORNo,
      Date_OR,
      ID_No,
      CRLoanName,
      debit,
      credit,
    };
    const PAGE_WIDTH = 612;
    const PAGE_HEIGHT = 792;
    const outputFilePath = "manok.pdf";
    const doc = new PDFDocument({
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      margin: 0,
    });

    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);
    const totalHeight = drawOfficialReceiptPDF({
      res,
      doc,
      writeStream,
      PAGE_HEIGHT,
      PAGE_WIDTH,
      outputFilePath,
      footerText: "Original Copy",
      dataToPrint,
      reportTitle: req.body.reportTitle,
    });
    const PAGE_HEIGHT__ = PAGE_HEIGHT / 2 - 20;
    if (totalHeight > PAGE_HEIGHT__) {
      doc.addPage();
      drawOfficialReceiptPDF({
        res,
        doc,
        writeStream,
        PAGE_HEIGHT,
        PAGE_WIDTH,
        outputFilePath,
        footerText: "Duplicate Copy",
        dataToPrint,
        reportTitle: req.body.reportTitle,
      });
      doc.addPage();
      drawOfficialReceiptPDF({
        res,
        doc,
        writeStream,
        PAGE_HEIGHT,
        PAGE_WIDTH,
        outputFilePath,
        footerText: "Triplicate Copy",
        dataToPrint,
        reportTitle: req.body.reportTitle,
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
      drawOfficialReceiptPDF({
        res,
        doc,
        writeStream,
        PAGE_HEIGHT,
        PAGE_WIDTH,
        outputFilePath,
        footerText: "Duplicate Copy",
        dataToPrint,
        adjustHeigth: PAGE_HEIGHT / 2,
        dashOn: true,
        reportTitle: req.body.reportTitle,
      });
      doc.addPage();
      drawOfficialReceiptPDF({
        res,
        doc,
        writeStream,
        PAGE_HEIGHT,
        PAGE_WIDTH,
        outputFilePath,
        footerText: "Triplicate Copy",
        dataToPrint,
        reportTitle: req.body.reportTitle,
      });
    }

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
    console.log(error);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
function drawOfficialReceiptPDF({
  res,
  doc,
  writeStream,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  outputFilePath,
  footerText,
  dataToPrint,
  adjustHeigth = 0,
  dashOn = false,
  reportTitle,
}: any) {
  if (dashOn) {
    doc
      .dash(2, { space: 4 }) // dot size: 2, space: 4
      .moveTo(10, 0 + adjustHeigth) // starting point
      .lineTo(PAGE_WIDTH - 10, 0 + adjustHeigth) // ending point
      .stroke();

    doc.undash();
  }

  doc.fontSize(10);
  doc.font("Helvetica-Bold");
  doc.text(reportTitle, 0, 45 + adjustHeigth, {
    align: "center",
    baseline: "middle",
  });
  doc.fontSize(8);
  doc.font("Helvetica");
  doc.text(
    "No. 1197 Azure Business Center EDSA-Munoz, Katipunan, Quezon City",
    0,
    62 + adjustHeigth,
    {
      align: "center",
      baseline: "middle",
    }
  );
  doc.text("Tel. No. 8921-0154 / upward.csmi@gmail.com", 0, 74 + adjustHeigth, {
    align: "center",
    baseline: "middle",
  });

  doc.fontSize(9);
  doc.font("Helvetica-Bold");
  doc.text("COLLECTION RECEIPT", 5, 105 + adjustHeigth, {
    align: "left",
  });
  const txtOR = `No: ${dataToPrint.ORNo}`;
  const textWidth = doc.widthOfString(txtOR);

  doc.text(txtOR, PAGE_WIDTH - (textWidth + 5), 105 + adjustHeigth, {
    align: "left",
    width: textWidth + 5,
  });

  //SECTION 1
  // ======================
  doc
    .moveTo(5, 145 + adjustHeigth)
    .lineTo(PAGE_WIDTH - 5, 145 + adjustHeigth)
    .stroke();

  doc
    .moveTo(PAGE_WIDTH - 200, 120 + adjustHeigth)
    .lineTo(PAGE_WIDTH - 200, 145 + adjustHeigth)
    .stroke();
  doc.font("Helvetica");
  doc.fontSize(8);
  doc.text("Payor's Name & I.D. No:", 10, 125 + adjustHeigth, {
    align: "left",
    width: 110,
  });
  doc.fontSize(9);
  doc.font("Helvetica-Bold");
  const idNoText = `${dataToPrint.CRLoanName} (${dataToPrint.ID_No})`;
  autoAdjustTextHeigth(doc, idNoText, 112, 128 + adjustHeigth, 290, 22);
  doc.fontSize(8);
  doc.font("Helvetica");
  doc.text("Transaction Date:", PAGE_WIDTH - 190, 125 + adjustHeigth, {
    align: "left",
    width: 80,
  });
  doc.fontSize(9);
  doc.font("Helvetica-Bold");
  doc.text(
    format(new Date(dataToPrint.Date_OR), "MMMM dd, yyyy"),
    PAGE_WIDTH - 110,
    128 + adjustHeigth,
    {
      align: "left",
      width: 100,
    }
  );

  // ======================

  //SECTION 2
  // ======================
  doc
    .moveTo(5, 170 + adjustHeigth)
    .lineTo(PAGE_WIDTH - 5, 170 + adjustHeigth)
    .stroke();
  doc.fontSize(8);
  doc.font("Helvetica");
  doc.text("Payor's Address:", 10, 150 + adjustHeigth, {
    align: "left",
    width: 110,
  });
  doc.fontSize(9);
  doc.font("Helvetica-Bold");
  const addressText = dataToPrint.PayorAddress ?? "";
  autoAdjustTextHeigth(
    doc,
    addressText,
    112,
    153 + adjustHeigth,
    PAGE_WIDTH - 135,
    22
  );

  // ======================

  //SECTION 3
  // ======================
  doc
    .moveTo(5, 195 + adjustHeigth)
    .lineTo(PAGE_WIDTH - 5, 195 + adjustHeigth)
    .stroke();
  doc.fontSize(8);
  doc.font("Helvetica");
  doc.text("Amount Received:", 10, 175 + adjustHeigth, {
    align: "left",
    width: 75,
  });
  doc.fontSize(9);
  const wordsTobumText = AmountToWords(getSum(dataToPrint.debit, "Amount"));
  doc.font("Helvetica-Bold");
  autoAdjustTextHeigth(doc, wordsTobumText, 112, 178 + adjustHeigth, 350, 22);
  doc.fontSize(11);
  doc.text(
    `(Php ${formatNumber(getSum(dataToPrint.debit, "Amount"))})`,
    460,
    178 + adjustHeigth,
    {
      align: "center",
      width: 120,
    }
  );
  doc.fontSize(9);

  // ======================

  // SECTION 4
  // ======================

  doc.font("Helvetica");
  doc.fontSize(8);
  doc.text("Items Paid:", 10, 205 + adjustHeigth, {
    align: "left",
    width: 60,
  });
  // account
  doc.fontSize(9);
  doc.font("Helvetica-Bold");
  let rowH = 0;
  for (let index = 0; index < dataToPrint.credit.length; index++) {
    autoAdjustTextHeigth(
      doc,
      dataToPrint.credit[index].Title,
      112,
      210 + rowH + adjustHeigth,
      150,
      22
    );

    autoAdjustTextHeigth(
      doc,
      dataToPrint.credit[index].amount,
      410,
      210 + rowH + adjustHeigth,
      150,
      22,
      "right"
    );
    rowH += 13;
  }
  rowH += 12;
  doc.font("Helvetica");
  doc.text("Total :", 10, 200 + rowH + adjustHeigth, {
    align: "left",
    width: 60,
  });
  doc.font("Helvetica-Bold");

  // top
  doc.text(
    formatNumber(getSum(dataToPrint.credit, "amount")),
    410,
    200 + rowH + adjustHeigth,
    {
      align: "right",
      width: 150,
    }
  );

  rowH += 15;
  doc
    .moveTo(5, 200 + rowH + adjustHeigth)
    .lineTo(PAGE_WIDTH - 5, 200 + rowH + adjustHeigth)
    .stroke();

  doc.font("Helvetica");
  doc.fontSize(8);
  // ======================

  //SECTION 5
  // ======================

  let adjsutH = 0;
  doc.text("Form of Payment:", 10, 210 + rowH + adjsutH + adjustHeigth, {
    align: "left",
    width: 80,
  });
  doc.font("Helvetica-Bold");

  for (let index = 0; index < dataToPrint.debit.length; index++) {
    autoAdjustTextHeigth(
      doc,
      dataToPrint.debit[index].Payment.toLowerCase() === "cash"
        ? dataToPrint.debit[index].Payment
        : `${dataToPrint.debit[index].Payment}    ${format(
            new Date(dataToPrint.debit[index].Check_Date),
            "MM/dd/yyyy"
          )} - ${dataToPrint.debit[index].Check_No} - ${
            dataToPrint.debit[index].Bank_Branch
          }`,
      112,
      215 + rowH + adjustHeigth,
      400,
      22
    );
    console.log(dataToPrint.debit[index]);

    autoAdjustTextHeigth(
      doc,
      dataToPrint.debit[index].Amount,
      160,
      215 + rowH + adjustHeigth,
      400,
      22,
      "right"
    );

    rowH += 13;
  }

  doc.font("Helvetica");
  doc.fontSize(8);
  doc.text("Total :", 10, 220 + rowH + adjsutH + adjustHeigth, {
    align: "left",
    width: 80,
  });
  doc.font("Helvetica-Bold");
  doc.fontSize(8);

  doc.text(
    formatNumber(getSum(dataToPrint.debit, "Amount")),
    410,
    220 + rowH + adjustHeigth,
    {
      align: "right",
      width: 150,
    }
  );

  rowH += 13;
  doc
    .moveTo(5, 230 + rowH + adjustHeigth)
    .lineTo(PAGE_WIDTH - 5, 230 + rowH + adjustHeigth)
    .stroke();

  // //SECTION 6
  // // ======================
  doc
    .moveTo(5, 260 + rowH + adjustHeigth)
    .lineTo(PAGE_WIDTH - 5, 260 + rowH + adjustHeigth)
    .stroke();

  doc.text(
    "Cashier's Name & Signature / Date:",
    10,
    235 + rowH + adjustHeigth,
    {
      align: "left",
      width: 250,
    }
  );

  // // ======================

  //SECTION 7
  // ======================
  doc.text(
    "Payor's Acknowledgement Signature / Date:",
    10,
    270 + rowH + adjustHeigth,
    {
      align: "left",
      width: 250,
    }
  );

  // ======================
  // TOP
  doc
    .moveTo(5, 120 + adjustHeigth)
    .lineTo(PAGE_WIDTH - 5, 120 + adjustHeigth)
    .stroke();

  doc
    .moveTo(5, 120 + adjustHeigth)
    .lineTo(5, 290 + rowH + adjustHeigth)
    .stroke(); //LEFT

  doc
    .moveTo(PAGE_WIDTH - 5, 120 + adjustHeigth)
    .lineTo(PAGE_WIDTH - 5, 290 + rowH + adjustHeigth)
    .stroke(); //RIGTH

  // BOTTOM
  doc
    .moveTo(5, 290 + rowH + adjustHeigth)
    .lineTo(PAGE_WIDTH - 5, 290 + rowH + adjustHeigth)
    .stroke();

  doc.fontSize(8);
  doc.font("Helvetica-Bold");
  doc.text(
    `Printed: ${format(new Date(), "MM/dd/yyyy, hh:mm a")}`,
    5,
    295 + rowH + adjustHeigth,
    {
      align: "left",
      width: 300,
    }
  );

  const textWidth1 = doc.widthOfString(footerText);
  doc.text(
    footerText,
    PAGE_WIDTH - (textWidth1 + 5),
    295 + rowH + adjustHeigth,
    {
      align: "left",
      width: textWidth1 + 5,
    }
  );
  const totalHeight = 295 + rowH + adjustHeigth;

  return totalHeight;
}
function autoAdjustTextHeigth(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  align: "center" | "left" | "justify" | "right" | undefined = "left"
) {
  const idNoTextH = doc.heightOfString(text, {
    align: "left",
    width,
    height,
  });
  let adjustIDNoTextH = 0;
  if (idNoTextH > 11) {
    adjustIDNoTextH = 5;
  }
  doc.text(text, x, y - adjustIDNoTextH, {
    align,
    width,
    height,
  });
}
async function AddCollection(req: any) {
  const { IDEntryWithPolicy } = qry_id_policy_sub();
  const getClientSubAccount: any = await executeQuery(
    IDEntryWithPolicy,
    req.body.PNo,
    req
  );

  const debit = JSON.parse(req.body.debit);
  const credit = JSON.parse(req.body.credit);

  const TotalRows =
    debit.length >= credit.length ? debit.length : credit.length;

  for (let i = 0; i <= TotalRows - 1; i++) {
    let Payment = "";
    let Debit = "0";
    let CheckNo = "";
    let CheckDate = "";
    let Bank = "";
    let DRCode = "";
    let DRTitle = "";
    let SlipCode = "";
    let DRCtr = "";
    let DRRemarks = "";
    let Purpose = "";
    let Credit = "0";
    let CRRemarks = "";
    let CRCode = "";
    let CRTitle = "";
    let CRLoanID = "";
    let CRLoanName = "";
    let CRVatType = "";
    let CRInvoiceNo = "";

    if (i <= debit.length - 1) {
      Payment = debit[i].Payment;
      Debit = debit[i].Amount;
      CheckNo = debit[i].Check_No;
      CheckDate = debit[i].Check_Date
        ? defaultFormat(new Date(debit[i].Check_Date))
        : "";
      Bank = debit[i].Bank_Branch;
      DRCode = debit[i].Acct_Code;
      DRTitle = debit[i].Acct_Title;
      SlipCode = debit[i].Deposit_Slip;
      DRCtr = debit[i].Cntr;
      DRRemarks = debit[i].Remarks;
    }
    if (i <= credit.length - 1) {
      Purpose = credit[i].transaction;
      Credit = credit[i].amount;
      CRRemarks = credit[i].Remarks;
      CRCode = credit[i].Code;
      CRTitle = credit[i].Title;
      CRLoanID = credit[i].Account_No;
      CRLoanName = credit[i].Name;
      CRVatType = credit[i].VATType;
      CRInvoiceNo = credit[i].invoiceNo;
    }

    const ColDate = i === 0 ? defaultFormat(new Date(req.body.Date)) : null;
    const OR = i === 0 ? req.body.ORNo : "";
    const PNo = i === 0 ? req.body.PNo : "";
    const Name = i === 0 ? req.body.Name : "";

    const newCollection = {
      Date: ColDate,
      ORNo: OR,
      IDNo: PNo,
      Name: Name,
      Payment: Payment,
      Debit: Debit,
      Check_No: CheckNo,
      Check_Date: CheckDate,
      Bank: Bank,
      DRCode: DRCode,
      DRTitle: DRTitle,
      SlipCode: SlipCode,
      DRRemarks: DRRemarks,
      Purpose: Purpose,
      Credit: Credit,
      CRRemarks: CRRemarks,
      CRCode: CRCode,
      CRTitle: CRTitle,
      CRLoanID: CRLoanID,
      CRLoanName: CRLoanName,
      ID_No: req.body.PNo,
      Official_Receipt: req.body.ORNo,
      Temp_OR: `${req.body.ORNo}${(i + 1).toString().padStart(2, "0")}`,
      Status: "HO",
      Date_OR: defaultFormat(new Date(req.body.Date)),
      Short: req.body.Name,
      CRVATType: CRVatType,
      CRInvoiceNo: CRInvoiceNo,
    };

    await createCollection(newCollection, req);

    if (i <= debit.length - 1) {
      if (debit[i].Payment.trim().toLowerCase() === "check") {
        await updatePDCCheck(
          {
            ORNum: OR.toUpperCase(),
            PNo: req.body.PNo,
            CheckNo: CheckNo,
          },
          req
        );
      }
    }
  }

  await deleteFromJournalToCollection(req.body.ORNo, req);
  for (let i = 0; i <= debit.length - 1; i++) {
    const [transaction] = (await getTransactionBanksDetailsDebit(
      debit[i].TC,
      req
    )) as Array<any>;

    const Payment = debit[i].Payment;
    const Debit = debit[i].Amount;
    const CheckNo = debit[i].Check_No ?? "";
    const CheckDate = debit[i].Check_Date
      ? defaultFormat(new Date(debit[i].Check_Date))
      : "";
    const Bank = debit[i].Bank_Branch ?? "";
    const DRCode = transaction.Acct_Code;
    const DRTitle = transaction.Acct_Title;
    const DRRemarks = debit[i].TC;

    await createJournal(
      {
        Branch_Code: "HO",
        Date_Entry: defaultFormat(new Date(req.body.Date)),
        Source_Type: "OR",
        Source_No: req.body.ORNo,
        Explanation: `${Payment} Collection at Head Office`,
        Check_No: CheckNo,
        Check_Date: CheckDate,
        Check_Bank: Bank,
        Payto: req.body.Name,
        GL_Acct: DRCode,
        cGL_Acct: DRTitle,
        Sub_Acct: getClientSubAccount[0]?.Sub_Acct,
        cSub_Acct: getClientSubAccount[0]?.ShortName,
        ID_No: req.body.PNo,
        cID_No: req.body.Name,
        Debit: Debit.replaceAll(",", ""),
        TC: DRRemarks,
        Source_No_Ref_ID: "",
      },
      req
    );
  }

  for (let i = 0; i <= credit.length - 1; i++) {
    const Purpose = credit[i].transaction;
    const Credit = credit[i].amount;
    const CRRemarks = credit[i].Remarks;
    const CRCode = credit[i].Code;
    const CRTitle = credit[i].Title;
    const CRVatType = credit[i].VATType;
    const CRInvoiceNo = credit[i].invoiceNo;

    const CRLoanID = credit[i].Account_No;
    const CRLoanName = credit[i].Name;
    const TC = credit[i].TC;

    await createJournal(
      {
        Branch_Code: "HO",
        Date_Entry: defaultFormat(new Date(req.body.Date)),
        Source_Type: "OR",
        Source_No: req.body.ORNo,
        GL_Acct: CRCode,
        cGL_Acct: CRTitle,
        ID_No: CRLoanID,
        cID_No: CRLoanName,
        Explanation: Purpose,
        Sub_Acct: getClientSubAccount[0]?.Sub_Acct,
        cSub_Acct: getClientSubAccount[0]?.ShortName,
        Credit: Credit.replaceAll(",", ""),
        Remarks: CRRemarks,
        TC: TC,
        VAT_Type: CRVatType,
        OR_Invoice_No: CRInvoiceNo,
        Source_No_Ref_ID: "",
      },
      req
    );
  }
}
export function formatNumber(num: number) {
  return (num || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
export default Collection;


