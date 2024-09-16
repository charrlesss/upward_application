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

  try {
    if ((await findPdc(req.body.Ref_No, req)).length > 0) {
      return res.send({ message: "REF No. Is Already Exist!", success: false });
    }
    await deletePdcByRefNo(req.body.Ref_No, req);
    const checks = JSON.parse(req.body.checks);
    let num = 0;
    const id = await IDGenerator("chk", "pdc-chk", req);

    const year = format(new Date(), "yy");
    const month = format(new Date(), "MM");
    const count = id.split("-")[2];
    num = parseInt(count, 10);
    let newId = "";
    checks.forEach(async (check: any) => {
      newId = "chk-" + num.toString().padStart(count.length, "0");
      num++;
      if (check.DateDeposit === "") {
        await createPDC(
          {
            PDC_ID: newId,
            Ref_No: req.body.Ref_No,
            PNo: req.body.PNo,
            IDNo: req.body.IDNo,
            Date: new Date(req.body.Date),
            Name: req.body.Name,
            Remarks: req.body.Remarks,
            Bank: check.BankCode,
            Branch: check.Branch,
            Check_Date: new Date(check.Check_Date),
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
            PDC_ID: newId,
            Ref_No: req.body.Ref_No,
            PNo: req.body.PNo,
            IDNo: req.body.IDNo,
            Date: new Date(req.body.Date),
            Name: req.body.Name,
            Remarks: req.body.Remarks,
            Bank: check.BankCode,
            Branch: check.Branch,
            Check_Date: new Date(check.Check_Date),
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
    await UpdateId("pdc-chk", newId.split("-")[1], month, year, req);
    await UpdateId("pdc", req.body.Ref_No.split(".")[1],  month,year, req);
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
    const newPdcId = await pdcIDGenerator(req);
    await saveUserLogs(req, req.body.Ref_No, "add", "PDC");
    res.send({
      message: "Create New PDC Successfully.",
      success: true,
      PdcId: newPdcId,
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
      message: `CAN'T UPDATE, ADMIN IS FOR VIEWING ONLY!`,
      success: false,
    });
  }

  try {
    if (!(await saveUserLogsCode(req, "edit", req.body.Ref_No, "PDC"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    if ((await findPdc(req.body.Ref_No, req)).length <= 0) {
      return res.send({
        message: "REF No. you try to update is not exist!",
        success: false,
      });
    }

    await deletePdcByRefNo(req.body.Ref_No, req);
    const checks = JSON.parse(req.body.checks);
    let num = 0;
    const id = await IDGenerator("pdc", "pdc", req);
    const year = format(new Date(), "yy");
    const month = format(new Date(), "MM");
    const count = id.split("-")[2];
    num = parseInt(count, 10);
    let newId = "";
    checks.forEach(async (check: any) => {
      newId = num.toString().padStart(count.length, "0");
      num++;

      if (check.DateDeposit === "") {
        await createPDC(
          {
            PDC_ID: newId,
            Ref_No: req.body.Ref_No,
            PNo: req.body.PNo,
            IDNo: req.body.IDNo,
            Date: new Date(req.body.Date),
            Name: req.body.Name,
            Remarks: req.body.Remarks,
            Bank: check.BankCode,
            Branch: check.Branch,
            Check_Date: new Date(check.Check_Date),
            Check_No: check.Check_No,
            Check_Amnt: check.Check_Amnt.replaceAll(",", ""),
            Check_Remarks: check.Check_Remarks,
            ORNum: check.OR_No,
            PDC_Status: "Received",
          },
          req
        );
      } else {
        await createPDC(
          {
            PDC_ID: newId,
            Ref_No: req.body.Ref_No,
            PNo: req.body.PNo,
            IDNo: req.body.IDNo,
            Date: new Date(req.body.Date),
            Name: req.body.Name,
            Remarks: req.body.Remarks,
            Bank: check.BankCode,
            Branch: check.Branch,
            Check_Date: new Date(check.Check_Date),
            Check_No: check.Check_No,
            Check_Amnt: check.Check_Amnt.replaceAll(",", ""),
            Check_Remarks: check.Check_Remarks,
            SlipCode: req.body.Deposit_Slip,
            DateDepo:
              req.body.DateDeposit && req.body.DateDeposit !== ""
                ? new Date(req.body.DateDeposit)
                : undefined,
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
    await pdcUploadsUpdate(
      {
        ref_no: req.body.Ref_No,
        upload: JSON.stringify(files),
      },
      req
    );

    await UpdateId("pdc", newId, month, year, req);
    res.send({ message: "Update PDC Successfully.", success: true });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
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
PDC.get("/search-pdc", async (req, res) => {
  try {
    const { searchPDCInput } = req.query;
    const searchPDCData = await searchPDC(searchPDCInput as string, req);
    res.send({
      message: "Search PDC Successfully",
      success: true,
      searchPDC: searchPDCData,
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
