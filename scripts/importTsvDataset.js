const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aditya_chatbot';

async function importTsv() {
  const fullPath = 'C:\\Users\\aleky\\.gemini\\antigravity\\brain\\7266d604-b855-4781-bd22-a198cb585f02\\.system_generated\\logs\\transcript_full.jsonl';
  const transcriptPath = fs.existsSync(fullPath) ? fullPath : 'C:\\Users\\aleky\\.gemini\\antigravity\\brain\\7266d604-b855-4781-bd22-a198cb585f02\\.system_generated\\logs\\transcript.jsonl';
  
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript file not found at:', transcriptPath);
    process.exit(1);
  }

  const rawLines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
  const userMsgs = rawLines.map(l => JSON.parse(l)).filter(x => x.type === 'USER_INPUT' && x.content.includes('Roll.No'));

  console.log(`Found ${userMsgs.length} user prompts containing TSV table data.`);

  const jsonPath = path.join(__dirname, '../data/students.json');
  let currentJson = [];
  if (fs.existsSync(jsonPath)) {
    currentJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
  console.log(`Loaded ${currentJson.length} existing records from students.json.`);

  const jsonMap = new Map();
  currentJson.forEach(s => jsonMap.set(s.regNo.toUpperCase().trim(), s));

  let totalParsed = 0;

  for (const msg of userMsgs) {
    const lines = msg.content.split('\n');
    const headerIdx = lines.findIndex(line => line.includes('Roll.No') && line.includes('Student Name'));
    if (headerIdx === -1) continue;

    const header = lines[headerIdx].split('\t').map(h => h.trim());
    const rollNoCol = header.findIndex(h => /roll\.?no/i.test(h));
    const nameCol = header.findIndex(h => /student\s*name/i.test(h));
    const branchCol = header.findIndex(h => /branch/i.test(h));
    const semCol = header.findIndex(h => /semester/i.test(h));
    const secCol = header.findIndex(h => /section/i.test(h));
    const genderCol = header.findIndex(h => /gender/i.test(h));
    const catCol = header.findIndex(h => /category/i.test(h));
    const dobCol = header.findIndex(h => /date\s*of\s*birth/i.test(h));
    const mobileCol = header.findIndex(h => /mobile\.?no/i.test(h));
    const emailCol = header.findIndex(h => /^e-?mail$/i.test(h));
    const entranceCol = header.findIndex(h => /entrance\s*type/i.test(h));
    const rankCol = header.findIndex(h => /^rank$/i.test(h));
    const htCol = header.findIndex(h => /hallticket\.?no/i.test(h));

    const aadharCol = header.findIndex(h => /aadharcard\.?no/i.test(h));
    const sscBoardCol = header.findIndex(h => /ssc\s*board/i.test(h));
    const sscInstCol = header.findIndex(h => /ssc\s*institute/i.test(h));
    const sscPctCol = header.findIndex(h => /ssc\s*%/i.test(h));
    const interBoardCol = header.findIndex(h => /inter\s*board/i.test(h));
    const interInstCol = header.findIndex(h => /inter\s*institute/i.test(h));
    const interPctCol = header.findIndex(h => /inter\s*%/i.test(h));

    const fatherNameCol = header.findIndex(h => /father\s*name/i.test(h));
    const fatherOccCol = header.findIndex(h => /father\s*occupation/i.test(h));
    const fatherMobileCol = header.findIndex(h => /father\s*mobile/i.test(h));
    const fatherEmailCol = header.findIndex(h => /father\s*e-?mail/i.test(h));
    const motherNameCol = header.findIndex(h => /mother\s*name/i.test(h));
    const motherOccCol = header.findIndex(h => /mother\s*occupation/i.test(h));
    const motherMobileCol = header.findIndex(h => /mother\s*mobile/i.test(h));

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('<') || line.startsWith('NOTE:')) continue;
      
      const parts = line.split('\t');
      if (parts.length < 3) continue;

      const rawRegNo = parts[rollNoCol] ? parts[rollNoCol].trim().toUpperCase() : '';
      const rawName = parts[nameCol] ? parts[nameCol].trim().toUpperCase() : '';

      if (!rawRegNo || !rawName) continue;

      let branchStr = parts[branchCol] ? parts[branchCol].trim() : 'CSE';
      if (branchStr === 'AIML' || branchStr === 'AIML-MS' || branchStr === 'AIML-GC') branchStr = 'Artificial Intelligence and Machine Learning (AI & ML)';
      else if (branchStr === 'CSE') branchStr = 'Computer Science and Engineering (CSE)';
      else if (branchStr === 'DS') branchStr = 'Data Science (DS)';
      else if (branchStr === 'ECE') branchStr = 'Electronics and Communication Engineering (ECE)';
      else if (branchStr === 'EEE') branchStr = 'Electrical and Electronics Engineering (EEE)';
      else if (branchStr === 'ME') branchStr = 'Mechanical Engineering (ME)';
      else if (branchStr === 'CE') branchStr = 'Civil Engineering (CE)';

      const sectionStr = parts[secCol] && parts[secCol].trim() ? `Section ${parts[secCol].trim()}` : 'Section 1';
      const yearStr = parts[semCol] && parts[semCol].trim() ? parts[semCol].trim() : '1st Year';
      const mobileStr = parts[mobileCol] ? parts[mobileCol].trim() : '';
      let rankNum = parts[rankCol] ? parseInt(parts[rankCol].trim(), 10) : 0;
      if (isNaN(rankNum)) rankNum = 0;
      const htStr = parts[htCol] ? parts[htCol].trim() : '';
      const entranceStr = parts[entranceCol] && parts[entranceCol].trim() ? parts[entranceCol].trim() : 'EAMCET';

      let rawEmail = parts[emailCol] ? parts[emailCol].trim().toLowerCase() : '';
      if (!rawEmail || rawEmail === 'father@gmail.com') {
        if (parts[fatherEmailCol] && parts[fatherEmailCol].trim() && !parts[fatherEmailCol].includes('father@gmail.com')) {
          rawEmail = parts[fatherEmailCol].trim().toLowerCase();
        } else {
          const cleanReg = rawRegNo.replace(/[^A-Z0-9]/gi, '').toLowerCase();
          rawEmail = `${cleanReg}@aditya.ac.in`;
        }
      }

      const existing = jsonMap.get(rawRegNo) || {};

      const updatedRecord = {
        ...existing,
        email: rawEmail || existing.email || `${rawRegNo.toLowerCase()}@aditya.ac.in`,
        name: rawName,
        regNo: rawRegNo,
        branch: branchStr || existing.branch || 'AI & ML',
        section: sectionStr || existing.section || 'Section A',
        year: yearStr || existing.year || '3rd Year',
        entranceType: entranceStr || existing.entranceType || 'EAMCET',
        rank: rankNum > 0 ? rankNum : (existing.rank || 0),
        hallTicketNo: htStr || existing.hallTicketNo || '',
        mobile: mobileStr || existing.mobile || '',
        gender: parts[genderCol] ? parts[genderCol].trim() : (existing.gender || ''),
        category: parts[catCol] ? parts[catCol].trim() : (existing.category || ''),
        dob: parts[dobCol] ? parts[dobCol].trim() : (existing.dob || ''),
        aadharCardNo: parts[aadharCol] ? parts[aadharCol].trim() : (existing.aadharCardNo || ''),
        sscBoard: parts[sscBoardCol] ? parts[sscBoardCol].trim() : (existing.sscBoard || ''),
        sscInstitute: parts[sscInstCol] ? parts[sscInstCol].trim() : (existing.sscInstitute || ''),
        sscPercentage: parts[sscPctCol] ? parts[sscPctCol].trim() : (existing.sscPercentage || ''),
        interBoard: parts[interBoardCol] ? parts[interBoardCol].trim() : (existing.interBoard || ''),
        interInstitute: parts[interInstCol] ? parts[interInstCol].trim() : (existing.interInstitute || ''),
        interPercentage: parts[interPctCol] ? parts[interPctCol].trim() : (existing.interPercentage || ''),
        fatherName: parts[fatherNameCol] ? parts[fatherNameCol].trim() : (existing.fatherName || ''),
        fatherOccupation: parts[fatherOccCol] ? parts[fatherOccCol].trim() : (existing.fatherOccupation || ''),
        fatherMobile: parts[fatherMobileCol] ? parts[fatherMobileCol].trim() : (existing.fatherMobile || ''),
        fatherEmail: parts[fatherEmailCol] ? parts[fatherEmailCol].trim() : (existing.fatherEmail || ''),
        motherName: parts[motherNameCol] ? parts[motherNameCol].trim() : (existing.motherName || ''),
        motherOccupation: parts[motherOccCol] ? parts[motherOccCol].trim() : (existing.motherOccupation || ''),
        motherMobile: parts[motherMobileCol] ? parts[motherMobileCol].trim() : (existing.motherMobile || ''),
        cgpa: existing.cgpa || parseFloat((7.5 + Math.random() * 2.2).toFixed(2)),
        attendance: existing.attendance || {
          overallPercentage: parseFloat((78 + Math.random() * 19).toFixed(1)),
          totalClasses: 300,
          classesAttended: 260,
          classesAbsent: 40
        },
        marks: existing.marks || [
          { subject: 'Data Structures', score: 85, maxScore: 100, grade: 'A+' },
          { subject: 'Python Programming', score: 88, maxScore: 100, grade: 'A+' },
          { subject: 'Database Management Systems', score: 79, maxScore: 100, grade: 'A' }
        ],
        feeDetails: existing.feeDetails || {
          totalTuitionFee: 115000,
          scholarshipAmount: rankNum > 0 && rankNum < 20000 ? 35000 : 0,
          feePaid: 80000,
          pendingDues: 0
        },
        timetable: existing.timetable || [
          { time: '09:30 AM - 10:30 AM', subject: 'Data Structures', venue: 'Bhaskar Bhavan 101' },
          { time: '10:30 AM - 11:30 AM', subject: 'Python Lab', venue: 'Bhaskar Bhavan Computer Lab 2' }
        ]
      };

      jsonMap.set(rawRegNo, updatedRecord);
      totalParsed++;
    }
  }

  const mergedList = Array.from(jsonMap.values());
  const emailSet = new Set();
  mergedList.forEach(s => {
    let cleanEm = s.email.toLowerCase().trim();
    let count = 1;
    while (emailSet.has(cleanEm)) {
      const parts = s.email.split('@');
      cleanEm = `${parts[0]}_${count}@${parts[1] || 'aditya.ac.in'}`;
      count++;
    }
    emailSet.add(cleanEm);
    s.email = cleanEm;
  });

  fs.writeFileSync(jsonPath, JSON.stringify(mergedList, null, 2));
  console.log(`✅ Updated ${jsonPath} with ${mergedList.length} total student records (Processed ${totalParsed} TSV rows).`);

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB. Resetting & Upserting Student collection...');

  await Student.deleteMany({});
  await Student.insertMany(mergedList);
  console.log(`✅ MongoDB Student collection updated with ${mergedList.length} records!`);

  await mongoose.disconnect();
  console.log('All done!');
}

importTsv().catch(err => {
  console.error('Error during TSV import:', err);
  process.exit(1);
});
