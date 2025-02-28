import express from "express";
import ProductionReports from "./production-report";
import RenewalReport from "./renewal-report";
import ReportFields from "./report-fields";


const ProductionReport = express.Router();

ProductionReport.use('/reports',ProductionReports)
ProductionReport.use('/reports',RenewalReport)
ProductionReport.use('/reports',ReportFields)


export default ProductionReport