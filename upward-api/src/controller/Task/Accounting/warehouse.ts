import express from "express";
import {
  getApprovedRCPNo,
  loadList,
} from "../../../model/Task/Accounting/warehouse.model";
import saveUserLogs from "../../../lib/save_user_logs";
import { prisma } from "../..";

const Warehouse = express.Router();
Warehouse.post("/warehouse/search-pdc", async (req, res) => {
  try {
    let strWhere = "";
    const statusOptions = ["Received", "Stored", "Stored"];
    const selectedIndex = req.body.pdcStatus;
    let status = "";
    if (selectedIndex >= 0) {
      status = statusOptions[selectedIndex];
      if (selectedIndex !== 2) {
        strWhere = `(PDC_Status = ?)`;
      } else {
        strWhere = `(PDC_Status = ? OR (PDC_Status = 'Pulled Out' AND (PDC_Remarks = 'Fully Paid' OR PDC_Remarks = 'Replaced')))`;
      }
    }

    const qry = `
      SELECT 
        PNo, 
        IDNo, 
        DATE_FORMAT(Date,'%m/%d/%Y') AS Date, 
        Name, 
        date_format(Check_Date,'%m/%d/%Y') AS CheckDate, 
        Check_No, 
        Check_Amnt, 
        Bank, 
        PDC_Status
      FROM pdc  
      WHERE  PNo = ?  AND ${strWhere} ORDER BY Check_Date`;

    res.send({
      message: "successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(qry, req.body.search, status),
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
Warehouse.post("/warehouse/save-checks", async (req, res) => {
  try {
    const pdcStatusIndex = parseInt(req.body.pdcStatus.toString());
    const remarks = req.body.remarksValue;
    const tableDataSelected = req.body.tableData;

    if (pdcStatusIndex === 2) {
      for (const itm of tableDataSelected) {
        const qry = `
                  select 
                    *
                  from pullout_request as POR 
                  left join pullout_request_details as PORD on POR.RCPNo = PORD.RCPNo 
                  where PNNo ='${itm.PNo}' and  checkNo ='${itm.Check_No}' and status ='APPROVED'`;

        const dt = (await prisma.$queryRawUnsafe(qry)) as Array<any>;

        if (dt.length <= 0) {
          return res.send({
            message: `PN No. : ${itm.PNo} Check No.: ${itm.Check_No} don't have pullout approval!`,
            success: false,
            data: [],
          });
        }
      }
    }

    const status1 = ["Stored", "Endorsed", "Pulled Out"];
    const status2 = ["Date_Stored", "Date_Endorsed", "Date_Pulled_Out"];

    for (const itm of tableDataSelected) {
      const qry = `
                 UPDATE 
                pdc  SET 
                  PDC_Status = '${status1[pdcStatusIndex]}' ,
                  ${status2[pdcStatusIndex]} = now() 
                  ${pdcStatusIndex === 2 ? `, PDC_Remarks = '${remarks}'` : ""}
                WHERE 
                  PNo = '${itm.PNo}' AND 
                  IDNo = '${itm.IDNo}' AND 
                  DATE_FORMAT(Date,'%m/%d/%Y') = '${itm.Date}' AND
                  Name = '${itm.Name}' AND 
                  DATE_FORMAT(Check_Date,'%m/%d/%Y') = '${itm.CheckDate}' AND 
                  Check_No = '${itm.Check_No}' AND 
                  Check_Amnt = '${itm.Check_Amnt}' AND 
                  Bank = '${itm.Bank}' AND 
                  PDC_Status = '${itm.PDC_Status}'
                `;

      await prisma.$queryRawUnsafe(qry);
    }

    const dd = [
      "Stored In Warehouse!",
      "Endorsed for Deposit!",
      `Pulled Out As ${remarks}`,
    ];

    await saveUserLogs(req, req.body.PNo, "save", "warehouse");
    res.send({
      message: `Successfully ${dd[pdcStatusIndex]}`,
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
Warehouse.post("/warehouse/get-pullout-selected-row", async (req, res) => {
  try {
    const data = await prisma.$queryRawUnsafe(
      `
    select 
      CheckNo 
    From pullout_request a 
    Inner join pullout_request_details b  on a.RCPNo = b.RCPNo 
    Where a.Status = 'APPROVED' 
    And a.RCPNo = ?`,
      req.body.RCPNo
    );
    res.send({
      message: `Successfully Get Data`,
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

export default Warehouse;

// Warehouse.post(
//   "/warehouse/search-pdc-checks-client-policy",
//   async (req, res) => {
//     try {
//       const pdcStatus = parseInt(req.body.pdcStatus);
//       const searchType = parseInt(req.body.searchType);
//       const search = req.body.search;

//       let StrWhere =
//         "(PDC_Status = '" +
//         ["Received", "Stored", "Stored"][pdcStatus] +
//         "'" +
//         (pdcStatus !== 2
//           ? ")"
//           : " OR (PDC_Status='Pulled Out' AND (PDC_Remarks='Fully Paid' OR PDC_Remarks='Replaced')))");

//       const searchBy = ["PNo", "IDNo", "Name", "Bank"][searchType];

//       function LoadPDC(searchBy: string, search: string, StrWhere: string) {
//         const qry = `
//         SELECT
//           PDC_ID,
//           CAST(ROW_NUMBER() OVER () AS CHAR) AS temp_id,
//           PNo,
//           IDNo,
//           date_format(Date,'%m-%d-%Y') AS dateRecieved,
//           Name,
//           date_format(Check_Date,'%m-%d-%Y') AS CheckDate,
//           Check_No,
//           Check_Amnt,
//           Bank,
//           PDC_Status
//         FROM pdc
//         WHERE  PNo LIKE '%${search}%' AND ${StrWhere} ORDER BY Date,Check_Date`;
//         console.log(qry);
//         return qry;
//       }

//       res.send({
//         message: "successfully",
//         success: true,
//         data: await getWarehouseSearch(
//           LoadPDC(searchBy, search, StrWhere),
//           req
//         ),
//       });
//     } catch (err: any) {
//       console.log(err.message);
//       res.send({
//         message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
//         success: false,
//         data: [],
//       });
//     }
//   }
// );
// Warehouse.post(
//   "/warehouse/get-search-selected-pdc-checks-client-policy",
//   async (req, res) => {
//     try {
//       res.send({
//         message: "successfully",
//         success: true,
//         data: await warehouseSelectedSearch(
//           req.body.Policy,
//           req.body.pdcStatus,
//           req
//         ),
//       });
//     } catch (err: any) {
//       console.log(err.message);
//       res.send({
//         message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
//         success: false,
//         data: [],
//       });
//     }
//   }
// );
// Warehouse.get(
//   "/warehouse/search-approved-pullout-warehouse",
//   async (req, res) => {
//     const { searchApprovedPullout } = req.query;
//     try {
//       res.send({
//         message: "successfully",
//         success: true,
//         data: await getApprovedPulloutWarehouse(
//           searchApprovedPullout as string,
//           req
//         ),
//       });
//     } catch (err: any) {
//       console.log(err.message);
//       res.send({
//         message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
//         success: false,
//         data: [],
//       });
//     }
//   }
// );
// Warehouse.get(
//   "/warehouse/search-checklist-approved-pullout-warehouse",
//   async (req, res) => {
//     const { searchApprovedPulloutCheckList } = req.query;
//     console.log(searchApprovedPulloutCheckList);

//     try {
//       const data = await getApprovedPulloutWarehouseCheckList(
//         searchApprovedPulloutCheckList as string,
//         req
//       );
//       res.send({
//         message: "successfully",
//         success: true,
//         data,
//       });
//     } catch (err: any) {
//       console.log(err.message);
//       res.send({
//         message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
//         success: false,
//         data: [],
//       });
//     }
//   }
// );
// Warehouse.post(
//   "/warehouse/search-checklist-approved-pullout-warehouse-selected",
//   async (req, res) => {
//     const { RCPNo } = req.body;
//     try {
//       const data = await getApprovedPulloutWarehouseCheckListSelected(
//         RCPNo,
//         req
//       );
//       res.send({
//         message: "successfully",
//         success: true,
//         data,
//       });
//     } catch (err: any) {
//       console.log(err.message);
//       res.send({
//         message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
//         success: false,
//         data: [],
//       });
//     }
//   }
// );
// Warehouse.post("/warehouse/save", async (req, res) => {
//   try {
//     const { userAccess }: any = await VerifyToken(
//       req.cookies["up-ac-login"] as string,
//       process.env.USER_ACCESS as string
//     );
//     if (userAccess.includes("ADMIN")) {
//       return res.send({
//         message: `CAN'T SAVE, ADMIN IS FOR VIEWING ONLY!`,
//         success: false,
//       });
//     }

//     const successMessage = [
//       "Stored In Warehouse",
//       "Endorsed for Deposit",
//       "Pulled Out As " + req.body.remarks,
//     ];
//     const selected = JSON.parse(req.body.selected);

//     if (req.body.pdcStatus === "2") {
//       selected.forEach(async (item: any) => {
//         const pulloutRequest = await pullout(item.PNo, item.Check_No, req);
//         if (pulloutRequest.length <= 0) {
//           return res.send({
//             message: `PN No. : ${item.PNo}\nCheck No : ${item.Check_No} dont have pullout approval!`,
//             success: false,
//           });
//         }
//       });
//     }

//     selected.forEach(async (check: any) => {
//       await updatePDCChecks(
//         req.body.pdcStatus,
//         req.body.remarks,
//         check.PDC_ID,
//         req
//       );
//     });
//     await saveUserLogs(req, "", "add", "Warehouse");
//     res.send({
//       message: `Successfully ${successMessage[parseInt(req.body.pdcStatus)]}`,
//       success: true,
//     });
//   } catch (err: any) {
//     console.log(err.message);
//     res.send({
//       message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
//       success: false,
//     });
//   }
// });
// Warehouse.post("/warehouse/report", async (req, res) => {
//   try {
//     res.send({
//       message: "successfully",
//       success: true,
//       data: await getWarehouseSearch(req.body.query, req),
//     });
//   } catch (err: any) {
//     console.log(err.message);
//     res.send({
//       message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
//       success: false,
//       data: [],
//     });
//   }
// });

///////////////////////////// NEW /////////////////////
