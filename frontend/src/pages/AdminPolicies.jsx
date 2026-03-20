import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Shield, UserPlus } from 'lucide-react';
import { BASE_URL } from "../api/config";

const AdminPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', platform: 'All', weekly_premium: 0, max_coverage: 0, trigger_condition: '',
    description: '', detailed_benefits: ''
  });

  const fetchPolicies = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/policies`);
      if (res.ok) setPolicies(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/admin/add-policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddForm(false);
        fetchPolicies(); // Refresh
        setFormData({ name: '', platform: 'All', weekly_premium: 0, max_coverage: 0, trigger_condition: '', description: '', detailed_benefits: '' });
      }
    } catch (err) {
      console.error("Failed to create policy", err);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading Policies...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Smart Contract<br/>Foundry</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Design and deploy parametric insurance nodes to the protocol.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase italic tracking-widest text-xs rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
        >
          <PlusCircle size={18} /> Deploy Policy
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 mb-8 animate-in zoom-in-95 duration-200 ring-1 ring-slate-100 dark:ring-slate-800 shadow-xl shadow-emerald-500/5">
          <h3 className="text-2xl font-black italic tracking-tighter mb-6 flex items-center gap-3 text-slate-900 dark:text-white uppercase uppercase">
            <Shield size={24} className="text-emerald-500" /> Contract Configurator
          </h3>
          <form onSubmit={handleCreatePolicy} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Policy Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Platform Focus</label>
              <select value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold transition-all appearance-none">
                <option value="All">Global (All Platforms)</option>
                <option value="Zomato">Zomato Node</option>
                <option value="Swiggy">Swiggy Node</option>
                <option value="Zepto">Zepto Node</option>
                <option value="Amazon">Amazon Node</option>
                <option value="Dunzo">Dunzo Node</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Weekly Premium (₹)</label>
              <input type="number" required min="0" value={formData.weekly_premium} onChange={e => setFormData({...formData, weekly_premium: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Max Coverage (₹)</label>
              <input type="number" required min="0" value={formData.max_coverage} onChange={e => setFormData({...formData, max_coverage: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold transition-all" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Trigger Condition (API Parametric)</label>
              <input type="text" required placeholder="e.g. IMD Heavy Rain (>50mm in 4h) or AQI > 400" value={formData.trigger_condition} onChange={e => setFormData({...formData, trigger_condition: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold transition-all" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Policy Description</label>
              <textarea required rows={2} placeholder="Brief summary of the policy coverage..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold transition-all resize-none" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Detailed Benefits & Payout Rules</label>
              <textarea required rows={3} placeholder="Full details on what is covered and how payouts are calculated..." value={formData.detailed_benefits} onChange={e => setFormData({...formData, detailed_benefits: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-bold transition-all resize-none" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 hover:bg-slate-100 dark:hover:bg-[#0B0F19] rounded-xl transition-all font-black uppercase italic tracking-widest text-[10px] text-slate-500">Cancel</button>
              <button type="submit" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-500/20 transition-all font-black uppercase italic tracking-widest text-[10px]">Deploy Contract</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No policies active. Click "Add New Policy" to create one.
          </div>
        )}
        {policies.map(policy => (
          <div key={policy.id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm flex flex-col hover:border-emerald-500/30 transition-all ring-1 ring-slate-100 dark:ring-slate-800 group relative">
            <div className="flex justify-between items-start mb-6">
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full ring-1 ring-emerald-500/20">
                {policy.platform} Node
              </div>
              <div className="flex gap-2">
                <button className="text-slate-400 hover:text-emerald-500 transition-colors"><Edit size={16} /></button>
                <button className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-6 flex-1 text-slate-900 dark:text-white uppercase leading-none">{policy.name}</h3>
            
            <div className="space-y-4 mb-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>Network Scope</span>
                <span className="text-emerald-500 italic">{policy.platform === 'All' ? 'Global' : policy.platform} Entry</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>Weekly Stake</span>
                <span className="text-slate-900 dark:text-white italic">₹{policy.weekly_premium}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>Capital Cover</span>
                <span className="text-emerald-500 italic">₹{policy.max_coverage}</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 line-clamp-2 italic normal-case font-medium">"{policy.description}"</p>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-amber-500 italic">Trigger Condition:</span> <span className="text-slate-700 dark:text-slate-300 normal-case font-bold">{policy.trigger_condition}</span>
              </div>
            </div>

            <button className="w-full flex justify-center items-center gap-2 py-4 bg-slate-900 dark:bg-emerald-500/5 hover:bg-black dark:hover:bg-emerald-500/10 text-white dark:text-emerald-400 font-black uppercase italic tracking-widest text-[10px] rounded-2xl transition-all active:scale-[0.98]">
              <UserPlus size={16} /> Assign to Target
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPolicies;
