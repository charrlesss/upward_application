import express, { Request, Response } from "express";
import {
  CreateAgentEntry,
  CreateClientEntry,
  CreateEmployeeEntry,
  CreateFixedAssetstEntry,
  CreateOtherEntry,
  CreateSupplierEntry,
  deleteEntry,
  getAllSubAccount,
  getSubAccounts,
  IDGenerator,
  searchEntry,
  updateEntry,
  UpdateId,
  deleteClientById,
  deleteEmployeeById,
  deleteAgentById,
  deleteFixedAssetsById,
  deleteOthersById,
  deleteSupplierById,
} from "../../model/Reference/id-entry.model";
import saveUserLogs from "../../lib/save_user_logs";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import { VerifyToken } from "../Authentication";
import { drawExcel } from "../../lib/excel-generator";
import { prisma } from "../../controller";

const ID_Entry = express.Router();

ID_Entry.post("/id-entry-client", async (req: Request, res: Response) => {
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

  const [s, ym, newCount] = req.body.entry_client_id.split("-");
  const newMonth = ym.substring(0, 2);
  const newYear = ym.substring(2);
  req.body.createdAt = new Date();
  delete req.body.mode;
  delete req.body.search;
  try {
    delete req.body.NewShortName;
    await CreateClientEntry(req.body, req);
    await UpdateId("entry client", newCount, newMonth, newYear, req);
    await saveUserLogs(req, req.body.entry_client_id, "add", "Entry Client");

    res.send({
      message: "Successfully Create New Client ID Entry",
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

ID_Entry.post("/id-entry-employee", async (req: Request, res: Response) => {
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
  const [s, ym, newCount] = req.body.entry_employee_id.split("-");
  const newMonth = ym.substring(0, 2);
  const newYear = ym.substring(2);

  req.body.createdAt = new Date();
  delete req.body.mode;
  delete req.body.search;
  try {
    await CreateEmployeeEntry(req.body);
    await UpdateId("entry employee", newCount, newMonth, newYear, req);
    await saveUserLogs(
      req,
      req.body.entry_employee_id,
      "add",
      "Entry Employee"
    );
    res.send({
      message: "Successfully Create New Employee ID Entry",
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

ID_Entry.post("/id-entry-agent", async (req: Request, res: Response) => {
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

  const [s, ym, newCount] = req.body.entry_agent_id.split("-");
  const newMonth = ym.substring(0, 2);
  const newYear = ym.substring(2);
  req.body.createdAt = new Date();
  delete req.body.mode;
  delete req.body.search;
  try {
    await CreateAgentEntry(req.body);
    await UpdateId("entry agent", newCount, newMonth, newYear, req);
    await saveUserLogs(req, req.body.entry_agent_id, "add", "Entry Agent");

    res.send({
      message: "Successfully Create New Agent ID Entry",
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

ID_Entry.post("/id-entry-fixed-assets", async (req: Request, res: Response) => {
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
  const [s, ym, newCount] = req.body.entry_fixed_assets_id.split("-");
  const newMonth = ym.substring(0, 2);
  const newYear = ym.substring(2);
  req.body.createdAt = new Date();
  delete req.body.mode;
  delete req.body.search;
  try {
    await CreateFixedAssetstEntry(req.body);
    await UpdateId("entry fixed assets", newCount, newMonth, newYear, req);
    await saveUserLogs(
      req,
      req.body.entry_fixed_assets_id,
      "add",
      "Entry Fixed Assets"
    );

    res.send({
      message: "Successfully Create New Fixed Assets ID Entry",
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

ID_Entry.post("/id-entry-supplier", async (req: Request, res: Response) => {
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
  const [s, ym, newCount] = req.body.entry_supplier_id.split("-");
  const newMonth = ym.substring(0, 2);
  const newYear = ym.substring(2);
  req.body.createdAt = new Date();
  delete req.body.mode;
  delete req.body.search;
  try {
    await CreateSupplierEntry(req.body);
    await UpdateId("entry supplier", newCount, newMonth, newYear, req);
    await saveUserLogs(
      req,
      req.body.entry_supplier_id,
      "add",
      "Entry Supplier"
    );

    res.send({
      message: "Successfully Create New Supplier ID Entry",
      success: true,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.
`,
    });
  }
});

ID_Entry.post("/id-entry-others", async (req: Request, res: Response) => {
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
  const [s, ym, newCount] = req.body.entry_others_id.split("-");
  const newMonth = ym.substring(0, 2);
  const newYear = ym.substring(2);
  req.body.createdAt = new Date();
  delete req.body.mode;
  delete req.body.search;
  try {
    await CreateOtherEntry(req.body);
    await UpdateId("entry others", newCount, newMonth, newYear, req);
    await saveUserLogs(req, req.body.entry_others_id, "add", "Entry Others");

    res.send({
      message: "Successfully Create New Other ID Entry",
      success: true,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.
`,
    });
  }
});

ID_Entry.post("/entry-update", async (req, res) => {
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
    const list = [
      { key: "entry_others_id", module: "Entry Others" },
      { key: "entry_client_id", module: "Entry Client" },
      { key: "entry_employee_id", module: "Entry Employee" },
      { key: "entry_agent_id", module: "Entry Agent" },
      { key: "entry_fixed_assets_id", module: "Entry Fixed Assets" },
      { key: "entry_supplier_id", module: "Entry Supplier" },
    ];
    const obj = req.body;
    const requester = { id: "", module: "" };
    for (const key of Object.keys(obj)) {
      if (list.map((itms) => itms.key).includes(key)) {
        requester.id = obj[key];
        requester.module = list.filter((itms) => itms.key === key)[0].module;
        break;
      }
    }
    if (
      !(await saveUserLogsCode(req, "edit", requester.id, requester.module))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }
    delete req.body.NewShortName;
    delete req.body.mode;
    delete req.body.search;
    delete req.body.userCodeConfirmation;

    await updateEntry(req.query.entry as string, req.body, req);
    res.send({ message: "Update Successfully", success: true });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.
`,
    });
  }
});

ID_Entry.post(
  "/id-entry-client-update",
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

    if (
      !(await saveUserLogsCode(req, "edit", JSON.stringify(req.body), "client"))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    delete req.body.userCodeConfirmation;

    await deleteClientById(req.body.entry_client_id, req);

    req.body.createdAt = new Date();
    delete req.body.mode;
    delete req.body.search;
    try {
      delete req.body.NewShortName;
      await CreateClientEntry(req.body, req);
      // await UpdateId("entry client", newCount, newMonth, newYear, req);
      await saveUserLogs(req, req.body.entry_client_id, "add", "Entry Client");

      res.send({
        message: "Successfully Update Client ID Entry",
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
ID_Entry.post(
  "/id-entry-employee-update",
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

    if (
      !(await saveUserLogsCode(
        req,
        "edit",
        JSON.stringify(req.body),
        "employee"
      ))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    delete req.body.userCodeConfirmation;

    await deleteEmployeeById(req.body.entry_employee_id);

    req.body.createdAt = new Date();
    delete req.body.mode;
    delete req.body.search;
    try {
      delete req.body.NewShortName;
      await CreateEmployeeEntry(req.body);
      // await UpdateId("entry client", newCount, newMonth, newYear, req);
      await saveUserLogs(
        req,
        req.body.entry_employee_id,
        "add",
        "Entry Employee"
      );

      res.send({
        message: "Successfully Update Employee ID Entry",
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

ID_Entry.post("/id-entry-agent-update", async (req: Request, res: Response) => {
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

  if (
    !(await saveUserLogsCode(req, "edit", JSON.stringify(req.body), "agent"))
  ) {
    return res.send({ message: "Invalid User Code", success: false });
  }

  delete req.body.userCodeConfirmation;

  await deleteAgentById(req.body.entry_agent_id);

  req.body.createdAt = new Date();
  delete req.body.mode;
  delete req.body.search;
  try {
    delete req.body.NewShortName;
    await CreateAgentEntry(req.body);
    // await UpdateId("entry client", newCount, newMonth, newYear, req);
    await saveUserLogs(req, req.body.entry_agent_id, "add", "Entry Agent");

    res.send({
      message: "Successfully Update Agent  ID Entry",
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

ID_Entry.post(
  "/id-entry-fixed-assets-update",
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

    if (
      !(await saveUserLogsCode(
        req,
        "edit",
        JSON.stringify(req.body),
        "Fixed Assets"
      ))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    delete req.body.userCodeConfirmation;

    await deleteFixedAssetsById(req.body.entry_fixed_assets_id);

    req.body.createdAt = new Date();
    delete req.body.mode;
    delete req.body.search;
    try {
      delete req.body.NewShortName;
      await CreateFixedAssetstEntry(req.body);

      res.send({
        message: "Successfully Update Fixed Assets  ID Entry",
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
ID_Entry.post(
  "/id-entry-others-update",
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

    if (
      !(await saveUserLogsCode(req, "edit", JSON.stringify(req.body), "others"))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    delete req.body.userCodeConfirmation;

    await deleteOthersById(req.body.entry_others_id);

    req.body.createdAt = new Date();
    delete req.body.mode;
    delete req.body.search;
    try {
      delete req.body.NewShortName;
      await CreateOtherEntry(req.body);
      await saveUserLogs(
        req,
        req.body.entry_others_id,
        "update",
        "Entry Others"
      );

      res.send({
        message: "Successfully Update Others ID Entry",
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
ID_Entry.post(
  "/id-entry-supplier-update",
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

    if (
      !(await saveUserLogsCode(
        req,
        "edit",
        JSON.stringify(req.body),
        "supplier"
      ))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    delete req.body.userCodeConfirmation;

    await deleteSupplierById(req.body.entry_supplier_id);

    req.body.createdAt = new Date();
    delete req.body.mode;
    delete req.body.search;
    try {
      delete req.body.NewShortName;
      await CreateSupplierEntry(req.body);
      await saveUserLogs(
        req,
        req.body.entry_supplier_id,
        "update",
        "Entry Supplier"
      );

      res.send({
        message: "Successfully Update  Supplier ID Entry",
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
ID_Entry.post("/id-entry-generate-id", async (req: Request, res: Response) => {
  res.send({
    success: false,
    message: "Generate ID Successfully",
    generateID: await IDGenerator(req.body.sign, req.body.type, req),
  });
});

ID_Entry.get("/id-entry-subaccounts", async (req: Request, res: Response) => {
  try {
    res.send({
      success: true,
      message: "Successfully Get All Sub Account",
      subaccount: await getAllSubAccount(req),
    });
  } catch (err: any) {
    res.send({ success: false, message: err.message });
  }
});

ID_Entry.get("/search-entry", async (req, res) => {
  const { entry, entrySearch } = req.query;
  try {
    res.send({
      success: true,
      message: "Successfully Get All Client Entry ",
      entry: await searchEntry(
        entry as string,
        entrySearch as string,
        false,
        req
      ),
    });
  } catch (err: any) {
    res.send({ success: false, message: err.message, entry: [] });
  }
});

ID_Entry.post("/search-entry", async (req, res) => {
  try {
    res.send({
      success: true,
      message: "Successfully Get All Client Entry ",
      entry: await searchEntry(req.body.entry, req.body.search, false, req),
    });
  } catch (err: any) {
    res.send({ success: false, message: err.message, entry: [] });
  }
});

ID_Entry.post("/entry-delete", async (req, res) => {
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
        "delete ",
        req.body.id,
        `Entry ${req.query.entry}`
      ))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    await deleteEntry(req.query.entry as string, req.body.id, req);
    res.send({
      success: true,
      message: "Successfully Delete",
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.
`,
    });
  }
});

ID_Entry.get("/sub-account", async (req: Request, res: Response) => {
  try {
    const subAccount: any = await getSubAccounts(req);
    const defaultValue = subAccount.filter(
      (itms: any) => itms.Acronym === "HO"
    );
    res.send({
      message: "Successfully get sub accounts",
      success: true,
      subAccount,
      defaultValue,
    });
  } catch (err: any) {
    res.send({ success: false, message: err.message });
  }
});

ID_Entry.post("/export-client-record", async (req: Request, res: Response) => {
  const title = req.body.title;
  const data = (await prisma.$queryRawUnsafe(
    `
    SELECT 
    a.*, 
    b.*,
    c.ShortName
FROM
    entry_client a
        LEFT JOIN
      contact_details b ON a.client_contact_details_id = b.contact_details_id
    LEFT JOIN
    sub_account c ON a.sub_account = c.Sub_Acct
    `
  )) as Array<any>;
  drawExcel(res, {
    columns: [
      { key: "entry_client_id", width: 22 },
      { key: "firstname", width: 30 },
      { key: "middlename", width: 30 },
      { key: "lastname", width: 30 },
      { key: "company", width: 55 },
      { key: "ShortName", width: 17 },
      { key: "client_mortgagee", width: 30 },
      { key: "mobile", width: 15 },
      { key: "address", width: 55 },
      { key: "createdAt", width: 17 },
    ],
    data: data,
    beforeDraw: (props: any, worksheet: any) => {
      title.split("\n").forEach((t: string, idx: number) => {
        const tt = worksheet.addRow([t]);
        props.mergeCells(
          idx + 1,
          props.alphabet[0],
          props.alphabet[props.columns.length - 1]
        );
        const alignColumns = props.alphabet.slice(0, props.columns.length);
        props.setAlignment(1, alignColumns, {
          horizontal: "left",
          vertical: "middle",
        });
        tt.font = { bolder: true };
      });
      props.setFontSize([1, 2, 3], 12);

      worksheet.addRow([]);
      worksheet.addRow([]);
      // Now, insert the column header row after the custom rows (row 3)
      const headerRow = worksheet.addRow([
        "CLIENT ID",
        "FIRST NAME",
        "MIDDLE NAME",
        "LAST NAME",
        "COMPANY",
        "SUB ACCOUNT",
        "CLIENT MORTGAGEE",
        "CONTACT NUMBER",
        "ADDRESS",
        "DATE CREATED",
      ]);
      headerRow.font = { bold: true };
      props.addBorder(6, props.alphabet.slice(0, props.columns.length), {
        bottom: { style: "thin" },
      });
    },
    onDraw: (props: any, rowItm: any, rowIdx: number) => {
  
    },
    afterDraw: (props: any, worksheet: any) => {
      // props.boldText(1, ["A", "B", "C", "D", "E", "F", "G", "H"]);
      // props.boldText(2, ["A", "B", "C", "D", "E", "F", "G", "H"]);
      // props.boldText(3, ["A", "B", "C", "D", "E", "F", "G", "H"]);

     

      // props.mergeCells(data.length - 1 + 7, "A", "C");
      // props.mergeCells(data.length - 1 + 7, "D", "F");
      // props.boldText(data.length - 1 + 7, [
      //   "A",
      //   "B",
      //   "C",
      //   "D",
      //   "E",
      //   "F",
      //   "G",
      //   "H",
      // ]);
      // props.addBorder(data.length - 1 + 7, ["G"], {
      //   top: { style: "thin" },
      // });
      // props.setAlignment(data.length - 1 + 7, ["G"], {
      //   horizontal: "right",
      //   vertical: "middle",
      // });
    },
  });
});

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default ID_Entry;
