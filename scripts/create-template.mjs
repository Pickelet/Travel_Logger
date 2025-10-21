import ExcelJS from 'exceljs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1', {
    views: [{ state: 'frozen', ySplit: 3 }]
  });

  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(2).width = 40;
  worksheet.getColumn(3).width = 12;
  worksheet.getColumn(4).width = 50;

  worksheet.getCell('A3').value = 'Date';
  worksheet.getCell('B3').value = 'Trip Description';
  worksheet.getCell('C3').value = 'Miles';
  worksheet.getCell('D3').value = 'Business Purpose (required)';

  const outputPath = resolve(__dirname, '../public/mileage_template.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Template written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
