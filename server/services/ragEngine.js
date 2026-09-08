import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/knowledgeBase.json');
let kbData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const demoStudentProfiles = {
  'aarav.reddy@aditya.ac.in': { name: 'Aarav Reddy', roll: '24CSE001', program: 'B.Tech CSE', year: '2nd Year', semester: 'IV', cgpa: '8.72', attendance: '91%', advisor: 'Dr. Makineedi Raja Babu' },
  'ananya.sharma@aditya.ac.in': { name: 'Ananya Sharma', roll: '24ECE014', program: 'B.Tech ECE', year: '2nd Year', semester: 'IV', cgpa: '8.45', attendance: '88%', advisor: 'Dr. Narla Venkata Lalitha' },
  'vikram.kumar@aditya.ac.in': { name: 'Vikram Kumar', roll: '23EEE022', program: 'B.Tech EEE', year: '3rd Year', semester: 'VI', cgpa: '7.96', attendance: '84%', advisor: 'Dr. Veeranki Srinivasa Rao' },
  'priya.nair@aditya.ac.in': { name: 'Priya Nair', roll: '24AIML031', program: 'B.Tech AI & ML', year: '2nd Year', semester: 'IV', cgpa: '9.12', attendance: '95%', advisor: 'Dr. Kovvuri N Bhargavi' },
  'rahul.verma@aditya.ac.in': { name: 'Rahul Verma', roll: '23MECH045', program: 'B.Tech Mechanical', year: '3rd Year', semester: 'VI', cgpa: '7.68', attendance: '82%', advisor: 'Dr. Saragada D V V S Bhimeshwar Reddy' },
  'sneha.das@aditya.ac.in': { name: 'Sneha Das', roll: '24CIV056', program: 'B.Tech Civil', year: '2nd Year', semester: 'IV', cgpa: '8.21', attendance: '89%', advisor: 'Dr. Bellum Ramamohan Reddy' },
  'karthik.rao@aditya.ac.in': { name: 'Karthik Rao', roll: '23MBA067', program: 'MBA', year: '1st Year', semester: 'II', cgpa: '8.34', attendance: '93%', advisor: 'Dr. Selvamalar N' },
  'meera.joseph@aditya.ac.in': { name: 'Meera Joseph', roll: '24BPH078', program: 'B.Pharm', year: '2nd Year', semester: 'IV', cgpa: '8.67', attendance: '90%', advisor: 'Dr. Girajala Chinna Ram' },
  'aditya.singh@aditya.ac.in': { name: 'Aditya Singh', roll: '23AGR089', program: 'B.Tech Agricultural Engineering', year: '3rd Year', semester: 'VI', cgpa: '7.88', attendance: '86%', advisor: 'Dr. Bodasingi Krishna Kanth' },
  'nisha.patel@aditya.ac.in': { name: 'Nisha Patel', roll: '24DSC091', program: 'B.Tech Data Science', year: '2nd Year', semester: 'IV', cgpa: '8.94', attendance: '92%', advisor: 'Dr. Kovvuri N Bhargavi' }
};

export function reloadKnowledgeBase() {
  kbData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  return kbData;
}

export function getKnowledgeBase() {
  return kbData;
}

export function updateKnowledgeBase(newData) {
  fs.writeFileSync(dataPath, JSON.stringify(newData, null, 2), 'utf8');
  kbData = newData;
  return kbData;
}

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

