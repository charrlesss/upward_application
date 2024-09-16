import { compareSync } from "bcrypt";
import { getUserById } from "../model/StoredProcedure";
import { Request } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function saveUserLogsCode(
  req: Request,
  action: string,
  dataString: string,
  module: string
) {
  const user = await getUserById((req.user as any).UserId);

  if (
    compareSync(
      req.body.userCodeConfirmation,
      user?.userConfirmationCode as string
    )
  ) {
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

    return true;
  }
  return false;
}
