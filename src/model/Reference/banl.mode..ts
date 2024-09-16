import { Request } from "express";
import { PrismaList } from "../connection";
const { CustomPrismaClient } = PrismaList();


export async function addBank(data: any, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.bank.create({
    data,
  });
}
export async function findBank(Bank_Code: string, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.bank.findUnique({ where: { Bank_Code } });
}
export async function updateBank(data: any, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.bank.update({
    data,
    where: {
      Bank_Code: data.Bank_Code,
    },
  });
}

export async function removeBank(Bank_Code: string, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.bank.delete({
    where: {
      Bank_Code,
    },
  });
}

export async function getBanks(bankSearch: string, req:Request) {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  return await prisma.$queryRawUnsafe(
    `select IF(a.Inactive = 0 , 'YES','NO') as Inactive,a.Bank_Code,a.Bank from bank a where a.Bank_Code LIKE '%${bankSearch}%' OR   a.Bank LIKE '%${bankSearch}%'`
  );
}
