import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Home as HomeIcon, 
  ShieldCheck, 
  Wrench, 
  Sparkles, 
  MessageSquare, 
  X, 
  LogOut, 
  Info, 
  PhoneCall, 
  Briefcase,
  Bot,
  Sun,
  Moon
} from 'lucide-react';
import ChatWindow from './ChatWindow';
import AdminManager from './AdminManager';

export default function AdityaDashboard({ currentUser, onLogout, theme, onToggleTheme }) {
  const [activeNavTab, setActiveNavTab] = useState('home'); // 'home' | 'about' | 'services' | 'contact' | 'admin'
  const [activeChatTopic, setActiveChatTopic] = useState(null); // query string or null
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isDark = theme === 'dark';

  const featureCards = [
    {
      id: 'notifications',
      title: 'College Notifications',
      subtitle: 'Latest updates and announcements',
      icon: Bell,
      query: 'Show me the latest college notifications and exam circulars'
    },
    {
      id: 'admissions',
      title: 'Admissions',
      subtitle: 'Programs, eligibility & apply now',
      icon: CheckCircle2,
      query: 'Tell me about B.Tech and MBA admissions 2026 and application links'
    },
    {
      id: 'hostel',
      title: 'Hostel & Transport',
      subtitle: 'Accommodation and commute info',
      icon: HomeIcon,
      query: 'What are the hostel room rules, curfew, and campus bus routes?'
    },
    {
      id: 'scholarships',
      title: 'Scholarships & Fees',
      subtitle: 'Financial aid and fee structure',
      icon: ShieldCheck,
      query: 'What merit scholarships, fee concessions, and financial aid are available?'
    }
  ];

  const handleCardClick = (query) => {
    setActiveChatTopic(query);
    setIsChatOpen(true);
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const callApi = async (endpoint, options = {}) => {
    try {
      const res = await fetch(endpoint, options);
      if (res.ok) return res;
    } catch (e) {
      console.warn(`Fetch to ${endpoint} failed, trying localhost fallback`);
    }
    return fetch(`http://localhost:3001${endpoint}`, options);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const email = currentUser?.email || 'rahul001@college.edu';
      const res = await callApi(`/api/student/notifications?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadNotifCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Could not fetch notifications', e);
    }
  };

  const handleOpenNotifications = () => {
    setIsNotifOpen(!isNotifOpen);
    if (unreadNotifCount > 0) {
      callApi('/api/student/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser?.email })
      }).then(() => setUnreadNotifCount(0));
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-blue-50 via-white to-slate-100 text-slate-900'} flex flex-col justify-between p-6 md:p-10 relative overflow-hidden font-sans transition-colors duration-300`}>
      <div
        className="robot-watermark absolute inset-0 pointer-events-none opacity-[0.08] bg-[center_right] bg-no-repeat bg-contain mix-blend-multiply"
        style={{ backgroundImage: "url('/robot_bg.png')" }}
        aria-hidden="true"
      />
      
      {/* Background glow effects matching design */}
      <div className={`absolute top-1/3 right-1/4 w-[30rem] h-[30rem] ${isDark ? 'bg-blue-600/10' : 'bg-blue-500/15'} rounded-full blur-[100px] pointer-events-none`}></div>
      <div className={`absolute bottom-10 left-10 w-96 h-96 ${isDark ? 'bg-orange-600/10' : 'bg-orange-500/15'} rounded-full blur-[120px] pointer-events-none`}></div>

      <div className="max-w-7xl w-full mx-auto space-y-8 relative z-10">
        
        {/* Top Header & Branding Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <img src="/aditya-logo.png" alt="Aditya University" className="h-12 md:h-14 w-auto object-contain object-left" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            <p className="text-sm font-bold text-orange-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Aditya Chatbot Portal
            </p>
          </div>

          {/* User Bar & Theme Toggle */}
          <div className="flex items-center space-x-3">
            
            {/* Student Notification Bell Button */}
            <button
              onClick={handleOpenNotifications}
              className={`p-2.5 rounded-2xl relative border transition ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-orange-400 hover:bg-slate-800' 
                  : 'bg-white border-blue-200 text-blue-900 hover:bg-blue-50 shadow-sm'
              }`}
              title="View Admin Replies & Notifications"
            >
              <Bell className="w-4 h-4 text-orange-500" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2.5 rounded-2xl flex items-center space-x-2 border transition ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                  : 'bg-white border-blue-200 text-blue-900 hover:bg-blue-50 shadow-sm'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-800" />}
              <span className="text-xs font-bold capitalize hidden sm:inline">{theme} Mode</span>
            </button>

            {/* Logged in User Bar */}
            <div className={`flex items-center space-x-3 text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-200 shadow-sm'} border px-4 py-2 rounded-2xl`}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-orange-500 text-white font-bold flex items-center justify-center shadow">
                {currentUser?.name?.[0] || 'A'}
              </div>
              <div>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} leading-tight`}>{currentUser?.name}</p>
                <p className="text-orange-500 font-semibold capitalize text-[10px]">{currentUser?.role || 'Student'}</p>
              </div>
              <button
                onClick={onLogout}
                className="ml-2 text-slate-400 hover:text-red-500 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center gap-3">
          
          <button
            onClick={() => setActiveNavTab('home')}
            className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition shadow-md ${
              activeNavTab === 'home'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30'
                : isDark 
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800' 
                  : 'bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 shadow-sm'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => setActiveNavTab('about')}
            className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition ${
              activeNavTab === 'about'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30'
                : isDark 
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800' 
                  : 'bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 shadow-sm'
            }`}
          >
            About
          </button>

          <button
            onClick={() => setActiveNavTab('services')}
            className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition ${
              activeNavTab === 'services'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30'
                : isDark 
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800' 
                  : 'bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 shadow-sm'
            }`}
          >
            Services
          </button>

          <button
            onClick={() => setActiveNavTab('contact')}
            className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition ${
              activeNavTab === 'contact'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30'
                : isDark 
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800' 
                  : 'bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 shadow-sm'
            }`}
          >
            Contact
          </button>

          <button
            onClick={() => setActiveNavTab('admin')}
            className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition flex items-center space-x-2 border ${
              activeNavTab === 'admin'
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                : 'bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-white border-blue-600 shadow-md shadow-blue-900/30'
            }`}
          >
            <Wrench className="w-4 h-4 text-orange-400" />
            <span>Admin Dashboard</span>
          </button>

        </div>

        {/* Main Content Area */}
        {activeNavTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-4">
            
            {/* Left Column: 4 Feature Cards */}
            <div className="lg:col-span-6 space-y-4">
              {featureCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.query)}
                    className={`${
                      isDark 
                        ? 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800/90 shadow-xl' 
                        : 'bg-white hover:bg-blue-50/60 border-blue-100 hover:border-orange-400/60 shadow-lg shadow-blue-950/5'
                    } border rounded-3xl p-5 flex items-center space-x-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group`}
                  >
                    {/* Glowing Orange Icon Box */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 flex-shrink-0 group-hover:scale-105 transition">
                      <Icon className="w-7 h-7 stroke-[2.5]" />
                    </div>

                    {/* Text Details */}
                    <div>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-blue-950'} group-hover:text-orange-500 transition`}>
                        {card.title}
                      </h3>
                      <p className={`text-xs font-semibold ${isDark ? 'text-orange-400/90' : 'text-orange-600'} mt-0.5`}>
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: 3D Robot Mascot */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-6">
              
              {/* Concentric ambient glowing rings */}
              <div className={`absolute w-[22rem] h-[22rem] md:w-[26rem] md:h-[26rem] rounded-full border ${isDark ? 'border-slate-800/60 bg-gradient-to-tr from-blue-900/10 to-indigo-900/20' : 'border-blue-200/60 bg-gradient-to-tr from-blue-200/20 to-orange-200/20'} pointer-events-none animate-pulse`}></div>
              <div className={`absolute w-[18rem] h-[18rem] md:w-[21rem] md:h-[21rem] rounded-full border ${isDark ? 'border-slate-800/40' : 'border-blue-100'} pointer-events-none`}></div>

              {/* Floating Speech Bubble above Robot */}
              <div 
                onClick={() => handleCardClick("Hello! What can you help me with?")}
                className={`${
                  isDark 
                    ? 'bg-slate-900 border-slate-700/80 text-slate-200 shadow-xl' 
                    : 'bg-white border-blue-200 text-blue-950 shadow-xl shadow-blue-900/10'
                } border px-4 py-2 rounded-2xl text-xs flex items-center space-x-2 cursor-pointer hover:border-orange-500 transition mb-4 animate-bounce z-20`}
              >
                <MessageSquare className="w-4 h-4 text-orange-500" />
                <span className="font-semibold">Ask me anything about Aditya University!</span>
              </div>

              {/* 3D Robot Mascot Graphic */}
              <div 
                onClick={() => handleCardClick("Hi Aditya Chatbot!")}
                className="relative z-10 cursor-pointer group transition-transform hover:scale-105"
              >
                <div className="w-64 h-64 md:w-80 md:h-80 p-2 flex items-center justify-center relative">
                  <img 
                    src="/robot_bg.png" 
                    alt="Aditya AI Robot" 
                    className="robot-float w-full h-full object-contain mix-blend-multiply drop-shadow-[0_10px_25px_rgba(37,99,235,0.3)] transition-transform duration-300 group-hover:scale-110" 
                  />
                </div>
              </div>

              <button
                onClick={() => handleCardClick("What can you do?")}
                className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/20 hover:scale-105 transition flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>Click Robot to Start Chatting</span>
              </button>

            </div>

          </div>
        )}

        {/* Modal Views for About, Services, Contact, and Admin */}
        {activeNavTab === 'about' && (
          <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-200 shadow-xl shadow-blue-900/5'} p-8 rounded-3xl border space-y-4 max-w-3xl mx-auto`}>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-950'} flex items-center gap-2`}>
              <Info className="w-6 h-6 text-orange-500" /> About Aditya University
            </h2>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed text-sm`}>
              Aditya University is a premier higher education institution dedicated to academic excellence, innovative research, and holistic student development across Engineering, Technology, Management, and Life Sciences.
            </p>
            <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-blue-100'} text-center`}>
              <div className={`p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-100'} rounded-2xl border`}>
                <div className="text-2xl font-extrabold text-orange-500">15,000+</div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>Active Students</div>
              </div>
              <div className={`p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-100'} rounded-2xl border`}>
                <div className="text-2xl font-extrabold text-blue-600">500+</div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>Expert Faculty</div>
              </div>
              <div className={`p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-100'} rounded-2xl border`}>
                <div className="text-2xl font-extrabold text-emerald-500">₹1.06 Cr</div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>Highest Package</div>
              </div>
            </div>
          </div>
        )}

        {activeNavTab === 'services' && (
          <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-200 shadow-xl shadow-blue-900/5'} p-8 rounded-3xl border space-y-4 max-w-3xl mx-auto`}>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-950'} flex items-center gap-2`}>
              <Briefcase className="w-6 h-6 text-orange-500" /> Digital Campus Services
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-100'} rounded-2xl border text-xs space-y-1`}>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-blue-950'}`}>24/7 AI Campus Assistant</h4>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Instant answers to notifications, exams, and navigation.</p>
              </div>
              <div className={`p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-100'} rounded-2xl border text-xs space-y-1`}>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-blue-950'}`}>Online Admissions Portal</h4>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Application submission, document verification & status.</p>
              </div>
              <div className={`p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-100'} rounded-2xl border text-xs space-y-1`}>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-blue-950'}`}>Hostel & Bus Pass Booking</h4>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Digital room allocation and commute pass issuance.</p>
              </div>
              <div className={`p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-100'} rounded-2xl border text-xs space-y-1`}>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-blue-950'}`}>Merit Scholarship Portal</h4>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Fee waivers and financial assistance applications.</p>
              </div>
            </div>
          </div>
        )}

        {activeNavTab === 'contact' && (
          <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-200 shadow-xl shadow-blue-900/5'} p-8 rounded-3xl border space-y-4 max-w-2xl mx-auto`}>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-950'} flex items-center gap-2`}>
              <PhoneCall className="w-6 h-6 text-orange-500" /> Contact University Helpline
            </h2>
            <div className={`space-y-3 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <p>📍 <strong>Campus Address:</strong> Aditya Nagar, ADB Road, Surampalem, Kakinada District, Andhra Pradesh - 533437.</p>
              <p>📞 <strong>Admissions Helpline:</strong> +91-9989776661</p>
              <p>✉️ <strong>Official Email:</strong> info@adityauniversity.in</p>
            </div>
          </div>
        )}

        {activeNavTab === 'admin' && (
          <div className="pt-2">
            <AdminManager theme={theme} />
          </div>
        )}

      </div>

      {/* Interactive AI Chat Fullscreen Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 w-screen h-screen flex flex-col overflow-hidden bg-slate-950">
          <ChatWindow
            initialQuery={activeChatTopic}
            currentUser={currentUser}
            theme={theme}
            onCloseChat={() => setIsChatOpen(false)}
          />
        </div>
      )}

      {/* Student Notifications Modal Drawer */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-blue-200 text-slate-900'} border rounded-3xl p-6 shadow-2xl space-y-4 relative overflow-hidden`}>
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" /> Admin Replies & Notifications
              </h3>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-semibold">
                  No replies from Admin yet. Forward a query to get an official response!
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs space-y-1.5">
                    <p className="text-orange-400 font-bold text-[11px] uppercase tracking-wider">
                      Topic: {n.topic || 'General Query'}
                    </p>
                    <p className="font-semibold text-slate-300">
                      <strong>Your Question:</strong> {n.question}
                    </p>
                    <div className="pt-1.5 border-t border-emerald-800/30 text-emerald-400 font-extrabold text-sm">
                      Admin Reply: {n.adminReply}
                    </div>
                    <p className="text-[10px] font-mono text-emerald-500/70">
                      Answered: {n.answeredAt}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`max-w-7xl w-full mx-auto pt-8 border-t ${isDark ? 'border-slate-800/80' : 'border-blue-200/80'} relative z-10`} aria-hidden="true" />

    </div>
  );
}
