const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfPath = 'C:/Users/aleky/.gemini/antigravity/brain/7266d604-b855-4781-bd22-a198cb585f02/.user_uploaded/media__1785997356225.pdf';
const dataBuffer = fs.readFileSync(pdfPath);
const uint8 = new Uint8Array(dataBuffer);

const parser = new PDFParse(uint8);
parser.getText().then(res => {
  const cleanText = res.text.replace(/\r/g, '');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Extract 540 Student Names & Roll Numbers (SlNo 1 to 540)
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

  console.log(`Parsed ${studentList.length} student basic profiles.`);

  // 2. Extract 540 Entrance lines
  const entranceLines = lines.filter(l => /\b(EAMCET|ECET)\b/i.test(l));
  console.log(`Parsed ${entranceLines.length} entrance lines.`);

  const detailRows = entranceLines.map(line => {
    const m = line.match(/([6-9]\d{9})\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)\s*(EAMCET|ECET)?\s*(\d+)?\s*(\d+)?/i);
    if (m) {
      return {
        mobile: m[1],
        email: m[2].toLowerCase(),
        entranceType: m[3] ? m[3].toUpperCase() : 'EAMCET',
        rank: m[4] ? parseInt(m[4]) : 0,
        hallTicketNo: m[5] || ''
      };
    }
    return null;
  }).filter(Boolean);

  // Combine 1-to-1 by array index
  const matchedStudents = studentList.map((s, idx) => {
    const e = detailRows[idx] || {};
    return {
      slNo: s.slNo,
      regNo: s.regNo,
      name: s.name,
      section: s.section,
      email: e.email || `${s.regNo.toLowerCase()}@adityauniversity.in`,
      mobile: e.mobile || 'N/A',
      entranceType: e.entranceType || 'EAMCET',
      rank: e.rank || 0,
      hallTicketNo: e.hallTicketNo || ''
    };
  });

  // Verify ANEPU YAKSHASRI (SlNo 279, 24B11AI283)
  const yakshasri = matchedStudents.find(x => x.regNo === '24B11AI283' || x.name.includes('YAKSHASRI'));
  console.log("\n=== Verified Profile for 24B11AI283 (ANEPU YAKSHASRI) ===");
  console.log(JSON.stringify(yakshasri, null, 2));

}).catch(err => {
  console.error("PDF parse error:", err);
});
