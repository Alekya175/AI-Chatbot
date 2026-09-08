const cacheService = require('../services/cacheService');
const queueService = require('../services/queueService');
const { classifyQuery, getKBAnswer, getStudentPersonalDetails, searchStudentRankDetails, translateText } = require('../services/nlpEngine');
const KnowledgeBase = require('../models/KnowledgeBase');
const Ticket = require('../models/Ticket');
const Student = require('../models/Student');
const ChatHistory = require('../models/ChatHistory');
const mongoose = require('mongoose');

/**
 * Ultra-Fast High-Throughput Chat Controller
 * Implements Token Authentication & Student Privacy Guardrails (Step 1 - Step 6)
 */
exports.handleChat = async (req, res) => {
  const startTime = Date.now();
  const { message, chatId, topic, language, user: bodyUser } = req.body;
  const user = req.user || bodyUser || { name: 'Guest Student', role: 'guest' };

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const activeChatId = chatId || `chat-${Date.now()}`;
  const langCode = language || 'en';
  const qLower = message.toLowerCase().trim();
  let reply = '';
  let servedFromCache = false;
  let ticketCreated = null;

  // Strict personal query identifier (Step 3: Identify Student Queries)
  const isPersonalQuery = /\b(my attendance|my marks|my grade|my result|my score|my cgpa|my gpa|my fee|my balance|my dues|my profile|my detail|my details|my info|my information|personal details|who am i|my timetable|my class|my schedule|today's class|today class|internal marks|show my internal marks|my eamcet|my rank|eamcet rank|my entrance|my hallticket|my hall ticket|my admission rank|my mobile|my phone|my father|my mother|my parents|father name|mother name|my ssc|my 10th|my inter|my 12th|my aadhar|my dob|date of birth)\b/i.test(qLower);

  // Issue / Complaint query identifier
  const isIssueQuery = classifyQuery(message) || /\b(report|complaint|complain|issue with|problem with|wifi is not working|overlap error|not credited|deducted but not|incorrect|wrongly marked)\b/i.test(qLower);

  // Step 5: Privacy Guardrail - Prevent querying other students' data
  const targetRollMatch = qLower.match(/\b(24B11AI\d{3}|25B21AI\d{3}|25B61AI\d{3}|25B11CS\d{3}|AUS26-\d{5}|[0-9]{2}[A-Z0-9]{8,10})\b/i);
  const isQueryingAnotherStudent = targetRollMatch && user && user.role === 'student' && user.regNo && targetRollMatch[1].toUpperCase() !== user.regNo.toUpperCase();

  if (isQueryingAnotherStudent && (isPersonalQuery || /\b(rank|eamcet|ecet|attendance|marks|cgpa|fee|timetable|detail|details|info|profile)\b/i.test(qLower))) {
    reply = `🔒 **Authorization Notice**\n\nYou are authorized to view only your own academic information.`;
  }

  // Guest Mode Restrictions: Guests CANNOT report issues or view personal records
  if (!reply && (isPersonalQuery || isIssueQuery) && (!user || user.role === 'guest')) {
    reply = `🔒 **Guest Mode Restriction**\n\nGuests cannot report issues, submit support tickets, or view personal student records.\n\nGuest Mode is designed for general university information (Admissions, Degree Programs, Placements, Hostel Facilities, Research, and Campus Leadership).\n\nTo report complaints, attendance issues, Wi-Fi faults, or fee payment errors, please **Log In** or **Sign Up** with your registered student account.`;
  }

  // 1. Instant LRU Cache Lookup (Sub-3ms Speed for General Queries)
  if (!reply && !isPersonalQuery && !isIssueQuery && !isQueryingAnotherStudent) {
    const cachedResponse = cacheService.get(message);
    if (cachedResponse) {
      reply = cachedResponse;
      servedFromCache = true;
    }
  }

  // 2. Student Personal Records Lookup (For explicit personal queries when logged in)
  if (!reply && isPersonalQuery && user && user.role !== 'guest') {
    let studentRecord = null;
    try {
      const queryConds = [];
      if (user.email) queryConds.push({ email: user.email.toLowerCase().trim() });
      if (user.regNo) queryConds.push({ regNo: user.regNo.toUpperCase().trim() });

      // Fallback: Extract roll number from email if email starts with roll number (e.g., 24b11ai283@adityauniversity.in)
      const emailRollMatch = user.email ? user.email.match(/^([a-z0-9]+)@/i) : null;
      if (emailRollMatch) {
        queryConds.push({ regNo: emailRollMatch[1].toUpperCase().trim() });
      }

      if (queryConds.length > 0) {
        studentRecord = await Student.findOne({ $or: queryConds }).lean().exec();
      }
    } catch (_) {}

    const personalReply = getStudentPersonalDetails(user, message, studentRecord);
    if (personalReply) reply = personalReply;
  }

  // 3. Specific Student Rank / Profile Search Engine (For Admins or authorized lookups)
  if (!reply && /\b(rank|eamcet|ecet|hallticket|hall ticket)\b/i.test(qLower) && user && user.role === 'admin') {
    const studentSearchReply = await searchStudentRankDetails(message, Student);
    if (studentSearchReply) reply = studentSearchReply;
  }

  // 4. High-Precision Knowledge Base & Intent Matcher (Only for Non-Personal Queries)
  if (!reply && !isPersonalQuery) {
    const nlpAnswer = getKBAnswer(message);
    if (nlpAnswer) reply = nlpAnswer;
  }

  // 5. Complaint Ticket Classifier & Enqueue (Logged-In Students Only)
  if (!reply && user && user.role !== 'guest' && user.email) {
    const category = classifyQuery(message);
    if (category) {
      const ticketId = `T-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      ticketCreated = {
        ticketId,
        studentId: user.email,
        studentName: user.name,
        studentEmail: user.email,
        regNo: user.regNo || '',
        question: message,
        category,
        topic: topic || 'General Issue',
        status: 'pending',
        dismissed: false,
        viewed: false,
        createdAt: new Date()
      };

      queueService.enqueueTicket(ticketCreated);

      const categoryNames = {
        complaint: 'complaint',
        faculty: 'attendance/faculty issue',
        personal: 'personal issue',
        request: 'student request',
        general: 'query'
      };

      reply = `I have received your ${categoryNames[category] || 'query'}. This has been **forwarded to the admin team** (Ticket ID: ${ticketId}) at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} for review.\n\nYou will receive a notification banner with the admin's answer as soon as it is resolved.`;
    }
  }

  // 6. MongoDB Inverted Index Full-Text Search Fallback
  if (!reply) {
    try {
      const kbMatch = await KnowledgeBase.findOne({ $text: { $search: message } }).lean().exec();
      if (kbMatch) reply = kbMatch.content;
    } catch (_) {}
  }

  // 7. Comprehensive Fallback Answer
  if (!reply) {
    reply = `Aditya University offers comprehensive programs across Engineering (B.Tech/M.Tech), Business (BBA/MBA), Pharmacy, Science, and Research.\n\n🏆 **Highest Placement:** ₹39.60 LPA (2025–2026)\n📍 **Location:** Surampalem, Kakinada District, AP\n📞 **Admissions Helpline:** +91 9989 776661 | info@adityauniversity.in`;
  }

  // Cache non-personal resolved answers for future sub-3ms speed
  if (!isPersonalQuery && !isIssueQuery && !isQueryingAnotherStudent && reply) {
    cacheService.set(message, reply);
  }

  // 8. Full Text Dynamic Neural Translation into Target Language
  let translatedReply = reply;
  if (langCode && langCode !== 'en') {
    translatedReply = await translateText(reply, langCode);
  }

  // 9. Async Non-Blocking Chat History Persistence to MongoDB
  setImmediate(async () => {
    try {
      await ChatHistory.findOneAndUpdate(
        { chatId: activeChatId },
        {
          $set: {
            userEmail: user.email || 'guest',
            userName: user.name || 'Guest Student',
            topic: topic || 'General',
            language: langCode,
            updatedAt: new Date()
          },
          $push: {
            messages: [
              { sender: 'user', text: message, timestamp: new Date() },
              { sender: 'ai', text: reply, translatedText: translatedReply, timestamp: new Date() }
            ]
          }
        },
        { upsert: true, new: true }
      );
    } catch (_) {}
  });

  const responseTimeMs = Date.now() - startTime;
  queueService.enqueueLog({
    queryHash: message.toLowerCase().replace(/[^a-z0-9]/g, ''),
    question: message,
    topic: topic || 'General',
    servedFromCache,
    responseTimeMs
  });

  return res.json({
    reply: translatedReply,
    rawReply: reply,
    chatId: activeChatId,
    ticket: ticketCreated ? { id: ticketCreated.ticketId, status: 'pending', createdAt: ticketCreated.createdAt } : null,
    servedFromCache,
    responseTimeMs
  });
};

