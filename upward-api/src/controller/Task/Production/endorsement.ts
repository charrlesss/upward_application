import express, { Request } from "express";
import { prisma } from "../..";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
const Endorsement = express.Router();

Endorsement.post(
  "/endorsement/get-endorsement-by-policyno",
  async (req, res) => {
    try {
      res.send({
        message: "Successfully get data",
        success: true,
        data: await prisma.$queryRawUnsafe(
          `select * from  gpa_endorsement where policyNo = ?`,
          req.body.policyNo
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
    } else {
      const hasEndorsementNo = (await prisma.$queryRawUnsafe(
        `select *  from  gpa_endorsement where endorsement_no = ?`,
        req.body.endorsement_no
      )) as Array<any>;

      if (hasEndorsementNo.length > 0) {
        return res.send({
          message: `Endorsement No is already exist!`,
          success: false,
        });
      }
    }
    let message =
      req.body.mode === "update"
        ? `Successfully Update  Endorsement - ${req.body.endorsement_no}`
        : `Successfully Add New Endorsement - ${req.body.endorsement_no}`;

    delete req.body.mode;
    req.body.datefrom = new Date(req.body.datefrom);
    req.body.dateto = new Date(req.body.dateto);
    await prisma.gpa_endorsement.create({ data: req.body });
    res.send({
      message,
      success: true,
      data: await prisma.$queryRawUnsafe(
        `select * from  gpa_endorsement where policyNo = ?`,
        req.body.policyNo
      ),
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
      message:`Successfully Delete Endorsement - ${req.body.endorsement_no}`,
      success: true,
      data: await prisma.$queryRawUnsafe(
        `select * from  gpa_endorsement where policyNo = ?`,
        req.body.policyNo
      ),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

export default Endorsement;
