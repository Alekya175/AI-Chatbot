import { processChatQuery, getKnowledgeBase } from './services/ragEngine.js';

async function runComprehensiveTests() {
  console.log('🧪 Running Comprehensive Domain Tests for Aditya Chatbot...\n');

  const conciseAnswer = await processChatQuery('Who is the HOD of the CSE department?');
  console.log(`🔍 Concise answer check: ${conciseAnswer.answer.length} chars`);
  if (conciseAnswer.answer.length > 220) {
    throw new Error('Direct factual answers are too long. They should remain concise and answer only the asked question.');
  }

  const complaintAnswer = await processChatQuery('I have an issue with my faculty and my attendance is marked incorrectly.');
  if (!complaintAnswer.requiresAdmin) {
    throw new Error('Faculty and college complaints must be marked for admin forwarding.');
  }

  const guestPrivateAnswer = await processChatQuery('What are my marks and attendance?', [], 'guest');
  if (guestPrivateAnswer.relatedMetaData?.type !== 'guestPrivacy' || guestPrivateAnswer.answer.includes('attendance')) {
    throw new Error('Guest users must not receive personal academic information.');
  }

  const studentProfileAnswer = await processChatQuery('What are my academic details?', [], 'student', 'aarav.reddy@aditya.ac.in');
  if (studentProfileAnswer.relatedMetaData?.type !== 'studentProfile' || !studentProfileAnswer.answer.includes('Aarav Reddy')) {
    throw new Error('Student personal academic details must be scoped to the logged-in email.');
  }

  const studentCgpaAnswer = await processChatQuery('What is my CGPA?', [], 'student', 'aarav.reddy@aditya.ac.in');
  if (studentCgpaAnswer.answer !== 'Your CGPA is 8.72.') {
    throw new Error('CGPA questions must return only the CGPA answer.');
  }

  const studentMarksAnswer = await processChatQuery('What are my marks?', [], 'student', 'aarav.reddy@aditya.ac.in');
  if (studentMarksAnswer.answer !== 'Your academic score is reflected in your CGPA: 8.72.') {
    throw new Error('Marks questions must return only the marks answer.');
  }

  const studentAttendanceAnswer = await processChatQuery('What is my attendance?', [], 'student', 'aarav.reddy@aditya.ac.in');
  if (studentAttendanceAnswer.answer !== 'Your attendance is 91%.') {
    throw new Error('Attendance questions must return only the attendance answer.');
  }

  const studentComplaint = await processChatQuery('I have an issue with my faculty', [], 'student', 'aarav.reddy@aditya.ac.in');
  if (studentComplaint.relatedMetaData?.type !== 'adminEscalation') {
    throw new Error('Student complaints must be forwarded instead of returning profile details.');
  }

  const testQueries = [
    { category: 'Class Details & Timetables', query: 'Show me the B.Tech CSE class timetable and schedule' },
    { category: 'Faculty Details', query: "What are Dr. Sarah Jenkins' office hours and office location?" },
    { category: 'Departments', query: 'Tell me about the Computer Science Department and HOD' },
    { category: 'Classrooms & Directions', query: 'Where is CS-LAB3 and how do I get there?' },
    { category: 'Campus Events', query: 'When is the Aditya TechFest and Hackathon 2026?' },
    { category: 'Academic Regulations', query: 'What is the 75% attendance rule policy?' },
    { category: 'Campus Facilities', query: 'What are the operating hours of the Central Library?' },
    { category: 'Notifications', query: 'List recent college notifications' },
    { category: 'Admissions', query: 'What are the B.Tech CSE admission eligibility criteria?' },
    { category: 'Hostel & Transport', query: 'What are the hostel curfew hours and bus pass fees?' },
    { category: 'Scholarships & Fees', query: 'What is the Aditya Merit Super-30 Scholarship?' }
  ];

  let passed = 0;
  for (const t of testQueries) {
    console.log(`🔍 [${t.category}] Query: "${t.query}"`);
    const res = await processChatQuery(t.query);
    console.log(`   Engine: ${res.engine}`);
    console.log(`   Answer Snippet: ${res.answer.substring(0, 120).replace(/\n/g, ' ')}...`);
    if (res.answer && !res.answer.includes('Welcome to **Aditya Chatbot**! I can assist you with')) {
      console.log(`   ✅ Matched Domain Category: ${res.relatedMetaData?.type || 'Specific Match'}`);
      passed++;
    } else {
      console.log(`   ⚠️ Generic Fallback Returned`);
    }
    console.log('----------------------------------------------------------------------\n');
  }

  console.log(`🎉 Total Tests Passed: ${passed} / ${testQueries.length}`);
  if (passed === testQueries.length) {
    console.log('✨ All 11 domain queries returned accurate, specific knowledge base details!');
  } else {
    process.exit(1);
  }
}

runComprehensiveTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
