import { PrismaClient } from "@prisma/client";



    
export function PrismaList() {

// const DATABASE_URL_UCSMI =  "mysql://upward_user:upward123@localhost:3306/upward_insurance_ucsmi";
// const DATABASE_URL_UMIS = "mysql://upward_user:upward123@localhost:3306/upward_insurance_umis";

  // const DATABASE_URL_UCSMI ="mysql://root:charles@localhost:3306/upward_insurance_umis";
  // const DATABASE_URL_UMIS = "mysql://root:charles@localhost:3306/upward_insurance_umis";

  // const DATABASE_URL_UCSMI ="mysql://root:charles@localhost:3306/new_upward_insurance_ucsmi";
  // const DATABASE_URL_UMIS = "mysql://root:charles@localhost:3306/new_upward_insurance_ucsmi";

  // const prismaUMIS = new PrismaClient({
  //   datasources: { db: { url: DATABASE_URL_UMIS } },
  // });
  // const prismaUCSMI = new PrismaClient({
  //   datasources: { db: { url: DATABASE_URL_UCSMI } },
  // });

  function CustomPrismaClient(department: string) {
      return new PrismaClient()
  }

  return {
    CustomPrismaClient,
  };
}
