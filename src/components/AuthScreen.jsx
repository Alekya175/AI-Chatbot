import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  Sun,
  Moon
} from 'lucide-react';

const ADMIN_EMAIL = 'admin@aditya.ac.in';
const ADMIN_PASSWORD = 'Aditya@2026';
const DEMO_STUDENTS = [
  { name: 'Aarav Reddy', email: 'aarav.reddy@aditya.ac.in', password: 'Aarav@2026', roll: '24CSE001', program: 'B.Tech CSE', year: '2nd Year', semester: 'IV', cgpa: '8.72', attendance: '91%', advisor: 'Dr. Makineedi Raja Babu' },
  { name: 'Ananya Sharma', email: 'ananya.sharma@aditya.ac.in', password: 'Ananya@2026', roll: '24ECE014', program: 'B.Tech ECE', year: '2nd Year', semester: 'IV', cgpa: '8.45', attendance: '88%', advisor: 'Dr. Narla Venkata Lalitha' },
  { name: 'Vikram Kumar', email: 'vikram.kumar@aditya.ac.in', password: 'Vikram@2026', roll: '23EEE022', program: 'B.Tech EEE', year: '3rd Year', semester: 'VI', cgpa: '7.96', attendance: '84%', advisor: 'Dr. Veeranki Srinivasa Rao' },
  { name: 'Priya Nair', email: 'priya.nair@aditya.ac.in', password: 'Priya@2026', roll: '24AIML031', program: 'B.Tech AI & ML', year: '2nd Year', semester: 'IV', cgpa: '9.12', attendance: '95%', advisor: 'Dr. Kovvuri N Bhargavi' },
  { name: 'Rahul Verma', email: 'rahul.verma@aditya.ac.in', password: 'Rahul@2026', roll: '23MECH045', program: 'B.Tech Mechanical', year: '3rd Year', semester: 'VI', cgpa: '7.68', attendance: '82%', advisor: 'Dr. Saragada D V V S Bhimeshwar Reddy' },
  { name: 'Sneha Das', email: 'sneha.das@aditya.ac.in', password: 'Sneha@2026', roll: '24CIV056', program: 'B.Tech Civil', year: '2nd Year', semester: 'IV', cgpa: '8.21', attendance: '89%', advisor: 'Dr. Bellum Ramamohan Reddy' },
  { name: 'Karthik Rao', email: 'karthik.rao@aditya.ac.in', password: 'Karthik@2026', roll: '23MBA067', program: 'MBA', year: '1st Year', semester: 'II', cgpa: '8.34', attendance: '93%', advisor: 'Dr. Selvamalar N' },
  { name: 'Meera Joseph', email: 'meera.joseph@aditya.ac.in', password: 'Meera@2026', roll: '24BPH078', program: 'B.Pharm', year: '2nd Year', semester: 'IV', cgpa: '8.67', attendance: '90%', advisor: 'Dr. Girajala Chinna Ram' },
  { name: 'Aditya Singh', email: 'aditya.singh@aditya.ac.in', password: 'AdityaStudent@2026', roll: '23AGR089', program: 'B.Tech Agricultural Engineering', year: '3rd Year', semester: 'VI', cgpa: '7.88', attendance: '86%', advisor: 'Dr. Bodasingi Krishna Kanth' },
  { name: 'Nisha Patel', email: 'nisha.patel@aditya.ac.in', password: 'Nisha@2026', roll: '24DSC091', program: 'B.Tech Data Science', year: '2nd Year', semester: 'IV', cgpa: '8.94', attendance: '92%', advisor: 'Dr. Kovvuri N Bhargavi' }
];

