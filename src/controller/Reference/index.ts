import express  from "express"
import ID_Entry from "./id-entry"
import PolicyAccount from "./policy-account"
import SubAccount from "./sub-account"
import Mortgagee from "./mortgagee"
import Subline from "./subline"
import Rates from "./rates"
import CTPL from "./ctpl"
import Bank from "./bank"
import ChartAccount from "./chart-account"
import TransactionCode from "./transaction-code"
import PettyCashTransaction from "./petty-cash-transaction"
import BankAccount from "./bank-account"
const Reference = express.Router()

//production
Reference.use("/reference",ID_Entry)
Reference.use("/reference",PolicyAccount)
Reference.use("/reference",SubAccount)
Reference.use("/reference",Mortgagee)
Reference.use("/reference",Subline)
Reference.use("/reference",Rates)
Reference.use("/reference",CTPL)
//accounting
Reference.use("/reference",Bank)
Reference.use("/reference",ChartAccount)
Reference.use("/reference",TransactionCode)
Reference.use("/reference",PettyCashTransaction)
Reference.use("/reference",BankAccount)

export default Reference