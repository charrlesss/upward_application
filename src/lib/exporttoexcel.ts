import { Response } from "express";
import excel from "exceljs";
import fs from "fs";
import { v4 as uuidV4 } from "uuid";

export function ExportToExcel(data: Array<any>, res: Response) {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");

  data.forEach((items: any) => {
    worksheet.addRow(items);
  });
  const name = uuidV4();
  const excelFilePath = `${name}.xlsx`;

  worksheet.eachRow(function (row, rowNumber) {
    row.eachCell(function (cell, colNumber) {
      if (cell.value)
        row.getCell(colNumber).font = { color: { argb: "004e47cc" }, };
    });
  });
  worksheet.columns.forEach((col: any) => {
    const largestValueLength = col.values.reduce(
      (maxWidth: any, value: any) => {
        if (value && value.length > maxWidth) {
          return value.length;
        }
        return maxWidth;
      },
      0
    );
    col.width = largestValueLength + 8;
  });

  workbook.xlsx
    .writeFile(excelFilePath)
    .then(() => {
      res.download(excelFilePath, `${name}.xlsx`, (err) => {
        if (err) {
          console.error("Error while downloading:", err);
        } else {
          fs.unlinkSync(excelFilePath);
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    });
}
