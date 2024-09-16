import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt";
import { v4 as uuidV4 } from "uuid";

const prisma = new PrismaClient();

export function getYear() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  return (currentYear % 100).toString();
}

async function sub_account() {
  const data = [
    { Acronym: "All", ShortName: "All", Description: "A" },
    {
      Acronym: "BO",
      ShortName: "Baguio Office",
      Description: "Baguio Office",
    },
    {
      Acronym: "CO",
      ShortName: "Calasiao Office",
      Description: "Calasiao Office",
    },
    { Acronym: "CSB", ShortName: "CSB", Description: "CASH BOND" },
    { Acronym: "EO", ShortName: "Edsa Office", Description: "" },
    { Acronym: "EV", ShortName: "EV", Description: "EDEN VILLASAN" },
    { Acronym: "HO", ShortName: "Head Office", Description: "H" },
    { Acronym: "IO", ShortName: "ISABELA OFFICE", Description: "" },
    { Acronym: "MCC", ShortName: "MACHINE COMPLETE CORP.", Description: "MCC" },
    { Acronym: "ML", ShortName: "ML", Description: "MALALALALALALA" },
    {
      Acronym: "SC",
      ShortName: "SANCARLOS OFFICE",
      Description: "SANCARLOS OFFICE",
    },
    { Acronym: "TAR", ShortName: "TAR", Description: "TARLAC OFFICE" },
    {
      Acronym: "TO",
      ShortName: "Tarlac Office",
      Description: "Tarlac Office",
    },
    { Acronym: "UIA", ShortName: "UPWARD INSURANCE CORP.", Description: "UIA" },
    {
      Acronym: "UO",
      ShortName: "Urdaneta Office",
      Description: "Urdaneta Office",
    },
  ];
  await prisma.sub_account.createMany({
    data,
  });
}
export function getMonth() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  return currentMonth.toString().padStart(2, "0");
}
export async function createIdSequence() {
  const user = await prisma.id_sequence.createMany({
    data: [
      {
        last_count: "000",
        month: getMonth(),
        type: "entry client",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "entry employee",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "entry agent",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "entry fixed assets",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "entry supplier",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "entry others",
        year: getYear(),
      },
      {
        last_count: "0000",
        month: getMonth(),
        type: "pdc",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "pdc-chk",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "collection",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "deposit",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "return-check",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "petty-cash",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "general-journal",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "cash-disbursement",
        year: getYear(),
      },
      {
        last_count: "0000",
        month: getMonth(),
        type: "pullout",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "check-postponement",
        year: getYear(),
      },
      {
        last_count: "000",
        month: getMonth(),
        type: "claims",
        year: getYear(),
      },
    ],
  });
  console.log("new user : ", user);
}
export function getAcronym(inputText: string) { 
  const exclusionList = ["and", "the", "in", "of", "for", "with"];
  inputText = inputText.trim().toLowerCase();
  const words = inputText.split(" ");
  let acronym = "";
  for (const word of words) {
    if (!exclusionList.includes(word)) {
      acronym += word[0];
    }
  }
  return acronym.toUpperCase();
}
export async function testJoin() {
  return await prisma.entry_client.findMany({
    include: {
      contact_details: true,
    },
    where: {
      entry_client_id: "b4f346b7-c007-434e-9180-a24a0ca7ed15",
    },
  });
}
export async function creatSampleUser() {
  const password1 = hashSync("password1", 12);
  const _password1 = hashSync("EMP19073", 12);
  const __password1 = hashSync("_EMP19073", 12);

  const _password2 = hashSync("EMP21092", 12);
  const __password2 = hashSync("_EMP21092", 12);
  const password2 = hashSync("password2", 12);

  const password3 = hashSync("password3", 12);
  const _password3 = hashSync("EMP18314", 12);
  const __password3 = hashSync("_EMP18314", 12);
    
  const data = [
    {
      AccountType: "ACCOUNTING",
      Password: password1,
      Username: "EMP19073",
      userConfirmationCode: _password1,
      Department: "UCSMI",
    },
    {
      AccountType: "PRODUCTION",
      Password: password1,
      Username: "_EMP19073",
      userConfirmationCode: __password1,
      Department: "UMIS",
    },
    {
      AccountType: "ACCOUNTING",
      Password: password2,
      Username: "EMP21092",
      userConfirmationCode: _password2,
      Department: "UCSMI",
    },
    {
      AccountType: "PRODUCTION",
      Password: password2,
      Username: "_EMP21092",
      userConfirmationCode: __password2,
      Department: "UMIS",
    },
    {
      AccountType: "ACCOUNTING",
      Password: password3,
      Username: "EMP18314",
      userConfirmationCode: _password3,
      Department: "UCSMI",
    },
    {
      AccountType: "PRODUCTION",
      Password: password3,
      Username: "_EMP18314",
      userConfirmationCode: __password3,
      Department: "UMIS",
    },
  ];

  data.forEach(async (itm) => {
    const UserId = uuidV4();
    const qry1 = `
    insert into upward_insurance.users(UserId,AccountType,Password,Username,userConfirmationCode,Department)
    values (
      '${UserId}',
      '${itm.AccountType}',
      '${itm.Password}',
      '${itm.Username}',
      '${itm.userConfirmationCode}',
      '${itm.Department}'
    )
    `;
    await prisma.$executeRawUnsafe(qry1);

    const qry2 = `
    insert into upward_insurance_ucsmi.users(UserId,AccountType,Password,Username,userConfirmationCode,Department)
    values (
      '${UserId}',
      '${itm.AccountType}',
      '${itm.Password}',
      '${itm.Username}',
      '${itm.userConfirmationCode}',
      '${itm.Department}'
    )
    `;
    await prisma.$executeRawUnsafe(qry2);

    const qry3 = `
    insert into upward_insurance_umis.users(UserId,AccountType,Password,Username,userConfirmationCode,Department)
    values (
      '${UserId}',
      '${itm.AccountType}',
      '${itm.Password}',
      '${itm.Username}',
      '${itm.userConfirmationCode}',
      '${itm.Department}'
    )
    `;
    await prisma.$executeRawUnsafe(qry3);
  });
}

