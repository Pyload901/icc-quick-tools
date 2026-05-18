/**
 * AuthGate — wraps the entire app.
 * Shows an onboarding or login screen when not authenticated.
 */
import { useState } from 'react';
import { Shield, Lock, KeyRound, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

function AuthScreen({ mode, onSubmit, loading }) {
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCode, setShowCode] = useState(false);

  const isOnboarding = mode === 'onboarding';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOnboarding && code !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (code.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    await onSubmit(code);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Animated background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(20,184,166,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-cyber-green mb-4 shadow-lg" style={{ boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">CTF Command Center</h1>
          <p className="text-text-muted text-sm mt-1">
            {isOnboarding ? 'Set your panel password to get started' : 'Enter your password to continue'}
          </p>
        </div>

        {/* Card */}
        <div
          className="glass-card p-7"
          style={{ boxShadow: '0 0 60px rgba(99,102,241,0.12), 0 4px 24px rgba(0,0,0,0.5)' }}
        >
          {/* Mode badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`p-1.5 rounded-lg ${isOnboarding ? 'bg-warning/15 text-warning' : 'bg-accent/15 text-accent'}`}>
              {isOnboarding ? <KeyRound className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary">
                {isOnboarding ? 'First-time Setup' : 'Authentication Required'}
              </p>
              <p className="text-[10px] text-text-muted">
                {isOnboarding ? 'This password will be required on every login' : 'Enter your panel password'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code input */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                {isOnboarding ? 'Choose a password' : 'Password'}
              </label>
              <div className="relative">
                <input
                  id="auth-code-input"
                  type={showCode ? 'text' : 'password'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={isOnboarding ? 'Min. 8 characters' : '••••••••'}
                  required
                  autoFocus
                  className="input-dark pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCode((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm input (onboarding only) */}
            {isOnboarding && (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Confirm password</label>
                <input
                  id="auth-confirm-input"
                  type={showCode ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="input-dark"
                />
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-glow w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isOnboarding ? 'Set Password' : 'Enter Panel'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-text-muted mt-5 opacity-60">
          A/D CTF Panel · Local session only
        </p>
      </div>
    </div>
  );
}

export default function AuthGate({ children, authHook }) {
  const { status, setup, login } = authHook;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (code) => {
    setLoading(true);
    try {
      if (status === 'onboarding') {
        await setup(code);
      } else {
        await login(code);
      }
    } catch {
      // errors are shown by the hooks / axios interceptor
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-text-muted text-sm">Initializing…</p>
        </div>
      </div>
    );
  }

  if (status === 'onboarding' || status === 'login') {
    return <AuthScreen mode={status} onSubmit={handleSubmit} loading={loading} />;
  }

  return children;
}