/**
 * Fetch Student Ticket Notifications from MongoDB & Queue Memory Buffer
 */
exports.getStudentNotifications = async (req, res) => {
  const studentEmail = (req.params.email || '').toLowerCase().trim();
  try {
    let dbTickets = [];
    try {
      dbTickets = await Ticket.find({
        $or: [{ studentId: studentEmail }, { studentEmail: studentEmail }],
        dismissed: { $ne: true },
        viewed: { $ne: true }
      }).sort({ createdAt: -1 }).limit(10).lean();
    } catch (_) {}

    const memTickets = (queueService.ticketQueue || []).filter(t => {
      const sId = (t.studentId || '').toLowerCase();
      const sEmail = (t.studentEmail || '').toLowerCase();
      return (sId === studentEmail || sEmail === studentEmail) && !t.dismissed && !t.viewed && !dbTickets.some(d => d.ticketId === t.ticketId);
    });

    const notifications = [...memTickets, ...dbTickets];
    res.json({ success: true, notifications });
  } catch (err) {
    res.json({ success: false, notifications: [] });
  }
};

/**
 * Permanently Dismiss Notification Once Viewed
 */
exports.dismissNotification = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, error: 'Ticket ID required' });

  try {
    // Update memory queue
    const memTicket = (queueService.ticketQueue || []).find(t => (t._id && t._id.toString() === id) || t.ticketId === id);
    if (memTicket) {
      memTicket.dismissed = true;
      memTicket.viewed = true;
    }

    const queryConds = [{ ticketId: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryConds.push({ _id: id });
    }

    // Update MongoDB Ticket
    await Ticket.updateMany(
      { $or: queryConds },
      { $set: { dismissed: true, viewed: true } }
    );

    res.json({ success: true, message: 'Notification permanently dismissed.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
