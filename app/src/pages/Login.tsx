import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { login } from '@/services/api';

type UserRole = 'citizen' | 'police' | 'admin';

const roles: { id: UserRole; label: string; icon: typeof User; desc: string }[] = [
  { id: 'citizen', label: 'Citizen',        icon: User,   desc: 'Report & track cases' },
  { id: 'police',  label: 'Law Enforcement', icon: Shield, desc: 'Verify & manage cases' },
  { id: 'admin',   label: 'Administrator',   icon: Lock,   desc: 'System oversight' },
];

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem('token',     res.access_token);
      localStorage.setItem('user_role', res.role);
      localStorage.setItem('user_name', res.name);
      toast.success(`Welcome back, ${res.name}`);
      switch (res.role) {
        case 'citizen': navigate('/dashboard/citizen'); break;
        case 'police':  navigate('/dashboard/police');  break;
        case 'admin':   navigate('/dashboard/admin');   break;
        default:        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <Navbar />

      <div className="flex min-h-screen pt-[60px]">
        {/* Left decorative panel */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-[#0B1A3E] via-[#0F2255] to-[#1a3a7a] p-12 relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <Link to="/" className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <span className="text-white font-bold font-['Sora']">P</span>
            </div>
            <span className="text-white text-xl font-bold font-['Sora']">Pehchaan</span>
          </Link>

          <div className="relative z-10">
            <h2 className="text-white text-3xl font-bold font-['Sora'] leading-tight mb-4">
              Reuniting families<br />with AI-powered<br />search.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Join thousands of citizens and authorities using Pehchaan to find missing persons safely.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[{ val: '12,400+', label: 'Cases' }, { val: '8,200+', label: 'Reunited' }, { val: '99.9%', label: 'Uptime' }].map(s => (
                <div key={s.label}>
                  <p className="text-xl font-bold font-['Sora'] text-white">{s.val}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-white/25 text-xs">© 2026 Pehchaan Initiative</p>
        </div>

        {/* Form panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-[400px]">
            <div className="mb-8">
              <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Welcome back</h1>
              <p className="mt-1 text-sm text-slate-500">Sign in to your Pehchaan account</p>
            </div>

            {/* Role chips */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {roles.map(r => {
                const Icon = r.icon;
                const active = selectedRole === r.id;
                return (
                  <button key={r.id} type="button" onClick={() => setSelectedRole(r.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-150 ${
                      active
                        ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-semibold leading-tight text-center ${active ? 'text-blue-700' : 'text-slate-600'}`}>{r.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input type="email" className="input-field" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input-field pr-11"
                    placeholder="Enter your password" value={password}
                    onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300" />
                  Remember me
                </label>
                <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-2 py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-[0_1px_4px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] border border-blue-600/30 transition-all hover:shadow-[0_4px_12px_rgba(37,99,235,0.4)] hover:-translate-y-px disabled:opacity-60 flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                  : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              No account?{' '}
              <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">Create one free</Link>
            </p>
            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5" /> End-to-end encrypted
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
