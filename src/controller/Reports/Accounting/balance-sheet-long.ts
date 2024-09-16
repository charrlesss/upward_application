import { PrismaClient } from "@prisma/client";
import express from "express";
import { FinancialStatement } from "../../../model/db/stored-procedured";
import { PrismaList } from "../../../model/connection";
const BalanceSheetLong = express.Router();
const { CustomPrismaClient } = PrismaList();

BalanceSheetLong.post("/balance-sheet-long-report", async (req, res) => {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  let qry = "";
  if (req.body.format === 0) {
    const tmp = `
    select 
        tmp.Code ,
        tmp.Title ,
        tmp.PrevDebit  ,
        tmp.PrevCredit  ,
        tmp.PrevBalance  ,
        tmp.CurrDebit  ,
        tmp.CurrCredit  ,
        tmp.CurrBalance  ,
        tmp.BalDebit  ,
        tmp.BalCredit  ,
        tmp.TotalBalance  
    from (${FinancialStatement(
      req.body.date,
      req.body.sub_acct,
      req.body.dateFormat
    )}) tmp
  `;
    const tmp1 = `
    SELECT
        Code,
        Title,
        LEFT(Code, 1) AS H1,
        LEFT(Code, 4) AS H2,
        CASE WHEN CAST(LEFT(Code, 1) AS UNSIGNED) >= 4 THEN PrevCredit - PrevDebit ELSE PrevBalance END AS PrevBalance,
        CurrDebit,
        CurrCredit,
        CASE WHEN CAST(LEFT(Code, 1) AS UNSIGNED) >= 4 THEN CurrCredit - CurrDebit ELSE CurrBalance END AS CurrBalance,
        CASE WHEN CAST(LEFT(Code, 1) AS UNSIGNED) >= 4 THEN (PrevCredit - PrevDebit) + (CurrCredit - CurrDebit) ELSE TotalBalance END AS TotalBalance
    FROM (${tmp}) tmp
    WHERE LEFT(Code, 1) <= 5
  `;
    const finalTemp = `
    SELECT
        LEFT(tmp1.Code, 1) AS H1,
        tmp1.H2,
        Chart_Account.Acct_Title AS HT2,
        tmp1.Code AS H3,
        tmp1.Title AS HT3,
        PrevBalance,
        CurrDebit,
        CurrCredit,
        CurrBalance,
        TotalBalance
    FROM (${tmp1}) tmp1
    LEFT JOIN Chart_Account ON tmp1.H2 = Chart_Account.Acct_Code
  `;
    let final = `
    SELECT
        H1,
        Chart_Account.Acct_Title AS HT1,
        H2,
        HT2,
        H3,
        HT3,
        PrevBalance,
        CurrDebit,
        CurrCredit,
        CurrBalance,
        TotalBalance
    FROM (${finalTemp}) FinalTemp
    LEFT JOIN Chart_Account ON FinalTemp.H1 = Chart_Account.Acct_Code
  `;
    const tmp2 = `
    SELECT
        PrevDebit,
        PrevCredit,
        CASE WHEN LEFT(Code, 1) = '6' THEN PrevCredit - PrevDebit ELSE PrevBalance END AS PrevBalance,
        CurrDebit,
        CurrCredit,
        CASE WHEN LEFT(Code, 1) = '6' THEN CurrCredit - CurrDebit ELSE CurrBalance END AS CurrBalance,
        CASE WHEN LEFT(Code, 1) = '6' THEN (PrevCredit - PrevDebit) + (CurrCredit - CurrDebit) ELSE TotalBalance END AS TotalBalance
        FROM (${tmp}) tmp
    WHERE LEFT(Code, 1) >= 6
  `;
    const finals = `
 ${final}
 union all
    SELECT
        '5' AS H1,
        'STOCKHOLDERS EQUITY' AS HT1,
        '5.50' AS H2,
        'RESULT OF OPERATION' AS HT2,
        '5.50.01' AS H3,
        'Net Income / (Loss)' AS HT3,
        SUM(PrevCredit) - SUM(PrevDebit),
        SUM(CurrDebit),
        SUM(CurrCredit),
        SUM(CurrCredit) - SUM(CurrDebit),
        (SUM(PrevCredit) - SUM(PrevDebit)) + (SUM(CurrCredit) - SUM(CurrDebit))
    FROM (${tmp2}) tmp2
   `;
    qry = `
    SELECT
      H1,
      HT1,
      H2,
      HT2,
      H3,
      HT3,
      format(ifnull(PrevBalance,0),0) as PrevBalance,
      format(ifnull(CurrDebit,0),0) as CurrDebit,
      format(ifnull(CurrCredit,0),0) as CurrCredit,
      format(ifnull(CurrBalance,0),0) as CurrBalance,
      format(ifnull(TotalBalance,0),0) as TotalBalance,
      CASE WHEN CAST(H1 AS UNSIGNED) < 4 THEN 'ASSETS' ELSE 'LIABILITIES' END AS H 
    FROM (${finals}) Final`;
  } else {
    const tmp = `
    select
    Code , 
    Title , 
    PrevDebit , 
    PrevCredit , 
    PrevBalance , 
    CurrDebit , 
    CurrCredit , 
    CurrBalance , 
    BalDebit , 
    BalCredit , 
    TotalBalance
    from (${FinancialStatement(
      req.body.date,
      req.body.sub_acct,
      req.body.dateFormat
    )}) tmp
  `;
    const tmp1 = `
    SELECT 
      tmp.Code, 
      tmp.Title, 
      LEFT(tmp.Code, 1) AS H1, 
      LEFT(tmp.Code, 4) AS H2, 
      IF(CAST(LEFT(tmp.Code, 1) AS SIGNED) >= 4, PrevCredit-PrevDebit, PrevBalance) AS PrevBalance, 
      CurrDebit, 
      CurrCredit, 
      IF(CAST(LEFT(tmp.Code, 1) AS SIGNED) >= 4, CurrCredit-CurrDebit, CurrBalance) AS CurrBalance, 
      IF(CAST(LEFT(tmp.Code, 1) AS SIGNED) >= 4, (PrevCredit-PrevDebit)+(CurrCredit-CurrDebit), TotalBalance) AS TotalBalance
      FROM (${tmp}) tmp
    WHERE LEFT(tmp.Code, 1) <= '5'`;
    const FinalTemp = `
    SELECT 
    LEFT(tmp1.Code, 1) AS H1, 
    tmp1.H2, 
    ca.Acct_Title AS HT2, 
    tmp1.Code AS H3, 
    tmp1.Title AS HT3, 
    PrevBalance, 
    CurrDebit, 
    CurrCredit, 
    CurrBalance, 
    TotalBalance
    FROM (${tmp1}) tmp1 LEFT JOIN chart_account  ca ON tmp1.H2 = ca.Acct_Code
    `;
    const Final = `
      SELECT 
        H1, 
        ca.Acct_Title AS HT1, 
        H2, 
        HT2, 
        H3, 
        HT3, 
        format(ifnull(PrevBalance,0),2) as PrevBalance,
        format(ifnull(CurrDebit,0),2) as CurrDebit,
        format(ifnull(CurrCredit,0),2) as CurrCredit,
        format(ifnull(CurrBalance,0),2) as CurrBalance,
        format(ifnull(TotalBalance,0),2) as TotalBalance
      FROM (${FinalTemp}) FinalTemp LEFT JOIN chart_account ca ON FinalTemp.H1 = ca.Acct_Code
      `;
    const tmp2 = `
      SELECT 
        PrevDebit, 
        PrevCredit, 
        IF(LEFT(tmp.Code, 1) = '6', PrevCredit-PrevDebit, PrevBalance) AS PrevBalance, 
        CurrDebit, 
        CurrCredit, 
        IF(LEFT(tmp.Code, 1) = '6', CurrCredit-CurrDebit, CurrBalance) AS CurrBalance, 
        IF(LEFT(Code, 1) = '6', (PrevCredit-PrevDebit)+(CurrCredit-CurrDebit), TotalBalance) AS TotalBalance
      FROM (${tmp}) tmp
      WHERE LEFT(tmp.Code, 1) >= '6'`;
    const Finals = `
      (${Final})
      union all
      SELECT 
        '5',
        'STOCKHOLDERS EQUITY',
        '5.50',
        'RESULT OF OPERATION', 
        '5.50.01', 
        'Net Income / (Loss)', 
        format(ifnull(SUM(PrevCredit) - SUM(PrevDebit),0),2),
        format(ifnull(SUM(CurrDebit),0),2),
        format(ifnull(SUM(CurrCredit),0),2),
        format(ifnull(SUM(CurrCredit) - SUM(CurrDebit) ,0)),
        format(ifnull((SUM(PrevCredit) - SUM(PrevDebit)) + (SUM(CurrCredit) - SUM(CurrDebit)) ,0))
      FROM (${tmp2}) tmp2`;
    qry = `
    SELECT  
      H1,
      HT1,
      H2,
      HT2,
      H3,
      HT3,
      format(ifnull(PrevBalance,0),0) as PrevBalance,
      format(ifnull(CurrDebit,0),0) as CurrDebit,
      format(ifnull(CurrCredit,0),0) as CurrCredit,
      format(ifnull(CurrBalance,0),0) as CurrBalance,
      format(ifnull(TotalBalance,0),0) as TotalBalance,
      CASE WHEN CAST(H1 AS UNSIGNED) < 4 THEN 'ASSETS' ELSE 'LIABILITIES' END AS H 
    FROM (${Finals}) Final`;
  }
  console.log(qry)

  const data: any = await prisma.$queryRawUnsafe(qry);
  const groupByCategory = (data: any, datakeyGroup: any) => {
    return data.reduce((acc: any, item: any) => {
      (acc[item[datakeyGroup]] = acc[item[datakeyGroup]] || []).push(item);
      return acc;
    }, {});
  };
  const Assets: any = [];
  const ASSETS = data.filter((itm: any) => itm.H === "ASSETS");
  const assetHT1 = groupByCategory(ASSETS, "HT1");
  const keyAsset = Object.keys(assetHT1);

  keyAsset.forEach((k2) => {
    Assets.push({
      N: k2,
      H1: "",
      HT1: k2,
      H2: "",
      H3: "",
      HT3: "",
      PrevBalance: "",
      CurrDebit: "",
      CurrCredit: "",
      CurrBalance: "",
      TotalBalance: "",
      H: "",
      HT2: "",
      h2: true,
    });
    const groupData3 = groupByCategory(assetHT1[k2], "HT2");
    const keys = Object.keys(groupData3);
    keys.forEach((k) => {
      Assets.push({
        N: k,
        H1: "",
        HT1: "",
        H2: "",
        H3: "",
        HT3: "",
        PrevBalance: "",
        CurrDebit: "",
        CurrCredit: "",
        CurrBalance: "",
        TotalBalance: "",
        H: "",
        HT2: k,
        h3: true,
      });
      groupData3[k].forEach((data: any) => {
        Assets.push({ ...data, N: data.HT3, h4: true });
      });
      Assets.push({
        borderTop: true,
        border: false,
        N: "",
        H1: "",
        HT1: "",
        H2: "",
        H3: "",
        HT3: "",
        PrevBalance: formatNumber(getTotal(groupData3[k], "PrevBalance")),
        CurrDebit: formatNumber(getTotal(groupData3[k], "CurrDebit")),
        CurrCredit: formatNumber(getTotal(groupData3[k], "CurrCredit")),
        CurrBalance: formatNumber(getTotal(groupData3[k], "CurrBalance")),
        TotalBalance: formatNumber(getTotal(groupData3[k], "TotalBalance")),
        H: "",
        HT2: k,
        h3: true,
      });
    });
    Assets.push({
      border: true,
      N: `TOTAL ${k2}`,
      H1: "",
      HT1: k2,
      H2: "",
      H3: "",
      HT3: "",
      PrevBalance: formatNumber(getTotal(assetHT1[k2], "PrevBalance")),
      CurrDebit: formatNumber(getTotal(assetHT1[k2], "CurrDebit")),
      CurrCredit: formatNumber(getTotal(assetHT1[k2], "CurrCredit")),
      CurrBalance: formatNumber(getTotal(assetHT1[k2], "CurrBalance")),
      TotalBalance: formatNumber(getTotal(assetHT1[k2], "TotalBalance")),
      H: "",
      HT2: "",
      h2: true,
    });
  });
  Assets.push({
    border: true,
    N: "TOTAL ASSETS",
    H1: "",
    HT1: "",
    H2: "",
    H3: "",
    HT3: "",
    PrevBalance: formatNumber(getTotal(ASSETS, "PrevBalance")),
    CurrDebit: formatNumber(getTotal(ASSETS, "CurrDebit")),
    CurrCredit: formatNumber(getTotal(ASSETS, "CurrCredit")),
    CurrBalance: formatNumber(getTotal(ASSETS, "CurrBalance")),
    TotalBalance: formatNumber(getTotal(ASSETS, "TotalBalance")),
    H: "ASSETS",
    HT2: "",
    h1: true,
  });
  Assets.unshift({
    N: "ASSETS",
    H1: "",
    HT1: "",
    H2: "",
    H3: "",
    HT3: "",
    PrevBalance: "",
    CurrDebit: "",
    CurrCredit: "",
    CurrBalance: "",
    TotalBalance: "",
    H: "ASSETS",
    HT2: "",
    h1: true,
  });
  const Liabilities: any = [];
  const LIABILITIES = data.filter((itm: any) => itm.H === "LIABILITIES");
  const liabilitiesHT1 = groupByCategory(LIABILITIES, "HT1");
  const keyLiabilities = Object.keys(liabilitiesHT1);
  keyLiabilities.forEach((k2) => {
    Liabilities.push({
      N: k2,
      H1: "",
      HT1: k2,
      H2: "",
      H3: "",
      HT3: "",
      PrevBalance: "",
      CurrDebit: "",
      CurrCredit: "",
      CurrBalance: "",
      TotalBalance: "",
      H: "",
      HT2: "",
      h2: true,
    });
    const groupData3 = groupByCategory(liabilitiesHT1[k2], "HT2");
    const keys = Object.keys(groupData3);
    keys.forEach((k) => {
      Liabilities.push({
        N: "",
        H1: "",
        HT1: "",
        H2: "",
        H3: "",
        HT3: "",
        PrevBalance: "",
        CurrDebit: "",
        CurrCredit: "",
        CurrBalance: "",
        TotalBalance: "",
        H: "",
        HT2: k,
        h3: true,
      });
      groupData3[k].forEach((data: any) => {
        Liabilities.push({ ...data, N: data.HT3, h4: true });
      });
      Liabilities.push({
        borderTop: true,
        border: false,
        N: `TOTAL ${k}`,
        H1: "",
        HT1: "",
        H2: "",
        H3: "",
        HT3: "",
        PrevBalance: formatNumber(getTotal(groupData3[k], "PrevBalance")),
        CurrDebit: formatNumber(getTotal(groupData3[k], "CurrDebit")),
        CurrCredit: formatNumber(getTotal(groupData3[k], "CurrCredit")),
        CurrBalance: formatNumber(getTotal(groupData3[k], "CurrBalance")),
        TotalBalance: formatNumber(getTotal(groupData3[k], "TotalBalance")),
        H: "",
        HT2: k,
        h3: true,
      });
    });

    Liabilities.push({
      border: true,
      N: `TOTAL ${k2}`,
      H1: "",
      HT1: k2,
      H2: "",
      H3: "",
      HT3: "",
      PrevBalance: formatNumber(getTotal(liabilitiesHT1[k2], "PrevBalance")),
      CurrDebit: formatNumber(getTotal(liabilitiesHT1[k2], "CurrDebit")),
      CurrCredit: formatNumber(getTotal(liabilitiesHT1[k2], "CurrCredit")),
      CurrBalance: formatNumber(getTotal(liabilitiesHT1[k2], "CurrBalance")),
      TotalBalance: formatNumber(getTotal(liabilitiesHT1[k2], "TotalBalance")),
      H: "",
      HT2: "",
      h2: true,
    });
  });

  Liabilities.push({
    border: true,
    N: "TOTAL LIABILITIES AND CAPITAL",
    H1: "",
    HT1: "",
    H2: "",
    H3: "",
    HT3: "",
    PrevBalance: formatNumber(getTotal(LIABILITIES, "PrevBalance")),
    CurrDebit: formatNumber(getTotal(LIABILITIES, "CurrDebit")),
    CurrCredit: formatNumber(getTotal(LIABILITIES, "CurrCredit")),
    CurrBalance: formatNumber(getTotal(LIABILITIES, "CurrBalance")),
    TotalBalance: formatNumber(getTotal(LIABILITIES, "TotalBalance")),
    H: "LIABILITIES",
    HT2: "",
    h1: true,
  });
  Liabilities.unshift({
    N: "LIABILITIES",
    H1: "",
    HT1: "",
    H2: "",
    H3: "",
    HT3: "",
    PrevBalance: "",
    CurrDebit: "",
    CurrCredit: "",
    CurrBalance: "",
    TotalBalance: "",
    H: "LIABILITIES",
    HT2: "",
    h1: true,
  });
  const report = Assets.concat(Liabilities);
  try {
    res.send({
      message: "Successfully ger report",
      success: true,
      report,
      data,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      success: false,
      report: [],
    });
  }
});

