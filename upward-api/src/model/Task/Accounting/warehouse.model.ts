import { format } from "date-fns";
import { PrismaList } from "../../connection";
import { Request } from "express";
import { prisma } from "../../../controller/index";

export async function getWarehouseSearch(query: string, req: Request) {
  return await prisma.$queryRawUnsafe(query);
}

export async function warehouseSelectedSearch(
  policy: string,
  pdcStatus: string,
  req: Request
) {
  let strWhere = "";
  const pdcStatusList = ["Received", "Stored", "Stored"];

  if (parseInt(pdcStatus) !== 2) {
    const query = `
    SELECT 
      PDC_ID,
      PNo,
      IDNo,
      date_format(Date,'%m-%d-%Y') as dateRecieved,
      Name,
      date_format(Check_Date,'%m-%d-%Y') as Check_Date,
      Check_No,
      Check_Amnt,
      Bank,
      PDC_Status,
      CAST(ROW_NUMBER() OVER () AS CHAR) AS temp_id
    FROM
        pdc a
    WHERE
        a.PNo = ? AND
        a.PDC_Status = ?
        ORDER BY a.Check_Date
        `;
    return await prisma.$queryRawUnsafe(
      query,
      policy,
      pdcStatusList[parseInt(pdcStatus)]
    );
  } else {
    const query = `
    SELECT 
      PDC_ID,
      PNo,
      IDNo,
      date_format(Date,'%m-%d-%Y') as dateRecieved,
      Name,
      date_format(Check_Date,'%m-%d-%Y') as Check_Date,
      Check_No,
      Check_Amnt,
      Bank,
      PDC_Status,
      CAST(ROW_NUMBER() OVER () AS CHAR) AS temp_id
    FROM
        pdc a
    WHERE
        a.PNo = ? AND
        (a.PDC_Status = ? OR (a.PDC_Status = 'Pulled Out' AND (a.PDC_Remarks = 'Fully Paid' OR a.PDC_Remarks = 'Replaced' )))
        ORDER BY a.Check_Date
        `;
    return await prisma.$queryRawUnsafe(
      query,
      policy,
      pdcStatusList[parseInt(pdcStatus)]
    );
  }
}

export async function pullout(
  PNNo: string,
  CheckNo: string,
  req: Request
): Promise<Array<any>> {
  const query = `
  SELECT 
    *
  FROM
      pullout_request POR
        LEFT JOIN
      pullout_request_details PORD ON POR.RCPNo = PORD.RCPNo
  WHERE
    PNNo = ? AND CheckNo = ?
        AND Status = 'APPROVED'
  `;
  console.log(query);
  return await prisma.$queryRawUnsafe(query, PNNo, CheckNo);
}

export async function getApprovedPulloutWarehouse(RCPNo: string, req: Request) {
  const query = `
  SELECT DISTINCT
      B.RCPNo as label
  FROM
        pdc A
          INNER JOIN
      (SELECT 
          A.RCPNo, A.PNNo, B.CheckNo, a.Status
      FROM
            pullout_request A
      left JOIN   pullout_request_details B ON A.RCPNo = B.RCPNo) B ON A.PNo = B.PNNo
          AND A.Check_No = B.CheckNo
  WHERE
      PDC_Status = 'Stored'
      AND B.Status = 'APPROVED'
      OR B.RCPNo LIKE ?
  ORDER BY B.RCPNo
  `;
  return await prisma.$queryRawUnsafe(query, `%${RCPNo}%`);
}
export async function getApprovedPulloutWarehouseCheckList(
  RCPNo: string,
  req: Request
) {
  const query = `
  SELECT 
  B.RCPNo,
  B.PNNo,
  A.Name,
  convert(COUNT(B.CheckNo),CHAR) NoOfChecks,
  B.Reason
FROM
  pdc A
    INNER JOIN
(SELECT 
    A.RCPNo, A.PNNo, B.CheckNo, A.Status, A.Reason
FROM
      pullout_request A
INNER JOIN  pullout_request_details B ON A.RCPNo = B.RCPNo) B ON A.PNo = B.PNNo
    AND A.Check_No = B.CheckNo
WHERE
    PDC_Status = 'Stored'
    AND B.Status = 'APPROVED' 
    AND B.RCPNo like ?
GROUP BY B.RCPNo , B.PNNo , A.Name , B.Reason
ORDER BY B.RCPNo
  `;
  return await prisma.$queryRawUnsafe(query, `%${RCPNo}%`);
}
export async function getApprovedPulloutWarehouseCheckListSelected(
  RCPNo: string,
  req: Request
) {
  const query = `
    select 
      a.PNNo as PNo,
      c.IDNo,
      date_format(c.Date,'%m/%d/%Y')  as dateRecieved,
      c.Name,
      date_format(c.Check_Date,'%m/%d/%Y') as Check_Date,
      c.Check_No,
      c.Check_Amnt,
      d.Bank,
      a.Status as PDC_Status,
      c.PDC_ID 
    From  pullout_request a 
    inner join  pullout_request_details b on a.RCPNo = b.RCPNo
    inner join pdc c on b.CheckNo = c.Check_No 
    left join   bank d on c.Bank = d.Bank_Code
    where a.Status = 'APPROVED' and 
    a.RCPNo = ?
  `;
  return await prisma.$queryRawUnsafe(query, RCPNo);
}

