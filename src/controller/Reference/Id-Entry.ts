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
} from "../../model/Reference/id-entry.model";
// import { IDGenerator, UpdateId } from "../../model/StoredProcedure";
import { ExportToExcel } from "../../lib/exporttoexcel";
import { mapDataBasedOnHeaders } from "../../lib/mapbaseonheader";
import saveUserLogs from "../../lib/save_user_logs";
import { saveUserLogsCode } from "../../lib/saveUserlogsCode";
import { VerifyToken } from "../Authentication";

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
    await CreateEmployeeEntry(req.body, req);
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
    await CreateAgentEntry(req.body, req);
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
    await CreateFixedAssetstEntry(req.body, req);
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
    await CreateSupplierEntry(req.body, req);
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
    await CreateOtherEntry(req.body, req);
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

ID_Entry.get("/export-entry", async (req, res) => {
  const entryHeaders: any = {
    Client: {
      header: [
        "Entry Client ID",
        "Company",
        "Firstname",
        "Middlename",
        "Lastname",
        "Email",
        "Mobile",
        "Telephone",
        "Address",
        "Sub Account",
        "Option",
        "Created At",
      ],
      row: [
        "entry_client_id",
        "company",
        "firstname",
        "middlename",
        "lastname",
        "email",
        "mobile",
        "telephone",
        "address",
        "NewShortName",
        "option",
        "createdAt",
      ],
    },
    Employee: {
      header: [
        "Entry Employee ID",
        "Firstname",
        "Middlename",
        "Lastname",
        "Sub Account",
        "Created At",
        "Address",
      ],
      row: [
        "entry_employee_id",
        "firstname",
        "middlename",
        "lastname",
        "NewShortName",
        "createdAt",
        "address",
      ],
    },
    Agent: {
      header: [
        "Entry Agent ID",
        "Firstname",
        "Middlename",
        "Lastname",
        "Email",
        "Mobile",
        "Telephone",
        "Created At",
        "Address",
      ],
      row: [
        "entry_agent_id",
        "firstname",
        "middlename",
        "lastname",
        "email",
        "mobile",
        "telephone",
        "createdAt",
        "address",
      ],
    },
    "Fixed Assets": {
      header: [
        "Entry Fixed Assets ID",
        "Fullname",
        "Description",
        "Remarks",
        "Created At",
      ],
      row: [
        "entry_fixed_assets_id",
        "fullname",
        "description",
        "remarks",
        "createdAt",
      ],
    },
    Supplier: {
      header: [
        "Entry Supplier ID",
        "Company",
        "Firstname",
        "Middlename",
        "Lastname",
        "Email",
        "Mobile",
        "Telephone",
        "Address",
        "TIN NO",
        "VAT Type",
        "Option",
        "Created At",
      ],
      row: [
        "entry_supplier_id",
        "company",
        "firstname",
        "middlename",
        "lastname",
        "email",
        "mobile",
        "telephone",
        "address",
        "tin_no",
        "VAT_Type",
        "option",
        "createdAt",
      ],
    },
    Others: {
      header: ["Entry Others ID", "Description", "Created At"],
      row: ["entry_others_id", "description", "createdAt"],
    },
  };
  const { entry, entrySearch, isAll } = req.query;
  let data = [];
  if (JSON.parse(isAll as string)) {
    data = mapDataBasedOnHeaders(
      (await searchEntry(entry as string, "", true, req)) as Array<any>,
      entryHeaders,
      entry as string
    );
  } else {
    data = mapDataBasedOnHeaders(
      (await searchEntry(
        entry as string,
        entrySearch as string,
        false,
        req
      )) as Array<any>,
      entryHeaders,
      entry as string
    );
  }
  ExportToExcel(data, res);
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

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default ID_Entry;
