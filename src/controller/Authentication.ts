import { PrismaClient } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
const Authentication = express.Router();
const prisma = new PrismaClient();

function generateAccessToken(UserId: string) {
  return jwt.sign({ UserId }, process.env.ACCESS_TOKEN as string, {
    expiresIn: "24h",
  });
}

async function updateRefreshToken(UserId: string, refreshToken: string) {
  await prisma.users.update({
    where: {
      UserId: UserId,
    },
    data: {
      REFRESH_TOKEN: refreshToken,
    },
  });
}

export function ValidateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === "" || token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(
    token as string,
    process.env.ACCESS_TOKEN as string,
    (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    }
  );
}

Authentication.post("/refresh-token", async (req, res) => {
  const refreshToken = req.body.REFRESH_TOKEN;
  if (refreshToken == null) return res.sendStatus(401);

  if (
    !(await prisma.users.findFirst({
      where: { REFRESH_TOKEN: { equals: refreshToken } },
    }))
  ) {
    return res.sendStatus(403);
  }

  jwt.verify(
    refreshToken as string,
    process.env.REFRESH_TOKEN as string,
    (err, user) => {
      if (err) return res.sendStatus(403);
      const getUser: any = user;
      const accessToken = generateAccessToken(getUser.UserId);
      res.cookie("up-at-login", accessToken, { httpOnly: true });

      res.send({ accessToken: accessToken });
    }
  );
});

Authentication.post("/login", async (req: Request, res: Response) => {
  const findUser = await prisma.users.findUnique({
    where: {
      Username: req.body.username,
    },
  });

  if (!findUser || findUser == null) {
    return res.send({
      message: "No Username Found!",
      success: false,
      username: true,
      password: false,
      user: null,
    });
  }

  if (compareSync(req.body.password, findUser.Password)) {
    const accessToken = generateAccessToken(findUser.UserId);
    const refreshToken = jwt.sign(
      { UserId: findUser.UserId },
      process.env.REFRESH_TOKEN as string
    );
    updateRefreshToken(findUser.UserId, refreshToken);
    const userAccess = jwt.sign(
      { userAccess: findUser.AccountType },
      process.env.USER_ACCESS as string
    );

    const department = findUser.Department;
    const is_master_admin = findUser.is_master_admin;
    res.cookie("up-ac-login", userAccess, { httpOnly: true });
    res.cookie("up-dpm-login", department, { httpOnly: true });
    res.cookie("up-ima-login", is_master_admin, { httpOnly: true });
    res.cookie("up-at-login", accessToken, { httpOnly: true });
    res.cookie("up-rt-login", refreshToken, { httpOnly: true });

    await prisma.system_logs.create({
      data: {
        action: "login",
        username: req.body.username,
        dataString: findUser.UserId,
        createdAt: new Date(),
        user_id: findUser.UserId,
        module: "Authentication",
        account_type: findUser?.AccountType,
      },
    });

    return res.send({
      message: "Successfully Login",
      success: true,
      username: false,
      password: false,
      user: {
        accessToken,
        refreshToken,
        userAccess: findUser.AccountType,
        department,
        is_master_admin,
      },
      cokie: {
        "up_ac_login": userAccess,
        "up_dpm_login": department,
        "up_ima_login": is_master_admin,
        "up_at_login": accessToken,
        "up_rt_login": refreshToken,
      },
    });
  } else {
    return res.send({
      message: "Password Incorect",
      success: false,
      username: false,
      password: true,
      user: null,
    });
  }
});

Authentication.get("/token", async (req, res) => {
  const department = req.cookies["up-dpm-login"];
  const is_master_admin =
    req.cookies["up-ima-login"] === "false" ? false : true;
  const accessToken = req.cookies["up-at-login"];
  const refreshToken = req.cookies["up-rt-login"];
  const userAccessToken = req.cookies["up-ac-login"];
  if (refreshToken === "" || refreshToken == null) {
    return res.send(null);
  }
  try {
    const user: any = await VerifyToken(
      refreshToken as string,
      process.env.REFRESH_TOKEN as string
    );

    const { userAccess }: any = await VerifyToken(
      userAccessToken as string,
      process.env.USER_ACCESS as string
    );

    const newAccessToken = generateAccessToken(user.UserId);
    res.cookie("up-at-login", newAccessToken, { httpOnly: true });
    req.user = user;
    res.send({
      accessToken,
      refreshToken,
      userAccess,
      department,
      is_master_admin,
    });
  } catch (err: any) {
    console.log(err.message);
    return res.send(null);
  }

  // jwt.verify(
  //   refreshToken as string,
  //   process.env.REFRESH_TOKEN as string,
  //   (err, user) => {
  //     if (err) return res.send(null);
  //     const getUser: any = user;
  //     const newAccessToken = generateAccessToken(getUser.UserId);
  //     res.cookie("up-at-login", newAccessToken, { httpOnly: true });
  //     req.user = user;
  //     res.send({ accessToken, refreshToken, userAccess });
  //   }
  // );
});

export async function VerifyToken(token: string, secret: string) {
  return new Promise(function (resolve, reject) {
    jwt.verify(token, secret, function (err, decode) {
      if (err) {
        reject(err);
        return;
      }
      resolve(decode);
    });
  });
}

// Authentication.use(ValidateToken);

// Authentication.get("/user", (req: Request, res: Response) => {
//   res.send({ user: req.user });
// });

// Authentication.get("/logout", (req: Request, res: Response) => {
//   res.cookie("up-rt-login", { expires: Date.now() });
//   res.cookie("up-at-login", { expires: Date.now() });
//   res.clearCookie("up-rt-login");
//   res.clearCookie("up-at-login");
//   const id = (req.user as any).UserId;
//   updateRefreshToken(id, "");
//   res.send({ message: "Logout Successfully", success: true });
// });

export function logout(req: Request, res: Response) {
  res.cookie("up-rt-login", { expires: Date.now() });
  res.cookie("up-at-login", { expires: Date.now() });
  res.cookie("db-k-d", { expires: Date.now() });
  res.clearCookie("up-rt-login");
  res.clearCookie("up-at-login");
  res.clearCookie("db-k-d");
  res.clearCookie("up-ima-login");
  const id = (req.user as any).UserId;
  updateRefreshToken(id, "");
  res.send({ message: "Logout Successfully", success: true });
}

export default Authentication;
