import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Wallet, Receipt, ShieldAlert, Activity, Bike, Star, ChevronRight, Bell, Zap, Clock, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ─── Zomato Theme ───────────────────────────────────────────
// Primary: #E23744 (Zomato Red)
// Dark BG: #0D0D0D
// Card dark: #1A1A1A
// ────────────────────────────────────────────────────────────

const Badge = ({ status }) => {
  const map = {
    active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    pending:  'bg-yellow-500/15  text-yellow-400  border-yellow-500/30',
    rejected: 'bg-red-500/15     text-red-400     border-red-500/30',
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${map[status?.toLowerCase()] || map.pending}`}>
      {status}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, accent = '#E23744', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay / 1000, duration: 0.5 }}
    whileHover={{ y: -5 }}
    className="relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 cursor-default group
      bg-white dark:bg-[#1A1A1A] border-slate-100 dark:border-white/5
      hover:border-[#E23744]/40 hover:shadow-xl hover:shadow-[#E23744]/10"
  >
    {/* Glow blob */}
    <div
      className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
      style={{ background: accent }}
    />
    <div className="flex items-start justify-between mb-5">
      <div className="p-2.5 rounded-2xl" style={{ background: `${accent}18` }}>
        <Icon size={22} style={{ color: accent }} />
      </div>
      <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-[#E23744] group-hover:translate-x-1 transition-all" />
    </div>
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1">{label}</p>
    <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 dark:border-white/5
      bg-white dark:bg-[#1A1A1A] hover:border-[#E23744]/40 hover:bg-[#E23744]/5
      transition-all duration-200 group"
  >
    <div className="p-3 rounded-xl bg-[#E23744]/10 group-hover:bg-[#E23744]/20 transition-colors">
      <Icon size={20} className="text-[#E23744]" />
    </div>
    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white whitespace-nowrap">{label}</span>
  </button>
);

const ZomatoDashboard = ({ user, policies = [], myClaims = [], loading, onActivate, activating, onToggleReminder }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const stats = [
    { icon: Wallet,      label: 'Wallet Balance', value: `₹${(user.wallet_balance || 0).toLocaleString()}`, sub: 'Available to spend' },
    { icon: ShieldCheck, label: 'Active Policy',  value: user.activePolicy || 'None Active', sub: 'Tap to manage' },
    { icon: Receipt,     label: 'Total Paid',     value: `₹${(user.totalPaid || 0).toLocaleString()}`, sub: 'All-time premiums' },
    { icon: ShieldAlert, label: 'Open Claims',    value: `${myClaims.length}`, sub: myClaims.length === 0 ? 'All clear' : 'Pending review' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0D0D0D] transition-colors duration-300">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-[2rem] mx-0 mb-8 p-8"
        style={{ background: 'linear-gradient(135deg, #E23744 0%, #B5212C 100%)' }}>
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
          style={{ background: 'white' }} />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10 translate-y-1/2 -translate-x-1/4"
          style={{ background: 'white' }} />

        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bike size={20} className="text-white" />
              </div>
              <span className="text-white/80 text-sm font-bold uppercase tracking-widest">Zomato Worker</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">
              Hey, {user.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-white/70 text-sm font-medium">{user.city} • {user.platform} Delivery Partner</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Reminder Toggle */}
            <button
              onClick={onToggleReminder}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all
                ${user.reminderEnabled
                  ? 'bg-white/20 border-white/30 text-white'
                  : 'bg-white/10 border-white/20 text-white/60'}`}
            >
              <Bell size={14} />
              {user.reminderEnabled ? 'Reminders On' : 'Reminders Off'}
            </button>
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-all"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Referral strip */}
        <div className="relative z-10 mt-6 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20 w-fit">
          <Star size={16} className="text-yellow-300" />
          <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Referral Points:</span>
          <span className="text-white font-black text-sm">{user.referral_points || 0} pts</span>
          <span className="text-white/40">•</span>
          <span className="text-white/60 text-xs font-mono">{user.referral_code}</span>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} delay={i * 60} />
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-100 dark:border-white/5 p-6 mb-8">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-5">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={ShieldCheck} label="View Policy"  onClick={() => {}} />
          <QuickAction icon={Zap}        label="File Claim"   onClick={() => {}} />
          <QuickAction icon={Wallet}     label="Add Money"    onClick={() => {}} />
          <QuickAction icon={Activity}   label="Risk Check"   onClick={() => {}} />
        </div>
      </div>

      {/* ── Claims Summary ── */}
      {myClaims.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-100 dark:border-white/5 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Recent Claims</h3>
            <span className="text-[10px] font-bold text-[#E23744] uppercase tracking-widest">View All →</span>
          </div>
          <div className="space-y-3">
            {myClaims.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E23744]/10 flex items-center justify-center">
                    <ShieldAlert size={14} className="text-[#E23744]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{c.report_type}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={10}/> {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Policies ── */}
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">
          Available Protections
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-[#1A1A1A] animate-pulse" />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400">
            <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold">No policies available for Zomato workers yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {policies.map((p, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-3xl border transition-all duration-300
                  bg-white dark:bg-[#1A1A1A] border-slate-100 dark:border-white/5
                  hover:border-[#E23744]/40 hover:shadow-xl hover:shadow-[#E23744]/10 hover:-translate-y-1"
              >
                {/* Color bar */}
                <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#E23744,#FF6B6B)' }} />
                <div className="p-6">
                  <h4 className="font-black text-lg text-slate-900 dark:text-white mb-1 leading-tight">{p.title || p.name}</h4>
                  <p className="text-xs text-slate-400 mb-5 line-clamp-2">{p.description || p.trigger_condition}</p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Premium</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">₹{p.weekly_premium || p.premium}<span className="text-xs font-normal text-slate-400">/wk</span></p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Coverage</p>
                      <p className="text-lg font-black text-[#E23744]">₹{(p.max_coverage || p.coverage || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedPolicy(p)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest
                        border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400
                        hover:border-[#E23744]/30 hover:text-[#E23744] transition-all"
                    >Details</button>
                    <button
                      onClick={() => onActivate(p.id || p.name)}
                      disabled={activating === (p.id || p.name)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all
                        hover:opacity-90 active:scale-95 shadow-lg shadow-[#E23744]/20 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#E23744,#B5212C)' }}
                    >
                      {activating === (p.id || p.name) ? '...' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Policy Modal ── */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] overflow-hidden bg-white dark:bg-[#1A1A1A] border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="h-24 flex items-end pb-5 px-6 relative" style={{ background: 'linear-gradient(135deg,#E23744,#B5212C)' }}>
              <button onClick={() => setSelectedPolicy(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm hover:bg-white/30">✕</button>
              <h2 className="text-xl font-black text-white">{selectedPolicy.title || selectedPolicy.name}</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{selectedPolicy.description || selectedPolicy.trigger_condition}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Weekly Premium</p>
                  <p className="text-xl font-black">₹{selectedPolicy.weekly_premium || selectedPolicy.premium}</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Max Coverage</p>
                  <p className="text-xl font-black text-[#E23744]">₹{(selectedPolicy.max_coverage || 0).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => { onActivate(selectedPolicy.id || selectedPolicy.name); setSelectedPolicy(null); }}
                className="w-full py-3.5 rounded-2xl text-white font-black uppercase tracking-widest text-sm transition-all hover:opacity-90 shadow-lg shadow-[#E23744]/30"
                style={{ background: 'linear-gradient(135deg,#E23744,#B5212C)' }}
              >Activate Coverage</button>
            </div>
          </div>
        </div>
      )}
      {/* ── Floating Chat Button ── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg shadow-[#E23744]/40 z-50"
        style={{ background: 'linear-gradient(135deg,#E23744,#B5212C)' }}
      >
        <MessageCircle size={24} />
      </motion.button>
    </div>
  );
};

export default ZomatoDashboard;
