import express from "express";
import RenewlNotice from "./renewal-notice";
const Template = express.Router();


Template.use("/template", RenewlNotice);

export default Template;
