import express from "express";
import { prisma } from "../..";
import path from "path";
import { differenceInYears, format, formatDate } from "date-fns";
import PDFDocument from "pdfkit";
import fs from "fs";
import { selectClient } from "../../../model/Task/Accounting/pdc.model";
import { formatNumber } from "../Accounting/collection";
import PDFReportGenerator from "../../../lib/pdf-generator";

const StatementOfAccount = express.Router();

StatementOfAccount.post("/soa/search-by-policy", async (req, res) => {
  const data = await prisma.$queryRawUnsafe(
    `
    SELECT 
          a.PolicyType,
          a.PolicyNo,
          date_format(a.DateIssued,'%m/%d/%Y') as DateIssued,
          b.IDNo,
          b.Shortname
        
      FROM upward_insurance_umis.policy a
      left join (
      SELECT 
        "Client" as IDType,
        aa.entry_client_id AS IDNo,
        aa.sub_account,
        if(aa.option = "individual", CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname, ', '), ''),aa.firstname), aa.company) as Shortname,
        aa.entry_client_id as client_id,
        aa.address 
      FROM
        entry_client aa
      union all
      SELECT 
        "Agent" as IDType,
        aa.entry_agent_id AS IDNo,
        aa.sub_account,
        CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname, ', '),''), aa.firstname) AS Shortname,
        aa.entry_agent_id as client_id,
        aa.address
      FROM 
        entry_agent aa
      union all
      SELECT 
        "Employee" as IDType,
        aa.entry_employee_id AS IDNo,
        aa.sub_account,
        CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname , ', '),''), aa.firstname) AS Shortname,
        aa.entry_employee_id as client_id,
        aa.address  
      FROM
        entry_employee aa
      union all
      SELECT 
        "Supplier" as IDType,
        aa.entry_supplier_id AS IDNo,
        aa.sub_account,
        if(aa.option = "individual", CONCAT(IF(aa.lastname is not null AND aa.lastname <> '', CONCAT(aa.lastname, ', '),''),aa.firstname), aa.company) as Shortname,
        aa.entry_supplier_id as client_id,
        aa.address
      FROM
        entry_supplier aa
      union all
      SELECT 
        "Fixed Assets" as IDType,
        aa.entry_fixed_assets_id AS IDNo,
        aa.sub_account,
        aa.fullname AS Shortname,
        aa.entry_fixed_assets_id as client_id,
        aa.description as address
      FROM
        entry_fixed_assets aa
      union all
      SELECT 
        "Others" as IDType,
        aa.entry_others_id AS IDNo,
        aa.sub_account,
        aa.description AS Shortname,
        aa.entry_others_id as client_id,
        aa.description as address
      FROM
        entry_others aa
      )  b on b.IDNo = a.IDNo
      where
        a.PolicyNo like ? 
        OR  b.IDNo like ? 
        OR  b.Shortname like ?
     order by a.DateIssued desc
    limit 500
      ;
  `,
    `%${req.body.search}%`,
    `%${req.body.search}%`,
    `%${req.body.search}%`
  );
  try {
    res.send({
      message: "Successfully Policy Details",
      success: true,
      data,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});

StatementOfAccount.post("/soa/generate-soa", async (req, res) => {
  const qry = (policytablename: string) => `
  SELECT * FROM ${policytablename} a 
  left join policy b on a.PolicyNo = b.PolicyNo
  left join (${selectClient}) c on b.IDNo = c.IDNo
  where a.careOf = '${req.body.careOf}';`;

  const COMDATA = (await prisma.$queryRawUnsafe(qry("vpolicy"))) as Array<any>;
  const FIREDATA = (await prisma.$queryRawUnsafe(qry("fpolicy"))) as Array<any>;
  const MARINEDATA = (await prisma.$queryRawUnsafe(
    qry("mpolicy")
  )) as Array<any>;

  const BONDSDATA = (await prisma.$queryRawUnsafe(
    qry("bpolicy")
  )) as Array<any>;
  const MSPRDATA = (await prisma.$queryRawUnsafe(
    qry("msprpolicy")
  )) as Array<any>;

  const PADATA = (await prisma.$queryRawUnsafe(qry("papolicy"))) as Array<any>;
  const CGLDATA = (await prisma.$queryRawUnsafe(
    qry("cglpolicy")
  )) as Array<any>;

  const data: Array<any> = [];
  if (COMDATA.length > 0) {
    data.push({
      PolicyNo: "COMPREHENSIVE",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of COMDATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.DateFrom), "MM/dd/yyyy"),
          To: format(new Date(itm.DateTo), "MM/dd/yyyy"),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: "",
          Insured: `${itm.Model} ${itm.Make} ${itm.BodyType}`,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: itm.PlateNo,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: itm.ChassisNo,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }
  if (FIREDATA.length > 0) {
    data.push({
      PolicyNo: "FIRE",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of FIREDATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.DateFrom), "MM/dd/yyyy"),
          To: format(new Date(itm.DateTo), "MM/dd/yyyy"),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: "",
          Insured: itm.Location,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }
  if (MARINEDATA.length > 0) {
    data.push({
      PolicyNo: "MARINE",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of MARINEDATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.DateFrom), "MM/dd/yyyy"),
          To: format(new Date(itm.DateTo), "MM/dd/yyyy"),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }
  if (BONDSDATA.length > 0) {
    data.push({
      PolicyNo: "BONDS",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of BONDSDATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.BidDate), "MM/dd/yyyy"),
          To: bondsYear(itm),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: bondsPolicy(itm),
          Insured: itm.Obligee,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }
  if (PADATA.length > 0) {
    data.push({
      PolicyNo: "GPA",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of PADATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.PeriodFrom), "MM/dd/yyyy"),
          To: format(new Date(itm.PeriodTo), "MM/dd/yyyy"),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }
  if (CGLDATA.length > 0) {
    data.push({
      PolicyNo: "CGL",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      header: true,
    });
    for (const itm of CGLDATA) {
      const newData: Array<any> = [
        {
          PolicyNo: itm.PolicyNo,
          Insured: itm.Shortname,
          Premium: formatNumber(
            parseFloat(itm.TotalPremium.toString().replace(/,/g, ""))
          ),
          From: format(new Date(itm.PeriodFrom), "MM/dd/yyyy"),
          To: format(new Date(itm.PeriodTo), "MM/dd/yyyy"),
          GrossPremium: formatNumber(
            parseFloat(itm.TotalDue.toString().replace(/,/g, ""))
          ),
          solo: false,
        },
        {
          PolicyNo: "",
          Insured: itm.PolicyNo,
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          solo: true,
        },
        {
          PolicyNo: "",
          Insured: "",
          Premium: "",
          From: "",
          To: "",
          GrossPremium: "",
          gapPerRow: true,
        },
      ];
      data.push(...newData);
    }
    data.push({
      PolicyNo: "",
      Insured: "",
      Premium: "",
      From: "",
      To: "",
      GrossPremium: "",
      gap: true,
    });
  }

  function bondsYear(itm: any) {
    const PolicyType = itm.PolicyType.trim();
    if (PolicyType === "G02") {
      return "120 Days";
    } else if (
      ["G13", "G31", "G02", "G16", "G40", "G41", "G42"].includes(PolicyType)
    ) {
      return "1YR";
    } else if (PolicyType === "JCL15") {
      return "1YR";
    } else if (PolicyType === "JCL7") {
      return "2YRS";
    } else if (PolicyType === "C9") {
      return "1YR";
    } else {
      return "";
    }
  }
  function bondsPolicy(itm: any) {
    const PolicyType = itm.PolicyType.trim();
    if (PolicyType === "G13" || PolicyType === "G31") {
      return "PERFORMANCE BOND";
    } else if (PolicyType === "G02") {
      return "BIDDER'S BOND";
    } else if (PolicyType === "G16") {
      return "SURETY BOND";
    } else if (PolicyType === "G40") {
      return "SURETY BOND";
    } else if (PolicyType === "G41") {
      return "WARRANTY BOND";
    } else if (PolicyType === "G42") {
      return "RETENTION BOND";
    } else if (PolicyType === "JCL15") {
      return "APPEAL BOND";
    } else if (PolicyType === "JCL7") {
      return "HEIR'S BOND";
    } else if (PolicyType === "C9") {
      return "JUDICIAL BOND";
    } else {
      return "";
    }
  }

  const headerIndexes = getIndexes(
    data,
    (item: any) => item?.header === true || item?.solo === false
  );

  const gapPerRowIndexes = getIndexes(
    data,
    (item: any) => item?.gapPerRow === true
  );

  let PAGE_WIDTH = 650;
  let PAGE_HEIGHT = 841;

  const props: any = {
    addHeader: false,
    data: data,
    columnWidths: [150, 200, 70, 60, 60, 70],
    headers: [
      { headerName: "POLICY NO", textAlign: "left" },
      { headerName: "INSURED", textAlign: "left" },
      { headerName: "PREMIUM", textAlign: "right" },
      { headerName: "FROM", textAlign: "left" },
      { headerName: "TO", textAlign: "left" },
      { headerName: "GROSS PREMIUM", textAlign: "right" },
    ],
    keys: ["PolicyNo", "Insured", "Premium", "From", "To", "GrossPremium"],
    title: "",
    adjustTitleFontSize: 6,
    setRowFontSize: 6,
    BASE_FONT_SIZE: 6,
    adjustRowHeight: 8,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    MARGIN: { top: 20, right: 20, bottom: 30, left: 20 },
    beforeDraw: (
      pdfReportGenerator: PDFReportGenerator,
      doc: PDFKit.PDFDocument
    ) => {
      let yAxis = 20;
      doc.image(
        path.join(path.dirname(__dirname), "../../../static/image/logo.png"),
        30,
        yAxis,
        {
          fit: [120, 120],
        }
      );

      yAxis += 10;
      doc.fontSize(60);
      doc.font("Helvetica-Bold");
      doc.text("UPWARD", 155, yAxis);
      yAxis += 50;

      if (process.env.DEPARTMENT === "UMIS") {
        doc.fontSize(9);
        doc.text("MANAGEMENT INSURANCE SERVICES", 245, yAxis);
      }
      if (process.env.DEPARTMENT === "UCSMI") {
        doc.fontSize(9);
        doc.text("CONSULTANCY SERVICES AND MANAGEMENT INC.", 190, yAxis);
      }

      yAxis += 40;
      doc.font("Helvetica");
      doc.fontSize(8);
      doc.text("STATEMENT OF ACCOUNT", 30, yAxis, {
        width: PAGE_WIDTH - 30,
        align: "center",
      });

      yAxis += 10;
      doc.text(`${format(new Date(), "MMMM dd, yyyy")}`, 30, yAxis, {
        width: PAGE_WIDTH - 30,
        align: "center",
      });

      yAxis += 10;
      doc.fontSize(9);
      doc.text(`Ref. No. : ${req.body.refNo}`, 30, yAxis, {
        width: PAGE_WIDTH - 60,
        align: "right",
      });
      doc.fontSize(8);

      const arrayHeaderData = [
        { label: "ACCT. NAME", value: "tttttttttweqweqwe" },
        { label: "ADDRESS", value: "asdasdasdasd" },
        { label: "ACCT. BAL.", value: "123123" },
      ];

      for (const itm of arrayHeaderData) {
        yAxis += 12;
        doc.text(itm.label, 30, yAxis, {
          width: 70,
          align: "left",
        });
        doc.text(`:`, 100, yAxis, {
          width: 10,
          align: "left",
        });
        doc.text(itm.value, 130, yAxis, {
          width: PAGE_WIDTH - 30,
          align: "left",
        });
      }

      headerIndexes.forEach((itm: any) => {
        pdfReportGenerator.boldRow(itm);
      });
      return yAxis;
    },
    drawOnColumn: (row: any, doc: PDFKit.PDFDocument, startY: number) => {
      if (row.header) {
        startY = startY + 13;
        if (row.PolicyNo === "COMPREHENSIVE") {
          doc.moveTo(25, startY).lineTo(95, startY).stroke();
          doc.moveTo(25, startY).lineTo(95, startY).stroke();
        } else if (row.PolicyNo === "FIRE") {
          doc.moveTo(25, startY).lineTo(43, startY).stroke();
          doc.moveTo(25, startY).lineTo(43, startY).stroke();
        } else if (row.PolicyNo === "MARINE") {
          doc.moveTo(25, startY).lineTo(56, startY).stroke();
          doc.moveTo(25, startY).lineTo(56, startY).stroke();
        } else if (row.PolicyNo === "BONDS") {
          doc.moveTo(25, startY).lineTo(53, startY).stroke();
          doc.moveTo(25, startY).lineTo(53, startY).stroke();
        } else if (row.PolicyNo === "GPA") {
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
        } else if (row.PolicyNo === "CGL") {
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
          doc.moveTo(25, startY).lineTo(41, startY).stroke();
        }
      }
    },
    beforePerPageDraw: (pdfReportGenerator: any, doc: PDFKit.PDFDocument) => {},
    addRowHeight: (rowIndex: number) => {
      if (gapPerRowIndexes.includes(rowIndex)) {
        return 8;
      }
      return 0;
    },
    drawPageNumber: (
      doc: PDFKit.PDFDocument,
      currentPage: number,
      totalPages: number,
      pdfReportGenerator: any
    ) => {},
  };
  const pdfReportGenerator = new PDFReportGenerator(props);
  return pdfReportGenerator.generatePDF(res, false);
});

const getIndexes = (array: Array<any>, condition: any) => {
  return array.reduce((indexes, item, index) => {
    if (condition(item)) {
      indexes.push(index); // Store the index if condition is met
    }
    return indexes;
  }, []);
};
export default StatementOfAccount;
