import express from "express";
import cors from "cors";
import router from "./src/controller";
import path from "path";
import cookieParser from "cookie-parser";
import { creatSampleUser } from "./src/model/StoredProcedure";

const PORT = process.env.PORT;

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:4000", "/", "*"],
  credentials: true,
  optionSuccessStatus: 200,
}; 

async function main() {
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: "1000mb" }));
  app.use(cookieParser());
  app.use(cors(corsOptions));
  app.use(express.static(path.join(__dirname, "static")));
  app.use(express.static(path.join(__dirname, "/static/image/")));
  app.use(express.static(path.join(__dirname, "/src/view")));
  app.use("/api", router);
  // creatSampleUser()
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/src/view/", "index.html"));
  });
  app.listen(PORT, () => console.log(`Listen in port ${PORT}`));
}

main()
  .then(async () => {})
  .catch(async (e) => {
    console.error(e);
  });
