export function mapDataBasedOnHeaders(
  dataArray: Array<any>,
  entryHeaders: any,
  key: string
) {
  const headerRow = entryHeaders[key].header;
  const rowKeys = entryHeaders[key].row;

  const mappedData = dataArray.map((dataItem) => {
    return rowKeys.map((key: any) => dataItem[key]);
  });
  return [headerRow, ...mappedData];
}
