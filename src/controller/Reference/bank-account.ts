import express, { Request, Response } from "express";
import {
  addBankAccount,
  getBankAccount,
  removeBankAccount,
  updateBankAccount,
  searchClient,
} from "../../model/Reference/bank-account";
import saveUserLogs from "../../lib/save_user_logs";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import { VerifyToken } from "../Authentication";

const BankAccount = express.Router();
BankAccount.get("/get-bank-account", async (req: Request, res: Response) => {
  const { bankAccountSearch } = req.query;
  try {
    res.send({
      message: "Get Bank Account Successfully!",
      success: true,
      bankAccount: await getBankAccount(bankAccountSearch as string, req),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});
BankAccount.get("/search-client", async (req: Request, res: Response) => {
  const { searchClientInput } = req.query;
  try {
    res.send({
      message: "Search Client Account Successfully!",
      success: true,
      client: await searchClient(searchClientInput as string, req),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});
BankAccount.post("/add-bank-account", async (req: Request, res: Response) => {
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
    delete req.body.search;
    delete req.body.mode;
    delete req.body.Account_ID_Name;
    delete req.body.BankName;
    await saveUserLogs(req, `${req.body.Auto}`, "add", "Bank-Account");
    delete req.body.Auto;
    await addBankAccount(req.body, req);
    res.send({
      message: "Create Bank Account Successfully!",
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
BankAccount.post(
  "/update-bank-account",
  async (req: Request, res: Response) => {
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
        !(await saveUserLogsCode(req, "edit", req.body.Auto, "Bank-Account"))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }
      delete req.body.search;
      delete req.body.mode;
      delete req.body.userCodeConfirmation;
      delete req.body.Account_ID_Name;
      delete req.body.BankName;
      req.body.Inactive = Boolean(req.body.Inactive);
      const { Auto, ...rest } = req.body;
      await updateBankAccount(rest, Auto, req);
      res.send({
        message: "Update Bank Account Successfully!",
        success: true,
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
BankAccount.post(
  "/delete-bank-account",
  async (req: Request, res: Response) => {
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
        !(await saveUserLogsCode(req, "delete", req.body.Auto, "Bank-Account"))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }

      await removeBankAccount(req.body.Auto, req);
      res.send({
        message: "Delete Bank Account Successfully!",
        success: true,
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
BankAccount.get("/search-bank-account", async (req: Request, res: Response) => {
  const { bankAccountSearch } = req.query;
  try {
    res.send({
      message: "Search Bank Account Successfuly",
      success: true,
      bankAccount: await getBankAccount(bankAccountSearch as string, req),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});
export default BankAccount;
