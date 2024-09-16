import express from "express";
import {
  getWarehouseSearch,
  pullout,
  warehouseSelectedSearch,
  updatePDCChecks,
  getApprovedPulloutWarehouse,
  getApprovedPulloutWarehouseCheckList,
  getApprovedPulloutWarehouseCheckListSelected,
} from "../../../model/Task/Accounting/warehouse.model";
import saveUserLogs from "../../../lib/save_user_logs";
import { VerifyToken } from "../../Authentication";

const Warehouse = express.Router();

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
        FROM PDC 
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
Warehouse.post(
  "/warehouse/report",
  async (req, res) => {
    try {
      res.send({
        message: "successfully",
        success: true,
        data:  await getWarehouseSearch(req.body.query ,req)
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

export default Warehouse;
