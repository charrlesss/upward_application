import express from "express";
import {
  approvalCodePostponement,
  checkPostponementRequestAutoID,
  createPostponement,
  createPostponementDetails,
  getCheckPostponementPNNo,
  getSelectedCheckPostponementPNNo,
  searchEditPostponentRequest,
  searchSelectedEditPostponentRequest,
  updateOnCancelPostponentRequest,
  updateOnCancelPostponentRequestDetails,
  updatePostponementStatus,
  updateApprovalPostponementCode,
  findApprovalPostponementCode,
  searchPDCCLients,
  getRCPNList,
  getRCPNDetails,
  deleteOnUpdate,
} from "../../../model/Task/Accounting/chek-postponement.model";
import { getUserById } from "../../../model/StoredProcedure";
import { updateAnyId } from "../../../model/Task/Accounting/pullout.model";
import { format } from "date-fns";
import sendEmail from "../../../lib/sendEmail";
import generateRandomNumber from "../../../lib/generateRandomNumber";
import saveUserLogs from "../../../lib/save_user_logs";
import { VerifyToken } from "../../Authentication";
import generateUniqueUUID from "../../../lib/generateUniqueUUID";

const CheckPostponement = express.Router();

CheckPostponement.get(
  "/check-postponement/reqeust/search-pnno-client",
  async (req, res) => {
    try {
      res.send({
        message: "Successfully Get ID",
        success: true,
        pnnoClients: await searchPDCCLients(req),
      });
    } catch (error: any) {
      console.log(`${CheckPostponement} : ${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        data: [],
      });
    }
  }
);

CheckPostponement.post(
  "/check-postponement/selected-pn-no-checklist",
  async (req, res) => {
    const { PNNo } = req.body;
    try {
      const selectedChecks = await getSelectedCheckPostponementPNNo(PNNo, req);
      res.send({
        message: "Successfully Get Search Selected",
        success: true,
        selectedChecks,
      });
    } catch (error: any) {
      console.log(`${CheckPostponement} : ${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        selectedChecks: [],
      });
    }
  }
);

