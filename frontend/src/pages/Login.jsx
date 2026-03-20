import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const intendedPlatform = location.state?.platformId || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Login failed');
      }

      const userData = await res.json();

      // Platform validation for workers
      if (userData.role !== 'admin' && intendedPlatform) {
        const userPlatform = userData.platform.toLowerCase();
        const clickedPlatform = intendedPlatform.toLowerCase();
        
        if (userPlatform !== clickedPlatform) {
          throw new Error(`Access Denied: You are registered as a ${userData.platform} worker. Please log in through the ${userData.platform} gateway.`);
        }
      }

      // Store user data in localStorage (simulate session)
      localStorage.setItem('shieldgig_user', JSON.stringify(userData));

      // Role-based routing
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/worker-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-[#0B0F19] transition-colors duration-500">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Shield size={120} />
        </div>
        <div className="mb-10 text-center flex flex-col items-center relative z-10">
          <div className="w-16 h-16 bg-[#FF6B00] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 mb-6">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter dark:text-white uppercase">Systems Gateway</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Authenticate to Access</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              placeholder="e.g. rahul@gmail.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-[#FF6B00] rounded-xl px-4 py-3.5 font-bold transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-[#FF6B00] rounded-xl px-4 py-3.5 font-bold transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-[#FF6B00] hover:bg-[#FF8C42] disabled:opacity-70 text-white font-black uppercase italic tracking-widest py-4 rounded-xl shadow-xl shadow-orange-500/25 transition-all flex justify-center items-center group"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : 'Initiate Login'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Continue With</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button 
            onClick={() => window.location.href = 'http://localhost:8000/auth/google/login'}
            className="flex items-center justify-center gap-3 py-4 border-2 border-slate-100 dark:border-slate-800 hover:border-[#FF6B00]/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all group relative overflow-hidden"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-[#FF6B00] transition-colors">Google</span>
          </button>
          <button 
            onClick={() => window.location.href = 'http://localhost:8000/auth/github/login'}
            className="flex items-center justify-center gap-3 py-4 border-2 border-slate-100 dark:border-slate-800 hover:border-[#FF6B00]/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all group relative overflow-hidden"
          >
            <svg className="w-5 h-5 dark:invert" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-[#FF6B00] transition-colors">GitHub</span>
          </button>
        </div>

        <div className="mt-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          New to ShieldGig? <Link to="/register" state={{ platformId: intendedPlatform }} className="text-[#FF6B00] font-black hover:underline">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
