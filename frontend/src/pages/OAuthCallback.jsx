import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';

/**
 * OAuthCallback – receives the JWT token from the backend redirect
 * URL format: /auth/callback?token=<jwt>
 *
 * Flow:
 *  1. Parse ?token= from query params
 *  2. Call GET /auth/me with Bearer token
 *  3. Store user in localStorage
 *  4. Redirect to dashboard
 */
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      // Handle error redirect from backend
      if (error) {
        const messages = {
          no_code: 'Authorization was cancelled.',
          token_exchange_failed: 'Failed to verify Google token. Please try again.',
          userinfo_failed: 'Could not fetch your Google profile.',
          no_email: 'Your Google account has no email associated.',
          access_denied: 'Access was denied.',
        };
        setErrorMsg(messages[error] || `Authentication error: ${error}`);
        setStatus('error');
        return;
      }

      if (!token) {
        setErrorMsg('No authentication token received. Please try again.');
        setStatus('error');
        return;
      }

      try {
        // Fetch user profile using the JWT
        const res = await fetch('http://localhost:8000/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Failed to load your profile.');
        }

        const userData = await res.json();

        // Persist to localStorage – same key the rest of the app uses
        const userToStore = {
          ...userData,
          _oauth_token: token, // store token for future API calls if needed
        };
        localStorage.setItem('shieldgig_user', JSON.stringify(userToStore));

        setStatus('success');

        // Short delay so user sees the success state before redirect
        setTimeout(() => {
          if (userData.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/worker-dashboard', { replace: true });
          }
        }, 1200);
      } catch (err) {
        setErrorMsg(err.message);
        setStatus('error');
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-[#0B0F19] transition-colors duration-500">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm text-center">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Shield className="text-white w-8 h-8" />
          </div>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
            <h2 className="text-xl font-black uppercase italic tracking-tight dark:text-white">
              Signing you in…
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Verifying your Google account
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/30 animate-pulse">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tight dark:text-white">
              Authenticated!
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Redirecting to your dashboard…
            </p>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden mt-2">
              <div className="h-full bg-emerald-500 rounded-full animate-[grow_1.2s_ease-in-out_forwards]" />
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tight dark:text-white">
              Authentication Failed
            </h2>
            <p className="text-sm text-red-400 font-medium px-4">
              {errorMsg}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-4 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase italic tracking-widest rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>

      {/* Progress bar animation */}
      <style>{`
        @keyframes grow {
          from { width: 0% }
          to   { width: 100% }
        }
        .animate-\\[grow_1\\.2s_ease-in-out_forwards\\] {
          animation: grow 1.2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;
