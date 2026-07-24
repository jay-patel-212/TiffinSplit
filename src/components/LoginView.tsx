import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
} from '../services/firebase';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  User as UserIcon,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  QrCode,
  CheckCircle2,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { showToast, settings } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const getFirebaseErrorMessage = (err: any) => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. If you do not have an account yet, click "Create Account" above to register.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in or use "Forgot password?" to reset.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in Firebase Console. Please enable Email/Password under Firebase Console -> Authentication -> Sign-in method.';
      case 'auth/popup-closed-by-user':
        return 'Google Sign-In popup was closed before completing.';
      case 'auth/unauthorized-domain':
        return `Domain '${window.location.hostname}' is not authorized in Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
      default:
        return err?.message || 'Firebase Authentication error occurred. Please try again.';
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        showToast('Welcome back! Signed in with Firebase.', 'success');
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name.trim(),
          });
        }
        showToast(`Account created for ${name.trim()} in Firebase Auth! Welcome to ${settings.flatName}.`, 'success');
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast('Signed in with Google Firebase Auth!', 'success');
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(getFirebaseErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetSent(true);
      showToast(`Password reset link sent to ${cleanEmail}!`, 'success');
    } catch (err: any) {
      console.error('Firebase Password Reset error:', err);
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full z-10 space-y-6">
        {/* Flat / App Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            {settings.flatName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xs mx-auto">
            Secure Tiffin & Meal Split Portal. Sign in with Firebase to manage polls & expenses.
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          {/* Security Banner */}
          <div className="mb-5 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-xs flex items-center gap-3 text-indigo-200">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
            <p className="leading-tight">
              Strictly authenticated via Firebase Auth. Only registered flatmate accounts can log in.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'reset' && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/80 rounded-2xl mb-6 border border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              {mode === 'login' && errorMsg.includes('Create Account') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="mt-1 self-start px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors"
                >
                  Switch to Create Account →
                </button>
              )}
            </div>
          )}

          {/* Mode 1 & 2: Login or Sign Up Form */}
          {mode !== 'reset' ? (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. flatmate@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setErrorMsg(null);
                      }}
                      className="text-[11px] font-semibold text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In with Firebase' : 'Create Firebase Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Mode 3: Reset Password Form */
            <div>
              {resetSent ? (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Reset Email Sent!</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Firebase has sent password reset instructions to <span className="font-bold text-indigo-300">{email}</span>. Please check your inbox or spam folder.
                  </p>
                  <button
                    onClick={() => {
                      setMode('login');
                      setResetSent(false);
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Reset Password via Firebase</h3>
                  <p className="text-xs text-slate-400">
                    Enter your email address to receive a official Firebase password reset link.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="flex-1 py-3 rounded-2xl bg-slate-700 text-slate-200 font-bold text-xs hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-slate-800 px-3 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Option */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Quick Info footer */}
          <div className="mt-6 pt-4 border-t border-slate-700/60 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <QrCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>UPI payee: <strong className="text-slate-200">{settings.payeeName}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
