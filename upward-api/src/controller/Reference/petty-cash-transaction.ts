import express, { Request, Response } from "express";
import {
  addPettyCashTransaction,
  deletePettyCashTransaction,
  getPettyCashTransaction,
  updatePettyCashTransaction,
} from "../../model/Reference/petty-cash-transaction..model";
import generateUniqueUUID from "../../lib/generateUniqueUUID";
import saveUserLogs from "../../lib/save_user_logs";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import { VerifyToken } from "../Authentication";

const PettyCashTransaction = express.Router();

PettyCashTransaction.get(
  "/get-petty-cash-transaction",
  async (req: Request, res: Response) => {
    const { pettyCashtTransactionSearch } = req.query;
    try {
      res.send({
        message: "Get Petty Cash Transaction Successfully!",
        success: true,
        pettyCashTransaction: await getPettyCashTransaction(
          pettyCashtTransactionSearch as string,
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

PettyCashTransaction.post(
  "/add-petty-cash-transaction",
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
      delete req.body.createdAt;
      const Petty_Log = await generateUniqueUUID("petty_log", "Petty_Log");
      await addPettyCashTransaction({ Petty_Log, ...req.body }, req);
      await saveUserLogs(req, Petty_Log, "add", "Petty Cash");
      res.send({
        message: "Create Petty Cash Transaction Successfully!",
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

PettyCashTransaction.post(
  "/update-petty-cash-transaction",
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
        !(await saveUserLogsCode(req, "edit", req.body.Petty_Log, "Petty Cash"))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }
      delete req.body.mode;
      delete req.body.search;
      delete req.body.userCodeConfirmation;
      req.body.Inactive = Boolean(req.body.Inactive);
      await updatePettyCashTransaction(req.body, req);
      res.send({
        message: "Update Petty Cash Transaction Successfully!",
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

PettyCashTransaction.post(
  "/delete-petty-cash-transaction",
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
          req.body.Petty_Log,
          "Petty Cash"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }
      await deletePettyCashTransaction(req.body, req);
      res.send({
        message: "Delete Petty Cash Transaction Successfully!",
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

PettyCashTransaction.get(
  "/search-petty-cash-transaction",
  async (req: Request, res: Response) => {
    const { pettyCashtTransactionSearch } = req.query;
    try {
      res.send({
        message: "Get Petty Cash Transaction Successfully!",
        success: true,
        pettyCashTransaction: await getPettyCashTransaction(
          pettyCashtTransactionSearch as string,
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

export default PettyCashTransaction;
