const mongoose = require('mongoose');
const KnowledgeBase = require('../models/KnowledgeBase');
const Student = require('../models/Student');
const User = require('../models/User');
const { AU_KB } = require('../services/nlpEngine');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aditya_chatbot';

let isConnected = false;

const seedDatabase = async () => {
  try {
    // Seed KnowledgeBase documents
    const kbCount = await KnowledgeBase.countDocuments();
    if (kbCount === 0) {
      console.log('[MongoDB Seed] Seeding Knowledge Base documents into MongoDB...');
      const docs = Object.entries(AU_KB).map(([key, content]) => ({
        key,
        category: key,
        title: key.toUpperCase(),
        content,
        keywords: [key, 'aditya', 'university', 'info']
      }));
      await KnowledgeBase.insertMany(docs);
      console.log(`[MongoDB Seed] Successfully seeded ${docs.length} Knowledge Base entries.`);
    }

    // Seed Default Demo Student User Account
    const defaultUser = await User.findOne({ email: 'student@aditya.edu' });
    if (!defaultUser) {
      console.log('[MongoDB Seed] Seeding Default Demo Student User Account...');
      await User.create({
        name: 'Aditya Student',
        email: 'student@aditya.edu',
        password: '123456',
        regNo: '21A91A0501',
        role: 'student'
      });
      console.log('[MongoDB Seed] Default student account created.');
    }

    // Seed Default Student Record
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('[MongoDB Seed] Seeding Default Student Record into MongoDB...');
      await Student.create({
        email: 'student@aditya.edu',
        name: 'Aditya Student',
        regNo: '21A91A0501',
        branch: 'CSE (AI & ML)',
        section: 'Section A',
        year: '3rd Year',
        cgpa: 8.92,
        attendance: {
          overallPercentage: 88.5,
          totalClasses: 320,
          classesAttended: 283,
          classesAbsent: 37
        },
        marks: [
          { subject: 'AI & Machine Learning', score: 46, maxScore: 50, grade: 'A+' },
          { subject: 'Web Technologies', score: 48, maxScore: 50, grade: 'O' },
          { subject: 'Cloud Computing (Google)', score: 44, maxScore: 50, grade: 'A+' },
          { subject: 'Database Management Systems', score: 47, maxScore: 50, grade: 'O' }
        ],
        feeDetails: {
          totalTuitionFee: 115000,
          scholarshipAmount: 35000,
          feePaid: 80000,
          pendingDues: 0
        },
        timetable: [
          { time: '09:00 AM – 10:00 AM', subject: 'AI & ML', venue: 'Lab 3' },
          { time: '10:00 AM – 11:00 AM', subject: 'Web Technologies', venue: 'LH-201' },
          { time: '11:15 AM – 01:00 PM', subject: 'Cloud Computing Workshop', venue: 'Auditorium' },
          { time: '02:00 PM – 04:00 PM', subject: 'Project Lab & Incubation', venue: 'AGBI Center' }
        ]
      });
      console.log('[MongoDB Seed] Successfully seeded default student record.');
    }
  } catch (err) {
    console.warn('[MongoDB Seed Warning]:', err.message);
  }
};

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      maxPoolSize: 100,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4
    });

    isConnected = true;
    console.log(`[MongoDB Connected] Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
    
    // Seed initial database documents
    await seedDatabase();
  } catch (err) {
    console.warn(`[MongoDB Warning] Operating in High-Speed Cache Fallback mode. (${err.message})`);
  }
};

module.exports = { connectDB };
