import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Key, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      if (import.meta.env.DEV && data.devOTP) {
        setMessage(`OTP sent! (Dev only — OTP: ${data.devOTP})`);
      } else {
        setMessage('OTP sent to your email. Please check your inbox.');
      }
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (formData.otp.length !== 6) { setError('Please enter a valid 6-digit OTP'); return; }
    setError(''); setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setIsSubmitting(true);
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); setIsSubmitting(false); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); setIsSubmitting(false); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      navigate('/login', { state: { message: 'Password reset successful! Please login with your new password.' } });
    } catch (err) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const inputClass = "w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 font-body text-sm text-gray-700 focus:ring-4 focus:ring-purple-100 focus:border-[var(--color-primary)] transition-all outline-none";
  const labelClass = "text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-1";

  const stepLabels = ['Email', 'Verify OTP', 'New Password'];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gray-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Studio Background"
        />
        <div className="relative z-10 p-20 flex flex-col justify-between w-full">
          <Link to="/"><img src="/logo.png" className="h-12 w-auto invert brightness-0" alt="Logo" /></Link>
          <div>
            <h2 className="text-6xl font-display font-bold text-white mb-8 leading-tight">
              Reset Your <span className="italic font-serif font-medium text-purple-300">Password</span><br />
              Securely.
            </h2>
            <div className="space-y-6">
              {['Enter your registered email', 'Verify with the OTP we send', 'Set a strong new password'].map((t, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-200 font-body">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/50 text-[10px] font-body font-bold uppercase tracking-widest">
            <span>© 2024 Studio</span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Secure Reset</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-20 bg-gray-50/50">
        <div className="w-full max-w-md space-y-10">
          <div>
            <Link to="/"><img src="/logo.png" className="h-16 w-auto mb-8" alt="Dwarakamai digital photo studio" /></Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-2">
              {step === 1 && 'Forgot Password?'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'Set New Password'}
            </h1>
            <p className="text-gray-400 font-body text-sm">
              {step === 1 && 'Enter your email to receive a one-time password.'}
              {step === 2 && `Enter the 6-digit code sent to ${formData.email}`}
              {step === 3 && 'Create a strong new password for your account.'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-body font-bold hidden sm:block ${step >= i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                {i < 2 && <div className={`w-6 h-0.5 ${step > i + 1 ? 'bg-gray-900' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Messages */}
          {message && (
            <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-2xl text-xs font-body">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-body">
              {error}
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className={labelClass}>Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" />
                  <input name="email" type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass} placeholder="your@email.com" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group">
                <span>{isSubmitting ? 'Sending OTP...' : 'Send OTP'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-xs font-body font-bold text-gray-400 hover:text-[var(--color-primary)] transition-colors uppercase tracking-widest">
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>
              </p>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label className={labelClass}>6-Digit OTP</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" />
                  <input name="otp" type="text" required maxLength={6} autoFocus
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 font-body text-xl text-center tracking-[0.5em] text-gray-700 focus:ring-4 focus:ring-purple-100 focus:border-[var(--color-primary)] transition-all outline-none"
                    placeholder="000000" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-2xl font-body font-bold text-sm hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button type="submit"
                  className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-xl active:scale-95">
                  Verify OTP
                </button>
              </div>

              <p className="text-center">
                <button type="button" onClick={handleSendOTP} disabled={isSubmitting}
                  className="text-xs font-body font-bold text-[var(--color-primary)] hover:underline disabled:opacity-50 uppercase tracking-widest">
                  Resend OTP
                </button>
              </p>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className={labelClass}>New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" />
                  <input name="password" type={showPassword ? 'text' : 'password'} required autoFocus
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`${inputClass} pr-12`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" />
                  <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`${inputClass} pr-12`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-2xl font-body font-bold text-sm hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-xl active:scale-95 disabled:opacity-50">
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
