import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Bot, 
  FileText,
  Percent
} from 'lucide-react';

export default function RegulationsGuide({ onAskAboutRule }) {
  const [regulations, setRegulations] = useState([]);
  
  // Attendance Calculator State
  const [totalClasses, setTotalClasses] = useState(40);
  const [attendedClasses, setAttendedClasses] = useState(28);

  // GPA Target Estimator State
  const [currentCGPA, setCurrentCGPA] = useState(3.4);
  const [completedCredits, setCompletedCredits] = useState(60);
  const [targetCGPA, setTargetCGPA] = useState(3.6);
  const [upcomingCredits, setUpcomingCredits] = useState(20);

  useEffect(() => {
    fetch('/api/regulations')
      .then(res => res.json())
      .then(data => setRegulations(data))
      .catch(err => console.error('Failed to load regulations:', err));
  }, []);

  // Attendance Calculations
  const currentAttendancePct = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : 0;
  const isEligible = currentAttendancePct >= 75;
  const isCondonable = currentAttendancePct >= 65 && currentAttendancePct < 75;

  // Calculate needed consecutive classes to hit 75%
  let classesNeededFor75 = 0;
  if (currentAttendancePct < 75 && totalClasses > 0) {
    // Equation: (attended + x) / (total + x) >= 0.75  => attended + x >= 0.75*total + 0.75*x => 0.25*x >= 0.75*total - attended
    classesNeededFor75 = Math.max(0, Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25));
  }

  // GPA Calculations
  // Equation: (currentCGPA * completedCredits + neededSGPA * upcomingCredits) / (completedCredits + upcomingCredits) = targetCGPA
  const totalFutureCredits = completedCredits + upcomingCredits;
  const requiredSGPA = upcomingCredits > 0
    ? ((targetCGPA * totalFutureCredits - currentCGPA * completedCredits) / upcomingCredits).toFixed(2)
    : 0;

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            Academic Regulations & Student Tools
          </h2>
          <p className="text-sm text-slate-400">
            Explore university policies, 75% attendance criteria, grading scales, and interactive academic calculators.
          </p>
        </div>
      </div>

      {/* Interactive Academic Calculators Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Attendance Criteria Calculator */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-400" />
              Attendance 75% Rule Calculator
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Rule #REG-01
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Total Classes Held</label>
              <input
                type="number"
                value={totalClasses}
                onChange={(e) => setTotalClasses(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Classes Attended</label>
              <input
                type="number"
                value={attendedClasses}
                onChange={(e) => setAttendedClasses(Math.min(totalClasses, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Result Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isEligible 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : isCondonable 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div>
              <div className="text-xs uppercase font-semibold">Current Attendance Status</div>
              <div className="text-2xl font-extrabold">{currentAttendancePct}%</div>
            </div>

            <div className="text-right">
              {isEligible ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Exam Eligible
                </span>
              ) : isCondonable ? (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Condonation Needed
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-red-500 text-white font-bold text-xs">
                  ⚠️ Critical (Under 65%)
                </span>
              )}
            </div>
          </div>

          {!isEligible && (
            <p className="text-xs text-amber-300 italic bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
              💡 You need to attend <strong>{classesNeededFor75}</strong> consecutive upcoming classes without missing any to reach the mandatory 75% threshold.
            </p>
          )}
        </div>

        {/* 2. Target GPA / SGPA Estimator */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              Target CGPA / Semester SGPA Estimator
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
              10-Point Scale
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Current CGPA</label>
              <input
                type="number"
                step="0.1"
                value={currentCGPA}
                onChange={(e) => setCurrentCGPA(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Completed Credits</label>
              <input
                type="number"
                value={completedCredits}
                onChange={(e) => setCompletedCredits(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Target CGPA Goal</label>
              <input
                type="number"
                step="0.1"
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Upcoming Credits</label>
              <input
                type="number"
                value={upcomingCredits}
                onChange={(e) => setUpcomingCredits(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Needed SGPA Output */}
          <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-blue-400 font-semibold">Required Next Semester SGPA</div>
              <div className="text-2xl font-extrabold text-white">
                {requiredSGPA > 10 ? 'Impossible (>10.0)' : requiredSGPA < 0 ? 'Achieved' : `${requiredSGPA} / 10.0`}
              </div>
            </div>
            <Award className="w-8 h-8 text-blue-400" />
          </div>
        </div>

      </div>

      {/* Official Policy & Rules Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          Official Academic Rules & Campus Policies
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regulations.map((reg) => (
            <div
              key={reg.id}
              className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {reg.category}
                </span>
                <button
                  onClick={() => onAskAboutRule && onAskAboutRule(`Explain the details of ${reg.title}`)}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Bot className="w-3.5 h-3.5" /> Ask AI
                </button>
              </div>

              <h4 className="text-base font-bold text-white">{reg.title}</h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">{reg.summary}</p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                {reg.details}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
