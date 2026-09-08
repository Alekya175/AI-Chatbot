const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  branch: { type: String, default: 'CSE (AI & ML)' },
  section: { type: String, default: 'Section A' },
  year: { type: String, default: '3rd Year' },
  entranceType: { type: String, default: 'EAMCET' },
  rank: { type: Number, default: 0 },
  hallTicketNo: { type: String, default: '' },
  mobile: { type: String, default: '' },
  gender: { type: String, default: '' },
  category: { type: String, default: '' },
  dob: { type: String, default: '' },
  aadharCardNo: { type: String, default: '' },
  sscBoard: { type: String, default: '' },
  sscInstitute: { type: String, default: '' },
  sscPercentage: { type: String, default: '' },
  interBoard: { type: String, default: '' },
  interInstitute: { type: String, default: '' },
  interPercentage: { type: String, default: '' },
  fatherName: { type: String, default: '' },
  fatherOccupation: { type: String, default: '' },
  fatherMobile: { type: String, default: '' },
  fatherEmail: { type: String, default: '' },
  motherName: { type: String, default: '' },
  motherMobile: { type: String, default: '' },
  cgpa: { type: Number, default: 8.92 },
  attendance: {
    overallPercentage: { type: Number, default: 88.5 },
    totalClasses: { type: Number, default: 320 },
    classesAttended: { type: Number, default: 283 },
    classesAbsent: { type: Number, default: 37 }
  },
  marks: [{
    subject: String,
    score: Number,
    maxScore: Number,
    grade: String
  }],
  feeDetails: {
    totalTuitionFee: { type: Number, default: 115000 },
    scholarshipAmount: { type: Number, default: 35000 },
    feePaid: { type: Number, default: 80000 },
    pendingDues: { type: Number, default: 0 }
  },
  timetable: [{
    time: String,
    subject: String,
    venue: String
  }]
});

module.exports = mongoose.model('Student', StudentSchema);
