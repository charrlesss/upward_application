import exceljs from "exceljs";
import { Request, Response } from "express";

const letterList = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
type excelParams = {
  workbook: exceljs.Workbook;
  column: string;
  state: any;
  data: string;
  title: string;
  header: Array<any>;
  tableData: Array<any>;
  titleSplited: Array<string>;
  rowStartedIndex: number;
  footerLenght: number;
  rowLengthTextDisplayIndex: number;
  sheet: exceljs.Worksheet;
  newHeader: Array<any>;
  sendFile(): void;
  letterList: Array<string>;
};
interface onEachCellParams extends excelParams {
  cell: exceljs.Cell;
  colIndex: number;
  row: exceljs.Row;
  rowIndex: number;
}
interface onEachRowParams extends excelParams {
  row: exceljs.Row;
  rowIndex: number;
}
export function exportToExcel({
  req,
  res,
  callback,
  onEachRow,
  onEachCell,
}: {
  req: Request;
  res: Response;
  callback: (params: excelParams) => void;
  onEachRow?: (onEachRowParamsarams: onEachRowParams) => void;
  onEachCell?: (cellParams: onEachCellParams) => void;
}) {
  const workbook = new exceljs.Workbook();
  const { column, data, title, state } = req.body;
  const header = JSON.parse(column);
  const tableData = JSON.parse(data);
  const titleSplited = [...title.split("\n"), "", ""];
  const rowStartedIndex = titleSplited.length + 1;
  const footerLenght = tableData.length + rowStartedIndex + 1;
  const rowLengthTextDisplayIndex = footerLenght + 2;

  var sheet = workbook.addWorksheet("My Sheet", {
    properties: { showGridLines: false },
  });

  const newHeader = header.map((itms: any) => ({
    header: itms.header.toUpperCase(),
    key: itms.dataKey,
    width: itms.excelColumnWidth,
  }));

  sheet.getRow(rowStartedIndex).values = newHeader.map((itm: any) => itm.key);
  sheet.columns = newHeader;

  tableData.forEach((item: any) => {
    const obj: any = {};
    header.forEach((head: any) => {
      obj[head.dataKey] = item[head.dataKey];
    });
    sheet.addRow(obj);
  });
  const footerRow = sheet.addRow([]);

  header.forEach((head: any, idx: number) => {
    if (head.total) {
      footerRow.getCell(idx + 1).value = tableData
        ?.reduce((total: number, item: any) => {
          return total + parseFloat(item[head.dataKey]?.replace(/,/g, ""));
        }, 0)
        ?.toLocaleString("en-US", {
          maximumFractionDigits: 2,
        });
    } else {
      footerRow.getCell(idx + 1).value = "";
    }
  });

  sheet.getRow(rowStartedIndex).eachCell((cell, cellIndex) => {
    cell.value = newHeader[cellIndex - 1].header;
  });

  sheet.mergeCells(
    `A${rowLengthTextDisplayIndex}:B${rowLengthTextDisplayIndex}`
  );
  sheet.getCell(
    `A${rowLengthTextDisplayIndex}`
  ).value = `No. of Records: ${tableData.length}`;
  sheet.getCell(`A${rowLengthTextDisplayIndex}`).style = {
    font: {
      bold: true,
      size: 10.5,
    },
  };

  titleSplited.forEach((text: string, idx: number) => {
    sheet.mergeCells(`A${idx + 1}:${letterList[header.length - 1]}${idx + 1}`);
    sheet.getCell(`A${idx + 1}`).value = text;
  });

  sheet.columns.forEach((column) => {
    const headerCell = sheet.getCell(`${column.letter}${rowStartedIndex}`);
    headerCell.style = {
      alignment: { horizontal: "center", vertical: "middle" },
      font: {
        size: 11.5,
        bold: true,
      },
    };
  });

  sheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
    row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
      if (rowIndex < rowStartedIndex) {
        cell.style = {
          font: {
            bold: true,
            size: 13,
          },
        };
      }
      if (rowIndex === footerLenght) {
        cell.style = {
          font: {
            bold: true,
            size: 11.5,
          },
        };
      }
      if (onEachCell)
        onEachCell({
          workbook,
          state,
          column,
          data,
          title,
          header,
          tableData,
          titleSplited,
          rowStartedIndex,
          footerLenght,
          rowLengthTextDisplayIndex,
          sheet,
          newHeader,
          sendFile,
          letterList,
          cell,
          colIndex,
          row,
          rowIndex,
        });
    });
    if (onEachRow)
      onEachRow({
        workbook,
        state,
        column,
        data,
        title,
        header,
        tableData,
        titleSplited,
        rowStartedIndex,
        footerLenght,
        rowLengthTextDisplayIndex,
        sheet,
        newHeader,
        sendFile,
        letterList,
        row,
        rowIndex,
      });
  });

  function sendFile() {
    workbook.xlsx.writeBuffer().then((buffer) => {
      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=export.xlsx");

      // Send the buffer as a file
      res.send(buffer);
    });
  }
  callback({
    workbook,
    state,
    column,
    data,
    title,
    header,
    tableData,
    titleSplited,
    rowStartedIndex,
    footerLenght,
    rowLengthTextDisplayIndex,
    sheet,
    newHeader,
    sendFile,
    letterList,
  });
}
