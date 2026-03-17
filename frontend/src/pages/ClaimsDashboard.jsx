import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

const ClaimsDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ role: 'worker', id: '' });

  useEffect(() => {
    const userStr = localStorage.getItem('shieldgig_user');
    let currentUser = { role: 'worker', id: '' };
    if (userStr) {
      currentUser = JSON.parse(userStr);
      setUser(currentUser);
    }

    fetch('http://localhost:8000/admin/claims')
      .then(res => res.json())
      .then(data => {
        // Filter claims if the user is a worker
        if (currentUser.role === 'worker') {
          // As a worker, we only want to show their claims based on worker_id 
          // (assuming claims have worker_id tied to user.id). Currently, claims 
          // from reports collection logic might differ but we will show claims assigned to them
          // Here we mock filter based on name match for prototyping if id is missing
          setClaims(data.filter(c => c.worker_id === currentUser.id || c.worker === currentUser.name));
        } else {
          setClaims(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || 'Processing').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
          <CheckCircle2 size={14} /> Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
          <XCircle size={14} /> Rejected
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
        <Clock size={14} /> Processing
      </span>
    );
  };

  const totalValue = claims.reduce((acc, c) => acc + (c.amount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Claims<br/>Ledger</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Monitor and manage automatically triggered parametric claims.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 uppercase tracking-widest text-[10px] font-black">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <p className="text-slate-500 mb-2">Pending Escrow</p>
          <p className="text-4xl font-black italic text-amber-500 tracking-tighter">
            {loading ? '...' : `₹${claims.filter(c => (c.status || 'Processing').toLowerCase() === 'processing').reduce((acc, c) => acc + (c.amount || 0), 0).toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <p className="text-emerald-500 mb-2">Realized Payouts</p>
          <p className="text-4xl font-black italic text-emerald-500 tracking-tighter">
            {loading ? '...' : `₹${claims.filter(c => c.status?.toLowerCase() === 'approved').reduce((acc, c) => acc + (c.amount || 0), 0).toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <p className="text-slate-400 mb-2">Rejected/Flags</p>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white tracking-tighter opacity-50">
            {loading ? '...' : `${claims.filter(c => c.status?.toLowerCase() === 'rejected').length}`}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px] ring-1 ring-slate-100 dark:ring-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Claim ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Worker Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trigger Event</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 leading-relaxed">
              {loading && <tr><td colSpan="6" className="text-center py-10 text-slate-500">Loading claims from ShieldGig Network...</td></tr>}
              {!loading && claims.length === 0 && <tr><td colSpan="6" className="text-center py-10 text-slate-500">No active claims found.</td></tr>}
              {!loading && claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500 dark:text-slate-400">{claim.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tighter italic">{claim.worker || 'N/A'}</div>
                    <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{claim.platform || 'General'} Node</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{claim.event || claim.trigger_condition || 'Disruption Incident'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{claim.date || 'Processing Date: Pending'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-black italic tracking-tighter text-slate-900 dark:text-white">₹{claim.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(claim.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <ArrowRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClaimsDashboard;
