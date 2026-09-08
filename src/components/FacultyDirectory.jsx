import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  MapPin, 
  Clock, 
  BookOpen, 
  Bot, 
  GraduationCap, 
  Sparkles 
} from 'lucide-react';

export default function FacultyDirectory({ initialFacultyName = '', onAskAboutFaculty }) {
  const [faculty, setFaculty] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialFacultyName);
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/faculty')
      .then(res => res.json())
      .then(data => {
        setFaculty(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load faculty:', err);
        setLoading(false);
      });
  }, []);

  const departments = ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Biotechnology'];

  const filteredFaculty = faculty.filter(fac => {
    const matchesDept = selectedDept === 'All' || fac.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesSearch = !searchQuery || 
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.research.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.office.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Search Header */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            University Faculty Directory
          </h2>
          <p className="text-sm text-slate-400">
            Find professor office locations, consulting office hours, research domains, and academic emails.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search professor name or research area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap border ${
              selectedDept === dept
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading faculty profiles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((prof) => (
            <div
              key={prof.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-xl group"
            >
              <div className="space-y-4">
                {/* Header Profile Badge */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                    {prof.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {prof.department.split('&')[0]}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">{prof.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{prof.designation}</p>
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Office: <strong className="text-white">{prof.office}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Hours: <strong className="text-amber-300">{prof.officeHours}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <a href={`mailto:${prof.email}`} className="text-emerald-400 hover:underline truncate">
                      {prof.email}
                    </a>
                  </div>
                </div>

                {/* Research Areas */}
                <div className="pt-2">
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Research & Expertise</h4>
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                    {prof.research}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => onAskAboutFaculty && onAskAboutFaculty(`What are ${prof.name}'s office hours and research projects?`)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center space-x-2 border border-slate-700 transition"
                >
                  <Bot className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                  <span>Ask AI Assistant About Professor</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
