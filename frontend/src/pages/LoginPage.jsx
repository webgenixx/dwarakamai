import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successMessage = location.state?.message;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Identifier is required';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: formData.emailOrPhone, 
          email: formData.emailOrPhone, 
          password: formData.password 
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const userData = { id: data.user.id, email: data.user.email, fullName: data.user.name, role: data.user.role, token: data.token };
      login(userData);
      
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(location.state?.from?.pathname || '/', { replace: true });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Invalid credentials' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="flex items-center gap-3">
            <Link to="/" className="w-full">
              <img src="/logo.png" className="h-12 w-auto invert brightness-0" alt="Logo" />
            </Link>
          </div>
          
          <div>
            <h2 className="text-6xl font-display font-bold text-white mb-8 leading-tight">
              Capture <span className="italic font-serif font-medium text-purple-300">Moments</span>,<br />
              Preserve Memories.
            </h2>
            <p className="text-gray-300 font-body text-lg max-w-md">
              Access your personalized gallery and curated selections from your recent studio sessions.
            </p>
          </div>

          <div className="flex items-center gap-4 text-white/50 text-[10px] font-body font-bold uppercase tracking-widest">
            <span>© 2024 Studio</span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Premium Curator</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-20 bg-gray-50/50">
        <div className="w-full max-w-md space-y-12">
          <div>
            <Link to="/">
              <img src="/logo.png" className="h-16 w-auto mb-8" alt="Dwarakamai digital photo studio" />
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">Welcome Back</h1>
            <p className="text-gray-400 font-body">Sign in to your account to continue your journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-body border border-green-100 animate-in fade-in slide-in-from-top-4 duration-500">
                {successMessage}
              </div>
            )}
            {errors.submit && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-body border border-red-100">
                {errors.submit}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Email or Phone</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" />
                  <input
                    name="emailOrPhone"
                    type="text"
                    required
                    value={formData.emailOrPhone}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 font-body text-sm text-gray-700 focus:ring-4 focus:ring-purple-100 focus:border-[var(--color-primary)] transition-all outline-none"
                    placeholder="Enter your email or phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-body font-bold text-[var(--color-primary)] uppercase tracking-widest hover:opacity-70 transition-opacity">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 pr-12 font-body text-sm text-gray-700 focus:ring-4 focus:ring-purple-100 focus:border-[var(--color-primary)] transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4">
              <input 
                type="checkbox" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
              />
              <span className="text-xs font-body text-gray-400">Remember me for 30 days</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="text-center font-body text-sm text-gray-400 mt-8">
              New to the studio?{' '}
              <Link to="/signup" className="text-gray-900 font-bold hover:text-[var(--color-primary)] transition-colors">Create Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

