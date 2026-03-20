import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Wallet, Receipt, ShieldAlert, Activity, Truck, Sparkles, Clock, Zap, Star, Bell, ChevronRight, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ─── Swiggy Theme ────────────────────────────────────────────
// Primary: #FC8019 (Swiggy Orange)
// Secondary/Accent: #FFECD2 (cream), #FF6B35
// Dark BG: #111827 (Dark Gray)
// Card dark: #1F2937 (Gray-800)
// ─────────────────────────────────────────────────────────────

const Badge = ({ status }) => {
  const map = {
    active:   'bg-emerald-400/20 text-emerald-400 border-emerald-400/40',
    approved: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40',
    pending:  'bg-yellow-400/20  text-yellow-400  border-yellow-400/40',
    rejected: 'bg-red-400/20     text-red-400     border-red-400/40',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${map[status?.toLowerCase()] || map.pending}`}>
      {status}
    </span>
  );
};

// Animated stat card with framer-motion
const AnimatedCard = ({ icon: Icon, label, value, sub, index }) => {
  const delay = index * 80;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="relative overflow-hidden rounded-[1.75rem] p-5 border group cursor-default
        bg-white dark:bg-[#1F2937] border-orange-100 dark:border-orange-900/30
        hover:border-[#FC8019]/50 hover:shadow-xl hover:shadow-[#FC8019]/15
        transition-all duration-300"
    >
      {/* Inner warm glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.75rem]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#FC801918' }}>
            <Icon size={20} style={{ color: '#FC8019' }} />
          </div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: '#FC801918' }}>
            <ChevronRight size={12} style={{ color: '#FC8019' }} />
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-orange-300/40 mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-orange-50 tracking-tight leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-orange-300/40 mt-1.5 font-medium">{sub}</p>}
      </div>
    </motion.div>
  );
};

const ActionPill = ({ icon: Icon, label, color = '#FC8019', onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-sm border
      bg-white dark:bg-[#1F2937] border-orange-100 dark:border-orange-900/30
      hover:border-[#FC8019]/50 hover:shadow-lg hover:shadow-[#FC8019]/15
      transition-all duration-200 group whitespace-nowrap"
  >
    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
      <Icon size={14} style={{ color }} />
    </div>
    <span className="text-slate-700 dark:text-orange-100/80 group-hover:text-slate-900 dark:group-hover:text-white text-xs font-bold">{label}</span>
  </button>
);

const SwiggyDashboard = ({ user, policies = [], myClaims = [], loading, onActivate, activating, onToggleReminder }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const stats = [
    { icon: Wallet,      label: 'Wallet',       value: `₹${(user.wallet_balance || 0).toLocaleString()}`, sub: 'Your balance' },
    { icon: ShieldCheck, label: 'Coverage',      value: user.activePolicy || 'None',    sub: 'Active shield' },
    { icon: Receipt,     label: 'Paid',          value: `₹${(user.totalPaid || 0).toLocaleString()}`,     sub: 'All time' },
    { icon: ShieldAlert, label: 'Claims',        value: String(myClaims.length),        sub: 'Open cases' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F2] dark:bg-[#111827] transition-colors duration-300">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-[2rem] mb-8 p-8"
        style={{ background: 'linear-gradient(135deg, #FC8019 0%, #FF6B35 60%, #FFAC6B 100%)' }}>

        {/* Blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: '#FF6B35', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: '#FFAC6B', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Truck size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Swiggy Partner</p>
                <p className="text-white font-black text-lg leading-tight">{user.name}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={onToggleReminder}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold border backdrop-blur-sm transition-all
                  ${user.reminderEnabled ? 'bg-white/25 border-white/40 text-white' : 'bg-white/10 border-white/20 text-white/60'}`}>
                <Bell size={12} />{user.reminderEnabled ? 'Alerts On' : 'Alerts Off'}
              </button>
              <button onClick={toggleTheme}
                className="w-9 h-9 rounded-full bg-white/25 hover:bg-white/35 border border-white/30 flex items-center justify-center text-sm transition-all">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Welcome line */}
          <div className="mb-5">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Ready to roll, {user.name?.split(' ')[0]}? 🛵
            </h1>
            <p className="text-white/70 text-sm mt-1 font-medium">{user.city} • Stay protected every delivery</p>
          </div>

          {/* Points + Code pill */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/25">
              <Star size={15} className="text-yellow-200" />
              <span className="text-white font-black text-sm">{user.referral_points || 0}</span>
              <span className="text-white/60 text-xs font-bold">points</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/25">
              <Sparkles size={13} className="text-yellow-200" />
              <span className="text-white/60 text-xs font-bold">Your Code:</span>
              <span className="text-white font-black font-mono text-xs">{user.referral_code || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => <AnimatedCard key={i} {...s} index={i} />)}
      </div>

      {/* ── Quick Action Pills ── */}
      <div className="bg-white dark:bg-[#1F2937] rounded-[1.75rem] border border-orange-100 dark:border-orange-900/30 p-5 mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-orange-300/40 mb-4">Quick Access</p>
        <div className="flex flex-wrap gap-3">
          <ActionPill icon={ShieldCheck} label="My Coverage" />
          <ActionPill icon={Zap}        label="Instant Claim" />
          <ActionPill icon={Wallet}     label="Top Up Wallet" />
          <ActionPill icon={Activity}   label="Risk Score" />
          <ActionPill icon={Star}       label="Refer & Earn" />
        </div>
      </div>

      {/* ── Recent Claims ── */}
      {myClaims.length > 0 && (
        <div className="bg-white dark:bg-[#1F2937] rounded-[1.75rem] border border-orange-100 dark:border-orange-900/30 p-5 mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-orange-300/40">Recent Claims</p>
            <span className="text-[10px] font-bold uppercase text-[#FC8019] tracking-widest cursor-pointer">View All →</span>
          </div>
          <div className="space-y-2">
            {myClaims.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FC8019]/15 flex items-center justify-center">
                    <ShieldAlert size={14} style={{ color: '#FC8019' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-orange-50 capitalize">{c.report_type}</p>
                    <p className="text-[10px] text-slate-400 dark:text-orange-300/40 flex items-center gap-1">
                      <Clock size={10} /> {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Available Policies ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-orange-50 tracking-tight">Plans for You</h3>
          <div className="flex-1 h-px bg-orange-100 dark:bg-orange-900/30" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-52 rounded-[1.75rem] bg-orange-50 dark:bg-[#1F2937] animate-pulse" />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-16 rounded-[1.75rem] border-2 border-dashed border-orange-200 dark:border-orange-900/30 text-slate-400 dark:text-orange-300/30">
            <Truck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold">No plans available for Swiggy workers right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {policies.map((p, idx) => (
              <div key={idx}
                className="relative overflow-hidden rounded-[1.75rem] border transition-all duration-300 group
                  bg-white dark:bg-[#1F2937] border-orange-100 dark:border-orange-900/30
                  hover:border-[#FC8019]/50 hover:shadow-xl hover:shadow-[#FC8019]/15 hover:-translate-y-1.5">

                {/* Gradient top bar */}
                <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#FC8019,#FF6B35,#FFAC6B)' }} />

                {/* Warm inner glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 group-hover:from-orange-50/40 dark:group-hover:from-orange-900/10 to-transparent transition-all duration-500 pointer-events-none rounded-[1.75rem]" />

                <div className="relative z-10 p-6">
                  <h4 className="font-black text-base text-slate-900 dark:text-orange-50 mb-1 leading-tight">{p.title || p.name}</h4>
                  <p className="text-xs text-slate-400 dark:text-orange-300/50 mb-5 line-clamp-2">{p.description || p.trigger_condition}</p>

                  <div className="flex gap-3 mb-5">
                    <div className="flex-1 bg-orange-50 dark:bg-orange-900/15 rounded-2xl p-3 border border-orange-100 dark:border-orange-900/30">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-orange-300/40 mb-1">Premium</p>
                      <p className="text-lg font-black text-slate-900 dark:text-orange-50">₹{p.weekly_premium || p.premium}<span className="text-xs font-normal text-slate-400">/wk</span></p>
                    </div>
                    <div className="flex-1 bg-orange-50 dark:bg-orange-900/15 rounded-2xl p-3 border border-orange-100 dark:border-orange-900/30">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-orange-300/40 mb-1">Coverage</p>
                      <p className="text-lg font-black" style={{ color: '#FC8019' }}>₹{(p.max_coverage || p.coverage || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button onClick={() => setSelectedPolicy(p)}
                      className="flex-1 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest
                        border border-orange-200 dark:border-orange-900/40 text-slate-500 dark:text-orange-300/60
                        hover:border-[#FC8019]/50 hover:text-[#FC8019] transition-all">
                      Details
                    </button>
                    <button
                      onClick={() => onActivate(p.id || p.name)}
                      disabled={activating === (p.id || p.name)}
                      className="flex-1 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50 transition-all hover:opacity-90 shadow-lg shadow-[#FC8019]/20"
                      style={{ background: 'linear-gradient(135deg,#FC8019,#FF6B35)' }}>
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] overflow-hidden bg-white dark:bg-[#1F2937] border border-orange-100 dark:border-orange-900/30 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="h-20 flex items-end px-6 pb-4 relative" style={{ background: 'linear-gradient(135deg,#FC8019,#FF6B35)' }}>
              <button onClick={() => setSelectedPolicy(null)} className="absolute top-3 right-4 w-8 h-8 rounded-full bg-white/25 text-white text-sm flex items-center justify-center hover:bg-white/35">✕</button>
              <h2 className="text-lg font-black text-white">{selectedPolicy.title || selectedPolicy.name}</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-orange-100/70 text-sm leading-relaxed">{selectedPolicy.description || selectedPolicy.trigger_condition}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 dark:bg-orange-900/15 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Weekly</p>
                  <p className="text-xl font-black text-slate-900 dark:text-orange-50">₹{selectedPolicy.weekly_premium || selectedPolicy.premium}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/15 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Coverage</p>
                  <p className="text-xl font-black" style={{ color: '#FC8019' }}>₹{(selectedPolicy.max_coverage || 0).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => { onActivate(selectedPolicy.id || selectedPolicy.name); setSelectedPolicy(null); }}
                className="w-full py-3.5 rounded-2xl text-white font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-lg shadow-[#FC8019]/25"
                style={{ background: 'linear-gradient(135deg,#FC8019,#FF6B35)' }}>
                Activate Now 🛵
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Floating Chat Button ── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg shadow-[#FC8019]/40 z-50"
        style={{ background: 'linear-gradient(135deg,#FC8019,#FF6B35)' }}
      >
        <MessageCircle size={24} />
      </motion.button>
    </div>
  );
};

export default SwiggyDashboard;
