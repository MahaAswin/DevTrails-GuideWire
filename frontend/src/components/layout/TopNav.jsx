import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Moon, Sun, Shield, User, LogOut, Settings, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const TopNav = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem('shieldgig_user');
    if (userStr) setUser(JSON.parse(userStr));

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('shieldgig_user');
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const notifications = [];

  return (
    <header className="h-16 px-6 sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Shield className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-400 uppercase">
          ShieldGig
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search workers, claims..."
            className="pl-10 pr-4 py-2 w-72 rounded-full bg-slate-100 dark:bg-[#111827] border-transparent focus:bg-white dark:focus:bg-[#0B0F19] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm outline-none dark:text-white"
          />
        </div>

        <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-700 pl-6 h-full relative">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>
            
            {showNotif && (
              <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold">Notifications</h3>
                  <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors flex gap-3 ${n.unread ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                      <div className="mt-1">
                        {n.title.includes('Claim') ? <CheckCircle2 className="text-emerald-500 w-5 h-5"/> : <Bell className="text-indigo-500 w-5 h-5"/>}
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start mb-1">
                           <h4 className={`text-sm font-semibold ${n.unread ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-200'}`}>{n.title}</h4>
                           <span className="text-xs text-slate-400">{n.time}</span>
                         </div>
                         <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-slate-100 dark:border-slate-700">
                  <button className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">View All Activity</button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="ml-2 w-10 h-10 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111827] flex items-center justify-center text-white font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all text-sm"
            >
              {getInitials(user?.name)}
            </button>
            
            {showProfile && (
              <div className="absolute top-14 right-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50">
                   <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                     {getInitials(user?.name)}
                   </div>
                   <div className="overflow-hidden">
                     <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Guest User'}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'Not logged in'}</p>
                     {user?.role && (
                       <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full">
                         {user.role} {user.platform && user.platform !== 'ShieldGig' ? `• ${user.platform}` : ''}
                       </span>
                     )}
                   </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    <User size={16} /> My Account
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    <Settings size={16} /> Preferences
                  </button>
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
