import express from "express";
import Authentication, { ValidateToken, logout } from "./Authentication";
import Reference from "./Reference";
import Task from "./Task";
import Reports from "./Reports";
import Template from "./Template";
import Dashboard from "./dashboard";
import MasterAdminUser from "./MasterAdmin/user";
import os from "os";
import { getPdcPolicyIdAndCLientId } from "../model/Task/Accounting/pdc.model";
const router = express.Router();

router.use(Authentication);
let userDetails: any = {};

router.post("/get-user-details", async (req, res) => {
  userDetails = req.body;
  console.log(userDetails)
  res.send({ message: "successfully" });
});
router.get("/get-user-details", async (req, res) => {
  let DATABASE =
    userDetails.department === "UCSMI"
      ? "upward_insurance_ucsmi_new"
      : "upward_insurance_umis_new";


  res.send(`[DATABASE]
SERVER:192.168.100.220
USERNAME:root
PASSWORD:charles
DATABASE:${DATABASE}
DEPARTMENT:${userDetails.department}
ACCESS:${userDetails.userAccess}
IS_ADMIN:${userDetails.is_admin === false ? "NO" : "YES"}
ACCESS_TOKEN:${userDetails.ACCESS_TOKEN}
REFRESH_TOKEN:${userDetails.REFRESH_TOKEN}
up_ac_login: ${userDetails.up_ac_login}
up_dpm_login:${userDetails.up_dpm_login}
up_ima_login:${userDetails.up_ima_login}
up_at_login: ${userDetails.up_at_login}
up_rt_login: ${userDetails.up_rt_login}
    `);
});

router.use(ValidateToken);

router.get("/search-client", async (req, res) => {
  try {
    console.log(req.body);
    const { search } = req.query;
    const clientsId = await getPdcPolicyIdAndCLientId(search as string, req);
    res.send({
      data: clientsId,
      success: true,
      message: "Successfully Get Data",
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      bondsPolicy: null,
    });
  }
});

router.use(Dashboard);
router.use(Reference);
router.use(Task);
router.use(Reports);
router.use(Template);
router.use(MasterAdminUser);
router.get("/logout", logout);

export default router;
