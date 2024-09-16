import express from "express";
import { PostDatedCheckRegistered } from "../../../model/db/stored-procedured";
import { format, parseISO } from "date-fns";
import { PrismaList } from "../../../model/connection";

const PostDatedCheckRegister = express.Router();
const { CustomPrismaClient } = PrismaList();

PostDatedCheckRegister.post(
  "/post-dated-check-registered",
  async (req, res) => {
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    try {
      const sort = ["Name", "Check_Date", "Date"];
      const order = ["Ascending", "Descending"];
      const type = ["All", "Rent", "Loan"];
      const field = ["Check Date", "Date Received"];
      const qry = PostDatedCheckRegistered(
        sort[req.body.sort],
        order[req.body.order],
        type[req.body.type],
        field[req.body.field],
        req.body.sub_acct,
        new Date(req.body.datefrom),
        new Date(req.body.dateto)
      );
      console.log(req.body);
      console.log(qry);
      const data = await prisma.$queryRawUnsafe(qry);

      const groupByCheckDateByMonth = (data: any) => {
        return data.reduce((acc: any, item: any) => {
          const date = new Date(item.Check_Date);
          const monthYear = format(date, "MMMM yyyy");

          if (!acc[monthYear]) {
            acc[monthYear] = [];
          }

          acc[monthYear].push(item);
          return acc;
        }, {});
      };
      const groupByCheckDate = (data: any) => {
        return data.reduce((acc: any, item: any) => {
          const date = item.Check_Date;
          if (!acc[date]) {
            acc[date] = [];
          }
          item.Check_Date = format(item.Check_Date, "MM/dd/yyyy");
          item.Date = format(item.Date, "MM/dd/yyyy");
          acc[date].push(item);
          return acc;
        }, {});
      };

      const groupDataByMonth = groupByCheckDateByMonth(data);
      const report = Object.keys(groupDataByMonth).map((Month: any) => {
        let _dataByMonth = groupDataByMonth[Month];

        const groupedData = groupByCheckDate(_dataByMonth);
        _dataByMonth = Object.keys(groupedData).map((date) => {
          const arry = groupedData[date];
          const formattedDate = format(new Date(date), "MMMM dd, yyyy");

          const Check_Amnt = arry
            .reduce((a: number, item: any) => {
              let num = 0;
              if (
                !isNaN(
                  parseFloat(item.Check_Amnt?.toString()?.replace(/,/g, ""))
                )
              ) {
                num = parseFloat(
                  item.Check_Amnt?.toString()?.replace(/,/g, "")
                );
              }
              return a + num;
            }, 0)
            .toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

          arry.push({
            PDC_ID: "",
            Ref_No: "",
            PNo: "",
            IDNo: "",
            Date: "",
            Name: "",
            Remarks: "",
            Bank: "",
            Branch: "",
            Check_Date: "DAILY TOTAL",
            Check_No: "",
            Check_Amnt,
            Check_Remarks: "",
            SlipCode: null,
            DateDepo: null,
            ORNum: null,
            PDC_Status: "",
            Date_Stored: "",
            Date_Endorsed: null,
            Date_Pulled_Out: null,
            PDC_Remarks: null,
            mark: null,
            footer: true,
          });
          arry.unshift({
            header: true,
            PDC_ID: "",
            Ref_No: "",
            PNo: "",
            IDNo: "",
            Date: formattedDate,
            Name: "",
            Remarks: "",
            Bank: "",
            Branch: "",
            Check_Date: "",
            Check_No: "",
            Check_Amnt: "",
            Check_Remarks: "",
            SlipCode: null,
            DateDepo: null,
            ORNum: null,
            PDC_Status: "",
            Date_Stored: "",
            Date_Endorsed: null,
            Date_Pulled_Out: null,
            PDC_Remarks: null,
            mark: null,
          });
          return arry;
        });

        _dataByMonth = _dataByMonth.flat();

        const Check_Amnt = _dataByMonth
          .reduce((a: number, item: any) => {
            let num = 0;
            if (
              !isNaN(
                parseFloat(item.Check_Amnt?.toString()?.replace(/,/g, ""))
              ) &&
              !item.footer
            ) {
              num = parseFloat(item.Check_Amnt?.toString()?.replace(/,/g, ""));
            }
            return a + num;
          }, 0)
          .toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

        _dataByMonth.push({
          PDC_ID: "",
          Ref_No: "",
          PNo: "",
          IDNo: "",
          Date: "",
          Name: "",
          Remarks: "",
          Bank: "",
          Branch: "",
          Check_Date: `MONTH OF ${Month.split(" ")[0].toUpperCase()}`,
          Check_No: "",
          Check_Amnt,
          Check_Remarks: "",
          SlipCode: null,
          DateDepo: null,
          ORNum: null,
          PDC_Status: "",
          Date_Stored: "",
          Date_Endorsed: null,
          Date_Pulled_Out: null,
          PDC_Remarks: null,
          mark: null,
          footer: true,
        });

        return _dataByMonth;
      });

      res.send({
        message: "Successfully Get Report",
        success: true,
        report: report.flat(),
      });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        message: err.message,
        success: false,
        report: [],
      });
    }
  }
);
  
PostDatedCheckRegister.post(
  "/post-dated-check-registered-desk",
  async (req, res) => {
    console.log(req.body)
    const prisma = CustomPrismaClient(req.cookies["up-dpm-login"]);

    try {
      const sort = ["Name", "Check_Date", "Date"];
      const order = ["Ascending", "Descending"];
      const type = ["All", "Rent", "Loan"];
      const field = ["Check Date", "Date Received"];
      const qry = PostDatedCheckRegistered(
        sort[req.body.sort],
        order[req.body.order],
        type[req.body.type],
        field[req.body.field],
        req.body.sub_acct,
        new Date(req.body.datefrom),
        new Date(req.body.dateto)
      );
      const data = await prisma.$queryRawUnsafe(qry);

      res.send({
        message: "Successfully Get Report",
        success: true,
        data,
      });
    } catch (err: any) {
      console.log(err.message);
      res.send({
        message: err.message,
        success: false,
        data: [],
      });
    }
  }
);
export default PostDatedCheckRegister;
