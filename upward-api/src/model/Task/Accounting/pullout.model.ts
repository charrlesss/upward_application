import { Request } from "express";
import { prisma } from "../../../controller/index";


export async function loadRCPNApproved(req: Request) {
  const qry = `
      Select Distinct B.RCPNo 
        From pdc A 
        Inner join ( Select A.RCPNo, A.PNNo, b.CheckNo, a.Status 
                    From pullout_request A 
                  INNER JOIN pullout_request_details B ON A.RCPNo = B.RCPNo ) B ON A.PNo = B.PNNo AND A.Check_No = B.CheckNo 
        WHERE PDC_Status = 'Stored' and b.Status = 'APPROVED' 
        Order by B.RCPNo
    `;
  return await prisma.$queryRawUnsafe(qry);
}

export async function loadRCPNApprovedList(req: Request, RCPN: string) {
  let whr = "";
  if (RCPN !== "") {
    whr = ` and b.RCPNo = '${RCPN}' `;
  }
  const qry = `
       Select B.RCPNo, b.PNNo, a.Name, count(b.CheckNo) NoOfChecks, b.Reason
        From pdc A 
        Inner join ( Select A.RCPNo, A.PNNo, b.CheckNo, a.Status, a.Reason 
        			    From pullout_request A 
        			    INNER JOIN pullout_request_details B  ON A.RCPNo = B.RCPNo ) B ON A.PNo = B.PNNo AND A.Check_No = B.CheckNo 
        WHERE PDC_Status = 'Stored' and b.Status = 'APPROVED' ${whr}
        Group by B.RCPNo, b.PNNo, a.Name, b.Reason 
        Order by B.RCPNo
    `;

  return await prisma.$queryRawUnsafe(qry);
}
export async function deletePulloutRequest(req: Request, RCPNo: string) {
  return await prisma.$queryRawUnsafe(`
    Delete from pullout_request where RCPNo = '${RCPNo}'
;`);
}

export async function deletePulloutRequestDetails(req: Request, RCPNo: string) {
  return await prisma.$queryRawUnsafe(`
    Delete from pullout_request_details where RCPNo = '${RCPNo}'
;`);
}
export async function deletePulloutRequestAutoCodes(
  req: Request,
  RCPNo: string
) {
  return await prisma.$queryRawUnsafe(`
    delete from pullout_auth_codes where RCPN = '${RCPNo}'
;`);
}

export async function insertApprovalCode(data: any, req: Request) {
  return await prisma.pullout_auth_codes.create({ data });
}

export async function updateAnyId(type: string, req: Request) {
  return await prisma.$queryRawUnsafe(`
    UPDATE  id_sequence a
      INNER JOIN
    (SELECT 
      *
    FROM
        id_sequence bb
    WHERE
      bb.type = '${type}'
    LIMIT 1) AS b ON a.type = b.type 
    SET 
    a.last_count = LPAD(SUBSTRING((b.last_count), - 4) + 1,
          4,
          '0')
    WHERE
    a.type = '${type}'
  `);
}
export async function createPulloutRequest(data: any, req: Request) {
  return await prisma.pullout_request.create({ data });
}

export async function createPulloutRequestDetails(data: any, req: Request) {
  return await prisma.pullout_request_details.create({ data });
}

export async function updateApprovalCode(
  RCPN: string,
  Approved_Code: string,
  used_by: string,
  req: Request
) {
  return await prisma.$queryRawUnsafe(`
  update 
      pullout_auth_codes a set a.used_by='${used_by}', a.used_datetime=NOW()
  WHERE
    a.RCPN = '${RCPN}'
        AND a.Approved_Code = '${Approved_Code}'`);
}

export async function loadRequestNumber(req: Request) {
  return await prisma.$queryRawUnsafe(
    `sElect '' as RCPNo union all  Select RCPNo from PullOut_Request where Status = 'PENDING' and Branch = 'HO' `
  );
}
export async function loadDetails(req: Request, RCPNo: string) {
  return await prisma.$queryRawUnsafe(`
     Select 
        CAST((ROW_NUMBER() OVER ()) AS CHAR) as row_count ,
        a.RCPNo,
        a.PNNo,
        c.Name ,
        a.Reason,
        b.CheckNo,
        date_format(c.Check_Date, '%Y-%m-%d') as Check_Date,
        c.Bank,
        b.CheckNo,
        c.Check_Amnt 
      From PullOut_Request a 
      Inner join PullOut_Request_Details b on a.RCPNo = b.RCPNo 
      Inner join PDC c on b.CheckNo = c.Check_No and a.PNNo = c.PNo 
      Where a.RCPNo =  '${RCPNo}'
    `);
}

export async function checkApprovedCode(req: Request, code: string) {
  return await prisma.$queryRawUnsafe(
    `selecT * from Pullout_auth_codes where Approved_Code = '${code}' and used_by is null`
  );
}

export async function checkApprovedCodeIsUsed(req: Request, RCPN: string) {
  return await prisma.$queryRawUnsafe(
    `selecT * from Pullout_auth_codes where RCPN = '${RCPN}' and used_by is not null`
  );
}

export async function updateCode(req: Request, username: string, code: string) {
  return await prisma.$queryRawUnsafe(
    `update pullout_Auth_codes set used_by ='${username}', used_datetime = now() where Approved_Code = '${code}' `
  );
}
export async function approved(req: Request, username: string, RCPN: string) {
  const str = `Update PullOut_Request set Status = 'APPROVED', Approved_By = '${username}', Approved_Date = now() WHERE RCPNo = '${RCPN}' `;

  return await prisma.$queryRawUnsafe(str);
}

// sender = upwardumis2020@gmail.com , pass = vapw ridu eorg
// upwardinsurance.grace@gmail.com
// lva_ancar@yahoo.com
