import express from "express";
import {
  getClients,
  getSelectedClient,
} from "../../model/Template/renewal-notice";
const RenewlNotice = express.Router();

RenewlNotice.get("/renewal-notice", async (req, res) => {
  try {
    const { search } = req.query;
    res.send({
      message: "Successfully get clients",
      succes: true,
      getClients: await getClients(search as string),
    });
  } catch (err: any) {
    console.log(err);
    res.send({ message: "SERVER ERROR", succes: false, getClients: [] });
  }
});

RenewlNotice.post("/renewal-notice-selected-search", async (req, res) => {
  try {
    const report = await getSelectedClient(
      req.body.PolicyType,
      req.body.PolicyNo
    );


    res.send({
      message: "Successfully get clients",
      succes: true,
      report,
    });
  } catch (err: any) {
    console.log(err);
    res.send({ message: "SERVER ERROR", succes: false, report: [] });
  }
});

export default RenewlNotice;