export async function updatePDCChecks(
  pdcStatus: string,
  remarks: string,
  PDC_ID: string,
  req: Request
) {
  function convertDate(date: any) {
    return format(date, "yyyy-MM-dd");
  }

  const status = ["Stored", "Endorsed", "Pulled Out"];
  const field = ["Date_Stored", "Date_Endorsed", "Date_Pulled_Out"];

  if (pdcStatus === "2") {
    const query = `
    UPDATE   pdc 
    SET PDC_Status = '${status[parseInt(pdcStatus)]}', 
    ${field[parseInt(pdcStatus)]} = str_to_date('${convertDate(
      new Date()
    )}','%Y-%m-%d %H:%i:%s.%f'),
    PDC_Remarks = ? 
    WHERE PDC_ID = ?
  
  `;
    return await prisma.$queryRawUnsafe(query, remarks, PDC_ID);
  }

  const query = `UPDATE   pdc SET PDC_Status = '${
    status[parseInt(pdcStatus)]
  }', ${field[parseInt(pdcStatus)]} = str_to_date('${convertDate(
    new Date()
  )}','%Y-%m-%d %H:%i:%s.%f')

    WHERE PDC_ID = ?
`;

  return await prisma.$queryRawUnsafe(query, PDC_ID);
}

export async function getApprovedRCPNo(req: Request) {
  const query = `
  select '' as RCPNo
  union all
  select * from (
  SELECT DISTINCT
      B.RCPNo
  FROM
      pdc A
          INNER JOIN
      (SELECT 
          A.RCPNo, A.PNNo, B.CheckNo, A.Status
      FROM
          pullout_request A
      INNER JOIN pullout_request_details B ON A.RCPNo = B.RCPNo) B ON A.PNo = B.PNNo
          AND A.Check_No = B.CheckNo
  WHERE
      PDC_Status = 'Stored'
          AND B.Status = 'APPROVED'
  ORDER BY B.RCPNo
  ) a
`;

  return await prisma.$queryRawUnsafe(query);
}

export async function loadList(req: Request, RCPNo: string) {
  if (RCPNo !== "") {
    const query = `
    SELECT 
        B.RCPNo,
        B.PNNo,
        A.Name,
        CAST(COUNT(B.CheckNo)  as char) as NoOfChecks,
        B.Reason
    FROM
        pdc A
            INNER JOIN
        (SELECT 
            A.RCPNo, A.PNNo, B.CheckNo, A.Status, A.Reason
        FROM
            pullout_request A
        INNER JOIN pullout_request_details B ON A.RCPNo = B.RCPNo) B ON A.PNo = B.PNNo
            AND A.Check_No = B.CheckNo
    WHERE
        PDC_Status = 'Stored'
            AND B.Status = 'APPROVED'
            and B.RCPNo = ? 
    GROUP BY B.RCPNo , B.PNNo , A.Name , B.Reason
    ORDER BY B.RCPNo`;
    return await prisma.$queryRawUnsafe(query, RCPNo);
  }
  const query = `
    SELECT 
        B.RCPNo,
        B.PNNo,
        A.Name,
        CAST(COUNT(B.CheckNo)  as char) as NoOfChecks,
        B.Reason
    FROM
        pdc A
            INNER JOIN
        (SELECT 
            A.RCPNo, A.PNNo, B.CheckNo, A.Status, A.Reason
        FROM
            pullout_request A
        INNER JOIN pullout_request_details B ON A.RCPNo = B.RCPNo) B ON A.PNo = B.PNNo
            AND A.Check_No = B.CheckNo
    WHERE
        PDC_Status = 'Stored'
            AND B.Status = 'APPROVED'
    GROUP BY B.RCPNo , B.PNNo , A.Name , B.Reason
    ORDER BY B.RCPNo`;
  return await prisma.$queryRawUnsafe(query);
}
