import express from "express";
import ProductionReport from "./Production";
import AccountingReport from "./Accounting";

const Reports = express.Router();

Reports.use("/reports", ProductionReport);
Reports.use("/reports", AccountingReport);

export default Reports;
