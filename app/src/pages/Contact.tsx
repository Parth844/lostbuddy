import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, Phone, Mail, MapPin, Clock, 
  AlertCircle, Send, CheckCircle, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    role: 'citizen',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Message sent successfully!');
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Emergency Helpline',
      value: '112',
      description: 'For immediate emergencies',
      color: 'bg-red-100 text-red-600',
    },
    {
      icon: Phone,
      title: 'Support Line',
      value: '1800-XXX-XXXX',
      description: 'Mon-Sat, 9 AM - 6 PM',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Mail,
      title: 'Email Support',
      value: 'support@pehchaan.gov.in',
      description: 'We respond within 24-48 hours',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: MapPin,
      title: 'Office Address',
      value: 'State Police HQ',
      description: 'Capital City, State - 110001',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const faqs = [
    {
      question: 'How do I report a missing person?',
      answer: 'You can report a missing person by clicking "Report Missing Person" on our homepage or navigating to the Report page. You\'ll need to provide personal details, last seen information, and optionally a photo.',
    },
    {
      question: 'How can I check the status of my case?',
      answer: 'Use the "Track Case" feature and enter your Case ID. You\'ll be able to see the current status and timeline of your case.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, all data is encrypted end-to-end and stored securely. We never sell or share your data with third parties. Read our Privacy Policy for more details.',
    },
    {
      question: 'How does the AI matching work?',
      answer: 'Our AI analyzes facial features from uploaded photos and compares them against our database. However, all potential matches are verified by human officers before any action is taken.',
    },
    {
      question: 'I lost my Case ID. What should I do?',
      answer: 'Contact our support line with your details. We can help retrieve your Case ID after verifying your identity.',
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
            <span className="text-[#0B1A3E]">Contact Support</span>
          </nav>

          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold text-[#0B1A3E] mb-4">
              We're Here to Help
            </h1>
            <p className="text-lg text-gray-600">
              Have a question or need assistance? Reach out to us through any of the 
              channels below or fill out the contact form.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, i) => (
              <div key={i} className="bg-white rounded-[18px] border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-xl ${method.color} flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-[#0B1A3E] mb-1">{method.title}</h3>
                <p className="text-lg font-bold text-[#0B1A3E] mb-1">{method.value}</p>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-8">
              {!submitted ? (
                <>
                  <h2 className="text-2xl font-bold text-[#0B1A3E] mb-2">Send us a Message</h2>
                  <p className="text-gray-600 mb-6">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Your Name *</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Full name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Email Address *</label>
                        <input
                          type="email"
                          className="input-field"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Phone Number</label>
                        <input
                          type="tel"
                          className="input-field"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">I am a...</label>
                        <select
                          className="input-field"
                          value={formData.role}
                          onChange={(e) => handleChange('role', e.target.value)}
                        >
                          <option value="citizen">Citizen</option>
                          <option value="police">Law Enforcement</option>
                          <option value="media">Media</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label">Subject</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="label">Message *</label>
                      <textarea
                        className="input-field min-h-[150px]"
                        placeholder="How can we help you?"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#1E6BFF] py-6"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0B1A3E] mb-2">Message Sent!</h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for reaching out. We'll get back to you within 24-48 hours.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        subject: '',
                        message: '',
                        role: 'citizen',
                      });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              )}
            </div>

            {/* FAQs */}
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">For Emergencies</p>
                    <p className="text-sm text-amber-800">
                      If this is an emergency, please call <strong>112</strong> immediately. 
                      Do not wait for a response through this form.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[18px] border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-[#1E6BFF]" />
                  <h2 className="text-xl font-bold text-[#0B1A3E]">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <h3 className="font-medium text-[#0B1A3E] mb-2">{faq.question}</h3>
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <Link 
                  to="/how-it-works"
                  className="inline-flex items-center gap-2 mt-6 text-[#1E6BFF] font-medium hover:underline"
                >
                  View all FAQs
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Response Time */}
              <div className="bg-white rounded-[18px] border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-bold text-[#0B1A3E]">Response Times</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Emergency (112)</span>
                    <span className="font-medium text-[#0B1A3E]">Immediate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Phone Support</span>
                    <span className="font-medium text-[#0B1A3E]">Same day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email/Form</span>
                    <span className="font-medium text-[#0B1A3E]">24-48 hours</span>
                  </div>
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
