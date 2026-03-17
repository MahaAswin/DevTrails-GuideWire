import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Map, AlertTriangle, Activity } from 'lucide-react';

const claimsData = [];
const riskData = [];

const RiskAnalytics = () => {
  const hasData = claimsData.length > 0 && riskData.length > 0;
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Risk<br/>Intelligence</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">AI-driven predictive models and city-wide risk assessments.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase italic tracking-widest text-[10px] rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95">
          <AlertTriangle size={18} /> Download Protocol Audit
        </button>
      </div>

      {!hasData ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-16 text-center shadow-sm flex flex-col items-center ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 ring-1 ring-emerald-500/20">
            <Activity className="text-emerald-500 w-10 h-10 animate-pulse" />
          </div>
          <h3 className="text-3xl font-black italic tracking-tighter mb-3 uppercase dark:text-white">Awaiting Neural Signals</h3>
          <p className="text-slate-500 max-w-md mx-auto font-medium italic">
            The AI Risk Engine is scanning the network. Analytical trends will appear here once parametric triggers are detected in the active nodes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ... Line and Bar Charts as before ... */}
        </div>
      )}

      {/* Heatmap Placeholder */}
      <div className="bg-[#111827] rounded-[2.5rem] p-8 shadow-lg border border-slate-800 relative overflow-hidden h-[30rem] flex flex-col items-center justify-center text-center group">
        <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/12/2890/1908.png')] opacity-20 grayscale bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"></div>
        
        {/* Artificial heat blobs */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-amber-500/20 rounded-full blur-[60px] mix-blend-screen animate-pulse delay-700"></div>
        
        <div className="relative z-10 flex flex-col items-center bg-[#0B0F19]/80 px-10 py-12 rounded-[2rem] backdrop-blur-xl border border-slate-800 shadow-2xl">
          <Map size={56} className="text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <h3 className="text-3xl font-black italic tracking-tighter text-white mb-4 uppercase">Live Operational Node Overlay</h3>
          <p className="text-slate-400 max-w-md font-medium italic">The neural engine overlays real-time API telemetry across active coordinates to trigger automatic protocol disbursements.</p>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalytics;
