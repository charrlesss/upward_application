import PDFDocument from "pdfkit";
import fs from "fs";
import { PassThrough } from "stream";
import { Response } from "express";
import { format } from "date-fns";

interface PDFReportGeneratorProps {
  data: Array<any>;
  columnWidths: Array<number>;
  headers: Array<{ headerName: string; textAlign: string }>;
  keys: Array<string>;
  title: string;
  PAGE_WIDTH: number;
  PAGE_HEIGHT: number;
  MARGIN: { top: number; right: number; bottom: number; left: number };
  BASE_FONT_SIZE: number;
  TITLE_FONT_SIZE: number;
  MIN_ROW_HEIGHT: number;
  boldedRows: Array<number>;
  spanMap: Map<any, any>;
  borderedColumns: Array<any>;
  beforeDraw: (doc: any, document: PDFKit.PDFDocument) => number;
  beforePerPageDraw: (
    pdfReportGenerator: any,
    doc: PDFKit.PDFDocument
  ) => void | null;
  drawPageNumber: (
    doc: PDFKit.PDFDocument,
    currentPage: number,
    totalPages: number,
    pdfReportGenerator: any
  ) => void;
  addMarginInFirstPage: number;
  addHeaderBorderTop: boolean;
  addHeaderBorderBottom: boolean;
  setRowFontSize: number;
  adjustRowXPostion: any;
  addPadingfFromLeft: any;
  addRowHeight: any;
  adjustTitleFontSize: number;
  addHeader: boolean;
  drawOnColumn: (row: any, doc: PDFKit.PDFDocument, startY: number) => void;
  adjustRowHeight: number;
  addHeaderPerpage: boolean;
  drawSubReport: (doc: PDFKit.PDFDocument, startY: number) => void;
  addDrawingOnHeader: (doc: PDFKit.PDFDocument, startY: number) => void;
}

function pageNumber(
  doc: PDFKit.PDFDocument,
  PAGE_WIDTH: number,
  PAGE_HEIGHT: number
) {
  const range = doc.bufferedPageRange();
  let i;
  let end;

  for (
    i = range.start, end = range.start + range.count, range.start <= end;
    i < end;
    i++
  ) {
    doc.font("Helvetica");
    doc.switchToPage(i);
    doc.text(
      `Page ${i + 1} of ${range.count}`,
      PAGE_WIDTH - 80,
      PAGE_HEIGHT - 30
    );
    doc.text(
      `Printed ${format(new Date(), "MM/dd/yyyy hh:mm a")}`,
      20,
      PAGE_HEIGHT - 30
    );
  }
}
class PDFReportGenerator {
  public data: Array<any> = [];
  public columnWidths: Array<number> = [];
  public headers: Array<{ headerName: string; textAlign: string }> = [];
  public keys: Array<string> = [];
  public title: string = "";
  public PAGE_WIDTH: number = 8.5;
  public PAGE_HEIGHT: number = 11;
  public MARGIN = { top: 20, right: 10, bottom: 80, left: 10 };
  public BASE_FONT_SIZE: number = 10;
  public TITLE_FONT_SIZE: number = 16;
  public MIN_ROW_HEIGHT: number = 20;
  public boldedRows: Array<{ rowIndex: number; callback: any }> = [];
  public spanMap = new Map();
  public borderedColumns: Array<any>;
  public beforeDraw = (
    doc: any,
    document: PDFKit.PDFDocument,
    startY: number
  ) => {
    return 0;
  };
  public beforePerPageDraw = (
    pdfReportGenerator: any,
    doc: PDFKit.PDFDocument
  ) => {};
  public drawPageNumber = (
    doc: PDFKit.PDFDocument,
    currentPage: number,
    totalPages: number,
    pdfReportGenerator: any
  ) => {};
  public scaledColumns: any = [];
  public scaledFontSize: number = 0;
  public scaledRowHeight: number = 0;
  public addMarginInFirstPage: number = 0;
  public addHeaderBorderTop: boolean = true;
  public addHeaderBorderBottom: boolean = false;
  public alignText: boolean = false;
  public alignmentMap = new Map();
  public setRowFontSize = 0;
  public adjustRowXPostion: any = null;
  public addPadingfFromLeft: any = null;
  public addRowHeight: any = null;
  public adjustTitleFontSize: number = 3;
  public addHeader: boolean = true;
  public drawOnColumn: (
    row: any,
    doc: PDFKit.PDFDocument,
    startY: number
  ) => void;
  public drawSubReport: (doc: PDFKit.PDFDocument, startY: number) => void;
  public adjustRowHeight: number = 0;
  public addHeaderPerpage: boolean = true;

