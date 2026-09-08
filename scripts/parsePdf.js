const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfPath = 'C:/Users/aleky/.gemini/antigravity/brain/7266d604-b855-4781-bd22-a198cb585f02/.user_uploaded/media__1785997356225.pdf';
const dataBuffer = fs.readFileSync(pdfPath);
const uint8 = new Uint8Array(dataBuffer);

const parser = new PDFParse(uint8);
parser.getText().then(res => {
  const text = res.text;
  
  // Match lines with Roll Nos (e.g. 24B11AI001, 25B21AI001, 25B61AI001)
  const rollRegex = /(\d{1,3})\s+([0-9A-Z]{10})\s+([\s\S]*?)\s+AIML\s+V\s+Semester\s+(\d{1,2})/gi;
  let match;
  const students = [];

  // Let's normalize lines first
  const cleanText = text.replace(/\r/g, '');
  
  // Custom regex line by line matcher
  const lines = cleanText.split('\n');
  let currentRoll = null;
  let currentSl = null;
  let currentNameBuffer = [];
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Example: 1 24B11AI001 ADAPA SOWJANYA PRIYA AIML V Semester 6
    // Or multi-line name: 2 24B11AI002 ADABALA VENKATA MANIKANTA SANTOSHKUMAR AIML V Semester 1
    const startMatch = line.match(/^(\d{1,3})\s+([0-9A-Z]{10})\b(.*)/i);
    if (startMatch) {
      if (currentRoll) {
        students.push({
          slNo: parseInt(currentSl),
          regNo: currentRoll,
          name: currentNameBuffer.join(' ').replace(/\s+AIML\s+V\s+Semester.*/i, '').trim(),
          section: currentSection
        });
      }
      currentSl = startMatch[1];
      currentRoll = startMatch[2];
      currentNameBuffer = [startMatch[3].trim()];

      const secMatch = line.match(/AIML\s+V\s+Semester\s+(\d{1,2})/i);
      if (secMatch) {
        currentSection = secMatch[1];
      } else {
        currentSection = '1';
      }
    } else if (currentRoll) {
      const secMatch = line.match(/AIML\s+V\s+Semester\s+(\d{1,2})/i);
      if (secMatch) {
        currentSection = secMatch[1];
        const namePart = line.replace(/AIML\s+V\s+Semester.*/i, '').trim();
        if (namePart) currentNameBuffer.push(namePart);
        students.push({
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

  console.log(`Parsed ${students.length} students from Page 1-22!`);
  console.log("First 5 students:\n", JSON.stringify(students.slice(0, 5), null, 2));
  console.log("Last 5 students:\n", JSON.stringify(students.slice(-5), null, 2));

}).catch(err => {
  console.error("PDF parse error:", err);
});
