import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  Mic,
  MicOff,
  History,
  Clock,
  ChevronLeft,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { marked } from 'marked';

export default function ChatWindow({ initialQuery = '', theme = 'dark', onCloseChat, currentUser = {} }) {
  const isDark = theme === 'dark';
  const historyStorageKey = `aditya_chat_history_v3_${currentUser.role || 'student'}_${(currentUser.email || 'anonymous').toLowerCase()}`;

  const defaultWelcomeMsg = {
    id: 'welcome-1',
    sender: 'bot',
    text: `Hello! I am **Aditya Chatbot**, your smart university assistant.

I answer questions directly and precisely about:
- 🎓 **Leadership & Administration** (Vice-Chancellor, Chancellor, Registrar, Deans)
- 🏛️ **Departments & Programs** (Engineering, Business, Pharmacy, Sciences, Computing)
- 👨‍🏫 **Faculty Directory & HODs** (Professors, office locations & office hours)
- 💼 **Placements & Packages** (Highest package ₹1.06 Cr, top offers, top recruiters)
- 🛡️ **Scholarships & Fees** (ASAT, JEE, EAPCET, NEET, BIE & CBSE waiver matrix)
- 📅 **Campus Events & Deadlines** (Hackathons, exams, cultural fests)
- 📜 **Academic Regulations** (75% attendance rule, grading scale)

What specific question can I answer for you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    engine: 'Aditya Local RAG Engine',
    suggestedPrompts: [
      "Who is the vice chancellor of Aditya University?",
      "What is the highest placement package?",
      "Who is the HOD of Civil Engineering?",
      "What are the ASAT scholarship slabs?"
    ]
  };

  // 1. Initialize messages from localStorage chat history
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(historyStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read chat history from localStorage', e);
    }
    return [defaultWelcomeMsg];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState('Admissions');
  const messagesEndRef = useRef(null);

  const hasInitializedRef = useRef(false);

  // 2. Persist chat history to localStorage on message update
  useEffect(() => {
    try {
      localStorage.setItem(historyStorageKey, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history to localStorage', e);
    }
  }, [messages, historyStorageKey]);

  useEffect(() => {
    if (initialQuery && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const callApi = async (endpoint, options = {}) => {
    try {
      const res = await fetch(endpoint, options);
      if (res.ok) return res;
    } catch (e) {
      console.warn(`Direct fetch to ${endpoint} failed, retrying with http://localhost:3001${endpoint}`);
    }
    return fetch(`http://localhost:3001${endpoint}`, options);
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await callApi('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          role: currentUser.role || 'student',
          studentEmail: currentUser.email || ''
        })
      });

      if (!response.ok) throw new Error('API server error');
      const data = await response.json();

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.answer,
        engine: data.engine,
        suggestedPrompts: data.suggestedPrompts || [],
        relatedMetaData: data.relatedMetaData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (data.requiresAdmin) {
        const forwarded = await handleForwardToAdmin(botMsg.id, data.answer, query);
        if (forwarded) {
          botMsg.text = `${data.answer}\n\n**Your query has been forwarded to the Admin. They will review it and get back to you with a response. Thank you for your patience.**`;
          botMsg.forwardedToAdmin = true;
        }
      }

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ **Connection Notice:** Unable to reach the server backend. Please ensure the server is running on port 3001.\n\n*Error details:* ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const clearedState = [{
      id: `welcome-reset-${Date.now()}`,
      sender: 'bot',
      text: `Chat history cleared. What specific question can I answer for you?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        "Who is the Vice-Chancellor?",
        "What is the highest placement offer?",
        "Show Civil Engineering HOD"
      ]
    }];
    setMessages(clearedState);
    localStorage.removeItem(historyStorageKey);
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const cleanText = text.replace(/[#*`_]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  const categoryChips = [
    { label: '🎓 Vice-Chancellor', query: 'Who is the vice chancellor of Aditya University?' },
    { label: '💼 Highest Package', query: 'What is the highest placement package?' },
    { label: '🛡️ ASAT Scholarship', query: 'What are the ASAT scholarship percentage slabs?' },
    { label: '👨‍🏫 CSE HOD & Faculty', query: 'Who is the HOD and faculty for Computer Science?' },
    { label: '🏠 Hostel Curfew', query: 'What are the hostel room fees and curfew hours?' }
  ];

  const topicPrompts = {
    General: [
      'Where is Aditya University located?',
      'What programs does Aditya University offer?',
      'What is the vision and mission of Aditya University?',
      'What are the official university contact details?'
    ],
    Notices: [
      'What are the latest college notifications?',
      'Are there any recent exam circulars?',
      'What are the upcoming campus events?',
      'Are there any new scholarship announcements?'
    ],
    Admissions: [
      'What are the B.Tech admission eligibility criteria?',
      'How can I apply for admission?',
      'What MBA programs and admission requirements are available?',
      'Which entrance exams are accepted for admission?'
    ],
    Hostel: [
      'What are the hostel room fees?',
      'What are the hostel curfew hours?',
      'What facilities are available in the hostel?',
      'What are the hostel rules?'
    ],
    Transport: [
      'What campus bus routes are available?',
      'What are the campus bus timings?',
      'How can I get a campus bus pass?',
      'What should I do if a campus bus is delayed?'
    ],
    Scholarships: [
      'What scholarships are available?',
      'What are the ASAT scholarship percentage slabs?',
      'Who is eligible for a merit scholarship?',
      'What fee waivers are available?'
    ],
    Fees: [
      'What is the B.Tech tuition fee?',
      'What are the hostel fees?',
      'What is the MBA fee structure?',
      'How can I pay my university fees?'
    ],
    Contact: [
      'What is the admissions helpline number?',
      'What is the official university email?',
      'Where is the admissions office?',
      'How can I report a college issue to Admin?'
    ]
  };

  const userQueryHistory = messages.filter(m => m.sender === 'user');

  const [forwardedStatusMap, setForwardedStatusMap] = useState({});

  const handleForwardToAdmin = async (msgId, text, questionOverride = '') => {
    try {
      const savedUser = localStorage.getItem('aditya_user');
      const user = savedUser ? JSON.parse(savedUser) : {};
      const lastUserQuestion = questionOverride || [...messages].reverse().find(m => m.sender === 'user')?.text || text;
      const normalizedQuestion = lastUserQuestion.toLowerCase();
      const category = /faculty|teacher|professor|hod/.test(normalizedQuestion)
        ? 'Faculty'
        : /complaint|issue|problem|wrong|incorrect|delay|fine/.test(normalizedQuestion)
          ? 'Complaints'
          : 'General';

      const res = await callApi('/api/admin/queries/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: user.name || 'Rahul Kumar',
          studentRoll: user.roll || '22CSE001',
          studentEmail: user.email || 'rahul001@college.edu',
          topic: category === 'Faculty' ? 'Faculty Issue' : category === 'Complaints' ? 'College Complaint' : 'General Issue',
          category,
          question: lastUserQuestion
        })
      });
      if (res.ok) {
        setForwardedStatusMap(prev => ({ ...prev, [msgId]: true }));
        return true;
      }
    } catch (e) {
      console.error('Failed to forward query to admin', e);
    }
    return false;
  };

  return (
    <div className={`flex flex-col h-full w-full p-2 md:p-4 ${isDark ? 'bg-[#020617] text-slate-100' : 'bg-slate-100 text-slate-900'} relative overflow-hidden transition-colors duration-300 font-sans`}>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_18%,rgba(37,99,235,0.18),transparent_32%),radial-gradient(circle_at_15%_85%,rgba(249,115,22,0.10),transparent_28%)]" />
      
      {/* Top Header Toolbar */}
      <div className={`flex items-center justify-between px-4 md:px-6 py-3.5 rounded-t-[20px] ${isDark ? 'bg-slate-900/90 border-slate-800/90 backdrop-blur-xl' : 'bg-white/90 border-blue-100 shadow-sm backdrop-blur-xl'} border z-20`}>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-2.5 rounded-xl border flex items-center space-x-2 transition ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-orange-400 hover:bg-slate-700' 
                : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 shadow-sm'
            }`}
            title="Toggle Chat History Drawer"
          >
            <History className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold hidden sm:inline">History ({userQueryHistory.length})</span>
          </button>

          <div className="flex items-center space-x-2">
            <img src="/aditya-logo.png" alt="Aditya University" className="h-9 md:h-10 w-auto max-w-[170px] object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            <div>
              <h2 className={`text-base md:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-blue-950'}`}>
                Aditya Chatbot
              </h2>
              <p className="text-[11px] font-bold text-orange-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Online · University knowledge assistant
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={clearChat}
            className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold ${
              isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800 border-slate-800' : 'text-slate-600 hover:text-red-500 hover:bg-red-50 border-blue-200'
            } border transition`}
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>

          {onCloseChat && (
            <button
              onClick={onCloseChat}
              className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-blue-100 text-blue-900 hover:bg-blue-200'} transition flex items-center justify-center`}
              title="Close Fullscreen Chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>

      {/* Main Container with Optional History Sidebar Drawer */}
      <div className={`flex flex-1 overflow-hidden relative border-x border-b rounded-b-[20px] ${isDark ? 'border-slate-800/90 bg-slate-950/80' : 'border-blue-100 bg-white/90'}`}>
        <aside className={`hidden md:flex w-60 flex-shrink-0 flex-col p-4 border-r ${isDark ? 'border-slate-800/90 bg-slate-900/55' : 'border-blue-100 bg-slate-50/80'}`}>
          <div className={`flex items-center gap-2 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-blue-100'}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-white text-sm shadow-lg shadow-orange-900/20">✦</div>
            <div>
              <p className="text-sm font-extrabold">Aditya Chatbot</p>
              <p className="text-[9px] uppercase tracking-wider text-orange-500 font-bold">AI Campus Assistant</p>
            </div>
          </div>
          <p className={`text-[10px] uppercase tracking-[0.2em] font-black mt-5 mb-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Explore campus</p>
          <div className="space-y-1">
            {[
              ['💬', 'General'], ['🔔', 'Notices'], ['🎓', 'Admissions'], ['🏠', 'Hostel'],
              ['🚌', 'Transport'], ['🛡️', 'Scholarships'], ['💳', 'Fees'], ['📞', 'Contact']
            ].map(([icon, label]) => (
              <div key={label}>
                <button
                  type="button"
                  onClick={() => setActiveTopic(label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition ${activeTopic === label ? 'bg-gradient-to-r from-orange-500/20 to-blue-500/10 text-white border border-orange-500/40 shadow-lg shadow-orange-950/10' : isDark ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/70' : 'text-slate-500 hover:bg-white'}`}
                >
                  <span>{icon}</span><span>{label}</span>
                </button>
                {activeTopic === label && topicPrompts[label] && (
                  <div className="ml-3 mt-1 mb-2 space-y-1 border-l border-orange-500/30 pl-2">
                    {topicPrompts[label].map(prompt => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-[10px] leading-tight transition ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-orange-300' : 'text-slate-500 hover:bg-white hover:text-orange-600'}`}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
        
        {/* Chat History Sidebar Drawer */}
        {isHistoryOpen && (
          <div className={`w-72 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-200 shadow-xl'} border-r flex flex-col p-4 z-30 transition-all duration-300`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-blue-950'} uppercase tracking-wider flex items-center gap-1.5`}>
                <Clock className="w-4 h-4 text-orange-500" /> Recent Questions
              </h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {userQueryHistory.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No questions asked yet.</p>
              ) : (
                userQueryHistory.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSendMessage(q.text);
                      setIsHistoryOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition line-clamp-2 ${
                      isDark 
                        ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200' 
                        : 'bg-blue-50/50 hover:bg-blue-100/50 border-blue-100 text-blue-950'
                    }`}
                  >
                    <span className="text-orange-500 font-bold mr-1">Q:</span> {q.text}
                  </button>
                ))
              )}
            </div>

            <button
              onClick={clearChat}
              className="mt-3 w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold transition flex items-center justify-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Transparent Robot Background Watermark */}
          <div 
            className={`robot-watermark absolute inset-0 pointer-events-none z-0 ${isDark ? 'opacity-15' : 'opacity-10'} mix-blend-multiply flex items-center justify-center`}
            style={{
              backgroundImage: `url('/robot_bg.png')`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              mixBlendMode: 'multiply'
            }}
          />
          
          {/* Quick Category Prompt Chips */}
          <div className={`flex space-x-2 px-4 md:px-6 py-3 ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-blue-50/60 border-blue-100'} border-b overflow-x-auto scrollbar-none z-10`}>
            {categoryChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition whitespace-nowrap ${
                  isDark 
                    ? 'bg-slate-950/80 hover:bg-orange-500/20 hover:border-orange-400 text-slate-300 hover:text-orange-400 border-slate-800' 
                    : 'bg-white hover:bg-orange-50 hover:border-orange-400 text-blue-950 hover:text-orange-600 border-blue-200 shadow-sm'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-7 space-y-7 max-w-6xl mx-auto w-full">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start max-w-4xl gap-3.5">
                  {msg.sender === 'bot' ? (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-orange-500 flex items-center justify-center text-white shadow-md flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md flex-shrink-0 mt-1 order-2">
                      <User className="w-5 h-5" />
                    </div>
                  )}

                  <div
                      className={`p-5 md:p-6 rounded-[22px] border text-sm leading-relaxed shadow-xl ${
                      msg.sender === 'user'
                          ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white border-orange-400 rounded-tr-none shadow-orange-950/20'
                        : isDark 
                          ? 'bg-slate-900/90 text-slate-100 border-slate-800/90 rounded-tl-none shadow-black/20 backdrop-blur-sm' 
                          : 'bg-white text-slate-800 border-blue-200/80 rounded-tl-none shadow-blue-950/5'
                    }`}
                  >
                    {/* Message Body */}
                    <div
                      className={`prose ${isDark ? 'prose-invert' : 'prose-slate'} max-w-none`}
                      dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                    />

                    {/* Metadata & Audio Action Bar */}
                    {msg.sender === 'bot' && (
                      <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-blue-100 text-slate-500'} flex flex-wrap items-center justify-between gap-2 text-xs`}>
                        <div className="flex items-center space-x-2">
                          {msg.engine && (
                            <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-blue-50 text-blue-900'} font-mono text-[10px]`}>
                              ⚡ {msg.engine}
                            </span>
                          )}
                          <span>{msg.timestamp}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          {forwardedStatusMap[msg.id] ? (
                            <span className="text-emerald-400 font-extrabold text-[11px] flex items-center gap-1">
                              ✓ Forwarded to Admin
                            </span>
                          ) : (
                            <button
                              onClick={() => handleForwardToAdmin(msg.id, msg.text)}
                              className="text-orange-400 hover:text-orange-300 font-bold text-[11px] flex items-center space-x-1 border border-orange-500/30 px-2 py-0.5 rounded-lg bg-orange-500/10 transition"
                              title="Forward this question to University Admin"
                            >
                              <span>Forward to Admin</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={() => handleSpeak(msg.text)}
                            className="flex items-center space-x-1 text-slate-400 hover:text-orange-500 transition"
                            title="Read Aloud"
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-orange-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                            <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Follow-up Suggested Prompts */}
                    {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-blue-100'}`}>
                        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2 flex items-center gap-1`}>
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Suggested Follow-ups:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.suggestedPrompts.map((prompt, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => handleSendMessage(prompt)}
                              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                isDark 
                                  ? 'bg-slate-900 hover:bg-orange-500/20 text-slate-300 hover:text-orange-400 border-slate-800' 
                                  : 'bg-blue-50 hover:bg-orange-50 text-blue-950 hover:text-orange-600 border-blue-200'
                              }`}
                            >
                              <span>{prompt}</span>
                              <ArrowRight className="w-3 h-3 text-orange-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Spinner */}
            {isLoading && (
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md animate-pulse">
                  <Bot className="w-5 h-5" />
                </div>
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-blue-200 text-slate-600'} border text-sm flex items-center space-x-2 shadow-sm`}>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce delay-200"></div>
                  <span className="ml-2 font-semibold">Formulating direct answer...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Full Screen Input Bar */}
          <div className={`p-4 md:p-5 ${isDark ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white/95 border-blue-100'} border-t z-20 backdrop-blur-xl`}>
            <div className="max-w-5xl mx-auto w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-3"
              >
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-3.5 rounded-xl border transition ${
                    isListening
                      ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse'
                      : isDark ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800' : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border-blue-200'
                  }`}
                  title="Voice Dictation"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask about admissions, faculty, fees or campus life..."
                  className={`flex-1 ${isDark ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-blue-200 text-slate-900 placeholder-slate-400'} border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition shadow-inner`}
                />

                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isLoading}
                  className="px-5 md:px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 flex items-center space-x-2 transition hover:-translate-y-0.5"
                >
                  <span>Ask</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
