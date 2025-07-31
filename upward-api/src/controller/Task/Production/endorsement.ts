import express, { Request } from "express";
import { prisma } from "../..";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { defaultFormat } from "../../../lib/defaultDateFormat";
import saveUserLogs from "../../../lib/save_user_logs";
const Endorsement = express.Router();

const qry = `
select 
  endorsement_id,
  endorsement_no,
  policyNo,
  name,
  address,
  dateissued,
  datefrom,
  dateto,
  FORMAT(CAST(REPLACE(suminsured, ',', '') AS DECIMAL(20,2)), 2) as suminsured,
  deleted,
  replacement,
  additional,
  FORMAT(CAST(REPLACE(totalpremium, ',', '') AS DECIMAL(20,2)), 2) as totalpremium,
  FORMAT(CAST(REPLACE(docstamp, ',', '') AS DECIMAL(20,2)), 2) as docstamp,
  lgovtaxpercent,
  FORMAT(CAST(REPLACE(lgovtax, ',', '') AS DECIMAL(20,2)), 2) as lgovtax,
  FORMAT(CAST(REPLACE(totaldue, ',', '') AS DECIMAL(20,2)), 2) as totaldue,
  FORMAT(CAST(REPLACE(vat, ',', '') AS DECIMAL(20,2)), 2) as vat
from  gpa_endorsement where policyNo = ?
`;
Endorsement.post(
  "/endorsement/get-endorsement-by-policyno",
  async (req, res) => {
    try {
      res.send({
        message: "Successfully get data",
        success: true,
        data: await prisma.$queryRawUnsafe(qry, req.body.policyNo),
      });
    } catch (error: any) {
      console.log(error.message);

      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);

Endorsement.post("/endorsement/add-new-endorsement", async (req, res) => {
  try {
    if (req.body.mode === "update") {
      if (
        !(await saveUserLogsCode(
          req,
          "update",
          req.body.endorsement_no,
          "Endorsement"
        ))
      ) {
        return res.send({ message: "Invalid User Code", success: false });
      }

      delete req.body.userCodeConfirmation;
      await prisma.$queryRawUnsafe(
        `delete from  gpa_endorsement where endorsement_no = ?`,
        req.body.endorsement_no
      );

      await prisma.$queryRawUnsafe(
        `delete FROM journal where Source_No = ?`,
        req.body.endorsement_no
      );
    } else {
      const hasEndorsementNo = (await prisma.$queryRawUnsafe(
        `select * from  gpa_endorsement where endorsement_no = ?`,
        req.body.endorsement_no
      )) as Array<any>;

      if (hasEndorsementNo.length > 0) {
        return res.send({
          message: `Endorsement No is already exist!`,
          success: false,
        });
      }

      await saveUserLogs(req, req.body.endorsement_no, "add", "Endorsement");
    }
    let message =
      req.body.mode === "update"
        ? `Successfully Update  Endorsement - ${req.body.endorsement_no}`
        : `Successfully Add New Endorsement - ${req.body.endorsement_no}`;

    delete req.body.mode;
    req.body.datefrom = new Date(req.body.datefrom);
    req.body.dateto = new Date(req.body.dateto);
    req.body.dateissued = new Date(req.body.dateissued);
    await prisma.gpa_endorsement.create({ data: req.body });
    await prisma.journal.create({
      data: {
        Branch_Code: "HO",
        Date_Entry: defaultFormat(req.body.datefrom), // Assuming dtpDate is a valid date
        Source_Type: "PL",
        Source_No: req.body.endorsement_no,
        Explanation: `ENDORSEMENT NO. ${req.body.endorsement_no} ${req.body.name} (${req.body.policyNo})`,
        GL_Acct: "1.03.01",
        cGL_Acct: "Premium Receivables",
        cSub_Acct: "HO",
        cID_No: req.body.name,
        Debit: req.body.totaldue,
        Credit: "0.00",
        TC: "P/R",
        Remarks: "--ENDORSEMENT--",
        Sub_Acct: "Head Office",
        ID_No: req.body.policyNo,
        VAT_Type: "Non-VAT",
        OR_Invoice_No: "",
        Source_No_Ref_ID: "",
      },
    });
    await prisma.journal.create({
      data: {
        Branch_Code: "HO",
        Date_Entry: defaultFormat(req.body.datefrom), // Assuming dtpDate is a valid date
        Source_Type: "PL",
        Source_No: req.body.endorsement_no,
        Explanation: `ENDORSEMENT NO. ${req.body.endorsement_no} ${req.body.name} (${req.body.policyNo})`,
        GL_Acct: "4.02.01",
        cGL_Acct: "Accounts Payable",
        cSub_Acct: "HO",
        cID_No: req.body.name,
        Debit: "0.00",
        Credit: req.body.totaldue,
        TC: "A/P",
        Remarks: "--ENDORSEMENT--",
        Sub_Acct: "Head Office",
        ID_No: req.body.policyNo,
        VAT_Type: "Non-VAT",
        OR_Invoice_No: "",
        Source_No_Ref_ID: "",
      },
    });

    res.send({
      message,
      success: true,
      data: await prisma.$queryRawUnsafe(qry, req.body.policyNo),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

Endorsement.post("/endorsement/delete-endorsement", async (req, res) => {
  try {
    if (
      !(await saveUserLogsCode(
        req,
        "delete",
        req.body.endorsement_no,
        "Endorsement"
      ))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    delete req.body.userCodeConfirmation;
    await prisma.$queryRawUnsafe(
      `delete from  gpa_endorsement where endorsement_no = ?`,
      req.body.endorsement_no
    );

    res.send({
      message: `Successfully Delete Endorsement - ${req.body.endorsement_no}`,
      success: true,
      data: await prisma.$queryRawUnsafe(qry, req.body.policyNo),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

Endorsement.post("/endorsement/endorsement-list", async (req, res) => {
  try {
    res.send({
      message: "Successfully get data",
      success: true,
      data: await prisma.$queryRawUnsafe(
        `select 
           endorsement_id,
           endorsement_no,
           policyNo,
           name,
           address,
           datefrom,
           dateto,
           FORMAT(CAST(REPLACE(suminsured, ',', '') AS DECIMAL(20,2)), 2) as suminsured,
           deleted,
           replacement,
           additional,
           FORMAT(CAST(REPLACE(totalpremium, ',', '') AS DECIMAL(20,2)), 2) as totalpremium,
           FORMAT(CAST(REPLACE(docstamp, ',', '') AS DECIMAL(20,2)), 2) as docstamp,
           lgovtaxpercent,
           FORMAT(CAST(REPLACE(lgovtax, ',', '') AS DECIMAL(20,2)), 2) as lgovtax,
           FORMAT(CAST(REPLACE(totaldue, ',', '') AS DECIMAL(20,2)), 2) as totaldue,
           FORMAT(CAST(REPLACE(vat, ',', '') AS DECIMAL(20,2)), 2) as vat
          from  gpa_endorsement where policyNo like ? OR  name like ? OR endorsement_no like ?`,
        `%${req.body.search}%`,
        `%${req.body.search}%`,
        `%${req.body.search}%`
      ),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});

export default Endorsement;