CheckPostponement.get(
  "/check-postponement/reqeust/get-id",
  async (req, res) => {
    try {
      res.send({
        message: "Successfully Get ID",
        success: true,
        id: await checkPostponementRequestAutoID(req),
      });
    } catch (error: any) {
      console.log(`${CheckPostponement} : ${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        id: [],
      });
    }
  }
);

CheckPostponement.post("/check-postponement/save", async (req, res) => {
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

  try {
    if (req.body.requestMode === "edit") {
      await deleteOnUpdate(req, req.body.RPCD);
    }

    const user = await getUserById((req.user as any).UserId);
    const data = {
      RPCDNo: req.body.RPCD,
      PNNo: req.body.PNNo,
      HoldingFees: req.body.holdingFee,
      PenaltyCharge: req.body.penaltyCharge,
      PaidVia: req.body.paidVia,
      PaidInfo: req.body.paidInfo,
      PaidDate: req.body.paidDate,
      Date: new Date(),
      Status: "PENDING",
      Branch: "HO",
      ClientBranch: req.body.branch,
      Prepared_by: user?.Username,
      Surplus: req.body.surplus,
      Deducted_to: req.body.deductedTo,
      Requested_By: user?.Username,
      Requested_Date: new Date(),
    };
    await createPostponement(data, req);

    JSON.parse(req.body.checkSelected).forEach(async (item: any) => {
      const details = {
        RPCD: req.body.RPCD,
        RPCDNo: `${req.body.RPCD}-${item.temp_id}`,
        CheckNo: item.Check_No,
        OldCheckDate: new Date(item.Check_Date),
        NewCheckDate: new Date(item.New_Check_Date),
        Reason: item.Reason,
      };
      await createPostponementDetails(details, req);
    });

    const subtitle = `
      <h3>Check Deposit Postponement Request</h3>
    `;
    const text = getSelectedCheck(req.body.checkSelected);
    const Requested_By = user?.Username;
    const Requested_Date = new Date();
    const approvalCode = generateRandomNumber(6);

    const EmailToSend = [
      "upwardinsurance.grace@gmail.com",
      "lva_ancar@yahoo.com",
      "encoder.upward@yahoo.com",
      "charlespalencia21@gmail.com",
    ];

    for (const toEmail of EmailToSend) {
      await sendRequestEmail({
        ...req.body,
        text,
        Requested_By,
        Requested_Date,
        approvalCode,
        subtitle,
        toEmail,
      });
    }

    const postponement_auth_codes_id = await generateUniqueUUID(
      "postponement_auth_codes",
      "postponement_auth_codes_id"
    );

    await approvalCodePostponement(
      {
        postponement_auth_codes_id,
        RPCD: req.body.RPCD,
        For_User: Requested_By,
        Approved_Code: approvalCode.toString(),
        Disapproved_Code: "",
      },
      req
    );
    await updateAnyId("check-postponement", req);
    await saveUserLogs(req, req.body.RPCD, `add request`, "Check-Postponement");
    res.send({ message: "Save Successfully.", success: true });
  } catch (error: any) {
    console.log(`${CheckPostponement} : ${error.message}`);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

CheckPostponement.post(
  "/check-postponement/request/get-rcpn-list",
  async (req, res) => {
    try {
      res.send({
        message: "Successfully Get ID",
        success: true,
        rcpn: await getRCPNList(req),
      });
    } catch (error: any) {
      console.log(`${CheckPostponement} : ${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        rcpn: [],
      });
    }
  }
);
CheckPostponement.get(
  "/check-postponement/request/get-rcpn-list",
  async (req, res) => {
    try {
      res.send({
        message: "Successfully Get ID",
        success: true,
        rcpn: await getRCPNList(req),
      });
    } catch (error: any) {
      console.log(`${CheckPostponement} : ${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        rcpn: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/request/get-rcpn-selected-datails",
  async (req, res) => {
    try {
      res.send({
        message: "Successfully Get ID",
        success: true,
        rcpnDetails: await getRCPNDetails(req, req.body.RPCDNo),
      });
    } catch (error: any) {
      console.log(`${CheckPostponement} : ${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        rcpnDetails: [],
      });
    }
  }
);
CheckPostponement.get("/check-postponement/search-edit", async (req, res) => {
  const { searchEdit } = req.query;
  try {
    const selectedRequest = await searchEditPostponentRequest(
      searchEdit as string,
      req
    );
    res.send({
      message: "Successfully Get Search Selected",
      success: true,
      selectedRequest,
    });
  } catch (error: any) {
    console.log(`${CheckPostponement} : ${error.message}`);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      selectedRequest: [],
    });
  }
});
CheckPostponement.post(
  "/check-postponement/search-selected-edit",
  async (req, res) => {
    try {
      const selectedSearchEdit = await searchSelectedEditPostponentRequest(
        req.body.RPCD,
        req
      );
      res.send({
        message: "Successfully Get Search Selected",
        success: true,
        selectedSearchEdit,
      });
    } catch (error: any) {
      console.log(`${CheckPostponement} : ${error.message}`);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
        selectedSearchEdit: [],
      });
    }
  }
);
CheckPostponement.post(
  "/check-postponement/approved-request",
  async (req, res) => {
    const { userAccess }: any = await VerifyToken(
      req.cookies["up-ac-login"] as string,
      process.env.USER_ACCESS as string
    );
    if (userAccess.includes("ADMIN")) {
      return res.send({
        message: `CAN'T APPROVED, ADMIN IS FOR VIEWING ONLY!`,
        success: false,
      });
    }

    try {
      if (
        req.body.code === "" ||
        req.body.code === null ||
        req.body.code === undefined
      ) {
        return res.send({
          message: "Invalid Approval Code",
          success: false,
        });
      }
      const isAuthorized: any = await findApprovalPostponementCode(
        req.body.code,
        req.body.RPCD,
        req
      );

      if (isAuthorized.length <= 0) {
        return res.send({
          message: "Invalid Approval Code",
          success: false,
        });
      }

      const user = await getUserById((req.user as any).UserId);
      await updatePostponementStatus(
        req.body.isApproved,
        req.body.RPCD,
        user?.Username as string,
        req
      );
      await updateApprovalPostponementCode(
        user?.Username as string,
        req.body.RPCD,
        req
      );
      const subtitle = `
        <h3>Check Deposit Postponement Request</h3>
      `;
      const text = getSelectedCheck(req.body.checkSelected);
      const Approved_By = user?.Username;

      const EmailToSend = [
        "upwardinsurance.grace@gmail.com",
        "lva_ancar@yahoo.com",
        "encoder.upward@yahoo.com",
        "charlespalencia21@gmail.com",
      ];

      for (const toEmail of EmailToSend) {
        await sendApprovedEmail({
          ...req.body,
          text,
          Requested_By: req.body.Requested_By,
          Requested_Date: req.body.Requested_Date,
          approvalCode: req.body.code,
          subtitle,
          Approved_By,
          toEmail,
        });
      }

      await saveUserLogs(
        req,
        req.body.RPCD,
        `${req.body.isApproved ? "approved" : "disapproved"} request`,
        "Check-Postponement"
      );

      res.send({
        message: `${req.body.isApproved ? "APPROVED" : "DISAPPROVED"} Request ${
          req.body.RPCD
        } Successfully`,
        success: true,
      });
    } catch (error: any) {
      console.log(error.message);
      res.send({
        message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
        success: false,
      });
    }
  }
);
function getSelectedCheck(selected: string) {
  let tbodyText = "";
  JSON.parse(selected).forEach((item: any) => {
    tbodyText += generateTextTable(item);
  });
  return tbodyText;
}
function generateTextTable(item: any) {
  return `
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px">${item.Check_No}</td>
    <td style="border: 1px solid #ddd; padding: 8px">${item.Bank}</td>
    <td style="border: 1px solid #ddd; padding: 8px">₱${item.Check_Amnt}</td>
    <td style="border: 1px solid #ddd; padding: 8px">${item.Check_Date}</td>
    <td style="border: 1px solid #ddd; padding: 8px">${item.New_Check_Date}</td>
    <td style="border: 1px solid #ddd; padding: 8px">${item.DateDiff}</td>
    <td style="border: 1px solid #ddd; padding: 8px">${item.Reason}</td>
  </tr>`;
}
async function sendRequestEmail(props: any) {
  const {
    RPCD,
    PNNo,
    client,
    text,
    Requested_Date,
    Requested_By,
    approvalCode,
    subtitle,
    holdingFee,
    penaltyCharge,
    surplus,
    paidVia,
    toEmail,
  } = props;
  const totalFee =
    parseFloat(holdingFee.replace(/,/g, "")) +
    parseFloat(penaltyCharge.replace(/,/g, "")) +
    parseFloat(surplus.replace(/,/g, ""));
  const strong1 = `
    font-family: Arial, Helvetica, sans-serif;
            font-size: 14px;
            color: #334155;
          
    `;
  const strong2 = `font-family: 'Courier New', Courier, monospace;
    font-size: 16px;`;
  const th = ` border: 1px solid #ddd;
    padding: 8px;
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #64748b;
    color: white;`;
  await sendEmail(
    { user: "upwardumis2020@gmail.com", pass: "vapw ridu eorg ukxd" },
    "upwardumis2020@gmail.com",
    `${toEmail}`,
    "For Approval",
    `
  <div
    style="
      background-color: #64748b;
      color: white;
      padding: 7px;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      text-align: center;
    "
  >
    <h2>UPWARD</h2>
    ${subtitle}
    
  </div>
  <div style="text-align: center">
    <p>
      <strong
        style="${strong1}"
        >RCPD No. : </strong
      ><strong
        style="${strong2}"
        >${RPCD}</strong
      >
    </p>
    <p>
      <strong
        style="${strong1}"
        >PN No. : </strong
      ><strong
        style="${strong2}"
        >${PNNo}</strong
      >
    </p>
    <p>
      <strong
        style="${strong1}"
        >Branch : </strong
      ><strong
        style="${strong2}"
        >HO</strong
      >
    </p>
    <p>
    <strong
      style="${strong1}"
      >Account Name : </strong
    ><strong
      style="${strong2}"
      >${client}</strong
    >
    ${
      approvalCode
        ? `<p>
      <strong
        style="${strong1}"
        >Approval Code : </strong
      ><strong
        style="${strong2} color:green;font-weight: bold;"
        >${approvalCode}</strong
      >
    </p>`
        : ""
    }
  </div>
  <table
    style="
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
    "
  >
    <thead>
      <tr>
        <th
          style="${th}"
        >
          Check No.
        </th>
        <th
          style="${th}"
        >
          Bank
        </th>
        <th
          style="${th}"
        >
          Amount
        </th>
        <th
          style="${th}"
        >
          Old Deposite Date
        </th>
        <th
          style="${th}"
        >
          New Deposite Date
        </th>
        <th
          style="${th}"
        >
          Date Difference
        </th>
        <th
          style="${th}"
        >
          Reason
        </th>
      </tr>
    </thead>
    <tbody>
      ${text}
    </tbody>
  </table>
  <br />
  <br />
  <div
    style="
      text-align: center;
      font-size: 14px;
      font-family: 'Courier New', Courier, monospace;
    "
  >
    <p>Total Fees:<span style="font-weight: 600; color: #334155;">${totalFee}</span></p>
    <p style="font-weight: 200">
    How to be paid:<span style="font-weight: 600;color: #334155;">
      ${paidVia}
    </span>
    </p>
    <p>Other Informations</p>
  </div>
  <br />
  <br />
  <div
    style="
      text-align: center;
      font-size: 14px;
      font-family: 'Courier New', Courier, monospace;
    "
  >
    <p>Request By:<span style="font-weight: 600; color: #334155;">${Requested_By}</span></p>
    <p style="font-weight: 200">
      Request Date:<span style="font-weight: 600;color: #334155;">${format(
        Requested_Date,
        "MM/dd/yyyy"
      )}</span>
    </p>
    <p>This is a computer generated E-mail</p>
  </div>
    `
  );
}
async function sendApprovedEmail(props: any) {
  const {
    RPCD,
    PNNo,
    client,
    text,
    Requested_Date,
    Requested_By,
    subtitle,
    holdingFee,
    penaltyCharge,
    surplus,
    paidVia,
    isApproved,
    username,
    code,
    Approved_By,
    toEmail,
  } = props;
  const totalFee =
    parseFloat(holdingFee.replace(/,/g, "")) +
    parseFloat(penaltyCharge.replace(/,/g, "")) +
    parseFloat(surplus.replace(/,/g, ""));
  const strong1 = `
    font-family: Arial, Helvetica, sans-serif;
            font-size: 14px;
            color: #334155;
          
    `;
  const strong2 = `font-family: 'Courier New', Courier, monospace;
    font-size: 16px;`;
  const th = ` border: 1px solid #ddd;
    padding: 8px;
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color:${isApproved ? "green" : "#b91c1c"};
    color: white;`;
  await sendEmail(
    { user: "upwardumis2020@gmail.com", pass: "vapw ridu eorg ukxd" },
    "upwardumis2020@gmail.com",
    `${toEmail}`,
    `${isApproved ? "Approved" : "Disapproved"}`,
    `
  <div
    style="
      background-color: ${isApproved ? "green" : "#b91c1c"};
      color: white;
      padding: 7px;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      text-align: center;
    "
  >
    <h2>UPWARD</h2>
    ${subtitle}
  </div>
  <div style="text-align: center">
  <p>
      <strong
        style="${strong1}"
        >Status : </strong
      ><strong
        style="${strong2}"
        >${
          isApproved
            ? "<span style='color:green'>APPROVED</span>"
            : "<span style='color:#b91c1c'>DISAPPROVED</span>"
        }</strong
      >
    </p>
    <p>
      <strong
        style="${strong1}"
        >RCPD No. : </strong
      ><strong
        style="${strong2}"
        >${RPCD}</strong
      >
    </p>
    <p>
      <strong
        style="${strong1}"
        >PN No. : </strong
      ><strong
        style="${strong2}"
        >${PNNo}</strong
      >
    </p>
    <p>
      <strong
        style="${strong1}"
        >Branch : </strong
      ><strong
        style="${strong2}"
        >Head Office</strong
      >
    </p>
    <p>
    <strong
      style="${strong1}"
      >Account Name : </strong
    ><strong
      style="${strong2}"
      >${client}</strong
    >
    </p>

    <p>
    <strong
      style="${strong1}"
      >Approved By: </strong
    ><strong
      style="${strong2}"
      >${Approved_By}</strong
    >
    </p>
   <p>
    <strong
      style="${strong1}"
      >Approved Code: </strong
    ><strong
      style="${strong2} color:green;font-weight: bold;"
      >${code}</strong
    >
    </p>
  </div>
  <table
    style="
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
    "
  >
    <thead>
      <tr>
        <th
          style="${th}"
        >
          Check No.
        </th>
        <th
          style="${th}"
        >
          Bank
        </th>
        <th
          style="${th}"
        >
          Amount
        </th>
        <th
          style="${th}"
        >
          Old Deposite Date
        </th>
        <th
          style="${th}"
        >
          New Deposite Date
        </th>
        <th
          style="${th}"
        >
          Date Difference
        </th>
        <th
          style="${th}"
        >
          Reason
        </th>
      </tr>
    </thead>
    <tbody>
      ${text}
    </tbody>
  </table>
  <br />
  <br />
  <div
    style="
      text-align: center;
      font-size: 14px;
      font-family: 'Courier New', Courier, monospace;
    "
  >
    <p>Total Fees:<span style="font-weight: 600; color: #334155;">${totalFee}</span></p>
    <p style="font-weight: 200">
    How to be paid:<span style="font-weight: 600;color: #334155;">
      ${paidVia}
    </span>
    </p>
    <p>Other Informations</p>
  </div>
  <br />
  <br />
  <div
    style="
      text-align: center;
      font-size: 14px;
      font-family: 'Courier New', Courier, monospace;
    "
  >
    <p>Request By:<span style="font-weight: 600; color: #334155;">${Requested_By}</span></p>
    <p style="font-weight: 200">
      Request Date:<span style="font-weight: 600;color: #334155;">${format(
        new Date(Requested_Date),
        "MM/dd/yyyy"
      )}</span>
    </p>
    <p>This is a computer generated E-mail</p>
  </div>
    `
  );
}
export default CheckPostponement;
