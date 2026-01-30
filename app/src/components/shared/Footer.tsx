import { Link } from 'react-router-dom';
import { Shield, Lock, Users, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const productLinks = [
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Technology', href: '/#technology' },
    { label: 'For authorities', href: '/#authorities' },
    { label: 'Case dashboard', href: '/dashboard/citizen' },
  ];

  const resourceLinks = [
    { label: 'Support', href: '/contact' },
    { label: 'Press', href: '/#press' },
    { label: 'Partners', href: '/#partners' },
    { label: 'Contact', href: '/contact' },
  ];

  const legalLinks = [
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Terms of use', href: '/about' },
    { label: 'Data retention', href: '/data-usage' },
    { label: 'Transparency report', href: '/about' },
  ];

  return (
    <footer className="bg-[#0B1A3E] text-white">
      {/* Main Footer */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold font-['Sora']">Pehchaan</span>
            </Link>
            <p className="mt-4 text-white/70 text-sm max-w-sm leading-relaxed">
              Identify with dignity. Reunite with care. Pehchaan uses privacy-first AI 
              to help families and authorities find missing persons—quickly, securely, 
              and with human oversight.
            </p>
            
            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                <Shield className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-xs text-white/80">Human Verified</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                <Lock className="w-3.5 h-3.5 text-[#1E6BFF]" />
                <span className="text-xs text-white/80">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                <Users className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-xs text-white/80">Authority Approved</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Emergency: 112</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Support: 1800-XXX-XXXX</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>support@pehchaan.gov.in</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>State Police HQ, Capital City</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              © 2026 Pehchaan Initiative. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/about" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link to="/data-usage" className="hover:text-white transition-colors">
                Data Usage
              </Link>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#22C55E] rounded-full"></span>
                System Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
