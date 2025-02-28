import express from "express";
import {
  addDepositSlip,
  findDepositBySlipCode,
  getBanksFromDeposit,
  getCashCollection,
  getCheckCollection,
  addCashCheckInDeposit,
  depositIDSlipCodeGenerator,
  addCashBreakDown,
  addJournal,
  updateCollectioSlipCode,
  updatePDCSlipCode,
  updateDepositIDSequence,
  searchDeposit,
  getCashDeposit,
  getCheckDeposit,
  getCashBreakDown,
  getBanksFromDepositByAccountNo,
  deleteSlipCode,
  deleteDeposit,
  deleteCashBreakDown,
  deleteJournalFromDeposit,
  removeDepositFromCollection,
} from "../../../model/Task/Accounting/deposit.model";
import saveUserLogs from "../../../lib/save_user_logs";
import { saveUserLogsCode } from "../../../lib/saveUserlogsCode";
import { VerifyToken } from "../../Authentication";
import { qry_id_policy_sub } from "../../../model/db/views";
import {
  __executeQuery,
  executeQuery,
} from "../../../model/Task/Production/policy";
import { defaultFormat } from "../../../lib/defaultDateFormat";
const Deposit = express.Router();

Deposit.get("/get-cash-collection", async (req, res) => {
  try {
    res.send({
      message: "Successfully Get Cash Collection.",
      success: true,
      cash: await getCashCollection("", true, req),
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      cash: [],
    });
  }
});
Deposit.get("/get-check-collection", async (req, res) => {
  try {
    res.send({
      message: "Successfully Get Check Collection.",
      success: true,
      check: await getCheckCollection("", true, req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      check: [],
    });
  }
});
Deposit.get("/getBanks", async (req, res) => {
  const { bankDepositSearch } = req.query;
  try {
    res.send({
      message: "Successfully Get Deposit Banks.",
      success: true,
      banks: await getBanksFromDeposit(bankDepositSearch as string, req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      banks: [],
    });
  }
});
Deposit.post("/getBanks", async (req, res) => {
  const { bankDepositSearch } = req.query;
  try {
    res.send({
      message: "Successfully Get Deposit Banks.",
      success: true,
      data: await getBanksFromDeposit(req.body.search, req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      banks: [],
    });
  }
});
Deposit.get("/get-deposit-slipcode", async (req, res) => {
  try {
    res.send({
      message: "Successfully Get Deposit Slipcode Successfully.",
      success: true,
      slipcode: await depositIDSlipCodeGenerator(req),
    });
  } catch (error: any) {
    console.log(error.message);

    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      slipcode: [],
    });
  }
});
Deposit.post("/add-deposit", async (req, res) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  const BankAcctCode = (await __executeQuery(
    `SELECT * FROM bankaccounts where Account_No = '${req.body.BankAcctCode}'`,
    req
  )) as Array<any>;
  if (BankAcctCode.length <= 0) {
    return res.send({
      message: `${req.body.BankAcctCode} is not Found!`,
      success: false,
      collectionID: null,
    });
  }
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: `CAN'T SAVE, ADMIN IS FOR VIEWING ONLY!`,
      success: false,
    });
  }
  console.log(req.body);

  try {
    if ((await findDepositBySlipCode(req.body.depositSlip, req)).length > 0) {
      return res.send({
        message: `${req.body.depositSlip} already exists`,
        success: false,
      });
    }
    addDeposit(req);
    let parts = req.body.depositSlip.split("-");
    let firstPart = parts[0].slice(0, 2);
    let secondPart = parts[0].slice(2);


    updateDepositIDSequence(
      {
        last_count: parts[1],
        year: firstPart,
        month: secondPart,
      },
      req
    );
    await saveUserLogs(req, req.body.depositSlip, "add", "Deposit");
    res.send({
      message: "Successfully Create New Deposit.",
      success: true,
    });
  } catch (error: any) {
    console.log(error);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});
