import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Activity, ShieldAlert, LogOut } from 'lucide-react';
import { BASE_URL } from "../api/config";

const AdminDashboard = () => {
  const [data, setData] = useState({ users: [], policies: [], claims: [], reports: [], rewardPayouts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, policiesRes, claimsRes, reportsRes, rewardsRes] = await Promise.all([
          fetch(`${BASE_URL}/admin/users`),
          fetch(`${BASE_URL}/admin/policies`),
          fetch(`${BASE_URL}/admin/claims`),
          fetch(`${BASE_URL}/admin/pending-claims`),
          fetch(`${BASE_URL}/admin/reward-payouts/pending`)
        ]);
        
        const users = await usersRes.json();
        const policies = await policiesRes.json();
        const claims = await claimsRes.json();
        const reports = await reportsRes.json();
        const rewardPayouts = await rewardsRes.json();
        
        setData({ users, policies, claims, reports, rewardPayouts });
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleResolveReport = async (reportId) => {
    const amount = prompt("Enter payout amount for this report (₹):", "5000");
    if (!amount) return;

    try {
      const res = await fetch(`${BASE_URL}/admin/resolve-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, payout_amount: parseFloat(amount) })
      });
      if (res.ok) {
        alert("Report resolved and payout sent to worker wallet.");
        // Refresh data
        const reportsRes = await fetch(`${BASE_URL}/admin/reports`);
        const reports = await reportsRes.json();
        setData(prev => ({ ...prev, reports }));
      } else {
        alert("Failed to resolve report");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const handleProcessRewardPayout = async (payoutId, status) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/process-reward-payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payout_id: payoutId, status: status })
      });
      if (res.ok) {
        alert(`Payout ${status === 'approved' ? 'approved' : 'rejected'}.`);
        // Refresh rewards list
        const rewardsRes = await fetch(`${BASE_URL}/admin/reward-payouts/pending`);
        const rewardPayouts = await rewardsRes.json();
        setData(prev => ({ ...prev, rewardPayouts }));
      } else {
        alert("Failed to process payout");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('shieldgig_user');
    navigate('/login', { replace: true });
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse font-medium">Loading ShieldGig Admin Data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Admin Command Center</h2>
          <p className="text-slate-500 dark:text-slate-400">Total system overview and management hub.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl font-bold transition-all uppercase tracking-widest text-[10px]"
        >
          <LogOut size={16} /> Exit Secure Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Users size={24} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Workers</p>
          <p className="text-3xl font-black dark:text-emerald-500 italic tracking-tighter uppercase">{data.users.filter(u => u.role === 'worker').length}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Policies</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">{data.policies.length}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Claims</p>
          <p className="text-3xl font-black text-slate-900 dark:text-amber-500 italic tracking-tighter uppercase">{data.claims.length}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
              <ShieldAlert size={24} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Pending Reports</p>
          <p className="text-3xl font-black text-rose-500 italic tracking-tighter uppercase">{data.reports.length}</p>
        </div>
      </div>
      
      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Workers Table */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
             <h3 className="font-bold flex items-center gap-2 italic uppercase tracking-tighter"><Users size={18} className="text-emerald-500"/> Registered Workers</h3>
          </div>
          <div className="overflow-x-auto p-4 flex-1">
            <table className="w-full text-left text-sm">
              <thead><tr className="text-slate-500 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 text-xs">
                <th className="pb-3 pt-1 px-4 text-left">Name</th><th className="pb-3 pt-1 px-4 text-left">Platform</th><th className="pb-3 pt-1 px-4 text-left">City</th>
              </tr></thead>
              <tbody>
                {data.users.filter(u => u.role === 'worker').map((u, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.platform}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.city}</td>
                  </tr>
                ))}
                {data.users.length === 0 && <tr><td colSpan="3" className="text-center py-6 text-slate-500">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
             <h3 className="font-bold flex items-center gap-2 italic uppercase tracking-tighter text-amber-500"><ShieldAlert size={18}/> Verification Queue</h3>
             <a href="/admin/claims-verification" className="text-[10px] font-black text-emerald-500 hover:underline uppercase tracking-widest">Open Hub</a>
          </div>
          <div className="overflow-x-auto p-4 flex-1">
            <table className="w-full text-left text-sm">
              <thead><tr className="text-slate-500 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 text-xs">
                <th className="pb-3 pt-1 px-4 text-left">Worker</th>
                <th className="pb-3 pt-1 px-4 text-left">Type</th>
                <th className="pb-3 pt-1 px-4 text-left">Status</th>
                <th className="pb-3 pt-1 px-4 text-right">Evidence</th>
              </tr></thead>
              <tbody>
                {data.reports.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium">{r.worker_name}</td>
                    <td className="py-3 px-4 text-emerald-500 font-black text-[11px] italic uppercase tracking-tighter">{r.report_type}</td>
                    <td className="py-3 px-4">
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${r.status === 'under_review' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                          {r.status.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[10px] font-bold text-slate-400 uppercase">
                       {r.proof_images?.length > 0 ? `${r.proof_images.length} Files` : 'None'}
                    </td>
                  </tr>
                ))}
                {data.reports.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">No pending items.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policies Table */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
             <h3 className="font-bold flex items-center gap-2 italic uppercase tracking-tighter"><FileText size={18} className="text-emerald-500"/> System Policies</h3>
          </div>
          <div className="overflow-x-auto p-4 flex-1">
            <table className="w-full text-left text-sm">
              <thead><tr className="text-slate-500 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 text-xs">
                <th className="pb-3 pt-1 px-4 text-left">Policy Name</th><th className="pb-3 pt-1 px-4 text-left">Platform</th><th className="pb-3 pt-1 px-4 text-left">Premium</th>
              </tr></thead>
              <tbody>
                {data.policies.map((p, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium">{p.name}</td>
                    <td className="py-3 px-4 text-emerald-500 font-bold italic uppercase tracking-tighter">{p.platform}</td>
                    <td className="py-3 px-4 font-black text-amber-500">₹{p.weekly_premium || p.premium}</td>
                  </tr>
                ))}
                {data.policies.length === 0 && <tr><td colSpan="3" className="text-center py-6 text-slate-500">No policies found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reward Payouts Desk */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col lg:col-span-2">
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-emerald-500/5">
             <h3 className="font-bold flex items-center gap-2 italic uppercase tracking-tighter text-emerald-600"><ShieldAlert size={18}/> Reward Approval Desk</h3>
             <span className="text-[10px] font-black bg-emerald-500 text-white px-3 py-1 rounded-full uppercase tracking-widest">{data.rewardPayouts?.length || 0} New Requests</span>
          </div>
          <div className="overflow-x-auto p-4 flex-1">
            <table className="w-full text-left text-sm">
              <thead><tr className="text-slate-500 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 text-xs">
                <th className="pb-3 pt-1 px-4 text-left">Worker</th>
                <th className="pb-3 pt-1 px-4 text-left">Reward Details</th>
                <th className="pb-3 pt-1 px-4 text-left">Requested Amount</th>
                <th className="pb-3 pt-1 px-4 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {data.rewardPayouts?.map((rp, i) => (
                  <tr key={rp.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-bold flex flex-col">
                       {rp.user_name}
                       <span className="text-[10px] font-medium text-slate-400 normal-case">{rp.user_email}</span>
                    </td>
                    <td className="py-4 px-4">
                       <span className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                          1000 Points Exchange
                       </span>
                    </td>
                    <td className="py-4 px-4 font-black italic text-emerald-500 text-lg tracking-tighter">₹{rp.amount_inr}</td>
                    <td className="py-4 px-4 text-right flex justify-end gap-2">
                       <button 
                         onClick={() => handleProcessRewardPayout(rp.id, 'approved')}
                         className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                       >
                         Approve
                       </button>
                       <button 
                         onClick={() => handleProcessRewardPayout(rp.id, 'rejected')}
                         className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                       >
                         Reject
                       </button>
                    </td>
                  </tr>
                ))}
                {(!data.rewardPayouts || data.rewardPayouts.length === 0) && <tr><td colSpan="4" className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Vault Secured: No pending reward requests.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
