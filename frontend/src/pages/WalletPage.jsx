import React, { useState, useEffect } from 'react';
import { Wallet, Plus, History, ArrowUpRight, ArrowDownLeft, Landmark, QrCode, CheckCircle2, Download, FileText, Send, Users } from 'lucide-react';

const WalletPage = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [formData, setFormData] = useState({ amount: '', method: 'UPI', txId: '', screenshot: null });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('shieldgig_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUser(u);
        const userId = u.id || u._id;
        if (userId) {
          // Sync fresh profile (points, code, wallet_balance)
          fetch(`http://localhost:8000/user/profile/${userId}`)
            .then(res => res.json())
            .then(freshUser => {
              if (freshUser && !freshUser.detail) {
                setUser(freshUser);
                localStorage.setItem('shieldgig_user', JSON.stringify(freshUser));
                fetchData(freshUser.email);
              } else {
                fetchData(u.email);
              }
            }).catch(() => fetchData(u.email));
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showAddMoney) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddMoney]);

  const fetchData = async (email) => {
    if (!email) {
      setLoading(false);
      return;
    }
    try {
      const [balRes, txRes] = await Promise.all([
        fetch(`http://localhost:8000/wallet/balance/${encodeURIComponent(email)}`),
        fetch(`http://localhost:8000/wallet/transactions/${encodeURIComponent(email)}`)
      ]);
      
      if (!balRes.ok || !txRes.ok) {
        console.warn("Server returned error response for wallet data");
        setLoading(false);
        return;
      }

      const balData = await balRes.json();
      const txData = await txRes.json();
      setBalance(balData.wallet_balance || 0);
      setTransactions(txData || []);
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const headers = ["Date", "Description", "Amount", "Status"];
    const rows = transactions.map(t => [
      new Date(t.created_at).toLocaleDateString(),
      t.description || (t.type === 'deposit' ? 'Protocol Reserve Deposit' : 'Policy Payment'),
      t.amount,
      t.status || 'CLEARED'
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShieldGig_Wallet_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const downloadPDF = () => {
    window.print();
  };

  const handleExchangePoints = async () => {
    if (user.referral_points < 1000) return;
    try {
      setSubmitting(true);
      const res = await fetch('http://localhost:8000/wallet/convert-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id || user._id })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        // Update user state for points
        const updatedUser = { 
          ...user, 
          referral_points: data.new_points,
          wallet_balance: data.new_balance
        };
        setUser(updatedUser);
        localStorage.setItem('shieldgig_user', JSON.stringify(updatedUser));
      } else {
        alert(data.detail || "Exchange failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('amount', formData.amount);
      body.append('payment_method', formData.method);
      body.append('transaction_id', formData.txId);
      body.append('worker_email', user.email);
      if (!formData.screenshot) {
        alert("Please upload a proof screenshot.");
        setSubmitting(false);
        return;
      }
      body.append('screenshot', formData.screenshot);

      const res = await fetch('http://localhost:8000/wallet/add-money', {
        method: 'POST',
        body: body
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Payment submitted! Admin will verify within 2-4 hours.");
        setFormData({ amount: '', method: 'UPI', txId: '', screenshot: null });
        fetchData(user.email);
        setTimeout(() => {
          setSuccessMessage('');
          setShowAddMoney(false);
        }, 3000);
      } else {
        alert(data.detail || "Submission failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Scanning Wallet Registry...</div>;
  if (!user) return (
    <div className="p-12 text-center space-y-4">
      <h2 className="text-2xl font-bold dark:text-white">Session Missing</h2>
      <p className="text-slate-500">Please log in to manage your vault.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Capital<br/>Control Center</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your premiums and payouts through the protocol vault.</p>
        </div>
        <button 
          onClick={() => setShowAddMoney(true)}
          className="flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase italic tracking-widest text-xs rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Secure Deposit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <Wallet className="text-white" size={24} />
                </div>
                <span className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] bg-black/20 px-4 py-1.5 rounded-full border border-white/10">Vault Active</span>
              </div>
              <div>
                <p className="text-white/60 text-xs font-black uppercase tracking-widest italic">Capital Reserves</p>
                <h3 className="text-5xl font-black text-white mt-1 italic tracking-tighter">₹{balance.toLocaleString()}</h3>
              </div>
              <div className="pt-6 flex gap-6 border-t border-white/10">
                <div className="flex-1">
                  <p className="text-[9px] text-white/50 font-black uppercase tracking-widest">Payouts</p>
                  <p className="font-black text-white italic tracking-tighter">₹{transactions.filter(t => t.amount > 0 && t.status === 'approved').reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] text-white/50 font-black uppercase tracking-widest">Premiums</p>
                  <p className="font-black text-white italic tracking-tighter">₹{Math.abs(transactions.filter(t => t.amount < 0).reduce((a, b) => a + b.amount, 0)).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-slate-500"><Landmark size={16}/> Instant Verify Details</h4>
              <div className="space-y-3">
              </div>
            </div>

            {/* Refer & Rewards */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform">
                <Users size={80} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Refer a Friend</p>
              <h4 className="text-lg font-black italic tracking-tighter uppercase mb-3 leading-tight">Earn ₹100 Bonus<br/>Per Signup</h4>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex justify-between items-center border border-white/20">
                <span className="font-mono font-bold">{user?.referral_code}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user?.referral_code);
                    alert("Referral code copied!");
                  }}
                  className="text-[10px] font-black uppercase bg-white text-indigo-600 px-3 py-1.5 rounded-lg active:scale-90 transition-transform"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500 flex items-center gap-2">
                   <QrCode size={16}/> Reward Hub
                </h4>
                <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">{user?.referral_points} PTS</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-5 font-medium italic leading-relaxed">Exchange 1000 points for ₹10 cash. Note: Admin approval required for final payout.</p>
              <button 
                onClick={handleExchangePoints}
                disabled={(user?.referral_points || 0) < 1000 || submitting}
                className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase italic tracking-tighter text-xs disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/10"
              >
                <Send size={14} /> {submitting ? 'Processing...' : 'Redeem 1000 Points'}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#0B0F19]">
              <h3 className="font-bold flex items-center gap-2 italic uppercase tracking-tighter text-slate-500"><History size={20} className="text-emerald-500"/> Audit Log</h3>
              <div className="flex items-center gap-2">
                <button onClick={downloadCSV} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-all active:scale-95" title="Download CSV">
                  <Download size={18} />
                </button>
                <button onClick={downloadPDF} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-all active:scale-95" title="Download PDF">
                  <FileText size={18} />
                </button>
                <select className="bg-transparent text-xs font-bold text-slate-500 outline-none ml-2">
                  <option>All Activities</option>
                  <option>Credits</option>
                  <option>Debits</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {transactions.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                    <History size={32} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No transactions found.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {transactions.map((tx, i) => (
                    <div key={i} className="p-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                        {tx.amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate uppercase tracking-tighter italic">
                          {tx.type === 'deposit' ? 'Protocol Reserve Deposit' : 
                           tx.type === 'policy_payment' ? 'Policy Stake Deduction' : 
                           tx.type === 'claim_credit' ? 'Parametric Payout Credit' : 
                           (tx.description || (tx.amount > 0 ? 'Wallet Deposit' : 'Policy Payment'))}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString()} • {tx.transaction_id || tx.id.substring(18)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-xl italic tracking-tighter ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </p>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${tx.status === 'approved' || tx.type ? 'text-emerald-500' : tx.status === 'pending' ? 'text-amber-500' : 'text-rose-500'}`}>
                          {tx.type ? 'CLEARED' : tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddMoney(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            {successMessage ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold">Successfully Submitted!</h3>
                <p className="text-slate-500">{successMessage}</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase line-height-[1] mt-1">Submit Deposit</h3>
                  <button onClick={() => setShowAddMoney(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
                </div>

                <div className="flex flex-col items-center gap-6 bg-slate-50 dark:bg-[#0B0F19] p-10 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                  <div className="bg-white p-4 rounded-2xl shadow-2xl ring-1 ring-slate-200/50">
                    <img src="/protocol_qr.png" alt="UPI QR" className="w-56 h-56" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Protocol Identifier</p>
                    <p className="text-2xl font-black text-emerald-500 italic tracking-tighter uppercase leading-tight">shieldgig@upi</p>
                  </div>
                </div>

                <form onSubmit={handleAddMoney} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Deposit Amount (₹)</label>
                    <input 
                      type="number" required placeholder="500" 
                      value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 focus:border-emerald-500 outline-none transition-all font-black text-2xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button" onClick={() => setFormData({...formData, method: 'UPI'})}
                        className={`py-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-black uppercase italic tracking-tighter transition-all ${formData.method === 'UPI' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 text-slate-500'}`}
                      >
                        <QrCode size={18} /> UPI
                      </button>
                      <button 
                        type="button" onClick={() => setFormData({...formData, method: 'Bank'})}
                        className={`py-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-black uppercase italic tracking-tighter transition-all ${formData.method === 'Bank' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-[#0B0F19] border-slate-100 dark:border-slate-800 text-slate-500'}`}
                      >
                        <Landmark size={18} /> Bank
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Transaction ID / Ref No.</label>
                    <input 
                      type="text" required placeholder="UPI123456789" 
                      value={formData.txId} onChange={e => setFormData({...formData, txId: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 focus:border-emerald-500 outline-none transition-all font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Proof Screenshot (Required)</label>
                    <div className="relative">
                      <input 
                        type="file" accept="image/*" required
                        onChange={e => setFormData({...formData, screenshot: e.target.files[0]})}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 transition-all cursor-pointer bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-2"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={submitting} 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase italic tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Initiate Verification'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
