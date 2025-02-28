export function clients_view() {
    return `
  select * from (SELECT 
    if(aa.option = "individual", CONCAT(IF(aa.lastname is not null and trim(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''),aa.firstname), aa.company) as ShortName,
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
    CONCAT(IF(aa.lastname is not null and trim(aa.lastname) <> '', CONCAT(aa.lastname, ', '),''), aa.firstname) AS ShortName,
    aa.entry_agent_id AS IDNo,
    aa.firstname,
    aa.middlename,
    NULL AS company,
    aa.address,
    NULL AS options,
    NULL AS sub_account,
    aa.createdAt,
    aa.update AS updatedAt,
    aa.agent_contact_details_id AS contact_details_id,
    NULL AS description,
    NULL AS remarks,
	NULL AS VAT_Type,
    NULL AS tin_no
FROM
    entry_agent aa 
UNION ALL SELECT 
    CONCAT(IF(aa.lastname is not null and trim(aa.lastname) <> '', CONCAT(aa.lastname, ', '),''), aa.firstname) AS ShortName,
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
    if(aa.option = "individual", CONCAT(IF(aa.lastname is not null and trim(aa.lastname) <> '',  CONCAT(aa.lastname, ', '), ''),aa.firstname), aa.company) as ShortName,
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
    entry_supplier aa) id_entry`;
}

export function qryJournal() {

    const qry = `
            SELECT 
    Journal.Branch_Code,
    CASE
        WHEN
            Journal.Source_Type = 'BFD'
                OR Journal.Source_Type = 'AB'
                OR Journal.Source_Type = 'BF'
                OR Journal.Source_Type = 'BFS'
        THEN
            DATE_ADD(Journal.Date_Entry,
                INTERVAL 1 DAY)
        ELSE Journal.Date_Entry
    END AS Date_Query,
    Journal.Date_Entry,
    Journal.Source_Type,
    Journal.Source_No,
    Journal.Explanation,
    Journal.Payto,
    Journal.GL_Acct,
    \`Chart Account\`.Acct_Title AS mShort,
    \`Chart Account\`.Short,
    Journal.ID_No,
    Journal.Check_Collect,
    Journal.Check_Date,
    Journal.Check_No AS \`Checked\`,
    Journal.Check_Bank AS Bank,
    Journal.Check_Return,
    Journal.Check_Deposit,
    Journal.Check_Reason,
    Journal.Debit AS mDebit,
    Journal.Credit AS mCredit,
    Journal.TC,
    Journal.Remarks,
    Books.\`Books_Desc\`,
    Books.\`Hide_Code\`,
    Books.Number,
    Books.\`Book_Code\`,
    Journal.Sub_Acct,
    IFNULL(SubAccount.ShortName, '') AS mSub_Acct,
    IFNULL(\`ID Entry\`.Shortname, '') AS mID,
    Journal.AutoNo AS Auto,
    Journal.Check_No
FROM
    chart_account AS \`Chart Account\` RIGHT OUTER JOIN
    (SELECT 
        id_entry.IDNo,
            IFNULL(b.Acronym, 'HO') AS Sub_Acct,
            IFNULL(b.ShortName, 'Head Office') AS ShortName,
            id_entry.ShortName AS client_name
    FROM
        (SELECT 
        IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
            aa.entry_client_id AS IDNo,
            aa.sub_account
    FROM
        entry_client aa UNION ALL SELECT 
        CONCAT(IF(aa.lastname IS NOT NULL
                AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
            aa.entry_agent_id AS IDNo,
            aa.sub_account
    FROM
        entry_agent aa UNION ALL SELECT 
        CONCAT(IF(aa.lastname IS NOT NULL
                AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
            aa.entry_employee_id AS IDNo,
            aa.sub_account
    FROM
        entry_employee aa UNION ALL SELECT 
        aa.fullname AS ShortName,
            aa.entry_fixed_assets_id AS IDNo,
            sub_account
    FROM
        entry_fixed_assets aa UNION ALL SELECT 
        aa.description AS ShortName,
            aa.entry_others_id AS IDNo,
            aa.sub_account
    FROM
        entry_others aa UNION ALL SELECT 
        IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
            aa.entry_supplier_id AS IDNo,
            aa.sub_account
    FROM
        entry_supplier aa) id_entry
    LEFT JOIN sub_account b ON id_entry.sub_account = b.Sub_Acct) 
    \`ID Entry\` RIGHT OUTER JOIN
	journal AS Journal LEFT OUTER JOIN
	policy AS Policy ON Journal.ID_No = Policy.PolicyNo ON \`ID Entry\`.IDNo = Journal.ID_No LEFT OUTER JOIN
	sub_account AS SubAccount ON Journal.Sub_Acct = SubAccount.Sub_Acct ON \`Chart Account\`.Acct_Code = Journal.GL_Acct LEFT OUTER JOIN
	books AS Books ON Journal.Source_Type = Books.Code
        `
    return qry;
}


