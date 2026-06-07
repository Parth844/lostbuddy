import { Link } from 'react-router-dom';
import { 
  Shield, Users, Lock, CheckCircle, ChevronRight,
  Target, Heart, Phone, Mail
} from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function About() {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We maintain the highest standards of data protection and system security.',
    },
    {
      icon: Heart,
      title: 'Dignity & Respect',
      description: 'Every person deserves to be treated with dignity throughout the process.',
    },
    {
      icon: Users,
      title: 'Human Oversight',
      description: 'AI assists, but humans make all critical decisions.',
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Data is encrypted, access-controlled, and never sold or misused.',
    },
  ];

  const team = [
    {
      name: 'State Police HQ',
      role: 'Law Enforcement Partner',
      description: 'Primary law enforcement partner overseeing case verification.',
    },
    {
      name: 'Cyber Forensics Institute',
      role: 'Technical Partner',
      description: 'Provides technical expertise in AI and data security.',
    },
    {
      name: 'Civic Aid Foundation',
      role: 'NGO Partner',
      description: 'Supports families and provides crisis response services.',
    },
    {
      name: 'University AI Ethics Lab',
      role: 'Research Partner',
      description: 'Conducts bias testing and fairness audits of our AI systems.',
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
            <span className="text-[#0B1A3E]">About Us</span>
          </nav>

          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h1 className="text-4xl lg:text-5xl font-bold text-[#0B1A3E] mb-6">
              About Pehchaan
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Pehchaan is an AI-assisted missing person identification and case-tracking 
              platform designed to help families and law enforcement work together to 
              find missing persons quickly, securely, and with dignity.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E6BFF]/10 rounded-full mb-6">
                <Target className="w-4 h-4 text-[#1E6BFF]" />
                <span className="text-sm font-medium text-[#1E6BFF]">Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold text-[#0B1A3E] mb-4">
                Reuniting Families with Technology and Care
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Every year, thousands of people go missing across the country. Traditional 
                methods of searching can be slow and inefficient. Pehchaan bridges this gap 
                by leveraging advanced AI technology while maintaining the human touch that's 
                essential in such sensitive situations.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our platform serves as a secure bridge between concerned families, vigilant 
                citizens, and dedicated law enforcement officers—all working together toward 
                a common goal: bringing loved ones home.
              </p>
            </div>
            <div className="bg-white rounded-[18px] border border-gray-100 p-8 shadow-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#1E6BFF]">12,400+</p>
                  <p className="text-sm text-gray-500 mt-1">Cases Registered</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">8,200+</p>
                  <p className="text-sm text-gray-500 mt-1">Matches Reviewed</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-600">180+</p>
                  <p className="text-sm text-gray-500 mt-1">Connected Stations</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-600">&lt;2 min</p>
                  <p className="text-sm text-gray-500 mt-1">Avg Search Time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-[#0B1A3E]">Our Core Values</h2>
              <p className="mt-4 text-gray-600">
                The principles that guide everything we do at Pehchaan.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                <div key={i} className="bg-white rounded-[18px] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-[#1E6BFF]/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-[#1E6BFF]" />
                  </div>
                  <h3 className="font-bold text-[#0B1A3E] mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How We're Different */}
          <div className="bg-white rounded-[18px] border border-gray-100 p-8 lg:p-12 mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#0B1A3E] mb-6">
                  How We're Different
                </h2>
                <div className="space-y-4">
                  {[
                    'Human-in-the-loop verification for all matches',
                    'End-to-end encryption for all data',
                    'Strict access controls and audit logging',
                    'Regular bias testing and fairness audits',
                    'Transparent data retention policies',
                    'Collaboration with law enforcement, not replacement',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#F4F6FA] rounded-xl p-8">
                <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                  "Technology should serve humanity, not the other way around. At Pehchaan, 
                  we use AI as a tool to augment human capability, not replace human judgment."
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1E6BFF]/10 flex items-center justify-center">
                    <span className="text-[#1E6BFF] font-semibold">SP</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#0B1A3E]">State Police HQ</p>
                    <p className="text-sm text-gray-500">Partner Organization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partners Section */}
          <div className="mb-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-[#0B1A3E]">Our Partners</h2>
              <p className="mt-4 text-gray-600">
                Built in collaboration with leading institutions.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((partner, i) => (
                <div key={i} className="bg-white rounded-[18px] border border-gray-100 p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#1E6BFF]/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1E6BFF] font-bold text-lg">
                      {partner.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#0B1A3E] mb-1">{partner.name}</h3>
                  <p className="text-sm text-[#1E6BFF] mb-3">{partner.role}</p>
                  <p className="text-sm text-gray-600">{partner.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-[#0B1A3E] rounded-[18px] p-8 lg:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Have questions about Pehchaan? Want to partner with us? 
              We'd love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E6BFF] text-white font-medium rounded-xl hover:bg-[#1a5fe6] transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Us
              </Link>
              <a 
                href="tel:1800-XXX-XXXX"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4" />
                1800-XXX-XXXX
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
