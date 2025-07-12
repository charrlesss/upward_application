import express from "express";
import {
  getWarehouseSearch,
  pullout,
  warehouseSelectedSearch,
  updatePDCChecks,
  getApprovedPulloutWarehouse,
  getApprovedPulloutWarehouseCheckList,
  getApprovedPulloutWarehouseCheckListSelected,
  getApprovedRCPNo,
  loadList,
} from "../../../model/Task/Accounting/warehouse.model";
import saveUserLogs from "../../../lib/save_user_logs";
import { VerifyToken } from "../../Authentication";
import { prisma } from "../..";

const Warehouse = express.Router();

Warehouse.post("/warehouse/load-list", async (req, res) => {
  try {
    res.send({
      message: `Successfully Get Data`,
      success: true,
      list: await loadList(req, req.body.RCPNo),
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
Warehouse.post("/warehouse/get-pullout-rcpno", async (req, res) => {
  try {
    res.send({
      message: `Successfully Get Data`,
      success: true,
      data: await getApprovedRCPNo(req),
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
Warehouse.post(
  "/warehouse/search-pdc-checks-client-policy",
  async (req, res) => {
    try {
      const pdcStatus = parseInt(req.body.pdcStatus);
      const searchType = parseInt(req.body.searchType);
      const search = req.body.search;

      let StrWhere =
        "(PDC_Status = '" +
        ["Received", "Stored", "Stored"][pdcStatus] +
        "'" +
        (pdcStatus !== 2
          ? ")"
          : " OR (PDC_Status='Pulled Out' AND (PDC_Remarks='Fully Paid' OR PDC_Remarks='Replaced')))");

      const searchBy = ["PNo", "IDNo", "Name", "Bank"][searchType];

      function LoadPDC(searchBy: string, search: string, StrWhere: string) {
        return `
        SELECT 
          PDC_ID,
          CAST(ROW_NUMBER() OVER () AS CHAR) AS temp_id,
          PNo, 
          IDNo, 
          date_format(Date,'%m-%d-%Y') AS dateRecieved, 
          Name, 
          date_format(Check_Date,'%m-%d-%Y') AS CheckDate, 
          Check_No, 
          Check_Amnt, 
          Bank, 
          PDC_Status 
        FROM pdc
        WHERE  ${searchBy}  LIKE '%${search}%' AND ${StrWhere} ORDER BY Date,Check_Date`;
      }
      res.send({
        message: "successfully",
        success: true,
        data: await getWarehouseSearch(
          LoadPDC(searchBy, search, StrWhere),
          req
        ),
      });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
Warehouse.post(
  "/warehouse/get-search-selected-pdc-checks-client-policy",
  async (req, res) => {
    try {
      res.send({
        message: "successfully",
        success: true,
        data: await warehouseSelectedSearch(
          req.body.Policy,
          req.body.pdcStatus,
          req
        ),
      });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
Warehouse.get(
  "/warehouse/search-approved-pullout-warehouse",
  async (req, res) => {
    const { searchApprovedPullout } = req.query;
    try {
      res.send({
        message: "successfully",
        success: true,
        data: await getApprovedPulloutWarehouse(
          searchApprovedPullout as string,
          req
        ),
      });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);
Warehouse.get(
  "/warehouse/search-checklist-approved-pullout-warehouse",
  async (req, res) => {
    const { searchApprovedPulloutCheckList } = req.query;
    console.log(searchApprovedPulloutCheckList);

    try {
      const data = await getApprovedPulloutWarehouseCheckList(
        searchApprovedPulloutCheckList as string,
        req
      );
      res.send({
        message: "successfully",
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
  }
);
Warehouse.post(
  "/warehouse/search-checklist-approved-pullout-warehouse-selected",
  async (req, res) => {
    const { RCPNo } = req.body;
    try {
      const data = await getApprovedPulloutWarehouseCheckListSelected(
        RCPNo,
        req
      );
      res.send({
        message: "successfully",
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
  }
);
Warehouse.post("/warehouse/save", async (req, res) => {
  try {
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

    const successMessage = [
      "Stored In Warehouse",
      "Endorsed for Deposit",
      "Pulled Out As " + req.body.remarks,
    ];
    const selected = JSON.parse(req.body.selected);

    if (req.body.pdcStatus === "2") {
      selected.forEach(async (item: any) => {
        const pulloutRequest = await pullout(item.PNo, item.Check_No, req);
        if (pulloutRequest.length <= 0) {
          return res.send({
            message: `PN No. : ${item.PNo}\nCheck No : ${item.Check_No} dont have pullout approval!`,
            success: false,
          });
        }
      });
    }

    selected.forEach(async (check: any) => {
      await updatePDCChecks(
        req.body.pdcStatus,
        req.body.remarks,
        check.PDC_ID,
        req
      );
    });
    await saveUserLogs(req, "", "add", "Warehouse");
    res.send({
      message: `Successfully ${successMessage[parseInt(req.body.pdcStatus)]}`,
      success: true,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Warehouse.post("/warehouse/report", async (req, res) => {
  try {
    res.send({
      message: "successfully",
      success: true,
      data: await getWarehouseSearch(req.body.query, req),
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

///////////////////////////// NEW /////////////////////

Warehouse.post("/warehouse/search-by-policy", async (req, res) => {
  const StrQry = `
     SELECT 
          DATE_FORMAT(policy.DateIssued, '%M. %d, %Y') AS Date,
          policy.PolicyNo,
          policy.Account,
          ID_Entry.Shortname AS Name
      FROM
          policy
              LEFT JOIN
          fpolicy ON policy.PolicyNo = fpolicy.PolicyNo
              LEFT JOIN
          vpolicy ON policy.PolicyNo = vpolicy.PolicyNo
              LEFT JOIN
          mpolicy ON policy.PolicyNo = mpolicy.PolicyNo
              LEFT JOIN
          bpolicy ON policy.PolicyNo = bpolicy.PolicyNo
              LEFT JOIN
          msprpolicy ON policy.PolicyNo = msprpolicy.PolicyNo
              LEFT JOIN
          papolicy ON policy.PolicyNo = papolicy.PolicyNo
              LEFT JOIN
          cglpolicy ON policy.PolicyNo = cglpolicy.PolicyNo
              LEFT JOIN
          (SELECT 
              id_entry.IDNo, id_entry.ShortName AS Shortname, IDType
          FROM
              (SELECT 
              IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                      AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname, ' ', aa.suffix, '.'), aa.company) AS ShortName,
                  aa.entry_client_id AS IDNo,
                  aa.sub_account,
                  'Client' AS IDType
          FROM
              entry_client aa UNION ALL SELECT 
              CONCAT(IF(aa.lastname IS NOT NULL
                      AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
                  aa.entry_agent_id AS IDNo,
                  aa.sub_account,
                  'Agent' AS IDType
          FROM
              entry_agent aa UNION ALL SELECT 
              CONCAT(IF(aa.lastname IS NOT NULL
                      AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
                  aa.entry_employee_id AS IDNo,
                  aa.sub_account,
                  'Employee' AS IDType
          FROM
              entry_employee aa UNION ALL SELECT 
              aa.fullname AS ShortName,
                  aa.entry_fixed_assets_id AS IDNo,
                  sub_account,
                  'Fixed Assets' AS IDType
          FROM
              entry_fixed_assets aa UNION ALL SELECT 
              aa.description AS ShortName,
                  aa.entry_others_id AS IDNo,
                  aa.sub_account,
                  'Others' AS IDType
          FROM
              entry_others aa UNION ALL SELECT 
              IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                      AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
                  aa.entry_supplier_id AS IDNo,
                  aa.sub_account,
                  'Supplier' AS IDType
          FROM
              entry_supplier aa) id_entry)  AS ID_Entry ON policy.IDNo = ID_Entry.IDNo
      WHERE
          policy.PolicyNo IN (SELECT 
                  PNo
              FROM
                  pdc)
              AND ((vpolicy.ChassisNo LIKE ?)
              OR (vpolicy.MotorNo LIKE ?)
              OR (vpolicy.PlateNo LIKE ?)
              OR (ID_Entry.Shortname LIKE ?)
              OR (vpolicy.PolicyNo LIKE ?)
              OR (vpolicy.Account LIKE ?))
      ORDER BY policy.DateIssued DESC
      LIMIT 500
        `;
  try {
    res.send({
      message: "successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(
        StrQry,
        `%${req.body.search}%`,
        `%${req.body.search}%`,
        `%${req.body.search}%`,
        `%${req.body.search}%`,
        `%${req.body.search}%`,
        `%${req.body.search}%`
      ),
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
Warehouse.post("/warehouse/search-by-client-id", async (req, res) => {
  try {
    const StrQry = `
      select * from (  SELECT  
        IDNo AS IDNo, 
        Shortname AS Name, 
        IDType 
      FROM (SELECT 
       id_entry.IDNo,
       id_entry.ShortName as Shortname,
       IDType
   FROM
       (SELECT 
           IF(aa.option = 'individual', 
           CONCAT(IF(aa.lastname IS NOT NULL AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname ,' ',aa.suffix,'.'), aa.company) AS ShortName,
               aa.entry_client_id AS IDNo,
               aa.sub_account,
               'Client' as IDType
       FROM
           entry_client aa 
           UNION ALL SELECT 
           CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
               aa.entry_agent_id AS IDNo,
               aa.sub_account,
               'Agent' as IDType
       FROM
           entry_agent aa 
           UNION ALL SELECT 
           CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
               aa.entry_employee_id AS IDNo,
               aa.sub_account,
               'Employee' as IDType
       FROM
           entry_employee aa 
           UNION ALL SELECT 
           aa.fullname AS ShortName,
               aa.entry_fixed_assets_id AS IDNo,
               sub_account,
                'Fixed Assets' as IDType
       FROM
           entry_fixed_assets aa 
           UNION ALL SELECT 
           aa.description AS ShortName,
               aa.entry_others_id AS IDNo,
               aa.sub_account,
               'Others' as IDType
       FROM
           entry_others aa 
           UNION ALL SELECT 
           IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                   AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
               aa.entry_supplier_id AS IDNo,
               aa.sub_account,
                'Supplier' as IDType
       FROM
           entry_supplier aa) id_entry) as ID_Entry
      WHERE 
      ID_Entry.IDNo in (select PNo from pdc)) IDs
      where 
      IDs.IDNo LIKE ? OR  
      IDs.Name LIKE ?
      ORDER BY IDs.Name
      limit 500;`;

    res.send({
      message: "successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(
        StrQry,
        `%${req.body.search}%`,
        `%${req.body.search}%`
      ),
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
Warehouse.post("/warehouse/search-by-bank", async (req, res) => {
  try {
    const StrQry = `
      SELECT 
        Bank_Code AS Code,
        Bank AS Bank_Name
       FROM Bank 
       WHERE 
       Inactive = 0 AND 
       Bank_Code in (SELECT Bank FROM pdc group by Bank) and
       (
       Bank_Code LIKE ?  OR  
       Bank LIKE ? ) 
       ORDER BY Bank
       limit 500 
       `;
    res.send({
      message: "successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(
        StrQry,
        `%${req.body.search}%`,
        `%${req.body.search}%`
      ),
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

export default Warehouse;
