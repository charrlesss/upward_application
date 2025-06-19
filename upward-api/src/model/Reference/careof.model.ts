import { Request } from "express";
import { prisma } from "../../controller/index";

export async function addCareOf(data: any, req: Request) {
  return await prisma.careof.create({
    data,
  });
}
export async function findCareOf(careOf: string, req: Request) {
  return await prisma.careof.findMany({ where: { careOf } });
}
export async function updateCareOf(data: any, req: Request) {
  return await prisma.careof.update({
    data,
    where: {
      careId: data.careId,
    },
  });
}

export async function removeCareOf(careId: number, req: Request) {
  return await prisma.careof.delete({
    where: {
      careId,
    },
  });
}

export async function getCareOf(search: string) {
  return await prisma.$queryRawUnsafe(
    `select 
        IF(a.inactive = 0 ,'YES','NO') as inactive,
        a.careOf,
        a.address, 
        a.careId
    from careof a 
    where 
    a.address LIKE '%${search}%' 
    OR  a.careOf LIKE '%${search}%'`
  );
}
