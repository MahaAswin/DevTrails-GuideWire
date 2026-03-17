import React, { useState, useEffect } from 'react';
import { CloudRain, Car, Factory, ShieldBan, Zap, ShieldAlert } from 'lucide-react';

const ICONS = { CloudRain, Car, Factory, ShieldBan };

const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [activating, setActivating] = useState(null);
  const [user, setUser] = useState({ email: '', platform: '' });

  useEffect(() => {
    const userStr = localStorage.getItem('shieldgig_user');
    if (userStr) setUser(JSON.parse(userStr));

    fetch('http://localhost:8000/policies')
      .then(res => res.json())
      .then(data => {
        setPolicies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleActivate = async (policyId) => {
    setActivating(policyId);
    try {
      const res = await fetch('http://localhost:8000/workers/activate-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_email: user.email, policy_id: policyId })
      });
      if (res.ok) {
        alert("Policy activated successfully!");
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to activate policy");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    } finally {
      setActivating(null);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse font-medium">Loading parametric policies...</div>;

  return (
    <>
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Smart Contract<br/>Registry</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Activate parametric nodes to secure your gig operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {policies.map((p, idx) => {
          const IconComp = ICONS[p.icon] || Zap;
          return (
            <div key={idx} className="group bg-white dark:bg-[#111827] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col h-full relative overflow-hidden shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20`}>
                  <IconComp size={24} />
                </div>
                <h3 className="text-xl font-black italic tracking-tighter leading-tight dark:text-slate-100 uppercase">{p.title || p.name}</h3>
              </div>
              
              <div className="space-y-6 flex-1 relative z-10">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">"{p.description || "No description provided."}"</p>
                <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">Weekly Stake</p>
                    <p className="text-3xl font-black dark:text-white italic tracking-tighter leading-none">₹{p.weekly_premium || p.premium}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 italic">Protocol Cap</p>
                    <p className="text-xl font-black italic tracking-tighter leading-none text-emerald-500">₹{p.max_coverage || p.coverage}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mt-8 relative z-10">
                <button 
                  disabled={activating === (p.id || p.name)}
                  onClick={() => handleActivate(p.id || p.name)}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase italic tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                >
                  {activating === (p.id || p.name) ? '...' : 'Activate Node'}
                </button>
                <button 
                  onClick={() => setSelectedPolicy(p)}
                  className="w-full py-3 rounded-xl bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-black text-slate-500 font-black uppercase italic tracking-widest text-[10px] transition-all"
                >
                  Expand Audit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal Sync from common logic */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-100 dark:ring-slate-800">
            <div className={`h-32 bg-emerald-500 p-10 flex items-end relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                 <ShieldAlert size={120} className="text-white" />
              </div>
              <button onClick={() => setSelectedPolicy(null)} className="absolute top-8 right-8 text-white font-bold opacity-70 hover:opacity-100">✕</button>
              <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">{selectedPolicy.title || selectedPolicy.name}</h2>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
               <p className="text-slate-700 dark:text-slate-300">{selectedPolicy.description}</p>
                <div className="bg-slate-50 dark:bg-[#0B0F19] p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                   <h4 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Payout Trigger</h4>
                   <p className="text-xl font-black italic tracking-tighter text-emerald-500 uppercase">{selectedPolicy.trigger_condition || selectedPolicy.trigger}</p>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Protocol Benefits</h4>
                   <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-medium leading-relaxed italic border-l-4 border-emerald-500/20 pl-6">{selectedPolicy.detailed_benefits || "Full parametric coverage with instant payouts."}</p>
                </div>
            </div>
            <div className="p-10 pt-0">
               <button onClick={() => { handleActivate(selectedPolicy.id || selectedPolicy.name); setSelectedPolicy(null); }} className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase italic tracking-widest text-[10px] rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Initiate Protocol Activation</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PoliciesPage;
