import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  processChatQuery, 
  getKnowledgeBase, 
  updateKnowledgeBase 
} from './services/ragEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Status
app.get('/api/status', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'online',
    activeEngine: hasGeminiKey ? 'Gemini 1.5 Flash AI' : 'Apex Local RAG Engine',
    hasGeminiKey,
    university: 'Apex Institute of Technology & Science',
    timestamp: new Date().toISOString()
  });
});

// Chat Bot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { query, history, role = 'student', studentEmail = '' } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const result = await processChatQuery(query, history || [], role, studentEmail);
    res.json(result);
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process AI chat query', details: err.message });
  }
});

// Departments Endpoint
app.get('/api/departments', (req, res) => {
  const kb = getKnowledgeBase();
  res.json(kb.departments || []);
});

// Classrooms & Navigation Endpoint
app.get('/api/classrooms', (req, res) => {
  const kb = getKnowledgeBase();
  let rooms = kb.classrooms || [];
  const { search } = req.query;
  if (search) {
    const s = search.toString().toLowerCase();
    rooms = rooms.filter(r => 
      r.code.toLowerCase().includes(s) || 
      r.name.toLowerCase().includes(s) || 
      r.building.toLowerCase().includes(s)
    );
  }
  res.json(rooms);
});

// Faculty Directory Endpoint
app.get('/api/faculty', (req, res) => {
  const kb = getKnowledgeBase();
  let facultyList = kb.faculty || [];
  const { search, department } = req.query;
  
  if (department && department !== 'All') {
    facultyList = facultyList.filter(f => f.department.toLowerCase().includes(department.toString().toLowerCase()));
  }
  if (search) {
    const s = search.toString().toLowerCase();
    facultyList = facultyList.filter(f => 
      f.name.toLowerCase().includes(s) || 
      f.research.toLowerCase().includes(s) || 
      f.office.toLowerCase().includes(s)
    );
  }
  
  res.json(facultyList);
});

// Events Endpoint
app.get('/api/events', (req, res) => {
  const kb = getKnowledgeBase();
  let eventsList = kb.events || [];
  const { category } = req.query;
  if (category && category !== 'All') {
    eventsList = eventsList.filter(e => e.category.toLowerCase().includes(category.toString().toLowerCase()));
  }
  res.json(eventsList);
});

// Regulations Endpoint
app.get('/api/regulations', (req, res) => {
  const kb = getKnowledgeBase();
  res.json(kb.regulations || []);
});

// Facilities Endpoint
app.get('/api/facilities', (req, res) => {
  const kb = getKnowledgeBase();
  res.json(kb.facilities || []);
});

// In-memory persistent store for student queries & notifications
let studentQueriesStore = [
  {
    id: 'q-101',
    studentName: 'Rahul Kumar',
    studentRoll: '22CSE001',
    studentEmail: 'rahul001@college.edu',
    topic: 'General Issue',
    category: 'General',
    question: 'I have an issue with math faculty',
    status: 'Answered',
    dateStr: '22 Jul, 11:28 am',
    adminReply: 'I will check',
    answeredAt: '22/7/2026, 11:29:05 am'
  },
  {
    id: 'q-102',
    studentName: 'Rahul Kumar',
    studentRoll: '22CSE001',
    studentEmail: 'rahul001@college.edu',
    topic: 'Faculty Allocation',
    category: 'Faculty',
    question: 'i have an issue with math faculty',
    status: 'Answered',
    dateStr: '22 Jul, 11:21 am',
    adminReply: 'will change the faculty',
    answeredAt: '22/7/2026, 11:25:12 am'
  },
  {
    id: 'q-103',
    studentName: 'Priya Sharma',
    studentRoll: '23ECE042',
    studentEmail: 'priya.s@aditya.ac.in',
    topic: 'Hostel Curfew Extension',
    category: 'Personal',
    question: 'Can I get a special pass for late evening lab work till 9:30 PM?',
    status: 'Pending',
    dateStr: '22 Jul, 11:15 am',
    adminReply: null,
    answeredAt: null
  },
  {
    id: 'q-104',
    studentName: 'Venkatesh Rao',
    studentRoll: '21MECH088',
    studentEmail: 'venky.m@aditya.ac.in',
    topic: 'Library Fine Dispute',
    category: 'Complaints',
    question: 'I returned the Microprocessors book on Friday but fine of ₹50 was charged.',
    status: 'Pending',
    dateStr: '22 Jul, 10:45 am',
    adminReply: null,
    answeredAt: null
  },
  {
    id: 'q-105',
    studentName: 'Ananya Verma',
    studentRoll: '24EEE019',
    studentEmail: 'ananya.v@aditya.ac.in',
    topic: 'Bus Route Delay',
    category: 'Complaints',
    question: 'Kakinada Route #4 bus arrived 25 minutes late today.',
    status: 'Pending',
    dateStr: '22 Jul, 10:12 am',
    adminReply: null,
    answeredAt: null
  }
];

