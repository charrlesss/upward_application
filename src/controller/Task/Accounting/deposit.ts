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
import { format } from "date-fns";
const Deposit = express.Router();

Deposit.get("/getCashCollection", async (req, res) => {
  try {
    res.send({
      message: "Successfully Get Cash Collection.",
      success: true,
      cash: await getCashCollection("", req),
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
Deposit.get("/getCheckCollection", async (req, res) => {
  try {
    res.send({
      message: "Successfully Get Check Collection.",
      success: true,
      check: await getCheckCollection("", req),
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
  if (userAccess.includes("ADMIN")) {
    return res.send({
      message: `CAN'T SAVE, ADMIN IS FOR VIEWING ONLY!`,
      success: false,
    });
  }

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
Deposit.post("/search-cash-check", async (req, res) => {
  try {
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
    const cash = await getCashDeposit(req.body.SlipCode, req);
    const check = await getCheckDeposit(req.body.SlipCode, req);
    const cashBreakDown: any = await getCashBreakDown(req.body.SlipCode, req);
    const cashBreakDownToArray = Object.entries(cashBreakDown[0]).map(
      (items: any) => {
        const newItems = {
          value1: cashKeys[items[0]],
          value2: items[1],
          value3:
            items[1] !== ""
              ? (
                  parseFloat(cashKeys[items[0]].replace(/,/g, "")) *
                  parseInt(items[1])
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00",
        };
        return newItems;
      }
    );

    const getBankFromDeposit = await getBanksFromDepositByAccountNo(
      req.body.BankAccount,
      req
    );
    const totalValue3 = cashBreakDownToArray.reduce(
      (total, obj) => total + parseFloat(obj.value3.replace(/,/g, "")),
      0
    );

    res.send({
      message: "Successfully Search Deposit Cash And Check.",
      success: true,
      cash,
      check,
      cashBreakDownToArray,
      cashBreakDownTotal: totalValue3.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      getBankFromDeposit,
    });
  } catch (error: any) {
    console.log(error.message);
    res.send({
      success: false,
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
    });
  }
});
Deposit.post("/update-deposit", async (req, res) => {
  const { userAccess }: any = await VerifyToken(
    req.cookies["up-ac-login"] as string,
    process.env.USER_ACCESS as string
  );
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
      Date: req.body.depositdate,
      SlipCode: req.body.depositSlip,
      Slip: req.body.Desc,
      BankAccount: req.body.Account_No,
      AccountName: req.body.Account_Name,
      CheckDeposit: checkTotal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      CashDeposit: cashTotal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      IDNo: req.body.IDNo,
    },
    req
  );
  let Cnt = 0;
  const Amount = [checkTotal, cashTotal];
  for (let i = 0; i < 2; i++) {
    if (Amount[i] !== 0) {
      Cnt++;
      await addCashCheckInDeposit(
        {
          Date_Deposit: Cnt > 1 ? null : req.body.depositdate,
          Slip_Code: Cnt > 1 ? null : req.body.depositSlip,
          Account_ID: req.body.Account_ID,
          Account_Name: req.body.Account_Name,
          Debit: Amount[i].toFixed(2),
          Temp_SlipCode: req.body.depositSlip,
          Temp_SlipCntr: `${req.body.depositSlip}-${("000" + Cnt).slice(-3)}`,
          Temp_SlipDate: req.body.depositdate,
          Type: "HO",
          IDNo: req.body.Identity,
        },
        req
      );
    }
  }
  for (let i = 0; i < selectedCollection.length; i++) {
    const selectedCollectionValue = selectedCollection[i];
    let Check_Date = ''
    if(selectedCollectionValue.Check_No !== '' && selectedCollectionValue.Check_No !== null && selectedCollectionValue.Check_No !== undefined ){
      Check_Date =  format(
        new Date(selectedCollectionValue.Check_Date),
        "yyyy-MM-dd HH:mm:ss.SSS"
      )

    }

    await addCashCheckInDeposit(
      {
        Account_ID: selectedCollectionValue.DRCode,
        Account_Name: selectedCollectionValue.Short,
        Credit: parseFloat(
          selectedCollectionValue.Amount.toString().replace(/,/, "")
        ).toFixed(2),
        Check_Date ,
        Check_No: selectedCollectionValue.Check_No,
        Bank: selectedCollectionValue.Bank,
        Temp_SlipCode: req.body.depositSlip,
        Temp_SlipCntr: `${req.body.depositSlip}-${("000" + Cnt).slice(-3)}`,
        Temp_SlipDate: req.body.depositdate,
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
      Pap_200: tableRowsInputValue[2].value2,
      Pap_100: tableRowsInputValue[3].value2,
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
    if (Amount[i] !== 0) {
      addJournal(
        {
          Branch_Code: "HO",
          Date_Entry: req.body.depositdate,
          Source_Type: "DC",
          Source_No: req.body.depositSlip,
          Particulars: i === 0 ? req.body.ShortName : "",
          Payto: i === 1 ? req.body.ShortName : "",
          GL_Acct: req.body.Account_ID,
          cGL_Acct: req.body.Short,
          Sub_Acct: "HO",
          cSub_Acct: req.body.Sub_ShortName,
          ID_No: req.body.IDNo,
          cID_No: req.body.ShortName,
          Debit: i == 0 ? checkTotal : cashTotal,
          Source_No_Ref_ID: "",
        },
        req
      );
    }
  }
  for (let i = 0; i < selectedCollection.length; i++) {
    const selectedCollectionValue = selectedCollection[i];
    const IsCheck = selectedCollectionValue.Check_No !== "";
    console.log(selectedCollectionValue);
    addJournal(
      {
        Branch_Code: "HO",
        Date_Entry: req.body.depositdate,
        Source_Type: "DC",
        Source_No: req.body.depositSlip,
        Explanation: "",
        Check_Date: IsCheck ? selectedCollectionValue.Check_Date : "",
        Check_No: IsCheck ? selectedCollectionValue.Check_No : "",
        Check_Bank: IsCheck ? selectedCollectionValue.Bank : "",
        Remarks: IsCheck ? selectedCollectionValue.DRRemarks : "",
        Payto: selectedCollectionValue.Name,
        GL_Acct: selectedCollectionValue.DRCode,
        cGL_Acct: selectedCollectionValue.Short,
        Sub_Acct: "HO",
        cSub_Acct: req.body.Sub_ShortName,
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
        req.body.depositdate,
        selectedCollectionValue.IDNo,
        selectedCollectionValue.Check_No,
        req
      );
  }
}

export default Deposit;
