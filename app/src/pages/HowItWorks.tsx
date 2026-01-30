import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Upload, Scan, CheckCircle, Shield, Lock, Users, 
  AlertTriangle, ArrowRight, ChevronRight, FileCheck,
  Database, Eye, Fingerprint, Clock
} from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.step-reveal').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          y: 40,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.1,
          ease: 'power2.out'
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Upload',
      description: 'Submit a photo and basic details about the missing person or potential sighting.',
      details: [
        'Accepts photos from mobile devices and station kiosks',
        'Supports multiple image formats (JPG, PNG)',
        'Automatic quality checks for clarity and lighting',
        'Optional additional photos for better matching',
      ],
      color: 'bg-blue-500',
    },
    {
      number: '02',
      icon: Scan,
      title: 'AI Analysis',
      description: 'Our AI extracts facial features and searches across registered cases.',
      details: [
        'Advanced facial recognition algorithms',
        'Cross-database search in under 2 minutes',
        'Liveness detection to prevent spoofing',
        'Feature extraction with 128-dimensional vectors',
      ],
      color: 'bg-indigo-500',
    },
    {
      number: '03',
      icon: Eye,
      title: 'Human Review',
      description: 'Trained officers review all potential matches before any contact is made.',
      details: [
        'Every match verified by authorized personnel',
        'Confidence thresholds for automatic flagging',
        'Multi-level approval process',
        'Detailed review notes and timestamps',
      ],
      color: 'bg-amber-500',
    },
    {
      number: '04',
      icon: CheckCircle,
      title: 'Resolution',
      description: 'Families are contacted through official channels with verified information.',
      details: [
        'Secure communication through verified channels',
        'Case closure with proper documentation',
        'Follow-up support for families',
        'Continuous system improvement feedback',
      ],
      color: 'bg-green-500',
    },
  ];

  const safeguards = [
    {
      icon: Shield,
      title: 'Human-in-the-Loop',
      description: 'AI assists but never makes final decisions. Every match is verified by trained officers.',
    },
    {
      icon: Lock,
      title: 'Data Protection',
      description: 'End-to-end encryption, strict access controls, and automatic data retention limits.',
    },
    {
      icon: FileCheck,
      title: 'Audit Logging',
      description: 'Every action is logged with timestamps for complete transparency and accountability.',
    },
    {
      icon: Users,
      title: 'Bias Testing',
      description: 'Regular model audits to ensure fair performance across all demographics.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <nav className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
              <Link to="/" className="hover:text-[#1E6BFF]">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#0B1A3E]">How It Works</span>
            </nav>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-[#0B1A3E]">
              How Pehchaan Works
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              A simple, secure, and dignified process to help reunite families. 
              Human oversight at every stage.
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link 
                to="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E6BFF] text-white font-medium rounded-xl hover:bg-[#1a5fe6] transition-colors"
              >
                Search a person
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/report"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-[#0B1A3E] font-medium rounded-xl hover:bg-white transition-colors"
              >
                Report missing person
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section ref={sectionRef} className="py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-16">
              {steps.map((step, index) => (
                <div 
                  key={step.number}
                  className="step-reveal relative"
                >
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-24 w-0.5 h-24 bg-gray-200 hidden lg:block" />
                  )}
                  
                  <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Step Number & Icon */}
                    <div className="lg:col-span-2 flex lg:flex-col items-center lg:items-start gap-4">
                      <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-5xl font-bold text-gray-200 lg:mt-4">{step.number}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="lg:col-span-10 bg-white rounded-[18px] border border-gray-100 p-8 shadow-lg">
                      <h2 className="text-2xl font-bold text-[#0B1A3E] mb-3">{step.title}</h2>
                      <p className="text-gray-600 text-lg mb-6">{step.description}</p>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        {step.details.map((detail, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Disclaimer Section */}
      <section className="py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="step-reveal bg-amber-50 border border-amber-200 rounded-[18px] p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900 mb-2">
                    Important: AI-Assisted, Human-Verified
                  </h3>
                  <p className="text-amber-800 leading-relaxed">
                    Pehchaan's AI system is designed to assist, not replace, human judgment. 
                    All potential matches are reviewed and verified by trained law enforcement 
                    officers before any action is taken. The system provides confidence scores 
                    and supporting evidence, but final decisions always rest with human authorities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safeguards Section */}
      <section className="py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 step-reveal">
              <h2 className="text-3xl font-bold text-[#0B1A3E]">
                Built-in Safeguards
              </h2>
              <p className="mt-4 text-gray-600">
                Multiple layers of protection ensure the system is used responsibly.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {safeguards.map((safeguard, i) => (
                <div 
                  key={i}
                  className="step-reveal bg-white rounded-[18px] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1E6BFF]/10 flex items-center justify-center mb-4">
                    <safeguard.icon className="w-6 h-6 text-[#1E6BFF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B1A3E] mb-2">{safeguard.title}</h3>
                  <p className="text-gray-600">{safeguard.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="step-reveal">
                <h2 className="text-3xl font-bold text-[#0B1A3E] mb-6">
                  Technical Excellence
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Our technology stack is built on proven, enterprise-grade components 
                  that prioritize accuracy, speed, and security.
                </p>
                
                <div className="space-y-6">
                  {[
                    { 
                      icon: Fingerprint, 
                      title: 'Facial Recognition Engine',
                      desc: 'Deep learning-based feature extraction with 99.2% accuracy'
                    },
                    { 
                      icon: Database, 
                      title: 'Secure Data Storage',
                      desc: 'Encrypted at rest and in transit with AES-256'
                    },
                    { 
                      icon: Clock, 
                      title: 'Real-time Processing',
                      desc: 'Average search time under 2 minutes across all databases'
                    },
                    { 
                      icon: Shield, 
                      title: 'Access Control',
                      desc: 'Role-based permissions with multi-factor authentication'
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#F4F6FA] flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-[#1E6BFF]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0B1A3E]">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="step-reveal">
                <div className="bg-[#F4F6FA] rounded-[18px] p-8">
                  <h3 className="text-lg font-bold text-[#0B1A3E] mb-6">System Performance</h3>
                  
                  <div className="space-y-6">
                    {[
                      { label: 'Recognition Accuracy', value: 99.2, color: 'bg-green-500' },
                      { label: 'Search Speed', value: 94, color: 'bg-blue-500' },
                      { label: 'Uptime', value: 99.9, color: 'bg-indigo-500' },
                      { label: 'Data Security', value: 100, color: 'bg-[#1E6BFF]' },
                    ].map((metric, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                          <span className="text-sm font-bold text-[#0B1A3E]">{metric.value}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${metric.color}`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-4xl mx-auto text-center step-reveal">
            <h2 className="text-3xl font-bold text-[#0B1A3E] mb-6">
              Ready to get started?
            </h2>
            <p className="text-gray-600 mb-8">
              Whether you're searching for someone or reporting a missing person, 
              we're here to help.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/search"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1E6BFF] text-white font-medium rounded-xl hover:bg-[#1a5fe6] transition-colors"
              >
                <Upload className="w-5 h-5" />
                Search a person
              </Link>
              <Link 
                to="/report"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0B1A3E] text-white font-medium rounded-xl hover:bg-[#0B1A3E]/90 transition-colors"
              >
                <FileCheck className="w-5 h-5" />
                Report missing person
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