export async function creatSampleSubAccount() {
  const data = [
    { Acronym: "All", ShortName: "All", Description: "A" },
    {
      Acronym: "BO",
      ShortName: "Baguio Office",
      Description: "Baguio Office",
    },
    {
      Acronym: "CO",
      ShortName: "Calasiao Office",
      Description: "Calasiao Office",
    },
    { Acronym: "CSB", ShortName: "CSB", Description: "CASH BOND" },
    { Acronym: "EO", ShortName: "Edsa Office", Description: "" },
    { Acronym: "EV", ShortName: "EV", Description: "EDEN VILLASAN" },
    { Acronym: "HO", ShortName: "Head Office", Description: "H" },
    { Acronym: "IO", ShortName: "ISABELA OFFICE", Description: "" },
    { Acronym: "MCC", ShortName: "MACHINE COMPLETE CORP.", Description: "MCC" },
    { Acronym: "ML", ShortName: "ML", Description: "MALALALALALALA" },
    {
      Acronym: "SC",
      ShortName: "SANCARLOS OFFICE",
      Description: "SANCARLOS OFFICE",
    },
    { Acronym: "TAR", ShortName: "TAR", Description: "TARLAC OFFICE" },
    {
      Acronym: "TO",
      ShortName: "Tarlac Office",
      Description: "Tarlac Office",
    },
    { Acronym: "UIA", ShortName: "UPWARD INSURANCE CORP.", Description: "UIA" },
    {
      Acronym: "UO",
      ShortName: "Urdaneta Office",
      Description: "Urdaneta Office",
    },
  ];
  const subaccount = await prisma.sub_account.createMany({
    data,
  });
  console.log("new subaccount : ", subaccount);
}