  public addDrawingOnHeader: (doc: PDFKit.PDFDocument, startY: number) => void;

  constructor(props: PDFReportGeneratorProps) {
    this.data = props.data;
    this.columnWidths = props.columnWidths;
    this.headers = props.headers;
    this.keys = props.keys;
    this.title = props.title;

    this.PAGE_WIDTH = props.PAGE_WIDTH;
    this.PAGE_HEIGHT = props.PAGE_HEIGHT;
    this.MARGIN = props.MARGIN;
    this.BASE_FONT_SIZE = props.BASE_FONT_SIZE || 12;
    this.TITLE_FONT_SIZE = 16;
    this.MIN_ROW_HEIGHT = 20;

    this.boldedRows = [];
    this.spanMap = new Map();
    this.borderedColumns = [];
    this.beforeDraw = props.beforeDraw;
    this.beforePerPageDraw = props.beforePerPageDraw;
    this.drawPageNumber = props.drawPageNumber;
    this.addMarginInFirstPage = props.addMarginInFirstPage || 0;
    this.addHeaderBorderTop =
      props.addHeaderBorderTop !== undefined ? props.addHeaderBorderTop : true;

    this.addHeaderBorderBottom =
      props.addHeaderBorderBottom !== undefined
        ? props.addHeaderBorderBottom
        : false;
    this.alignmentMap = new Map();

    this.setRowFontSize = props.setRowFontSize || 0;
    this.adjustRowXPostion = props.adjustRowXPostion || null;
    this.addPadingfFromLeft = props.addPadingfFromLeft || null;
    this.addRowHeight = props.addRowHeight || null;
    this.adjustTitleFontSize = props.adjustTitleFontSize || 3;
    this.addHeader = props.addHeader !== undefined ? props.addHeader : true;
    this.drawOnColumn = props.drawOnColumn;
    this.adjustRowHeight =
      props.adjustRowHeight !== undefined ? props.adjustRowHeight : 0;
    this.addHeaderPerpage =
      props.addHeaderPerpage !== undefined ? props.addHeaderPerpage : true;
    this.drawSubReport = props.drawSubReport;
    this.addDrawingOnHeader = props.addDrawingOnHeader;
  }

  setAlignment(rowIndex: number, columnIndex: number, align: string) {
    this.alignmentMap.set(rowIndex, { columnIndex, align });
  }
  boldRow(rowIndex: number, callback?: any) {
    this.boldedRows.push({ rowIndex, callback });
  }
  SpanRow(
    rowIndex: number,
    columnIndex: number,
    spanLength: number,
    key: string = "",
    textAlign: string = "left"
  ) {
    this.spanMap.set(rowIndex, { columnIndex, spanLength, key, textAlign });
  }
  // Function to define custom borders for a specific row and columns
  borderColumnInRow(
    rowIndex: number,
    columnDetails: any,
    borderSides: any,
    columnGap = 0,
    dash = false
  ) {
    this.borderedColumns.push({
      rowIndex,
      columnDetails,
      borderSides,
      columnGap,
      dash,
    });
  }
  calculateScaling() {
    const contentWidth = this.columnWidths.reduce(
      (acc, width) => acc + width,
      0
    );
    const availableWidth = this.PAGE_WIDTH - 2 * this.MARGIN.left;
    const scaleFactor = Math.min(1, availableWidth / contentWidth);

    this.scaledColumns = this.columnWidths.map((width) => width * scaleFactor);
    this.scaledFontSize = this.BASE_FONT_SIZE * scaleFactor;
    this.scaledRowHeight = this.BASE_FONT_SIZE * 1.2 * scaleFactor;
  }

