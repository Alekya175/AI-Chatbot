const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfPath = 'C:/Users/aleky/.gemini/antigravity/brain/7266d604-b855-4781-bd22-a198cb585f02/.user_uploaded/media__1785997356225.pdf';
const dataBuffer = fs.readFileSync(pdfPath);
const uint8 = new Uint8Array(dataBuffer);

const parser = new PDFParse(uint8);
parser.getText().then(res => {
  const cleanText = res.text.replace(/\r/g, '');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Extract student details lines from pages 45 to 66
  const detailRows = [];
  for (const line of lines) {
    // Match line starting with mobile number or Sl.No or Roll.No followed by mobile
    const m = line.match(/(?:(?:[0-9]{1,12}|24B11AI\d{3})\s+)?([6-9]\d{9})\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)\s*(EAMCET|ECET)?\s*(\d+)?\s*(\d+)?/i);
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

  console.log(`Extracted ${detailRows.length} detail rows for 540 students.`);
  console.log("Row 279 (SlNo 279 - ANEPU YAKSHASRI):", detailRows[278]);

}).catch(err => {
  console.error("Error:", err);
});
