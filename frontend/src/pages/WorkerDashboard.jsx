import React, { useState, useEffect } from 'react';
import { ShieldCheck, Receipt, Wallet, Activity, ExternalLink, CloudRain, Car, Factory, ShieldAlert } from 'lucide-react';
import WeatherCard from '../components/WeatherCard';

const ICONS = { CloudRain, Car, Factory, ShieldAlert };

const WorkerDashboard = () => {
  const [user, setUser] = useState({ name: 'Worker', platform: 'Unknown', city: 'Unknown', email: '', wallet_balance: 0 });
  const [policies, setPolicies] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [activating, setActivating] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('shieldgig_user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
      
      // Fetch policies, balance, and my evidence-claims
      Promise.all([
        fetch(`http://localhost:8000/policies/${parsed.platform}`),
        fetch(`http://localhost:8000/wallet/balance/${parsed.email}`),
        fetch(`http://localhost:8000/claims-evidence/my-claims/${parsed.email}`)
      ])
        .then(async ([polRes, balRes, claimRes]) => {
          const polData = await polRes.json();
          const balData = await balRes.json();
          const claimData = await claimRes.json();
          setPolicies(polData);
          setMyClaims(claimData || []);
          setUser(prev => ({ ...prev, wallet_balance: balData.wallet_balance || 0 }));
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
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

  // Platform specific theme colors
  const platformColor = user.platform.toLowerCase() === 'zomato' ? 'rose' : 
                        user.platform.toLowerCase() === 'swiggy' ? 'amber' :
                        user.platform.toLowerCase() === 'zepto' ? 'emerald' :
                        user.platform.toLowerCase() === 'amazon' ? 'blue' : 'emerald';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter mb-2 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-400 uppercase">
            <span className={`w-8 h-8 rounded-full bg-${platformColor}-500 flex items-center justify-center text-white text-xs font-black shadow-md shadow-${platformColor}-500/20`}>
              {user.platform.charAt(0)}
            </span>
            {user.platform} Portal
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {user.name}. View available protections for your city ({user.city}).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-emerald-500/30 transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheck size={24} />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Active Policy</p>
          <p className="text-xl font-black italic tracking-tighter dark:text-white uppercase">None Active</p>
        </div>

        <div className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-emerald-500/30 transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Receipt size={24} />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Total Paid</p>
          <p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">₹0</p>
        </div>

        <div className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-emerald-500/30 transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Wallet size={24} />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Wallet Balance</p>
          <p className="text-2xl font-black italic tracking-tighter text-emerald-500 uppercase">₹{user.wallet_balance?.toLocaleString()}</p>
        </div>

        <div className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between`}>
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                <ShieldAlert size={24} />
              </div>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">My Claims</p>
            <p className="text-2xl font-black italic tracking-tighter dark:text-white uppercase">{myClaims.length} Active</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="space-y-2">
                {myClaims.slice(0, 2).map((c, i) => (
                   <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                     <span className="truncate max-w-[80px] text-slate-500">{c.report_type}</span>
                     <span className={`px-1.5 py-0.5 rounded uppercase ${c.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : c.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                       {c.status}
                     </span>
                   </div>
                ))}
             </div>
          </div>
        </div>
        <div className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-emerald-500/30 transition-all`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">City Risk Level</p>
          <p className="text-2xl font-black italic tracking-tighter text-blue-500 uppercase flex items-center gap-2">Safe <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span></p>
        </div>

        <WeatherCard 
          city={user.city} 
          userEmail={user.email} 
          onClaimSuccess={(payout) => {
            setUser(prev => ({ ...prev, wallet_balance: prev.wallet_balance + payout }));
          }} 
          onCityChange={(newCity) => {
            const updated = { ...user, city: newCity };
            setUser(updated);
            localStorage.setItem('shieldgig_user', JSON.stringify(updated));
          }}
        />
      </div>
      
      <div className="mt-8 pt-4">
        <h3 className="text-2xl font-bold mb-6">Available Protections for {user.platform} workers</h3>
        
        {loading ? (
          <div className="text-center p-8 text-slate-500 animate-pulse">Loading platform policies from backend...</div>
        ) : policies.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 font-medium">
            No policies currently available for your platform. Check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((p, idx) => {
              const IconComp = ICONS[p.icon] || ShieldAlert;
              return (
                <div key={idx} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm flex flex-col hover:border-emerald-500/50 transition-all relative group overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${p.color}-50 dark:bg-${p.color}-500/10 text-${p.color}-600 dark:text-${p.color}-400`}>
                      <IconComp size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-tight">{p.title || p.name}</h4>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3 mb-6 mt-2 text-sm">
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{p.description || "No description provided."}</p>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Weekly Premium</span>
                      <span className="font-bold">₹{p.weekly_premium || p.premium}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedPolicy(p)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold uppercase italic tracking-tighter text-sm rounded-2xl transition-all"
                    >
                      View Details
                    </button>
                    <button 
                      disabled={activating === (p.id || p.name)}
                      onClick={() => handleActivate(p.id || p.name)}
                      className={`flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase italic tracking-tighter text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex justify-center items-center gap-2`}
                    >
                      {activating === (p.id || p.name) ? '...' : `Activate`}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Policy Details Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`h-32 bg-gradient-to-r from-${selectedPolicy.color || platformColor}-600 to-${selectedPolicy.color || platformColor}-400 p-8 flex items-end relative`}>
              <button 
                onClick={() => setSelectedPolicy(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
              <h2 className="text-3xl font-bold text-white tracking-tight">{selectedPolicy.title || selectedPolicy.name}</h2>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedPolicy.description || "No detailed description available for this policy."}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 block mb-1">Premium</span>
                  <p className="text-xl font-bold">₹{selectedPolicy.weekly_premium || selectedPolicy.premium}<span className="text-sm font-normal text-slate-400">/week</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 block mb-1">Max Payout</span>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{selectedPolicy.max_coverage || selectedPolicy.coverage}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Detailed Benefits</h4>
                <p className="text-slate-700 dark:text-slate-300 bg-indigo-50 dark:bg-indigo-500/5 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 whitespace-pre-wrap leading-relaxed">
                  {selectedPolicy.detailed_benefits || "Complete parametric verification via real-time data feeds. No manual paperwork required."}
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2">API Trigger Condition</h4>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">{selectedPolicy.trigger_condition || selectedPolicy.trigger}</p>
              </div>
            </div>
            
            <div className="p-8 pt-0">
              <button 
                onClick={() => { handleActivate(selectedPolicy.id || selectedPolicy.name); setSelectedPolicy(null); }}
                className={`w-full py-4 bg-${platformColor}-600 hover:bg-${platformColor}-700 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95`}
              >
                Activate Coverage Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
