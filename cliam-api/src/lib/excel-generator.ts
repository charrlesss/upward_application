import ExcelJS from 'exceljs'
import { Response } from 'express'

interface propTypes {
    alphabet?: Array<string>,
    boldText?: (row: number, column: Array<string>) => void
    addBorder?: (row: number, column: Array<string>, border: Partial<ExcelJS.Borders>) => void
    setAlignment?: (row: number, column: Array<string>, alignment: Partial<ExcelJS.Alignment>) => void
    mergeCells?: (row: number, startColumn: string, endColumn: string) => void
    setFontSize?: (row: Array<number>, size: number) => void
    beforeDraw: (props: propTypes, worksheet: ExcelJS.Worksheet) => void
    onDraw: (props: propTypes, detail: any, idx: number) => void
    afterDraw: (props: propTypes, worksheet: ExcelJS.Worksheet) => void
    columns: Partial<ExcelJS.Column>[]
    data: Array<any>
}
export async function drawExcel(res: Response, props: propTypes) {
    props.alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    props.boldText = (row: number, column: Array<string>) => {
        column.forEach((itm: any) => {
            const cell = worksheet.getCell(`${itm}${row}`);
            cell.font = { bold: true };  // Set font to bold
        });
    }
    props.addBorder = (row: number, column: Array<string>, border: Partial<ExcelJS.Borders>) => {
        column.forEach((itm: any) => {
            const cell = worksheet.getCell(`${itm}${row}`);
            cell.border = border;
        });
    }
    props.setAlignment = (row: number, column: Array<string>, alignment: Partial<ExcelJS.Alignment>) => {
        column.forEach((itm: any) => {
            const cell = worksheet.getCell(`${itm}${row}`);
            cell.alignment = alignment
        });
    }
    props.mergeCells = (row: number, startColumn: string, endColumn: string) => {
        worksheet.mergeCells(`${startColumn}${row}:${endColumn}${row}`);
    }
    props.setFontSize = (row: Array<number>, size: number) => {
        for (let x = 0; x < row.length; x++) {
            for (let y = 0; y < props.columns.length - 1; y++) {
                if (props.alphabet)
                    worksheet.getCell(`${props?.alphabet[y + 1]}${x + 1}`).font = { size: size };
            }
        }
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    props.beforeDraw(props, worksheet)
    // Add data to the worksheet based on reportDetails (you can customize this as needed)
    worksheet.columns = props.columns
    // Example of adding rows from reportDetails (customize according to your data structure)
    props.data.forEach((detail: any, idx: number) => {
        worksheet.addRow(detail);
        props.onDraw(props, detail, idx)
    });
    props.afterDraw(props, worksheet)
    // Create a buffer and send the file as an Excel download
    const buffer = await workbook.xlsx.writeBuffer();
    // Set the response headers for an Excel file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report.xls');
    // Send the Excel file as a response
    res.send(buffer);
}