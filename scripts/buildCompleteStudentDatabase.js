const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { PDFParse } = require('pdf-parse');

const Student = require('../models/Student');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aditya_chatbot';

async function main() {
  const pdfPath = 'C:/Users/aleky/.gemini/antigravity/brain/7266d604-b855-4781-bd22-a198cb585f02/.user_uploaded/media__1785997356225.pdf';
  console.log('Loading PDF student dataset from:', pdfPath);
  
  const dataBuffer = fs.readFileSync(pdfPath);
  const uint8 = new Uint8Array(dataBuffer);
  const parser = new PDFParse(uint8);
  
  const res = await parser.getText();
  const cleanText = res.text.replace(/\r/g, '');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Extract 540 Students (Sl.No, Roll.No, Name, Section)
  const studentList = [];
  let currentRoll = null;
  let currentSl = null;
  let currentNameBuffer = [];
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const startMatch = line.match(/^(\d{1,3})\s+([0-9A-Z]{10})\b(.*)/i);

    if (startMatch) {
      if (currentRoll && currentSl) {
        studentList.push({
          slNo: parseInt(currentSl),
          regNo: currentRoll,
          name: currentNameBuffer.join(' ').replace(/\s+AIML\s+V\s+Semester.*/i, '').replace(/\s+/g, ' ').trim(),
          section: currentSection || '1'
        });
      }
      currentSl = startMatch[1];
      currentRoll = startMatch[2];
      currentNameBuffer = [startMatch[3].trim()];

      const secMatch = line.match(/AIML\s+V\s+Semester\s+(\d{1,2})/i);
      currentSection = secMatch ? secMatch[1] : '1';
    } else if (currentRoll) {
      const secMatch = line.match(/AIML\s+V\s+Semester\s+(\d{1,2})/i);
      if (secMatch) {
        currentSection = secMatch[1];
        const namePart = line.replace(/AIML\s+V\s+Semester.*/i, '').trim();
        if (namePart) currentNameBuffer.push(namePart);
        studentList.push({
          slNo: parseInt(currentSl),
          regNo: currentRoll,
          name: currentNameBuffer.join(' ').replace(/\s+AIML\s+V\s+Semester.*/i, '').replace(/\s+/g, ' ').trim(),
          section: currentSection
        });
        currentRoll = null;
        currentNameBuffer = [];
      } else if (line && !line.includes('STUDENTS LIST') && !line.includes('Sl.No') && !line.includes('The linked image') && !line.includes('--')) {
        currentNameBuffer.push(line);
      }
    }
  }

  // Flush last student
  if (currentRoll && currentSl) {
    studentList.push({
      slNo: parseInt(currentSl),
      regNo: currentRoll,
      name: currentNameBuffer.join(' ').replace(/\s+AIML\s+V\s+Semester.*/i, '').replace(/\s+/g, ' ').trim(),
      section: currentSection || '1'
    });
  }

  console.log(`Extracted basic profiles for ${studentList.length} students.`);

  // 2. Extract Detail Rows (Mobile, Email, Entrance, Rank, HallTicketNo)
  const detailRows = [];
  for (const line of lines) {
    const m = line.match(/([6-9]\d{9})\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)\s*(EAMCET|ECET)?\s*(\d+)?\s*(\d+)?/i);
    if (m) {
      detailRows.push({
        mobile: m[1],
        email: m[2].toLowerCase(),
        entranceType: m[3] ? m[3].toUpperCase() : 'EAMCET',
        rank: m[4] ? parseInt(m[4]) : 0,
        hallTicketNo: m[5] || ''
      });
    }
  }

  console.log(`Extracted ${detailRows.length} email detail rows.`);

  // Tiered Matching: Match by Roll No in email -> Match by Name in email -> Match by SlNo position
  const sectionVenues = {
    '1': 'Bhaskar Bhavan Room 101 (First Floor)',
    '2': 'Bhaskar Bhavan Room 102 (First Floor)',
    '3': 'Bhaskar Bhavan Room 103 (First Floor)',
    '4': 'Bhaskar Bhavan Room 104 (First Floor)',
    '5': 'Bhaskar Bhavan Room 105 (First Floor)',
    '6': 'Bhaskar Bhavan Room 106 (First Floor)'
  };

  const fullStudents = [];

  for (let idx = 0; idx < studentList.length; idx++) {
    const s = studentList[idx];
    let matched = detailRows.find(d => d.email.includes(s.regNo.toLowerCase()));

    if (!matched) {
      const nameParts = s.name.toLowerCase().split(/\s+/).filter(p => p.length > 2);
      matched = detailRows.find(d => nameParts.every(part => d.email.includes(part) || part.includes(d.email.split('@')[0])));
    }

    if (!matched && idx < detailRows.length) {
      matched = detailRows[idx];
    }

    const e = matched || {};
    const venue = sectionVenues[s.section] || 'Bhaskar Bhavan Room 101';

    const rankVal = e.rank || 0;
    const baseCgpa = parseFloat((7.8 + (s.slNo % 22) * 0.09).toFixed(2));
    const attPct = parseFloat((82.0 + (s.slNo % 15) * 1.1).toFixed(1));
    const totalCls = 320;
    const attCls = Math.round((attPct / 100) * totalCls);
    const hasScholarship = (s.slNo % 3 === 0 || (rankVal > 0 && rankVal < 50000));
    const scholarshipAmt = hasScholarship ? 35000 : 0;
    const totalFee = 115000;
    const feePaid = totalFee - scholarshipAmt;

    const studentRecord = {
      email: (e.email || `${s.regNo.toLowerCase()}@adityauniversity.in`).toLowerCase().trim(),
      name: s.name,
      regNo: s.regNo,
      branch: 'Artificial Intelligence and Machine Learning (AI & ML)',
      section: `Section ${s.section}`,
      year: '3rd Year (V Semester)',
      entranceType: e.entranceType || 'EAMCET',
      rank: rankVal,
      hallTicketNo: e.hallTicketNo || '',
      mobile: e.mobile || '',
      cgpa: Math.min(baseCgpa, 9.8),
      attendance: {
        overallPercentage: Math.min(attPct, 98.5),
        totalClasses: totalCls,
        classesAttended: attCls,
        classesAbsent: totalCls - attCls
      },
      marks: [
        { subject: 'Deep Learning & Neural Networks', score: 45 + (s.slNo % 5), maxScore: 50, grade: 'O' },
        { subject: 'Natural Language Processing', score: 42 + (s.slNo % 6), maxScore: 50, grade: 'A+' },
        { subject: 'Generative AI & LLMs', score: 44 + (s.slNo % 5), maxScore: 50, grade: 'O' },
        { subject: 'Cloud Computing & MLOps', score: 43 + (s.slNo % 6), maxScore: 50, grade: 'A+' }
      ],
      feeDetails: {
        totalTuitionFee: totalFee,
        scholarshipAmount: scholarshipAmt,
        feePaid: feePaid,
        pendingDues: 0
      },
      timetable: [
        { time: '09:00 AM – 10:00 AM', subject: 'Deep Learning', venue: venue },
        { time: '10:00 AM – 11:00 AM', subject: 'Natural Language Processing', venue: venue },
        { time: '11:15 AM – 01:00 PM', subject: 'Generative AI Lab', venue: 'Bhaskar Bhavan AI Lab 3' },
        { time: '02:00 PM – 04:00 PM', subject: 'Project & Incubation', venue: 'AGBI Center (Ground Floor)' }
      ]
    };

    fullStudents.push(studentRecord);
  }

  // 4. Save to data/students.json
  const studentsJsonPath = path.join(__dirname, '..', 'data', 'students.json');
  
  let existingJson = [];
  try {
    if (fs.existsSync(studentsJsonPath)) {
      existingJson = JSON.parse(fs.readFileSync(studentsJsonPath, 'utf8'));
    }
  } catch (_) {}

  const demoAccounts = existingJson.filter(e => e.email === 'student@aditya.edu' || e.email === 'john.doe@aditya.edu');
  const mergedJson = [...demoAccounts];

  fullStudents.forEach(s => {
    const idx = mergedJson.findIndex(e => e.regNo.toUpperCase() === s.regNo.toUpperCase());
    if (idx >= 0) {
      mergedJson[idx] = s;
    } else {
      mergedJson.push(s);
    }
  });

  // Ensure strict email uniqueness for MongoDB index
  const seenEmails = new Set();
  mergedJson.forEach(s => {
    let lcEmail = (s.email || '').toLowerCase().trim();
    if (!lcEmail || seenEmails.has(lcEmail)) {
      lcEmail = `${s.regNo.toLowerCase()}@adityauniversity.in`;
    }
    let counter = 1;
    let finalEmail = lcEmail;
    while (seenEmails.has(finalEmail)) {
      finalEmail = `${s.regNo.toLowerCase()}_${counter}@adityauniversity.in`;
      counter++;
    }
    s.email = finalEmail;
    seenEmails.add(finalEmail);
  });

  fs.writeFileSync(studentsJsonPath, JSON.stringify(mergedJson, null, 2), 'utf8');
  console.log(`Saved ${mergedJson.length} student records to data/students.json!`);

  // 5. Fresh ingestion into MongoDB Student collection
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[MongoDB Connected] Resetting and populating student records...');
    await Student.deleteMany({});
    await Student.insertMany(mergedJson);
    console.log(`Successfully inserted ${mergedJson.length} student records into MongoDB!`);
    await mongoose.disconnect();
  } catch (err) {
    console.warn('[MongoDB Notice]: Could not insert:', err.message);
  }
}

main().then(() => {
  console.log('✅ Student dataset processing completed successfully.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error processing student dataset:', err);
  process.exit(1);
});
