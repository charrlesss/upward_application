import express from "express";
import Production from "./Production";
import Accounting from "./Accounting";
import Claims from "./Claims";
const Task = express.Router();

Task.use("/task/", Production);
Task.use("/task/", Accounting);
Task.use("/task/", Claims);

export default Task;
