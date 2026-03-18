import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

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
    referredBy: ''
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
      const res = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Registration failed');
      }

      // Registration success, redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.message);
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
              value={formData.referredBy}
              placeholder="Ex: REF123"
              onChange={(e) => setFormData({...formData, referredBy: e.target.value.toUpperCase()})}
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

        <div className="mt-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          Existing Member? <Link to="/login" className="text-emerald-500 dark:text-emerald-400 font-black hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