  calculateRowHeight(doc: PDFKit.PDFDocument, row: any, rowIndex: number) {
    const spanInfo = this.spanMap.get(rowIndex);
    const {
      columnIndex,
      spanLength,
      key: SpanKey,
      textAlign: SpanTextAlign,
    } = spanInfo || {};

    let maxHeight = this.MIN_ROW_HEIGHT;
    this.keys.forEach((key, colIndex) => {
      if (
        spanInfo &&
        colIndex > columnIndex &&
        colIndex < columnIndex + spanLength
      ) {
        return;
      }

      const colSpan = spanInfo && colIndex === columnIndex ? spanLength : 1;
      const colWidth = this.columnWidths
        .slice(colIndex, colIndex + colSpan)
        .reduce((sum, width) => sum + width, 0);

      // const colWidth = this.columnWidths[colIndex] || 50;
      const cellValue = row[key];
      const cellHeight = doc.heightOfString(cellValue?.toString() || "", {
        width: colWidth - 10,
      });

      maxHeight = Math.max(maxHeight, cellHeight + 10);
    });
    return maxHeight;
  }

  drawTitleAndHeader(doc: PDFKit.PDFDocument, startY: number, sh: number = 25) {
    let currentY = startY + sh;
    const titleLines = this.title.split("\n");

    doc
      .fontSize(this.TITLE_FONT_SIZE - this.adjustTitleFontSize)
      .font("Helvetica-Bold")
      .fillColor("black");

    titleLines.forEach((line) => {
      doc.text(line, this.MARGIN.left, currentY, {
        align: "left",
        width: this.PAGE_WIDTH - 2 * this.MARGIN.left,
      });
      currentY +=
        doc.heightOfString(line, {
          width: this.PAGE_WIDTH - 2 * this.MARGIN.left,
          align: "left",
        }) + 5;
    });

    const headerStartY = currentY + 20;
    let maxHeaderHeight = this.scaledRowHeight;

    doc.fontSize(this.scaledFontSize + 2);

    if (this.addDrawingOnHeader) this.addDrawingOnHeader(doc, startY);

    this.headers.forEach((header, colIndex) => {
      const colWidth = this.scaledColumns[colIndex] || 50;
      const textHeight = doc.heightOfString(header.headerName, {
        width: colWidth - 10,
      });
      maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
    });

    let startX = this.MARGIN.left;
    this.headers.forEach((header, colIndex) => {
      const colWidth = this.scaledColumns[colIndex] || 50;
      doc.text(header.headerName, startX + 5, headerStartY + 5, {
        width: colWidth - 10,
        align:
          header.textAlign === "right"
            ? "center"
            : (header.textAlign as
                | "left"
                | "center"
                | "justify"
                | "right"
                | undefined),
      });
      if (this.addHeaderBorderTop) {
        doc
          .moveTo(startX, headerStartY + maxHeaderHeight - 2)
          .lineTo(startX + colWidth, headerStartY + maxHeaderHeight - 2)
          .stroke();
      }
      if (this.addHeaderBorderBottom) {
        doc
          .moveTo(startX, headerStartY - 2)
          .lineTo(startX + colWidth, headerStartY - 2)
          .stroke();
      }

      startX += colWidth;
    });

    return headerStartY + maxHeaderHeight;
  }

  getTitleAndHeaderHeight(doc: PDFKit.PDFDocument, startY: number) {
    let currentY = startY + 25;
    const titleLines = this.title.split("\n");

    doc
      .fontSize(this.TITLE_FONT_SIZE - 3)
      .font("Helvetica-Bold")
      .fillColor("black");

    titleLines.forEach((line) => {
      currentY +=
        doc.heightOfString(line, {
          width: this.PAGE_WIDTH - 2 * this.MARGIN.left,
          align: "left",
        }) + 5;
    });

    const headerStartY = currentY + 20;
    let maxHeaderHeight = this.scaledRowHeight;
    doc.fontSize(this.scaledFontSize + 2);
    this.headers.forEach((header, colIndex) => {
      const colWidth = this.scaledColumns[colIndex] || 50;
      const textHeight = doc.heightOfString(header.headerName, {
        width: colWidth - 10,
      });
      maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
    });

    let startX = this.MARGIN.left;
    this.headers.forEach((header, colIndex) => {
      startX += this.scaledColumns[colIndex] || 50;
    });
    return headerStartY + maxHeaderHeight;
  }

