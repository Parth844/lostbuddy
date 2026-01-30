import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, User, Lock, Eye, EyeOff, ChevronRight,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { login } from '@/services/api';

type UserRole = 'citizen' | 'police' | 'admin';

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roles: { id: UserRole; label: string; description: string; icon: typeof User }[] = [
    {
      id: 'citizen',
      label: 'Citizen',
      description: 'Track cases and manage reports',
      icon: User,
    },
    {
      id: 'police',
      label: 'Law Enforcement',
      description: 'Review and verify cases',
      icon: Shield,
    },
    {
      id: 'admin',
      label: 'Administrator',
      description: 'System management and oversight',
      icon: Lock,
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(email, password);

      // Store token
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user_role', response.role);
      localStorage.setItem('user_name', response.name);

      setIsLoading(false);
      toast.success(`Logged in as ${response.role}`);

      // Redirect based on role
      switch (response.role) {
        case 'citizen':
          navigate('/dashboard/citizen');
          break;
        case 'police':
          navigate('/dashboard/police');
          break;
        case 'admin':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0B1A3E]">Welcome Back</h1>
              <p className="mt-2 text-gray-600">
                Sign in to access your Pehchaan account
              </p>
            </div>

            {/* Role Selection */}
            <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-6 mb-6">
              <label className="label">Select your role</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="input-field !pl-12 !pr-12 appearance-none bg-white"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90" />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {roles.find(r => r.id === selectedRole)?.description}
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-12"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <Link to="/contact" className="text-[#1E6BFF] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1E6BFF] py-6"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-[#1E6BFF] font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Secure, encrypted connection</span>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Demo Credentials</p>
                  <p className="text-sm text-amber-800 mt-1">
                    This is a demo interface. Click "Sign In" with any email/password
                    to access the {selectedRole} dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
