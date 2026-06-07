import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Lock, Eye, EyeOff, Mail, Phone, Upload, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { register } from '@/services/api';

type UserRole = 'citizen' | 'police';

export default function Signup() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [photo, setPhoto]           = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [agreed, setAgreed]         = useState(false);

  const handleChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) { toast.error('Please enter your full name'); return; }
    if (!formData.email.trim()) { toast.error('Please enter your email'); return; }
    if (!formData.phone.trim()) { toast.error('Please enter your phone'); return; }
    if (formData.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!agreed) { toast.error('Please agree to the terms'); return; }

    setLoading(true);
    try {
      const res = await register({
        first_name: formData.firstName, last_name: formData.lastName,
        email: formData.email, phone: formData.phone,
        password: formData.password, role: selectedRole, photo,
      });
      localStorage.setItem('token',     res.access_token);
      localStorage.setItem('user_role', res.role);
      localStorage.setItem('user_name', res.name);
      toast.success('Account created!');
      navigate(res.role === 'citizen' ? '/dashboard/citizen' : '/dashboard/police');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 409 && detail === 'UPGRADE_REQUESTED_POLICE') {
        toast.success('Police upgrade requested. Await admin approval.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <Navbar />

      <div className="flex min-h-screen pt-[60px]">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-[38%] bg-gradient-to-br from-[#0B1A3E] via-[#0F2255] to-[#1a3a7a] p-12 relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <Link to="/" className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <span className="text-white font-bold font-['Sora']">P</span>
            </div>
            <span className="text-white text-xl font-bold font-['Sora']">Pehchaan</span>
          </Link>
          <div className="relative z-10">
            <h2 className="text-white text-3xl font-bold font-['Sora'] leading-tight mb-4">
              Every report<br />brings someone<br />closer to home.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Create your account and start helping families reconnect with loved ones.
            </p>
          </div>
          <p className="relative z-10 text-white/25 text-xs">© 2026 Pehchaan Initiative</p>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-16 overflow-y-auto">
          <div className="w-full max-w-[480px]">
            <div className="mb-8">
              <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Create your account</h1>
              <p className="mt-1 text-sm text-slate-500">Join Pehchaan to help reunite families</p>
            </div>

            {/* Role cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {([
                { id: 'citizen' as UserRole, label: 'Citizen', icon: User, desc: 'Report cases & track progress' },
                { id: 'police'  as UserRole, label: 'Law Enforcement', icon: Shield, desc: 'Verify cases (needs approval)' },
              ]).map(r => {
                const Icon = r.icon;
                const active = selectedRole === r.id;
                return (
                  <button key={r.id} type="button" onClick={() => setSelectedRole(r.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-150 ${
                      active ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]'
                             : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${active ? 'text-blue-700' : 'text-slate-800'}`}>{r.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
                <div className="w-16 h-16 rounded-xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {photoPreview
                    ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                    : <User className="w-7 h-7 text-slate-400" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Profile photo</p>
                  <p className="text-xs text-slate-400 mt-0.5">Optional · JPG or PNG up to 5 MB</p>
                  <div className="flex gap-2 mt-2">
                    <label htmlFor="photo-upload" className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </label>
                    {photoPreview && (
                      <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                        className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                  <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First name</label>
                  <input type="text" className="input-field" placeholder="First"
                    value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="label">Last name</label>
                  <input type="text" className="input-field" placeholder="Last"
                    value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" className="input-field !pl-10" placeholder="you@example.com"
                    value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Phone number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" className="input-field !pl-10" placeholder="+91 XXXXX XXXXX"
                    value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} className="input-field !pl-10 pr-11"
                    placeholder="At least 8 characters" value={formData.password}
                    onChange={e => handleChange('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} className="input-field !pl-10"
                    placeholder="Confirm your password" value={formData.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)} />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input type="checkbox" className="mt-0.5 rounded border-slate-300"
                  checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span className="text-sm text-slate-600">
                  I agree to the{' '}
                  <Link to="/about" className="text-blue-600 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-[0_1px_4px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] border border-blue-600/30 transition-all hover:shadow-[0_4px_12px_rgba(37,99,235,0.4)] hover:-translate-y-px disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
                  : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
