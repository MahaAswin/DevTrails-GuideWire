import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ShieldX, MapPin, Search, Filter } from 'lucide-react';

const WorkerCard = ({ name, id, city, risk, premium, active }) => {
  const getRiskColor = (risk) => {
    if (risk === 'Safe') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (risk === 'Medium') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  const getRiskIcon = (risk) => {
    if (risk === 'Safe') return <ShieldCheck size={16} />;
    if (risk === 'Medium') return <ShieldAlert size={16} />;
    return <ShieldX size={16} />;
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 hover:border-emerald-500/30 transition-all ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black italic tracking-tighter dark:text-white uppercase leading-none">{name}</h3>
          <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest leading-none">ID: {id}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getRiskColor(risk)}`}>
          {getRiskIcon(risk)} {risk}
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
        <MapPin size={14} className="text-emerald-500" /> {city} Depot
      </div>
      
      <div className="bg-slate-50 dark:bg-[#0B0F19] rounded-2xl p-6 mb-8 flex justify-between items-center border border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 leading-none italic">Premium Stake</p>
          <p className="text-2xl font-black italic tracking-tighter dark:text-white leading-none">₹{premium} <span className="text-sm">/wk</span></p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none italic">Node Status</p>
          <div className="flex items-center gap-2 justify-end">
            <span className={`w-2.5 h-2.5 rounded-full ring-4 shadow-[0_0_10px_rgba(16,185,129,0.3)] ${active ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-slate-300 ring-slate-300/20 dark:bg-slate-600 dark:ring-slate-600/20'}`}></span>
            <span className="text-[10px] font-black uppercase tracking-widest dark:text-slate-200 leading-none">{active ? 'Linked' : 'Offline'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button className="flex-1 bg-slate-900 hover:bg-black text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all active:scale-[0.98]">
          Node Audit
        </button>
        <button className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-100 dark:bg-transparent dark:border-slate-800 dark:text-slate-500 dark:hover:border-slate-700 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all">
          Ledger
        </button>
      </div>
    </div>
  );
};

const WorkersView = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const platform = queryParams.get('platform') || 'All Platforms';

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/admin/users')
      .then(res => res.json())
      .then(data => {
        // Filter only workers and possibly by platform if specified
        let filtered = data.filter(u => u.role === 'worker');
        if (platform !== 'All Platforms') {
          filtered = filtered.filter(u => u.platform === platform);
        }
        setWorkers(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching workers:", err);
        setLoading(false);
      });
  }, [platform]);

  const filteredWorkers = workers.filter(w => 
    (w.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (w.id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (w.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Protocol<br/>Operators</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 italic">Scanning active nodes within the <span className="text-emerald-500 uppercase font-black tracking-widest">{platform}</span> sector.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-4 w-4 h-4 text-emerald-500" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-white dark:bg-[#111827] border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-emerald-500 outline-none text-sm font-bold transition-all"
            />
          </div>
          <button className="p-4 bg-white dark:bg-[#111827] border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-emerald-500/10 transition-all group">
            <Filter size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 animate-pulse">Loading workers from ShieldGig...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map(worker => (
            <WorkerCard 
              key={worker.id || worker._id} 
              name={worker.name}
              id={worker.id || worker._id?.substring(18).toUpperCase()}
              city={worker.city}
              risk={worker.risk || 'Safe'}
              premium={worker.premium || 0}
              active={worker.active_policies?.length > 0} 
            />
          ))}
        </div>
      )}
      
      {filteredWorkers.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No workers found matching your search.
        </div>
      )}
    </div>
  );
};

export default WorkersView;
