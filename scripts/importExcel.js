const path = require('path');
const fs = require('fs');
const excelService = require('../services/excelService');

const filePath = process.argv[2];

if (!filePath) {
  console.log('=====================================================');
  console.log('📊 ADITYA CHATBOT - EXCEL DATASET IMPORT UTILITY');
  console.log('=====================================================');
  console.log('Usage: node scripts/importExcel.js <path-to-excel-file.xlsx>\n');
  console.log('Example: node scripts/importExcel.js C:\\path\\to\\Faculty_List.xlsx');
  console.log('Supported formats: .xlsx, .xls, .csv\n');
  process.exit(0);
}

const resolvedPath = path.resolve(filePath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ Error: File not found at path "${resolvedPath}"`);
  process.exit(1);
}

try {
  console.log(`⏳ Parsing Excel file: "${resolvedPath}"...`);
  const result = excelService.importFacultyExcel(resolvedPath);
  console.log('=====================================================');
  console.log('✅ EXCEL DATASET SUCCESSFULLY IMPORTED & INTEGRATED!');
  console.log('=====================================================');
  console.log(`• Imported Records: ${result.count}`);
  console.log(`• Total Faculty Profiles in Dataset: ${result.totalFaculty}`);
  console.log('• Destination: data/faculty.json & Local Memory Cache');
  console.log('=====================================================\n');
} catch (err) {
  console.error('❌ Excel Import Failed:', err.message);
}
