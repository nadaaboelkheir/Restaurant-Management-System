const ExcelJS = require("exceljs");
const moment = require("moment");

exports.createExcelFile = async (res, fileName, columns, data) => {
  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(fileName);

  worksheet.columns = columns.map((column) => ({
    ...column,
    style: {
      font: { bold: true },
      alignment: { vertical: "middle", horizontal: "center" },
    },
  }));

  data.forEach((rowData, index) => {
    const row = worksheet.addRow(rowData);

    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEFEFEF" },
        };
      });
    }
  });

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0000FF" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  headerRow.height = 20;

  worksheet.columns.forEach((column) => {
    column.width = column.width || 20;
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${fileName}-${moment().format(
      "YYYY-MM-DD_HH-mm-ss"
    )}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};
