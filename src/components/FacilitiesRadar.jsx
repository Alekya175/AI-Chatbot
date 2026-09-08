import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  MapPin, 
  Users, 
  Phone, 
  CheckCircle2, 
  Bot, 
  Zap 
} from 'lucide-react';

export default function FacilitiesRadar({ onAskAboutFacility }) {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/facilities')
      .then(res => res.json())
      .then(data => {
        setFacilities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load facilities:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-400" />
            Campus Facilities & Real-time Crowd Radar
          </h2>
          <p className="text-sm text-slate-400">
            Check operating hours, live occupancy busy levels, and available services across key campus buildings.
          </p>
        </div>
      </div>

      {/* Facilities Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading facility status...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-teal-500/40 transition shadow-xl group"
            >
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {fac.category}
                  </span>
                  <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{fac.status}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition">{fac.name}</h3>

                {/* Busy / Crowd Meter */}
                <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-teal-400" /> Live Occupancy
                    </span>
                    <span className={fac.busyLevel > 70 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                      {fac.busyLevel}% Busy
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fac.busyLevel > 70 ? 'bg-amber-500' : 'bg-teal-400'
                      }`}
                      style={{ width: `${fac.busyLevel}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Hours:</strong> {fac.hours}</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Location:</strong> {fac.location}</span>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Contact:</strong> {fac.contact}</span>
                  </div>
                </div>

                {/* Amenities List */}
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Amenities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {fac.amenities.map((am, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-400" /> {am}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => onAskAboutFacility && onAskAboutFacility(`What are the timings and rules for ${fac.name}?`)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center space-x-2 border border-slate-700 transition"
                >
                  <Bot className="w-4 h-4 text-teal-400 group-hover:text-white" />
                  <span>Ask AI Assistant About Facility</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
