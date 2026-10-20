import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Lock, Mail, AlertCircle, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';

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

      <div className="min-h-screen bg-[#06180E] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="w-14 h-14 rounded-admin-lg bg-white border border-white/20 flex items-center justify-center mx-auto mb-4 p-1 overflow-hidden">
            <img
              src="/images/logo/logo-mark.png"
              alt="JHS GLOBAL Logo"
              className="w-full h-full object-contain"
              width="56"
              height="56"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-admin-sm bg-white/10 border border-white/15 text-neutral-300 text-[10px] font-semibold tracking-wider mb-2">
            <span>GOVT RECOGNIZED B2B EXPORT DESK</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            Operations Bridge Sign In
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Authorized personnel only. Encrypted session access.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 sm:px-10 rounded-admin-lg border border-[var(--admin-border)] text-[var(--admin-text-primary)] shadow-admin-overlay">
            {error && (
              <div className="mb-5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs p-3.5 rounded-admin-md flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                  Authorized Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--admin-text-placeholder)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@exportb2b.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[var(--admin-border)] rounded-admin-md text-xs sm:text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--admin-brand)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--admin-text-placeholder)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[var(--admin-border)] rounded-admin-md text-xs sm:text-sm text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--admin-brand)] transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[var(--admin-brand)] hover:bg-[var(--admin-brand-hover)] text-white text-xs sm:text-sm font-semibold rounded-admin-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  style={{ transitionDuration: 'var(--admin-duration-micro)' }}
                >
                  <span>Verify Identity & Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="mt-6 pt-5 border-t border-[var(--admin-border)]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] mb-2.5">
                <KeyRound className="w-3.5 h-3.5 text-[var(--admin-text-secondary)]" />
                <span>Test Role Pre-fills</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@exportb2b.com', 'Admin@Export2026!')}
                  className="px-2.5 py-1.5 text-[11px] font-semibold bg-[var(--admin-surface-subtle)] hover:bg-[#E5E7EB] text-[var(--admin-text-primary)] border border-[var(--admin-border)] rounded-admin-sm transition-colors text-center active:scale-[0.98]"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('sales@exportb2b.com', 'Sales@Export2026!')}
                  className="px-2.5 py-1.5 text-[11px] font-semibold bg-[var(--admin-surface-subtle)] hover:bg-[#E5E7EB] text-[var(--admin-text-primary)] border border-[var(--admin-border)] rounded-admin-sm transition-colors text-center active:scale-[0.98]"
                >
                  Sales Desk
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('editor@exportb2b.com', 'Editor@Export2026!')}
                  className="px-2.5 py-1.5 text-[11px] font-semibold bg-[var(--admin-surface-subtle)] hover:bg-[#E5E7EB] text-[var(--admin-text-primary)] border border-[var(--admin-border)] rounded-admin-sm transition-colors text-center active:scale-[0.98]"
                >
                  Catalogue
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
            <span>Encrypted Operations Station</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
