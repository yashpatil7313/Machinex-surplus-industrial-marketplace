import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cog, Lock, Mail, ArrowRight, ShieldCheck, Factory, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'seller') navigate('/seller/dashboard');
      else navigate('/buyer/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-md shadow-orange-600/20">
              <Cog className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900">MACHINE<span className="text-orange-500">X</span></span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Your Account</h2>
          <p className="text-xs text-slate-500">Access your surplus inventory, requests, or administrative controls</p>
        </div>

        {/* Demo Accounts Quick-Fill Box for Viva */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Demo Login Shortcuts</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Viva Demonstration</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@machinex.com', 'admin123')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500 text-left transition-all group"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400 mb-1" />
              <p className="text-[11px] font-bold text-white leading-tight">Admin</p>
              <p className="text-[9px] text-slate-400">Full System</p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('seller@industrialequip.com', 'seller123')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-amber-900/40 border border-slate-700 hover:border-amber-500 text-left transition-all group"
            >
              <Factory className="w-4 h-4 text-amber-400 mb-1" />
              <p className="text-[11px] font-bold text-white leading-tight">Seller</p>
              <p className="text-[9px] text-slate-400">Apex Industrials</p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('buyer@precisionmfg.com', 'buyer123')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-sky-900/40 border border-slate-700 hover:border-sky-500 text-left transition-all group"
            >
              <ShoppingCart className="w-4 h-4 text-sky-400 mb-1" />
              <p className="text-[11px] font-bold text-white leading-tight">Buyer</p>
              <p className="text-[9px] text-slate-400">Precision Mfg</p>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-subtle">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
                <span className="text-[11px] text-orange-600 font-medium">Demo pass: admin123 / seller123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an industrial account?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
