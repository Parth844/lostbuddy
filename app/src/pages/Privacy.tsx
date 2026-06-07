import { Link } from 'react-router-dom';
import { 
  ChevronRight, Lock, Shield, Eye, Database, 
  Clock, UserCheck, FileText
} from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function Privacy() {
  const sections = [
    {
      id: 'collection',
      title: 'Information We Collect',
      icon: Database,
      content: `
        We collect information necessary to help find missing persons and maintain 
        the security of our platform:
        
        <strong>Case Information:</strong> Details about missing persons including 
        name, age, physical description, last known location, and photographs.
        
        <strong>Reporter Information:</strong> Contact details of persons reporting 
        cases, including name, phone number, and email address.
        
        <strong>User Account Information:</strong> For registered users, we collect 
        login credentials and profile information.
        
        <strong>Technical Data:</strong> IP addresses, browser information, and usage 
        logs for security and system improvement.
      `
    },
    {
      id: 'usage',
      title: 'How We Use Information',
      icon: Eye,
      content: `
        We use collected information solely for the following purposes:
        
        <strong>Case Matching:</strong> Photos and descriptions are used by our AI 
        system to identify potential matches across reported cases.
        
        <strong>Communication:</strong> Contact information is used to update reporters 
        on case status and coordinate with law enforcement.
        
        <strong>Verification:</strong> Information is verified by authorized officers 
        before any action is taken.
        
        <strong>System Improvement:</strong> Anonymized data helps us improve our 
        technology and user experience.
        
        <strong>Legal Compliance:</strong> Data may be used to comply with legal 
        obligations and court orders.
      `
    },
    {
      id: 'protection',
      title: 'Data Protection',
      icon: Lock,
      content: `
        We implement comprehensive security measures to protect your data:
        
        <strong>Encryption:</strong> All data is encrypted in transit using TLS 1.3 
        and at rest using AES-256 encryption.
        
        <strong>Access Control:</strong> Role-based access ensures only authorized 
        personnel can view sensitive information.
        
        <strong>Audit Logging:</strong> Every access to case data is logged with 
        timestamps and user identification.
        
        <strong>Regular Security Audits:</strong> Independent security firms conduct 
        regular penetration testing and vulnerability assessments.
        
        <strong>Secure Infrastructure:</strong> Our servers are hosted in ISO 27001 
        certified data centers.
      `
    },
    {
      id: 'retention',
      title: 'Data Retention',
      icon: Clock,
      content: `
        We retain data only as long as necessary:
        
        <strong>Active Cases:</strong> Data is retained until the case is resolved 
        and officially closed.
        
        <strong>Closed Cases:</strong> After case closure, data is archived for 
        2 years for legal and administrative purposes.
        
        <strong>Search Photos:</strong> Photos uploaded for search purposes are 
        automatically deleted after 30 days.
        
        <strong>User Accounts:</strong> Account data is retained until the user 
        requests deletion or the account is inactive for 3 years.
        
        <strong>Audit Logs:</strong> Security logs are retained for 5 years for 
        compliance purposes.
      `
    },
    {
      id: 'rights',
      title: 'Your Rights',
      icon: UserCheck,
      content: `
        You have the following rights regarding your data:
        
        <strong>Access:</strong> You can request a copy of all data we hold about you 
        or your reported cases.
        
        <strong>Correction:</strong> You can request corrections to inaccurate or 
        incomplete information.
        
        <strong>Deletion:</strong> You can request deletion of your personal data, 
        subject to legal retention requirements.
        
        <strong>Restriction:</strong> You can request restriction of processing in 
        certain circumstances.
        
        <strong>Portability:</strong> You can request your data in a structured, 
        machine-readable format.
        
        To exercise these rights, contact us at privacy@pehchaan.gov.in
      `
    },
    {
      id: 'sharing',
      title: 'Information Sharing',
      icon: Shield,
      content: `
        We share information only under these circumstances:
        
        <strong>Law Enforcement:</strong> Case information is shared with authorized 
        police officers for verification and investigation.
        
        <strong>Legal Requirements:</strong> We may disclose information when required 
        by law, court order, or government request.
        
        <strong>Service Providers:</strong> Trusted third-party providers may access 
        data solely for providing services (hosting, security).
        
        <strong>We Never:</strong> Sell your data, use it for advertising, or share 
        it with unauthorized parties.
      `
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-[#1E6BFF]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#0B1A3E]">Privacy Policy</span>
          </nav>

          {/* Header */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#1E6BFF]/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#1E6BFF]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0B1A3E]">Privacy Policy</h1>
                <p className="text-gray-500">Last updated: January 2026</p>
              </div>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed mt-6">
              At Pehchaan, we take your privacy seriously. This policy explains how we 
              collect, use, protect, and retain your information. We are committed to 
              transparency and protecting the dignity and rights of all individuals 
              involved in our platform.
            </p>
          </div>

          {/* Quick Links */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-[#0B1A3E] mb-4">Quick Navigation</h3>
              <div className="flex flex-wrap gap-3">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-[#1E6BFF]/10 hover:text-[#1E6BFF] transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="bg-white rounded-[18px] border border-gray-100 p-8 scroll-mt-24"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1E6BFF]/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-[#1E6BFF]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#0B1A3E] mb-4">
                      {section.title}
                    </h2>
                    <div 
                      className="text-gray-600 leading-relaxed space-y-3"
                      dangerouslySetInnerHTML={{
                        __html: section.content
                          .split('\n\n')
                          .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
                          .join('')
                      }}
                    />
                  </div>
                </div>
              </section>
            ))}

            {/* Contact Section */}
            <section className="bg-[#0B1A3E] rounded-[18px] p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Contact Us
                  </h2>
                  <p className="text-white/70 leading-relaxed mb-4">
                    If you have any questions about this Privacy Policy or how we handle 
                    your data, please contact us:
                  </p>
                  <div className="space-y-2 text-white/70">
                    <p><strong>Email:</strong> privacy@pehchaan.gov.in</p>
                    <p><strong>Address:</strong> State Police HQ, Data Protection Office, Capital City</p>
                    <p><strong>Response Time:</strong> We aim to respond within 48 hours</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Updates Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Policy Updates</h3>
                  <p className="text-sm text-amber-800">
                    We may update this Privacy Policy from time to time. Any changes will 
                    be posted on this page with an updated revision date. We encourage you 
                    to review this policy periodically.
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
