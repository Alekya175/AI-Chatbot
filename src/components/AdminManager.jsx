import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sparkles, 
  Sun, 
  Moon, 
  X, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Send, 
  Mic, 
  User, 
  Wrench,
  AlertCircle,
  PlusCircle
} from 'lucide-react';

export default function AdminManager({ theme = 'dark', onClose }) {
  const isDark = theme === 'dark';

  const [queries, setQueries] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    answered: 0,
    complaints: 0,
    faculty: 0,
    personal: 0
  });
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Pending' | 'Answered' | 'Complaints' | 'Faculty' | 'Personal'
  const [replyInputMap, setReplyInputMap] = useState({});
  const [isSubmittingMap, setIsSubmittingMap] = useState({});

  // Language state
  const [lang, setLang] = useState('EN');

  useEffect(() => {
    fetchQueries();
  }, []);

  const callApi = async (endpoint, options = {}) => {
    try {
      const res = await fetch(endpoint, options);
      if (res.ok) return res;
    } catch (e) {
      console.warn(`Fetch to ${endpoint} failed, trying localhost fallback`);
    }
    return fetch(`http://localhost:3001${endpoint}`, options);
  };

  const fetchQueries = async () => {
    try {
      const res = await callApi('/api/admin/queries');
      if (res.ok) {
        const data = await res.json();
        setQueries(data.queries || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (e) {
      console.warn('Could not fetch queries from server', e);
    }
  };

  const handleSendReply = async (queryId) => {
    const replyText = replyInputMap[queryId];
    if (!replyText || !replyText.trim()) return;

    setIsSubmittingMap(prev => ({ ...prev, [queryId]: true }));

    try {
      const res = await callApi('/api/admin/queries/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId, adminReply: replyText })
      });

      if (res.ok) {
        setReplyInputMap(prev => ({ ...prev, [queryId]: '' }));
        await fetchQueries();
      }
    } catch (e) {
      console.error('Failed to submit reply:', e);
    } finally {
      setIsSubmittingMap(prev => ({ ...prev, [queryId]: false }));
    }
  };

  // Filter queries based on selected pill
  const filteredQueries = queries.filter(q => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pending') return q.status === 'Pending';
    if (activeFilter === 'Answered') return q.status === 'Answered';
    if (activeFilter === 'Complaints') return q.category === 'Complaints';
    if (activeFilter === 'Faculty') return q.category === 'Faculty';
    if (activeFilter === 'Personal') return q.category === 'Personal';
    return true;
  });

  return (
    <div className={`w-full max-w-5xl mx-auto rounded-3xl ${isDark ? 'bg-slate-950 text-slate-100 border-slate-800' : 'bg-slate-50 text-slate-900 border-blue-200 shadow-2xl'} border p-6 space-y-6 relative overflow-hidden font-sans transition-colors duration-300`}>
      
      {/* 1. Header matching exact screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        
        <div>
          <img src="/aditya-logo.png" alt="Aditya University" className="h-10 w-auto object-contain object-left mb-2" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-blue-950'} tracking-tight`}>
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage and reply to student queries
          </p>
        </div>

        {/* Top Right Control Buttons */}
        <div className="flex items-center space-x-3">
          
          {/* Language Selector Dropdown */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-blue-200 text-blue-900 shadow-sm'}`}>
            <Globe className="w-3.5 h-3.5 text-orange-500" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="EN" className={isDark ? 'bg-slate-900' : 'bg-white'}>EN</option>
              <option value="TE" className={isDark ? 'bg-slate-900' : 'bg-white'}>TE (Telugu)</option>
              <option value="HI" className={isDark ? 'bg-slate-900' : 'bg-white'}>HI (Hindi)</option>
            </select>
          </div>

          {/* Glowing Aditya AI Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>✦ Aditya AI</span>
          </div>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-blue-200 text-slate-600 hover:text-blue-950'} transition`}
              title="Close Admin Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        
        {/* All Pill */}
        <button
          onClick={() => setActiveFilter('All')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition border ${
            activeFilter === 'All'
              ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30'
              : isDark ? 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <span>All</span>
          <span className="px-2 py-0.5 rounded-full bg-orange-600/90 text-white text-[10px]">
            {counts.all}
          </span>
        </button>

        {/* Pending Pill */}
        <button
          onClick={() => setActiveFilter('Pending')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition border ${
            activeFilter === 'Pending'
              ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30'
              : isDark ? 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <span>Pending</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px]">
            {counts.pending}
          </span>
        </button>

        {/* Answered Pill */}
        <button
          onClick={() => setActiveFilter('Answered')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition border ${
            activeFilter === 'Answered'
              ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30'
              : isDark ? 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <span>Answered</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
            {counts.answered}
          </span>
        </button>

        {/* Complaints Pill */}
        <button
          onClick={() => setActiveFilter('Complaints')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition border ${
            activeFilter === 'Complaints'
              ? 'bg-orange-500 text-white border-orange-500 shadow-md'
              : isDark ? 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          Complaints
        </button>

        {/* Faculty Pill */}
        <button
          onClick={() => setActiveFilter('Faculty')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition border ${
            activeFilter === 'Faculty'
              ? 'bg-orange-500 text-white border-orange-500 shadow-md'
              : isDark ? 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          Faculty
        </button>

        {/* Personal Pill */}
        <button
          onClick={() => setActiveFilter('Personal')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition border ${
            activeFilter === 'Personal'
              ? 'bg-orange-500 text-white border-orange-500 shadow-md'
              : isDark ? 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          Personal
        </button>

      </div>

      {/* 3. Student Question Cards Stream */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {filteredQueries.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl p-6">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No queries found for selected filter.</p>
          </div>
        ) : (
          filteredQueries.map((q) => (
            <div 
              key={q.id}
              className={`p-6 rounded-3xl border transition-all ${
                isDark 
                  ? 'bg-slate-900/80 border-slate-800/80 text-slate-100 shadow-xl' 
                  : 'bg-white border-blue-100 text-slate-900 shadow-md'
              } space-y-4 relative`}
            >
              {/* Top Header of Card */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full border text-[11px] font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                    💬 {q.category || 'General'}
                  </span>

                  {q.status === 'Answered' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-600/40 text-[11px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Answered
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-600/40 text-[11px] font-extrabold flex items-center gap-1 animate-pulse">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>

                <span className="text-slate-400 font-mono text-[11px]">
                  {q.dateStr || '22 Jul, 11:28 am'}
                </span>
              </div>

              {/* Card Body */}
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-slate-300">
                  <span className="text-orange-500 font-bold">Student:</span>{' '}
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>{q.studentName}</strong>{' '}
                  <span className="text-slate-500 font-mono text-xs">({q.studentRoll || '22CSE001'}) {q.studentEmail}</span>
                </p>

                <p className="font-semibold text-slate-300">
                  <span className="text-orange-500 font-bold">Topic:</span> {q.topic || 'General Issue'}
                </p>

                <p className="font-semibold text-slate-300">
                  <span className="text-orange-500 font-bold">Question:</span> {q.question}
                </p>
              </div>

              {/* Admin Reply Section */}
              {q.status === 'Answered' ? (
                <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-4 space-y-1 text-xs">
                  <p className="font-extrabold text-emerald-400 text-sm">
                    Admin reply: {q.adminReply}
                  </p>
                  <p className="text-[11px] text-emerald-500/70 font-mono">
                    Answered: {q.answeredAt || '22/7/2026, 11:29:05 am'}
                  </p>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <textarea
                    rows="2"
                    placeholder="Type official reply to send to student..."
                    value={replyInputMap[q.id] || ''}
                    onChange={(e) => setReplyInputMap({ ...replyInputMap, [q.id]: e.target.value })}
                    className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-blue-200 text-slate-900'} border rounded-2xl p-3 text-xs focus:outline-none focus:border-orange-500 transition`}
                  />
                  <button
                    onClick={() => handleSendReply(q.id)}
                    disabled={isSubmittingMap[q.id] || !replyInputMap[q.id]?.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-extrabold text-xs flex items-center space-x-2 transition shadow-md"
                  >
                    <span>Send Reply to Student</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      <div className={`pt-4 border-t ${isDark ? 'border-slate-800 text-slate-500' : 'border-blue-100 text-slate-500'} text-xs text-center`}>
        Admin access is limited to forwarded student complaints and official replies.
      </div>

    </div>
  );
}
