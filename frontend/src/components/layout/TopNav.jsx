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
  const [menuView, setMenuView] = useState('main'); // 'main', 'account', 'prefs'
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [syncing, setSyncing] = useState(false);
  
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

  const fetchUserProfile = async (userId) => {
    if (!userId || syncing) return;
    setSyncing(true);
    try {
      const res = await fetch(`http://localhost:8000/user/profile/${userId}`);
      if (res.ok) {
        const freshUser = await res.json();
        setUser(freshUser);
        localStorage.setItem('shieldgig_user', JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error("Profile sync failed", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdatePhone = async () => {
    try {
      const res = await fetch('http://localhost:8000/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id || user._id, phone: tempPhone })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('shieldgig_user', JSON.stringify(updatedUser));
        setIsEditingPhone(false);
      }
    } catch (err) {
      console.error("Failed to update phone", err);
    }
  };

  const handleToggleReminder = async () => {
    try {
      const newStatus = !user.reminderEnabled;
      const res = await fetch('http://localhost:8000/user/reminder-toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id || user._id, enabled: newStatus })
      });
      if (res.ok) {
        const updatedUser = { ...user, reminderEnabled: newStatus };
        setUser(updatedUser);
        localStorage.setItem('shieldgig_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Failed to toggle", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const notifications = [];

  return (
    <header className="h-16 px-6 sticky top-0 z-50 flex items-center justify-between border-b border-[#1F2937] bg-[#0B0F19]/95 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#FF6B00] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 text-white font-black italic">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-slate-50 uppercase">
          ShieldGig
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search workers, claims..."
            className="pl-10 pr-4 py-2 w-72 rounded-full bg-[#111827] border border-[#1F2937] focus:bg-[#020617] focus:border-[#FF6B00] transition-all text-sm outline-none text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-4 border-l border-[#1F2937] pl-6 h-full relative">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[#111827] text-slate-300 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="relative" ref={notifRef}>
              <button
              onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className="relative p-2 rounded-full hover:bg-[#111827] text-slate-400 transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
            </button>
            
            {showNotif && (
              <div className="absolute top-12 right-0 w-80 bg-[#0F172A] border border-[#1F2937] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="p-4 border-b border-[#1F2937] flex justify-between items-center">
                  <h3 className="font-bold text-slate-50">Notifications</h3>
                  <button className="text-xs text-slate-400 font-medium hover:text-slate-200">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-10 text-center text-slate-500 text-sm">No new notifications</p>
                  ) : (
                    notifications.map(n => <div key={n.id} className="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">...</div>)
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => { 
                const newState = !showProfile;
                setShowProfile(newState); 
                setMenuView('main'); 
                setShowNotif(false); 
                setIsEditingPhone(false);
                if (newState && user) fetchUserProfile(user.id || user._id);
              }}
              className="ml-2 w-10 h-10 rounded-full bg-[#FF6B00] border-2 border-[#0B0F19] flex items-center justify-center text-white font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all text-sm"
            >
              {getInitials(user?.name)}
            </button>
            
            {showProfile && (
              <div className="absolute top-14 right-0 w-72 bg-[#0F172A] border border-[#1F2937] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                
                {menuView === 'main' && (
                  <>
                    <div className="p-5 border-b border-[#1F2937] flex items-center gap-3 bg-[#111827]">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                         {getInitials(user?.name)}
                       </div>
                       <div className="overflow-hidden">
                         <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{user?.name || 'Guest User'}</p>
                         <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate uppercase font-black">{user?.role || 'User'} Node</p>
                       </div>
                    </div>
                    <div className="p-2 text-sm">
                      <button onClick={() => setMenuView('account')} className="w-full flex items-center justify-between px-4 py-2.5 font-medium text-slate-200 hover:bg-[#111827] rounded-xl transition-colors">
                        <div className="flex items-center gap-3"><User size={16} /> My Account</div>
                        <CheckCircle2 size={14} className="text-[#FF6B00]" />
                      </button>
                      <button onClick={() => setMenuView('prefs')} className="w-full flex items-center justify-between px-4 py-2.5 font-medium text-slate-200 hover:bg-[#111827] rounded-xl transition-colors">
                        <div className="flex items-center gap-3"><Settings size={16} /> Preferences</div>
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                      </button>
                    </div>
                    <div className="p-2 border-t border-[#1F2937]">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-[#111827] rounded-xl transition-colors">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </>
                )}

                {menuView === 'account' && (
                  <div className="p-5 space-y-4">
                    <button onClick={() => setMenuView('main')} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-200">← Back to Menu</button>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Phone Number</p>
                          {!isEditingPhone && (
                            <button 
                              onClick={() => { setTempPhone(user?.phone || ''); setIsEditingPhone(true); }}
                              className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-200"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        {isEditingPhone ? (
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={tempPhone} 
                              onChange={(e) => setTempPhone(e.target.value)}
                              className="flex-1 bg-[#0B0F19] border border-[#1F2937] rounded-lg px-2 py-1 text-xs font-bold text-slate-100 outline-none focus:ring-1 focus:ring-[#FF6B00]"
                              autoFocus
                            />
                            <button onClick={handleUpdatePhone} className="bg-[#FF6B00] text-white p-1 rounded-lg"><CheckCircle2 size={14} /></button>
                            <button onClick={() => setIsEditingPhone(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 p-1 rounded-lg text-[10px] font-bold px-2">X</button>
                          </div>
                        ) : (
                          <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{user?.phone || 'Not Linked'}</p>
                        )}
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Referral Code</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-[#111827] px-2 py-1 rounded font-black text-[#FF6B00]">{user?.referral_code || 'GENERATING...'}</code>
                        </div>
                      </div>
                      <div className="p-3 bg-[#111827] rounded-xl border border-[#1F2937]">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Rewards Balance</p>
                        <p className="text-xl font-black text-[#FF6B00]">{user?.referral_points || 0} pts</p>
                      </div>
                    </div>
                  </div>
                )}

                {menuView === 'prefs' && (
                  <div className="p-5 space-y-4">
                    <button onClick={() => setMenuView('main')} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-200">← Back to Menu</button>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Policy Reminders</p>
                            <p className="text-[9px] text-slate-500 font-medium">Notify 3 days before expiry</p>
                         </div>
                         <button
                           onClick={handleToggleReminder}
                           className={`w-10 h-5 rounded-full relative transition-all ${user?.reminderEnabled ? 'bg-[#ff6b00]' : 'bg-slate-400'}`}
                         >
                           <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${user?.reminderEnabled ? 'left-5.5' : 'left-0.5'}`}></div>
                         </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
