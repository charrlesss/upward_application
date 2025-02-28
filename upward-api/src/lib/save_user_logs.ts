import { Request } from "express";
import { getUserById } from "../model/StoredProcedure";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function saveUserLogs(
  req: Request,
  dataString: string,
  action: string,
  module: string
) {
  const user = await getUserById((req.user as any).UserId);
  await prisma.system_logs.create({
    data: {
      action,
      username: user?.Username as string,
      dataString,
      createdAt: new Date(),
      user_id: user?.UserId as string,
      module,
      account_type: user?.AccountType as string,
    },
  });
}