export function retrieveContext(query) {
  const qTokens = tokenize(query);
  const results = {
    timetables: [],
    faculty: [],
    departments: [],
    classrooms: [],
    events: [],
    regulations: [],
    facilities: [],
    notifications: [],
    admissions: [],
    hostelTransport: [],
    scholarshipsFees: []
  };

  if (kbData.timetables) {
    kbData.timetables.forEach(tt => {
      const text = `${tt.program} ${tt.section} timetable schedule class period`;
      const score = countMatches(qTokens, tokenize(text));
      if (score > 0) results.timetables.push({ item: tt, score });
    });
  }

  kbData.faculty.forEach(fac => {
    const text = `${fac.name} ${fac.designation} ${fac.department} ${fac.office} ${fac.officeHours} ${fac.research}`;
    const score = countMatches(qTokens, tokenize(text));
    if (score > 0) results.faculty.push({ item: fac, score });
  });

  kbData.departments.forEach(dept => {
    const text = `${dept.name} ${dept.code} ${dept.hod} ${dept.building} ${dept.programs.join(' ')} ${dept.description}`;
    const score = countMatches(qTokens, tokenize(text));
    if (score > 0) results.departments.push({ item: dept, score });
  });

  kbData.classrooms.forEach(cls => {
    const text = `${cls.code} ${cls.name} ${cls.building} ${cls.floor} ${cls.equipment.join(' ')} ${cls.directions}`;
    const score = countMatches(qTokens, tokenize(text));
    if (score > 0) results.classrooms.push({ item: cls, score });
  });

  kbData.events.forEach(evt => {
    const text = `${evt.title} ${evt.category} ${evt.date} ${evt.venue} ${evt.description}`;
    const score = countMatches(qTokens, tokenize(text));
    if (score > 0) results.events.push({ item: evt, score });
  });

  kbData.regulations.forEach(reg => {
    const text = `${reg.title} ${reg.category} ${reg.summary} ${reg.details}`;
    const score = countMatches(qTokens, tokenize(text));
    if (score > 0) results.regulations.push({ item: reg, score });
  });

  kbData.facilities.forEach(facil => {
    const text = `${facil.name} ${facil.category} ${facil.location} ${facil.hours} ${facil.amenities.join(' ')}`;
    const score = countMatches(qTokens, tokenize(text));
    if (score > 0) results.facilities.push({ item: facil, score });
  });

  if (kbData.notifications) {
    kbData.notifications.forEach(n => {
      const text = `${n.title} ${n.category} ${n.summary} ${n.date} notification circular update`;
      const score = countMatches(qTokens, tokenize(text));
      if (score > 0) results.notifications.push({ item: n, score });
    });
  }

  if (kbData.admissions) {
    kbData.admissions.forEach(a => {
      const text = `${a.program} ${a.eligibility} ${a.fee} ${a.duration} admission apply`;
      const score = countMatches(qTokens, tokenize(text));
      if (score > 0) results.admissions.push({ item: a, score });
    });
  }

  if (kbData.hostelTransport) {
    kbData.hostelTransport.hostels.forEach(h => {
      const text = `${h.name} ${h.occupancy} ${h.facilities} ${h.curfew} ${h.fee} hostel residence`;
      const score = countMatches(qTokens, tokenize(text));
      if (score > 0) results.hostelTransport.push({ item: h, score });
    });
    kbData.hostelTransport.transport.forEach(t => {
      const text = `${t.route} ${t.stops} ${t.timing} ${t.annualFee} bus transport`;
      const score = countMatches(qTokens, tokenize(text));
      if (score > 0) results.hostelTransport.push({ item: t, score });
    });
  }

  if (kbData.scholarshipsFees) {
    kbData.scholarshipsFees.forEach(s => {
      const text = `${s.name} ${s.benefit} ${s.criteria} scholarship financial aid fee`;
      const score = countMatches(qTokens, tokenize(text));
      if (score > 0) results.scholarshipsFees.push({ item: s, score });
    });
  }

  Object.keys(results).forEach(cat => {
    results[cat].sort((a, b) => b.score - a.score);
  });

  return results;
}

function countMatches(queryTokens, docTokens) {
  let matches = 0;
  const docSet = new Set(docTokens);
  for (const token of queryTokens) {
    if (docSet.has(token)) {
      matches += 3;
    } else {
      for (const dToken of docSet) {
        if (dToken.includes(token) || token.includes(dToken)) {
          matches += 1;
          break;
        }
      }
    }
  }
  return matches;
}

