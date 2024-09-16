import express from "express";
import {
  GenerateClaimsID,
  claimReport,
  claimReportDesk,
  claimSelectedPolicy,
  claimsPolicy,
  createClaimDetails,
  createClaims,
  deleteClaims,
  getInsuranceList,
  searchClaims,
  selectedData,
  updateClaimIDSequence,
} from "../../../model/Task/Claims/claims";
import path from "path";
import fs from "fs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import saveUserLogs from "../../../lib/save_user_logs";
import { v4 as uuidV4 } from "uuid";
import {
  addYears,
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { VerifyToken } from "../../Authentication";
const Claim = express.Router();

Claim.post("/claims/save", async (req, res) => {
  try {
    const { userAccess }: any = await VerifyToken(
      req.cookies["up-ac-login"] as string,
      process.env.USER_ACCESS as string
    );
    if (userAccess.includes("ADMIN")) {
      return res.send({
        message: `CAN'T ${
          req.body.mode === "update" ? "UPDATE" : "SAVE"
        }, ADMIN IS FOR VIEWING ONLY!`,
        success: false,
      });
    }

    const data = req.body;
    const isUpdateMode = req.body.mode === "update";
    if (isUpdateMode) {
      if (
        !(await saveUserLogsCode(req, "update", req.body.claims_id, "Claims"))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }

      await deleteClaims(req.body.claims_id, req);
    }

    const files = req.body.claimsSubmited;
    const basicDocumentFolder = [
      "policyFile",
      "endorsement",
      "OPP",
      "ORCR",
      "DLOR",
      "PR",
      "DA",
      "SMCN",
    ];
    const insuranceDocuments = ["loa", "offerLetter", "CE"];

    files.forEach(
      async (
        {
          basicFileCustom,
          otherFileCustom,
          insuranceFileCustom,
          policyState,
        }: any,
        index: number
      ) => {
        const claims_no = padNumber(index + 1, 3);
        const uploadDir = path.join(
          "./static/claim-files",
          `${data.claims_id}`,
          claims_no
        );
        if (fs.existsSync(uploadDir)) {
          fs.rmSync(uploadDir, { recursive: true });
        }
        const basic = UploadFile(basicFileCustom, uploadDir);
        const others = UploadFile(otherFileCustom, uploadDir);
        const insuranceFile = UploadFile(insuranceFileCustom, uploadDir);

        policyState.claim_type = policyState.claim_type?.toString();
        policyState.status = policyState.status?.toString();
        policyState.totaDue = parseFloat(
          policyState.totaDue.toString().replace(/,/g, "")
        ).toFixed(2);
        policyState.totalpaid = parseFloat(
          policyState.totalpaid.toString().replace(/,/g, "")
        ).toFixed(2);
        policyState.balance = parseFloat(
          policyState.balance.toString().replace(/,/g, "")
        ).toFixed(2);
        policyState.remitted = parseFloat(
          policyState.remitted.toString().replace(/,/g, "")
        ).toFixed(2);
        if (policyState.AmountClaim === "") {
          policyState.AmountClaim = "0";
        }
        if (policyState.AmountApproved === "") {
          policyState.AmountApproved = "0";
        }
        policyState.AmountClaim = parseFloat(
          policyState.AmountClaim.toString().replace(/,/g, "")
        ).toFixed(2);
        policyState.AmountApproved = parseFloat(
          policyState.AmountApproved.toString().replace(/,/g, "")
        ).toFixed(2);

        delete policyState.DateFrom;
        delete policyState.DateTo;

        await createClaimDetails(
          {
            claim_details_id: uuidV4(),
            claims_id: data.claims_id,
            claims_no,
            basic: JSON.stringify(basic),
            others: JSON.stringify(others),
            insuranceFile: JSON.stringify(insuranceFile),
            ...policyState,
          },
          req
        );
      }
    );

    await createClaims(
      {
        claims_id: data.claims_id,
        dateReported: data.dateReported,
        dateAccident: data.dateAccident,
        dateInspected: data.dateInspected,
        department: data.department?.toString(),
        remarks: data.remarks,
        createdAt: new Date().toISOString(),
      },
      req
    );

    function UploadFile(filesArr: Array<any>, uploadDir: string) {
      const obj: any = [];
      filesArr.forEach((file: any) => {
        let specFolder = "";
        if (basicDocumentFolder.includes(file.datakey)) {
          specFolder = "Basic-Document";
        } else if (insuranceDocuments.includes(file.datakey)) {
          specFolder = "Insurance-Document";
        } else {
          specFolder = "Other-Document";
        }

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
    function padNumber(number: number, length: number) {
      return String(number).padStart(length, "0");
    }
    if (!isUpdateMode) {
      const date = new Date();
      await saveUserLogs(req, req.body.claims_id, "add", "Claims");
      await updateClaimIDSequence(
        {
          last_count: data.claims_id.split("-")[1].split("C")[1],
          year: date.getFullYear().toString().slice(-2),
          month: (date.getMonth() + 1).toString().padStart(2, "0"),
        },
        req
      );
    }
    res.send({
      message: isUpdateMode
        ? "Claim is update successfully"
        : "Claim is save successfully",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      insurance: [],
    });
  }
});

export function generateUniqueFilename(originalFilename: string) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8); // Generates a random alphanumeric string
  const fileExtension = path.extname(originalFilename);
  return `${timestamp}-${randomString}${fileExtension}`;
}
Claim.get("/claims/get-insurance-list", async (req, res) => {
  try {
    res.send({
      message: "Successfully get insurance list",
      success: true,
      insurance: await getInsuranceList(req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      insurance: [],
    });
  }
});

Claim.get("/claims/get-policy", async (req, res) => {
  try {
    console.log("qweqweqw");
    res.send({
      message: "Successfully get insurance list",
      success: true,
      claimPolicy: await claimsPolicy(req.query.searchPolicy as string, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      insurance: [],
    });
  }
});
Claim.get("/claims/get-claims-id", async (req, res) => {
  try {
    res.send({
      message: "Successfully get claims id",
      success: true,
      claim_id: await GenerateClaimsID(req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      insurance: [],
    });
  }
});

Claim.post("/claims/get-selected-policy-details", async (req, res) => {
  try {
    res.send({
      message: "Successfully get claims id",
      success: true,
      data: await claimSelectedPolicy(req.body.PolicyNo, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});

Claim.get("/claims/search-claims", async (req, res) => {
  try {
    res.send({
      message: "Successfully search claim",
      success: true,
      claims: await searchClaims(req.query.searchClaims as string, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      insurance: [],
    });
  }
});
Claim.post("/claims/selected-search-claims", async (req, res) => {
  try {
    setTimeout(async () => {
      const selectedRowData = req.body.selectedRowData;
      const claims_id = selectedRowData[0].claims_id;
      const data: any = await selectedData(claims_id, req);
      const formattedSelectedData: Array<any> = [];
      data.forEach((list: any) => {
        formattedSelectedData.push({
          id: list.claims_no,
          basicFileCustom: JSON.parse(list.basic),
          otherFileCustom: JSON.parse(list.others),
          insuranceFileCustom: JSON.parse(list.insuranceFile),
          policyState: {
            policy: list.policy,
            claim_type: parseInt(list.claim_type),
            insurance: list.insurance,
            PolicyNo: list.PolicyNo,
            PlateNo: list.PlateNo,
            Model: list.Model,
            BodyType: list.BodyType,
            Make: list.Make,
            ChassisNo: list.ChassisNo,
            MotorNo: list.MotorNo,
            ORNo: list.ORNo,
            CoverNo: list.CoverNo,
            BLTFileNo: list.BLTFileNo,
            AssuredName: list.AssuredName,
            IDNo: list.IDNo,
            totaDue: list.totaDue,
            totalpaid: list.totalpaid,
            balance: list.balance,
            remitted: list.remitted,
            Account: list.Account,
            status: parseInt(list.status),
            DateFrom: list.DateFrom,
            DateTo: list.DateTo,
            DateReceived: list.DateReceived,
            DateClaim: list.DateClaim,
            AmountClaim: list.AmountClaim,
            AmountApproved: list.AmountApproved,
            NameTPPD: list.NameTPPD,
          },
        });
      });
      res.send({
        message: "Successfully search claim",
        success: true,
        formattedSelectedData,
        claims_id,
      });
    }, 1000);
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      insurance: [],
    });
  }
});
Claim.post("/claims/report-claim", async (req, res) => {
  try {
    let whereStatement = "";
    if (req.body.format === 5) {
      whereStatement = ` AND claim_type = ${req.body.claim_type}`;
    } else if (req.body.format === 6) {
      whereStatement = ` AND PolicyNo = '${req.body.PolicyNo}'`;
    } else {
      if (req.body.dateFormat === "Monthly") {
        const date = new Date(req.body.dateFrom);
        const firstDayOfMonth = startOfMonth(date);
        const lastDayOfMonth = endOfMonth(date);
        const formattedFirstDay = format(firstDayOfMonth, "yyyy-MM-dd");
        const formattedLastDay = format(lastDayOfMonth, "yyyy-MM-dd");
        whereStatement = selectByDate(formattedFirstDay, formattedLastDay);
      } else if (req.body.dateFormat === "Yearly") {
        req.body.dateFrom = new Date(req.body.dateFrom);
        const firstDayOfFirstMonth = startOfYear(req.body.dateFrom);
        const formattedFirstDay = format(firstDayOfFirstMonth, "yyyy-MM-dd");
        const formattedLastDay = format(
          endOfMonth(
            endOfYear(addYears(req.body.dateFrom, parseInt(req.body.yearCount)))
          ),
          "yyyy-MM-dd"
        );
        whereStatement = selectByDate(formattedFirstDay, formattedLastDay);
      } else {
        whereStatement = selectByDate(
          format(new Date(req.body.dateFrom), "yyyy-MM-dd"),
          format(new Date(req.body.dateTo), "yyyy-MM-dd")
        );
      }

      function selectByDate(dateFrom: string, dateTo: string) {
        let qry = "";
        if (req.body.format == 0) {
          qry = ` AND DATE_FORMAT(a.createdAt, '%Y-%m-%d') >= '${dateFrom}' AND  DATE_FORMAT(a.createdAt, '%Y-%m-%d') <= '${dateTo}' `;
        } else if (req.body.format == 1) {
          qry = ` AND DATE_FORMAT(b.DateClaim, '%Y-%m-%d') >= '${dateFrom}' AND  DATE_FORMAT(b.DateClaim, '%Y-%m-%d') <= '${dateTo}' `;
        } else if (req.body.format == 2) {
          qry = ` AND DATE_FORMAT(a.dateInspected, '%Y-%m-%d') >= '${dateFrom}' AND  DATE_FORMAT(a.dateInspected, '%Y-%m-%d') <= '${dateTo}' `;
        } else {
          qry = ` AND DATE_FORMAT(b.DateReceived, '%Y-%m-%d') >= '${dateFrom}' AND  DATE_FORMAT(b.DateReceived, '%Y-%m-%d') <= '${dateTo}' `;
        }
        return qry;
      }
    }
    const report = await claimReport(whereStatement, req.body.status, req);
    res.send({
      message: "Successfully generate report",
      success: true,
      report,
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Claim.post("/claims/report-claim-desk", async (req, res) => {
  try {
    let whereStatement = "";
    if (req.body.format === 5) {
      whereStatement = ` AND claim_type = ${req.body.claim_type}`;
    } else if (req.body.format === 6) {
      whereStatement = ` AND PolicyNo = '${req.body.PolicyNo}'`;
    } else {
      if (req.body.dateFormat === "Monthly") {
        const date = new Date(req.body.dateFrom);
        const firstDayOfMonth = startOfMonth(date);
        const lastDayOfMonth = endOfMonth(date);
        const formattedFirstDay = format(firstDayOfMonth, "yyyy-MM-dd");
        const formattedLastDay = format(lastDayOfMonth, "yyyy-MM-dd");
        whereStatement = selectByDate(formattedFirstDay, formattedLastDay);
      } else if (req.body.dateFormat === "Yearly") {
        req.body.dateFrom = new Date(req.body.dateFrom);
        const firstDayOfFirstMonth = startOfYear(req.body.dateFrom);
        const formattedFirstDay = format(firstDayOfFirstMonth, "yyyy-MM-dd");
        const formattedLastDay = format(
          endOfMonth(
            endOfYear(addYears(req.body.dateFrom, parseInt(req.body.yearCount)))
          ),
          "yyyy-MM-dd"
        );
        whereStatement = selectByDate(formattedFirstDay, formattedLastDay);
      } else {
        whereStatement = selectByDate(
          format(new Date(req.body.dateFrom), "yyyy-MM-dd"),
          format(new Date(req.body.dateTo), "yyyy-MM-dd")
        );
      }

      function selectByDate(dateFrom: string, dateTo: string) {
        let qry = "";
        if (req.body.format == 0) {
          qry = ` AND DATE_FORMAT(a.createdAt, '%Y-%m-%d') >= '${dateFrom}' AND  DATE_FORMAT(a.createdAt, '%Y-%m-%d') <= '${dateTo}' `;
        } else if (req.body.format == 1) {
          qry = ` AND DATE_FORMAT(b.DateClaim, '%Y-%m-%d') >= '${dateFrom}' AND  DATE_FORMAT(b.DateClaim, '%Y-%m-%d') <= '${dateTo}' `;
        } else if (req.body.format == 2) {
          qry = ` AND DATE_FORMAT(a.dateInspected, '%Y-%m-%d') >= '${dateFrom}' AND  DATE_FORMAT(a.dateInspected, '%Y-%m-%d') <= '${dateTo}' `;
        } else {
          qry = ` AND DATE_FORMAT(b.DateReceived, '%Y-%m-%d') >= '${dateFrom}' AND  DATE_FORMAT(b.DateReceived, '%Y-%m-%d') <= '${dateTo}' `;
        }
        return qry;
      }
    }
    const data = await claimReportDesk(whereStatement, req.body.status, req);
    res.send({
      message: "Successfully generate report",
      success: true,
      data,
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
export default Claim;
