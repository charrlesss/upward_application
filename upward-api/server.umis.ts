import express from "express";
import cors from "cors";
import router from "./src/controller";
import path from "path";
import cookieParser from "cookie-parser";
import env from "dotenv";
import { createIdSequence } from "./src/model/StoredProcedure";
import { hashSync } from "bcrypt";
env.config({ path: ".env.umis" });
const PORT = process.env.PORT;

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:4000",
    "https://umis.upwardinsurance.net",
    "https://ucsmi.upwardinsurance.net",
    "https://upwardinsurance.net",
    "http://192.168.100.220:3000",
    "/",
    "*",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

async function main() {
  console.log(hashSync("marimar", 12));
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: "1000mb" }));
  app.use(cookieParser());
  app.use(cors(corsOptions));
  app.use(express.static(path.join(__dirname, "static")));
  app.use(express.static(path.join(__dirname, "/static/image/")));
  app.use(express.static(path.join(__dirname, "/src/viewumis")));

  app.use((req, res, next) => {
    console.log(`Received ${req.method} from ${req.ip} to ${req.originalUrl}`);
    next();
  });

  app.use("/api", router);
  // creatSampleUser();
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/src/viewumis/", "index.html"));
  });
  app.listen(PORT, () => console.log(`Listen in port ${PORT}`));
}

main()
  .then(async () => {})
  .catch(async (e) => {
    console.error(e);
  });
