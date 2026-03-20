import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { BASE_URL } from "../api/config";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intendedPlatform = location.state?.platformId;
  
  // Format platform name (e.g. 'zomato' -> 'Zomato')
  const defaultPlatform = intendedPlatform 
    ? intendedPlatform.charAt(0).toUpperCase() + intendedPlatform.slice(1)
    : 'Zomato';

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    password: '',
    platform: defaultPlatform,
    city: '',
    referred_by: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update platform if context changes
  useEffect(() => {
    if (intendedPlatform) {
      setFormData(prev => ({ 
        ...prev, 
        platform: intendedPlatform.charAt(0).toUpperCase() + intendedPlatform.slice(1) 
      }));
    }
  }, [intendedPlatform]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        let data = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }
        throw new Error(data?.detail || 'Registration failed');
      }

      // Registration success, redirect to login
      navigate('/login');
    } catch (err) {
      const msg = err?.message || 'Registration failed';
      setError(msg === 'Failed to fetch' ? 'Network/CORS error. Please try again later.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm my-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Shield size={120} />
        </div>
        <div className="mb-10 text-center flex flex-col items-center relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter dark:text-white uppercase leading-none">Protocol<br/>Enrollment</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">Join the ShieldGig Network</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <input 
              type="text" required
              value={formData.name}
              placeholder="Full Name"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500 rounded-xl px-4 py-3 font-bold transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
            <input 
              type="email" required
              value={formData.email}
              placeholder="Email address"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500 rounded-xl px-4 py-3 font-bold transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Platform</label>
              <select 
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500 rounded-xl px-4 py-3 font-bold transition-all appearance-none"
              >
                <option value="Zomato">Zomato</option>
                <option value="Swiggy">Swiggy</option>
                <option value="Zepto">Zepto</option>
                <option value="Amazon">Amazon</option>
                <option value="Dunzo">Dunzo</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">City</label>
              <input 
                type="text" required
                value={formData.city}
                placeholder="City"
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500 rounded-xl px-4 py-3 font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
            <input 
              type="tel" required
              value={formData.phone}
              placeholder="+919876543210"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500 rounded-xl px-4 py-3 font-bold transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <input 
              type="password" required minLength="6"
              value={formData.password}
              placeholder="Password (min 6 chars)"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500 rounded-xl px-4 py-3 font-bold transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Referral Code (Optional)</label>
            <input 
              type="text"
              value={formData.referred_by}
              placeholder="Ex: REF123"
              onChange={(e) => setFormData({...formData, referred_by: e.target.value.toUpperCase()})}
              className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500 rounded-xl px-4 py-3 font-bold transition-all uppercase"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white font-black uppercase italic tracking-widest py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex justify-center items-center"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : 'Secure Enrollment'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Continue With</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button 
            onClick={() => window.location.href = `${BASE_URL}/auth/google/login`}
            className="flex items-center justify-center gap-3 py-4 border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all group relative overflow-hidden"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">Google</span>
          </button>
          <button 
            onClick={() => window.location.href = `${BASE_URL}/auth/github/login`}
            className="flex items-center justify-center gap-3 py-4 border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all group relative overflow-hidden"
          >
            <svg className="w-5 h-5 dark:invert" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">GitHub</span>
          </button>
        </div>

        <div className="mt-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          Existing Member? <Link to="/login" className="text-emerald-500 dark:text-emerald-400 font-black hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
