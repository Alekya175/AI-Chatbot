import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Tag, 
  Bot, 
  Sparkles,
  Search
} from 'lucide-react';

export default function EventsCalendar({ onAskAboutEvent }) {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load events:', err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', 'Tech & Innovation', 'Academic', 'Cultural', 'Career & Internship', 'Guest Lecture'];

  const filteredEvents = events.filter(e => {
    return selectedCategory === 'All' || e.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-400" />
            Campus Events & Academic Calendar 2026
          </h2>
          <p className="text-sm text-slate-400">
            Track upcoming hackathons, midterm exam dates, guest lectures, career expos, and cultural fests.
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap border ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading events timeline...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-amber-500/40 transition shadow-xl group"
            >
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {evt.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{evt.date}</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">{evt.title}</h3>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {evt.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                {evt.registrationLink !== 'N/A' ? (
                  <a
                    href={evt.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center space-x-2 transition"
                  >
                    <span>Register / Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 italic py-2">Official Schedule</span>
                )}

                <button
                  onClick={() => onAskAboutEvent && onAskAboutEvent(`Tell me more about ${evt.title} scheduled on ${evt.date}`)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 border border-slate-700 transition"
                  title="Ask AI for event schedule and details"
                >
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>Ask AI</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
