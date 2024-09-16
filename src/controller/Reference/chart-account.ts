import express, { Request, Response } from "express";
import {
  addChartAccount,
  deleteChartAccount,
  findChartAccount,
  getChartAccount,
  updateChartAccount,
} from "../../model/Reference/chart-account.model";
import saveUserLogs from "../../lib/save_user_logs";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import { VerifyToken } from "../Authentication";

const ChartAccount = express.Router();

ChartAccount.get("/get-chart-accounts", async (req: Request, res: Response) => {
  const { chartAccountSearch } = req.query;
  try {
    res.send({
      message: "Get Chart Account Successfully!",
      success: true,
      chartAccount: await getChartAccount(chartAccountSearch as string, req),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});

ChartAccount.post("/add-chart-account", async (req: Request, res: Response) => {
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

    if (await findChartAccount(req.body.Acct_Code, req)) {
      return res.send({
        message: "Chart Account is Already Exist!",
        success: false,
      });
    }
    await addChartAccount(req.body, req);
    await saveUserLogs(req, req.body.Acct_Code, "add", "Chart Account");
    res.send({
      message: "Create Chart Account Successfully!",
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

ChartAccount.post(
  "/update-chart-account",
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
          req.body.Acct_Code,
          "Chart Account"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }
      delete req.body.mode;
      delete req.body.search;
      delete req.body.userCodeConfirmation;

      req.body.Inactive = Boolean(req.body.Inactive);
      req.body.IDNo = Boolean(req.body.IDNo);
      req.body.SubAccnt = Boolean(req.body.SubAccnt);
      await updateChartAccount(req.body, req);
      res.send({
        message: "Update Chart Account Successfully!",
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

ChartAccount.post(
  "/delete-chart-account",
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
          req.body.Acct_Code,
          "Chart Account"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }
      await deleteChartAccount(req.body, req);
      res.send({
        message: "Delete Chart Account Successfully!",
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

ChartAccount.get(
  "/search-chart-account",
  async (req: Request, res: Response) => {
    const { chartAccountSearch } = req.query;
    try {
      res.send({
        message: "Get Chart Account Successfully!",
        success: true,
        chartAccount: await getChartAccount(chartAccountSearch as string, req),
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

export default ChartAccount;
