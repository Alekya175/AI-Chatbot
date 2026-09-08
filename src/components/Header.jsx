import React from 'react';
import { 
  Bot, 
  MapPin, 
  Users, 
  Calendar, 
  BookOpen, 
  Building2, 
  Sparkles,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, systemStatus }) {
  const tabs = [
    { id: 'chat', label: 'AI Assistant', icon: Bot },
    { id: 'map', label: 'Campus Map', icon: MapPin },
    { id: 'faculty', label: 'Faculty Directory', icon: Users },
    { id: 'events', label: 'Events & Calendar', icon: Calendar },
    { id: 'regulations', label: 'Regulations & Tools', icon: BookOpen },
    { id: 'facilities', label: 'Facilities Radar', icon: Building2 },
    { id: 'admin', label: 'Knowledge Admin', icon: PlusCircle },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-wide">CampusPulse</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Apex Institute of Technology & Science</p>
            </div>
          </div>

          {/* Engine Status Indicator */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Engine:</span>
            <span className="text-blue-400 font-semibold">{systemStatus?.activeEngine || 'Local RAG Engine'}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-1" />
          </div>

        </div>

        {/* Tab Navigation Bar */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
