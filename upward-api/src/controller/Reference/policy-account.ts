import express, { Request, Response } from "express";
import {
  checkedAccountIsExisting,
  createPolicyAccount,
  deletePolicyAccount,
  searchPolicy,
  updatePolicyAccount,
} from "../../model/Reference/policy-account.model";
import { mapDataBasedOnHeaders } from "../../lib/mapbaseonheader";
import { ExportToExcel } from "../../lib/exporttoexcel";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import saveUserLogs from "../../lib/save_user_logs";
import { VerifyToken } from "../Authentication";

const PolicyAccount = express.Router();

PolicyAccount.post(
  "/add-policy-account",
  async (req: Request, res: Response) => {
    try {
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

      delete req.body.mode;
      delete req.body.search;
      req.body.createdAt = new Date();
      if (await checkedAccountIsExisting(req.body.Account as string, req)) {
        return res.send({
          message: "This account is already exist",
          success: false,
        });
      }
      await createPolicyAccount(req.body, req);
      await saveUserLogs(req, req.body.Account, "add", "Policy Account");
      res.send({ message: "Create Policy Account Successfuly", success: true });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        success: false,
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      });
    }
  }
);
PolicyAccount.post(
  "/update-policy-account",
  async (req: Request, res: Response) => {
    try {
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

      if (
        !(await saveUserLogsCode(
          req,
          "edit",
          req.body.Account,
          "Policy Account"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }

      delete req.body.mode;
      delete req.body.search;
      delete req.body.userCodeConfirmation;

      const findAccount = await checkedAccountIsExisting(
        req.body.Account as string,
        req
      );
      if (findAccount == null) {
        return res.send({
          message: "Update Failed Account not Found!",
          success: false,
        });
      }
      delete req.body.createdAt;
      updateValues(req.body);
      await updatePolicyAccount(req.body, findAccount.Account, req);
      res.send({ message: "Update Policy Account Successfuly", success: true });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        success: false,
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      });
    }
  }
);
PolicyAccount.post(
  "/delete-policy-account",
  async (req: Request, res: Response) => {
    try {
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
      if (
        !(await saveUserLogsCode(
          req,
          "delete",
          req.body.Account,
          "Policy Account"
        ))
      ) {
        return res.send({ message: "Invalid Code", success: false });
      }
      await deletePolicyAccount(req.body.Account as string, req);
      res.send({ message: "Delete Policy Account Successfuly", success: true });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        success: false,
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      });
    }
  }
);
PolicyAccount.get(
  "/get-policy-account",
  async (req: Request, res: Response) => {
    try {
      const { policySearch } = req.query;
      const policy: any = await searchPolicy(
        policySearch as string,
        false,
        req
      );
      policy.map((obj: any) => {
        return updateValues(obj);
      });
      res.send({
        message: "Get Policy Account Successfuly",
        success: true,
        policy,
      });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        success: false,
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      });
    }
  }
);
PolicyAccount.get(
  "/search-policy-account",
  async (req: Request, res: Response) => {
    try {
      const { policySearch } = req.query;
      const policy: any = await searchPolicy(
        policySearch as string,
        false,
        req
      );

      policy.map((obj: any) => {
        return updateValues(obj);
      });
      res.send({
        message: "Search Policy Account Successfuly",
        success: true,
        policy,
      });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        success: false,
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      });
    }
  }
);
function updateValues(obj: any) {
  const valueMappings: any = {
    1: true,
    0: false,
  };
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      updateValues(obj[key]);
    } else if (valueMappings.hasOwnProperty(obj[key])) {
      obj[key] = valueMappings[obj[key]];
    }
  }
}
PolicyAccount.get("/export-policy-account", async (req, res) => {
  try {
    const entryHeaders: any = {
      Policy: {
        header: ["Account", "Account Code", "Description", "Created At"],
        row: ["Account", "AccountCode", "Description", "createdAt"],
      },
    };
    const { policySearch, isAll } = req.query;

    let data = [];
    if (JSON.parse(isAll as string)) {
      data = mapDataBasedOnHeaders(
        (await searchPolicy("", true, req)) as Array<any>,
        entryHeaders,
        "Policy"
      );
    } else {
      data = mapDataBasedOnHeaders(
        (await searchPolicy(policySearch as string, false, req)) as Array<any>,
        entryHeaders,
        "Policy"
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
export default PolicyAccount;
