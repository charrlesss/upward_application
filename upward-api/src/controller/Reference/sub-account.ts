import express, { Request, Response } from "express";
import { mapDataBasedOnHeaders } from "../../lib/mapbaseonheader";
import { ExportToExcel } from "../../lib/exporttoexcel";
import {
  createSubAccount,
  searchSubAccount,
  updateSubAccount,
  deleteSubAccount,
} from "../../model/Reference/sub-account.model";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import saveUserLogs from "../../lib/save_user_logs";
import generateUniqueUUID from "../../lib/generateUniqueUUID";
import { VerifyToken } from "../Authentication";

const SubAccount = express.Router();

SubAccount.post("/add-sub-account", async (req: Request, res: Response) => {
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
    delete req.body.Sub_Acct;
    delete req.body.mode;
    delete req.body.search;
    delete req.body.userCodeConfirmation;
    req.body.createdAt = new Date();
    const Sub_Acct = await generateUniqueUUID("sub_account", "Sub_Acct");
    await createSubAccount({ Sub_Acct, ...req.body }, req);
    await saveUserLogs(req, Sub_Acct, "add", "Sub Account");
    res.send({ message: "Create Sub Account Successfully!", success: true });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});
SubAccount.post("/search-sub-account", async (req: Request, res: Response) => {
  try {
    res.send({
      message: "Search Sub Account Successfully!",
      success: true,
      data: await searchSubAccount(req.body.search),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      data: [],
    });
  }
});
SubAccount.post("/update-sub-account", async (req: Request, res: Response) => {
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
    if (
      !(await saveUserLogsCode(req, "edit", req.body.Sub_Acct, "Sub Account"))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    delete req.body.mode;
    delete req.body.search;
    delete req.body.userCodeConfirmation;
    const { Sub_Acct, ...rest } = req.body;

    delete rest.createdAt;
    await updateSubAccount({ ...rest, update: new Date() }, Sub_Acct, req);
    res.send({
      message: "Update Sub Account Successfully!",
      success: true,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});
SubAccount.post("/delete-sub-account", async (req: Request, res: Response) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: `CAN'T DELETE, ADMIN IS FOR VIEWING ONLY!`,
      success: false,
    });
  }
  try {
    if (
      !(await saveUserLogsCode(req, "delete", req.body.Sub_Acct, "Sub Account"))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    await deleteSubAccount(req.body.Sub_Acct, req);
    res.send({
      message: "Delete Sub Account Successfully!",
      success: true,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});

export default SubAccount;
