import express from "express";
import Authentication, { ValidateToken, logout } from "./Authentication";
import Reference from "./Reference";
import Task from "./Task";
import Reports from "./Reports";
import Template from "./Template";
import Dashboard from "./dashboard";
import MasterAdminUser from "./MasterAdmin/user";
import { getPdcPolicyIdAndCLientId } from "../model/Task/Accounting/pdc.model";
import { getUserByUsername } from "../model";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
export const prisma = new PrismaClient();

router.use(Authentication);
let userDetails: any = {};

router.get("/get-user-details", async (req, res) => {
  console.log(userDetails);
  res.send(`
        DEPARTMENT:${userDetails.department}
        ACCESS:${userDetails.userAccess}
        IS_ADMIN:"NO"
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
router.use(Dashboard);
router.use(Reference);
router.use(Task);
router.use(Reports);
router.use(Template);
router.use(MasterAdminUser);
router.get("/logout", logout);
router.post("/open-report-by-username", async (req, res) => {
  try {
    const user: any = await getUserByUsername(req.body.username, req);
    userDetails = {
      department: user[0].Department,
      userAccess: user[0].AccountType,
      is_admin: user[0].is_master_admin,
      ACCESS_TOKEN: req.body.ACCESS_TOKEN,
      REFRESH_TOKEN: user[0].REFRESH_TOKEN,
      up_ac_login: user[0].AccountType,
      up_dpm_login: user[0].Department,
      up_ima_login: "No",
      up_at_login: req.body.ACCESS_TOKEN,
      up_rt_login: user[0].REFRESH_TOKEN,
      up_ac_username: req.body.username,
    };
    res.send({
      message: "Open Report Successfully",
      success: true,
    });
  } catch (err: any) {
    res.send({
      message: err.message,
      success: false,
    });
  }
});
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
router.post("/execute-query", async (req, res) => {
  try {
    const newQuery = req.body.query;

    res.send({
      message: "Execute Query Successfully",
      success: true,
      data: await prisma.$queryRawUnsafe(newQuery),
    });
  } catch (err: any) {
    res.send({
      message: err.message,
      success: false,
      data: [],
    });
  }
});

export default router;
