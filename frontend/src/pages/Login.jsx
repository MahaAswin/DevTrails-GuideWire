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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Shield size={120} />
        </div>
        <div className="mb-10 text-center flex flex-col items-center relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
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
              className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500 rounded-xl px-4 py-3.5 font-bold transition-all"
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
              className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500 rounded-xl px-4 py-3.5 font-bold transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-black uppercase italic tracking-widest py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex justify-center items-center group"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : 'Initiate Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          New to ShieldGig? <Link to="/register" state={{ platformId: intendedPlatform }} className="text-emerald-500 dark:text-emerald-400 font-black hover:underline">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
