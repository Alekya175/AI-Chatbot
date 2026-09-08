import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Compass, 
  Layers, 
  Info, 
  Cpu, 
  Bot, 
  CheckCircle2, 
  Navigation 
} from 'lucide-react';

export default function CampusMap({ selectedRoomCode = '', onAskAboutRoom }) {
  const [classrooms, setClassrooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState(selectedRoomCode);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeBuildingId, setActiveBuildingId] = useState('block-a');

  useEffect(() => {
    fetch('/api/classrooms')
      .then(res => res.json())
      .then(data => {
        setClassrooms(data);
        if (selectedRoomCode) {
          const match = data.find(c => c.code.toLowerCase() === selectedRoomCode.toLowerCase());
          if (match) {
            setSelectedRoom(match);
            if (match.code.startsWith('CS')) setActiveBuildingId('block-a');
            else if (match.code.startsWith('ENG')) setActiveBuildingId('block-b');
            else if (match.code.startsWith('AUD')) setActiveBuildingId('quad');
            else if (match.code.startsWith('SCI')) setActiveBuildingId('block-d');
          }
        } else if (data.length > 0) {
          setSelectedRoom(data[0]);
        }
      })
      .catch(err => console.error('Error fetching classrooms:', err));
  }, [selectedRoomCode]);

  const buildings = [
    {
      id: 'block-a',
      name: 'Block A - Alan Turing CS Hall',
      subtitle: 'Computer Science & AI Labs',
      x: 120, y: 80, width: 220, height: 160,
      color: 'from-blue-600 to-indigo-600',
      rooms: ['CS-101', 'CS-LAB3']
    },
    {
      id: 'block-b',
      name: 'Block B - Nikola Tesla ECE Block',
      subtitle: 'Electrical & Microelectronics',
      x: 390, y: 80, width: 220, height: 160,
      color: 'from-purple-600 to-indigo-600',
      rooms: ['ENG-202']
    },
    {
      id: 'block-c',
      name: 'Block C - Wright Brothers Hall',
      subtitle: 'Mechanical & Aerospace Engineering',
      x: 660, y: 80, width: 200, height: 160,
      color: 'from-amber-600 to-orange-600',
      rooms: ['ME-105']
    },
    {
      id: 'quad',
      name: 'Central Activity Center & Fountain',
      subtitle: 'Grand Auditorium (AUD-MAIN) & Food Court',
      x: 340, y: 290, width: 320, height: 160,
      color: 'from-emerald-600 to-teal-600',
      rooms: ['AUD-MAIN']
    },
    {
      id: 'block-d',
      name: 'Block D - Rosalind Franklin Science Hall',
      subtitle: 'Biotechnology & Physics Labs',
      x: 120, y: 490, width: 220, height: 150,
      color: 'from-cyan-600 to-blue-600',
      rooms: ['SCI-301']
    },
    {
      id: 'sports',
      name: 'Sports Complex & Gym Arena',
      subtitle: 'Olympic Pool & Athletics Ground',
      x: 600, y: 490, width: 260, height: 150,
      color: 'from-rose-600 to-pink-600',
      rooms: ['GYM-1']
    }
  ];

  const filteredClassrooms = classrooms.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    if (room.code.startsWith('CS')) setActiveBuildingId('block-a');
    else if (room.code.startsWith('ENG')) setActiveBuildingId('block-b');
    else if (room.code.startsWith('AUD')) setActiveBuildingId('quad');
    else if (room.code.startsWith('SCI')) setActiveBuildingId('block-d');
    else if (room.code.startsWith('ME')) setActiveBuildingId('block-c');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Search */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-500" />
            Interactive Campus Visual Navigator
          </h2>
          <p className="text-sm text-slate-400">
            Search for classrooms, labs, or buildings to view interactive maps and turn-by-turn directions.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search room code (e.g. CS-101, ENG-202)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Map Render (SVG) */}
        <div className="lg:col-span-2 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Campus Interactive Diagram (Apex Main Quad)</span>
            </div>
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
              Click building block to inspect
            </span>
          </div>

          <div className="relative w-full overflow-x-auto">
            <svg viewBox="0 0 980 680" className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800">
              
              {/* Campus Roads & Pathways */}
              <rect x="0" y="0" width="980" height="680" fill="#090d16" />
              <path d="M 0 260 L 980 260 M 0 470 L 980 470 M 350 0 L 350 680 M 620 0 L 620 680" stroke="#1e293b" strokeWidth="36" strokeLinecap="round" />
              
              {/* Central Fountain Circle */}
              <circle cx="500" cy="370" r="45" fill="#1e3a8a" opacity="0.4" stroke="#3b82f6" strokeWidth="3" />
              <circle cx="500" cy="370" r="20" fill="#60a5fa" opacity="0.6" />
              <text x="500" y="375" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">FOUNTAIN</text>

              {/* Building Blocks */}
              {buildings.map((b) => {
                const isActive = activeBuildingId === b.id;
                return (
                  <g 
                    key={b.id} 
                    onClick={() => setActiveBuildingId(b.id)}
                    className="cursor-pointer transition-transform hover:scale-[1.01]"
                  >
                    <rect
                      x={b.x}
                      y={b.y}
                      width={b.width}
                      height={b.height}
                      rx="16"
                      fill={isActive ? '#1e40af' : '#1e293b'}
                      stroke={isActive ? '#3b82f6' : '#334155'}
                      strokeWidth={isActive ? '4' : '2'}
                    />
                    <text x={b.x + 16} y={b.y + 35} fill="#f8fafc" fontSize="14" fontWeight="bold">
                      {b.name.split('-')[0]}
                    </text>
                    <text x={b.x + 16} y={b.y + 58} fill="#94a3b8" fontSize="11">
                      {b.subtitle}
                    </text>

                    {/* Room Badges */}
                    <g transform={`translate(${b.x + 16}, ${b.y + 85})`}>
                      {b.rooms.map((rCode, idx) => (
                        <rect
                          key={idx}
                          x={idx * 75}
                          y="0"
                          width="68"
                          height="24"
                          rx="6"
                          fill={selectedRoom?.code === rCode ? '#2563eb' : '#0f172a'}
                          stroke="#3b82f6"
                          strokeWidth="1"
                        />
                      ))}
                      {b.rooms.map((rCode, idx) => (
                        <text
                          key={`t-${idx}`}
                          x={idx * 75 + 34}
                          y="16"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {rCode}
                        </text>
                      ))}
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Room Details Drawer */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Info className="w-5 h-5 text-blue-400" />
            Classroom & Room Details
          </h3>

          {selectedRoom ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-blue-500 text-white">
                    {selectedRoom.code}
                  </span>
                  <span className="text-xs text-slate-400">Capacity: {selectedRoom.capacity} Seats</span>
                </div>
                <h4 className="text-lg font-bold text-white mt-2">{selectedRoom.name}</h4>
                <p className="text-xs text-blue-300 mt-1">{selectedRoom.building} • {selectedRoom.floor}</p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" /> Room Equipment & Tech:
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoom.equipment.map((eq, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {eq}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-amber-400" /> Turn-by-Turn Directions:
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{selectedRoom.directions}"
                </p>
              </div>

              {onAskAboutRoom && (
                <button
                  onClick={() => onAskAboutRoom(`Where is ${selectedRoom.code} and what classes are held here?`)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask AI Assistant About This Room</span>
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Select a classroom from the map or list to view full location specs.</p>
          )}

          {/* Filtered Classroom List */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">All Classrooms ({filteredClassrooms.length})</h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredClassrooms.map((cls) => (
                <div
                  key={cls.code}
                  onClick={() => handleSelectRoom(cls)}
                  className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between text-xs ${
                    selectedRoom?.code === cls.code
                      ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-bold text-blue-400 mr-2">{cls.code}</span>
                    <span>{cls.name}</span>
                  </div>
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
