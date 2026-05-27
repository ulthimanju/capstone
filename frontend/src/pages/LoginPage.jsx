import { useState } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';

/* ── Logo ── */
function QuestlyLogo() {
  return (
    <img
      src="/logo.png"
      alt="Questly Logo"
      className="w-8 h-8 object-contain"
    />
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ── Eye icons ── */
function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z" clipRule="evenodd" />
      <path d="M10.748 13.93l2.523 2.523A9.987 9.987 0 0110 17c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.838-4.826L6.06 7.94A4 4 0 0010.748 13.93z" />
    </svg>
  );
}

/* ── Google "G" SVG ── */
function GoogleGIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ── Field component ── */
function Field({ label, error, children }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

/* ── Input component ── */
function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`w-full h-9 px-3 rounded-md text-sm bg-surface-elevated border text-text-primary placeholder:text-text-disabled transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-focus-glow ${
        error ? 'border-danger focus:border-danger' : 'border-border focus:border-brand'
      } ${className}`}
      {...props}
    />
  );
}

/* ── Password field with visibility toggle ── */
function PasswordField({ label, error, value, onChange, placeholder = 'Enter password', name }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} error={error}>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-9 pl-3 pr-10 rounded-md text-sm bg-surface-elevated border text-text-primary placeholder:text-text-disabled transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-focus-glow ${
            error ? 'border-danger focus:border-danger' : 'border-border focus:border-brand'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary cursor-pointer rounded-md"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </Field>
  );
}

/* ═══════════════════════════════════════════════
   Main LoginPage Component
═══════════════════════════════════════════════ */
export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [googleMockOpen, setGoogleMockOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  /* ── Login form state ── */
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});

  /* ── Register form state ── */
  const [regForm, setRegForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [regErrors, setRegErrors] = useState({});

  /* ── Helpers ── */
  const handleAuthSuccess = (data) => {
    const { accessToken, refreshToken, userId, email, role } = data;
    setAuth(accessToken, refreshToken, { userId, email, role });
    navigate('/', { replace: true });
  };

  const friendlyError = (err) => {
    if (!err.response) return 'Network error — please check your connection.';
    const status = err.response.status;
    const msg = err.response?.data?.message || err.response?.data?.error;
    if (msg) return msg;
    if (status === 401) return 'Invalid email or password.';
    if (status === 409) return 'An account with this email already exists.';
    if (status === 400) return 'Please check your details and try again.';
    if (status >= 500) return 'Server error — please try again later.';
    return 'Something went wrong. Please try again.';
  };

  /* ── Login submit ── */
  const validateLogin = () => {
    const errs = {};
    if (!loginForm.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) errs.email = 'Enter a valid email address.';
    if (!loginForm.password) errs.password = 'Password is required.';
    return errs;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validateLogin();
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }
    setLoginErrors({});
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/api/auth/login', {
        email: loginForm.email,
        password: loginForm.password,
      });
      handleAuthSuccess(data);
    } catch (err) {
      setApiError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Register submit ── */
  const validateRegister = () => {
    const errs = {};
    if (!regForm.displayName.trim()) errs.displayName = 'Display name is required.';
    if (!regForm.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) errs.email = 'Enter a valid email address.';
    if (!regForm.password) errs.password = 'Password is required.';
    else if (regForm.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (regForm.confirmPassword !== regForm.password) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validateRegister();
    if (Object.keys(errs).length) { setRegErrors(errs); return; }
    setRegErrors({});
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/api/auth/register', {
        email: regForm.email,
        password: regForm.password,
        displayName: regForm.displayName,
      });
      handleAuthSuccess(data);
    } catch (err) {
      setApiError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Google mock submit ── */
  const handleGoogleMock = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!googleEmail.trim() || !googleName.trim()) {
      setApiError('Please provide both name and email for the Google mock login.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/api/auth/google/mock', {
        email: googleEmail,
        displayName: googleName,
      });
      handleAuthSuccess(data);
    } catch (err) {
      setApiError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Tab switch clears errors ── */
  const switchTab = (t) => {
    setTab(t);
    setApiError('');
    setLoginErrors({});
    setRegErrors({});
    setGoogleMockOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radial glow background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(59,130,246,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md bg-surface border border-border rounded-xl p-8 animate-fade-in"
        style={{ boxShadow: '0 0 40px rgba(59,130,246,0.08)' }}
      >
        {/* Logo + wordmark */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex items-center gap-3">
            <QuestlyLogo />
            <span className="text-2xl font-bold text-text-primary tracking-tight">Questly</span>
          </div>
          <p className="text-sm text-text-muted text-center">
            Your AI-powered study companion
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border mb-6">
          {[
            { key: 'login', label: 'Sign In' },
            { key: 'register', label: 'Create Account' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTab(key)}
              className={`flex-1 pb-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                tab === key
                  ? 'text-brand border-b-2 border-brand -mb-px'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* API Error alert */}
        {apiError && (
          <div className="mb-5 flex items-start gap-3 rounded-lg bg-danger-muted border border-danger/30 px-4 py-3 animate-fade-in">
            <svg className="w-4 h-4 text-danger mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-danger">{apiError}</p>
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            <Field label="Email address" error={loginErrors.email}>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                error={loginErrors.email}
                autoComplete="email"
              />
            </Field>

            <PasswordField
              label="Password"
              name="password"
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              error={loginErrors.password}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-brand hover:bg-brand-hover text-bg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <><Spinner /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
            <Field label="Display name" error={regErrors.displayName}>
              <Input
                type="text"
                name="displayName"
                placeholder="Your name"
                value={regForm.displayName}
                onChange={(e) => setRegForm({ ...regForm, displayName: e.target.value })}
                error={regErrors.displayName}
                autoComplete="name"
              />
            </Field>

            <Field label="Email address" error={regErrors.email}>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                error={regErrors.email}
                autoComplete="email"
              />
            </Field>

            <PasswordField
              label="Password"
              name="password"
              placeholder="Create a password (min. 6 chars)"
              value={regForm.password}
              onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
              error={regErrors.password}
            />

            <PasswordField
              label="Confirm password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={regForm.confirmPassword}
              onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
              error={regErrors.confirmPassword}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-brand hover:bg-brand-hover text-bg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <><Spinner /> Creating account…</> : 'Create Account'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-disabled">or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google mock button */}
        {!googleMockOpen ? (
          <button
            type="button"
            onClick={() => setGoogleMockOpen(true)}
            className="w-full h-10 rounded-md border border-border hover:border-brand-hover bg-transparent text-text-primary text-sm font-medium flex items-center justify-center gap-3 cursor-pointer transition-colors duration-150 hover:bg-surface-elevated"
          >
            <GoogleGIcon />
            Continue with Google <span className="text-text-disabled text-xs">(Dev Mock)</span>
          </button>
        ) : (
          <form onSubmit={handleGoogleMock} className="space-y-3 animate-fade-in">
            <p className="text-xs text-text-muted mb-2">Enter details for Google mock login:</p>
            <Field label="Display name">
              <Input
                type="text"
                placeholder="Your name"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
              />
            </Field>
            <Field label="Email address">
              <Input
                type="email"
                placeholder="you@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
              />
            </Field>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setGoogleMockOpen(false)}
                className="flex-1 h-9 rounded-md border border-border text-text-muted hover:text-text-primary text-sm cursor-pointer transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-9 rounded-md bg-brand hover:bg-brand-hover text-bg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <><Spinner /> Signing in…</> : 'Sign In with Google'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-text-disabled">
          By continuing, you agree to Questly's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