export async function createSublineLine() {
  const line = await prisma.subline.createMany({
    data: [
      { Line: "Line", SublineName: "SublineName" },
      { Line: "Bonds", SublineName: "G02" },
      { Line: "Bonds", SublineName: "G13" },
      { Line: "Bonds", SublineName: "G16" },
      { Line: "Bonds", SublineName: "G41" },
      { Line: "Bonds", SublineName: "G42" },
      { Line: "Fire", SublineName: "RESIDENTIAL" },
      { Line: "Fire", SublineName: "COMMERCIAL" },
      { Line: "Vehicle", SublineName: "MC" },
      { Line: "Vehicle", SublineName: "Trailer" },
      { Line: "Bonds", SublineName: "JCL15" },
      { Line: "Bonds", SublineName: "G40" },
      { Line: "Bonds", SublineName: "JCL7" },
      { Line: "Bonds", SublineName: "C9" },
    ],
  });

  console.log("new user : ", line);
}

export async function createPrefix() {
  await prisma.ctplprefix.createMany({
    data: [
      { prefixName: "CV" },
      { prefixName: "PC" },
      { prefixName: "MC" },
      { prefixName: "TRT" },
    ],
  });
}
export async function createCTPLType() {
  await prisma.ctpltype.createMany({
    data: [
      { typeName: "ligth" },
      { typeName: "heavy" },
      { typeName: "trailer" },
      { typeName: "motorcycle" },
    ],
  });
}
export async function getUserById(UserId: string) {
  return await prisma.users.findUnique({
    where: { UserId },
  });
}
interface PolicyAccountType {
  Account: string;
  Description: string;
  AccountCode: string;
  COM: boolean;
  TPL: boolean;
  MAR: boolean;
  FIRE: boolean;
  G02: boolean;
  G13: boolean;
  G16: boolean;
  MSPR: boolean;
  PA: boolean;
  CGL: boolean;
  Inactive: boolean;
}
export async function createPolicyAccount() {
  const sss = [
    { Account: "Alpha", AccountCode: "Alpha Insurance", Description: "ALPHA" },
    {
      Account: "Centennial",
      AccountCode: "Centennial Guarantee Assurance Corp.",
      Description: "CGAC",
    },
    {
      Account: "Monarch",
      AccountCode: "Monarch Insurance Co.",
      Description: "MIC",
    },
    {
      Account: "Plaridel",
      AccountCode: "Plaridel Surety & Insurance Co.",
      Description: "PSIC",
    },
    { Account: "PLife", AccountCode: "Pru-Life", Description: "PLIFE" },
    { Account: "Revest", AccountCode: "Revest Insurance", Description: "REVI" },
    {
      Account: "SecPacific",
      AccountCode: "Security Pacific Assurance Corp.",
      Description: "SPAC",
    },
    {
      Account: "Sici",
      AccountCode: "Stronghold Insurance Company, Inc.",
      Description: "SICI",
    },
    { Account: "SLife", AccountCode: "Sun Life", Description: "SLIFE" },
    {
      Account: "Vilcar",
      AccountCode: "Vilcar Insurance",
      Description: "VILCA",
    },
    {
      Account: "Commonwealth",
      AccountCode: "Insuran	Commonwealth Insurance Company",
      Description: "CIC",
    },
    {
      Account: "TPISC",
      AccountCode: "THE PREMIER INSURANCE & SURETY CORPORATION",
      Description: "TPISC",
    },
    { Account: "MILESTONE GUARANTEE", AccountCode: "", Description: "MGAC" },
    { Account: "ML", AccountCode: "ML", Description: "ML" },
    { Account: "LIBERTY INSURANCE CO", AccountCode: "", Description: "LIC" },
    {
      Account: "FEDERAL PHOENIX ",
      AccountCode: "FEDERAL PHENIX ASSURANCE CO., INC.",
      Description: "FPACI",
    },
    { Account: "LIBERTY - FLOMEN", AccountCode: "", Description: "CTPL" },
    {
      Account: "FLOMEN-LIC",
      AccountCode: "FLOMEN-Liberty Insurance Corp",
      Description: "TPL",
    },
    { Account: "Liberty", AccountCode: "Liberty TPL", Description: "LIB" },
    {
      Account: "TP MILESTONE",
      AccountCode: "TEMPORARY POLICY-MILESTONE GUARANTY",
      Description: "TP",
    },
    {
      Account: "BETHEL",
      AccountCode: "BETHEL INSURANCE",
      Description: "BETH1",
    },
  ];

  const ff: Array<PolicyAccountType> = sss.map((d: any) => {
    d = {
      ...d,
      CGL: false,
      COM: false,
      FIRE: false,
      G02: false,
      G13: false,
      G16: false,
      Inactive: false,
      MAR: false,
      MSPR: false,
      PA: false,
      TPL: false,
    };
    return d;
  });
  return await prisma.policy_account.createMany({
    data: ff,
  });
}