export default function AuthScreen({ onLoginSuccess, theme, onToggleTheme }) {
  const [mode, setMode] = useState('student-login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStudentLogin = () => {
    if (!email || !password) {
      setErrorMsg('Please enter your student email and password.');
      return;
    }

    const student = DEMO_STUDENTS.find(account => account.email === email.trim().toLowerCase() && account.password === password);
    if (!student) {
      setErrorMsg('Use one of the demo student accounts listed below.');
      return;
    }

    onLoginSuccess({
      ...student,
      role: 'student',
      token: `student-token-${Date.now()}`
    });
  };

  const handleStudentRegister = () => {
    if (!name || !email || !password) {
      setErrorMsg('Please fill in your name, email, and password.');
      return;
    }

    onLoginSuccess({
      name,
      email: email.trim(),
      role: 'student',
      token: `student-register-${Date.now()}`
    });
  };

  const handleAdminLogin = () => {
    if (!email || !password) {
      setErrorMsg('Please enter the admin email and password.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setErrorMsg('Only the verified admin account can access this portal.');
      return;
    }

    onLoginSuccess({
      name: 'Aditya Admin',
      email: ADMIN_EMAIL,
      role: 'admin',
      token: `admin-token-${Date.now()}`
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'student-login') {
      handleStudentLogin();
      return;
    }

    if (mode === 'student-register') {
      handleStudentRegister();
      return;
    }

    if (mode === 'admin-login') {
      handleAdminLogin();
      return;
    }

    handleGuestLogin();
  };

  const handleGuestLogin = () => {
    const guestData = {
      name: 'Guest Visitor',
      email: 'guest@aditya.ac.in',
      role: 'guest',
      token: `guest-token-${Date.now()}`
    };
    onLoginSuccess(guestData);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-blue-50 via-white to-slate-100 text-slate-900'} flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300`}>
      <div
        className="robot-watermark absolute inset-0 pointer-events-none opacity-[0.10] bg-center bg-no-repeat bg-contain mix-blend-multiply"
        style={{ backgroundImage: "url('/robot_bg.png')" }}
        aria-hidden="true"
      />
      
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${isDark ? 'bg-orange-600/10' : 'bg-orange-500/15'} rounded-full blur-3xl pointer-events-none`}></div>
      <div className={`absolute bottom-1/4 left-1/3 w-80 h-80 ${isDark ? 'bg-blue-600/10' : 'bg-blue-600/15'} rounded-full blur-3xl pointer-events-none`}></div>

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={onToggleTheme}
          className={`p-3 rounded-2xl flex items-center space-x-2 border transition ${
            isDark 
              ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
              : 'bg-white border-blue-200 text-blue-900 hover:bg-blue-50 shadow-md'
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-blue-800" />}
          <span className="text-xs font-bold capitalize">{theme} Mode</span>
        </button>
      </div>

      <div className={`max-w-md w-full ${isDark ? 'bg-slate-900/90 border-slate-800 shadow-2xl' : 'bg-white border-blue-100 shadow-xl shadow-blue-900/10'} border rounded-3xl p-8 relative z-10 space-y-6 transition-all`}>
        
        <div className="text-center space-y-2">
          <img src="/aditya-logo.png" alt="Aditya University" className="mx-auto h-16 w-auto object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-blue-950'} tracking-wide`}>
            Aditya University
          </h1>
          <p className="text-sm font-semibold text-orange-500 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" /> Aditya Chatbot Portal
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        <div className={`grid grid-cols-2 gap-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-200'} p-1.5 rounded-2xl border`}>
          <button
            type="button"
            onClick={() => { setMode('student-login'); setErrorMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition ${
              mode === 'student-login'
                ? 'bg-orange-500 text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-blue-900'
            }`}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('student-register'); setErrorMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition ${
              mode === 'student-register'
                ? 'bg-orange-500 text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-blue-900'
            }`}
          >
            Student Register
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin-login'); setErrorMsg(''); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition ${
              mode === 'admin-login'
                ? 'bg-orange-500 text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-blue-900'
            }`}
          >
            Admin Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('guest-login'); setErrorMsg(''); handleGuestLogin(); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition ${
              mode === 'guest-login'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-blue-900'
            }`}
          >
            Guest Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'student-register' && (
            <div>
              <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Student Full Name *</label>
              <div className="relative">
                <span className="w-4 h-4 absolute left-3.5 top-3 text-slate-400">👤</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-blue-200 text-slate-900'} border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
              {mode === 'student-register' ? 'Student Email / Roll No *' : 'Aditya Email / Roll No'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder={mode === 'admin-login' ? 'admin@aditya.ac.in' : 'student@aditya.ac.in'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-blue-200 text-slate-900'} border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-blue-200 text-slate-900'} border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition`}
              />
            </div>
          </div>

          {mode === 'admin-login' ? (
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold text-center">
              🔒 Restricted admin access only.
            </div>
          ) : mode === 'student-register' ? (
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold text-center">
              🎓 Student registration is available for student accounts.
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition mt-2"
          >
            <span>{mode === 'student-register' ? 'Create Student Account' : mode === 'admin-login' ? 'Sign In to Admin Portal' : mode === 'guest-login' ? 'Continue as Guest' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
