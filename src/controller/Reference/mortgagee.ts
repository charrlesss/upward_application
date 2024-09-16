import express, { Request, Response } from "express";
import { mapDataBasedOnHeaders } from "../../lib/mapbaseonheader";
import { ExportToExcel } from "../../lib/exporttoexcel";
import {
  addMortgagee,
  deleteMortgagee,
  findMortgagee,
  getMortgageePolicy,
  updateMortgagee,
  searchMortgagee,
} from "../../model/Reference/mortgagee.model";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import saveUserLogs from "../../lib/save_user_logs";
import { VerifyToken } from "../Authentication";

const Mortgagee = express.Router();

Mortgagee.get("/get-mortgagee", async (req: Request, res: Response) => {
  const { mortgageeSearch } = req.query;
  try {
    const mortgagee = await searchMortgagee(
      mortgageeSearch as string,
      false,
      req
    );
    const policy = await getMortgageePolicy(req);
    res.send({
      message: "Get Mortgagee Successfully!",
      success: true,
      mortgagee: {
        mortgagee,
        policy,
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

Mortgagee.post("/add-mortgagee", async (req: Request, res: Response) => {
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

    req.body.createdAt = new Date();
    if (await findMortgagee(req.body.Mortgagee, req)) {
      return res.send({
        message: "Mortgagee is Already Exist Successfully!",
        success: false,
      });
    }

    await addMortgagee(req.body, req);
    await saveUserLogs(req, req.body.Mortgagee, "add", "Mortgagee");
    return res.send({
      message: "Create Mortgagee Successfully!",
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

Mortgagee.post("/delete-mortgagee", async (req: Request, res: Response) => {
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
  const { Mortgagee } = req.body;

  try {
    if (!(await saveUserLogsCode(req, "delete", Mortgagee, "Mortgagee"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    await deleteMortgagee(Mortgagee, req);
    res.send({
      message: "Delete Mortgagee Successfully!",
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

Mortgagee.post("/update-mortgagee", async (req: Request, res: Response) => {
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
      !(await saveUserLogsCode(req, "edit", req.body.Mortgagee, "Mortgagee"))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    delete req.body.mode;
    delete req.body.search;
    delete req.body.userCodeConfirmation;
    await updateMortgagee(req.body, req);
    res.send({
      message: "Update Mortgagee Successfully!",
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

Mortgagee.get("/search-mortgagee", async (req: Request, res: Response) => {
  const { mortgageeSearch } = req.query;
  try {
    const mortgagee: any = await searchMortgagee(
      mortgageeSearch as string,
      false,
      req
    );
    res.send({
      message: "Search Policy Account Successfuly",
      success: true,
      mortgagee,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});

Mortgagee.get("/export-mortgagee", async (req, res) => {
  const subAccountHeaders: any = {
    Mortgagee: {
      header: ["Policy", "Mortgagee", "Created At"],
      row: ["Policy", "Mortgagee", "createdAt"],
    },
  };
  const { mortgageeSearch, isAll } = req.query;

  let data = [];
  if (JSON.parse(isAll as string)) {
    data = mapDataBasedOnHeaders(
      (await searchMortgagee("", true, req)) as Array<any>,
      subAccountHeaders,
      "Mortgagee"
    );
  } else {
    data = mapDataBasedOnHeaders(
      (await searchMortgagee(
        mortgageeSearch as string,
        false,
        req
      )) as Array<any>,
      subAccountHeaders,
      "Mortgagee"
    );
  }

  ExportToExcel(data, res);
});

export default Mortgagee;
