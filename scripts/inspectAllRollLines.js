const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const pdfPath = 'C:/Users/aleky/.gemini/antigravity/brain/7266d604-b855-4781-bd22-a198cb585f02/.user_uploaded/media__1785997356225.pdf';
const dataBuffer = fs.readFileSync(pdfPath);
const uint8 = new Uint8Array(dataBuffer);

const parser = new PDFParse(uint8);
parser.getText().then(res => {
  const cleanText = res.text.replace(/\r/g, '');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Group lines by Roll Number occurrence
  const rollBlocks = new Map(); // rollNo -> array of associated text lines

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.matchAll(/\b(24B11AI\d{3}|25B21AI\d{3}|25B61AI\d{3})\b/gi);
    for (const m of matches) {
      const rollNo = m[1].toUpperCase();
      if (!rollBlocks.has(rollNo)) rollBlocks.set(rollNo, []);
      const snippet = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(' | ');
      rollBlocks.get(rollNo).push(snippet);
    }
  }

  console.log(`Unique Roll Numbers found: ${rollBlocks.size}`);

  // Inspect 24B11AI283 (ANEPU YAKSHASRI)
  console.log("\n=== Blocks for 24B11AI283 ===");
  (rollBlocks.get('24B11AI283') || []).forEach((b, idx) => {
    console.log(`[Occurrence ${idx + 1}]: ${b}`);
  });

  // Inspect 24B11AI001 (ADAPA SOWJANYA PRIYA)
  console.log("\n=== Blocks for 24B11AI001 ===");
  (rollBlocks.get('24B11AI001') || []).forEach((b, idx) => {
    console.log(`[Occurrence ${idx + 1}]: ${b}`);
  });

}).catch(err => {
  console.error("PDF parse error:", err);
});
