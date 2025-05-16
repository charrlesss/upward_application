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

Production.use("/task/production", VehiclePolicy);
Production.use("/task/production", FirePolicy);
Production.use("/task/production", MarinePolicy);
Production.use("/task/production", BondPolicy);
Production.use("/task/production", MSPRPolicy);
Production.use("/task/production", PAPolicy);
Production.use("/task/production", CGLPolicy);
Production.use("/task/production", Policy);

export default Production;