function formatNumber(number: number) {
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function getTotal(array: Array<any>, datakey: string) {
  return array.reduce((d: any, itms: any) => {
    let num = parseFloat(itms[datakey].toString()?.replace(/,/g, ""));
    if (isNaN(num)) {
      num = 0;
    }
    return d + Math.abs(num);
  }, 0);
}

BalanceSheetLong.post("/balance-sheet-long-report-desk", async (req, res) => {
  const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

  let qry = "";
  if (req.body.format === 0) {
    const tmp = `
    select 
        tmp.Code ,
        tmp.Title ,
        tmp.PrevDebit  ,
        tmp.PrevCredit  ,
        tmp.PrevBalance  ,
        tmp.CurrDebit  ,
        tmp.CurrCredit  ,
        tmp.CurrBalance  ,
        tmp.BalDebit  ,
        tmp.BalCredit  ,
        tmp.TotalBalance  
    from (${FinancialStatement(
      req.body.date,
      req.body.sub_acct,
      req.body.dateFormat
    )}) tmp
  `;
    const tmp1 = `
    SELECT
        Code,
        Title,
        LEFT(Code, 1) AS H1,
        LEFT(Code, 4) AS H2,
        CASE WHEN CAST(LEFT(Code, 1) AS UNSIGNED) >= 4 THEN PrevCredit - PrevDebit ELSE PrevBalance END AS PrevBalance,
        CurrDebit,
        CurrCredit,
        CASE WHEN CAST(LEFT(Code, 1) AS UNSIGNED) >= 4 THEN CurrCredit - CurrDebit ELSE CurrBalance END AS CurrBalance,
        CASE WHEN CAST(LEFT(Code, 1) AS UNSIGNED) >= 4 THEN (PrevCredit - PrevDebit) + (CurrCredit - CurrDebit) ELSE TotalBalance END AS TotalBalance
    FROM (${tmp}) tmp
    WHERE LEFT(Code, 1) <= 5
  `;
    const finalTemp = `
    SELECT
        LEFT(tmp1.Code, 1) AS H1,
        tmp1.H2,
        Chart_Account.Acct_Title AS HT2,
        tmp1.Code AS H3,
        tmp1.Title AS HT3,
        PrevBalance,
        CurrDebit,
        CurrCredit,
        CurrBalance,
        TotalBalance
    FROM (${tmp1}) tmp1
    LEFT JOIN Chart_Account ON tmp1.H2 = Chart_Account.Acct_Code
  `;
    let final = `
    SELECT
        H1,
        Chart_Account.Acct_Title AS HT1,
        H2,
        HT2,
        H3,
        HT3,
        PrevBalance,
        CurrDebit,
        CurrCredit,
        CurrBalance,
        TotalBalance
    FROM (${finalTemp}) FinalTemp
    LEFT JOIN Chart_Account ON FinalTemp.H1 = Chart_Account.Acct_Code
  `;
    const tmp2 = `
    SELECT
        PrevDebit,
        PrevCredit,
        CASE WHEN LEFT(Code, 1) = '6' THEN PrevCredit - PrevDebit ELSE PrevBalance END AS PrevBalance,
        CurrDebit,
        CurrCredit,
        CASE WHEN LEFT(Code, 1) = '6' THEN CurrCredit - CurrDebit ELSE CurrBalance END AS CurrBalance,
        CASE WHEN LEFT(Code, 1) = '6' THEN (PrevCredit - PrevDebit) + (CurrCredit - CurrDebit) ELSE TotalBalance END AS TotalBalance
        FROM (${tmp}) tmp
    WHERE LEFT(Code, 1) >= 6
  `;
    const finals = `
 ${final}
 union all
    SELECT
        '5' AS H1,
        'STOCKHOLDERS EQUITY' AS HT1,
        '5.50' AS H2,
        'RESULT OF OPERATION' AS HT2,
        '5.50.01' AS H3,
        'Net Income / (Loss)' AS HT3,
        SUM(PrevCredit) - SUM(PrevDebit),
        SUM(CurrDebit),
        SUM(CurrCredit),
        SUM(CurrCredit) - SUM(CurrDebit),
        (SUM(PrevCredit) - SUM(PrevDebit)) + (SUM(CurrCredit) - SUM(CurrDebit))
    FROM (${tmp2}) tmp2
   `;
    qry = `
    SELECT
      H1,
      HT1,
      H2,
      HT2,
      H3,
      HT3,
      format(ifnull(PrevBalance,0),0) as PrevBalance,
      format(ifnull(CurrDebit,0),0) as CurrDebit,
      format(ifnull(CurrCredit,0),0) as CurrCredit,
      format(ifnull(CurrBalance,0),0) as CurrBalance,
      format(ifnull(TotalBalance,0),0) as TotalBalance,
      CASE WHEN CAST(H1 AS UNSIGNED) < 4 THEN 'ASSETS' ELSE 'LIABILITIES' END AS H 
    FROM (${finals}) Final`;
  } else {
    const tmp = `
    select
    Code , 
    Title , 
    PrevDebit , 
    PrevCredit , 
    PrevBalance , 
    CurrDebit , 
    CurrCredit , 
    CurrBalance , 
    BalDebit , 
    BalCredit , 
    TotalBalance
    from (${FinancialStatement(
      req.body.date,
      req.body.sub_acct,
      req.body.dateFormat
    )}) tmp
  `;
    const tmp1 = `
    SELECT 
      tmp.Code, 
      tmp.Title, 
      LEFT(tmp.Code, 1) AS H1, 
      LEFT(tmp.Code, 4) AS H2, 
      IF(CAST(LEFT(tmp.Code, 1) AS SIGNED) >= 4, PrevCredit-PrevDebit, PrevBalance) AS PrevBalance, 
      CurrDebit, 
      CurrCredit, 
      IF(CAST(LEFT(tmp.Code, 1) AS SIGNED) >= 4, CurrCredit-CurrDebit, CurrBalance) AS CurrBalance, 
      IF(CAST(LEFT(tmp.Code, 1) AS SIGNED) >= 4, (PrevCredit-PrevDebit)+(CurrCredit-CurrDebit), TotalBalance) AS TotalBalance
      FROM (${tmp}) tmp
    WHERE LEFT(tmp.Code, 1) <= '5'`;
    const FinalTemp = `
    SELECT 
    LEFT(tmp1.Code, 1) AS H1, 
    tmp1.H2, 
    ca.Acct_Title AS HT2, 
    tmp1.Code AS H3, 
    tmp1.Title AS HT3, 
    PrevBalance, 
    CurrDebit, 
    CurrCredit, 
    CurrBalance, 
    TotalBalance
    FROM (${tmp1}) tmp1 LEFT JOIN chart_account  ca ON tmp1.H2 = ca.Acct_Code
    `;
    const Final = `
      SELECT 
        H1, 
        ca.Acct_Title AS HT1, 
        H2, 
        HT2, 
        H3, 
        HT3, 
        format(ifnull(PrevBalance,0),2) as PrevBalance,
        format(ifnull(CurrDebit,0),2) as CurrDebit,
        format(ifnull(CurrCredit,0),2) as CurrCredit,
        format(ifnull(CurrBalance,0),2) as CurrBalance,
        format(ifnull(TotalBalance,0),2) as TotalBalance
      FROM (${FinalTemp}) FinalTemp LEFT JOIN chart_account ca ON FinalTemp.H1 = ca.Acct_Code
      `;
    const tmp2 = `
      SELECT 
        PrevDebit, 
        PrevCredit, 
        IF(LEFT(tmp.Code, 1) = '6', PrevCredit-PrevDebit, PrevBalance) AS PrevBalance, 
        CurrDebit, 
        CurrCredit, 
        IF(LEFT(tmp.Code, 1) = '6', CurrCredit-CurrDebit, CurrBalance) AS CurrBalance, 
        IF(LEFT(Code, 1) = '6', (PrevCredit-PrevDebit)+(CurrCredit-CurrDebit), TotalBalance) AS TotalBalance
      FROM (${tmp}) tmp
      WHERE LEFT(tmp.Code, 1) >= '6'`;
    const Finals = `
      (${Final})
      union all
      SELECT 
        '5',
        'STOCKHOLDERS EQUITY',
        '5.50',
        'RESULT OF OPERATION', 
        '5.50.01', 
        'Net Income / (Loss)', 
        format(ifnull(SUM(PrevCredit) - SUM(PrevDebit),0),2),
        format(ifnull(SUM(CurrDebit),0),2),
        format(ifnull(SUM(CurrCredit),0),2),
        format(ifnull(SUM(CurrCredit) - SUM(CurrDebit) ,0)),
        format(ifnull((SUM(PrevCredit) - SUM(PrevDebit)) + (SUM(CurrCredit) - SUM(CurrDebit)) ,0))
      FROM (${tmp2}) tmp2`;
    qry = `
    SELECT  
      H1,
      HT1,
      H2,
      HT2,
      H3,
      HT3,
      format(ifnull(PrevBalance,0),0) as PrevBalance,
      format(ifnull(CurrDebit,0),0) as CurrDebit,
      format(ifnull(CurrCredit,0),0) as CurrCredit,
      format(ifnull(CurrBalance,0),0) as CurrBalance,
      format(ifnull(TotalBalance,0),0) as TotalBalance,
      CASE WHEN CAST(H1 AS UNSIGNED) < 4 THEN 'ASSETS' ELSE 'LIABILITIES' END AS H 
    FROM (${Finals}) Final`;
  }

  const data: any = await prisma.$queryRawUnsafe(qry);

  try {
    res.send({
      message: "Successfully ger report",
      success: true,
      data,
    });
  } catch (err: any) {
    console.log(err.message);
    res.send({
      message: err.message,
      success: false,
      report: [],
    });
  }
});



export default BalanceSheetLong;
