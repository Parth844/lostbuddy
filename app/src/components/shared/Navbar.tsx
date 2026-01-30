import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  variant?: 'default' | 'navy' | 'transparent';
}

export default function Navbar({ variant = 'default' }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNavy = variant === 'navy';
  const isTransparent = variant === 'transparent';

  const bgClass = isNavy
    ? 'bg-[#0B1A3E] border-white/10'
    : isScrolled && !isTransparent
      ? 'bg-white/95 backdrop-blur-md border-gray-200/50 shadow-sm'
      : isTransparent
        ? 'bg-transparent border-transparent'
        : 'bg-white border-gray-200/50';

  const textClass = isNavy || isTransparent ? 'text-white' : 'text-[#0B1A3E]';
  const textSecondaryClass = isNavy || isTransparent ? 'text-white/70' : 'text-gray-500';

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Find Person', href: '/search' },
    { label: 'View Cases', href: '/cases' },
    { label: 'Report Missing', href: '/report' },
    { label: 'How it works', href: '/how-it-works' },
  ];

  const isActive = (path: string) => {
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.substring(1);
    }
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass} border-b`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className={`text-xl font-bold font-['Sora'] ${textClass}`}>
              Pehchaan
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm font-medium transition-all duration-200 relative group ${isActive(link.href)
                  ? isNavy || isTransparent ? 'text-white' : 'text-[#1E6BFF]'
                  : textSecondaryClass
                  } hover:${textClass}`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isActive(link.href) ? 'w-full' : ''
                  } ${isNavy || isTransparent ? 'bg-white' : 'bg-[#1E6BFF]'}`}></span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">

            {/* Dashboard Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#1E6BFF] hover:bg-blue-50/50 rounded-lg transition-colors border-r border-gray-100 mr-1">
                Dashboards
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 !bg-white">
                <DropdownMenuItem onClick={() => navigate('/dashboard/citizen')}>
                  Citizen Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/police')}>
                  Police Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/admin')}>
                  Admin Dashboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`p-2 rounded-full transition-colors border shadow-sm ${isNavy || isTransparent ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                <User className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 !bg-white">
                <DropdownMenuItem onClick={() => navigate('/login')}>
                  <User className="w-4 h-4 mr-2" />
                  Citizen Login
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/login')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Officer Login
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log('Sign Out')} className="text-red-500 hover:text-red-600 focus:text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${isNavy || isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
          >
            {isMobileMenuOpen ? (
              <X className={`w-5 h-5 ${textClass}`} />
            ) : (
              <Menu className={`w-5 h-5 ${textClass}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${isNavy ? 'border-white/10' : 'border-gray-200/50'}`}>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(link.href)
                    ? isNavy ? 'bg-white/10 text-white' : 'bg-[#1E6BFF]/10 text-[#1E6BFF]'
                    : isNavy ? 'text-white/70 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className={`my-2 border-t ${isNavy ? 'border-white/10' : 'border-gray-200/50'}`} />
              <div className={`my-2 border-t ${isNavy ? 'border-white/10' : 'border-gray-200/50'}`} />
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isNavy ? 'text-white/70 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isNavy ? 'text-white/70 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
