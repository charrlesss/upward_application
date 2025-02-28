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

SubAccount.get("/get-sub-account", async (req: Request, res: Response) => {
  const { subaccountSearch } = req.query;

  try {
    const subaccount = await searchSubAccount(
      subaccountSearch as string,
      false,
      req
    );
    res.send({
      message: "Get Sub Account Successfully!",
      success: true,
      subaccount,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});

SubAccount.get("/search-sub-account", async (req: Request, res: Response) => {
  const { subaccountSearch } = req.query;
  try {
    const subaccount = await searchSubAccount(
      subaccountSearch as string,
      false,
      req
    );
    res.send({
      message: "Search Sub Account Successfully!",
      success: true,
      subaccount,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
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

SubAccount.get("/export-sub-account", async (req, res) => {
  try {
    const subAccountHeaders: any = {
      SubAccount: {
        header: [
          "Sub Account ID",
          "Acronym",
          "Short Name",
          "Description",
          "Created At",
        ],
        row: ["Sub_Acct", "Acronym", "ShortName", "Description", "createdAt"],
      },
    };
    const { policySearch, isAll } = req.query;

    let data = [];
    if (JSON.parse(isAll as string)) {
      data = mapDataBasedOnHeaders(
        (await searchSubAccount("", true, req)) as Array<any>,
        subAccountHeaders,
        "SubAccount"
      );
    } else {
      data = mapDataBasedOnHeaders(
        (await searchSubAccount(
          policySearch as string,
          false,
          req
        )) as Array<any>,
        subAccountHeaders,
        "SubAccount"
      );
    }

    ExportToExcel(data, res);
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});
export default SubAccount;