  drawRow(doc: PDFKit.PDFDocument, row: any, rowIndex: number, startY: number) {
    const isBold = this.boldedRows.filter((itm) => itm.rowIndex === rowIndex);
    if (this.addRowHeight) {
      startY = startY + this.addRowHeight(rowIndex);
    }
    // Apply bold font if necessary

    if (this.setRowFontSize > 0) {
      doc.fontSize(8);
    }

    let startX = this.MARGIN.left;

    const alignRow = this.alignmentMap.get(rowIndex);
    // Check if the current row has a span
    const spanInfo = this.spanMap.get(rowIndex);
    const {
      columnIndex,
      spanLength,
      key: SpanKey,
      textAlign: SpanTextAlign,
    } = spanInfo || {};

    let getRowHeight = 0;

    this.keys.forEach((key, colIndex) => {
      // Skip columns that fall within a span range (except the starting column)
      if (
        spanInfo &&
        colIndex > columnIndex &&
        colIndex < columnIndex + spanLength
      ) {
        return;
      }

      // Calculate the column width (spanned width if applicable)
      const colSpan = spanInfo && colIndex === columnIndex ? spanLength : 1;
      const colWidth = this.columnWidths
        .slice(colIndex, colIndex + colSpan)
        .reduce((sum, width) => sum + width, 0);

      let cellValue = "";
      let textHeader = "" as
        | "left"
        | "center"
        | "justify"
        | "right"
        | undefined;

      if (spanInfo && colIndex === columnIndex && SpanKey !== "") {
        textHeader = SpanTextAlign;
        cellValue = row[SpanKey];
      } else {
        textHeader = this.headers[colIndex].textAlign as
          | "left"
          | "center"
          | "justify"
          | "right"
          | undefined;
        cellValue = row[key];
      }
      let startY_ = startY + 5;

      if (isBold.length > 0) {
        if (isBold[0].callback) {
          isBold[0].callback(doc,cellValue, startY_, startX, colWidth, textHeader);
          startX += colWidth;
          return;
        }


        doc.font("Helvetica-Bold");
      } else {
        doc.font("Helvetica");
      }

      if (alignRow && colIndex === alignRow.columnIndex) {
        doc.text(cellValue?.toString() || "", startX + 5, startY_, {
          width: colWidth - 10,
          align: alignRow.align,
        });
      } else {
        if (this.adjustRowXPostion) {
          doc.text(
            cellValue?.toString() || "",
            startX + 5 - this.adjustRowXPostion(rowIndex),
            startY_,
            {
              width: colWidth - 10,
              align: textHeader,
            }
          );
        } else if (this.addPadingfFromLeft) {
          doc.text(
            cellValue?.toString() || "",
            startX + 5 + this.addPadingfFromLeft(rowIndex, colIndex),
            startY_,
            {
              width: colWidth - 10,
              align: textHeader,
            }
          );
        } else {
          doc.text(cellValue?.toString() || "", startX + 5, startY_, {
            width: colWidth - 10,
            align: textHeader,
          });
        }
      }

      // Draw the cell with the corresponding value

      // Check if borders need to be applied for this column
      const borderDetails = this.borderedColumns.find(
        (b: any) =>
          b.rowIndex === rowIndex &&
          b.columnDetails.some((c: any) => c.column === colIndex)
      );
      if (borderDetails) {
        const { borderSides, dash } = borderDetails;
        let columnGap = borderDetails?.columnGap || 0;
        // Draw borders for the cell
        if (dash) {
          if (borderSides.top) {
            doc
              .dash(2, { space: 1 })
              .moveTo(startX + columnGap, startY)
              .lineTo(startX + columnGap + (colWidth - columnGap), startY)
              .stroke()
              .undash();
          }
          if (borderSides.bottom) {
            doc
              .dash(2, { space: 1 })
              .moveTo(startX + columnGap, startY + 7 + this.scaledRowHeight)
              .lineTo(
                startX + columnGap + (colWidth - columnGap),
                startY + 7 + this.scaledRowHeight
              )
              .stroke()
              .undash();
          }
          if (borderSides.left) {
            doc
              .dash(2, { space: 1 })
              .moveTo(startX + columnGap, startY + 7)
              .lineTo(startX + columnGap, startY + 7 + this.scaledRowHeight)
              .stroke()
              .undash();
          }
          if (borderSides.right) {
            doc
              .dash(2, { space: 1 })
              .moveTo(startX + columnGap + (colWidth - columnGap), startY + 7)
              .lineTo(
                startX + columnGap + (colWidth - columnGap),
                startY + 7 + this.scaledRowHeight
              )
              .stroke()
              .undash();
          }
        } else {
          if (borderSides.top) {
            doc
              .moveTo(startX + columnGap, startY)
              .lineTo(startX + columnGap + (colWidth - columnGap), startY)
              .stroke();
          }
          if (borderSides.bottom) {
            doc
              .moveTo(startX + columnGap, startY + 7 + this.scaledRowHeight)
              .lineTo(
                startX + columnGap + (colWidth - columnGap),
                startY + 7 + this.scaledRowHeight
              )
              .stroke();
          }
          if (borderSides.left) {
            doc
              .moveTo(startX + columnGap, startY + 7)
              .lineTo(startX + columnGap, startY + 7 + this.scaledRowHeight)
              .stroke();
          }
          if (borderSides.right) {
            doc
              .moveTo(startX + columnGap + (colWidth - columnGap), startY + 7)
              .lineTo(
                startX + columnGap + (colWidth - columnGap),
                startY + 7 + this.scaledRowHeight
              )
              .stroke();
          }
        }
      }
      // Move to the next column (or skip spanned columns)
      startX += colWidth;
    });
    if (this.drawOnColumn) this.drawOnColumn(row, doc, startY);
  }