export async function processChatQuery(userQuery, conversationHistory = [], role = 'student', studentEmail = '') {
  const retrieved = retrieveContext(userQuery);
  const apiKey = process.env.GEMINI_API_KEY;
  const requiresAdmin = shouldForwardToAdmin(userQuery);

  if (requiresAdmin) {
    return {
      answer: 'I am sorry you are experiencing this issue. Your query has been forwarded to the Admin. They will review it and get back to you with a response. Thank you for your patience.',
      sources: retrieved,
      engine: 'Aditya Admin Support Escalation',
      suggestedPrompts: [],
      requiresAdmin: true,
      relatedMetaData: { type: 'adminEscalation' }
    };
  }

  if (role === 'guest' && isStudentPrivateQuery(userQuery)) {
    return {
      answer: 'Guest access is limited to general college information. Please use Student Login to view personal academic details.',
      sources: [],
      engine: 'Aditya Guest Access',
      suggestedPrompts: ['What are the latest college notifications?', 'What courses does the university offer?'],
      requiresAdmin: false,
      relatedMetaData: { type: 'guestPrivacy' }
    };
  }

  const studentProfile = demoStudentProfiles[studentEmail.toLowerCase()];
  if (role === 'student' && studentProfile && isStudentPrivateQuery(userQuery)) {
    const normalizedQuery = userQuery.toLowerCase();
    if (normalizedQuery.includes('cgpa') || normalizedQuery.includes('grade') || normalizedQuery.includes('gpa')) {
      return studentRecordResponse(`Your CGPA is ${studentProfile.cgpa}.`, studentProfile, 'cgpa');
    }
    if (normalizedQuery.includes('mark') || normalizedQuery.includes('score')) {
      return studentRecordResponse(`Your academic score is reflected in your CGPA: ${studentProfile.cgpa}.`, studentProfile, 'marks');
    }
    if (normalizedQuery.includes('attendance')) {
      return studentRecordResponse(`Your attendance is ${studentProfile.attendance}.`, studentProfile, 'attendance');
    }
    if (normalizedQuery.includes('faculty') || normalizedQuery.includes('advisor') || normalizedQuery.includes('professor')) {
      return studentRecordResponse(`Your faculty advisor is ${studentProfile.advisor}.`, studentProfile, 'advisor');
    }
    return {
      answer: `${studentProfile.name} (${studentProfile.roll}) is studying ${studentProfile.program} in ${studentProfile.year}, Semester ${studentProfile.semester}. CGPA: ${studentProfile.cgpa}. Attendance: ${studentProfile.attendance}. Faculty advisor: ${studentProfile.advisor}.`,
      sources: [],
      engine: 'Aditya Student Academic Records',
      suggestedPrompts: [],
      requiresAdmin: false,
      relatedMetaData: { type: 'studentProfile' }
    };
  }

  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are the official AI Chatbot for Aditya University.
Answer the user's question accurately based on the following verified data:

${JSON.stringify(kbData, null, 2)}

User Question: ${userQuery}`
            }]
          }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return {
          answer: data.candidates[0].content.parts[0].text,
          sources: retrieved,
          engine: 'Gemini 1.5 Flash (Live AI)',
          suggestedPrompts: generateSuggestedPrompts(userQuery),
          requiresAdmin
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, using Local Synthesis Engine:', err.message);
    }
  }

  const localResponse = synthesizeLocalAnswer(userQuery, retrieved);
  return {
    answer: localResponse.text,
    sources: retrieved,
    engine: 'Aditya Local RAG Engine (Built-in)',
    suggestedPrompts: generateSuggestedPrompts(userQuery),
    relatedMetaData: localResponse.meta,
    requiresAdmin
  };
}

function studentRecordResponse(answer, studentProfile, field) {
  return {
    answer,
    sources: [],
    engine: 'Aditya Student Academic Records',
    suggestedPrompts: [],
    requiresAdmin: false,
    relatedMetaData: { type: 'studentProfile', field, student: studentProfile.roll }
  };
}

function isStudentPrivateQuery(query) {
  return /my (marks|grades|cgpa|attendance|timetable|subjects|academic|faculty|fees|profile|record)|student (marks|grades|attendance|profile|record)|personal (academic|faculty|college)|my faculty|my professor/.test(query.toLowerCase());
}

function shouldForwardToAdmin(query) {
  const normalizedQuery = query.toLowerCase();
  return /(complaint|complain|issue|problem|wrong|incorrect|harass|harassment|faculty.*(change|issue|problem|complaint)|teacher.*(issue|problem|complaint)|college.*(issue|problem|complaint)|not working|delay|absent|attendance.*(wrong|incorrect)|fine.*(wrong|incorrect))/.test(normalizedQuery);
}

function synthesizeLocalAnswer(query, r) {
  const qLower = query.toLowerCase().trim();

  const shortAnswer = (text) => ({ text: text.trim(), meta: { type: 'direct' } });

  if (qLower.includes('who is the hod') || qLower.includes('hod of') || qLower.includes('head of department')) {
    const deptName = (qLower.includes('cse') || qLower.includes('computer science')) ? 'Computer Science and Engineering' :
      (qLower.includes('ece') || qLower.includes('electronics')) ? 'Electronics and Communication Engineering' :
      (qLower.includes('eee') || qLower.includes('electrical')) ? 'Electrical and Electronics Engineering' :
      (qLower.includes('mech') || qLower.includes('mechanical')) ? 'Mechanical Engineering' :
      (qLower.includes('civil')) ? 'Civil Engineering' :
      'the department';

    const facultyMap = {
      'Computer Science and Engineering': 'Dr. Makineedi Raja Babu',
      'Electronics and Communication Engineering': 'Dr. Suneetha Racharla',
      'Electrical and Electronics Engineering': 'Dr. A. V. Krishna',
      'Mechanical Engineering': 'Dr. K. R. K. Reddy',
      'Civil Engineering': 'Dr. P. V. S. N. Rao'
    };

    const hod = facultyMap[deptName] || 'the HOD';
    return shortAnswer(`${hod} is the HOD of ${deptName}.`);
  }

  if (qLower.includes('who is the vice chancellor') || qLower.includes('vice chancellor') || qLower.includes('vc of aditya') || qLower.includes('who is the vc')) {
    return shortAnswer('The Vice-Chancellor of Aditya University is Dr. M. B. Srinivas.');
  }

  if (qLower.includes('who is the chancellor') || qLower.includes('chancellor of aditya')) {
    return shortAnswer('The Chancellor of Aditya University is Dr. N. Sesha Reddy.');
  }

  if (qLower.includes('who is the registrar')) {
    return shortAnswer('The Registrar of Aditya University is Dr. G. Suresh.');
  }

  if (qLower.includes('highest package') || qLower.includes('top package') || qLower.includes('highest salary')) {
    return shortAnswer('The highest package at Aditya University is ₹1.06 crore per annum.');
  }

  // Greetings & Capabilities Intent Matching
  if (qLower.includes('what can you do') || qLower.includes('capabilities') || qLower.includes('features') || qLower.includes('what do you know') || qLower.includes('how can you help')) {
    let text = `### 🤖 Capabilities of Aditya University AI Assistant\n\n`;
    text += `I am trained on verified Aditya University data and can instantly assist you with:\n\n`;
    text += `* 🎓 **Leadership & Governance:** Direct details on Vice-Chancellor (Dr. M. B. Srinivas), Chancellor (Dr. N. Sesha Reddy), Registrar, and Deans.\n`;
    text += `* 💼 **Placements & Packages:** Highest international package (₹1.06 CR), top recruiter offers, and CDC training.\n`;
    text += `* 🛡️ **Scholarships & Fees:** Detailed ASAT, JEE, EAPCET, NEET, BIE & CBSE waiver matrix (10% to 100% tuition fee waiver).\n`;
    text += `* 👨‍🏫 **Faculty & HOD Directory:** HODs and faculty lists for CSE, ECE, EEE, Mechanical, Civil, Pharmacy, and Business.\n`;
    text += `* 📅 **Class Timetables & Schedules:** Program timetables and period slots.\n`;
    text += `* 🏠 **Hostels & Transport:** Residence hall fees, curfew times, and bus routes across AP.\n`;
    text += `* 📜 **Academic Regulations:** Mandatory 75% attendance policy and grading rules.\n`;
    text += `* 🏆 **Accreditations & Rankings:** NAAC A++, UGC 2(f), NBA Tier-1, and NIRF recognitions.\n\n`;
    text += `*Ask any specific question to get an immediate response!*`;
    return { text, meta: { type: 'capabilities' } };
  }

  if (qLower.includes('contact') || qLower.includes('helpline') || qLower.includes('email') || qLower.includes('phone number') || qLower.includes('where is the admissions office')) {
    const contact = kbData.contact;
    return { text: `Aditya University contact details: ${contact.phone}, ${contact.email}. Address: ${contact.address}. Website: ${contact.website}.`, meta: { type: 'contact' } };
  }

  if (qLower.includes('how can i pay') || qLower.includes('fee payment') || qLower.includes('pay my university fees')) {
    return { text: 'For fee payment instructions and the current payment link, please contact the University Finance Office through the official university website or call +91-9989776661.', meta: { type: 'feePayment' } };
  }

  if (qLower === 'hi' || qLower === 'hello' || qLower === 'hey' || qLower === 'hi aditya chatbot!' || qLower.startsWith('hi ') || qLower.startsWith('hello ') || qLower.includes('good morning') || qLower.includes('good evening')) {
    let text = `### 👋 Hello & Welcome to Aditya University!\n\n`;
    text += `I am your dedicated AI assistant. I can answer any questions about admissions, scholarships, leadership, faculty, timetables, placements, and campus life.\n\n`;
    text += `What specific information can I help you find today?`;
    return { text, meta: { type: 'greeting' } };
  }

  // 1. Statutory & Governing Bodies
  if (qLower.includes('governing body') || qLower.includes('board of management') || qLower.includes('academic council') || qLower.includes('finance committee') || qLower.includes('research & advisory') || qLower.includes('planning & monitoring') || qLower.includes('statutory body')) {
    let text = `### 🏛️ Statutory Bodies & Committees of Aditya University\n\n`;
    kbData.governingBodies.forEach(gb => {
      text += `#### 📌 ${gb.body}\n`;
      text += `* **Chairperson:** ${gb.chairperson}\n`;
      text += `* **Key Members:**\n` + gb.keyMembers.map(m => `  - ${m}`).join('\n') + `\n\n`;
    });
    return { text, meta: { type: 'governingBodies' } };
  }

  // 2. Timetables & Schedules
  if (qLower.includes('timetable') || qLower.includes('class schedule') || qLower.includes('period slot') || qLower.includes('monday') || qLower.includes('tuesday') || qLower.includes('wednesday') || qLower.includes('thursday') || qLower.includes('friday')) {
    const tt = (r.timetables.length > 0 ? r.timetables[0].item : kbData.timetables[0]);
    let text = `### 📅 Timetable & Class Schedule: ${tt.program} (${tt.section})\n\n`;
    tt.schedule.forEach(daySchedule => {
      text += `#### 📌 ${daySchedule.day}\n`;
      text += `| Time Slot | Subject & Course | Room Code | Faculty |\n`;
      text += `| :--- | :--- | :--- | :--- |\n`;
      daySchedule.slots.forEach(slot => {
        text += `| **${slot.time}** | ${slot.subject} | \`${slot.room}\` | ${slot.faculty} |\n`;
      });
      text += `\n`;
    });
    text += `> *Note: Labs are held in designated computer & microelectronics blocks.*`;
    return { text, meta: { type: 'timetable', data: tt } };
  }

  // 3. Events
  if (qLower.includes('event') || qLower.includes('hackathon') || qLower.includes('techfest') || qLower.includes('summit') || qLower.includes('midterm exam') || qLower.includes('fest') || qLower.includes('keynote') || qLower.includes('cultural')) {
    const e = (r.events.length > 0 ? r.events[0].item : kbData.events[0]);
    let text = `### 📅 Campus Event: ${e.title}\n\n`;
    text += `* **Category:** 🏷️ \`${e.category}\`\n`;
    text += `* **Date:** 🗓️ **${e.date}**\n`;
    text += `* **Time:** ⏰ ${e.time}\n`;
    text += `* **Venue:** 📍 **${e.venue}**\n\n`;
    text += `${e.description}\n\n`;
    return { text, meta: { type: 'event', data: e } };
  }

  // 4. Regulations & Rules
  if (qLower.includes('attendance') || qLower.includes('75%') || qLower.includes('grading') || qLower.includes('cgpa') || qLower.includes('regulation') || qLower.includes('fine') || qLower.includes('rule') || qLower.includes('policy') || qLower.includes('makeup')) {
    const reg = (r.regulations.length > 0 ? r.regulations[0].item : kbData.regulations[0]);
    let text = `### 📜 Academic Regulation: ${reg.title}\n\n`;
    text += `**Category:** \`${reg.category}\`\n\n`;
    text += `> **Key Summary:** ${reg.summary}\n\n`;
    text += `**Official Details:**\n${reg.details}\n\n`;
    return { text, meta: { type: 'regulation', data: reg } };
  }

  // 5. Campus Facilities
  if (qLower.includes('facility') || qLower.includes('library') || qLower.includes('canteen') || qLower.includes('food') || qLower.includes('health') || qLower.includes('doctor') || qLower.includes('gym') || qLower.includes('wifi') || qLower.includes('nptel')) {
    const fac = (r.facilities.length > 0 ? r.facilities[0].item : kbData.facilities[0]);
    let text = `### 🏟️ Campus Facility: ${fac.name}\n\n`;
    text += `* **Operating Hours:** 🕒 **${fac.hours}**\n`;
    text += `* **Location:** 📍 ${fac.location}\n`;
    text += `* **Current Status:** 🟢 **${fac.status}** (~${fac.busyLevel}% Busy)\n\n`;
    text += `**Available Amenities:**\n` + fac.amenities.map(a => `- ✅ ${a}`).join('\n') + `\n\n`;
    return { text, meta: { type: 'facility', data: fac } };
  }

  // 6. Hostel & Transport
  if (qLower.includes('hostel') || qLower.includes('transport') || qLower.includes('bus') || qLower.includes('curfew') || qLower.includes('stay') || qLower.includes('commute') || qLower.includes('residence')) {
    const ht = kbData.hostelTransport;
    let text = `### 🏠 Hostel & Transport Information\n\n`;
    text += `#### 🏨 Residence Halls (Hostels)\n`;
    ht.hostels.forEach(h => {
      text += `* **${h.name}**\n  - Occupancy: ${h.occupancy}\n  - Amenities: ${h.facilities}\n  - Curfew: \`${h.curfew}\` | Fee: **${h.fee}**\n\n`;
    });
    text += `\n#### 🚌 Campus Bus Routes\n`;
    ht.transport.forEach(t => {
      text += `* **${t.route}**\n  - Timing: ${t.timing}\n  - Stops: ${t.stops}\n\n`;
    });
    return { text, meta: { type: 'hostelTransport' } };
  }

  // 7. Scholarships & Fees
  if (qLower.includes('scholarship') || qLower.includes('financial aid') || qLower.includes('concession') || qLower.includes('waiver')) {
    let text = `### 🛡️ Scholarships & Financial Aid\n\n`;
    kbData.scholarshipsFees.forEach(s => {
      text += `* **${s.name}**\n  - **Benefit:** \`${s.benefit}\`\n  - **Eligibility:** ${s.criteria}\n\n`;
    });
    return { text, meta: { type: 'scholarships' } };
  }

  // 8. Notifications
  if (qLower.includes('notif') || qLower.includes('circular') || qLower.includes('update') || qLower.includes('notice') || qLower.includes('announc')) {
    let text = `### 🔔 Aditya University Latest Notifications\n\n`;
    kbData.notifications.forEach(n => {
      text += `* **${n.title}** (${n.date}) — \`${n.category}\`\n  ${n.summary}\n\n`;
    });
    return { text, meta: { type: 'notification' } };
  }

  // 9. Admissions
  if (qLower.includes('admissi') || qLower.includes('apply') || qLower.includes('b.tech') || qLower.includes('mba') || qLower.includes('eligib')) {
    let text = `### 🎓 Aditya University Admissions 2026-27\n\n`;
    kbData.admissions.forEach(a => {
      text += `#### 📌 ${a.program}\n`;
      text += `- **Eligibility:** ${a.eligibility}\n`;
      text += `- **Tuition Fee:** \`${a.fee}\` | **Duration:** ${a.duration}\n`;
      text += `- **Apply Online:** [Aditya Admissions Portal](${a.applyLink})\n\n`;
    });
    return { text, meta: { type: 'admissions' } };
  }

  // 10. History & Origin
  if (qLower.includes('history') || qLower.includes('origin') || qLower.includes('established') || qLower.includes('founded') || qLower.includes('sesha reddy') || qLower.includes('heritage') || qLower.includes('background') || qLower.includes('legacy') || qLower.includes('aec')) {
    let text = `### 🏛️ Aditya University History & Legacy\n\n`;
    text += `* **Establishment:** State Private University at Surampalem, Kakinada District, AP under the *Andhra Pradesh Private Universities Act, 2016*.\n`;
    text += `* **Origins:** Evolved from **Aditya Engineering College (AEC)** established in **2001** under the Aditya Academy.\n`;
    text += `* **Aditya Academy Legacy:** Founded in **1984** by **Dr. N. Sesha Reddy**. Today, the Aditya educational group spans **80+ institutions**, **8,000+ staff**, and **80,000+ students** across coastal Andhra Pradesh.\n`;
    text += `* **Campus:** Vast, green, eco-friendly campus in Surampalem near Kakinada.\n`;
    return { text, meta: { type: 'history' } };
  }

  // 11. Vision & Mission
  if (qLower.includes('vision') || qLower.includes('mission') || qLower.includes('value') || qLower.includes('motto')) {
    let text = `### 🎯 Aditya University Vision, Mission & Core Values\n\n`;
    text += `#### 🌟 Vision\n> *"${kbData.vision}"*\n\n`;
    text += `#### 🚀 Mission\n> *"${kbData.mission}"*\n\n`;
    text += `#### 💎 Core Values\n`;
    kbData.coreValues.forEach(v => {
      text += `- ✨ **${v}**\n`;
    });
    return { text, meta: { type: 'vision' } };
  }

  // 0. Precise Direct Question Filters (Targeted Answers Only)
  const l = kbData.leadership;

  // Specific Vice Chancellor query
  if (qLower.includes('vice chancellor') || qLower.includes('vice-chancellor') || qLower.includes('vc of aditya') || qLower.includes('who is the vc') || qLower.includes('m b srinivas') || qLower.includes('mb srinivas')) {
    let text = `### 🎓 Vice-Chancellor of Aditya University\n\n`;
    text += `**${l.viceChancellor}** is the Vice-Chancellor of Aditya University.\n\n`;
    text += `* **Office:** Office of the Vice-Chancellor, Executive Block, Aditya University Campus, Surampalem.\n`;
    text += `* **Role:** Chief Executive and Academic Head of Aditya University.`;
    return { text, meta: { type: 'viceChancellor' } };
  }

  // Specific Chancellor query
  if ((qLower.includes('chancellor') && !qLower.includes('vice') && !qLower.includes('pro')) || qLower.includes('sesha reddy')) {
    let text = `### 👑 Chancellor of Aditya University\n\n`;
    text += `**${l.chancellor}** is the Founder & Chancellor of Aditya University.\n\n`;
    text += `* **Legacy:** Founder of Aditya Educational Academy (established 1984), guiding 80+ institutions across Andhra Pradesh.`;
    return { text, meta: { type: 'chancellor' } };
  }

  // Specific Pro-Chancellor query
  if (qLower.includes('pro chancellor') || qLower.includes('pro-chancellor') || qLower.includes('satish reddy') || qLower.includes('deepak reddy')) {
    let text = `### 🎖️ Pro-Chancellors of Aditya University\n\n`;
    text += `* **Pro-Chancellors:** **${l.proChancellors.join('** & **')}**\n`;
    text += `* **Dy. Pro-Chancellor:** **${l.dyProChancellor}**`;
    return { text, meta: { type: 'proChancellor' } };
  }

  // Specific Registrar query
  if (qLower.includes('registrar') || qLower.includes('who is the registrar') || qLower.includes('g suresh') || qLower.includes('g. suresh')) {
    let text = `### 📜 Registrar of Aditya University\n\n`;
    text += `**${l.registrar}** is the Registrar of Aditya University.\n\n`;
    text += `* **Role:** Chief Administrative & Statutory Officer of the University.`;
    return { text, meta: { type: 'registrar' } };
  }

  // Specific Controller of Examinations query
  if (qLower.includes('controller of exam') || qLower.includes('j pavan') || qLower.includes('j. pavan')) {
    let text = `### 📝 Controller of Examinations\n\n`;
    text += `**Dr. J. Pavan** is the Controller of Examinations at Aditya University.`;
    return { text, meta: { type: 'controllerExams' } };
  }

  // Specific Highest Package query
  if (qLower.includes('highest package') || qLower.includes('highest salary') || qLower.includes('max package') || qLower.includes('top package')) {
    const p = kbData.placementsData || {};
    let text = `### 💰 Highest Placement Package at Aditya University\n\n`;
    text += `* **Highest International Package:** **${p.highestPackage}**\n\n`;
    text += `#### 🌟 Top Salary Offers (2025-26):\n`;
    (p.topOffers || []).slice(0, 4).forEach(offer => {
      text += `- ${offer}\n`;
    });
    return { text, meta: { type: 'highestPackage' } };
  }

  // 12. Full Leadership Team & Deans Overview (Only when full list or leadership team requested)
  if (qLower.includes('leadership team') || qLower.includes('full leadership') || qLower.includes('all deans') || qLower.includes('governing officers')) {
    let text = `### 👥 Aditya University Leadership Team\n\n`;
    text += `* **Chancellor:** 👑 **${l.chancellor}**\n`;
    text += `* **Pro-Chancellors:** 🎖️ **${l.proChancellors.join(' & ')}**\n`;
    text += `* **Dy. Pro-Chancellor:** 🏅 **${l.dyProChancellor}**\n`;
    text += `* **Vice-Chancellor:** 🎓 **${l.viceChancellor}**\n`;
    text += `* **Pro Vice-Chancellors:**\n` + l.proViceChancellors.map(p => `  - ${p}`).join('\n') + `\n`;
    text += `* **Registrar:** 📜 **${l.registrar}**\n\n`;
    text += `#### 🏛️ Deans & Key Officers\n` + l.deans.map(d => `- ${d}`).join('\n') + `\n\n`;
    if (l.associateDeans && l.associateDeans.length > 0) {
      text += `#### 🎓 Associate Deans\n` + l.associateDeans.map(ad => `- ${ad}`).join('\n') + `\n`;
    }
    return { text, meta: { type: 'leadership' } };
  }

  // 13. Rankings & Accreditations
  if (qLower.includes('ranking') || qLower.includes('accreditation') || qLower.includes('naac') || qLower.includes('ugc') || qLower.includes('nba') || qLower.includes('nirf') || qLower.includes('times higher') || qLower.includes('siro') || qLower.includes('nabl')) {
    let text = `### 🏆 Accreditations, Rankings & Recognitions\n\n`;
    kbData.rankingsAndRecognitions.forEach(rItem => {
      text += `* ${rItem}\n`;
    });
    return { text, meta: { type: 'rankings' } };
  }

  // 14. Placements & Career Records
  if (qLower.includes('placement') || qLower.includes('highest package') || qLower.includes('salary') || qLower.includes('recruiter') || qLower.includes('company') || qLower.includes('lpa') || qLower.includes('1.06 cr') || qLower.includes('job')) {
    const p = kbData.placementsData || {};
    let text = `### 💼 Placements & Career Development at Aditya University\n\n`;
    text += `* **Highest International Package:** 💰 **${p.highestPackage}**\n`;
    text += `* **Placement Training:** ${p.trainings}\n\n`;
    text += `#### 🏆 Top Star Student Offers (2025-26):\n`;
    (p.topOffers || []).forEach(offer => {
      text += `- 🌟 ${offer}\n`;
    });
    text += `\n#### 🏢 Key Recruiting Partners:\n`;
    text += (p.topRecruiters || []).map(r => `\`${r}\``).join(' • ') + `\n\n`;
    return { text, meta: { type: 'placements' } };
  }

  // 15. Collaborations, MoUs & Ecosystem (ALA, AGBI, Knimbus)
  if (qLower.includes('mou') || qLower.includes('collaboration') || qLower.includes('partner') || qLower.includes('ala') || qLower.includes('learning academy') || qLower.includes('agbi') || qLower.includes('incubator') || qLower.includes('knimbus') || qLower.includes('library portal')) {
    const eco = kbData.academicEcosystem || {};
    let text = `### 🌐 Academic Ecosystem & Global Collaborations\n\n`;
    text += `* **Aditya Learning Academy (ALA):** ${eco.ala}\n`;
    text += `* **Aditya Global Business Incubator (AGBI):** ${eco.agbi}\n`;
    text += `* **Knowledge Resource Center:** ${eco.knimbus}\n\n`;
    text += `#### ✈️ International Academic Partners & Industry MoUs:\n`;
    (eco.internationalMoUs || []).forEach(mou => {
      text += `- 🤝 **${mou}**\n`;
    });
    return { text, meta: { type: 'ecosystem' } };
  }

  // 16. Administrative Offices
  if (qLower.includes('administrative office') || qLower.includes('cdc') || qLower.includes('placement office') || qLower.includes('finance office') || qLower.includes('hr office')) {
    let text = `### 🏢 Administrative Offices & Departments\n\n`;
    kbData.administrativeOffices.forEach(off => {
      text += `* **${off.office}**\n  ${off.role}\n\n`;
    });
    return { text, meta: { type: 'adminOffices' } };
  }

  // 15. Faculty Details & Department Faculty Directory
  if (qLower.includes('faculty') || qLower.includes('professor') || qLower.includes('hod') || qLower.includes('dr.') || qLower.includes('phd') || qLower.includes('research paper') || qLower.includes('patent') || qLower.includes('web of science')) {
    const fs = kbData.facultyStats || {};
    const fByDept = kbData.facultyByDepartment || {};

    // Check if query is looking for a specific department
    let matchedDeptKey = null;
    if (qLower.includes('civil')) matchedDeptKey = 'civil';
    else if (qLower.includes('eee') || qLower.includes('electrical')) matchedDeptKey = 'eee';
    else if (qLower.includes('mech') || qLower.includes('mechanical')) matchedDeptKey = 'mechanical';
    else if (qLower.includes('ece') || qLower.includes('electronics')) matchedDeptKey = 'ece';
    else if (qLower.includes('freshman') || qLower.includes('first year')) matchedDeptKey = 'freshman';
    else if (qLower.includes('cse') || qLower.includes('computer science')) matchedDeptKey = 'cse';
    else if (qLower.includes('mining') || qLower.includes('petroleum')) matchedDeptKey = 'mining_petroleum';
    else if (qLower.includes('agri') || qLower.includes('agricultural')) matchedDeptKey = 'agriculture';
    else if (qLower.includes('ai') || qLower.includes('data science') || qLower.includes('computing')) matchedDeptKey = 'ai_ds_it';
    else if (qLower.includes('business') || qLower.includes('management') || qLower.includes('bba') || qLower.includes('mba')) matchedDeptKey = 'business';
    else if (qLower.includes('pharmacy') || qLower.includes('b.pharm')) matchedDeptKey = 'pharmacy';
    else if (qLower.includes('science')) matchedDeptKey = 'sciences';

    if (matchedDeptKey && fByDept[matchedDeptKey]) {
      const deptObj = fByDept[matchedDeptKey];
      let text = `### 👨‍🏫 Faculty Directory: ${deptObj.department}\n\n`;
      text += `* **Head of Department (HOD):** 👑 **${deptObj.hod}**\n\n`;
      text += `#### 📋 Department Faculty Members (${deptObj.faculty.length}):\n`;
      deptObj.faculty.forEach(member => {
        text += `- ${member}\n`;
      });
      text += `\n> 💡 *Aditya University boasts over 500+ faculty members with 200+ PhD holders, 1,963+ SCI/Scopus papers, and 532+ published patents.*`;
      return { text, meta: { type: 'facultyDept', dept: matchedDeptKey } };
    }

    // General Faculty & Research Overview
    let text = `### 👨‍🏫 Aditya University Faculty & Research Ecosystem\n\n`;
    text += `* **Total Qualified Faculty:** 🏆 **${fs.totalCount}**\n`;
    text += `* **Doctoral Scholars:** 🎓 **${fs.doctoralHolders}**\n`;
    text += `* **Research Publications:** 📚 **${fs.researchPapers}** (${fs.webOfScience})\n`;
    text += `* **Patents Portfolio:** 💡 **${fs.patents}**\n`;
    text += `* **Sponsored Grants:** 💰 **${fs.sponsoredFunding}**\n`;
    text += `* **Pedagogy:** ${fs.pedagogy}\n\n`;
    text += `#### 🏫 Department Faculty Directories:\n`;
    Object.keys(fByDept).forEach(key => {
      const d = fByDept[key];
      text += `- **${d.department}**: HOD: *${d.hod}* (${d.faculty.length} Faculty Members)\n`;
    });
    text += `\n*Ask specifically for any department (e.g. "Show Civil Engineering Faculty" or "Who is the EEE HOD?") to get complete faculty details!*`;
    return { text, meta: { type: 'facultyOverview' } };
  }

  // 16. Classrooms & Navigation
  if (qLower.includes('cs-101') || qLower.includes('cs-lab3') || qLower.includes('eng-202') || qLower.includes('aud-main') || qLower.includes('sci-301') || qLower.includes('classroom') || qLower.includes('where is') || qLower.includes('direction') || qLower.includes('get to') || qLower.includes('lab location') || qLower.includes('building block')) {
    const c = (r.classrooms.length > 0 ? r.classrooms[0].item : kbData.classrooms[0]);
    let text = `### 🏫 Classroom & Navigation: ${c.name} (\`${c.code}\`)\n\n`;
    text += `* **Building Block:** 🏢 ${c.building}\n`;
    text += `* **Floor:** 🚪 ${c.floor}\n`;
    text += `* **Seating Capacity:** 👥 ${c.capacity} students\n\n`;
    text += `**Installed Facilities & Tech:**\n` + c.equipment.map(e => `- ✨ ${e}`).join('\n') + `\n\n`;
    text += `**🗺️ Turn-by-Turn Directions:**\n> ${c.directions}\n`;
    return { text, meta: { type: 'classroom', data: c } };
  }

  // 17. Departments & Schools
  if (qLower.includes('department') || qLower.includes('school') || qLower.includes('computer science') || qLower.includes('cse') || qLower.includes('ece') || qLower.includes('electronics') || qLower.includes('mechanical') || qLower.includes('biotech') || qLower.includes('business') || qLower.includes('pharmacy') || qLower.includes('science')) {
    let text = `### 🏛️ Schools & Academic Departments at Aditya University\n\n`;
    kbData.schools.forEach(sch => {
      text += `#### 📌 ${sch.name}\n`;
      if (sch.ugPrograms) text += `* **UG Programs:** ${sch.ugPrograms.join(', ')}\n`;
      if (sch.pgPrograms) text += `* **PG Programs:** ${sch.pgPrograms.join(', ')}\n`;
      if (sch.phdPrograms) text += `* **Doctoral:** ${sch.phdPrograms.join(', ')}\n\n`;
    });
    return { text, meta: { type: 'schools' } };
  }

  // General Overview
  let overview = `Hello! I am **Aditya Chatbot**. Here is quick information about Aditya University:\n\n`;
  overview += `### 🏛️ Aditya University Profile\n`;
  overview += `- **Location**: Surampalem, Kakinada District, AP\n`;
  overview += `- **Recognitions**: UGC 2(f) Recognized, NAAC A++ Accredited, Tier-1 NBA Accredited\n`;
  overview += `- **Leadership**: Chancellor Dr. N. Sesha Reddy, Pro-Chancellors Dr. N. Satish Reddy & Sri N. Deepak Reddy, VC Dr. M. B. Srinivas\n`;
  overview += `- **Schools**: School of Engineering, School of Business, School of Computing, School of Sciences, School of Pharmacy\n\n`;
  overview += `What specific information would you like?`;

  return { text: overview, meta: { type: 'overview' } };
}

function generateSuggestedPrompts(query) {
  return [
    "Who is in the Governing Body & Academic Council?",
    "Show NAAC A++ and NIRF Rankings",
    "List leadership team and Chancellor details",
    "Show B.Tech CSE Class Timetable"
  ];
}