let studentNotificationsStore = [];

// Admin: Get all student queries
app.get('/api/admin/queries', (req, res) => {
  res.json({
    queries: studentQueriesStore,
    counts: {
      all: studentQueriesStore.length,
      pending: studentQueriesStore.filter(q => q.status === 'Pending').length,
      answered: studentQueriesStore.filter(q => q.status === 'Answered').length,
      complaints: studentQueriesStore.filter(q => q.category === 'Complaints').length,
      faculty: studentQueriesStore.filter(q => q.category === 'Faculty').length,
      personal: studentQueriesStore.filter(q => q.category === 'Personal').length
    }
  });
});

// Student: Forward unanswered question to Admin
app.post('/api/admin/queries/forward', (req, res) => {
  try {
    const { studentName, studentRoll, studentEmail, topic, category, question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const newQuery = {
      id: `q-${Date.now()}`,
      studentName: studentName || 'Student User',
      studentRoll: studentRoll || '24AP001',
      studentEmail: studentEmail || 'student@aditya.ac.in',
      topic: topic || 'General Inquiry',
      category: category || 'General',
      question,
      status: 'Pending',
      dateStr: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      adminReply: null,
      answeredAt: null
    };

    studentQueriesStore.unshift(newQuery);
    res.json({ success: true, query: newQuery });
  } catch (err) {
    res.status(500).json({ error: 'Failed to forward query to Admin', details: err.message });
  }
});

// Admin: Reply to a student query
app.post('/api/admin/queries/reply', (req, res) => {
  try {
    const { queryId, adminReply } = req.body;
    if (!queryId || !adminReply) {
      return res.status(400).json({ error: 'queryId and adminReply are required' });
    }

    const targetQuery = studentQueriesStore.find(q => q.id === queryId);
    if (!targetQuery) {
      return res.status(404).json({ error: 'Query not found' });
    }

    const timeNow = new Date();
    const answeredTimeStr = `${timeNow.getDate()}/${timeNow.getMonth() + 1}/${timeNow.getFullYear()}, ${timeNow.toLocaleTimeString('en-US', { hour12: true })}`;

    targetQuery.status = 'Answered';
    targetQuery.adminReply = adminReply;
    targetQuery.answeredAt = answeredTimeStr;

    // Create notification for student
    const newNotif = {
      id: `notif-${Date.now()}`,
      studentEmail: targetQuery.studentEmail,
      queryId: targetQuery.id,
      topic: targetQuery.topic,
      question: targetQuery.question,
      adminReply: adminReply,
      answeredAt: answeredTimeStr,
      read: false
    };

    studentNotificationsStore.unshift(newNotif);

    res.json({ success: true, query: targetQuery, notification: newNotif });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit reply', details: err.message });
  }
});

// Student: Get notifications
app.get('/api/student/notifications', (req, res) => {
  const { email } = req.query;
  let notifs = studentNotificationsStore;
  if (email) {
    notifs = notifs.filter(n => n.studentEmail.toLowerCase() === email.toString().toLowerCase());
  }
  res.json({ notifications: notifs, unreadCount: notifs.filter(n => !n.read).length });
});

// Student: Mark notifications read
app.post('/api/student/notifications/read', (req, res) => {
  const { email } = req.body;
  studentNotificationsStore.forEach(n => {
    if (!email || n.studentEmail.toLowerCase() === email.toLowerCase()) {
      n.read = true;
    }
  });
  res.json({ success: true });
});

// Admin: Add Event
app.post('/api/admin/events', (req, res) => {
  try {
    const { title, category, date, time, venue, description, registrationLink } = req.body;
    if (!title || !date || !venue) {
      return res.status(400).json({ error: 'Title, Date, and Venue are required' });
    }

    const kb = getKnowledgeBase();
    const newEvent = {
      id: `evt-${Date.now()}`,
      title,
      category: category || 'General',
      date,
      time: time || 'TBA',
      venue,
      description: description || '',
      registrationLink: registrationLink || 'N/A'
    };

    kb.events.unshift(newEvent);
    updateKnowledgeBase(kb);
    res.json({ success: true, event: newEvent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add event', details: err.message });
  }
});

// Admin: Add Knowledge / Regulation Item
app.post('/api/admin/knowledge', (req, res) => {
  try {
    const { title, category, summary, details } = req.body;
    if (!title || !summary) {
      return res.status(400).json({ error: 'Title and Summary are required' });
    }

    const kb = getKnowledgeBase();
    const newReg = {
      id: `reg-${Date.now()}`,
      title,
      category: category || 'Custom FAQ',
      summary,
      details: details || summary
    };

    kb.regulations.unshift(newReg);
    updateKnowledgeBase(kb);
    res.json({ success: true, regulation: newReg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add knowledge item', details: err.message });
  }
});

// Serve frontend in production if built
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.send('Campus Assistant API Server is Running. Frontend is in development mode.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Campus Assistant Backend running on http://localhost:${PORT}`);
});
