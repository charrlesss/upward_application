import express from "express";
import VehiclePolicy from "./vehiclepolicy";
import FirePolicy from "./firepolicy";
import MarinePolicy from "./marinepolicy";
import BondPolicy from "./bondpolicy";
import MSPRPolicy from "./msprpolicy";
import PAPolicy from "./papolicy";
import CGLPolicy from "./cglpolicy";
import Policy from "./policy";

const Production = express.Router();

Production.use("/production", VehiclePolicy);
Production.use("/production", FirePolicy);
Production.use("/production", MarinePolicy);
Production.use("/production", BondPolicy);
Production.use("/production", MSPRPolicy);
Production.use("/production", PAPolicy);
Production.use("/production", CGLPolicy);
Production.use("/production", Policy);

export default Production;