// export async function creatCTPLRegistration() {
//   return await prisma.ctplregistration.createMany({
//     data: [
//       {
//         Prefix: "CV",
//         NumSeriesFrom: 2999150,
//         NumSeriesTo: 2999200,
//         Cost: " 937.31",
//         CreatedBy: "ryanm",
//       },
//       {
//         Prefix: "CV",
//         NumSeriesFrom: 10248401,
//         NumSeriesTo: 10248500,
//         Cost: " 937.31",
//         CreatedBy: "ryanm",
//       },
//       {
//         Prefix: "MC",
//         NumSeriesFrom: 4981812,
//         NumSeriesTo: 4981900,
//         Cost: "309.72",
//         CreatedBy: "ryanm",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 10380265,
//         NumSeriesTo: 10380400,
//         Cost: "519.92",
//         CreatedBy: "ryanm",
//       },
//       {
//         Prefix: "TRT",
//         NumSeriesFrom: 2713264,
//         NumSeriesTo: 2713300,
//         Cost: "309.72",
//         CreatedBy: "ryanm",
//       },
//       {
//         Prefix: "TRT",
//         NumSeriesFrom: 10305401,
//         NumSeriesTo: 10305500,
//         Cost: "309.72",
//         CreatedBy: "ryanm",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 10055351,
//         NumSeriesTo: 10055400,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 10510301,
//         NumSeriesTo: 10510400,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 10522057,
//         NumSeriesTo: 10522081,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "CV",
//         NumSeriesFrom: 10548401,
//         NumSeriesTo: 10548500,
//         Cost: " 937.31",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 10544176,
//         NumSeriesTo: 10544200,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 10822001,
//         NumSeriesTo: 10822100,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 10822101,
//         NumSeriesTo: 10822200,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 10910701,
//         NumSeriesTo: 10910800,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 10910801,
//         NumSeriesTo: 10910900,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 11048801,
//         NumSeriesTo: 11048900,
//         Cost: "519.92",
//         CreatedBy: "JMANUEL",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 11048901,
//         NumSeriesTo: 11049000,
//         Cost: "519.92",
//         CreatedBy: "JMANUEL",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 11139001,
//         NumSeriesTo: 11139100,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 11139101,
//         NumSeriesTo: 11139200,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 11485901,
//         NumSeriesTo: 11486000,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 11486001,
//         NumSeriesTo: 11486100,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 11571201,
//         NumSeriesTo: 11571300,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 11571301,
//         NumSeriesTo: 11571400,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 11722101,
//         NumSeriesTo: 11722200,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "CV",
//         NumSeriesFrom: 11123701,
//         NumSeriesTo: 11123800,
//         Cost: " 937.31",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "PC",
//         NumSeriesFrom: 11722201,
//         NumSeriesTo: 11722300,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "	",
//         NumSeriesFrom: 0,
//         NumSeriesTo: 0,
//         Cost: "0.0",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "E",
//         NumSeriesFrom: 200500,
//         NumSeriesTo: 200599,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "E",
//         NumSeriesFrom: 227800,
//         NumSeriesTo: 227899,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "E",
//         NumSeriesFrom: 227900,
//         NumSeriesTo: 227999,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "E",
//         NumSeriesFrom: 870550,
//         NumSeriesTo: 870649,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "E",
//         NumSeriesFrom: 871950,
//         NumSeriesTo: 871999,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "E",
//         NumSeriesFrom: 872500,
//         NumSeriesTo: 872549,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "E",
//         NumSeriesFrom: 872550,
//         NumSeriesTo: 872649,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "F",
//         NumSeriesFrom: 471500,
//         NumSeriesTo: 471599,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "E",
//         NumSeriesFrom: 877444,
//         NumSeriesTo: 877445,
//         Cost: "0.0",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "F",
//         NumSeriesFrom: 457750,
//         NumSeriesTo: 457799,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "F",
//         NumSeriesFrom: 457800,
//         NumSeriesTo: 457849,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "G",
//         NumSeriesFrom: 135000,
//         NumSeriesTo: 135099,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "F",
//         NumSeriesFrom: 670250,
//         NumSeriesTo: 670349,
//         Cost: " 937.31",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "G",
//         NumSeriesFrom: 160350,
//         NumSeriesTo: 160449,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "G",
//         NumSeriesFrom: 410550,
//         NumSeriesTo: 410649,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "G",
//         NumSeriesFrom: 438750,
//         NumSeriesTo: 438849,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "G",
//         NumSeriesFrom: 624400,
//         NumSeriesTo: 624499,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//       {
//         Prefix: "	",
//         NumSeriesFrom: 711601,
//         NumSeriesTo: 711700,
//         Cost: "519.92",
//         CreatedBy: "jewel",
//       },
//     ],
//   });
// }

