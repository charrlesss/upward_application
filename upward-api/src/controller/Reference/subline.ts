import express, { Request, Response } from "express";
import { mapDataBasedOnHeaders } from "../../lib/mapbaseonheader";
import { ExportToExcel } from "../../lib/exporttoexcel";
import {
  addSubline,
  findSubline,
  getline,
  searchSubline,
  updateSubline,
  deletesubline,
  getNextId,
} from "../../model/Reference/subline.model";
import saveUserLogs from "../../lib/save_user_logs";
import generateUniqueUUID from "../../lib/generateUniqueUUID";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import { VerifyToken } from "../Authentication";

const Subline = express.Router();

Subline.post("/add-subline", async (req: Request, res: Response) => {
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
    req.body.createdAt = new Date();
    if (
      (await findSubline(req.body.Line, req.body.SublineName, req)).length > 0
    ) {
      return res.send({
        message: "Already Exist!",
        success: false,
      });
    }
    const ID = await generateUniqueUUID("subline", "ID");
    await addSubline({ ID, ...req.body }, req);
    await saveUserLogs(req, ID, "add", "Subline");
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

Subline.post("/delete-subline", async (req: Request, res: Response) => {
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
    if (!(await saveUserLogsCode(req, "delete", req.body.ID, "Subline"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    await deletesubline(req.body.ID, req);
    res.send({
      message: "Delete Subline Successfully!",
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

Subline.post("/update-subline", async (req: Request, res: Response) => {
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
    if (!(await saveUserLogsCode(req, "edit", req.body.ID, "Subline"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    delete req.body.mode;
    delete req.body.search;
    delete req.body.userCodeConfirmation;
    await updateSubline(
      {
        SublineName: req.body.SublineName,
        ID: req.body.ID,
      },
      req
    );
    res.send({
      message: "Update Subline Successfully!",
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

Subline.post("/search-subline", async (req: Request, res: Response) => {
  try {
    res.send({
      message: "Search Subline Successfuly",
      success: true,
      data: await searchSubline(req.body.search),
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

export default Subline;
