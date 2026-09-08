const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');

/**
 * Universal Excel / CSV Dataset Importer Service
 * Parses uploaded .xlsx, .xls, .csv files and automatically populates Chatbot Datasets & MongoDB.
 */

// Helper to convert sheet rows into normalized JSON objects
function parseWorkbook(filePath) {
  const workbook = XLSX.readFile(filePath);
  const result = {};
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    result[sheetName] = jsonData;
  });

  return result;
}

// Import Faculty Directory Excel Sheet
function importFacultyExcel(filePath) {
  const parsed = parseWorkbook(filePath);
  const firstSheetName = Object.keys(parsed)[0];
  const rows = parsed[firstSheetName];

  if (!rows || rows.length === 0) {
    throw new Error('Excel sheet is empty or invalid.');
  }

  const facultyPath = path.join(__dirname, '..', 'data', 'faculty.json');
  let existingFaculty = [];
  try {
    if (fs.existsSync(facultyPath)) {
      existingFaculty = JSON.parse(fs.readFileSync(facultyPath, 'utf8'));
    }
  } catch (_) {}

  let importedCount = 0;

  rows.forEach(row => {
    // Map column headers flexibly
    const name = row['Name of the staff'] || row['Name'] || row['Faculty Name'] || row['Staff Name'] || '';
    if (!name) return;

    const empId = String(row['Emp ID'] || row['EmpID'] || row['Employee ID'] || '');
    const designation = row['Designation'] || 'Faculty Member';
    const department = row['Department'] || 'Artificial Intelligence and Machine Learning (AI & ML)';
    const block = row['Block'] || row['Building'] || 'Bhaskar Bhavan';
    const floor = row['Floor'] || 'First Floor';
    const cabin = row['Cabin no'] || row['Cabin'] || row['Room'] || 'Faculty Cabin';
    const mobile = String(row['Mob. No.'] || row['Mobile'] || row['Phone'] || '');

    const record = {
      empId,
      name: name.trim(),
      designation: designation.trim(),
      department: department.trim(),
      block: block.trim(),
      floor: floor.trim(),
      cabin: cabin.trim(),
      mobile: mobile.trim()
    };

    // Update existing record or add new
    const idx = existingFaculty.findIndex(f => (empId && f.empId === empId) || f.name.toLowerCase() === name.toLowerCase());
    if (idx >= 0) {
      existingFaculty[idx] = { ...existingFaculty[idx], ...record };
    } else {
      existingFaculty.push(record);
    }
    importedCount++;
  });

  fs.writeFileSync(facultyPath, JSON.stringify(existingFaculty, null, 2), 'utf8');
  return { success: true, count: importedCount, totalFaculty: existingFaculty.length };
}

// Import Student Academic Records Excel Sheet into MongoDB
async function importStudentExcel(filePath) {
  const parsed = parseWorkbook(filePath);
  const firstSheetName = Object.keys(parsed)[0];
  const rows = parsed[firstSheetName];

  if (!rows || rows.length === 0) {
    throw new Error('Excel sheet is empty or invalid.');
  }

  let importedCount = 0;

  for (const row of rows) {
    const regNo = String(row['RegNo'] || row['Registration No'] || row['Roll No'] || row['Reg No'] || '').trim();
    const email = String(row['Email'] || row['Student Email'] || `${regNo.toLowerCase()}@aditya.ac.in`).trim();
    const name = String(row['Name'] || row['Student Name'] || 'Student').trim();

    if (!regNo && !email) continue;

    const attendancePct = parseFloat(row['Attendance %'] || row['Attendance'] || 85.0);
    const totalClasses = parseInt(row['Total Classes'] || 320);
    const attendedClasses = parseInt(row['Classes Attended'] || Math.round((attendancePct / 100) * totalClasses));
    const absentClasses = totalClasses - attendedClasses;

    const cgpa = parseFloat(row['CGPA'] || row['GPA'] || 8.5);

    const studentData = {
      regNo,
      email,
      name,
      branch: row['Branch'] || 'CSE (AI & ML)',
      section: row['Section'] || 'Section A',
      year: row['Year'] || '3rd Year',
      attendance: {
        overallPercentage: attendancePct,
        totalClasses,
        classesAttended: attendedClasses,
        classesAbsent: absentClasses
      },
      cgpa,
      feeDetails: {
        totalTuitionFee: parseFloat(row['Total Fee'] || 115000),
        scholarshipAmount: parseFloat(row['Scholarship'] || 35000),
        feePaid: parseFloat(row['Fee Paid'] || 80000),
        pendingDues: parseFloat(row['Pending Dues'] || 0)
      }
    };

    try {
      await Student.findOneAndUpdate(
        { $or: [{ email }, { regNo }] },
        { $set: studentData },
        { upsert: true, new: true }
      );
      importedCount++;
    } catch (err) {
      console.warn('[Excel Import Notice]: Could not save student to DB:', err.message);
    }
  }

  return { success: true, count: importedCount };
}

module.exports = { parseWorkbook, importFacultyExcel, importStudentExcel };
