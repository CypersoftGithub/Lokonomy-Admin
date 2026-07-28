import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, BarChart3, Building2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../assets/lokonomy.svg';
import { API_BASE_URL } from '../config';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result && result.status === true) {
        localStorage.setItem('lokonomy_admin_token', result.data.access_token);
        localStorage.setItem('lokonomy_admin_user', JSON.stringify({
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
        }));
        toast.success(`Welcome back, ${result.data.name || 'Super Admin'}!`);
        navigate('/');
      } else {
        const errorVal = result?.error || result?.message;
        const errMsg = typeof errorVal === 'object' ? (errorVal.message || JSON.stringify(errorVal)) : errorVal;
        toast.error(errMsg || 'Invalid email or password !');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col items-center justify-center p-12" style={{ background: 'linear-gradient(135deg, #f68e4c 0%, #e5782e 50%, #d9671c 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="float-anim inline-block mb-8 bg-white/15 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/20 shadow-2xl">
            <img src={logo} alt="Lokonomy" className="h-12 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">Lokonomy</h1>
          <p className="text-white/80 text-xl leading-relaxed mb-12">
            Manage your entire business ecosystem from one powerful place
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Building2, value: '3,241', label: 'Businesses' },
              { icon: Users, value: '12,847', label: 'App Users' },
              { icon: BarChart3, value: '₹48L+', label: 'Revenue' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <Icon size={22} className="text-white/70 mx-auto mb-2" />
                <p className="text-white font-bold text-lg">{value}</p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={logo} alt="Lokonomy" className="h-10 object-contain" />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-1">Welcome Back! 👋</h2>
          <p className="text-gray-400 mb-8">Admin Panel Login — Enter your credentials to continue</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@lokonomy.com"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-500">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Login to Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            🔒 Secured with end-to-end encryption • Lokonomy v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
