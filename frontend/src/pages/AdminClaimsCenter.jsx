import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, Eye, ExternalLink, User, Clock, AlertTriangle, AlertCircle, IndianRupee, FileText, CheckCircle, MapPin, Activity } from 'lucide-react';

const AdminClaimsCenter = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [payoutAmt, setPayoutAmt] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      // Fetches from the unified claim_reports collection
      const res = await fetch('http://localhost:8000/admin/pending-claims');
      const data = await res.json();
      setClaims(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (claimId, status) => {
    if (status === 'approved' && !payoutAmt) {
      alert("Please enter a payout amount.");
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/admin/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          claim_id: claimId, 
          status, 
          payout_amount: status === 'approved' ? parseFloat(payoutAmt) : 0 
        })
      });
      if (res.ok) {
        setSelectedClaim(null);
        setPayoutAmt('');
        fetchClaims();
      } else {
        alert("Verification failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse font-medium">Synchronizing Incident Data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-0">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Incident Verification Center</h2>
          <p className="text-slate-500 dark:text-slate-400">Review emergency reports, verify documents, and approve payouts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: List of All Incidents */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#0B0F19]">
            <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-xs text-slate-500 italic"><Clock size={16} className="text-emerald-500"/> Verification Queue</h3>
            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase italic">{claims.length} Active Items</span>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[700px]">
            {claims.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                 <ShieldCheck size={64} className="text-emerald-500 mx-auto opacity-10" />
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">All incidents resolved</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {claims.map((c) => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedClaim(c)}
                    className={`p-6 flex flex-col gap-3 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-[#0B0F19] relative ${selectedClaim?.id === c.id ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}
                  >
                    {selectedClaim?.id === c.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#0B0F19] flex items-center justify-center font-black text-emerald-500 shadow-sm border border-slate-200/50 dark:border-slate-800">
                          {c.worker_name?.[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{c.worker_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.platform}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${c.status === 'under_review' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                        {c.proof_images?.length > 0 && <span className="text-[8px] font-bold text-emerald-500 uppercase flex items-center gap-1"><FileText size={10}/> Evidence Attached</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-emerald-500 dark:text-emerald-400 mb-1 uppercase italic tracking-tighter">{c.report_type}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium italic">{c.description}</p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                       <span className="flex items-center gap-1"><MapPin size={10}/> {c.location.split(',')[0]}</span>
                       <span>{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Unified Detail & Verification */}
        <div className="lg:col-span-1">
          {selectedClaim ? (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 h-full ring-1 ring-slate-100 dark:ring-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">{selectedClaim.report_type}</h3>
                  <button onClick={() => setSelectedClaim(null)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <div className={`w-2 h-2 rounded-full ${selectedClaim.status === 'under_review' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></div>
                   <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">Incident Audit in Progress</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Primary Zone</p>
                    <p className="font-bold text-xs">{selectedClaim.location}</p>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Landmark</p>
                    <p className="font-bold text-xs">{selectedClaim.landmark || 'Not Specified'}</p>
                 </div>
              </div>

              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Description</p>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm font-medium leading-relaxed">
                    {selectedClaim.description}
                 </div>
              </div>

              {selectedClaim.fraud_flags?.length > 0 && (
                <div className="p-5 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20 shadow-sm">
                   <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="text-rose-600" size={18} />
                      <p className="text-xs font-black uppercase text-rose-600 tracking-widest">Fraud Flags Detected</p>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {selectedClaim.fraud_flags.map(f => (
                       <span key={f} className="text-[10px] bg-rose-600 text-white px-3 py-1 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/20">{f.replace('_', ' ')}</span>
                     ))}
                   </div>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                   <FileText size={14}/> Evidence / Proof {selectedClaim.proof_images?.length === 0 && '(Zero Files)'}
                </h4>
                {selectedClaim.proof_images?.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {selectedClaim.proof_images.map((img, i) => (
                      <a 
                        key={i} 
                        href={`http://localhost:8000/uploads/${img}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-indigo-500 transition-all relative group shadow-sm"
                      >
                        {img.toLowerCase().endsWith('.pdf') ? (
                           <div className="h-full flex flex-col items-center justify-center text-rose-500">
                              <FileText size={40} />
                              <span className="text-[8px] font-black uppercase mt-1 tracking-widest">PDF DOC</span>
                           </div>
                        ) : (
                          <img 
                            src={`http://localhost:8000/uploads/${img}`} 
                            alt="proof" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                           <ExternalLink size={20} />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center">
                     <AlertCircle className="text-slate-300 mx-auto mb-2" size={32} />
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pure Parametric Trigger</p>
                     <p className="text-[10px] text-slate-500 mt-1">Cross-check with weather/platform status APIs.</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Proposed Payout (₹)</label>
                  <div className="relative group">
                    <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={24} />
                    <input 
                      type="number"
                      placeholder="Enter amount"
                      value={payoutAmt}
                      onChange={e => setPayoutAmt(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-3xl pl-14 pr-6 py-5 outline-none focus:border-emerald-500 transition-all font-black text-2xl shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                   <button 
                    onClick={() => handleVerify(selectedClaim.id, 'approved')}
                    className="py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                   >
                     <CheckCircle size={24} className="group-hover:scale-110 transition-transform"/> APPROVE
                   </button>
                   <button 
                    onClick={() => handleVerify(selectedClaim.id, 'rejected')}
                    className="py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 hover:border-rose-500 hover:text-rose-500 text-slate-400 font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
                   >
                     <XCircle size={24} className="group-hover:scale-110 transition-transform"/> REJECT
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center bg-slate-50/20 dark:bg-slate-800/10">
               <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-xl mb-6 ring-4 ring-slate-50 dark:ring-slate-800">
                  <Activity size={40} className="text-slate-200" />
               </div>
               <p className="font-black uppercase tracking-[0.2em] text-xs text-slate-400">Awaiting Selection</p>
               <p className="text-slate-500 mt-2 text-sm font-medium">Select an incident from the log to view evidence detail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminClaimsCenter;
