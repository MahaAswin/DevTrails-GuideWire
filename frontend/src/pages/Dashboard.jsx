import React from 'react';
import { ArrowUpRight, Users, ShieldAlert, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../api/config";

const PlatformCard = ({ name, color, data }) => {
  const navigate = useNavigate();

  return (
    <div className={`relative overflow-hidden group bg-white dark:bg-[#111827] rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-${color}-500/10 transition-all duration-500 ring-1 ring-slate-100 dark:ring-slate-800`}>
      {/* Decorative gradient blob */}
      <div className={`absolute -right-16 -top-16 w-48 h-48 bg-${color}-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000`}></div>
      
      <div className="flex justify-between items-start mb-6 relative">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-100 dark:bg-${color}-500/20 text-${color}-600 dark:text-${color}-400 mb-4`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <button 
          onClick={() => navigate(`/workers?platform=${name}`)}
          className={`flex items-center gap-1 text-sm font-medium text-${color}-600 hover:text-${color}-700 dark:text-${color}-400 dark:hover:text-${color}-300`}
        >
          View Workers <ArrowUpRight size={16} />
        </button>
      </div>

      <h3 className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 uppercase">
        {name}
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mt-8 relative">
        <div className="bg-slate-50 dark:bg-[#0B0F19] p-4 rounded-2xl flex flex-col gap-1 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <Users size={14} className="text-emerald-500" /> Coverage
          </div>
          <span className="text-2xl font-black italic tracking-tighter">{data.policies.toLocaleString()}</span>
        </div>
        
        <div className="bg-slate-50 dark:bg-[#0B0F19] p-4 rounded-2xl flex flex-col gap-1 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <ShieldAlert size={14} className="text-amber-500" /> Exposure
          </div>
          <span className="text-2xl font-black italic tracking-tighter text-amber-500">{data.risk}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm relative">
        <span className="text-slate-500">Weekly Payouts</span>
        <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
          <Zap size={14} className="text-yellow-500" /> ₹{data.payouts}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = React.useState({ platforms: [], summary: { total_covered: "...", system_risk: "..." } });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch(`${BASE_URL}/analytics/dashboard`)
      .then(res => {
        if (!res.ok) throw new Error('Backend not available');
        return res.json();
      })
      .then(info => {
        setData(info);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load dashboard data. Please ensure the FastAPI backend is running.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse font-medium">Loading AI metrics from backend...</div>;
  if (error) return <div className="p-12 text-center text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl mx-auto w-full max-w-2xl border border-red-200 dark:border-red-500/20">{error}</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Network<br/>Intelligence</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Real-time risk aggregation and policy coverage across all nodes.</p>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl px-6 py-4 flex gap-8 text-[10px] font-black uppercase tracking-widest">
          <div className="flex flex-col gap-1">
            <span className="text-emerald-500">Total Covered</span>
            <span className="text-xl italic tracking-tighter leading-none dark:text-white">{data.summary.total_covered}</span>
          </div>
          <div className="w-px bg-slate-200 dark:border-slate-800"></div>
          <div className="flex flex-col gap-1">
            <span className="text-amber-500">System Risk</span>
            <span className="text-xl italic tracking-tighter leading-none text-amber-500">{data.summary.system_risk}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.platforms.map(platform => (
          <PlatformCard key={platform.name} {...platform} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