export function xID_Sub_Entry() {

    return `
    select * from (
        SELECT 
            id_entry.IDNo,
            id_entry.cID_No,
            b.ShortName,
            b.Acronym AS Sub_Acct,
            b.Sub_Acct AS sub_id
        FROM
            (SELECT 
                a.entry_client_id as IDNo,
                    sub_account,
                    IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                        AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
            FROM
                entry_client a UNION ALL SELECT 
                a.entry_supplier_id as IDNo,
                    sub_account,
                    IF(a.option = 'company', a.company, IF(a.lastname IS NOT NULL
                        AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename))) AS cID_No
            FROM
                entry_supplier a UNION ALL SELECT 
                a.entry_employee_id as IDNo,
                    sub_account,
                    IF(a.lastname IS NOT NULL
                        AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
            FROM
                entry_employee a UNION ALL SELECT 
                a.entry_fixed_assets_id as IDNo, sub_account, a.fullname AS cID_No
            FROM
                entry_fixed_assets a UNION ALL SELECT 
                a.entry_others_id as IDNo, sub_account, a.description AS cID_No
            FROM
                entry_others a UNION ALL SELECT 
                a.entry_agent_id as IDNo,
                    sub_account,
                    IF(a.lastname IS NOT NULL
                        AND TRIM(a.lastname) = '', CONCAT(a.firstname, ' ', a.middlename), CONCAT(a.lastname, ', ', a.firstname, ' ', a.middlename)) AS cID_No
            FROM
                entry_agent a) id_entry
                LEFT JOIN
            sub_account b ON id_entry.sub_account = b.Sub_Acct
        ) xID_Sub_Entry
    `
}


export function qry_id_policy_sub() {
    const IDEntry = `
            SELECT 
            id_entry.IDNo,
            IFNULL(b.Acronym, 'HO') AS Sub_Acct,
            IFNULL(b.ShortName, 'Head Office') AS ShortName,
            id_entry.ShortName as client_name
        FROM
            (SELECT 
                IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                        AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
                    aa.entry_client_id AS IDNo,
                    aa.sub_account
            FROM
                entry_client aa UNION ALL SELECT 
                CONCAT(IF(aa.lastname IS NOT NULL
                        AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
                    aa.entry_agent_id AS IDNo,
                    aa.sub_account
            FROM
                entry_agent aa UNION ALL SELECT 
                CONCAT(IF(aa.lastname IS NOT NULL
                        AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname) AS ShortName,
                    aa.entry_employee_id AS IDNo,
                    aa.sub_account
            FROM
                entry_employee aa UNION ALL SELECT 
                aa.fullname AS ShortName,
                    aa.entry_fixed_assets_id AS IDNo,
                    sub_account
            FROM
                entry_fixed_assets aa UNION ALL SELECT 
                aa.description AS ShortName,
                    aa.entry_others_id AS IDNo,
                    aa.sub_account
            FROM
                entry_others aa UNION ALL SELECT 
                IF(aa.option = 'individual', CONCAT(IF(aa.lastname IS NOT NULL
                        AND TRIM(aa.lastname) <> '', CONCAT(aa.lastname, ', '), ''), aa.firstname), aa.company) AS ShortName,
                    aa.entry_supplier_id AS IDNo,
                    aa.sub_account
            FROM
                entry_supplier aa) id_entry
                LEFT JOIN
            sub_account b ON id_entry.sub_account = b.Sub_Acct
            
    `
    const IDEntryWithPolicy = `
        SELECT * from  (${IDEntry}) id_entry 
       union all
             SELECT 
                 a.PolicyNo, 
                 id_entry.Sub_Acct, 
                 id_entry.ShortName,
                 id_entry.client_name
            FROM
                policy a
            LEFT JOIN
                (${IDEntry}) id_entry ON a.IDNo = id_entry.IDNo

    `
    return { IDEntryWithPolicy, IDEntry }
}