export async function creatRates() {
  const Account = [
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "FEDERAL PHOENIX ",
    "FLOMEN-LIC",
    "FLOMEN-LIC",
    "FLOMEN-LIC",
    "FLOMEN-LIC",
    "FEDERAL PHOENIX ",
    "MILESTONE GUARANTEE",
    "FEDERAL PHOENIX ",
    "FEDERAL PHOENIX ",
    "MILESTONE GUARANTEE",
    "LIBERTY INSURANCE CO",
    "FEDERAL PHOENIX ",
    "TP MILESTONE",
    "TP MILESTONE",
    "TP MILESTONE",
    "LIBERTY INSURANCE CO",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "FEDERAL PHOENIX ",
    "FEDERAL PHOENIX ",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "FEDERAL PHOENIX ",
    "FEDERAL PHOENIX ",
    "FLOMEN-LIC",
    "FEDERAL PHOENIX ",
    "FEDERAL PHOENIX ",
    "FEDERAL PHOENIX ",
    "LIBERTY INSURANCE CO",
    "LIBERTY INSURANCE CO",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "MILESTONE GUARANTEE",
    "FEDERAL PHOENIX ",
    "FEDERAL PHOENIX ",
    "MILESTONE GUARANTEE",
    "Alpha",
    "Alpha",
    "Alpha",
    "LIBERTY INSURANCE CO",
    "Alpha",
    "Alpha",
    "Alpha",
    "Alpha",
    "Alpha",
    "FEDERAL PHOENIX ",
    "Centennial",
    "Alpha",
    "BETHEL",
    "BETHEL",
  ];
  const Line = [
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "CGL",
    "Bonds",
    "Bonds",
    "Fire",
    "Fire",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Bonds",
    "PA",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Bonds",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Fire",
    "Bonds",
    "Bonds",
    "Marine",
    "PA",
    "Vehicle",
    "PA",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Bonds",
    "Bonds",
    "Bonds",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "CGL",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "CGL",
    "Bonds",
    "Vehicle",
    "Bonds",
    "Fire",
    "Marine",
    "Bonds",
    "Bonds",
    "Vehicle",
    "Vehicle",
    "Vehicle",
    "Vehicle",
  ];
  const Type = [
    "COM-Light",
    "COM-Private Car",
    "COM-Heavy",
    "",
    "G02",
    "G13",
    "RESIDENTIAL",
    "COMMERCIAL",
    "SUV,AUV,VAN,WAGON,PICK-UP",
    "TPL-Light (1YR)",
    "TPL-Motorcycle (1YR)",
    "TPL-Heavy (1YR)",
    "TPL-Trailer",
    "COM-SUV",
    "COM-LTO",
    "SEDAN",
    "COM-SEDAN",
    "JCL7",
    "Personal Accident",
    "COM-SUV Surcharge 1",
    "COM-Light",
    "COM-Heavy",
    "COM-Private Car",
    "G16",
    "COM-Motorcycle",
    "PF",
    "COM-PF",
    "COM-SpecialRate",
    "COM-SPECIALRATE2%",
    "COMMERCIAL",
    "G41",
    "G42",
    "",
    "",
    "COM-SUV Surcharge 2",
    "Personal Accident",
    "TPL- Light (3YRS)",
    "COM-CV Light",
    "COM-CV Heavy",
    "COM-CV Heavy Surcharge1",
    "COM-PC",
    "G02",
    "G16",
    "G40",
    "TPL - LIGHT (1YR) MGAC",
    "TPL - LIGHT (3YRS) MGAC",
    "TPL - MOTORCYCLE (1YR) MGAC",
    "TPL - HEAVY (1YR) MGAC",
    "TPL - TRAILER MGAC",
    "COM-Motorcycle 2.8%",
    "",
    "COM PC MGAC-special rate",
    "COM-ALPHA-PRIVATE CAR",
    "COMP-ALPHA-Private Car",
    "CGL",
    "C9",
    "COMP-ALPHA-Commercial",
    "G16",
    "RESIDENTIAL",
    "",
    "G13",
    "JCL7",
    "TPL - CENT PC",
    "COM-LTO-ALPHA",
    "TPL - LIGHT (1Y) BETHEL",
    "TPL - LIGHT (3YRS) BETHEL",
  ];
  const Rate = [
    1, 1.3, 1.4, 30, 50, 35, 35, 35, 0.9, 519.92, 309.72, 937.31, 309.72, 0.9,
    2.5, 1.3, 1.3, 40, 30, 1.035, 1, 1.4, 1.3, 35, 30, 30, 30, 2, 2, 25, 35, 35,
    30, 30, 1.08, 30, 1559.76, 1, 1.4, 1.61, 30, 50, 30, 35, 519.99, 1559.76,
    309.72, 937.31, 309.72, 35, 25, 1.35, 1.3, 0.9, 30, 30, 1.4, 35, 25, 25, 35,
    30, 30, 20, 519.92, 1559.76,
  ];
  const arr: Array<any> = [];
  Account.forEach((data, idx) => {
    arr.push({
      Account: data,
      Line: Line[idx],
      Type: Type[idx],
      Rate: `${Rate[idx]}`,
    });
  });
  console.log(Account.length, Line.length, Type.length, Rate.length);
  console.log(arr);

  return prisma.rates.createMany({
    data: arr,
  });
}

