import express from "express";
import {
  getAgents,
  getClients,
  getSubAccount,
  getMortgagee,
  getPolicyAccount,
  getRates,
  getPolicyType,
  getPolicyAccounts,
  policyAccounts,
  policyTypes,
  getPolicyAccountType,
  getPolicyAccountByBonds,
  getClientDetailsFromPolicy,
  getPolicySummary,
} from "../../../model/Task/Production/policy";
import { getRateType } from "../../../model/Task/Production/fire-policy";
const Policy = express.Router();

Policy.post("/get-policy-summary", async (req, res) => {
  try {
    const PolicyNo = req.body.PolicyNo;
    const policyDetails = await getPolicySummary(PolicyNo, req);

    res.send({
      message: "Successfully Policy Details",
      success: true,
      policyDetails,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      clients: [],
    });
  }
});
Policy.post("/get-client-details", async (req, res) => {
  try {
    const clientId = req.body.userId;
    const clients = await getClientDetailsFromPolicy(clientId, req);

    res.send({
      message: "Successfully get Client Details",
      success: true,
      clients,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      clients: [],
    });
  }
});
Policy.get("/get-clients", async (req, res) => {
  try {
    const { clientSearch } = req.query;
    res.send({
      message: "successfully get client",
      success: true,
      clients: await getClients(clientSearch as string, false, req),
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      clients: [],
    });
  }
});
Policy.get("/get-agents", async (req, res) => {
  try {
    const { agentSearch } = req.query;

    res.send({
      message: "successfully get agents",
      success: true,
      agents: await getAgents(agentSearch as string, false, req),
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      agents: [],
    });
  }
});
Policy.get("/get-sub_account", async (req, res) => {
  try {
    res.send({
      message: "successfully get sub account",
      success: true,
      sub_account: await getSubAccount(req),
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      sub_account: [],
    });
  }
});
Policy.get("/get-policy-account", async (req, res) => {
  try {
    res.send({
      message: "successfully get policy account",
      success: true,
      policy_account: {
        COM: await getPolicyAccounts("COM", "Vehicle", req),
        TPL: await getPolicyAccounts("TPL", "Vehicle", req),
      },
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      policy_account: { COM: [], TPL: [] },
    });
  }
});
Policy.get("/policy-accounts-by-line", async (req, res) => {
  try {
    res.send({
      message: "successfully get policy account",
      success: true,
      policyAccounts: await policyAccounts(req.query.Line as string, req),
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      policyAccounts: [],
    });
  }
});

Policy.get("/get-policy-account-types", async (req, res) => {
  try {
    res.send({
      message: "successfully get policy account",
      success: true,
      getPolicyAccountType: await getPolicyAccountType(req),
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      policyTypes: [],
    });
  }
});

Policy.get("/get-policy-account-bonds", async (req, res) => {
  try {
    res.send({
      message: "successfully get policy account",
      success: true,
      getPolicyAccountByBonds: await getPolicyAccountByBonds(req),
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      policyTypes: [],
    });
  }
});
Policy.get("/get-rates", async (req, res) => {
  try {
    const Type = (req.query.Type as string).trim();
    const Account = (req.query.Account as string).trim();
    setTimeout(async () => {
      res.send({
        message: "successfully get rates",
        success: true,
        rates: await getRates(Type, Account, req),
      });
    }, 2000);
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      rates: {
        COM: [],
        TPL: [],
      },
    });
  }
});

Policy.post("/get-rates", async (req, res) => {
  try {
    const Type = req.body.Type.trim();
    const Account = req.body.Account.trim();
    res.send({
      message: "successfully get rates",
      success: true,
      rates: await getRates(Type, Account, req),
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      rates: [],
    });
  }
});

Policy.get("/get-mortgagee", async (req, res) => {
  try {
    res.send({
      message: "successfully get mortgagee",
      success: true,
      mortgagee: {
        COM: await getMortgagee("COM", req),
        TPL: await getMortgagee("TPL", req),
      },
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      mortgagee: { COM: [], TPL: [] },
    });
  }
});

Policy.get("/search-policy-account", async (req, res) => {
  try {
    const { policyAccountSearch } = req.query;
    res.send({
      message: "successfully get policy account",
      success: true,
      policy_account: await getPolicyAccount(
        policyAccountSearch as string,
        req
      ),
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      policy_account: { COM: [], TPL: [] },
    });
  }
});

Policy.get("/search-rates", async (req, res) => {
  try {
    const { ratesSearch } = req.query;

    res.send({
      message: "successfully get rates",
      success: true,
      rates: await getRateType(ratesSearch as string, req),
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      rates: {
        COM: [],
        TPL: [],
      },
    });
  }
});

Policy.get("/search-mortgagee", async (req, res) => {
  try {
    const { mortgageeSearch } = req.query;

    res.send({
      message: "successfully get mortgagee",
      success: true,
      mortgagee: await getMortgagee(mortgageeSearch as string, req),
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      mortgagee: { COM: [], TPL: [] },
    });
  }
});

Policy.get("/bond-policy-account", async (req, res) => {
  try {
    res.send({
      message: "successfully get bond policy account",
      success: true,
      policy_account: {
        G02: await getPolicyAccount("G02", req),
        G13: await getPolicyAccount("G13", req),
        G16: await getPolicyAccount("G16", req),
      },
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      policy_account: {
        G02: [],
        G13: [],
        G16: [],
      },
    });
  }
});

Policy.get("/policy-type", async (req, res) => {
  try {
    res.send({
      message: "successfully get Bonds",
      success: true,
      policy_type: await getPolicyType("Bonds", req),
    });
  } catch (err: any) {
    console.log(err.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      policy_type: [],
    });
  }
});

export default Policy;
