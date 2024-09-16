import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  subDays,
  lastDayOfMonth,
} from "date-fns";
import { clients_view, qryJournal } from "./views";
export function FinancialStatement(
  date: any,
  sub_acct: string,
  dateFormat: string
) {
  const dateFrom = new Date(date);

  let currText = "";
  let prevText = "";
  let DateFrom = "";
  let DateTo = "";

  const SubAcctParam = sub_acct.toUpperCase();
  if (dateFormat === "Daily") {
    DateFrom = format(dateFrom, "yyyy-MM-dd");
    DateTo = format(dateFrom, "yyyy-MM-dd");
  } else {
    DateFrom = format(dateFrom, "yyyy-MM");
    DateTo = format(new Date(dateFrom), `yyyy-MM`);
    DateFrom = `${DateFrom}-01`;
    const lastDay = lastDayOfMonth(dateFrom);
    DateTo = `${DateTo}-${format(lastDay, "dd")}`;
  }

  if (SubAcctParam === "ALL") {
    prevText = `
        SELECT
          GL_Acct as GL_Acct,
          SUM(IFNULL(Debit, 0)) as Debit,
          SUM(IFNULL(Credit, 0)) as Credit,
          SUM(IFNULL(Debit, 0)) - SUM(IFNULL(Credit, 0)) as Balance
        FROM Journal
        WHERE Source_Type NOT IN ('AB', 'BF', 'BFS', 'BFD')
        AND Date_Entry <= '${DateFrom}'
        GROUP BY GL_Acct`;
  } else {
    prevText = `
        SELECT
          GL_Acct as GL_Acct,
          SUM(IFNULL(Debit, 0)) as Debit,
          SUM(IFNULL(Credit, 0)) as Credit,
          SUM(IFNULL(Debit, 0)) - SUM(IFNULL(Credit, 0)) as Balance
        FROM Journal
        WHERE Source_Type NOT IN ('AB', 'BF', 'BFS', 'BFD')
        AND Sub_Acct = SubAcctParam
        AND Date_Entry <= '${DateFrom}'
        GROUP BY GL_Acct`;
  }
  if (SubAcctParam === "ALL") {
    currText = `
          SELECT
            GL_Acct as GL_Acct,
            SUM(IFNULL(Debit, 0)) as Debit,
            SUM(IFNULL(Credit, 0)) as Credit,
            SUM(IFNULL(Debit, 0)) - SUM(IFNULL(Credit, 0)) as Balance
          FROM Journal
          WHERE Source_Type NOT IN ('AB', 'BF', 'BFS', 'BFD')
          AND Date_Entry >= '${DateFrom}' AND Date_Entry <= '${DateTo}'
          GROUP BY GL_Acct`;
  } else {
    currText = `
            SELECT
          GL_Acct,
          SUM(IFNULL(Debit, 0)) as Debit,
          SUM(IFNULL(Credit, 0)) as Credit,
          SUM(IFNULL(Debit, 0)) - SUM(IFNULL(Credit, 0)) as Balance
            FROM Journal
            WHERE Source_Type NOT IN ('AB', 'BF', 'BFS', 'BFD')
            AND Sub_Acct = SubAcctParam
            AND Date_Entry >= '${DateFrom}' AND Date_Entry <= '${DateTo}'
            GROUP BY GL_Acct`;
  }
  return `
       SELECT
          Acct_Code AS Code,
          Acct_Title AS Title,
          IFNULL(Prev.Debit, 0) AS PrevDebit,
          IFNULL(Prev.Credit, 0)  AS PrevCredit,
          IFNULL(Prev.Balance, 0)  AS PrevBalance,
          IFNULL(Curr.Debit, 0)    AS CurrDebit,
          IFNULL(Curr.Credit, 0)  AS CurrCredit,
          IFNULL(Curr.Balance, 0)  AS CurrBalance,
          IFNULL(Prev.Debit, 0) + IFNULL(Curr.Debit, 0)  AS BalDebit,
          IFNULL(Prev.Credit, 0) + IFNULL(Curr.Credit, 0)  AS BalCredit,
          IFNULL(Prev.Balance, 0) + IFNULL(Curr.Balance, 0)  AS TotalBalance
      FROM
          chart_account
          LEFT JOIN (${currText}) Curr ON chart_account.Acct_Code = Curr.GL_Acct
          LEFT JOIN (${prevText}) Prev ON chart_account.Acct_Code = Prev.GL_Acct
      WHERE IFNULL(Prev.Balance, 0) <>  0 OR IFNULL(Curr.Balance, 0) <>  0
      ORDER BY chart_account.Acct_Code
    `;
}
export function FinancialStatementSumm(date: any, dateFormat: string) {
  const dateFrom = new Date(date);
  let DateFrom = "";
  let DateTo = "";

  if (dateFormat === "Daily") {
    DateFrom = format(dateFrom, "yyyy-MM-dd");
    DateTo = format(dateFrom, "yyyy-MM-dd");
  } else {
    DateFrom = format(dateFrom, "yyyy-MM-dd");
    DateTo = format(addMonths(dateFrom, 1), "yyyy-MM-dd");
  }

  const prev = `
    SELECT  
        MAX(Sub_Acct) as Sub_Acct,  
        GL_Acct, 
        SUM(IFNULL(Debit, 0)) as Debit, 
        SUM(IFNULL(Credit, 0)) as Credit, 
        SUM(IFNULL(Debit, 0)) - SUM(IFNULL(Credit, 0)) as Balance
        FROM Journal
        AND str_to_date(Date_Entry,'%Y-%m-%d') < '${DateFrom}'
        GROUP BY GL_Acct
        `;
  const curr = `
        SELECT 
        MAX(Sub_Acct) as Sub_Acct,  
        GL_Acct, 
        SUM(IFNULL(Debit, 0)) as Debit, 
        SUM(IFNULL(Credit, 0)) as Credit, 
        SUM(IFNULL(Debit, 0)) - SUM(IFNULL(Credit, 0)) as Balance
        FROM Journal
        WHERE Source_Type NOT IN ('AB', 'BF', 'BFS', 'BFD')
        AND str_to_date(Date_Entry,'%Y-%m-%d') >= '${DateFrom}' AND str_to_date(Date_Entry,'%Y-%m-%d') <= '${DateTo}'
        GROUP BY GL_Acct
        `;
  const union_temp = `
        SELECT * FROM (${prev}) Prev
        UNION ALL
        SELECT * FROM (${curr}) Curr
        `;
  const total = `
        SELECT GL_Acct, SUM(Debit) - SUM(Credit) AS Balance
        FROM (${union_temp}) union_temp
        GROUP BY GL_Acct
        `;
  return `
        SELECT SubAccount.Acronym AS SACode,
        SubAccount.ShortName AS SubAccount,
        Chart_Account.Acct_Code AS Code,
        CONCAT(Chart_Account.Acct_Code, ' ', Acct_Title) AS Title,
        SUM(Debit) - SUM(Credit) AS Balance,
        total.Balance AS TotalBalance
        FROM Chart_Account
        LEFT JOIN (${union_temp}) union_temp ON Chart_Account.Acct_Code = union_temp.GL_Acct
        LEFT JOIN Sub_Account SubAccount ON union_temp.Sub_Acct = SubAccount.Acronym
        LEFT JOIN (${total}) total ON union_temp.GL_Acct = total.GL_Acct
        GROUP BY union_temp.GL_Acct, SubAccount.Sub_Acct, SubAccount.ShortName, Chart_Account.Acct_Code, Acct_Title, total.Balance
        HAVING SUM(Debit) - SUM(Credit) IS NOT NULL
        ORDER BY Chart_Account.Acct_Code`;
}
export function client_ids(search: string) {
  const selectClient = `
        SELECT 
        "Client" as IDType,
        aa.entry_client_id AS IDNo,
        aa.sub_account,
        if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
        aa.entry_client_id as client_id  
        FROM
          entry_client aa
        union all
        SELECT 
        "Agent" as IDType,
        aa.entry_agent_id AS IDNo,
        aa.sub_account,
        CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
        aa.entry_agent_id as client_id  
        FROM
          entry_agent aa
        union all
        SELECT 
        "Employee" as IDType,
        aa.entry_employee_id AS IDNo,
        aa.sub_account,
        CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
        aa.entry_employee_id as client_id
        FROM
          entry_employee aa
        union all
        SELECT 
        "Supplier" as IDType,
        aa.entry_supplier_id AS IDNo,
        aa.sub_account,
        if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
        aa.entry_supplier_id as client_id
        FROM
          entry_supplier aa
        union all
        SELECT 
        "Fixed Assets" as IDType,
        aa.entry_fixed_assets_id AS IDNo,
        aa.sub_account,
        aa.fullname AS Shortname,
        aa.entry_fixed_assets_id as client_id
        FROM
          entry_fixed_assets aa
        union all
        SELECT 
        "Others" as IDType,
        aa.entry_others_id AS IDNo,
        aa.sub_account,
        aa.description AS Shortname,
        aa.entry_others_id as client_id
        FROM
          entry_others aa
        `;
  return `
  SELECT 
    *
FROM
    (
      SELECT 
      *
  FROM
      (${selectClient}) a
  WHERE
      a.IDNo NOT IN 
      (SELECT IDNo FROM   policy GROUP BY IDNo) 
  UNION ALL SELECT 
          'Policy' AS IDType,
          a.PolicyNo AS IDNo,
          b.sub_account,
          b.Shortname,
          a.IDNo AS client_id
  FROM
        policy a
  LEFT JOIN (${selectClient}) b ON a.IDNo = b.IDNo
  WHERE
      a.PolicyNo NOT IN 
      (SELECT a.IDNo FROM (${selectClient}) a)
  ) a
WHERE
  a.IDNo LIKE '%${search}%'
	OR a.Shortname LIKE '%${search}%'
ORDER BY a.Shortname
LIMIT 50
        `;
}
export function createTPLID() {
  return `
        select
        concat(
          'TP-',
          right('000000',6 - LENGTH(CAST(CAST(substring(IF(
            a.PolicyNo = '' OR a.PolicyNo IS NULL,'1',a.PolicyNo), 4) as SIGNED) + 1 As SIGNED))),
            IF(
              a.PolicyNo = '' OR a.PolicyNo IS NULL,
              '1',
              CAST(substring(a.PolicyNo,4) as SIGNED) +1
            )
          ) AS tempPolicy_No
          from (
            SELECT  MAX(PolicyNo) as PolicyNo FROM  vpolicy a where left(a.PolicyNo ,2) = 'TP' and a.PolicyType = 'COM' ORDER BY a.PolicyNo ASC
          ) a
          `;
}
export function id_entry(WhereIDEntry: string) {
  return `
          select * from (SELECT 
            CONCAT(aa.firstname, ', ', aa.lastname) AS ShortName,
            aa.entry_client_id AS IDNo,
            aa.firstname,
            aa.middlename,
            aa.company,
            aa.address,
            aa.option AS options,
            aa.sub_account,
            aa.createdAt,
            aa.update AS updatedAt,
            aa.client_contact_details_id AS contact_details_id,
            NULL AS description,
            NULL AS remarks,
            NULL AS VAT_Type,
            NULL AS tin_no
            FROM
              entry_client aa 
            UNION ALL SELECT 
            CONCAT(aa.firstname, ', ', aa.lastname) AS ShortName,
            aa.entry_agent_id AS IDNo,
            aa.firstname,
            aa.middlename,
            NULL AS company,
            aa.address,0
            NULL AS options,
            NULL AS sub_account,
            aa.createdAt,
            aa.update AS updatedAt,
            aa.agent_contact_details_id AS contact_details_id,
            WHERE Source_Type NOT IN ('AB', 'BF', 'BFS', 'BFD')
            NULL AS description,
            NULL AS remarks,
            NULL AS VAT_Type,
            NULL AS tin_no
            FROM
          entry_agent aa 
    UNION ALL SELECT 
        CONCAT(aa.firstname, ', ', aa.lastname) AS ShortName,
        aa.entry_employee_id AS IDNo,
        aa.firstname,
        aa.middlename,
        NULL AS company,
        aa.address,
        NULL AS options,
        aa.sub_account,
        aa.createdAt,
        aa.update AS updatedAt,
        NULL AS contact_details_id,
        NULL AS description,
        NULL AS remarks,
        NULL AS VAT_Type,
        NULL AS tin_no
    FROM
          entry_employee aa 
    UNION ALL SELECT 
        aa.fullname AS ShortName,
        aa.entry_fixed_assets_id AS IDNo,
        NULL AS firstname,
        NULL AS middlename,
        NULL AS company,
        NULL AS address,
        NULL AS options,
        NULL AS sub_account,
        aa.createdAt,
        aa.update AS updatedAt,
        NULL AS contact_details_id,
        aa.description,
        aa.remarks,
        NULL AS VAT_Type,
        NULL AS tin_no
    FROM
          entry_fixed_assets aa 
    UNION ALL SELECT 
        aa.description AS ShortName,
        aa.entry_others_id AS IDNo,
        NULL AS firstname,
        NULL AS middlename,
        NULL AS company,
        NULL AS address,
        NULL AS options,
        NULL AS sub_account,
        aa.createdAt,
        aa.update AS updatedAt,
        NULL AS contact_details_id,
        NULL AS description,
        NULL AS remarks,
        NULL AS VAT_Type,
        NULL AS tin_no
    FROM
          entry_others aa
     UNION ALL SELECT 
         CONCAT(aa.firstname, ', ', aa.lastname) AS ShortName,
        aa.entry_supplier_id AS IDNo,
        aa.firstname,
        aa.middlename,
        aa.company,
        aa.address,
        aa.option as options,
        NULL AS sub_account,
        aa.createdAt,
        aa.update AS updatedAt,
        aa.supplier_contact_details_id as  contact_details_id,
        NULL AS description,
        NULL AS remarks,
        aa.VAT_Type,
        aa.tin_no
    FROM
          entry_supplier aa) id_entry
        ${
          WhereIDEntry === null || WhereIDEntry === ""
            ? " LIMIT 100 "
            : ` ${WhereIDEntry} `
        }
    `;
}
export function production_renewal_notice() {
  const selectClient = clients_view();
  return `
    SELECT 
        Policy.PolicyNo,
        client.Shortname AS AssuredName,
        Policy.PolicyType
	FROM Policy LEFT JOIN BPolicy ON Policy.PolicyNo = BPolicy.PolicyNo 
	LEFT JOIN VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo 
	LEFT JOIN MPolicy ON Policy.PolicyNo = MPolicy.PolicyNo 
	LEFT JOIN PAPolicy ON Policy.PolicyNo = PAPolicy.PolicyNo 
	LEFT JOIN CGLPolicy ON Policy.PolicyNo = CGLPolicy.PolicyNo 
	LEFT JOIN MSPRPolicy ON Policy.PolicyNo = MSPRPolicy.PolicyNo 
	LEFT JOIN FPolicy ON Policy.PolicyNo = FPolicy.PolicyNo 
	LEFT JOIN (
	   ${selectClient}
	) client ON Policy.IDNo = client.IDNo
    `;
}
export function ProductionReport(
  DateFrom: string,
  DateTo: string,
  Account_: string,
  PolicyType: string,
  IsFinanced: number,
  Mortgagee: string,
  Policy_Type: string,
  SortBy: string
) {
  const selectClient = clients_view();
  let whr_query = "";
  let sql_query = `
    SELECT 
        VPolicy.Mortgagee AS Mortgagee,
        Policy.IDNo AS IDNo,
        client.Shortname AS AssuredName,
        Policy.Account AS Account,
        Policy.PolicyType,
        Policy.PolicyNo,
        DATE_FORMAT(Policy.DateIssued, "%Y-%m-%d") AS DateIssued,
        Policy.TotalPremium,
        Policy.Vat,
        Policy.DocStamp,
        Policy.FireTax, 
        Policy.LGovTax,
        Policy.Notarial,
        Policy.Misc,
        Policy.TotalDue,
        Policy.TotalPaid,
        Policy.Discount,
        VPolicy.Sec4A,
        VPolicy.Sec4B,
        VPolicy.Sec4C,
        DATE_FORMAT(IFNULL(BPolicy.BidDate, IFNULL(VPolicy.DateFrom, IFNULL(MPolicy.DateFrom, IFNULL(PAPolicy.PeriodFrom, IFNULL(CGLPolicy.PeriodFrom, IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom)))))), "%m-%d-%Y") AS EffictiveDate,
        IF( ${IsFinanced} = 0, IFNULL(CGLPolicy.LimitB, 0) + IFNULL(CGLPolicy.LimitA, 0) + IFNULL(VPolicy.ODamage, 0) + IFNULL(VPolicy.TPLLimit, 0),IFNULL(ODamage, 0) + IFNULL(TPLLimit, 0)) AS PLimit,
        IF(${IsFinanced}= 0, IFNULL(EstimatedValue, 0) + IFNULL(TPLLimit, 0) + IFNULL(FPolicy.InsuredValue, 0) + IFNULL(BPolicy.BondValue, 0) + IFNULL(MPolicy.InsuredValue, 0) + IFNULL(MSPRPolicy.SecI, 0) + IFNULL(MSPRPolicy.SecIB, 0) + IFNULL(MSPRPolicy.SecII, 0),IFNULL(EstimatedValue, 0) + IFNULL(TPLLimit, 0))  AS InsuredValue,
        CoverNo,
        Policy.Remarks as Remarks,
        EstimatedValue,
        Make,
        BodyType,
        PlateNo,
        ChassisNo,
        MotorNo,
        Mortgagee,
        VPolicy.Remarks as VRemarks
    FROM Policy 
    LEFT JOIN BPolicy ON Policy.PolicyNo = BPolicy.PolicyNo 
    LEFT JOIN VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo 
    LEFT JOIN MPolicy ON Policy.PolicyNo = MPolicy.PolicyNo 
    LEFT JOIN PAPolicy ON Policy.PolicyNo = PAPolicy.PolicyNo 
    LEFT JOIN CGLPolicy ON Policy.PolicyNo = CGLPolicy.PolicyNo 
    LEFT JOIN MSPRPolicy ON Policy.PolicyNo = MSPRPolicy.PolicyNo 
    LEFT JOIN FPolicy ON Policy.PolicyNo = FPolicy.PolicyNo 
    LEFT JOIN (
    ${selectClient}
    ) client ON Policy.IDNo = client.IDNo
    `;

  if (Mortgagee === "") {
    if (PolicyType === "Bonds") {
      if (Account_ === "ALL") {
        if (SortBy !== "Date From") {
          whr_query = ` WHERE CAST(Policy.DateIssued AS DATE) <= CAST(${DateTo} AS DATE) AND CAST(Policy.DateIssued AS DATE) >= CAST(${DateFrom} AS DATE)  AND Policy.PolicyType in (select SublineName from subline where line = 'Bonds')`;
        }
        if ((SortBy = "Date From")) {
          whr_query = ` WHERE date(IFNULL(BPolicy.BidDate, IFNULL(VPolicy.DateFrom, IFNULL(MPolicy.DateFrom, IFNULL(PAPolicy.PeriodFrom, IFNULL(CGLPolicy.PeriodFrom, IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom))))))) <= STR_TO_DATE('${DateTo}','%Y-%m-%d') AND date(IFNULL(BPolicy.BidDate, IFNULL(VPolicy.DateFrom, IFNULL(MPolicy.DateFrom, IFNULL(PAPolicy.PeriodFrom, IFNULL(CGLPolicy.PeriodFrom, IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom))))))) >= STR_TO_DATE('${DateFrom}','%Y-%m-%d')   AND Policy.PolicyType in (select SublineName from subline where line = 'Bonds')`;
        }
      }

      if (Account_ !== "ALL") {
        if (SortBy !== "Date From") {
          whr_query = ` WHERE DATE(Policy.DateIssued) <= STR_TO_DATE('${DateTo}', '%Y-%m-%d')
        								AND DATE(Policy.DateIssued) >= STR_TO_DATE('${DateFrom}', '%Y-%m-%d')
        								AND Policy.Account = '${Account_}'
        								AND Policy.PolicyType IN (SELECT
        									SublineName
        								FROM
        									  subline
        								WHERE
        									line = 'Bonds')`;
        }
        if (SortBy === "Date From") {
          whr_query = ` WHERE DATE(IFNULL(BPolicy.BidDate,
    										IFNULL(VPolicy.DateFrom,
    												IFNULL(MPolicy.DateFrom,
    														IFNULL(PAPolicy.PeriodFrom,
    																IFNULL(CGLPolicy.PeriodFrom,
    																		IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom))))))) <= STR_TO_DATE('${DateTo}', '%Y-%m-%d')
    								AND DATE(IFNULL(BPolicy.BidDate,
    										IFNULL(VPolicy.DateFrom,
    												IFNULL(MPolicy.DateFrom,
    														IFNULL(PAPolicy.PeriodFrom,
    																IFNULL(CGLPolicy.PeriodFrom,
    																		IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom))))))) >= STR_TO_DATE('${DateFrom}', '%Y-%m-%d')
    								AND Policy.Account = '${Account_}'
    								AND Policy.PolicyType IN (SELECT
    									SublineName
    								FROM
    									subline
    								WHERE
    									line = 'Bonds')`;
        }
      }
      whr_query = `${whr_query} ${
        IsFinanced === 0
          ? ""
          : ` AND ((VPolicy.Mortgagee LIKE '%CASH MANAGEMENT%') OR (VPolicy.Mortgagee LIKE '%CREDIT MASTER%') OR (VPolicy.Mortgagee LIKE '%CAMFIN%'))`
      }`;
    }

    if (PolicyType !== "Bonds") {
      if (Account_ === "ALL") {
        if (SortBy !== "Date From") {
          whr_query = ` where date(Policy.DateIssued) <= date('${DateTo}') and  date(Policy.DateIssued) >= date('${DateFrom}') AND Policy.PolicyType = '${PolicyType}'`;
        }
        if (SortBy === "Date From") {
          whr_query = ` WHERE date(
						IFNULL(BPolicy.BidDate, 
						IFNULL(VPolicy.DateFrom, 
						IFNULL(MPolicy.DateFrom, 
						IFNULL(PAPolicy.PeriodFrom, 
						IFNULL(CGLPolicy.PeriodFrom, 
						IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom))))))) <= date('${DateTo}')
                        AND date(
						IFNULL(BPolicy.BidDate, 
						IFNULL(VPolicy.DateFrom, 
						IFNULL(MPolicy.DateFrom, 
						IFNULL(PAPolicy.PeriodFrom, 
						IFNULL(CGLPolicy.PeriodFrom, 
						IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom))))))) >= date('${DateFrom}') AND Policy.PolicyType = '${PolicyType}'`;
        }
      }
      if (Account_ !== "ALL") {
        if (SortBy !== "Date From") {
          whr_query = `  where date(Policy.DateIssued) <= date('${DateTo}') and  date(Policy.DateIssued) >= date('${DateFrom}')  AND Policy.Account = '${Account_}' AND Policy.PolicyType = '${PolicyType}'`;
        }
        if (SortBy === "Date From") {
          whr_query = ` WHERE date(IFNULL(BPolicy.BidDate, IFNULL(VPolicy.DateFrom, IFNULL(MPolicy.DateFrom, IFNULL(PAPolicy.PeriodFrom, IFNULL(CGLPolicy.PeriodFrom, IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom))))))) <= date('${DateTo}') AND date(IFNULL(BPolicy.BidDate, IFNULL(VPolicy.DateFrom, IFNULL(MPolicy.DateFrom, IFNULL(PAPolicy.PeriodFrom, IFNULL(CGLPolicy.PeriodFrom, IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom))))))) >= date('${DateFrom}') AND Policy.Account = '${Account_}' AND Policy.PolicyType = '${PolicyType}'`;
        }
      }
      whr_query = `${whr_query} ${
        IsFinanced === 0
          ? ""
          : ` AND ((VPolicy.Mortgagee LIKE '%CASH MANAGEMENT%') OR (VPolicy.Mortgagee LIKE '%CREDIT MASTER%') OR (VPolicy.Mortgagee LIKE '%CAMFIN%')`
      }`;
    }
  }

  if (Mortgagee !== "") {
    if (SortBy === "Date From") {
      whr_query = ` WHERE IFNULL(BPolicy.BidDate, IFNULL(VPolicy.DateFrom, IFNULL(MPolicy.DateFrom, IFNULL(PAPolicy.PeriodFrom, IFNULL(CGLPolicy.PeriodFrom, IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom)))))) <= date('${DateTo}') AND IFNULL(BPolicy.BidDate, IFNULL(VPolicy.DateFrom, IFNULL(MPolicy.DateFrom, IFNULL(PAPolicy.PeriodFrom, IFNULL(CGLPolicy.PeriodFrom, IFNULL(MSPRPolicy.PeriodFrom, FPolicy.DateFrom)))))) >= date('${DateFrom}') AND Policy.Account = '${Account_}' AND VPolicy.Mortgagee = '${Mortgagee}'`;
    }

    if (SortBy !== "Date From") {
      whr_query = `  where date(Policy.DateIssued) <= date('${DateTo}') and  date(Policy.DateIssued) >= date('${DateFrom}')  AND Policy.Account = '${Account_}' AND VPolicy.Mortgagee = '${Mortgagee}'`;
    }
  }

  if (Policy_Type === "Temporary") {
    whr_query = whr_query + " and Policy.policyno like '%TP-%' ";
  }
  if (Policy_Type === "Regular") {
    whr_query = whr_query + " and Policy.policyno not like '%TP-%'";
  }
  if (SortBy === "Date Issued") {
    whr_query = whr_query + " ORDER BY date( Policy.DateIssued) asc";
  }
  if (SortBy === "Policy No#") {
    whr_query = whr_query + " ORDER BY Policy.policyno asc";
  }
  if (SortBy === "Date From") {
    whr_query =
      whr_query +
      " order by  IFNULL(IFNULL(IFNULL(IFNULL(IFNULL(VPolicy.DateFrom,FPolicy.DateFrom),CGLPolicy.PeriodFrom),MPolicy.DateFrom),BPolicy.BidDate),PAPolicy.PeriodFrom) asc";
  }
  return `${sql_query} ${whr_query}`;
}
export function RenewalNoticeReport(
  DateFrom: string,
  PolicyType: string,
  Regular: string,
  PAccount: string
) {
  const selectClient = clients_view();
  let select_query = "";

  if (PolicyType === "COM" && Regular === "Regular") {
    select_query = `
    SELECT 
        a.Shortname as AssuredName,
        Policy.PolicyNo,
        DATE_FORMAT(VPolicy.DateTo, '%m-%d-%Y')as Expiration,
        VPolicy.EstimatedValue as InsuredValue,
        VPolicy.Make,
        VPolicy.BodyType,
        VPolicy.PlateNo,
        VPolicy.ChassisNo,
        VPolicy.MotorNo,
        Policy.TotalPremium,
        VPolicy.Mortgagee
        Mortgagee,
        VPolicy.Account
    FROM Policy 
    LEFT JOIN VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo 
    LEFT JOIN  (${selectClient}) a ON Policy.IDNo = a.IDNo
    where 
    Policy.PolicyType = '${PolicyType}' AND
    SUBSTRING(Policy.PolicyNo, 1, 3)  <> 'TP-' AND
    month(VPolicy.DateTo) = month('${DateFrom}') AND
    year(VPolicy.DateTo) = year('${DateFrom}') 
    ${PAccount === "All" ? "" : ` AND VPolicy.Account =${PAccount} `}
    ORDER BY date(VPolicy.DateTo) asc`;
  }

  if (PolicyType === "COM" && Regular !== "Regular") {
    select_query = `
    SELECT
      a.Shortname as AssuredName,
      Policy.PolicyNo,
      DATE_FORMAT(VPolicy.DateTo, '%m-%d-%Y')as Expiration,
      VPolicy.EstimatedValue as InsuredValue,
      VPolicy.Make,
      VPolicy.BodyType,
      VPolicy.PlateNo,
      VPolicy.ChassisNo,
      VPolicy.MotorNo,
      Policy.TotalPremium,
      VPolicy.Mortgagee
      Mortgagee,
      VPolicy.Account
    FROM Policy
    LEFT JOIN VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo
    LEFT JOIN  (${selectClient}) a ON Policy.IDNo = a.IDNo 
    where
    Policy.PolicyType = '${PolicyType}' AND
    SUBSTRING(Policy.PolicyNo, 1, 3)  = 'TP-' AND
    month(VPolicy.DateTo) = month('${DateFrom}') AND
    year(VPolicy.DateTo) = year('${DateFrom}')
    ${PAccount === "All" ? "" : ` AND VPolicy.Account =${PAccount} `}
    ORDER BY date(VPolicy.DateTo) asc
  `;
  }

  if (PolicyType === "FIRE") {
    select_query = `
    SELECT
      a.Shortname as AssuredName,
      Policy.PolicyNo,
      DATE_FORMAT(FPolicy.DateTo, '%m-%d-%Y')as Expiration,
      FPolicy.InsuredValue as InsuredValue,
      Policy.TotalPremium,
      FPolicy.Mortgage,
      FPolicy.Account
    FROM Policy
    LEFT JOIN FPolicy ON Policy.PolicyNo = FPolicy.PolicyNo
    LEFT JOIN  (${selectClient}) a ON Policy.IDNo = a.IDNo
    where
    Policy.PolicyType = '${PolicyType}' AND
    month(FPolicy.DateTo) = month('${DateFrom}') AND
    year(FPolicy.DateTo) = year('${DateFrom}') 
    ${PAccount === "All" ? "" : ` AND FPolicy.Account = '${PAccount}' `}
    ORDER BY date(FPolicy.DateTo) asc
   `;
  }

  if (PolicyType === "MAR") {
    select_query = `
      SELECT
          a.Shortname as AssuredName,
          Policy.PolicyNo,
          DATE_FORMAT(MPolicy.DateTo, '%m-%d-%Y')as Expiration,
          MPolicy.InsuredValue,
          Policy.TotalPremium,
          MPolicy.Account
      FROM Policy
      LEFT JOIN MPolicy ON Policy.PolicyNo = MPolicy.PolicyNo
      LEFT JOIN  (${selectClient}) a ON Policy.IDNo = a.IDNo
      where
      Policy.PolicyType = '${PolicyType}' AND
      month(MPolicy.DateTo) = month('${DateFrom}') AND
      year(MPolicy.DateTo) = year('${DateFrom}') 
      ${PAccount === "All" ? "" : ` AND MPolicy.Account = '${PAccount}' `}
      "ORDER BY date(MPolicy.DateTo) asc
  `;
  }

  if (PolicyType === "PA") {
    select_query = `
      SELECT
          a.Shortname as AssuredName,
          Policy.PolicyNo,
          DATE_FORMAT(PAPolicy.PeriodTo, '%m-%d-%Y')as Expiration,
          Policy.TotalPremium,
          PAPolicy.Account
      FROM Policy
      LEFT JOIN PAPolicy ON Policy.PolicyNo = PAPolicy.PolicyNo
      LEFT JOIN  (${selectClient}) a ON Policy.IDNo = a.IDNo
      where
      Policy.PolicyType = '${PolicyType}' AND
      month(PAPolicy.PeriodTo) = month('${DateFrom}') AND
      year(PAPolicy.PeriodTo) = year('${DateFrom}') 
      ${PAccount === "All" ? "" : ` AND PAPolicy.Account = '${PAccount}' `}
      ORDER BY date(PAPolicy.PeriodTo) asc
  `;
  }
  return select_query;
}
export function TemplateRenewalNotice(PolicyType: string, PolicyNo: string) {
  const selectClient = clients_view();
  let select_query = "";
  if (PolicyType === "COM") {
    select_query = `
    SELECT 
		    client.Shortname,
        client.address,
		    Policy.PolicyNo,
        VPolicy.PlateNo,
        VPolicy.ChassisNo,
        VPolicy.MotorNo,
        VPolicy.DateTo,
        concat(VPolicy.Model,' ',VPolicy.Make,' ',VPolicy.BodyType) as unitInsuredu,
        VPolicy.Mortgagee,
        FORMAT(VPolicy.EstimatedValue, 4) as tl_prev_insured,
        FORMAT(VPolicy.EstimatedValue, 4) as acn_prev_insured,
        FORMAT(VPolicy.BodilyInjury,4) as injury_prev_insured,
        FORMAT(VPolicy.PropertyDamage,4) as damage_prev_insured,
        FORMAT(VPolicy.PersonalAccident,4) as accident_prev_insured,
        FORMAT(VPolicy.ODamage,4) as tl_prev_premium,
        FORMAT(VPolicy.AOG,4) as acn_prev_premium,
        VPolicy.Sec4A as injury_prev_premium,
        VPolicy.Sec4B as damage_prev_premium,
        VPolicy.Sec4C	as accident_prev_premium,
        FORMAT(Policy.TotalPremium,4)  as prev_sub_total,
        FORMAT(Policy.DocStamp,4)	as prev_doc_stamp,
        FORMAT(Policy.Vat,4) as prev_evat,
        FORMAT(Policy.LGovTax,4) as prev_lgt,
        FORMAT(Policy.TotalDue,4) as prev_gross,
        SecIIPercent,
        VPolicy.Remarks
    FROM
	(SELECT * FROM Policy WHERE Policy.PolicyType = 'COM') AS Policy
		LEFT JOIN 
	(SELECT * FROM VPolicy WHERE VPolicy.PolicyType <> 'TPL') AS VPolicy ON Policy.PolicyNo = VPolicy.PolicyNo
        LEFT JOIN 
	(${selectClient}) as  client on Policy.IDNo = client.IDNo
    `;
  }
  select_query = `${select_query} WHERE Policy.PolicyNo ='${PolicyNo}'`;
  return select_query;
}
export function GeneralLedgerReport(
  Report: string,
  DateEntry: any,
  SubAcct: string,
  TransSumm: number,
  PrePost: number
) {
  let PrevQry = "";
  let PrevWhr = "";
  let CurrQry = "";
  let CurrWhr = "";
  let FinalQry = "";
  let DateFrom = new Date(DateEntry);
  let DateTo = new Date(DateEntry);
  let PPClosing = "";

  DateFrom = new Date(DateFrom.getFullYear(), DateFrom.getMonth(), 1);
  DateTo = subDays(addMonths(DateFrom, 1), 1); // Add 1 month then subtract 1 day

  const formattedDateFrom = format(DateFrom, "yyyy-MM-dd");
  const formattedDateTo = format(DateTo, "yyyy-MM-dd");

  if (PrePost !== 0) {
    PPClosing = " Explanation <> 'Closing of Nominal Accounts' AND ";
  }

  if (Report === "Monthly") {
    if (SubAcct === "ALL") {
      PrevWhr = `Source_Type IN ('AB', 'BF')
      AND Date_Entry >= DATE_ADD(DATE_SUB('${formattedDateFrom}', INTERVAL 1 DAY), INTERVAL -1 MONTH)
      AND Date_Entry <= DATE_SUB('${formattedDateTo}', INTERVAL 1 DAY)`;

      CurrWhr =
        PPClosing +
        `Source_Type NOT IN ('BF', 'AB', 'BFD', 'BFS') 
      AND Date_Entry >= '${formattedDateFrom}'
      AND Date_Entry <= '${formattedDateTo}'`;
    } else {
      PrevWhr = `Source_Type IN ('AB', 'BFS') AND Sub_Acct='${SubAcct}'
      AND Date_Entry >= DATE_ADD(DATE_SUB('${formattedDateFrom}', INTERVAL 1 DAY), INTERVAL -1 MONTH)
      AND Date_Entry <= DATE_SUB('${formattedDateTo}', INTERVAL 1 DAY)`;

      CurrWhr =
        PPClosing +
        `Source_Type NOT IN ('BF', 'AB', 'BFD', 'BFS') 
      AND Date_Entry >= '${formattedDateFrom}'
      AND Date_Entry <= '${formattedDateTo}' 
      AND Sub_Acct='${SubAcct}'`;
    }
  } else {
    // Daily
    if (SubAcct === "ALL") {
      if (format(DateEntry, "MM/dd/yyyy") === format(DateEntry, "MM/01/yyyy")) {
        PrevWhr = `((Source_Type = 'BF' OR Source_Type = 'AB') 
        AND Date_Entry = DATE_SUB('${format(
          DateEntry,
          "yyyy-MM-dd"
        )}', INTERVAL 1 DAY))`;
      } else {
        PrevWhr =
          PPClosing +
          `((Source_Type <> 'BFD' AND Source_Type <> 'BFS')
        AND ((IF(Source_Type IN ('BFD', 'AB', 'BF', 'BFS'), DATE_ADD(Date_Entry, INTERVAL 1 DAY), Date_Entry)) 
        >= '${formattedDateFrom}' 
        AND (IF(Source_Type IN ('BFD', 'AB', 'BF', 'BFS'), DATE_ADD(Date_Entry, INTERVAL 1 DAY), Date_Entry)) 
        < '${format(DateEntry, "yyyy-MM-dd")}'))`;
      }

      CurrWhr =
        PPClosing +
        `((Source_Type <> 'BF' AND Source_Type <> 'AB' AND Source_Type <> 'BFD' AND Source_Type <> 'BFS') 
      AND (IF(Source_Type IN ('BFD', 'AB', 'BF', 'BFS'), DATE_ADD(Date_Entry, INTERVAL 1 DAY), Date_Entry)) 
      = '${format(DateEntry, "yyyy-MM-dd")}')`;
    } else {
      if (format(DateEntry, "MM/dd/yyyy") === format(DateEntry, "MM/01/yyyy")) {
        CurrWhr = `((Source_Type = 'BFS')  
        AND Date_Entry = DATE_SUB('${format(
          DateEntry,
          "yyyy-MM-dd"
        )}', INTERVAL 1 DAY) 
        AND Sub_Acct='${SubAcct}')`;
      } else {
        PrevWhr =
          PPClosing +
          `((Source_Type <> 'BFD' AND Source_Type <> 'BF')  
        AND Sub_Acct='${SubAcct}' 
        AND ((IF(Source_Type IN ('BFD', 'AB', 'BF', 'BFS'), DATE_ADD(Date_Entry, INTERVAL 1 DAY), Date_Entry)) 
        >= '${formattedDateFrom}' 
        AND (IF(Source_Type IN ('BFD', 'AB', 'BF', 'BFS'), DATE_ADD(Date_Entry, INTERVAL 1 DAY), Date_Entry)) 
        < '${format(DateEntry, "yyyy-MM-dd")}'))`;

        CurrWhr =
          PPClosing +
          `((Source_Type <> 'BF' AND Source_Type <> 'AB' AND Source_Type <> 'BFD' AND Source_Type <> 'BFS') 
        AND (IF(Source_Type IN ('BFD', 'AB', 'BF', 'BFS'), DATE_ADD(Date_Entry, INTERVAL 1 DAY), Date_Entry)) 
        = '${format(DateEntry, "yyyy-MM-dd")}' 
        AND Sub_Acct='${SubAcct}')`;
      }
    }
  }

  // The following part is where you construct the final queries
  // Balance Forwarded
  PrevQry = ` 
    SELECT GL_Acct, Source_Type, Number, Book_Code, CONCAT(Books_Desc, ' - ', '${format(
      subDays(DateTo, 1),
      "MMMM dd, yyyy"
    )}') AS Book, 
    SUM(IFNULL(Debit, 0)) AS Debit, SUM(IFNULL(Credit, 0)) AS Credit
    FROM Journal 
    LEFT JOIN Books ON Journal.Source_Type = Books.Code
    WHERE ${PrevWhr}
    GROUP BY GL_Acct, Source_Type, Number, Book_Code, Books_Desc
    ORDER BY GL_Acct, Number`;

  // Current Transaction
  CurrQry = ` 
    SELECT GL_Acct, Source_Type, Number, Book_Code, CONCAT(Books_Desc, ' - ', '${format(
      DateEntry,
      Report === "Monthly" ? "MMMM yyyy" : "MMMM dd, yyyy"
    )}') AS Book, 
    SUM(IFNULL(Debit, 0)) AS Debit, 
    SUM(IFNULL(Credit, 0)) AS Credit
    FROM Journal 
    LEFT JOIN Books ON Journal.Source_Type = Books.Code
    WHERE ${CurrWhr}
    GROUP BY GL_Acct, Source_Type, Number, Book_Code, Books_Desc
    ORDER BY GL_Acct, Number`;

  if (TransSumm === 0) {
    FinalQry = ` 
      SELECT GL_Acct, 'BF' AS Source_Type, 2 AS Number, 'BF' AS Book_Code, MIN(Book) AS Book, 
      SUM(Debit) AS Debit, SUM(Credit) AS Credit
      FROM (${PrevQry}) temp_Prev 
      GROUP BY GL_Acct
      UNION ALL
      SELECT * FROM (${CurrQry}) temp_Curr`;
  } else {
    FinalQry = `SELECT * FROM (${CurrQry}) temp_Curr`;
  }

  const SubTotalQry = `SELECT GL_Acct, SUM(Debit)-SUM(Credit) AS SubTotal  FROM (${FinalQry}) Final GROUP BY GL_Acct`;

  // Balance Query
  return `SELECT
    Final.GL_Acct,
    Acct_Title AS Title,
    Book_Code AS BookCode,
    Book,
    format(Debit,2) as Debit,
    format(Credit,2) as Credit,
    format(abs(SubTotal),2) as SubTotal
  FROM
    (${FinalQry}) Final 
  LEFT JOIN Chart_Account ON Final.GL_Acct = Chart_Account.Acct_Code 
  LEFT JOIN (${SubTotalQry}) SubTotal ON Final.GL_Acct = SubTotal.GL_Acct
  ORDER BY GL_Acct, Number`;
}
export function GeneralLedgerSumm(
  DateEntry: any,
  Report: string,
  TransSumm: number = 0,
  PrePost: number
) {
  let DateFrom = new Date(DateEntry);
  let DateTo = new Date(DateEntry);
  DateFrom = new Date(DateFrom.getFullYear(), DateFrom.getMonth(), 1);
  DateTo = subDays(addMonths(DateFrom, 1), 1);

  const formattedDateFrom = format(DateFrom, "yyyy-MM-dd");
  const formattedDateTo = format(DateTo, "yyyy-MM-dd");
  const formattedPrevDate = format(subDays(DateTo, 1), "MMMM dd, yyyy");
  const formattedCurrDate = format(
    DateEntry,
    Report === "Monthly" ? "MMMM yyyy" : "MMMM dd, yyyy"
  );

  const PPClosing =
    PrePost === 0 ? "" : 'Explanation <> "Closing of Nominal Accounts" AND ';

  let PrevWhr = "";
  let CurrWhr = "";

  if (Report === "Monthly") {
    PrevWhr = `(Source_Type IN ('AB', 'BFS')) 
                AND Date_Entry >= DATE_SUB('${formattedDateFrom}', INTERVAL 1 DAY)
                AND Date_Entry <= DATE_SUB('${formattedDateTo}', INTERVAL 1 DAY)`;
    CurrWhr = `${PPClosing} (Source_Type NOT IN ('BF', 'AB', 'BFD', 'BFS')) 
                AND Date_Entry >= '${formattedDateFrom}' 
                AND Date_Entry <= '${formattedDateTo}'`;
  } else {
    // Daily
    if (format(DateEntry, "MM/dd/yyyy") === format(DateEntry, "MM/01/yyyy")) {
      PrevWhr = `Source_Type = 'BFS' 
                AND Date_Entry = DATE_SUB('${format(
                  DateEntry,
                  "yyyy-MM-dd"
                )}', INTERVAL 1 DAY)`;
    } else {
      PrevWhr = `${PPClosing} (Source_Type NOT IN ('BFD', 'BF')) 
                AND (IF(Source_Type IN ('BFD', 'AB', 'BF', 'BFS'), 
                DATE_ADD(Date_Entry, INTERVAL 1 DAY), Date_Entry) >= '${formattedDateFrom}' 
                AND IF(Source_Type IN ('BFD', 'AB', 'BF', 'BFS'), 
                DATE_ADD(Date_Entry, INTERVAL 1 DAY), Date_Entry) < '${format(
                  DateEntry,
                  "yyyy-MM-dd"
                )}')`;
    }
    CurrWhr = `${PPClosing} (Source_Type NOT IN ('BF', 'AB', 'BFD', 'BFS')) 
                AND (IF(Source_Type IN ('BFD', 'AB', 'BF', 'BFS'), 
                DATE_ADD(Date_Entry, INTERVAL 1 DAY), Date_Entry) = '${format(
                  DateEntry,
                  "yyyy-MM-dd"
                )}')`;
  }

  const PrevQry = ` 
                  SELECT GL_Acct, Sub_Acct, Source_Type, Number, Book_Code, CONCAT(Books_Desc, ' - ', '${formattedPrevDate}') AS Book, 
                  SUM(IFNULL(Debit, 0)) AS Debit, SUM(IFNULL(Credit, 0)) AS Credit
                  FROM Journal 
                  LEFT JOIN Books ON Journal.Source_Type = Books.Code
                  WHERE ${PrevWhr}
                  GROUP BY GL_Acct, Sub_Acct, Source_Type, Number, Book_Code, Books_Desc`;

  const CurrQry = `
                  SELECT GL_Acct, Sub_Acct, Source_Type, Number, Book_Code, CONCAT(Books_Desc, ' - ', '${formattedCurrDate}') AS Book, 
                  SUM(IFNULL(Debit, 0)) AS Debit, SUM(IFNULL(Credit, 0)) AS Credit
                  FROM Journal 
                  LEFT JOIN Books ON Journal.Source_Type = Books.Code
                  WHERE ${CurrWhr}
                  GROUP BY GL_Acct, Sub_Acct, Source_Type, Number, Book_Code, Books_Desc`;

  let FinalQry = "";
  if (TransSumm === 0) {
    FinalQry = ` 
                SELECT GL_Acct, Sub_Acct, 'BF' AS Source_Type, 2 AS Number, 'BF' AS Book_Code, MIN(Book) AS Book, 
                SUM(Debit) AS Debit, SUM(Credit) AS Credit
                FROM (${PrevQry}) temp_Prev 
                GROUP BY GL_Acct, Sub_Acct
                UNION ALL
                SELECT * FROM (${CurrQry}) temp_Curr`;
  } else {
    FinalQry = ` SELECT * FROM  (${CurrQry}) temp_Curr`;
  }

  const SubTotalQry = `SELECT 
                        GL_Acct, 
                        Sub_Acct, 
                        SUM(Debit)-SUM(Credit) AS SubTotal 
                       FROM (${FinalQry}) temp_Final 
                       GROUP BY GL_Acct, Sub_Acct`;

  const BalanceQry = `SELECT
                        temp_Final.GL_Acct,
                        (select Acronym from sub_account a where a.Acronym  = temp_Final.Sub_Acct or a.Sub_Acct  = temp_Final.Sub_Acct group by a.Acronym) AS SACode,
                        (select ShortName from sub_account a where a.Acronym  = temp_Final.Sub_Acct or a.Sub_Acct  = temp_Final.Sub_Acct group by a.ShortName) AS SubAcct,
                        Acct_Title,
                        Book_Code AS BookCode,
                        Book,
                        Debit,
                        Credit,
                        SubTotal
                      FROM
                        (${FinalQry}) temp_Final 
                      LEFT JOIN Chart_Account ON temp_Final.GL_Acct = Chart_Account.Acct_Code 
                      LEFT JOIN (${SubTotalQry}) temp_SubTotal ON (temp_Final.GL_Acct = temp_SubTotal.GL_Acct AND temp_Final.Sub_Acct = temp_SubTotal.Sub_Acct) 
                      LEFT JOIN sub_account SubAccount ON temp_Final.Sub_Acct = SubAccount.Sub_Acct 
                      ORDER BY temp_Final.GL_Acct, temp_Final.Sub_Acct, Number`;

  return BalanceQry;
}
export function AbstractCollections(
  reportType: string, // or 'Monthly'
  subAcct: string, // or specific sub-account
  date: Date, // example date
  order: string // or 'Des
) {
  let sWhere1 = "";
  let sWhere2 = "";

  const formattedDateCollection = format(date, "yyyy-MM-dd");
  const firstDayOfMonthCollection = format(
    new Date(date.getFullYear(), date.getMonth(), 1),
    "yyyy-MM-dd"
  );
  const lastDayCollection = format(lastDayOfMonth(date), "yyyy-MM-dd");

  const formattedDateJournal = format(date, "yyyy-MM-dd");
  const firstDayOfMonthJournal = format(
    new Date(date.getFullYear(), date.getMonth(), 1),
    "yyyy-MM-dd"
  );
  const lastDayJournal = format(lastDayOfMonth(date), "yyyy-MM-dd");

  if (reportType === "Daily") {
    if (subAcct === "ALL") {
      sWhere1 = `WHERE Collection.Date_OR = '${formattedDateCollection}'`;
      sWhere2 = `WHERE Journal.Source_Type = 'OR' AND Journal.Date_Entry = '${formattedDateJournal}'`;
    } else {
      sWhere1 = `WHERE Collection.Date_OR = '${formattedDateCollection}' AND LTRIM(RTRIM(Collection.Status)) = '${subAcct.trim()}'`;
      sWhere2 = `WHERE Journal.Source_Type = 'OR' AND Journal.Date_Entry = '${formattedDateJournal}' AND LTRIM(RTRIM(Journal.Branch_Code)) = '${subAcct.trim()}'`;
    }
  } else if (reportType === "Monthly") {
    if (subAcct === "ALL") {
      sWhere1 = `WHERE Collection.Date_OR >= '${firstDayOfMonthCollection}' AND Collection.Date_OR <= '${lastDayCollection}'`;
      sWhere2 = `WHERE Journal.Source_Type = 'OR' AND Journal.Date_Entry >= '${firstDayOfMonthJournal}' AND Journal.Date_Entry <= '${lastDayJournal}'`;
    } else {
      sWhere1 = `WHERE Collection.Date_OR >= '${firstDayOfMonthCollection}' AND Collection.Date_OR <= '${lastDayCollection}' AND Collection.Status = '${subAcct.trim()}'`;
      sWhere2 = `WHERE Journal.Source_Type = 'OR' AND Journal.Date_Entry >= '${firstDayOfMonthJournal}' AND Journal.Date_Entry <= '${lastDayJournal}' AND LTRIM(RTRIM(Journal.Branch_Code)) = '${subAcct.trim()}'`;
    }
  }

  const queryCollection = `
    SELECT date_format(Collection.Date,'%m/%d/%Y') as Date, Collection.ORNo, Collection.IDNo, UPPER(Name) AS cName, Collection.Bank, 
           Check_No AS cCheck_No, Collection.DRCode, Collection.Debit, Collection.DRTitle, Collection.CRCode, 
           Collection.Credit, Collection.CRTitle, Collection.Purpose, Collection.CRRemarks, Collection.Official_Receipt, 
           Collection.Temp_OR, Collection.Date_OR, 'Monthly' AS Rpt, Collection.Status 
    FROM Collection 
    ${sWhere1}
    ORDER BY Collection.Temp_OR ${order === "Ascending" ? "ASC" : "DESC"}
  `;

  console.log(queryCollection);

  const queryJournal = `
    SELECT Journal.GL_Acct, Chart_Account.Acct_Title AS Title, 
            format(SUM(IFNULL(Debit, 0)) ,2) AS mDebit, format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
    FROM Journal 
    LEFT JOIN Chart_Account ON Journal.GL_Acct = Chart_Account.Acct_Code 
    ${sWhere2}
    GROUP BY Journal.GL_Acct, Chart_Account.Acct_Title 
    HAVING Journal.GL_Acct <> ''
  `;

  return {
    queryCollection,
    queryJournal,
  };
}
export function DepositedCollections(
  reportType: string,
  subAcct: string,
  date: Date,
  order: string
) {
  let sWhere1 = "";
  let sWhere2 = "";

  const formattedDate = format(date, "yyyy-MM-dd");
  const firstDayOfMonth = format(
    new Date(date.getFullYear(), date.getMonth(), 1),
    "yyyy-MM-dd"
  );
  const lastDay = format(lastDayOfMonth(date), "yyyy-MM-dd");

  if (reportType === "Daily") {
    if (subAcct === "ALL") {
      sWhere1 = `WHERE CAST(Deposit.Temp_SlipDate AS DATE) = '${formattedDate}'`;
      sWhere2 = `WHERE Journal.Source_Type = 'DC' AND Journal.Date_Entry = '${formattedDate}'`;
    } else {
      sWhere1 = `WHERE CAST(Deposit.Temp_SlipDate AS DATE) = '${formattedDate}' AND LTRIM(RTRIM(Deposit.Type)) = '${subAcct.trim()}'`;
      sWhere2 = `WHERE Journal.Source_Type = 'DC' AND Journal.Date_Entry = '${formattedDate}' AND LTRIM(RTRIM(Journal.Branch_Code)) = '${subAcct.trim()}'`;
    }
  } else if (reportType === "Monthly") {
    if (subAcct === "ALL") {
      sWhere1 = `WHERE CAST(Deposit.Temp_SlipDate AS DATE) >= '${firstDayOfMonth}' AND CAST(Deposit.Temp_SlipDate AS DATE) <= '${lastDay}'`;
      sWhere2 = `WHERE Journal.Source_Type = 'DC' AND Journal.Date_Entry >= '${firstDayOfMonth}' AND Journal.Date_Entry <= '${lastDay}'`;
    } else {
      sWhere1 = `WHERE CAST(Deposit.Temp_SlipDate AS DATE) >= '${firstDayOfMonth}' AND CAST(Deposit.Temp_SlipDate AS DATE) <= '${lastDay}' AND LTRIM(RTRIM(Deposit.Type)) = '${subAcct.trim()}'`;
      sWhere2 = `WHERE Journal.Source_Type = 'DC' AND Journal.Date_Entry >= '${firstDayOfMonth}' AND Journal.Date_Entry <= '${lastDay}' AND LTRIM(RTRIM(Journal.Branch_Code)) = '${subAcct.trim()}'`;
    }
  }

  const queryDeposit = `
     SELECT 
        Deposit.Temp_SlipCntr, 
        DATE_FORMAT(Deposit.Temp_SlipDate, '%m/%d/%Y') as Temp_SlipDate , 
        Deposit.Temp_SlipCode, 
        DATE_FORMAT(Deposit.Date_Deposit, '%m/%d/%Y') as Date_Deposit , 
        Deposit.Slip_Code, 
        Deposit.Account_ID, 
        if(Deposit.Slip_Code is null,Deposit.IDNo ,c.Identity) as IDNo,
        Deposit.Bank, 
        Check_No AS cCheck_No, 
        Deposit.Debit, 
        Deposit.Credit, 
        Deposit.Ref_No, 
        Deposit.Type, 
        Deposit.Check_Date, 
        'Monthly' AS Rpt ,
        chart_account.Short as Account_Name,
        ifnull(concat(Deposit.Account_ID,' ',chart_account.Short),'') as acct_name
    FROM (
      SELECT 
          a.*, b.BankAccount
      FROM
          deposit a
      LEFT JOIN deposit_slip b ON a.Slip_Code = b.SlipCode
    ) Deposit 
    LEFT JOIN chart_account on Acct_Code = Deposit. Account_ID
    LEFT JOIN bankaccounts c ON Deposit.BankAccount = c.Account_No
    ${sWhere1}
    ORDER BY Deposit.Temp_SlipCntr, Ref_No ${
      order === "Ascending" ? "ASC" : "DESC"
    }
  `;

  const queryJournal = `
    SELECT Journal.GL_Acct, Chart_Account.Acct_Title AS Title, 
           format(SUM(IFNULL(Debit, 0)),2) AS mDebit, format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
    FROM Journal 
    LEFT JOIN Chart_Account ON Journal.GL_Acct = Chart_Account.Acct_Code 
    ${sWhere2}
    GROUP BY Journal.GL_Acct, Chart_Account.Acct_Title 
    HAVING Journal.GL_Acct <> ''
  `;

  return {
    queryDeposit,
    queryJournal,
  };
}
export function ReturnedChecksCollection(
  reportType: string,
  subAcct: string,
  date: Date,
  order: string
) {
  let sWhere1 = "";
  let sWhere2 = "";

  const formattedDate = format(date, "yyyy-MM-dd");
  const firstDayOfMonth = format(
    new Date(date.getFullYear(), date.getMonth(), 1),
    "yyyy-MM-dd"
  );
  const lastDay = format(lastDayOfMonth(date), "yyyy-MM-dd");

  if (reportType === "Daily") {
    if (subAcct === "ALL") {
      sWhere1 = `WHERE Journal.Date_Entry = '${formattedDate}' AND Journal.Source_Type = 'RC'`;
      sWhere2 = `WHERE Journal.Source_Type = 'RC' AND Journal.Date_Entry = '${formattedDate}'`;
    } else {
      sWhere1 = `WHERE Journal.Date_Entry = '${formattedDate}' AND Journal.Source_Type = 'RC' AND LTRIM(RTRIM(Journal.Branch_Code)) = '${subAcct.trim()}'`;
      sWhere2 = `WHERE Journal.Source_Type = 'RC' AND Journal.Date_Entry = '${formattedDate}' AND LTRIM(RTRIM(Journal.Branch_Code)) = '${subAcct.trim()}'`;
    }
  } else if (reportType === "Monthly") {
    if (subAcct === "ALL") {
      sWhere1 = `WHERE Journal.Date_Entry >= '${firstDayOfMonth}' AND Journal.Date_Entry <= '${lastDay}' AND Journal.Source_Type = 'RC'`;
      sWhere2 = `WHERE Journal.Source_Type = 'RC' AND Journal.Date_Entry >= '${firstDayOfMonth}' AND Journal.Date_Entry <= '${lastDay}'`;
    } else {
      sWhere1 = `WHERE Journal.Date_Entry >= '${firstDayOfMonth}' AND Journal.Date_Entry <= '${lastDay}' AND Journal.Source_Type = 'RC' AND LTRIM(RTRIM(Journal.Branch_Code)) = '${subAcct.trim()}'`;
      sWhere2 = `WHERE Journal.Source_Type = 'RC' AND Journal.Date_Entry >= '${firstDayOfMonth}' AND Journal.Date_Entry <= '${lastDay}' AND LTRIM(RTRIM(Journal.Branch_Code)) = '${subAcct.trim()}'`;
    }
  }

  let queryReturned = `
    SELECT 
            DATE_FORMAT(Journal.Date_Entry,'%m/%d/%Y') as Date_Entry, 
            Journal.Source_No, 
            Journal.Explanation, 
            Journal.GL_Acct, 
            Journal.cGL_Acct, 
            Journal.ID_No, 
            Journal.cID_No, 
            Journal.Check_No, 
            Journal.Check_Bank, 
            DATE_FORMAT(STR_TO_DATE(Check_Return, '%m/%d/%Y'),'%m/%d/%Y') as Check_Return, 
            Journal.Check_Deposit, 
            Journal.Check_Reason, 
            format(Journal.Debit,2) as Debit, 
            format(Journal.Credit,2) as Credit, 
            'Monthly' AS Rpt 
    FROM Journal 
    ${sWhere1}
    ORDER BY Journal.Source_No ${order === "Ascending" ? "ASC" : "DESC"}
  `;

  queryReturned = `
  select 
        *,
        CASE WHEN @prev_source_no = a.Source_No THEN '' ELSE a.Source_No END AS nSource_No,
        CASE WHEN @prev_source_no = a.Source_No THEN '' ELSE a.Date_Entry END AS nDate_Entry,

        @prev_source_no := a.Source_No AS prev_source_no
    from ( 
      ${queryReturned}
    ) a
  `;
  const queryJournal = `
    SELECT 
          Journal.GL_Acct, 
          Chart_Account.Acct_Title AS Title, 
          format(SUM(IFNULL(Debit, 0)),2) AS mDebit, 
          format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
    FROM Journal 
    LEFT JOIN Chart_Account ON Journal.GL_Acct = Chart_Account.Acct_Code 
    ${sWhere2}
    GROUP BY Journal.GL_Acct, Chart_Account.Acct_Title 
    HAVING Journal.GL_Acct <> ''
  `;

  return {
    queryReturned,
    queryJournal,
  };
}
export function PostDatedCheckRegistered(
  sortField: string,
  sortOrder: string,
  type: string,
  pdcField: string,
  pdcBranch: string,
  dateFrom: Date,
  dateTo: Date
) {
  let sSort = "";
  let sWhere = "";
  const formattedDateFrom = format(
    new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1),
    "yyyy-MM-dd"
  );
  const formattedDateTo = format(lastDayOfMonth(dateTo), "yyyy-MM-dd");

  if (sortField === "Name") {
    sSort = `ORDER BY Name ${sortOrder === "Ascending" ? "ASC" : "DESC"}`;
  } else if (sortField === "Check Date") {
    sSort = `ORDER BY Check_Date ${sortOrder === "Ascending" ? "ASC" : "DESC"}`;
  } else if (sortField === "Date Received") {
    sSort = `ORDER BY Date ${sortOrder === "Ascending" ? "ASC" : "DESC"}`;
  }

  if (type === "Rent") {
    sWhere = "AND PN_No LIKE '%rent%' ";
  } else if (type === "Loan") {
    sWhere = "AND PN_No NOT LIKE '%rent%' ";
  }

  let query = "";

  if (pdcField === "Check Date") {
    query = `
      SELECT PDC.* ,
      date_format(PDC.Check_Date,'%m/%d/%Y') as cCheck_Date,
      date_format(PDC.Date,'%m/%d/%Y') as dDate
      FROM PDC 
      WHERE (PDC.Check_Date >= '${formattedDateFrom}' AND PDC.Check_Date <= '${formattedDateTo}')
        AND ((PDC.PDC_Remarks <> 'Fully Paid' AND PDC.PDC_Remarks <> 'Foreclosed') 
          OR PDC.PDC_Remarks = 'Replaced' 
          OR PDC.PDC_Remarks IS NULL 
          OR PDC.PDC_Remarks = '') 
        AND PDC.PDC_Status <> 'Pulled Out' 
        ${sWhere} 
        ${sSort}`;
  } else if (pdcField === "Date Received") {
    query = `
      SELECT 
      PDC.* ,
      date_format(PDC.Check_Date,'%m/%d/%Y') as cCheck_Date,
      date_format(PDC.Date,'%m/%d/%Y') as dDate
      FROM PDC 
      WHERE (PDC.Date >= '${formattedDateFrom}' AND PDC.Date <= '${formattedDateTo}')
        AND ((PDC.PDC_Remarks <> 'Fully Paid' AND PDC.PDC_Remarks <> 'Foreclosed') 
          OR PDC.PDC_Remarks = 'Replaced' 
          OR PDC.PDC_Remarks IS NULL 
          OR PDC.PDC_Remarks = '') 
        AND PDC.PDC_Status <> 'Pulled Out' 
        ${sWhere} 
        ${sSort}`;
  }

  return query;
}
export function PettyCashFundDisbursement(
  subAcct: string,
  from: string,
  to: string
) {
  let dtPettyCashQuery = "";
  let dtSummaryQuery = "";
  ``;

  if (subAcct === "ALL") {
    dtPettyCashQuery = `
      SELECT 
          concat(DATE_FORMAT(PC_Date, '%m/%d/%y'),'  ',PC_No) as DT,
          Payee,
          Explanation as particulars,
          DRPurpose as transaction,
          concat( IDNo,'\n',
          ShortName) as identity,
          DRShort,
          Debit,
          CRShort,
          Credit
      FROM petty_cash
      WHERE petty_cash.PC_No >= '${from}' AND petty_cash.PC_No <= '${to}'`;

    dtSummaryQuery = `
      SELECT Journal.GL_Acct, Chart_Account.Acct_Title AS Title, SUM(IFNULL(Journal.Debit, 0)) AS mDebit, SUM(IFNULL(Journal.Credit, 0)) AS mCredit
      FROM Journal
      LEFT JOIN Chart_Account ON Journal.GL_Acct = Chart_Account.Acct_Code
      WHERE Journal.Source_Type = 'PC' AND Journal.Source_No >= '${from}' AND Journal.Source_No <= '${to}'
      GROUP BY Journal.GL_Acct, Chart_Account.Acct_Title
      HAVING Journal.GL_Acct <> ''`;
  } else {
    dtPettyCashQuery = `
      SELECT
          concat(DATE_FORMAT(PC_Date, '%m/%d/%y'),'  ',PC_No) as DT,
          Payee,
          Explanation as particulars,
          DRPurpose as transaction,
          concat( IDNo,'\n',
          ShortName) as identity,
          DRShort,
          Debit,
          CRShort,
          Credit
      FROM petty_cash
      WHERE petty_cash.PC_No >= '${from}' AND petty_cash.PC_No <= '${to}' AND petty_cash.SubAcct = '${subAcct}'`;

    dtSummaryQuery = `
      SELECT Journal.GL_Acct, Chart_Account.Acct_Title AS Title, SUM(IFNULL(Journal.Debit, 0)) AS mDebit, SUM(IFNULL(Journal.Credit, 0)) AS mCredit
      FROM (
        SELECT PC_No
        FROM petty_cash
        WHERE petty_cash.PC_No >= '${from}' AND petty_cash.PC_No <= '${to}' AND petty_cash.SubAcct = '${subAcct}'
        GROUP BY PC_No
      ) AS PC
      INNER JOIN Journal ON Journal.Source_No = PC.PC_No
      LEFT JOIN Chart_Account ON Journal.GL_Acct = Chart_Account.Acct_Code
      WHERE Journal.Source_Type = 'PC' AND Journal.Source_No >= '${from}' AND Journal.Source_No <= '${to}'
      GROUP BY Journal.GL_Acct, Chart_Account.Acct_Title
      HAVING Journal.GL_Acct <> ''`;
  }

  return { dtPettyCashQuery, dtSummaryQuery };
}
export function CashDisbursementBook_CDB_GJB(
  reportType: string,
  subAccount: string,
  reportDate: Date,
  dateFilterType: string,
  sortOrder: string
) {
  let sourceType = "CV";
  let strSQL = "";
  let strSubSQL = "";
  let qryJournals = "";

  qryJournals = `
      SELECT
        date_format(a.Date_Entry,'%Y-%m-%d') as Date_Entry,
        concat(a.Source_Type,' - ',a.Source_No) as nST,
        a.Source_Type,
        a.Source_No,
        a.Explanation,
        b.Acct_Code,
        b.Acct_Title,
        concat(c.Acronym,' - ',c.ShortName) as subAcct,
        d.IDNo,
        d.Shortname as Name,
        format(a.Debit,2) as Debit,
        format(a.Credit,2) as Credit,
        a.TC,
        a.Payto
        FROM 
          cash_disbursement a 
            left join chart_account b on a.GL_Acct = b.Acct_Code
            left join sub_account c  on a.Sub_Acct = c.Sub_Acct
            left join ( SELECT 
            *
        FROM
            (
              SELECT 
              *
          FROM
              (SELECT 
                "Client" as IDType,
                aa.entry_client_id AS IDNo,
                aa.sub_account,
                if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                aa.entry_client_id as client_id  
                FROM
                  entry_client aa
                union all
                SELECT 
                "Agent" as IDType,
                aa.entry_agent_id AS IDNo,
                aa.sub_account,
                CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                aa.entry_agent_id as client_id  
                FROM
                  entry_agent aa
                union all
                SELECT 
                "Employee" as IDType,
                aa.entry_employee_id AS IDNo,
                aa.sub_account,
                CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                aa.entry_employee_id as client_id
                FROM
                  entry_employee aa
                union all
                SELECT 
                "Supplier" as IDType,
                aa.entry_supplier_id AS IDNo,
                aa.sub_account,
                if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                aa.entry_supplier_id as client_id
                FROM
                  entry_supplier aa
                union all
                SELECT 
                "Fixed Assets" as IDType,
                aa.entry_fixed_assets_id AS IDNo,
                aa.sub_account,
                aa.fullname AS Shortname,
                aa.entry_fixed_assets_id as client_id
                FROM
                  entry_fixed_assets aa
                union all
                SELECT 
                "Others" as IDType,
                aa.entry_others_id AS IDNo,
                aa.sub_account,
                aa.description AS Shortname,
                aa.entry_others_id as client_id
                FROM
                  entry_others aa) a
          WHERE
              a.IDNo NOT IN 
              (SELECT IDNo FROM   policy GROUP BY IDNo) 
          UNION ALL SELECT 
                  'Policy' AS IDType,
                  a.PolicyNo AS IDNo,
                  b.sub_account,
                  b.Shortname,
                  a.IDNo AS client_id
          FROM
                policy a
          LEFT JOIN (SELECT 
                "Client" as IDType,
                aa.entry_client_id AS IDNo,
                aa.sub_account,
                if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                aa.entry_client_id as client_id  
                FROM
                  entry_client aa
                union all
                SELECT 
                "Agent" as IDType,
                aa.entry_agent_id AS IDNo,
                aa.sub_account,
                CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                aa.entry_agent_id as client_id  
                FROM
                  entry_agent aa
                union all
                SELECT 
                "Employee" as IDType,
                aa.entry_employee_id AS IDNo,
                aa.sub_account,
                CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                aa.entry_employee_id as client_id
                FROM
                  entry_employee aa
                union all
                SELECT 
                "Supplier" as IDType,
                aa.entry_supplier_id AS IDNo,
                aa.sub_account,
                if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                aa.entry_supplier_id as client_id
                FROM
                  entry_supplier aa
                union all
                SELECT 
                "Fixed Assets" as IDType,
                aa.entry_fixed_assets_id AS IDNo,
                aa.sub_account,
                aa.fullname AS Shortname,
                aa.entry_fixed_assets_id as client_id
                FROM
                  entry_fixed_assets aa
                union all
                SELECT 
                "Others" as IDType,
                aa.entry_others_id AS IDNo,
                aa.sub_account,
                aa.description AS Shortname,
                aa.entry_others_id as client_id
                FROM
                  entry_others aa) b ON a.IDNo = b.IDNo
          WHERE
              a.PolicyNo NOT IN 
              (SELECT a.IDNo FROM (SELECT 
                "Client" as IDType,
                aa.entry_client_id AS IDNo,
                aa.sub_account,
                if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                aa.entry_client_id as client_id  
                FROM
                  entry_client aa
                union all
                SELECT 
                "Agent" as IDType,
                aa.entry_agent_id AS IDNo,
                aa.sub_account,
                CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                aa.entry_agent_id as client_id  
                FROM
                  entry_agent aa
                union all
                SELECT 
                "Employee" as IDType,
                aa.entry_employee_id AS IDNo,
                aa.sub_account,
                CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                aa.entry_employee_id as client_id
                FROM
                  entry_employee aa
                union all
                SELECT 
                "Supplier" as IDType,
                aa.entry_supplier_id AS IDNo,
                aa.sub_account,
                if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                aa.entry_supplier_id as client_id
                FROM
                  entry_supplier aa
                union all
                SELECT 
                "Fixed Assets" as IDType,
                aa.entry_fixed_assets_id AS IDNo,
                aa.sub_account,
                aa.fullname AS Shortname,
                aa.entry_fixed_assets_id as client_id
                FROM
                  entry_fixed_assets aa
                union all
                SELECT 
                "Others" as IDType,
                aa.entry_others_id AS IDNo,
                aa.sub_account,
                aa.description AS Shortname,
                aa.entry_others_id as client_id
                FROM
                  entry_others aa) a)
          ) a) d on a.ID_No = d.IDNo
            order by   a.Source_No ,RIGHT(b.Acct_Code, 2) asc 
      `;
  const formattedDate = format(reportDate, "yyyy-MM-dd");
  const formattedMonthStart = format(startOfMonth(reportDate), "yyyy-MM-dd");
  const formattedMonthEnd = format(endOfMonth(reportDate), "yyyy-MM-dd");

  if (dateFilterType === "Daily") {
    if (subAccount === "ALL") {
      strSQL = `
        SELECT qryJournal.* 
        FROM (${qryJournals}) qryJournal
        WHERE qryJournal.Source_Type = '${sourceType}' AND qryJournal.Date_Entry = '${formattedDate}'
       
      `;
      strSubSQL = `
        SELECT Journal.GL_Acct, ChartAccount.Acct_Title AS Title, format(SUM(IFNULL(Debit, 0)),2) AS mDebit, format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
        FROM Journal 
        LEFT JOIN Chart_Account ChartAccount ON Journal.GL_Acct = ChartAccount.Acct_Code 
        WHERE Journal.Source_Type = '${sourceType}' AND Journal.Date_Entry = '${formattedDate}'
        GROUP BY Journal.GL_Acct, ChartAccount.Acct_Title 
        HAVING Journal.GL_Acct <> ''
        ORDER BY Journal.GL_Acct
      `;
    } else {
      strSQL = `
        SELECT qryJournal.* 
        FROM (${qryJournals}) qryJournal
        WHERE qryJournal.Source_Type = '${sourceType}' AND qryJournal.Date_Entry = '${formattedDate}' AND TRIM(qryJournal.Area) = '${subAccount}'
       
      `;
      strSubSQL = `
        SELECT Journal.GL_Acct, ChartAccount.Acct_Title AS Title, SUM(IFNULL(Debit, 0)) AS mDebit, format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
        FROM Journal 
        LEFT JOIN Chart_Account ChartAccount ON Journal.GL_Acct = ChartAccount.Acct_Code 
        WHERE Journal.Source_Type = '${sourceType}' AND Journal.Date_Entry = '${formattedDate}' AND TRIM(Journal.Area) = '${subAccount}'
        GROUP BY Journal.GL_Acct, ChartAccount.Acct_Title 
        HAVING Journal.GL_Acct <> ''
        ORDER BY Journal.GL_Acct
      `;
    }
  } else {
    if (subAccount === "ALL") {
      strSQL = `
        SELECT qryJournal.* 
        FROM (${qryJournals}) qryJournal
        WHERE qryJournal.Source_Type = '${sourceType}' AND qryJournal.Date_Entry BETWEEN '${formattedMonthStart}' AND '${formattedMonthEnd}'
       
      `;
      strSubSQL = `
        SELECT Journal.GL_Acct, ChartAccount.Acct_Title AS Title, format(SUM(IFNULL(Debit, 0)),2) AS mDebit, format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
        FROM Journal 
        LEFT JOIN Chart_Account ChartAccount ON Journal.GL_Acct = ChartAccount.Acct_Code 
        WHERE Journal.Source_Type = '${sourceType}' AND Journal.Date_Entry BETWEEN '${formattedMonthStart}' AND '${formattedMonthEnd}'
        GROUP BY Journal.GL_Acct, ChartAccount.Acct_Title 
        HAVING Journal.GL_Acct <> ''
        ORDER BY Journal.GL_Acct
      `;
    } else {
      strSQL = `
        SELECT qryJournal.* 
        FROM (${qryJournals}) qryJournal
        WHERE qryJournal.Source_Type = '${sourceType}' AND qryJournal.Date_Entry BETWEEN '${formattedMonthStart}' AND '${formattedMonthEnd}' AND TRIM(qryJournal.Area) = '${subAccount}'
      `;
      strSubSQL = `
        SELECT Journal.GL_Acct, ChartAccount.Acct_Title AS Title, format(SUM(IFNULL(Debit, 0)),2) AS mDebit, format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
        FROM Journal 
        LEFT JOIN Chart_Account ChartAccount ON Journal.GL_Acct = ChartAccount.Acct_Code 
        WHERE Journal.Source_Type = '${sourceType}' AND Journal.Date_Entry BETWEEN '${formattedMonthStart}' AND '${formattedMonthEnd}' AND TRIM(Journal.Area) = '${subAccount}'
        GROUP BY Journal.GL_Acct, ChartAccount.Acct_Title 
        HAVING Journal.GL_Acct <> ''
        ORDER BY Journal.GL_Acct
      `;
    }
  }

  strSQL = `
    select 
        *,
      CASE WHEN @prev_source_no = a.Source_No THEN '' ELSE a.Source_No END AS nSource_No,
      CASE WHEN @prev_source_no = a.Source_No THEN '' ELSE a.Source_Type END AS nSource_Type,
      CASE WHEN @prev_source_no = a.Source_No THEN '' ELSE a.Date_Entry END AS nDate_Entry,
      CASE WHEN @prev_source_no = a.Source_No THEN '' ELSE a.Explanation END AS nExplanation,
      CASE WHEN @prev_source_no = a.Source_No THEN '0' ELSE '1' END AS nHeader,
      @prev_source_no := a.Source_No AS prev_source_no
    from
    (SELECT @prev_source_no := NULL) AS init
    JOIN (${strSQL}) a
  `;
  return { strSQL, strSubSQL };
}
export function CashDisbursementBook_GJB(
  reportType: string,
  subAccount: string,
  reportDate: Date,
  dateFilterType: string,
  sortOrder: string
) {
  let strSQL = "";
  let strSubSQL = "";
  const sourceType = "GL";
  const qryJournals = `
      SELECT 
        DATE_FORMAT(a.Date_Entry , '%Y-%m-%d') as Date_Entry,
        a.Source_Type,
        a.Source_No,
        a.Explanation,
        b.Acct_Code,
        b.Acct_Title,
        concat(e.Acronym,' - ',e.ShortName) as subAcct,	
        d.IDNo,
        d.Shortname as Name,
        format(a.Debit,2) as Debit,
        format(a.Credit,2) as Credit,
        a.TC,
        a.Payto
      FROM (
      select * from journal
      ) a 
      left join chart_account b on a.GL_Acct = b.Acct_Code
      left join ( SELECT 
              *
          FROM
              (
                SELECT 
                *
            FROM
                (SELECT 
                  "Client" as IDType,
                  aa.entry_client_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_client_id as client_id  
                  FROM
                    entry_client aa
                  union all
                  SELECT 
                  "Agent" as IDType,
                  aa.entry_agent_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_agent_id as client_id  
                  FROM
                    entry_agent aa
                  union all
                  SELECT 
                  "Employee" as IDType,
                  aa.entry_employee_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_employee_id as client_id
                  FROM
                    entry_employee aa
                  union all
                  SELECT 
                  "Supplier" as IDType,
                  aa.entry_supplier_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_supplier_id as client_id
                  FROM
                    entry_supplier aa
                  union all
                  SELECT 
                  "Fixed Assets" as IDType,
                  aa.entry_fixed_assets_id AS IDNo,
                  aa.sub_account,
                  aa.fullname AS Shortname,
                  aa.entry_fixed_assets_id as client_id
                  FROM
                    entry_fixed_assets aa
                  union all
                  SELECT 
                  "Others" as IDType,
                  aa.entry_others_id AS IDNo,
                  aa.sub_account,
                  aa.description AS Shortname,
                  aa.entry_others_id as client_id
                  FROM
                    entry_others aa) a
            WHERE
                a.IDNo NOT IN 
                (SELECT IDNo FROM   policy GROUP BY IDNo) 
            UNION ALL SELECT 
                    'Policy' AS IDType,
                    a.PolicyNo AS IDNo,
                    b.sub_account,
                    b.Shortname,
                    a.IDNo AS client_id
            FROM
                  policy a
            LEFT JOIN (SELECT 
                  "Client" as IDType,
                  aa.entry_client_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_client_id as client_id  
                  FROM
                    entry_client aa
                  union all
                  SELECT 
                  "Agent" as IDType,
                  aa.entry_agent_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_agent_id as client_id  
                  FROM
                    entry_agent aa
                  union all
                  SELECT 
                  "Employee" as IDType,
                  aa.entry_employee_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_employee_id as client_id
                  FROM
                    entry_employee aa
                  union all
                  SELECT 
                  "Supplier" as IDType,
                  aa.entry_supplier_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_supplier_id as client_id
                  FROM
                    entry_supplier aa
                  union all
                  SELECT 
                  "Fixed Assets" as IDType,
                  aa.entry_fixed_assets_id AS IDNo,
                  aa.sub_account,
                  aa.fullname AS Shortname,
                  aa.entry_fixed_assets_id as client_id
                  FROM
                    entry_fixed_assets aa
                  union all
                  SELECT 
                  "Others" as IDType,
                  aa.entry_others_id AS IDNo,
                  aa.sub_account,
                  aa.description AS Shortname,
                  aa.entry_others_id as client_id
                  FROM
                    entry_others aa) b ON a.IDNo = b.IDNo
            WHERE
                a.PolicyNo NOT IN 
                (SELECT a.IDNo FROM (SELECT 
                  "Client" as IDType,
                  aa.entry_client_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_client_id as client_id  
                  FROM
                    entry_client aa
                  union all
                  SELECT 
                  "Agent" as IDType,
                  aa.entry_agent_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_agent_id as client_id  
                  FROM
                    entry_agent aa
                  union all
                  SELECT 
                  "Employee" as IDType,
                  aa.entry_employee_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_employee_id as client_id
                  FROM
                    entry_employee aa
                  union all
                  SELECT 
                  "Supplier" as IDType,
                  aa.entry_supplier_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_supplier_id as client_id
                  FROM
                    entry_supplier aa
                  union all
                  SELECT 
                  "Fixed Assets" as IDType,
                  aa.entry_fixed_assets_id AS IDNo,
                  aa.sub_account,
                  aa.fullname AS Shortname,
                  aa.entry_fixed_assets_id as client_id
                  FROM
                    entry_fixed_assets aa
                  union all
                  SELECT 
                  "Others" as IDType,
                  aa.entry_others_id AS IDNo,
                  aa.sub_account,
                  aa.description AS Shortname,
                  aa.entry_others_id as client_id
                  FROM
                    entry_others aa) a)
            ) a) d on a.ID_No = d.IDNo
      left join sub_account e on e.Sub_Acct = d.sub_account
      `;

  const formattedDate = format(reportDate, "yyyy-MM-dd");
  const formattedMonthStart = format(startOfMonth(reportDate), "yyyy-MM-dd");
  const formattedMonthEnd = format(endOfMonth(reportDate), "yyyy-MM-dd");

  if (dateFilterType === "Daily") {
    if (subAccount === "ALL") {
      strSQL = `
        SELECT qryJournal.* 
        FROM (${qryJournals}) qryJournal
        WHERE qryJournal.Source_Type = '${sourceType}' AND date_format(qryJournal.Date_Entry,'%Y-%m-%d') = '${formattedDate}'
       
      `;
      strSubSQL = `
        SELECT Journal.GL_Acct, ChartAccount.Acct_Title AS Title, format(SUM(IFNULL(Debit, 0)),2) AS mDebit, format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
        FROM Journal 
        LEFT JOIN Chart_Account ChartAccount ON Journal.GL_Acct = ChartAccount.Acct_Code 
        WHERE Journal.Source_Type = '${sourceType}' AND Journal.Date_Entry = '${formattedDate}'
        GROUP BY Journal.GL_Acct, ChartAccount.Acct_Title 
        HAVING Journal.GL_Acct <> ''
        ORDER BY Journal.GL_Acct
      `;
    } else {
      strSQL = `
        SELECT qryJournal.* 
        FROM (${qryJournals}) qryJournal
        WHERE qryJournal.Source_Type = '${sourceType}' AND date_format(qryJournal.Date_Entry,'%Y-%m-%d') = '${formattedDate}' AND TRIM(qryJournal.Area) = '${subAccount}'
       
      `;
      strSubSQL = `
        SELECT Journal.GL_Acct, ChartAccount.Acct_Title AS Title, SUM(IFNULL(Debit, 0)) AS mDebit, format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
        FROM Journal 
        LEFT JOIN Chart_Account ChartAccount ON Journal.GL_Acct = ChartAccount.Acct_Code 
        WHERE Journal.Source_Type = '${sourceType}' AND Journal.Date_Entry = '${formattedDate}' AND TRIM(Journal.Area) = '${subAccount}'
        GROUP BY Journal.GL_Acct, ChartAccount.Acct_Title 
        HAVING Journal.GL_Acct <> ''
        ORDER BY Journal.GL_Acct
      `;
    }
  } else {
    if (subAccount === "ALL") {
      strSQL = `
        SELECT qryJournal.* 
        FROM (${qryJournals}) qryJournal
        WHERE qryJournal.Source_Type = '${sourceType}' AND date_format(qryJournal.Date_Entry,'%Y-%m-%d') >= '${formattedMonthStart}' AND date_format(qryJournal.Date_Entry,'%Y-%m-%d') <='${formattedMonthEnd}'
       
      `;
      strSubSQL = `
        SELECT Journal.GL_Acct, ChartAccount.Acct_Title AS Title, format(SUM(IFNULL(Debit, 0)),2) AS mDebit, format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
        FROM Journal 
        LEFT JOIN Chart_Account ChartAccount ON Journal.GL_Acct = ChartAccount.Acct_Code 
        WHERE Journal.Source_Type = '${sourceType}' AND Journal.Date_Entry BETWEEN '${formattedMonthStart}' AND '${formattedMonthEnd}'
        GROUP BY Journal.GL_Acct, ChartAccount.Acct_Title 
        HAVING Journal.GL_Acct <> ''
        ORDER BY Journal.GL_Acct
      `;
    } else {
      strSQL = `
        SELECT qryJournal.* 
        FROM (${qryJournals}) qryJournal
        WHERE qryJournal.Source_Type = '${sourceType}' AND date_format(qryJournal.Date_Entry,'%Y-%m-%d') >= '${formattedMonthStart}' AND  date_format(qryJournal.Date_Entry,'%Y-%m-%d') <= '${formattedMonthEnd}' AND TRIM(qryJournal.Area) = '${subAccount}'
      `;
      strSubSQL = `
        SELECT Journal.GL_Acct, ChartAccount.Acct_Title AS Title, format(SUM(IFNULL(Debit, 0)),2) AS mDebit, format(SUM(IFNULL(Credit, 0)),2) AS mCredit 
        FROM Journal 
        LEFT JOIN Chart_Account ChartAccount ON Journal.GL_Acct = ChartAccount.Acct_Code 
        WHERE Journal.Source_Type = '${sourceType}' AND Journal.Date_Entry BETWEEN '${formattedMonthStart}' AND '${formattedMonthEnd}' AND TRIM(Journal.Area) = '${subAccount}'
        GROUP BY Journal.GL_Acct, ChartAccount.Acct_Title 
        HAVING Journal.GL_Acct <> ''
        ORDER BY Journal.GL_Acct
      `;
    }
  }

  strSQL = `
    select 
        *,
      CASE WHEN @prev_source_no = a.Source_No THEN '' ELSE a.Source_No END AS nSource_No,
      CASE WHEN @prev_source_no = a.Source_No THEN '' ELSE 'JV' END AS nSource_Type,
      CASE WHEN @prev_source_no = a.Source_No THEN '' ELSE date_format( a.Date_Entry,'%m-%d-%Y') END AS nDate_Entry,
      CASE WHEN @prev_source_no = a.Source_No THEN '' ELSE a.Explanation END AS nExplanation,
      CASE WHEN @prev_source_no = a.Source_No THEN '0' ELSE '1' END AS nHeader,
      @prev_source_no := a.Source_No AS prev_source_no
    from 
    (SELECT @prev_source_no := NULL) AS init
    JOIN (${strSQL}) a
    ORDER BY 
  a.Date_Entry, a.Source_No, a.Debit
  `;
  return { strSQL, strSubSQL };
}
export function ProductionBook(
  sortType: string,
  sortOrder: string,
  reportType: string,
  reportDate: Date,
  subAccount: string
) {
  let sSort = "";
  let sWhere = "";

  // Construct sSort based on sortType and sortOrder
  if (sortType === "Date Issued") {
    sSort = ` ORDER BY a.DateIssued, a.PolicyNo ${sortOrder}`;
  } else if (sortType === "Policy No") {
    sSort = ` ORDER BY a.PolicyNo ${sortOrder}`;
  }

  // Format dates
  const formattedDate = format(reportDate, "yyyy-MM-dd");
  const formattedMonthStart = format(startOfMonth(reportDate), "yyyy-MM-dd");
  const formattedMonthEnd = format(endOfMonth(reportDate), "yyyy-MM-dd");

  // Construct sWhere based on reportType and reportDate
  if (reportType === "Daily") {
    sWhere = `AND a.DateIssued >= '${formattedDate}' AND a.DateIssued <= '${formattedDate}' `;
  } else if (reportType === "Monthly") {
    sWhere = `AND a.DateIssued >= '${formattedMonthStart}' AND a.DateIssued <= '${formattedMonthEnd}' `;
  }

  // Add subAccount to sWhere if applicable
  if (subAccount !== "ALL" && subAccount !== "Reports") {
    sWhere += `AND a.SubAcct = '${subAccount}' `;
  }

  // SQL queries
  let strSQL = `
      SELECT 
          date_format(a.DateIssued,'%m-%d-%Y') as DateIssued, 
          a.PolicyNo, 
          b.Explanation, 
          e.Acct_Code, 
          e.Short, 
          CONCAT(d.Acronym, ' - ', d.ShortName) AS SubAcct, 
          c.Shortname, 
          format(b.Debit,2) as Debit, 
          format(b.Credit,2) as Credit, 
          b.TC
      FROM Policy a
      LEFT JOIN Journal b ON b.ID_No = a.PolicyNo
       left join ( SELECT 
              *
          FROM
              (
                SELECT 
                *
            FROM
                (SELECT 
                  "Client" as IDType,
                  aa.entry_client_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_client_id as client_id  
                  FROM
                    entry_client aa
                  union all
                  SELECT 
                  "Agent" as IDType,
                  aa.entry_agent_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_agent_id as client_id  
                  FROM
                    entry_agent aa
                  union all
                  SELECT 
                  "Employee" as IDType,
                  aa.entry_employee_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_employee_id as client_id
                  FROM
                    entry_employee aa
                  union all
                  SELECT 
                  "Supplier" as IDType,
                  aa.entry_supplier_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_supplier_id as client_id
                  FROM
                    entry_supplier aa
                  union all
                  SELECT 
                  "Fixed Assets" as IDType,
                  aa.entry_fixed_assets_id AS IDNo,
                  aa.sub_account,
                  aa.fullname AS Shortname,
                  aa.entry_fixed_assets_id as client_id
                  FROM
                    entry_fixed_assets aa
                  union all
                  SELECT 
                  "Others" as IDType,
                  aa.entry_others_id AS IDNo,
                  aa.sub_account,
                  aa.description AS Shortname,
                  aa.entry_others_id as client_id
                  FROM
                    entry_others aa) a
            WHERE
                a.IDNo NOT IN 
                (SELECT IDNo FROM   policy GROUP BY IDNo) 
            UNION ALL SELECT 
                    'Policy' AS IDType,
                    a.PolicyNo AS IDNo,
                    b.sub_account,
                    b.Shortname,
                    a.IDNo AS client_id
            FROM
                  policy a
            LEFT JOIN (SELECT 
                  "Client" as IDType,
                  aa.entry_client_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_client_id as client_id  
                  FROM
                    entry_client aa
                  union all
                  SELECT 
                  "Agent" as IDType,
                  aa.entry_agent_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_agent_id as client_id  
                  FROM
                    entry_agent aa
                  union all
                  SELECT 
                  "Employee" as IDType,
                  aa.entry_employee_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_employee_id as client_id
                  FROM
                    entry_employee aa
                  union all
                  SELECT 
                  "Supplier" as IDType,
                  aa.entry_supplier_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_supplier_id as client_id
                  FROM
                    entry_supplier aa
                  union all
                  SELECT 
                  "Fixed Assets" as IDType,
                  aa.entry_fixed_assets_id AS IDNo,
                  aa.sub_account,
                  aa.fullname AS Shortname,
                  aa.entry_fixed_assets_id as client_id
                  FROM
                    entry_fixed_assets aa
                  union all
                  SELECT 
                  "Others" as IDType,
                  aa.entry_others_id AS IDNo,
                  aa.sub_account,
                  aa.description AS Shortname,
                  aa.entry_others_id as client_id
                  FROM
                    entry_others aa) b ON a.IDNo = b.IDNo
            WHERE
                a.PolicyNo NOT IN 
                (SELECT a.IDNo FROM (SELECT 
                  "Client" as IDType,
                  aa.entry_client_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_client_id as client_id  
                  FROM
                    entry_client aa
                  union all
                  SELECT 
                  "Agent" as IDType,
                  aa.entry_agent_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_agent_id as client_id  
                  FROM
                    entry_agent aa
                  union all
                  SELECT 
                  "Employee" as IDType,
                  aa.entry_employee_id AS IDNo,
                  aa.sub_account,
                  CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
                  aa.entry_employee_id as client_id
                  FROM
                    entry_employee aa
                  union all
                  SELECT 
                  "Supplier" as IDType,
                  aa.entry_supplier_id AS IDNo,
                  aa.sub_account,
                  if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
                  aa.entry_supplier_id as client_id
                  FROM
                    entry_supplier aa
                  union all
                  SELECT 
                  "Fixed Assets" as IDType,
                  aa.entry_fixed_assets_id AS IDNo,
                  aa.sub_account,
                  aa.fullname AS Shortname,
                  aa.entry_fixed_assets_id as client_id
                  FROM
                    entry_fixed_assets aa
                  union all
                  SELECT 
                  "Others" as IDType,
                  aa.entry_others_id AS IDNo,
                  aa.sub_account,
                  aa.description AS Shortname,
                  aa.entry_others_id as client_id
                  FROM
                    entry_others aa) a)
            ) a) c on a.PolicyNo = c.IDNo
      left join sub_account d on d.Sub_Acct = c.sub_account 
      left join chart_account e on b.GL_Acct = e.Acct_Code
      WHERE Source_Type IN ('PL') AND b.cID_No <> 'S P O I L T' 
      ${sWhere} ${sSort}`;

  strSQL = `
    select 
        *,
      CASE WHEN @prev_source_no = a.PolicyNo THEN '' ELSE a.DateIssued END AS nDate_Entry,
      CASE WHEN @prev_source_no = a.PolicyNo THEN '' ELSE a.PolicyNo END AS nSource_No,
      CASE WHEN @prev_source_no = a.PolicyNo THEN '' ELSE a.Explanation END AS nExplanation,
      CASE WHEN @prev_source_no = a.PolicyNo THEN '0' ELSE '1' END AS nHeader,
      @prev_source_no := a.PolicyNo AS prev_source_no
    from 
     (SELECT @prev_source_no := NULL) AS init
    JOIN (${strSQL}) a
    
    `;

  const strSubSQL = `
      SELECT 
      b.cGL_Acct, 
      format(SUM(b.Debit),2) AS Debit, 
      format(SUM(b.Credit),2) AS Credit 
      FROM Policy a
      INNER JOIN Journal b ON b.ID_No = a.PolicyNo
      WHERE Source_Type IN ('PL') AND b.cID_No <> 'S P O I L T' 
      ${sWhere} 
      GROUP BY b.cGL_Acct`;

  return { strSQL, strSubSQL };
}
export function VATBook(
  sortType: string,
  sortOrder: string,
  reportType: string,
  reportDate: Date,
  subAccount: string
) {
  let sSort = "";
  let sWhere = "";

  // Construct sSort based on sortType and sortOrder
  if (sortType === "Date") {
    sSort = ` ORDER BY a.Date_Entry, (a.Source_Type + ' ' + a.Source_No) ${sortOrder}`;
  } else if (sortType === "Payee") {
    sSort = ` ORDER BY (a.Source_Type + ' ' + a.Source_No) ${sortOrder}`;
  }

  // Format dates
  const formattedDate = format(reportDate, "yyyy-MM-dd");
  const formattedMonthStart = format(startOfMonth(reportDate), "yyyy-MM-dd");
  const formattedMonthEnd = format(endOfMonth(reportDate), "yyyy-MM-dd");

  // Construct sWhere based on reportType and reportDate
  if (reportType === "Daily") {
    sWhere = `AND a.Date_Entry >= '${formattedDate}' AND a.Date_Entry <= '${formattedDate}' `;
  } else if (reportType === "Monthly") {
    sWhere = `AND a.Date_Entry >= '${formattedMonthStart}' AND a.Date_Entry <= '${formattedMonthEnd}' `;
  }

  // Add subAccount to sWhere if applicable
  if (subAccount !== "ALL" && subAccount !== "Reports") {
    sWhere += `AND a.Sub_Acct = '${subAccount}' `;
  }

  // SQL queries
  const strSQL = `
      SELECT a.Date_Entry, (a.Source_Type + ' ' + a.Source_No) AS SourceNo, a.GL_Acct, a.cGL_Acct, a.Sub_Acct, 
             IFNULL(a.cID_No, '') AS ID, a.Debit, a.Credit, IFNULL(a.TC, '') AS TC
      FROM Journal a 
      WHERE a.Source_Type NOT IN ('BFD', 'BF', 'BFS') 
      ${sWhere} AND (a.Source_Type + ' ' + a.Source_No) IN (
          SELECT (Source_Type + ' ' + Source_No) 
          FROM Journal  
          WHERE GL_Acct IN ('1.06.02', '4.05.09')
      ) ${sSort}`;

  const strSubSQL = `
      SELECT a.cGL_Acct, SUM(a.Debit) AS Debit, SUM(a.Credit) AS Credit
      FROM Journal a 
      WHERE a.Source_Type NOT IN ('BFD', 'BF', 'BFS') 
      ${sWhere} AND (a.Source_Type + ' ' + a.Source_No) IN (
          SELECT (Source_Type + ' ' + Source_No) 
          FROM Journal  
          WHERE GL_Acct IN ('1.06.02', '4.05.09')
      )
      GROUP BY a.cGL_Acct`;

  return { strSQL, strSubSQL };
}
export function AgingAccountsReport(date: Date, type: string) {
  const formattedDate = format(new Date(date), "yyyy-MM-dd");
  let query = "";

  const ID_Entry = `
    SELECT 
      "Client" as IDType,
      aa.entry_client_id AS IDNo,
      aa.sub_account,
      if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
      aa.entry_client_id as client_id  
    FROM
      entry_client aa
    union all
    SELECT 
      "Agent" as IDType,
      aa.entry_agent_id AS IDNo,
      aa.sub_account,
      CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
      aa.entry_agent_id as client_id  
    FROM
      entry_agent aa
    union all
    SELECT 
      "Employee" as IDType,
      aa.entry_employee_id AS IDNo,
      aa.sub_account,
      CONCAT(aa.lastname, ",", aa.firstname) AS Shortname,
      aa.entry_employee_id as client_id
    FROM
      entry_employee aa
    union all
    SELECT 
      "Supplier" as IDType,
      aa.entry_supplier_id AS IDNo,
      aa.sub_account,
      if(aa.company = "", CONCAT(aa.lastname, ",", aa.firstname), aa.company) as Shortname,
      aa.entry_supplier_id as client_id
    FROM
      entry_supplier aa
    union all
    SELECT 
      "Fixed Assets" as IDType,
      aa.entry_fixed_assets_id AS IDNo,
      aa.sub_account,
      aa.fullname AS Shortname,
      aa.entry_fixed_assets_id as client_id
    FROM
      entry_fixed_assets aa
    union all
    SELECT 
    "Others" as IDType,
      aa.entry_others_id AS IDNo,
      aa.sub_account,
      aa.description AS Shortname,
      aa.entry_others_id as client_id
    FROM
      entry_others aa
  `;
  if (type === "Regular") {
    query = `
            SELECT
                ID_Entry.IDNo,
                ID_Entry.Shortname,
                Policy.PolicyNo,
                CASE 
                    WHEN MPolicy.SubjectInsured IS NOT NULL THEN MPolicy.SubjectInsured
                    WHEN FPolicy.PropertyInsured IS NOT NULL THEN FPolicy.PropertyInsured
                    WHEN BPolicy.Obligee IS NOT NULL THEN BPolicy.Obligee
                    WHEN MSPRPolicy.Location IS NOT NULL THEN MSPRPolicy.Location
                    WHEN PAPolicy.Location IS NOT NULL THEN PAPolicy.Location
                    WHEN CGLPolicy.Location IS NOT NULL THEN CGLPolicy.Location
                    ELSE (concat(VPolicy.Make,' ',VPolicy.BodyType))
                END AS UnitInssured,
                Policy.DateIssued,
                CASE 
                    WHEN MPolicy.InsuredValue IS NOT NULL THEN MPolicy.InsuredValue
                    WHEN FPolicy.InsuredValue IS NOT NULL THEN FPolicy.InsuredValue
                    WHEN BPolicy.BondValue IS NOT NULL THEN BPolicy.BondValue
                    WHEN MSPRPolicy.SecII IS NOT NULL THEN MSPRPolicy.SecII
                    WHEN CGLPolicy.LimitA IS NOT NULL THEN CGLPolicy.LimitA
                    WHEN VPolicy.EstimatedValue IS NOT NULL THEN VPolicy.EstimatedValue
                END AS EstimatedValue,
                Policy.TotalDue,
                IFNULL((CASE WHEN Policy.TotalDue - Payment.Balance < 0 THEN 0 ELSE Policy.TotalDue - Payment.Balance END), 0) AS TotalPaid,
                IFNULL(Payment.Balance, Policy.TotalDue) AS Balance,
                Policy.Discount,
                Policy.AgentCom,
                IFNULL(VPolicy.Mortgagee, FPolicy.Mortgage) AS Remarks
            FROM
                Policy 
                RIGHT OUTER JOIN (
                    SELECT ID_No, (IFNULL(SUM(Debit), 0) - IFNULL(SUM(Credit), 0)) AS Balance
                    FROM Journal
                    WHERE GL_Acct = '1.03.01' AND ((Source_Type) <> 'BFD' AND (Source_Type) <> 'BF' AND (Source_Type) <> 'BFS') AND Date_Entry <= '${formattedDate}'
                    GROUP BY ID_No
                ) Payment ON Policy.PolicyNo = Payment.ID_No
                LEFT OUTER JOIN FPolicy  ON Policy.PolicyNo = FPolicy.PolicyNo
                LEFT OUTER JOIN VPolicy  ON Policy.PolicyNo = VPolicy.PolicyNo
                LEFT OUTER JOIN MPolicy  ON Policy.PolicyNo = MPolicy.PolicyNo
                LEFT OUTER JOIN BPolicy  ON Policy.PolicyNo = BPolicy.PolicyNo
                LEFT OUTER JOIN MSPRPolicy  ON Policy.PolicyNo = MSPRPolicy.PolicyNo
                LEFT OUTER JOIN PAPolicy  ON Policy.PolicyNo = PAPolicy.PolicyNo
                LEFT OUTER JOIN CGLPolicy  ON Policy.PolicyNo = CGLPolicy.PolicyNo
                LEFT OUTER JOIN (${ID_Entry}) ID_Entry  ON Policy.IDNo = ID_Entry.IDNo
            WHERE
                (Policy.PolicyNo IS NOT NULL) AND
                (CAST(Policy.DateIssued AS DATE) <= CAST('${formattedDate}' AS DATE)) AND
                (IFNULL(Payment.Balance, Policy.TotalDue) <> 0) AND
                ID_Entry.Shortname <> 'S P O I L T' AND (Policy.PolicyNo NOT LIKE '%TP-%')
            ORDER BY
                Policy.DateIssued,
                Policy.PolicyNo
        `;
  } else if (type === "Temporary") {
    query = `
            SELECT
                ID_Entry.IDNo,
                ID_Entry.Shortname,
                Policy.PolicyNo,
                CASE 
                    WHEN MPolicy.SubjectInsured IS NOT NULL THEN MPolicy.SubjectInsured
                    WHEN FPolicy.PropertyInsured IS NOT NULL THEN FPolicy.PropertyInsured
                    WHEN BPolicy.Obligee IS NOT NULL THEN BPolicy.Obligee
                    WHEN MSPRPolicy.Location IS NOT NULL THEN MSPRPolicy.Location
                    WHEN PAPolicy.Location IS NOT NULL THEN PAPolicy.Location
                    WHEN CGLPolicy.Location IS NOT NULL THEN CGLPolicy.Location
                    ELSE (concat(VPolicy.Make,' ',VPolicy.BodyType))
                END AS UnitInssured,
                Policy.DateIssued,
                CASE 
                    WHEN MPolicy.InsuredValue IS NOT NULL THEN MPolicy.InsuredValue
                    WHEN FPolicy.InsuredValue IS NOT NULL THEN FPolicy.InsuredValue
                    WHEN BPolicy.BondValue IS NOT NULL THEN BPolicy.BondValue
                    WHEN MSPRPolicy.SecII IS NOT NULL THEN MSPRPolicy.SecII
                    WHEN CGLPolicy.LimitA IS NOT NULL THEN CGLPolicy.LimitA
                    WHEN VPolicy.EstimatedValue IS NOT NULL THEN VPolicy.EstimatedValue
                END AS EstimatedValue,
                Policy.TotalDue,
                IFNULL((CASE WHEN Policy.TotalDue - Payment.Balance < 0 THEN 0 ELSE Policy.TotalDue - Payment.Balance END), 0) AS TotalPaid,
                IFNULL(Payment.Balance, Policy.TotalDue) AS Balance,
                Policy.Discount,
                Policy.AgentCom,
                IFNULL(VPolicy.Mortgagee, FPolicy.Mortgage) AS Remarks
            FROM
                Policy 
                RIGHT OUTER JOIN (
                    SELECT ID_No, (IFNULL(SUM(Debit), 0) - IFNULL(SUM(Credit), 0)) AS Balance
                    FROM Journal
                    WHERE GL_Acct = '1.03.03' AND ((Source_Type) <> 'BFD' AND (Source_Type) <> 'BF' AND (Source_Type) <> 'BFS') AND Date_Entry <= '${formattedDate}'
                    GROUP BY ID_No
                ) Payment ON Policy.PolicyNo = Payment.ID_No
                LEFT OUTER JOIN FPolicy  ON Policy.PolicyNo = FPolicy.PolicyNo
                LEFT OUTER JOIN VPolicy  ON Policy.PolicyNo = VPolicy.PolicyNo
                LEFT OUTER JOIN MPolicy  ON Policy.PolicyNo = MPolicy.PolicyNo
                LEFT OUTER JOIN BPolicy  ON Policy.PolicyNo = BPolicy.PolicyNo
                LEFT OUTER JOIN MSPRPolicy  ON Policy.PolicyNo = MSPRPolicy.PolicyNo
                LEFT OUTER JOIN PAPolicy  ON Policy.PolicyNo = PAPolicy.PolicyNo
                LEFT OUTER JOIN CGLPolicy  ON Policy.PolicyNo = CGLPolicy.PolicyNo
                LEFT OUTER JOIN (${ID_Entry}) ID_Entry  ON Policy.IDNo = ID_Entry.IDNo
            WHERE
                (Policy.PolicyNo IS NOT NULL) AND
                (CAST(Policy.DateIssued AS DATE) <= CAST('${formattedDate}' AS DATE)) AND
                (IFNULL(Payment.Balance, Policy.TotalDue) <> 0) AND
                ID_Entry.Shortname <> 'S P O I L T' AND (Policy.PolicyNo LIKE '%TP-%')
            ORDER BY
                Policy.DateIssued,
                Policy.PolicyNo
        `;
  }

  query = `
    select 
        a.*,
        date_format(a.DateIssued,'%d/%m/%Y') as _DateIssued,
        CAST(ROW_NUMBER() OVER (ORDER BY  a.DateIssued,
                a.PolicyNo) AS CHAR) AS Row_Num,
        if(a.EstimatedValue > 0 , format(a.EstimatedValue,2),format(0,2) )  as  _EstimatedValue,
        format(a.TotalDue,2) as  _TotalDue,
        format(a.TotalPaid,2) as  _TotalPaid,
        format(abs(a.Balance),2) as  _Balance,
        format(a.Discount,2) as  _Discount,
        format(a.AgentCom,2) as  _AgentCom,
        CASE
            WHEN abs(DATEDIFF(CURDATE(), a.DateIssued)) > 90  THEN format((abs(DATEDIFF(CURDATE(), a.DateIssued)) - 90),0)
            ELSE format(0,0)
        END AS due_days
    from ( ${query} ) a
   
  `;

  return query;
}