export async function createMortgagee() {
  const data = [
    { Policy: "TPL", Mortgagee: "N I L - HN" },
    { Policy: "TPL", Mortgagee: "AMIFIN" },
    { Policy: "TPL", Mortgagee: "N I L" },
    { Policy: "Comprehensive", Mortgagee: "CASH MANAGEMENT FINANCE INC." },
    {
      Policy: "Comprehensive",
      Mortgagee: "CREDIT MASTERS & LENDING INVESTORS CORP.",
    },
    { Policy: "Comprehensive", Mortgagee: "CAMFIN LENDING, INC." },
    { Policy: "Comprehensive", Mortgagee: "ASIAN CONSUMERS BANK" },
    {
      Policy: "Comprehensive",
      Mortgagee: "ORIX METRO LEASING AND FINANCE CORPORATION",
    },
    { Policy: "Comprehensive", Mortgagee: "METROPOLITAN BANK & TRUST COMPANY" },
    { Policy: "Comprehensive", Mortgagee: "UNION BANK OF THE PHILIPPINES" },
    { Policy: "Comprehensive", Mortgagee: "BANCO DE ORO UNIBANK, INC." },
    { Policy: "Comprehensive", Mortgagee: "RADIOWEALTH FINANCE COMPANY, INC." },
    { Policy: "Comprehensive", Mortgagee: "UCPB LEASING AND FINANCE, CORP." },
    { Policy: "Comprehensive", Mortgagee: "RURAL BANK" },
    { Policy: "Comprehensive", Mortgagee: "PS BANK" },
    { Policy: "Comprehensive", Mortgagee: "EASTWEST BANK" },
    { Policy: "Comprehensive", Mortgagee: "FILIPINO FINANCIAL CORPORATION" },
    { Policy: "Comprehensive", Mortgagee: "SOUTH ASIALINK CREDIT CORP." },
    {
      Policy: "Comprehensive",
      Mortgagee: "TOYOTA FINANCIAL SERVICES PHILIPPINES CORPORATION",
    },
    { Policy: "Comprehensive", Mortgagee: "ASIA LINK FINANCE CORP." },
    {
      Policy: "FIRE",
      Mortgagee:
        "WATER AND SEWERAGE SECTOR SAVINGS AND LOAN ASSOCIATION, INC. (WASSLAI)",
    },
    { Policy: "Comprehensive", Mortgagee: "PHILIPPINE SAVINGS BANK" },
    {
      Policy: "Comprehensive",
      Mortgagee: "RIZAL COMMERCIAL BANKING CORPORATION",
    },
    { Policy: "Comprehensive", Mortgagee: "LAND BANK OF THE PHILIPPINES" },
    { Policy: "Comprehensive", Mortgagee: "PRIME AMA LENDING CORP." },
    { Policy: "Comprehensive", Mortgagee: "INTER-ASIA DEVELOPMENT BANK" },
    { Policy: "Comprehensive", Mortgagee: "SECURITY BANK CORP." },
    { Policy: "TPL", Mortgagee: "N I L - ASTRA" },
  ];

  await prisma.mortgagee.createMany({
    data,
  });
}

