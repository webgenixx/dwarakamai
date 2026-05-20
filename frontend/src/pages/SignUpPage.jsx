import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import PhoneInput from '../components/PhoneInput';
import { useAuth } from '../context/AuthContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1 = account info, 2 = address
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '+91', password: '', confirmPassword: '', acceptTerms: false,
    address_line1: '', address_landmark: '', address_city: '', address_state: '', address_pincode: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep1 = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = 'Full name is required';
    if (!formData.phone || formData.phone === '+91') e.phone = 'Phone number is required';
    if (!formData.password) e.password = 'Password is required';
    if (formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!formData.acceptTerms) e.acceptTerms = 'Please accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!formData.address_line1.trim()) e.address_line1 = 'Address is required';
    if (!formData.address_city.trim()) e.address_city = 'City is required';
    if (!formData.address_state.trim()) e.address_state = 'State is required';
    if (!formData.address_pincode.trim()) e.address_pincode = 'Pincode is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
          phone: formData.phone,
          address: {
            line1:    formData.address_line1,
            landmark: formData.address_landmark,
            city:     formData.address_city,
            state:    formData.address_state,
            pincode:  formData.address_pincode,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/', { state: { message: 'Account created successfully! Welcome to the studio.' } });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 font-body text-sm text-gray-700 focus:ring-4 focus:ring-purple-100 focus:border-[var(--color-primary)] transition-all outline-none";
  const inputClassNoIcon = "w-full bg-white border border-gray-100 rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-4 focus:ring-purple-100 focus:border-[var(--color-primary)] transition-all outline-none";
  const labelClass = "text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-1";
  const errorClass = "text-xs text-red-500 ml-1 mt-1";

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gray-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2000&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Studio Equipment"
        />
        <div className="relative z-10 p-20 flex flex-col justify-between w-full">
          <Link to="/"><img src="/logo.png" className="h-12 w-auto invert brightness-0" alt="Logo" /></Link>
          <div>
            <h2 className="text-6xl font-display font-bold text-white mb-8 leading-tight">
              Begin Your <span className="italic font-serif font-medium text-purple-300">Creative</span><br />Journey With Us.
            </h2>
            <div className="space-y-6">
              {["Exclusive access to private galleries","Priority booking for studio sessions","Curated gift selections & offers","Seamless order tracking"].map((b, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-200 font-body">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" /><span>{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/50 text-[10px] font-body font-bold uppercase tracking-widest">
            <span>© 2024 Studio</span><div className="w-1 h-1 bg-white/20 rounded-full" /><span>Join The Community</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-20 bg-gray-50/50 overflow-y-auto">
        <div className="w-full max-w-md space-y-10 py-4">
          <div>
            <Link to="/"><img src="/logo.png" className="h-16 w-auto mb-8" alt="Dwarakamai digital photo studio" /></Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-400 font-body text-sm">Join our curated community of sentimental curators.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</div>
                <span className={`text-xs font-body font-bold ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>{s === 1 ? 'Account Info' : 'Delivery Address'}</span>
                {s < 2 && <div className={`w-8 h-0.5 ${step > s ? 'bg-gray-900' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {errors.submit && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-body border border-red-100">{errors.submit}</div>
          )}

          {/* ── STEP 1: Account Info ── */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div className="space-y-2">
                <label className={labelClass}>Full Name *</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" />
                  <input name="fullName" type="text" required value={formData.fullName} onChange={handleChange} className={inputClass} placeholder="Enter your name" />
                </div>
                {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Email Address (Optional)</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="your@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Phone Number *</label>
                <PhoneInput
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="98765 43210"
                />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>Password *</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className={`${inputClass} pr-12`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className={errorClass}>{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Confirm *</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" />
                    <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} className={`${inputClass} pr-12`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3 px-1">
                <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                <span className="text-xs font-body text-gray-400 leading-relaxed">
                  I agree to the <Link to="/terms" className="text-gray-900 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-gray-900 font-bold hover:underline">Privacy Policy</Link>.
                </span>
              </div>
              {errors.acceptTerms && <p className={errorClass}>{errors.acceptTerms}</p>}

              <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group">
                <span>Next: Add Address</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="text-center font-body text-sm text-gray-400">
                Already a member?{' '}
                <Link to="/login" className="text-gray-900 font-bold hover:text-[var(--color-primary)] transition-colors">Sign In</Link>
              </p>
            </form>
          )}

          {/* ── STEP 2: Delivery Address ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                <p className="text-sm font-body text-gray-500">This will be used as your default delivery address.</p>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Address Line *</label>
                <input name="address_line1" type="text" required value={formData.address_line1} onChange={handleChange} className={inputClassNoIcon} placeholder="House no., Street, Area" />
                {errors.address_line1 && <p className={errorClass}>{errors.address_line1}</p>}
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Landmark (Optional)</label>
                <input name="address_landmark" type="text" value={formData.address_landmark} onChange={handleChange} className={inputClassNoIcon} placeholder="Near school, temple, etc." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>City *</label>
                  <input name="address_city" type="text" required value={formData.address_city} onChange={handleChange} className={inputClassNoIcon} placeholder="City" />
                  {errors.address_city && <p className={errorClass}>{errors.address_city}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>State *</label>
                  <input name="address_state" type="text" required value={formData.address_state} onChange={handleChange} className={inputClassNoIcon} placeholder="State" />
                  {errors.address_state && <p className={errorClass}>{errors.address_state}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Pincode *</label>
                <input name="address_pincode" type="text" required value={formData.address_pincode} onChange={handleChange} className={inputClassNoIcon} placeholder="6-digit pincode" maxLength={6} />
                {errors.address_pincode && <p className={errorClass}>{errors.address_pincode}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-2xl font-body font-bold text-sm hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group">
                  <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