Deposit.get("/search-deposit", async (req, res) => {
  try {
    console.log('qweqw')
    const deposit: any = await searchDeposit(
      req.query.searchDeposit as string,
      req
    );
    res.send({
      message: "Successfully Search Deposit.",
      success: true,
      deposit,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});
Deposit.post("/search-deposit", async (req, res) => {
  try {
    console.log(req.body.search)

    const data: any = await searchDeposit(req.body.search, req);
    res.send({
      message: "Successfully Search Deposit.",
      success: true,
      data,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});
Deposit.post("/search-cash-check", async (req, res) => {
  try {
    const { IDEntryWithPolicy } = qry_id_policy_sub();
    const cashKeys: any = {
      Pap_1000: "1,000.00",
      Pap_500: "500.00",
      Pap_200: "200.00",
      Pap_100: "100.00",
      Pap_50: "50.00",
      Pap_20: "20.00",
      Pap_10: "10.00",
      Coin_5: "5.00",
      Coin_2: "2.00",
      Coin_1: "1.00",
      Cnt_50: ".50",
      Cnt_25: ".25",
      Cnt_10: ".10",
      Cnt_05: ".05",
      Cnt_01: ".01",
    };
    const dt = (await __executeQuery(
      `SELECT  *  FROM deposit_slip where slipcode = '${req.body.SlipCode}'`,
      req
    )) as Array<any>;
    if (dt.length > 0) {
      const obj: any = {};
      obj.refBankAcctCode = dt[0].SlipCode;
      obj.refDate = dt[0].Date;
      obj.refBankAcctCode = dt[0].BankAccount.toString();
      obj.refBankAcctName = dt[0].AccountName.toString();

      const sql = `
      SELECT 
      a.Account_Type,
      a.Account_No,
      a.IDNo,
      a.Account_Name,
      a.Desc,
      a.Account_ID,
      b.Short,
      id_entry.client_name,
      id_entry.Sub_Acct,
      id_entry.ShortName
    FROM
            bankaccounts a
          LEFT JOIN
            chart_account b ON a.Account_ID = b.Acct_Code
          LEFT JOIN (${IDEntryWithPolicy}) id_entry  on a.IDNo = id_entry.IDNo
        WHERE
            a.Inactive = 0 and a.Account_No='${obj.refBankAcctCode}'
            `;
      const bankAccountDetails = (await __executeQuery(sql, req)) as Array<any>;
      if (bankAccountDetails.length > 0) {
        obj.refBankAcctCodeTag = bankAccountDetails[0].IDNo;
        obj.refBankAcctNameTag = bankAccountDetails[0].Desc;
        obj.refAcctID = bankAccountDetails[0].Account_ID;
        obj.refAcctName = bankAccountDetails[0].Short;
        obj.refShortName = bankAccountDetails[0].client_name;
        obj.refClassification = bankAccountDetails[0].Sub_Acct;
        obj.refSubAccount = bankAccountDetails[0].ShortName;
      }
      const cash_breakdown = (await __executeQuery(
        `SELECT 
        Pap_1000,
        Pap_500,
        Pap_100,
        Pap_200,
        Pap_50,
        Pap_20,
        Pap_10,
        Coin_5,
        Coin_2,
        Coin_1,
        Cnt_50,
        Cnt_25,
        Cnt_10,
        Cnt_05,
        Cnt_01
        FROM Cash_Breakdown WHERE Slip_Code = '${req.body.SlipCode}'`,
        req
      )) as Array<any>;
      const newBreakDown: any = [];
      const cashBreakDownToArray: Array<any> = Object.entries(
        cash_breakdown[0]
      );
      cashBreakDownToArray.forEach((items: Array<any>) => {
        if (cashKeys[items[0]]) {
          const price = parseFloat(cashKeys[items[0]].replace(/,/g, ""));
          const newItems = {
            value1: cashKeys[items[0]],
            value2: items[1],
            value3:
              parseInt(items[1]) > 0
                ? (price * parseInt(items[1])).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00",
          };
          newBreakDown.push(newItems);
        }
      });

      res.send({
        message: "Successfully Search Deposit Cash And Check.",
        success: true,
        data: {
          obj,
          cash: await getCashCollection(req.body.SlipCode, false, req),
          checks: await getCheckCollection(req.body.SlipCode, false, req),
          cash_breakdown: newBreakDown,
        },
      });
    }
  } catch (error: any) {
    console.log(error.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      data: [],
    });
  }
});
Deposit.post("/update-deposit", async (req, res) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
  const BankAcctCode = (await __executeQuery(
    `SELECT * FROM bankaccounts where Account_No = '${req.body.BankAcctCode}'`,
    req
  )) as Array<any>;
  if (BankAcctCode.length <= 0) {
    return res.send({
      message: `${req.body.BankAcctCode} is not Found!`,
      success: false,
      collectionID: null,
    });
  }

  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: `CAN'T UPDATE, ADMIN IS FOR VIEWING ONLY!`,
      success: false,
    });
  }
  try {
    if (
      !(await saveUserLogsCode(req, "edit", req.body.depositSlip, "Deposit"))
    ) {
      return res.send({ message: "Invalid User Code", success: false });
    }

    await removeDepositFromCollection(req.body.depositSlip, req);
    await deleteSlipCode(req.body.depositSlip, req);
    await deleteDeposit(req.body.depositSlip, req);
    await deleteCashBreakDown(req.body.depositSlip, req);
    await deleteJournalFromDeposit(req.body.depositSlip, req);
    await addDeposit(req);
    res.send({
      message: "Successfully Update Deposit.",
      success: true,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
    });
  }
});

async function addDeposit(req: any) {
  console.log(req.body);
  const { IDEntryWithPolicy } = qry_id_policy_sub();

  const selectedCollection = JSON.parse(req.body.selectedCollection);
  const tableRowsInputValue = JSON.parse(req.body.tableRowsInputValue);
  const cashTotal = selectedCollection.reduce(
    (accumulator: number, currentValue: any) => {
      const dd =
        currentValue.Check_No || currentValue.Check_No !== ""
          ? 0
          : parseFloat(currentValue.Amount.replace(/,/g, ""));
      return accumulator + dd;
    },
    0.0
  );
  const checkTotal = selectedCollection.reduce(
    (accumulator: number, currentValue: any) => {
      const dd =
        currentValue.Check_No || currentValue.Check_No !== ""
          ? parseFloat(currentValue.Amount.replace(/,/g, ""))
          : 0;
      return accumulator + dd;
    },
    0.0
  );

  await addDepositSlip(
    {
      Date: defaultFormat(new Date(req.body.depositdate)),
      SlipCode: req.body.depositSlip,
      Slip: req.body.BankAcctCodeTag,
      BankAccount: req.body.BankAcctCode,
      AccountName: req.body.BankAcctName,
      CheckDeposit: checkTotal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      CashDeposit: cashTotal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      IDNo: req.body.BankAcctCodeTag,
    },
    req
  );

  let Cnt = 0;
  const Amount = [checkTotal, cashTotal];

  for (let i = 0; i <= 1; i++) {
    if (Amount[i] !== 0) {
      Cnt++;
      await addCashCheckInDeposit(
        {
          Date_Deposit:
            Cnt > 1 ? null : defaultFormat(new Date(req.body.depositdate)),
          Slip_Code: Cnt > 1 ? null : req.body.depositSlip,
          Account_ID: req.body.AcctID,
          Account_Name: req.body.AcctName,
          Debit: Amount[i].toFixed(2),
          Temp_SlipCode: req.body.depositSlip,
          Temp_SlipCntr: `${req.body.depositSlip}-${("000" + Cnt).slice(-3)}`,
          Temp_SlipDate: defaultFormat(new Date(req.body.depositdate)),
          Type: "HO",
          IDNo: req.body.ShortName,
        },
        req
      );
    }
  }
  for (let i = 0; i < selectedCollection.length; i++) {
    const selectedCollectionValue = selectedCollection[i];
    let Check_Date = "";
    if (
      selectedCollectionValue.Check_No !== "" &&
      selectedCollectionValue.Check_No !== null &&
      selectedCollectionValue.Check_No !== undefined
    ) {
      Check_Date = defaultFormat(new Date(selectedCollectionValue.Check_Date));
    }

    await addCashCheckInDeposit(
      {
        Account_ID: selectedCollectionValue.DRCode,
        Account_Name: selectedCollectionValue.Short,
        Credit: parseFloat(
          selectedCollectionValue.Amount.toString().replace(/,/, "")
        ).toFixed(2),
        Check_Date,
        Check_No: selectedCollectionValue.Check_No,
        Bank: selectedCollectionValue.Bank,
        Temp_SlipCode: req.body.depositSlip,
        Temp_SlipCntr: `${req.body.depositSlip}-${("000" + Cnt).slice(-3)}`,
        Temp_SlipDate: defaultFormat(new Date(req.body.depositdate)),
        IDNo: selectedCollectionValue.Name,
        Type: "HO",
        Ref_No: selectedCollectionValue.ORNo,
      },
      req
    );
  }
  await addCashBreakDown(
    {
      Slip_Code: req.body.depositSlip,
      Pap_1000: tableRowsInputValue[0].value2,
      Pap_500: tableRowsInputValue[1].value2,
      Pap_200: tableRowsInputValue[3].value2,
      Pap_100: tableRowsInputValue[2].value2,
      Pap_50: tableRowsInputValue[4].value2,
      Pap_20: tableRowsInputValue[5].value2,
      Pap_10: tableRowsInputValue[6].value2,
      Pap_5: tableRowsInputValue[7].value2,
      Coin_5: tableRowsInputValue[7].value2,
      Coin_2: tableRowsInputValue[8].value2,
      Coin_1: tableRowsInputValue[9].value2,
      Cnt_50: tableRowsInputValue[10].value2,
      Cnt_25: tableRowsInputValue[11].value2,
      Cnt_10: tableRowsInputValue[12].value2,
      Cnt_05: tableRowsInputValue[13].value2,
      Cnt_01: tableRowsInputValue[14].value2,
    },
    req
  );

  for (let i = 0; i < 2; i++) {
    const getClientSubAccount: any = await executeQuery(
      IDEntryWithPolicy,
      req.body.BankAcctCodeTag,
      req
    );

    if (Amount[i] !== 0) {
      addJournal(
        {
          Branch_Code: "HO",
          Date_Entry: defaultFormat(new Date(req.body.depositdate)),
          Source_Type: "DC",
          Source_No: req.body.depositSlip,
          Particulars: i === 0 ? req.body.ShortName : "",
          Payto: i === 1 ? req.body.ShortName : "",
          GL_Acct: req.body.AcctID,
          cGL_Acct: req.body.AcctName,
          Sub_Acct: getClientSubAccount[0].Sub_Acct,
          cSub_Acct: getClientSubAccount[0].ShortName,
          ID_No: req.body.BankAcctCodeTag,
          cID_No: req.body.ShortName,
          Debit: i == 0 ? checkTotal : cashTotal,
          Source_No_Ref_ID: "ff",
        },
        req
      );
    }
  }
  let i = 0;
  i < selectedCollection.length;
  i++;
  for (const selectedCollectionValue of selectedCollection) {
    // const selectedCollectionValue = selectedCollection[i];
    const IsCheck = selectedCollectionValue.Check_No !== "";
    const __getClientSubAccount: any = await executeQuery(
      IDEntryWithPolicy,
      selectedCollectionValue.IDNo,
      req
    );

    addJournal(
      {
        Branch_Code: "HO",
        Date_Entry: defaultFormat(new Date(req.body.depositdate)),
        Source_Type: "DC",
        Source_No: req.body.depositSlip,
        Explanation: "",
        Check_Date: IsCheck
          ? defaultFormat(new Date(selectedCollectionValue.Check_Date))
          : "",
        Check_No: IsCheck ? selectedCollectionValue.Check_No : "",
        Check_Bank: IsCheck ? selectedCollectionValue.Bank : "",
        Remarks: IsCheck ? selectedCollectionValue.DRRemarks : "",
        Payto: selectedCollectionValue.Name,
        GL_Acct: selectedCollectionValue.DRCode,
        cGL_Acct: selectedCollectionValue.Short,
        Sub_Acct: __getClientSubAccount[0].Sub_Acct,
        cSub_Acct: __getClientSubAccount[0].ShortName,
        ID_No: selectedCollectionValue.IDNo,
        cID_No: selectedCollectionValue.Name,
        Credit: selectedCollectionValue.Amount.replace(/,/g, ""),
        Source_No_Ref_ID: "",
      },
      req
    );

    await updateCollectioSlipCode(
      req.body.depositSlip,
      selectedCollectionValue.TempOR,
      req
    );

    if (IsCheck)
      await updatePDCSlipCode(
        req.body.depositSlip,
        defaultFormat(new Date(req.body.depositdate)),
        selectedCollectionValue.IDNo,
        selectedCollectionValue.Check_No,
        req
      );
  }
}

export default Deposit;
