import express, { Response } from "express";
import {
  createPDC,
  deletePdcByRefNo,
  findPdc,
  getPdcBanks,
  getPdcPolicyIdAndCLientId,
  searchPDC,
  getSearchPDCheck,
  pdcIDGenerator,
  pdcUploads,
  pdcUploadsUpdate,
  getPdcUpload,
  checkClientID,
  getCashPayTo,
  getPdcPolicyIdAndCLientId500,
} from "../../../model/Task/Accounting/pdc.model";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import path from "path";
import fs from "fs";
import { generateUniqueFilename } from "../Claims/claims";
import { v4 as uuidV4 } from "uuid";
import { IDGenerator, UpdateId } from "../../../model/Reference/id-entry.model";
import { VerifyToken } from "../../Authentication";
import { format } from "date-fns";
import PDFReportGenerator from "../../../lib/pdf-generator";
import PDFDocument from "pdfkit";
import { __executeQuery } from "../../../model/Task/Production/policy";
const PDC = express.Router();

PDC.post("/add-pdc", async (req, res) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: `CAN'T SAVE, ADMIN IS FOR VIEWING ONLY!`,
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
    if ((await findPdc(req.body.Ref_No, req)).length > 0) {
      return res.send({ message: "REF No. Is Already Exist!", success: false });
    }
    await deletePdcByRefNo(req.body.Ref_No, req);
    const checks = JSON.parse(req.body.checks);

    checks.forEach(async (check: any) => {
      if (check.DateDeposit === "") {
        await createPDC(
          {
            Ref_No: req.body.Ref_No,
            PNo: req.body.PNo,
            IDNo: req.body.IDNo,
            Date: req.body.Date,
            Name: req.body.Name,
            Remarks: req.body.Remarks,
            Bank: check.BankCode,
            Branch: check.Branch,
            Check_Date: format(new Date(check.Check_Date), "yyyy-MM-dd"),
            Check_No: check.Check_No,
            Check_Amnt: check.Check_Amnt,
            Check_Remarks: check.Check_Remarks,
            ORNum: check.OR_No,
            PDC_Status: "Received",
          },
          req
        );
      } else {
        await createPDC(
          {
            Ref_No: req.body.Ref_No,
            PNo: req.body.PNo,
            IDNo: req.body.IDNo,
            Date: req.body.Date,
            Name: req.body.Name,
            Remarks: req.body.Remarks,
            Bank: check.BankCode,
            Branch: check.Branch,
            Check_Date: format(new Date(check.Check_Date), "yyyy-MM-dd"),
            Check_No: check.Check_No,
            Check_Amnt: check.Check_Amnt,
            Check_Remarks: check.Check_Remarks,
            SlipCode: check.Deposit_Slip,
            DateDepo: check.DateDeposit === "" ? "" : check.DateDeposit,
            ORNum: check.OR_No,
            PDC_Status: "Received",
          },
          req
        );
      }
    });

    await UpdateId(
      "pdc",
      req.body.Ref_No.split(".")[1],
      format(new Date(), "MM"),
      format(new Date(), "yy"),
      req
    );

    const uploadDir = path.join("./static/pdc", `${req.body.Ref_No}`);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true });
    }
    const files = UploadFile(req.body.fileToSave, uploadDir, res);
    await pdcUploads(
      {
        pdc_upload_id: uuidV4(),
        ref_no: req.body.Ref_No,
        upload: JSON.stringify(files),
      },
      req
    );
    await saveUserLogs(req, req.body.Ref_No, "add", "PDC");
    res.send({
      message: "Create New PDC Successfully.",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      PdcId: null,
    });
  }
});
PDC.post("/update-pdc", async (req, res) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: `CAN'T SAVE, ADMIN IS FOR VIEWING ONLY!`,
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
    if (!(await saveUserLogsCode(req, "edit", req.body.Ref_No, "PDC"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    await deletePdcByRefNo(req.body.Ref_No, req);
    const checks = JSON.parse(req.body.checks);

    checks.forEach(async (check: any) => {
      if (check.DateDeposit === "") {
        await createPDC(
          {
            Ref_No: req.body.Ref_No,
            PNo: req.body.PNo,
            IDNo: req.body.IDNo,
            Date: req.body.Date,
            Name: req.body.Name,
            Remarks: req.body.Remarks,
            Bank: check.BankCode,
            Branch: check.Branch,
            Check_Date: format(new Date(check.Check_Date), "yyyy-MM-dd"),
            Check_No: check.Check_No,
            Check_Amnt: check.Check_Amnt,
            Check_Remarks: check.Check_Remarks,
            ORNum: check.OR_No,
            PDC_Status: "Received",
          },
          req
        );
      } else {
        await createPDC(
          {
            Ref_No: req.body.Ref_No,
            PNo: req.body.PNo,
            IDNo: req.body.IDNo,
            Date: req.body.Date,
            Name: req.body.Name,
            Remarks: req.body.Remarks,
            Bank: check.BankCode,
            Branch: check.Branch,
            Check_Date: format(new Date(check.Check_Date), "yyyy-MM-dd"),
            Check_No: check.Check_No,
            Check_Amnt: check.Check_Amnt,
            Check_Remarks: check.Check_Remarks,
            SlipCode: check.Deposit_Slip,
            DateDepo: check.DateDeposit === "" ? "" : check.DateDeposit,
            ORNum: check.OR_No,
            PDC_Status: "Received",
          },
          req
        );
      }
    });

    const uploadDir = path.join("./static/pdc", `${req.body.Ref_No}`);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true });
    }
    const files = UploadFile(req.body.fileToSave, uploadDir, res);
    await pdcUploads(
      {
        pdc_upload_id: uuidV4(),
        ref_no: req.body.Ref_No,
        upload: JSON.stringify(files),
      },
      req
    );
    await saveUserLogs(req, req.body.Ref_No, "update", "PDC");
    res.send({
      message: `Update PDC REF No ${req.body.Ref_No} Successfully.`,
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      PdcId: null,
    });
  }
});
PDC.post("/search-pdc-policy-id", async (req, res) => {
  try {
    const data = await getPdcPolicyIdAndCLientId(req.body.search, req);
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
PDC.post("/search-pdc-policy-ids", async (req, res) => {
  try {
    const data = await getPdcPolicyIdAndCLientId500(req.body.search, req);
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
PDC.post("/search-pay-to", async (req, res) => {
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
PDC.get("/search-pdc-policy-id", async (req, res) => {
  try {
    const { searchPdcPolicyIds } = req.query;
    const clientsId = await getPdcPolicyIdAndCLientId(
      searchPdcPolicyIds as string,
      req
    );
    res.send({
      clientsId,
      data: clientsId,
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
PDC.post("/search-pdc-banks", async (req, res) => {
  try {
    res.send({
      data: await getPdcBanks(req.body.search, req),
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
PDC.get("/search-pdc-banks", async (req, res) => {
  try {
    const { searchPdcBanks } = req.query;
    res.send({
      pdcBanks: await getPdcBanks(searchPdcBanks as string, req),
      pdcID: await pdcIDGenerator(req),
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
PDC.get("/pdc-new-ref-number", async (req, res) => {
  try {
    res.send({
      RefNo: await pdcIDGenerator(req),
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      RefNo: [],
    });
  }
});
PDC.post("/search-pdc", async (req, res) => {
  try {
    const data = await searchPDC(req.body.search as string, req);
    res.send({
      message: "Search PDC Successfully",
      success: true,
      data,
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      searchPDC: [],
    });
  }
});
PDC.post("/get-search-pdc-check", async (req, res) => {
  try {
    const searchPDCData = await getSearchPDCheck(req.body.ref_no, req);
    res.send({
      message: "Search PDC Check Successfully",
      success: true,
      getSearchPDCCheck: searchPDCData,
      upload: await getPdcUpload(req.body.ref_no, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      getSearchPDCCheck: [],
    });
  }
});

PDC.post("/print", async (req, res) => {
  try {
    if (req.body.printOption === "labeling") {
      const outputFilePath = "manok.pdf";
      const doc = new PDFDocument({
        size: [612, 792],
        margin: 0,
      });
      const writeStream = fs.createWriteStream(outputFilePath);
      doc.pipe(writeStream);
      doc.fontSize(9);
      doc.text(req.body.state.department, 0, 40, {
        align: "center",
        baseline: "middle",
      });
      doc.text(req.body.state.name, 0, 52, {
        align: "center",
        baseline: "middle",
      });
      doc.text(req.body.state.pno, 0, 64, {
        align: "center",
        baseline: "middle",
      });

      doc.text(req.body.state.ref, 0, 94, {
        align: "center",
        baseline: "middle",
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
      const newData = req.body.pdcTableData.map((itm: any, idx: number) => {
        return { ...itm, seq: idx + 1 < 10 ? `0${idx + 1}` : idx + 1 };
      });

      let PAGE_WIDTH = 612;
      let PAGE_HEIGHT = 792;

      const headers = [
        {
          label: "CHECK NO",
          key: "Check_No",
          style: { align: "left", width: 60 },
        },
        {
          label: "DATE",
          key: "Check_Date",
          style: { align: "left", width: 60 },
        },
        {
          label: "BANK",
          key: "BankName",
          style: { align: "left", width: 170 },
        },
        {
          label: "BRANCH",
          key: "Branch",
          style: { align: "left", width: 170 },
        },
        {
          label: "AMOUNT",
          key: "Check_Amnt",
          style: { align: "right", width: 80 },
        },
        { label: "SEQ", key: "seq", style: { align: "right", width: 30 } },
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
      doc.text("Post Date Checks Receipt", 0, 52, {
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
      doc.text(req.body.state.Ref_No, PAGE_WIDTH - 80, 85, {
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
      doc.font("Helvetica-Bold");
      doc.text("Date Received :", PAGE_WIDTH - 150, 100, {
        align: "left",
      });
      doc.font("Helvetica");
      doc.text(req.body.state.Date, PAGE_WIDTH - 80, 100, {
        align: "left",
      });
      // third line
      doc.font("Helvetica-Bold");
      doc.text("Remarks :", 20, 115, {
        align: "left",
      });
      doc.font("Helvetica");
      doc.text(req.body.state.Remarks, 85, 115, {
        align: "left",
        width: PAGE_WIDTH - 150,
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
        .moveTo(20, yAxis + 12)
        .lineTo(PAGE_WIDTH - 20, yAxis + 12)
        .stroke();

      yAxis += 17;

      doc.font("Helvetica");

      newData.forEach((rowItm: any, rowIndex: number) => {
        const rowHeight = Math.max(
          ...headers.map((itm: any) => {
            return doc.heightOfString(rowItm[itm.key], {
              width: itm.style.width,
              align: itm.style.align,
            });
          })
        );
        let x = 20;
        headers.forEach((colItm: any, colIndex: number) => {
          doc.text(rowItm[colItm.key], x, yAxis, {
            align: colItm.style.align,
            width: colItm.style.width,
          });
          x += colItm.style.width;
        });

        yAxis += rowHeight + 3;
      });
      let xs = 10;
      doc.text(
        `Prepared : _______________________`,
        20 + xs,
        PAGE_HEIGHT - 70,
        {
          align: "left",
          width: 200,
        }
      );

      doc.text(
        `Checked : _______________________`,
        20 + xs + 200,
        PAGE_HEIGHT - 70,
        {
          align: "left",
          width: 200,
        }
      );

      doc.text(
        `Approved : _______________________`,
        20 + xs + 400,
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
    }
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

function UploadFile(filesArr: Array<any>, uploadDir: string, res: Response) {
  const obj: any = [];
  filesArr.forEach((file: any) => {
    let specFolder = "";

    const uploadSpecFolder = path.join(uploadDir, specFolder);
    const uniqueFilename = generateUniqueFilename(file.fileName);
    if (!fs.existsSync(uploadSpecFolder)) {
      fs.mkdirSync(uploadSpecFolder, { recursive: true });
    }
    const filePath = path.join(uploadSpecFolder, uniqueFilename);
    const base64Data = file.fileContent.replace(/^data:.*;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.log("qweqw2");
        console.log(err);
        res.send({ message: err.message, success: false });
        return;
      }
    });
    obj.push({
      fileName: file.fileName,
      uniqueFilename,
      datakey: file.datakey,
      fileType: file.fileType,
    });
  });
  return obj;
}

export default PDC;
