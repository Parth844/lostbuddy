import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, User, Lock, Eye, EyeOff, ChevronRight,
  AlertCircle, Mail, Phone
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';

type UserRole = 'citizen' | 'police';

export default function Signup() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const roles: { id: UserRole; label: string; description: string; icon: typeof User }[] = [
    {
      id: 'citizen',
      label: 'Citizen',
      description: 'Report missing persons and track cases',
      icon: User,
    },
    {
      id: 'police',
      label: 'Law Enforcement',
      description: 'Verify cases and manage matches (requires verification)',
      icon: Shield,
    },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    // Simulate signup
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
    toast.success('Account created successfully!');

    // Redirect based on role
    if (selectedRole === 'citizen') {
      navigate('/dashboard/citizen');
    } else {
      navigate('/dashboard/police');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0B1A3E]">Create Account</h1>
              <p className="mt-2 text-gray-600">
                Join Pehchaan to help reunite families
              </p>
            </div>

            {/* Role Selection */}
            <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-6 mb-6">
              <p className="text-sm font-medium text-gray-500 mb-4">I am a...</p>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedRole === role.id
                        ? 'border-[#1E6BFF] bg-[#1E6BFF]/5'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedRole === role.id
                        ? 'bg-[#1E6BFF] text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <role.icon className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold text-sm ${
                        selectedRole === role.id ? 'text-[#0B1A3E]' : 'text-gray-700'
                      }`}>
                        {role.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                {roles.find(r => r.id === selectedRole)?.description}
              </p>
            </div>

            {/* Signup Form */}
            <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="First"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Last"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      className="input-field pl-11"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      className="input-field pl-11"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pl-11 pr-12"
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
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

                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pl-11"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1 rounded border-gray-300"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/about" className="text-[#1E6BFF] hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-[#1E6BFF] hover:underline">Privacy Policy</Link>
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1E6BFF] py-6"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#1E6BFF] font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Your information is securely encrypted</span>
            </div>

            {/* Demo Notice */}
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Demo Registration</p>
                  <p className="text-sm text-amber-800 mt-1">
                    This is a demo interface. Fill in any information and click 
                    "Create Account" to access the dashboard.
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
