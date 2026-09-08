const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfPath = 'C:/Users/aleky/.gemini/antigravity/brain/7266d604-b855-4781-bd22-a198cb585f02/.user_uploaded/media__1785997356225.pdf';
const dataBuffer = fs.readFileSync(pdfPath);
const uint8 = new Uint8Array(dataBuffer);

const parser = new PDFParse(uint8);
parser.getText().then(res => {
  const cleanText = res.text.replace(/\r/g, '');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Regex to match any Roll Number in format 24B11AI001, 25B21AI001, 25B61AI001
  const rollRegex = /\b([0-9]{2}[A-Z0-9]{2}AI[0-9]{3})\b/gi;

  const rollMap = new Map(); // rollNo -> array of line contexts

  for (const line of lines) {
    const matches = line.matchAll(/\b([0-9]{2}[A-Z0-9]{2}AI[0-9]{3})\b/gi);
    for (const m of matches) {
      const roll = m[1].toUpperCase();
      if (!rollMap.has(roll)) rollMap.set(roll, []);
      rollMap.get(roll).push(line);
    }
  }

  console.log(`Found ${rollMap.size} unique Roll Numbers across the PDF!`);
  
  // Print occurrences for ANEPU YAKSHASRI (24B11AI283)
  console.log("\nAll occurrences for 24B11AI283:\n", rollMap.get('24B11AI283'));

  // Print occurrences for 24B11AI001
  console.log("\nAll occurrences for 24B11AI001:\n", rollMap.get('24B11AI001'));

}).catch(err => {
  console.error("PDF parse error:", err);
});
