import express from "express";
import Claim from "./claims";
const Claims = express.Router();

Claims.use("/claims/", Claim);

export default Claims;