  generatePDF(res: Response, addPageNumber = true) {
    const outputFilePath = "manok.pdf";
    const doc = new PDFDocument({
      size: [this.PAGE_WIDTH, this.PAGE_HEIGHT],
      margin: 0,
      bufferPages: true,
    });

    const writeStream = fs.createWriteStream(outputFilePath);
    doc.pipe(writeStream);

    this.calculateScaling();

    // let _startY = this.MARGIN.top + 60;
    // _startY = this.getTitleAndHeaderHeight(doc, this.MARGIN.top / 2);
    // const totalPages = this.getTotalPage(this.data, doc, _startY) ;

    let startY = this.MARGIN.top + 60;
    let currentPage = 1;

    if (this.addHeader) {
      startY = this.drawTitleAndHeader(
        doc,
        this.MARGIN.top / 2 + this.addMarginInFirstPage
      );
    }
    if (this.beforeDraw) {
      startY = this.beforeDraw(this, doc, startY) || startY;
    }

    if (!this.addHeader) {
      startY = this.drawTitleAndHeader(doc, startY, -5);
    }

    this.data.forEach((row: any, rowIndex: any) => {
      const rowHeight =
        this.calculateRowHeight(doc, row, rowIndex) - this.adjustRowHeight;

      if (
        startY + rowHeight + this.scaledRowHeight >
        this.PAGE_HEIGHT - this.MARGIN.bottom
      ) {
        if (this.beforePerPageDraw) {
          this.beforePerPageDraw(this, doc);
        }
        // this.drawPageNumber(doc, currentPage, 0, this);
        // pageNumber(doc,this.PAGE_WIDTH,this.PAGE_HEIGHT)
        doc.addPage({
          size: [this.PAGE_WIDTH, this.PAGE_HEIGHT],
          margin: 0,
          bufferPages: true,
        });

        currentPage += 1;

        if (this.addHeaderPerpage) {
          startY = this.drawTitleAndHeader(doc, this.MARGIN.top / 2);
        } else {
          startY = this.MARGIN.top;
        }
      }
      
      this.drawRow(doc, row, rowIndex, startY);
      startY += rowHeight;
    });

    if (this.drawSubReport) {
      const SUBREPORT_HEIGHT = 150;
      const remainingSpace = this.PAGE_HEIGHT - startY - this.MARGIN.bottom;

      if (remainingSpace < SUBREPORT_HEIGHT) {
        doc.addPage({
          size: [this.PAGE_WIDTH, this.PAGE_HEIGHT],
          margin: 0,
          bufferPages: true,
        });
        startY = this.MARGIN.top;
      }
      this.drawSubReport(doc, startY);
    }

    if (this.beforePerPageDraw) {
      this.beforePerPageDraw(this, doc);
    }
    // this.drawPageNumber(doc, currentPage, 0, this);
    if (addPageNumber) {
      pageNumber(doc, this.PAGE_WIDTH, this.PAGE_HEIGHT);
    }
    doc.end();
    writeStream.on("finish", (e: any) => {
      console.log(`PDF created successfully at: ${outputFilePath}`);
      const readStream = fs.createReadStream(outputFilePath);
      readStream.pipe(res);

      readStream.on("end", () => {
        fs.unlink(outputFilePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log(`File ${outputFilePath} deleted successfully.`);
          }
        });
      });
    });
  }
}

export default PDFReportGenerator;
