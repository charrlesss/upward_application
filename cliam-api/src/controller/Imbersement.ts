import express from "express";
import { PrismaClient } from "@prisma/client";
import { getFileExtension, saveUserLogs, saveUserLogsCode } from "./Claims";
import multer from "multer";
import { v4 as uuidV4 } from "uuid";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "./../../static/reimbursement");

const prisma = new PrismaClient();
const Imbersement = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    let extension = getFileExtension(file.originalname);
    cb(null, `${uuidV4()}${extension}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB file size limit
});

Imbersement.post("/get-imbersement-id", async (req, res): Promise<any> => {
  try {
    const currentMonth: any = await prisma.$queryRawUnsafe(`
        SELECT DATE_FORMAT(NOW(), '%y%m') AS current_month
      `);
    const monthPrefix = currentMonth[0].current_month; // e.g., "2503"

    // Get the last claim_id for the current month
    const lastClaim: any = await prisma.$queryRawUnsafe(`
        SELECT refNo FROM claims.reimbursement 
        WHERE refNo LIKE '${monthPrefix}%' COLLATE utf8mb4_unicode_ci 
        ORDER BY refNo DESC 
        LIMIT 1
      `);

    let newCounter = "001"; // Default if no existing claim_id

    if (lastClaim.length > 0 && lastClaim[0].refNo) {
      const lastCounter = parseInt(lastClaim[0].refNo.split("-")[1], 10);
      newCounter = String(lastCounter + 1).padStart(3, "0"); // Increment and format
    }

    const refNo = `${monthPrefix}-${newCounter}`;

    console.log("Generated Imbersement ID:", refNo);

    res.send({
      refNo,
      message: "Successfully Generate Claim ID.",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      refNo: "",
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Imbersement.post("/search-imbersement", async (req, res): Promise<any> => {
  try {
    res.send({
      message: "Successfully Add Imbersement.",
      success: true,
      data: await searchImberment(req.body.search),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      data: [],
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

Imbersement.post(
  "/add-imbersement",
  upload.fields([{ name: "basic" }]),
  async (req, res): Promise<any> => {
    try {
      const reqFile = req.files as any;

      const metadata = JSON.parse(req.body.metadata);
      const basicDocuments = JSON.parse(req.body.basicDocuments);
      const uploadedBasicFiles = (reqFile.basic as Express.Multer.File[]) || [];

      let updatedbasicDocuments = [];
      if (uploadedBasicFiles.length > 0) {
        updatedbasicDocuments = basicDocuments.map((itm: any) => {
          const newFileArray: any = [];
          uploadedBasicFiles.forEach((file) => {
            const [id] = file.originalname.split("-").slice(-1);
            if (itm.id === parseInt(id)) {
              newFileArray.push(file.filename);
            }
          });
          itm.files = newFileArray;

          return itm;
        });
      }

      delete metadata.isUpdate;
      metadata.amount_claim = parseFloat(
        metadata.amount_claim.replace(/,/g, "")
      ).toFixed(2);
      metadata.amount_imbursement = parseFloat(
        metadata.amount_imbursement.replace(/,/g, "")
      ).toFixed(2);

      metadata.amount_approved = parseFloat(
        metadata.amount_approved.replace(/,/g, "") || 0
      ).toFixed(2);

      await prisma.$transaction(async (_prisma) => {
        metadata.date_claim = new Date(metadata.date_claim);
        metadata.date_release = new Date(metadata.date_release);
        metadata.date_return_upward =
          metadata.date_return_upward !== ""
            ? new Date(metadata.date_return_upward)
            : undefined;

        await _prisma.reimbursement.create({
          data: {
            ...metadata,
            basicDocuments: JSON.stringify(basicDocuments),
          },
        });

        const mainDir = path.join(uploadDir, metadata.refNo);
        if (fs.existsSync(mainDir)) {
          fs.rmSync(mainDir, { recursive: true, force: true });
        }

        if (!fs.existsSync(mainDir)) {
          fs.mkdirSync(mainDir, { recursive: true });
        }

        if (uploadedBasicFiles) {
          if (uploadedBasicFiles.length > 0) {
            uploadedBasicFiles.forEach((file: Express.Multer.File) => {
              const sourceImagePath = path.join(uploadDir, file.filename);
              const targetImagePath = path.join(mainDir, file.filename);
              fs.copyFile(sourceImagePath, targetImagePath, (err) => {
                if (err) {
                  console.error("Error copying file:", err);
                } else {
                  console.log("Image copied successfully to:", targetImagePath);
                  fs.unlink(sourceImagePath, (unlinkErr) => {
                    if (unlinkErr) {
                      console.error("Error deleting source file:", unlinkErr);
                    } else {
                      console.log("Source file deleted:", sourceImagePath);
                    }
                  });
                }
              });
            });
          }
        }
        await saveUserLogs(_prisma, req, metadata.refNo, "add", "Imbersement");
      });

      res.send({
        message: "Successfully Add Imbersement.",
        success: true,
        data: await searchImberment(""),
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
Imbersement.post(
  "/update-imbersement",
  upload.fields([{ name: "basic" }]),
  async (req, res): Promise<any> => {
    console.log("update");
    try {
      const reqFile = req.files as any;

      const metadata = JSON.parse(req.body.metadata);
      const basicDocuments = JSON.parse(req.body.basicDocuments);
      const uploadedBasicFiles = (reqFile.basic as Express.Multer.File[]) || [];

      if (
        !(await saveUserLogsCode(
          req,
          "update",
          metadata.refNo,
          "Reimbersement",
          prisma
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }

      await prisma.$transaction(async (_prisma) => {
        delete metadata.userCodeConfirmation;

        const mainDir = path.join(uploadDir, metadata.refNo);
        if (fs.existsSync(mainDir)) {
          fs.rmSync(mainDir, { recursive: true, force: true });
        }

        await _prisma.$queryRawUnsafe(
          `DELETE FROM claims.reimbursement WHERE refNo = ?`,
          metadata.refNo
        );

        let updatedbasicDocuments = [];

        if (uploadedBasicFiles.length > 0) {
          updatedbasicDocuments = basicDocuments.map((itm: any) => {
            const newFileArray: any = [];
            uploadedBasicFiles.forEach((file) => {
              const [id] = file.originalname.split("-").slice(-1);
              if (itm.id === parseInt(id)) {
                newFileArray.push(file.filename);
              }
            });
            itm.files = newFileArray;

            return itm;
          });
        }

        console.log(updatedbasicDocuments);

        delete metadata.isUpdate;
        metadata.amount_claim = parseFloat(
          metadata.amount_claim.replace(/,/g, "")
        ).toFixed(2);
        metadata.amount_imbursement = parseFloat(
          metadata.amount_imbursement.replace(/,/g, "")
        ).toFixed(2);

        metadata.amount_approved = parseFloat(
          metadata.amount_approved.replace(/,/g, "") || 0
        ).toFixed(2);

        metadata.date_claim = new Date(metadata.date_claim);
        metadata.date_release = new Date(metadata.date_release);
        metadata.date_return_upward =
          metadata.date_return_upward !== ""
            ? new Date(metadata.date_return_upward)
            : undefined;

        await _prisma.reimbursement.create({
          data: {
            ...metadata,
            basicDocuments: JSON.stringify(basicDocuments),
          },
        });

        if (fs.existsSync(mainDir)) {
          fs.rmSync(mainDir, { recursive: true, force: true });
        }

        if (!fs.existsSync(mainDir)) {
          fs.mkdirSync(mainDir, { recursive: true });
        }

        if (uploadedBasicFiles) {
          if (uploadedBasicFiles.length > 0) {
            uploadedBasicFiles.forEach((file: Express.Multer.File) => {
              const sourceImagePath = path.join(uploadDir, file.filename);
              const targetImagePath = path.join(mainDir, file.filename);
              fs.copyFile(sourceImagePath, targetImagePath, (err) => {
                if (err) {
                  console.error("Error copying file:", err);
                } else {
                  console.log("Image copied successfully to:", targetImagePath);
                  fs.unlink(sourceImagePath, (unlinkErr) => {
                    if (unlinkErr) {
                      console.error("Error deleting source file:", unlinkErr);
                    } else {
                      console.log("Source file deleted:", sourceImagePath);
                    }
                  });
                }
              });
            });
          }
        }
      });

      res.send({
        message: "Successfully Update Imbersement.",
        success: true,
        data: await searchImberment(""),
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
Imbersement.post("/delete-imbersement", async (req, res): Promise<any> => {
  try {
    await prisma.$transaction(async (_prisma) => {
      if (
        !(await saveUserLogsCode(
          req,
          "delete",
          req.body.refNo,
          "Reimbersement",
          _prisma
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }

      delete req.body.userCodeConfirmation;

      const mainDir = path.join(uploadDir, req.body.refNo);
      if (fs.existsSync(mainDir)) {
        fs.rmSync(mainDir, { recursive: true, force: true });
      }

      await _prisma.$queryRawUnsafe(
        `DELETE FROM claims.reimbursement WHERE refNo = ?`,
        req.body.refNo
      );
    });

    res.send({
      message: "Successfully Delete Imbersement.",
      success: true,
      data: await searchImberment(""),
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
async function searchImberment(search: string) {
  const data = await prisma.$queryRawUnsafe(
    `
    SELECT 
      refNo,
      policy_no,
      check_from,
      type_claim,
      date_format(date_claim,'%Y-%m-%d') as date_claim,
      unit_insured,
      client_name,
       tpl_name,
       format(amount_claim,2) as amount_claim,
      date_format(date_release,'%Y-%m-%d') as date_release,
      date_format(date_return_upward,'%Y-%m-%d') as date_return_upward,
      format(amount_imbursement,2) as amount_imbursement,
      format(amount_approved,2) as amount_approved,
      payment,
      payee,
      remarks,
      basicDocuments
    FROM
        claims.reimbursement
    WHERE
        refNo LIKE ?  
        OR client_name LIKE ?  
        OR tpl_name LIKE ?  
        OR payee LIKE ?  
        OR type_claim LIKE ?
    ORDER BY refNo desc
    limit 5000
  `,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`
  );

  return data;
}
export default Imbersement;
