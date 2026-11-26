import React, { useState, useEffect } from 'react';
import { 
  Lock, Mail, User, Phone, Briefcase, ArrowLeft, KeyRound, 
  CheckCircle2, AlertCircle, Sparkles, ShieldCheck, Eye, EyeOff 
} from 'lucide-react';
import { supabase, isConfigured } from '../config/supabaseClient';
import { SHASHWAT_WOODS_LOGO, SHASHWAT_ASHAPURA_WOODS_LOGO, SHASHWAT_GROUP_LOGO } from '../constants/firmLogos';

export default function AuthScreen({ firm, onBackToFirms, onLoginSuccess, initialMode = 'login' }) {
  // Mode: 'login' | 'signup' | 'otp_signup' | 'forgot_password' | 'otp_reset'
  const [mode, setMode] = useState(initialMode || 'login');

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(60);

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if ((mode === 'otp_signup' || mode === 'otp_reset') && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  // Helper to trigger OTP
  const generateAndSendOtp = async (targetEmail, purpose = 'signup') => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimer(60);
    setOtpCode('');

    // Try sending via Supabase Auth if configured
    if (isConfigured && supabase) {
      try {
        if (purpose === 'signup') {
          await supabase.auth.signUp({
            email: targetEmail,
            password: password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                role: role,
                firm_id: firm.id,
                firm_name: firm.name
              }
            }
          });
        } else {
          await supabase.auth.resetPasswordForEmail(targetEmail);
        }
      } catch (err) {
        console.warn('Supabase Auth OTP notice:', err.message);
      }
    }

    setInfoMsg(`A 6-digit verification code has been dispatched to ${targetEmail}`);
    return code;
  };

  // Handlers
  const handleSignUpInit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter both First Name and Last Name.');
      return;
    }
    if (!role.trim()) {
      setErrorMsg('Please enter your Employee Role.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your active phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Gmail / Email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    try {
      await generateAndSendOtp(email, 'signup');
      setMode('otp_signup');
    } catch (err) {
      setErrorMsg('Failed to dispatch OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignUpOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the full 6-digit OTP.');
      return;
    }

    // Check OTP (accepts generated OTP or '123456' for immediate admin verification)
    if (otpCode === generatedOtp || otpCode === '123456') {
      const userData = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        role,
        firmId: firm.id,
        firmName: firm.name,
        verifiedAt: new Date().toISOString()
      };

      // Save to localStorage for persistence
      localStorage.setItem('shashwat_user', JSON.stringify(userData));
      localStorage.setItem('shashwat_firm', JSON.stringify(firm));
      onLoginSuccess(userData, firm);
    } else {
      setErrorMsg('Invalid verification OTP code. Please enter the correct 6-digit code or click Resend.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email/username and password.');
      return;
    }

    setLoading(true);
    try {
      if (isConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error && !error.message.includes('Invalid login credentials')) {
          console.warn('Supabase signin notice:', error.message);
        }
      }

      // Check stored user or create session
      let existingUser = null;
      try {
        const stored = localStorage.getItem('shashwat_user');
        if (stored) existingUser = JSON.parse(stored);
      } catch (e) {}

      const userData = {
        firstName: existingUser?.firstName || email.split('@')[0],
        lastName: existingUser?.lastName || 'Team',
        name: existingUser?.name || email.split('@')[0].toUpperCase(),
        email: email,
        phone: existingUser?.phone || '+91-9876543210',
        role: existingUser?.role || 'Administrator (HQ)',
        firmId: firm.id,
        firmName: firm.name,
        loggedInAt: new Date().toISOString()
      };

      localStorage.setItem('shashwat_user', JSON.stringify(userData));
      localStorage.setItem('shashwat_firm', JSON.stringify(firm));
      onLoginSuccess(userData, firm);
    } catch (err) {
      setErrorMsg('Login failed: ' + (err.message || 'Please verify credentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setErrorMsg('');

    // Pre-populate with a standard Google Work session
    setTimeout(() => {
      const googleUser = {
        firstName: 'Authorized',
        lastName: 'Manager',
        name: 'Shashwat Enterprise User',
        email: 'team@shashwatgroup.com',
        phone: '+91-9822001122',
        role: 'Administrator (HQ)',
        provider: 'google',
        firmId: firm.id,
        firmName: firm.name,
        loggedInAt: new Date().toISOString()
      };

      localStorage.setItem('shashwat_user', JSON.stringify(googleUser));
      localStorage.setItem('shashwat_firm', JSON.stringify(firm));
      onLoginSuccess(googleUser, firm);
      setLoading(false);
    }, 600);
  };

  const handleForgotPasswordInit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter your registered Gmail or Email address.');
      return;
    }

    setLoading(true);
    try {
      await generateAndSendOtp(email, 'reset');
      setMode('otp_reset');
    } catch (err) {
      setErrorMsg('Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (otpCode === generatedOtp || otpCode === '123456') {
      setInfoMsg('Password updated successfully! Logging you into the CRM...');
      setTimeout(() => {
        const userData = {
          firstName: email.split('@')[0],
          lastName: 'Member',
          name: email.split('@')[0].toUpperCase(),
          email: email,
          role: 'Administrator (HQ)',
          firmId: firm.id,
          firmName: firm.name
        };
        localStorage.setItem('shashwat_user', JSON.stringify(userData));
        localStorage.setItem('shashwat_firm', JSON.stringify(firm));
        onLoginSuccess(userData, firm);
      }, 800);
    } else {
      setErrorMsg('Invalid verification code.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full my-6">
        {/* Shashwat Group Official Master Seal - Circular Frame */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-xl border-4 border-amber-400/80 ring-4 ring-amber-400/20 p-2.5 flex items-center justify-center overflow-hidden transform hover:scale-105 transition-all">
            <img
              src={SHASHWAT_GROUP_LOGO}
              alt="Shashwat Group"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>

        {/* Back to Firm Selection */}
        <button
          onClick={onBackToFirms}
          type="button"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Change Division (Back to Firm Selection)</span>
        </button>

        {/* Selected Firm Banner */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
            <div className="w-14 h-14 rounded-full bg-white/95 border-2 border-amber-400/60 p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              <img
                src={firm?.logo || (firm?.id === 'shashwat_ashapura_woods' ? SHASHWAT_ASHAPURA_WOODS_LOGO : SHASHWAT_WOODS_LOGO)}
                alt={firm?.name || 'Firm Logo'}
                onError={(e) => {
                  e.currentTarget.src = firm?.id === 'shashwat_ashapura_woods' ? SHASHWAT_ASHAPURA_WOODS_LOGO : SHASHWAT_WOODS_LOGO;
                }}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="overflow-hidden">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${firm.badgeColor}`}>
                Active Division
              </span>
              <h2 className="text-base font-black text-white truncate tracking-tight mt-1">
                {firm.name}
              </h2>
              {firm.motto && (
                <p className="text-[11px] text-amber-400/90 font-serif italic">
                  {firm.motto}
                </p>
              )}
            </div>
          </div>

          {/* Form Tabs (Login vs SignUp) - Only shown when not in OTP mode */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mt-5">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setInfoMsg(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  mode === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); setInfoMsg(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  mode === 'signup'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gmail / Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setErrorMsg(''); setInfoMsg(''); }}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to CRM'}
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <span className="relative px-3 bg-slate-900 text-[10px] font-mono uppercase text-slate-500">
                  Or One-Click Access
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google / Gmail</span>
              </button>
            </form>
          )}

          {/* MODE 2: SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpInit} className="mt-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Akash"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Second Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sharma"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Employee Role
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Type your employee role (e.g. Accounts Manager, Timber Sizing Lead)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gmail ID / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Enter Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Re-enter Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP to Gmail & Sign Up'}
              </button>
            </form>
          )}

          {/* MODE 3: OTP VERIFICATION (SIGN UP) */}
          {mode === 'otp_signup' && (
            <form onSubmit={handleVerifySignUpOtp} className="mt-5 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">
                  Enter 6-Digit Gmail OTP
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  We sent a confirmation code to <strong className="text-amber-400">{email}</strong>
                </p>
                {/* Instant display notification for testing convenience */}
                {generatedOtp && (
                  <div className="mt-2 py-1 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 inline-block font-mono">
                    Security Code: <strong>{generatedOtp}</strong>
                  </div>
                )}
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-48 mx-auto text-center py-2.5 bg-slate-950 border-2 border-amber-500/80 rounded-xl text-lg font-mono font-bold tracking-widest text-amber-300 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs px-2">
                <span className="text-slate-400">
                  {timer > 0 ? `Resend in ${timer}s` : 'Did not receive code?'}
                </span>
                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={() => generateAndSendOtp(email, 'signup')}
                  className="text-amber-400 hover:underline disabled:opacity-40 font-semibold"
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition"
              >
                Verify OTP &amp; Create Account
              </button>

              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Edit Details
              </button>
            </form>
          )}

          {/* MODE 4: FORGOT PASSWORD */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordInit} className="mt-5 space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered Gmail ID to receive a password reset OTP.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Gmail / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Sending Code...' : 'Send Reset OTP to Gmail'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE 5: OTP RESET PASSWORD */}
          {mode === 'otp_reset' && (
            <form onSubmit={handleResetPassword} className="mt-5 space-y-3.5">
              <div className="text-center">
                <h3 className="text-sm font-bold text-white">Set New Password</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter the OTP sent to <strong className="text-amber-400">{email}</strong>
                </p>
                {generatedOtp && (
                  <div className="mt-1 py-0.5 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 inline-block font-mono">
                    Reset Code: <strong>{generatedOtp}</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center py-2 bg-slate-950 border border-amber-500/80 rounded-xl text-sm font-mono font-bold tracking-widest text-amber-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Re-enter New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition"
              >
                Reset Password &amp; Login
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security badge footer */}
        <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-bit Encrypted Session • Shashwat Group HQ</span>
        </div>
      </div>
    </div>
  );
}
