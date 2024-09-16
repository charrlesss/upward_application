import express, { Response } from "express";
import { generateUniqueFilename } from "../Task/Claims/claims";
import path from "path";
import fs from "fs";
import { v4 as uuidV4 } from "uuid";
import { hashSync } from "bcrypt";
import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import { PrismaList } from "../../model/connection";
const MasterAdminUser = express.Router();

const { CustomPrismaClient } = PrismaList();

MasterAdminUser.post("/master-admin/add-user", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    const id = uuidV4();
    delete req.body.confirmPassword;
    delete req.body.confirm_confirmationCode;
    const qryUserIdCheck = `select * from users a where a.Username ='${req.body.username}'`;
    const user: any = await prisma.$queryRawUnsafe(qryUserIdCheck);
    if (user.length > 0) {
      return res.send({
        message: "Username is already used!",
        success: false,
      });
    }
    const password = hashSync(req.body.password, 12);
    const confirmationCode = hashSync(req.body.confirmationCode, 12);

    const uploadDir = path.join("./static/profile", `${id}`);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true });
    }
    const files = UploadFile(req.body.profile, uploadDir, res);
    const data = {
      UserId: id,
      AccountType: req.body.accountType,
      Department: req.body.department,
      Password: password,
      userConfirmationCode: confirmationCode,
      Username: req.body.username,
      company_number: req.body.contact,
      email: req.body.email,
      name: req.body.name,
      is_master_admin: 0,
      profile: JSON.stringify(files),
      CreatedAt: `${new Date()}`,
    };

    const qry1 = `
    insert into upward_insurance_ucsmi_new.users(UserId,AccountType,Password,Username,userConfirmationCode,Department,company_number,email,name,is_master_admin,profile)
    values (
      '${data.UserId}',
      '${data.AccountType}',
      '${data.Password}',
      '${data.Username}',
      '${data.userConfirmationCode}',
      '${data.Department}',
      '${data.company_number}',
      '${data.email}',
      '${data.name}',
      '${data.is_master_admin}',
      '${data.profile}'  
    )
    `;
    await prisma.$executeRawUnsafe(qry1);
    const qry2 = `
    insert into upward_insurance_umis_new.users(UserId,AccountType,Password,Username,userConfirmationCode,Department,company_number,email,name,is_master_admin,profile)
    values (
      '${data.UserId}',
      '${data.AccountType}',
      '${data.Password}',
      '${data.Username}',
      '${data.userConfirmationCode}',
      '${data.Department}',
       '${data.company_number}',
      '${data.email}',
      '${data.name}',
      '${data.is_master_admin}',
      '${data.profile}'
    )
    `;
    await prisma.$executeRawUnsafe(qry2);
    res.send({
      message: "Successfully Create User!",
      success: true,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      success: false,
    });
  }
});

MasterAdminUser.get("/master-admin/get-user", async (req, res) => {
  try {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    const users = await prisma.$queryRawUnsafe(
      "SELECT *, date_format(a.CreatedAt ,'%d/%m/%Y') as _CreatedAt FROM users a;"
    );
    res.send({
      message: "Successfully Policy Details",
      success: true,
      users,
    });
  } catch (err: any) {
    console.log(err);
    res.send({ message: err.message, success: false, users: [] });
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

export default MasterAdminUser;
