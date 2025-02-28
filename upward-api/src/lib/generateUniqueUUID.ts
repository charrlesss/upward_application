import { v4 as uuidv4 } from "uuid";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
export default async function generateUniqueUUID(model: string, id: string) {
  let uniqueUUID = "";
  let isUnique = false;

  while (!isUnique) {
    uniqueUUID = uuidv4();
    const existingRecord = await prisma[model].findUnique({
      where: {
        [id]: uniqueUUID,
      },
    });

    if (!existingRecord) {
      isUnique = true;
    }
  }
  return uniqueUUID;
}
