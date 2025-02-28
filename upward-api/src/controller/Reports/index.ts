import express from "express";
import ProductionReport from "./Production";
import AccountingReport from "./Accounting";

const Reports = express.Router();

Reports.use("/reports", ProductionReport);
Reports.use("/reports", AccountingReport);

Reports.post('/sample-excel', (req, res) => {
    console.log(req.body)
    res.send({
        hello: "world"
    })
})

export default Reports;