export async function createBank() {
  const banks = [
    {
      Bank_Code: "1.01.10",
      Bank: "MBTC, EDSA MUNOZ 480-7-48002689-2",
      Inactive: false,
    },
    {
      Bank_Code: "1.01.11",
      Bank: "MBTC-BAESA UIA 3-365-046515-5",
      Inactive: false,
    },
    { Bank_Code: "1.01.12", Bank: "BPI - CALOOCAN", Inactive: false },
    { Bank_Code: "1.01.13", Bank: "BPI - URDANETA ", Inactive: false },
    { Bank_Code: "1.01.14", Bank: "BDO - Cabanatuan", Inactive: false },
    { Bank_Code: "1.01.15", Bank: "MBTC - Edsa", Inactive: false },
    { Bank_Code: "1.01.16", Bank: "EWB - BAESA", Inactive: false },
    {
      Bank_Code: "1.01.17",
      Bank: "MBTC-BAESA CASH MNGT 7-365-50105-6",
      Inactive: true,
    },
    { Bank_Code: "1.01.18", Bank: "BDO", Inactive: false },
    { Bank_Code: "1.01.19", Bank: "MBTC", Inactive: false },
    { Bank_Code: "1.01.20", Bank: "PNB", Inactive: false },
    { Bank_Code: "1.01.21", Bank: "EWB", Inactive: false },
    { Bank_Code: "1.01.22", Bank: "PSB", Inactive: false },
    { Bank_Code: "1.01.23", Bank: "PBB", Inactive: false },
    { Bank_Code: "1.01.24", Bank: "CBC", Inactive: false },
    { Bank_Code: "1.01.25", Bank: "RBCPI", Inactive: false },
    { Bank_Code: "1.01.26", Bank: "RCBC", Inactive: false },
    { Bank_Code: "1.01.27", Bank: "BPI", Inactive: false },
    { Bank_Code: "1.01.28", Bank: "UCPB", Inactive: false },
    { Bank_Code: "1.01.29", Bank: "MVSMB", Inactive: false },
    { Bank_Code: "1.01.30", Bank: "PSBC", Inactive: false },
    { Bank_Code: "1.01.31", Bank: "SecB", Inactive: false },
    {
      Bank_Code: "1.01.32",
      Bank: "MBTC-CASH MNGT 7-365-50105-6",
      Inactive: false,
    },
    { Bank_Code: "1.01.33", Bank: "Gatebank", Inactive: false },
    { Bank_Code: "1.01.34", Bank: "ROBINSONS BANK", Inactive: false },
    { Bank_Code: "AUB", Bank: "ASIA UNITED BANK", Inactive: false },
    { Bank_Code: "BDO", Bank: "BANCO DE ORO", Inactive: false },
    { Bank_Code: "BOC", Bank: "BANK OF COMMERCE", Inactive: false },
    { Bank_Code: "BOM", Bank: "Bank of Makati", Inactive: false },
    {
      Bank_Code: "BPI",
      Bank: "BANK OF THE PHILIPPINE ISLANDS",
      Inactive: false,
    },
    { Bank_Code: "CBC", Bank: "Chinabank", Inactive: false },
    { Bank_Code: "CBS", Bank: "China Bank Savings", Inactive: false },
    { Bank_Code: "CSB", Bank: "CITYSTATE BANK", Inactive: false },
    { Bank_Code: "CSFB", Bank: "CS First Bank", Inactive: false },
    {
      Bank_Code: "CTBC",
      Bank: "Chinatrust Philippines Commercial Bank Corp.",
      Inactive: false,
    },
    { Bank_Code: "EWB", Bank: "EASTWEST BANK", Inactive: false },
    {
      Bank_Code: "EWBEDSA",
      Bank: "EWB-EDSA Munoz Upward Mngt. 200021334684",
      Inactive: false,
    },
    { Bank_Code: "FCB", Bank: "FICOBANK", Inactive: false },
    { Bank_Code: "GMBoLI", Bank: "GM BANK OF LUZON, INC.", Inactive: false },
    { Bank_Code: "GTBANK", Bank: "GATEBANK", Inactive: false },
    { Bank_Code: "IADB", Bank: "IADB", Inactive: false },
    { Bank_Code: "LBP", Bank: "Landbank of the Philippines", Inactive: false },
    { Bank_Code: "LDB", Bank: "Luzon Development Bank", Inactive: false },
    { Bank_Code: "MALBNK", Bank: "MALAYAN BANK", Inactive: false },
    { Bank_Code: "MAYBNK", Bank: "MAYBANK", Inactive: false },
    { Bank_Code: "MBTC", Bank: "METROBANK", Inactive: false },
    { Bank_Code: "OneNetBnk", Bank: "One Network Bank", Inactive: false },
    { Bank_Code: "PB", Bank: "PORAK BANK", Inactive: false },
    { Bank_Code: "PBB", Bank: "Philippine Business Bank", Inactive: false },
    {
      Bank_Code: "PBCOM",
      Bank: "PHIL. BANK OF COMMUNICATIONS",
      Inactive: false,
    },
    { Bank_Code: "PNB", Bank: "Philippine National Bank", Inactive: false },
    { Bank_Code: "PSB", Bank: "PSBANK", Inactive: false },
    {
      Bank_Code: "PSBC",
      Bank: "Producers Savings Bank Corp.",
      Inactive: false,
    },
    {
      Bank_Code: "QUEENBANK",
      Bank: "Queen City Development Bank",
      Inactive: false,
    },
    { Bank_Code: "RB", Bank: "ROBINSONS BANK", Inactive: true },
    {
      Bank_Code: "RBCPI",
      Bank: "RURAL BANK OF CENTRAL PANGASINAN INC.",
      Inactive: false,
    },
    { Bank_Code: "RBOCI", Bank: "Rural Bank of Cauayan Inc.", Inactive: false },
    { Bank_Code: "RBOM", Bank: "RURAL BANK OF MABITAC", Inactive: false },
    {
      Bank_Code: "RBoRI",
      Bank: "Rural Bank of Rosario(L.U.) Inc.",
      Inactive: false,
    },
    { Bank_Code: "RCBC", Bank: "RCBC BANK", Inactive: false },
    { Bank_Code: "SBA", Bank: "Sterling Bank of Asia", Inactive: false },
    { Bank_Code: "SECB", Bank: "Security Bank", Inactive: false },
    { Bank_Code: "TRB", Bank: "TANAY RURAL BANK", Inactive: false },
    { Bank_Code: "UB", Bank: "UNIONBANK", Inactive: false },
    {
      Bank_Code: "UCPB",
      Bank: "UNITED COCONUT PLANTERS BANK",
      Inactive: false,
    },
    { Bank_Code: "VB", Bank: "VETERANS BANK", Inactive: false },
    { Bank_Code: "WPB", Bank: "World Partners Bank", Inactive: false },
  ];
  return await prisma.bank.createMany({
    data: banks,
  });
}

export function createsampleData() {
  createIdSequence();
  creatSampleUser();
  creatSampleSubAccount();
  createSublineLine();
  createPrefix();
  createCTPLType();
  createPolicyAccount();
  creatRates();
  createMortgagee();
  createBank();
}
