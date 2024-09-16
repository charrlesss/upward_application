import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import router from "./src/controller";
import path from "path";
import cookieParser from "cookie-parser";

import {
  creatSampleUser,
  createIdSequence,
  creatSampleSubAccount,
  getAcronym,
  createSublineLine,
  createPrefix,
  createCTPLType,
  createPolicyAccount,
  creatRates,
  createMortgagee,
  createBank
} from "./src/model/StoredProcedure";

import testReport from "./src/controller/Reports/test-report";

const prisma = new PrismaClient();
const PORT = 5500;

const corsOptions = {
  origin:[ "http://localhost:3000", "http://localhost:4000","/","http://localhost:9000"],
  // origin:"*",
  credentials: true,
  optionSuccessStatus: 200,
};

function executeQuery() {
  // creatSampleUser()
  // createIdSequence()
  // creatSampleSubAccount()
  // createSublineLine()
  // createPrefix()
  // createCTPLType()
  // creatRates()
  // createMortgagee()
  // createBank()
}

async function main() {
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors(corsOptions));


  app.use('/testing',testReport)


  
  executeQuery();

  app.listen(PORT, () => console.log(`Listen in port ${PORT}`));
}

main()
.then(async () => {
  await prisma.$disconnect();
})
.catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});


