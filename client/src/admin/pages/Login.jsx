import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, KeyRound, Anchor } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';
import Button from '../../components/ui/Button';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <>
      <Helmet>
        <title>Commercial Operations Sign In — {brandName}</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#04120A] via-[#0A2619] to-[#06180E] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Brand Pattern & Calm Ambient Glow */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none animate-ambient-drift" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none animate-ambient-drift" />

        <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-800/80 border border-primary-700/80 flex items-center justify-center text-primary-200 mx-auto shadow-lg mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/80 border border-primary-700/60 text-primary-200 text-[11px] font-semibold tracking-wider mb-2">
            <span>GOVT RECOGNIZED B2B EXPORT DESK</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Operations Bridge Sign In
          </h1>
          <p className="mt-1 text-xs text-neutral-300">
            Authorized personnel only. End-to-end encrypted session controls.
          </p>
        </div>

        <div className="mt-8 relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl border border-neutral-200/90 shadow-2xl text-neutral-900 transform-gpu animate-route-enter motion-reduce:animate-none">
            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Authorized Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@exportb2b.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-800 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-800 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="cta"
                  loading={isSubmitting}
                  className="w-full py-3 text-sm font-bold shadow-card flex items-center justify-center gap-2"
                >
                  <span>Verify Identity & Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="mt-6 pt-5 border-t border-neutral-200/80">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2.5">
                <KeyRound className="w-3.5 h-3.5 text-neutral-700" />
                <span>Test Role Pre-fills</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@exportb2b.com', 'Admin@Export2026!')}
                  className="px-2.5 py-1.5 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-md transition-colors text-center active:scale-[0.98]"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('sales@exportb2b.com', 'Sales@Export2026!')}
                  className="px-2.5 py-1.5 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-md transition-colors text-center active:scale-[0.98]"
                >
                  Sales Desk
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('editor@exportb2b.com', 'Editor@Export2026!')}
                  className="px-2.5 py-1.5 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-md transition-colors text-center active:scale-[0.98]"
                >
                  Catalogue
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Anchor className="w-3.5 h-3.5 text-neutral-400" />
            <span>Mundra Port Gateway & International Trade Station</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
