import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, UserPlus, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
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

  const userName = localStorage.getItem('user_name');
  const userRole = localStorage.getItem('user_role');
  const isLoggedIn = !!localStorage.getItem('token');

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNavy = variant === 'navy';
  const isTransparent = variant === 'transparent';
  const isDark = isNavy || isTransparent;

  const bgClass = isNavy
    ? 'bg-[#0B1A3E]/95 backdrop-blur-md border-white/10'
    : isScrolled && !isTransparent
    ? 'bg-white/90 backdrop-blur-md border-slate-200/70 shadow-[0_1px_16px_rgba(15,23,42,0.08)]'
    : isTransparent
    ? 'bg-transparent border-transparent'
    : 'bg-white/80 backdrop-blur-sm border-slate-200/50';

  const navLinks = [
    { label: 'Find Person', href: '/search' },
    { label: 'Browse Cases', href: '/cases' },
    { label: 'Report Missing', href: '/report' },
    { label: 'How it works', href: '/how-it-works' },
  ];

  const isActive = (path: string) =>
    path.startsWith('/#')
      ? location.pathname === '/' && location.hash === path.substring(1)
      : location.pathname === path;

  const dashboardLink =
    userRole === 'admin'
      ? '/dashboard/admin'
      : userRole === 'police'
      ? '/dashboard/police'
      : '/dashboard/citizen';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass} border-b`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm font-['Sora']">P</span>
            </div>
            <span className={`text-[17px] font-bold font-['Sora'] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Pehchaan
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                  isActive(link.href)
                    ? isDark
                      ? 'text-white bg-white/10'
                      : 'text-blue-600 bg-blue-50'
                    : isDark
                    ? 'text-white/70 hover:text-white hover:bg-white/8'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  to={dashboardLink}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                    isDark
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className={`flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-lg text-[13.5px] font-medium transition-all border ${
                    isDark
                      ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-[var(--shadow-xs)]'
                  }`}>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">
                        {userName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    {userName || 'Account'}
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 !bg-white shadow-lg border border-slate-200">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{userRole}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate(dashboardLink)}>
                      <LayoutDashboard className="w-4 h-4 mr-2" /> My Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-600">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                    isDark
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg text-[13.5px] font-semibold text-white transition-all duration-150 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-[0_1px_3px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] border border-blue-600/30"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden py-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200/60'}`}>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? isDark ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'
                      : isDark ? 'text-white/70 hover:bg-white/8' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className={`my-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200/60'}`} />
              {isLoggedIn ? (
                <>
                  <Link to={dashboardLink} onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isDark ? 'text-white/70 hover:bg-white/8' : 'text-slate-600 hover:bg-slate-100'}`}>
                    Dashboard
                  </Link>
                  <button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                    className="px-4 py-2.5 text-sm font-medium rounded-lg text-red-500 hover:bg-red-50 text-left transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isDark ? 'text-white/70 hover:bg-white/8' : 'text-slate-600 hover:bg-slate-100'}`}>
                    Log in
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}
                    className="mx-4 mt-1 py-2.5 text-sm font-semibold text-center rounded-lg text-white bg-gradient-to-b from-blue-500 to-blue-600">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
