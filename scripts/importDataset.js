/**
 * Bulk Dataset Importer Script for Aditya Chatbot (MongoDB)
 * Usage: Place your students.json or kb.json in data/ folder and run `node scripts/importDataset.js`
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const KnowledgeBase = require('../models/KnowledgeBase');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aditya_chatbot';

async function importDataset() {
  try {
    console.log('[Dataset Importer] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Dataset Importer] Connected to MongoDB successfully.');

    // 1. Import Students Dataset (if data/students.json exists)
    const studentPath = path.join(__dirname, '..', 'data', 'students.json');
    if (fs.existsSync(studentPath)) {
      const studentData = JSON.parse(fs.readFileSync(studentPath, 'utf8'));
      console.log(`[Dataset Importer] Found ${studentData.length} student records in data/students.json`);
      
      for (const student of studentData) {
        await Student.findOneAndUpdate(
          { email: student.email.toLowerCase().trim() },
          { $set: student },
          { upsert: true, new: true }
        );
      }
      console.log('[Dataset Importer] Successfully imported/updated all student records.');
    } else {
      console.log('[Dataset Importer] No data/students.json file found (skipping student import).');
    }

    // 2. Import Knowledge Base Dataset (if data/knowledgebase.json exists)
    const kbPath = path.join(__dirname, '..', 'data', 'knowledgebase.json');
    if (fs.existsSync(kbPath)) {
      const kbData = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
      console.log(`[Dataset Importer] Found ${kbData.length} KB articles in data/knowledgebase.json`);
      
      for (const item of kbData) {
        await KnowledgeBase.findOneAndUpdate(
          { key: item.key },
          { $set: item },
          { upsert: true, new: true }
        );
      }
      console.log('[Dataset Importer] Successfully imported/updated all Knowledge Base entries.');
    } else {
      console.log('[Dataset Importer] No data/knowledgebase.json file found (skipping KB import).');
    }

    console.log('\n✅ Dataset Import Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing dataset:', err.message);
    process.exit(1);
  }
}

importDataset();
