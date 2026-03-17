import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, User, Clock, Search, Filter, IndianRupee } from 'lucide-react';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('http://localhost:8000/admin/pending-payments');
      const data = await res.json();
      setPayments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId, status) => {
    try {
      const res = await fetch('http://localhost:8000/admin/approve-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, status })
      });
      if (res.ok) {
        fetchPayments();
      } else {
        alert("Failed to update payment status");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const filtered = payments.filter(p => 
    p.worker_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-12 text-center animate-pulse">Scanning Payment Ledger...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Capital<br/>Approval Desk</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Verify manual deposits to release protocol reserves.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Worker or TxID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white dark:bg-[#111827] border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all font-bold"
            />
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Worker</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Amount</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Method & TxID</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Proof</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Time</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-20 text-slate-500 font-medium">No pending payments for verification.</td></tr>
              ) : (
                filtered.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/20">
                          {payment.worker_name?.[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{payment.worker_name}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-tighter">ID: {payment.user_id.substring(18)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-lg">
                        <IndianRupee size={16} /> {payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 dark:bg-[#0B0F19] rounded-lg uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-slate-800">{payment.payment_method}</span>
                      </div>
                      <div className="text-xs font-mono text-slate-500">{payment.transaction_id}</div>
                    </td>
                    <td className="px-6 py-5">
                      {payment.screenshot_url ? (
                        <a 
                          href={`http://localhost:8000/uploads/${payment.screenshot_url}`} 
                          target="_blank" rel="noreferrer"
                          className="block w-12 h-12 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all shadow-sm shadow-black/20"
                        >
                          <img 
                            src={`http://localhost:8000/uploads/${payment.screenshot_url}`} 
                            alt="Proof" 
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">No Proof</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Clock size={14} /> {new Date(payment.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleVerify(payment.id, 'approved')}
                          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2 font-black uppercase italic tracking-widest text-[10px]"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleVerify(payment.id, 'rejected')}
                          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold text-xs"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
