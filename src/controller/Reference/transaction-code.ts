import express, { Request, Response } from "express";
import {
  addTransactionCode,
  deleteTransactionCode,
  findTransactionCode,
  getTransactionCode,
  updateTransactionCode,
} from "../../model/Reference/transaction-account.model";
import saveUserLogs from "../../lib/save_user_logs";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import { VerifyToken } from "../Authentication";

const TransactionCode = express.Router();

TransactionCode.get(
  "/get-transaction-code",
  async (req: Request, res: Response) => {
    const { transactionCodeSearch } = req.query;
    try {
      res.send({
        message: "Get Transaction Code Successfully!",
        success: true,
        transactionCode: await getTransactionCode(
          transactionCodeSearch as string,
          req
        ),
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

TransactionCode.post(
  "/add-transaction-code",
  async (req: Request, res: Response) => {
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
      delete req.body.mode;
      delete req.body.search;

      if (await findTransactionCode(req.body.Acct_Code, req)) {
        return res.send({
          message: "Transaction Code is Already Exist!",
          success: false,
        });
      }
      await addTransactionCode(req.body, req);
      await saveUserLogs(req, req.body.Acct_Code, "add", "Transaction Account");

      res.send({
        message: "Create Transaction Code Successfully!",
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

TransactionCode.post(
  "/update-transaction-code",
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
        !(await saveUserLogsCode(
          req,
          "edit",
          req.body.Code,
          "Transaction Account"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }
      delete req.body.mode;
      delete req.body.search;
      delete req.body.userCodeConfirmation;

      req.body.Inactive = Boolean(req.body.Inactive);
      await updateTransactionCode(req.body, req);
      res.send({
        message: "Update Transaction Code Successfully!",
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

TransactionCode.post(
  "/delete-transaction-code",
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
        !(await saveUserLogsCode(
          req,
          "delete",
          req.body.Code,
          "Transaction Account"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }
      await deleteTransactionCode(req.body, req);
      res.send({
        message: "Delete Transaction Code Successfully!",
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

TransactionCode.get(
  "/search-transaction-code",
  async (req: Request, res: Response) => {
    const { transactionCodeSearch } = req.query;
    try {
      res.send({
        message: "Get Transacation Code Successfully!",
        success: true,
        transactionCode: await getTransactionCode(
          transactionCodeSearch as string,
          req
        ),
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

export default TransactionCode;
