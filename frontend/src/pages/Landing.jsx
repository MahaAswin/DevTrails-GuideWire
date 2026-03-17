import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const platforms = [
    { id: 'zomato', name: 'Zomato', color: 'rose', border: 'border-rose-500' },
    { id: 'swiggy', name: 'Swiggy', color: 'amber', border: 'border-amber-500' },
    { id: 'amazon', name: 'Amazon', color: 'blue', border: 'border-blue-500' }
  ];

  const handleBoxClick = (platformId) => {
    navigate('/login', { state: { platformId } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="text-center mb-20 animate-in slide-in-from-top-4 duration-700">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-[0.1em] bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-400 uppercase leading-none mb-6">
          ShieldGig
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em]">Guardian of the Gig Economy</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-20 items-center justify-center animate-in fade-in zoom-in-95 duration-500 delay-150 p-4">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handleBoxClick(platform.id)}
            className={`w-48 h-48 md:w-56 md:h-56 flex flex-col items-center justify-center bg-white dark:bg-[#111827] border-2 ${platform.border} dark:border-opacity-30 border-opacity-30 rounded-[3rem] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden relative shadow-${platform.color}-500/10`}
          >
            <div className={`absolute inset-0 bg-${platform.color}-500/5 group-hover:bg-${platform.color}-500/10 transition-colors duration-300`}></div>
            <h2 className={`text-4xl md:text-5xl font-black text-${platform.color}-600 dark:text-${platform.color}-400 group-hover:scale-110 transition-transform duration-300 uppercase tracking-tighter italic`}>
              {platform.name}
            </h2>
          </button>
        ))}
      </div>

      <div className="mt-12 animate-in fade-in duration-700 delay-300">
        <button 
          onClick={() => navigate('/login')}
          className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 group"
        >
          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-800 group-hover:bg-emerald-500 transition-colors"></span>
          Operator Portal Access
        </button>
      </div>
    </div>
  );
};

export default Landing;
