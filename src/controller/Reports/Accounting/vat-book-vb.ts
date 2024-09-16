import express from "express";
import { VATBook } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";

const VatBookVB = express.Router();

const { CustomPrismaClient } = PrismaList();
VatBookVB.post("/vat-book-vb", async (req, res) => {
  try {
const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);
    const qry = VATBook("Date", "ASC", "Monthly", new Date(), "ALL");
    res.send({
      message: "Successfully Get Report",
      success: true,
      qry,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      success: false,
      report: [],
    });
  }
});

export default VatBookVB;
