import { format } from "date-fns";
import { PrismaList } from './connection'
import { Request } from "express";
const { CustomPrismaClient } = PrismaList();

export async function getUserByUsername(username: string, req: Request) {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);


    return await prisma.$queryRawUnsafe(`
        select * from users where Username = '${username}'
    `)

}