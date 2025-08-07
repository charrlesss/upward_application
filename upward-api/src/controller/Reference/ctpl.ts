import express, { Request, Response } from "express";
import { mapDataBasedOnHeaders } from "../../lib/mapbaseonheader";
import { ExportToExcel } from "../../lib/exporttoexcel";
import {
  getPrefix,
  searchCTPL,
  addCTPL,
  updateCTPL,
  deleteCTPL,
  getType,
  findCtplById,
  findCtplfExist,
} from "../../model/Reference/ctpl.model";
import { getUserById } from "../../model/StoredProcedure";
import generateUniqueUUID from "../../lib/generateUniqueUUID";
import {
  createJournal,
  deleteJournal,
  findManyJournal,
  updateJournal,
} from "../../model/Task/Production/vehicle-policy";
import saveUserLogs from "../../lib/save_user_logs";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import { VerifyToken } from "../Authentication";
import { format } from "date-fns";
import { prisma } from "..";

const CTPL = express.Router();
function getZeroFirstInput(data: string) {
  let addZeroFromSeries = "";
  for (let i = 0; i < data.length; i++) {
    if (data.charAt(i) === "0") {
      addZeroFromSeries += "0";
    } else {
      break;
    }
  }
  return addZeroFromSeries;
}

CTPL.post("/add-ctpl", async (req: Request, res: Response) => {
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
    delete req.body.ctplId;
    req.body.createdAt = new Date();
    const user = await getUserById((req.user as any).UserId);
    const ctplID = await generateUniqueUUID("ctplregistration", "ctplId");
    const { Prefix, NumSeriesFrom, NumSeriesTo, Cost } = req.body;

    // if (!req.body.Prefix.match(/^[A-Za-z]+$/)) {
    //   return res.send({
    //     message: "Invalid Prefix contain number!",
    //     success: false,
    //   });
    // }

    let addZeroFromSeries = getZeroFirstInput(NumSeriesFrom);
    let addZeroToSeries = getZeroFirstInput(NumSeriesTo);

    if (parseInt(NumSeriesFrom) > parseInt(NumSeriesTo)) {
      return res.send({
        message: "Invalid Series!",
        success: false,
      });
    }

    if (
      await checkSeries(`${Prefix}${NumSeriesFrom}`, `${Prefix}${NumSeriesTo}`)
    ) {
      return res.send({
        message: "This Series is already exist",
        success: false,
      });
    }

    for (let i = parseInt(NumSeriesFrom); i <= parseInt(NumSeriesTo); i++) {
      const _sourceNo = `${Prefix}${addZeroFromSeries}${i}`;
      // DEBIT'
      const newDate = format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS");
      await createJournal(
        {
          Source_No: _sourceNo,
          Branch_Code: "HO",
          Date_Entry: newDate,
          Source_Type: "GL",
          Explanation: "CTPL Registration",
          GL_Acct: "1.04.01",
          cGL_Acct: "CTPL Inventory",
          Debit: parseFloat(Cost),
          Credit: 0,
          TC: "CTI",
          Source_No_Ref_ID: ctplID,
        },
        req
      );
      // Credit
      await createJournal(
        {
          Source_No: _sourceNo,
          Branch_Code: "HO",
          Date_Entry: newDate,
          Source_Type: "GL",
          Explanation: "CTPL Registration",
          GL_Acct: "1.03.04",
          cGL_Acct: "Advance Remittance",
          Debit: 0,
          Credit: parseFloat(Cost),
          TC: "ADR",
          Source_No_Ref_ID: ctplID,
        },
        req
      );
    }
    req.body.NumSeriesFrom = req.body.NumSeriesFrom;
    req.body.NumSeriesTo = req.body.NumSeriesTo;

    await addCTPL(
      {
        ...req.body,
        ctplId: ctplID,
        CreatedBy: (user as any)?.Username,
      },
      req
    );
    await saveUserLogs(req, ctplID, "add", "CTPL");
    return res.send({
      message: "Create CTPL Successfully!",
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

CTPL.post("/delete-ctpl", async (req: Request, res: Response) => {
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
    const tpldID = req.body.ctplId;
    if (!(await saveUserLogsCode(req, "delete", tpldID, "CTPL"))) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    await prisma.$queryRawUnsafe(
      `
      delete 
      from journal 
      where 
        (GL_Acct = '1.03.04' || GL_Acct = '1.04.01') 
        and (TC = 'ADR' || TC = 'CTI') 
        and  Source_Type = 'GL' 
        and Explanation = 'CTPL Registration'
        and Source_No 
        between ? 
        and ? 
      order by Source_No`,
      `${req.body.Prefix}${req.body.NumSeriesFrom}`,
      `${req.body.Prefix}${req.body.NumSeriesTo}`
    );

    await prisma.$queryRawUnsafe(
      `delete FROM ctplregistration where ctplId = ?`,
      req.body.ctplId
    );

    res.send({
      message: "Delete CTPL Successfully!",
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

CTPL.post("/update-ctpl", async (req: Request, res: Response) => {
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
        `${req.body.NumSeriesFrom} - ${req.body.NumSeriesTo}`,
        "CTPL"
      ))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    const dataToRemove: Array<any> = await prisma.$queryRawUnsafe(
      `
      select 
        * 
      from journal 
      where 
        (GL_Acct = '1.03.04' || GL_Acct = '1.04.01') 
        and (TC = 'ADR' || TC = 'CTI') 
        and  Source_Type = 'GL' 
        and Explanation = 'CTPL Registration'
        and Source_No 
        between ?
        and ?
      order by Source_No`,
      `${req.body.Prefix}${req.body.NumSeriesFrom}`,
      `${req.body.Prefix}${req.body.NumSeriesTo}`
    );

    await prisma.$queryRawUnsafe(
      `
      delete 
      from journal 
      where 
        (GL_Acct = '1.03.04' || GL_Acct = '1.04.01') 
        and (TC = 'ADR' || TC = 'CTI') 
        and  Source_Type = 'GL' 
        and Explanation = 'CTPL Registration'
        and Source_No 
        between ? 
        and ? 
      order by Source_No`,
      `${req.body.Prefix}${req.body.NumSeriesFrom}`,
      `${req.body.Prefix}${req.body.NumSeriesTo}`
    );

    if (
      await checkSeries(
        `${req.body.NewPrefix}${req.body.NewSeriesFrom}`,
        `${req.body.NewPrefix}${req.body.NewSeriesTo}`
      )
    ) {
      await prisma.journal.createMany({ data: dataToRemove });
      return res.send({
        message: "This Series is already exist",
        success: false,
      });
    } else {
      await prisma.$queryRawUnsafe(
        `delete FROM ctplregistration where ctplId = ?`,
        req.body.ctplId
      );

      let addZeroFromSeries = getZeroFirstInput(req.body.NewSeriesFrom);
      let addZeroToSeries = getZeroFirstInput(req.body.NewSeriesTo);

      for (
        let i = parseInt(req.body.NewSeriesFrom);
        i <= parseInt(req.body.NewSeriesTo);
        i++
      ) {
        const _sourceNo = `${req.body.NewPrefix}${addZeroFromSeries}${i}`;
        // DEBIT'
        const newDate = format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS");
        await createJournal(
          {
            Source_No: _sourceNo,
            Branch_Code: "HO",
            Date_Entry: newDate,
            Source_Type: "GL",
            Explanation: "CTPL Registration",
            GL_Acct: "1.04.01",
            cGL_Acct: "CTPL Inventory",
            Debit: parseFloat(req.body.Cost),
            Credit: 0,
            TC: "CTI",
            Source_No_Ref_ID: req.body.ctplId,
          },
          req
        );
        // Credit
        await createJournal(
          {
            Source_No: _sourceNo,
            Branch_Code: "HO",
            Date_Entry: newDate,
            Source_Type: "GL",
            Explanation: "CTPL Registration",
            GL_Acct: "1.03.04",
            cGL_Acct: "Advance Remittance",
            Debit: 0,
            Credit: parseFloat(req.body.Cost),
            TC: "ADR",
            Source_No_Ref_ID: req.body.ctplId,
          },
          req
        );
      }

      const user = await getUserById((req.user as any).UserId);
      await addCTPL(
        {
          Prefix: req.body.NewPrefix,
          NumSeriesFrom: req.body.NewSeriesFrom,
          NumSeriesTo: req.body.NewSeriesTo,
          Cost: req.body.Cost,
          ctplType: req.body.ctplType,
          ctplId: req.body.ctplId,
          Vehicle: req.body.Vehicle,
          CreatedBy: (user as any)?.Username,
        },
        req
      );

      await saveUserLogs(
        req,
        `${req.body.ctplId} -
        New Series (${req.body.NewPrefix}, ${req.body.NewSeriesFrom}, ${req.body.NewSeriesTo}) - 
        Old Series (${req.body.Prefix}, ${req.body.NumSeriesFrom}, ${req.body.NumSeriesTo})`,
        "edit",
        "CTPL"
      );

      res.send({
        message: "Update Ctpl Successfully!",
        success: true,
      });
    }
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});

async function checkSeries(NumSeriesFrom: string, NumSeriesTo: string) {
  const checkSeries: Array<any> = await prisma.$queryRawUnsafe(
    `
      SELECT EXISTS (
          SELECT 1 
          FROM journal 
          WHERE 
           (GL_Acct = '1.03.04'
                || GL_Acct = '1.04.01')
          AND (TC = 'ADR' || TC = 'CTI')
          AND Source_Type = 'GL'
          AND Explanation = 'CTPL Registration'
          AND
          Source_No BETWEEN ? AND ?
      ) AS exists_flag;`,
    NumSeriesFrom,
    NumSeriesTo
  );

  console.log(checkSeries);
  return Boolean(parseInt(checkSeries[0].exists_flag.toString()));
}

CTPL.post("/search-ctpl", async (req: Request, res: Response) => {
  try {
    res.send({
      message: "Search Policy Account Successfuly",
      success: true,
      data: await searchCTPL(req.body.search),
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

export default CTPL;
