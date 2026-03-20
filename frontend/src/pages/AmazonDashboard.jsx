import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Wallet, Receipt, ShieldAlert, Activity, Package, TrendingUp, Bell, ChevronRight, Clock, BarChart2, CheckCircle, AlertCircle, Circle, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ─── Amazon Delivery Theme ────────────────────────────────────
// Primary BG:   #232F3E (Amazon Navy)
// Accent:       #FF9900 (Amazon Yellow)
// Dark BG:      #232F3E (Navy)
// Card dark:    #1A232D
// ─────────────────────────────────────────────────────────────

const NAVY   = '#232F3E';
const YELLOW = '#FF9900';

const Badge = ({ status }) => {
  const config = {
    active:   { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400' },
    approved: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400' },
    pending:  { cls: 'bg-yellow-500/15  text-yellow-400  border-yellow-500/25',  dot: 'bg-yellow-400'  },
    rejected: { cls: 'bg-red-500/15     text-red-400     border-red-500/25',     dot: 'bg-red-400'     },
  };
  const c = config[status?.toLowerCase()] || config.pending;
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
};

// Compact data row for the analytics-style table
const DataRow = ({ label, value, accent }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0">
    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</span>
    <span className={`text-sm font-black ${accent || 'text-slate-900 dark:text-white'}`}>{value}</span>
  </div>
);

// Stat card – compact, Amazon grid style
const KpiCard = ({ icon: Icon, label, value, delta, yellow, index = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{ y: -4, scale: 1.01 }}
    className="bg-white dark:bg-[#1A232D] border border-slate-200 dark:border-white/5 rounded-2xl p-5
      hover:border-[#FF9900]/40 hover:shadow-lg hover:shadow-[#FF9900]/10 transition-colors duration-200 group cursor-default">
    <div className="flex items-start justify-between mb-3">
      <div className="p-2 rounded-xl" style={{ background: yellow ? `${YELLOW}18` : `${NAVY}12` }}>
        <Icon size={18} style={{ color: yellow ? YELLOW : NAVY }} className="dark:brightness-150" />
      </div>
      {delta && (
        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
          <TrendingUp size={10} /> {delta}
        </span>
      )}
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1">{label}</p>
    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
  </motion.div>
);

// Progress bar component
const ProgressBar = ({ label, value, max, color = YELLOW }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-slate-700 dark:text-slate-200">{value} / {max}</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

const AmazonDashboard = ({ user, policies = [], myClaims = [], loading, onActivate, activating, onToggleReminder }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState('policies');

  const kpis = [
    { icon: Wallet,      label: 'Wallet Balance',  value: `₹${(user.wallet_balance || 0).toLocaleString()}`,  yellow: true  },
    { icon: ShieldCheck, label: 'Active Shield',   value: user.activePolicy || 'None',                         yellow: false },
    { icon: ShieldAlert, label: 'Open Claims',     value: String(myClaims.length),                             yellow: false },
    { icon: Receipt,     label: 'Total Premiums',  value: `₹${(user.totalPaid || 0).toLocaleString()}`,        yellow: true  },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#232F3E] transition-colors duration-300">

      {/* ── Top Banner ── */}
      <div className="rounded-[1.5rem] mb-6 overflow-hidden" style={{ background: NAVY }}>
        <div className="relative p-6">
          {/* Yellow accent line */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: YELLOW }} />

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: YELLOW }}>
                <Package size={22} style={{ color: NAVY }} />
              </div>
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Amazon Delivery Partner</p>
                <h1 className="text-2xl font-black text-white tracking-tight">{user.name}</h1>
                <p className="text-white/50 text-xs mt-0.5">{user.city} • Partner ID: {user.referral_code || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onToggleReminder}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all
                  ${user.reminderEnabled ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400' : 'border-white/10 bg-white/5 text-white/40'}`}>
                <Bell size={12} />{user.reminderEnabled ? 'Notifications On' : 'Notifications Off'}
              </button>
              <button onClick={toggleTheme}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center text-sm transition-all">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Referral points bar */}
          <div className="mt-5 pt-5 border-t border-white/10">
            <ProgressBar label="Referral Points Progress (→ 1000 pts = ₹10)" value={user.referral_points || 0} max={1000} color={YELLOW} />
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => <KpiCard key={i} index={i} {...k} />)}
      </div>

      {/* ── Main Content: Tabs ── */}
      <div className="bg-white dark:bg-[#1A232D] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden mb-6">

        {/* Tab bar */}
        <div className="flex border-b border-slate-100 dark:border-white/5">
          {['policies', 'claims', 'account'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition-all relative
                ${activeTab === tab ? 'text-[#FF9900]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: YELLOW }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab: Policies */}
        {activeTab === 'policies' && (
          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />)}
              </div>
            ) : policies.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Package size={36} className="mx-auto mb-2 opacity-25" />
                <p className="font-bold text-sm">No Amazon policies available right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {policies.map((p, idx) => (
                  <div key={idx} className="flex items-start justify-between p-4 rounded-xl border transition-all
                    border-slate-100 dark:border-white/5 hover:border-[#FF9900]/30 hover:bg-yellow-50/30 dark:hover:bg-yellow-900/5 group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.title || p.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded text-[#FF9900] border border-yellow-400/30 bg-yellow-50 dark:bg-yellow-900/10 uppercase tracking-widest">
                          Eligible
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{p.description || p.trigger_condition}</p>
                      <div className="flex gap-4 mt-2 text-xs font-bold">
                        <span className="text-slate-500">₹{p.weekly_premium || p.premium}/wk</span>
                        <span className="text-slate-300 dark:text-white/10">|</span>
                        <span style={{ color: YELLOW }}>Up to ₹{(p.max_coverage || p.coverage || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => setSelectedPolicy(p)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-[#FF9900]/40 hover:text-[#FF9900] transition-all">
                        Details
                      </button>
                      <button onClick={() => onActivate(p.id || p.name)} disabled={activating === (p.id || p.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-all hover:opacity-90"
                        style={{ background: YELLOW, color: NAVY }}>
                        {activating === (p.id || p.name) ? '...' : 'Subscribe'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Claims */}
        {activeTab === 'claims' && (
          <div className="p-5">
            {myClaims.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle size={36} className="mx-auto mb-2 text-emerald-500 opacity-40" />
                <p className="font-bold text-sm text-slate-400">No claims on record. Stay safe!</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5">
                    <th className="text-left py-2.5">Type</th>
                    <th className="text-left py-2.5">Date</th>
                    <th className="text-left py-2.5">Status</th>
                    <th className="text-right py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myClaims.map((c, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                      <td className="py-3 font-bold text-slate-800 dark:text-white capitalize">{c.report_type}</td>
                      <td className="py-3 text-slate-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="py-3"><Badge status={c.status} /></td>
                      <td className="py-3 text-right">
                        <button className="text-[10px] font-bold text-[#FF9900] uppercase tracking-widest hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Account */}
        {activeTab === 'account' && (
          <div className="p-5">
            <DataRow label="Full Name"      value={user.name}                             />
            <DataRow label="Email"          value={user.email}                            />
            <DataRow label="City"           value={user.city}                             />
            <DataRow label="Platform"       value={user.platform}                         />
            <DataRow label="Referral Code"  value={user.referral_code || 'N/A'}  accent="text-[#FF9900]" />
            <DataRow label="Referral Points" value={`${user.referral_points || 0} pts`}   accent="text-[#FF9900]" />
            <DataRow label="Wallet Balance" value={`₹${(user.wallet_balance || 0).toLocaleString()}`} accent="text-emerald-400" />
          </div>
        )}
      </div>

      {/* ── Analytics Mini Strip ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1A232D] border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={16} style={{ color: YELLOW }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coverage Score</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">72<span className="text-lg text-slate-400">/100</span></p>
          <div className="mt-3 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full w-[72%]" style={{ background: YELLOW }} />
          </div>
        </div>
        <div className="bg-white dark:bg-[#1A232D] border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Claims Approved</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{myClaims.filter(c => c.status === 'approved').length}</p>
          <p className="text-xs text-slate-400 mt-1">of {myClaims.length} total submitted</p>
        </div>
        <div className="bg-white dark:bg-[#1A232D] border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Level</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white">Low</p>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-400 mt-1">{user.city} region — safe</p>
        </div>
      </div>

      {/* ── Policy Detail Modal ── */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-[#1A232D] border border-slate-200 dark:border-white/10 shadow-2xl">
            {/* Header bar */}
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-start justify-between" style={{ borderTopColor: YELLOW, borderTopWidth: 3 }}>
              <div>
                <h2 className="font-black text-slate-900 dark:text-white text-lg">{selectedPolicy.title || selectedPolicy.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Amazon Delivery Protection Plan</p>
              </div>
              <button onClick={() => setSelectedPolicy(null)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white flex items-center justify-center text-sm hover:bg-slate-200 dark:hover:bg-white/15 transition-colors">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{selectedPolicy.description || selectedPolicy.trigger_condition}</p>
              <div className="space-y-1">
                <DataRow label="Weekly Premium" value={`₹${selectedPolicy.weekly_premium || selectedPolicy.premium}`} />
                <DataRow label="Max Coverage" value={`₹${(selectedPolicy.max_coverage || 0).toLocaleString()}`} accent="text-[#FF9900]" />
                <DataRow label="Trigger" value={selectedPolicy.trigger_condition || 'N/A'} />
              </div>
              <button
                onClick={() => { onActivate(selectedPolicy.id || selectedPolicy.name); setSelectedPolicy(null); }}
                className="w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all"
                style={{ background: YELLOW, color: NAVY }}>
                Subscribe to This Plan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Floating Chat Button ── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-[#232F3E] flex items-center justify-center shadow-lg shadow-[#FF9900]/40 z-50"
        style={{ background: '#FF9900' }}
      >
        <MessageCircle size={24} />
      </motion.button>
    </div>
  );
};

export default AmazonDashboard;
