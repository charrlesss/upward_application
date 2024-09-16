import { PrismaClient } from "@prisma/client";
import express from "express";
import { format } from "date-fns";

const ProductionReports = express.Router();
const prisma = new PrismaClient();

const mapColumnsToKeys = (columns: string[], result: any) => {
  const newResult = result.map((item: any) => {
    const newItem: any = {};
    for (let i = 0; i < columns.length; i++) {
      newItem[columns[i]] = item[`f${i}`];
    }
    return newItem;
  });
  return newResult;
};

ProductionReports.post("/production-report", async (req, res) => {
  const {
    dateFrom,
    dateTo,
    policy_type,
    format2,
    report_type,
    account,
    sort,
    mortgagee,
  } = req.body;

  console.log(req.body);
  
  const tableCol = [
    "Mortgagee",
    "IDNo",
    "AssuredName",
    "Account",
    "PolicyType",
    "PolicyNo",
    "DateIssued",
    "TotalPremium",
    "Vat",
    "DocStamp",
    "FireTax",
    "LGovTax",
    "Notarial",
    "Misc",
    "TotalDue",
    "TotalPaid",
    "Discount",
    "Sec4A",
    "Sec4B",
    "Sec4C",
    "EffictiveDate",
    "PLimit",
    "InsuredValue",
    "CoverNo",
    "Remarks",
    "EstimatedValue",
    "Make",
    "BodyType",
    "PlateNo",
    "ChassisNo",
    "MotorNo",
    "Mortgagee",
  ];

  const query = `CALL ProductionReport('${format(
    new Date(dateFrom),
    "yyyy-MM-dd"
  )}', '${format(
    new Date(dateTo),
    "yyyy-MM-dd"
  )} ', '${account}', '${report_type}', ${format2}, '${
    mortgagee === "All" ? "" : mortgagee
  }', '${policy_type}', '${sort}');`;
  console.log(query);

  const report: any = await prisma.$queryRawUnsafe(query);
  const data = mapColumnsToKeys(tableCol, report);
  res.send({
    report: data,
  });
});
ProductionReports.get("/getaccount", async (req, res) => {
  return res.send({
    accounts: await prisma.policy_account.findMany({
      select: { Account: true },
    }),
    tpl: await prisma.$queryRawUnsafe(
      `SELECT * FROM upward.mortgagee where Policy = 'TPL'`
    ),
  });
});
ProductionReports.post("/renewal-notice", async (req, res) => {
  let { dateFrom, report_type } = req.body;
  let tableCol: any = [];
  report_type = report_type.toUpperCase();
  if (report_type === "COM") {
    tableCol = [
      "AssuredName",
      "PolicyNo",
      "Expiration",
      "InsuredValue",
      "Make",
      "BodyType",
      "PlateNo",
      "ChassisNo",
      "MotorNo",
      "TotalPremium",
      "Mortgagee",
    ];
  } else if (report_type === "FIRE") {
    tableCol = [
      "AssuredName",
      "PolicyNo",
      "Expiration",
      "InsuredValue",
      "TotalPremium",
      "Mortgage",
    ];
  } else if (report_type === "MAR") {
    tableCol = [
      "AssuredName",
      "PolicyNo",
      "Expiration",
      "InsuredValue",
      "TotalPremium",
    ];
  } else if (report_type === "PA") {
    tableCol = ["AssuredName", "PolicyNo", "Expiration", "TotalPremium"];
  }

  const query = `call renewal_report('${format(
    new Date(dateFrom),
    "yyyy-MM-dd"
  )}','${report_type}','Policy No#');`;
  const report: any = await prisma.$queryRawUnsafe(query);
  const data = mapColumnsToKeys(tableCol, report);
  res.send({
    report: data,
  });
});

export default ProductionReports;
