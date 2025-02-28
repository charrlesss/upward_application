import express, { Request, Response } from "express";
import { mapDataBasedOnHeaders } from "../../lib/mapbaseonheader";
import { ExportToExcel } from "../../lib/exporttoexcel";
import {
  addRate,
  getBonds,
  getFire,
  getPolicyAccounts,
  searchRate,
  updateRate,
  deleteRate,
} from "../../model/Reference/rates.model";
import { getline } from "../../model/Reference/subline.model";
import generateUniqueUUID from "../../lib/generateUniqueUUID";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import saveUserLogs from "../../lib/save_user_logs";
import { VerifyToken } from "../Authentication";

const Rates = express.Router();

Rates.get("/get-rates", async (req: Request, res: Response) => {
  const { ratesSearch } = req.query;
  try {
    const rate = await searchRate(ratesSearch as string, false, req);
    const line = await getline(req);
    const policy = await getPolicyAccounts(req);
    res.send({
      message: "Get Rates Successfully!",
      success: true,
      rate: {
        rate,
        line,
        policy,
        type: {
          Bonds: await getBonds(req),
          Fire: await getFire(req),
        },
      },
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});

Rates.post("/add-rates", async (req: Request, res: Response) => {
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
    delete req.body.ID;
    const ID = await generateUniqueUUID("subline", "ID");
    req.body.createdAt = new Date();
    await addRate({ ID, ...req.body }, req);
    await saveUserLogs(req, ID, "add", "Rates");
    res.send({
      message: "Create Rates Successfully!",
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

Rates.post("/update-rates", async (req: Request, res: Response) => {
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
    if (!(await saveUserLogsCode(req, "edit", req.body.ID, "Rates"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    delete req.body.mode;
    delete req.body.search;
    delete req.body.userCodeConfirmation;

    await updateRate(req.body.ID, req.body.Type, req.body.Rate, req);
    res.send({
      message: "Update Rates Successfully!",
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

Rates.post("/delete-rates", async (req: Request, res: Response) => {
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
    if (!(await saveUserLogsCode(req, "delete", req.body.ID, "Rates"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    await deleteRate(req.body.ID, req);
    res.send({
      message: "Delete Rates Successfully!",
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

Rates.get("/search-rates", async (req: Request, res: Response) => {
  const { ratesSearch } = req.query;
  try {
    const rates: any = await searchRate(ratesSearch as string, false, req);
    res.send({
      message: "Search Policy Account Successfuly",
      success: true,
      rates,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});

Rates.get("/export-rates", async (req: Request, res: Response) => {
  try {
    const subAccountHeaders: any = {
      Rates: {
        header: ["ID", "Account", "Type", "Rate", "Created At"],
        row: ["ID", "Account", "Type", "Rate", "createdAt"],
      },
    };
    const { ratesSearch, isAll } = req.query;

    let data = [];
    if (JSON.parse(isAll as string)) {
      data = mapDataBasedOnHeaders(
        (await searchRate("", true, req)) as Array<any>,
        subAccountHeaders,
        "Rates"
      );
    } else {
      data = mapDataBasedOnHeaders(
        (await searchRate(ratesSearch as string, false, req)) as Array<any>,
        subAccountHeaders,
        "Rates"
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

export default Rates;
