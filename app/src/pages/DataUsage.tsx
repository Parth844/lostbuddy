import { Link } from 'react-router-dom';
import { 
  ChevronRight, Cpu, AlertTriangle, Shield, Eye,
  CheckCircle, XCircle, Users, FileText, Brain
} from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function DataUsage() {
  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-[#1E6BFF]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#0B1A3E]">Data Usage & AI Disclaimer</span>
          </nav>

          {/* Header */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0B1A3E]">Data Usage & AI Disclaimer</h1>
                <p className="text-gray-500">Understanding how AI is used in Pehchaan</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">Important Notice</p>
                  <p className="text-amber-800">
                    Pehchaan uses artificial intelligence to assist in missing person identification. 
                    However, <strong>AI does not make final decisions</strong>. All potential matches 
                    are reviewed and verified by trained law enforcement officers before any action 
                    is taken.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* How AI Works */}
            <section className="bg-white rounded-[18px] border border-gray-100 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1E6BFF]/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-[#1E6BFF]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#0B1A3E] mb-4">
                    How Our AI Technology Works
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      Pehchaan employs facial recognition technology to analyze photos and identify 
                      potential matches across our database of missing persons. Here's how the process works:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>
                        <strong>Feature Extraction:</strong> When a photo is uploaded, our AI analyzes 
                        facial features and creates a unique mathematical representation (face embedding).
                      </li>
                      <li>
                        <strong>Database Search:</strong> This embedding is compared against embeddings 
                        of all registered cases using similarity algorithms.
                      </li>
                      <li>
                        <strong>Confidence Scoring:</strong> Potential matches are ranked by confidence 
                        score, indicating the degree of similarity.
                      </li>
                      <li>
                        <strong>Human Review:</strong> All matches above a threshold are flagged for 
                        review by authorized officers.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Human Oversight */}
            <section className="bg-white rounded-[18px] border border-gray-100 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#0B1A3E] mb-4">
                    Human-in-the-Loop System
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      We believe that technology should augment, not replace, human judgment. 
                      Our system is designed with multiple layers of human oversight:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-[#0B1A3E]">Case Verification</p>
                          <p className="text-sm text-gray-500">Officers verify all case details before they enter the system</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-[#0B1A3E]">Match Review</p>
                          <p className="text-sm text-gray-500">Every AI-flagged match is reviewed by trained personnel</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-[#0B1A3E]">Approval Required</p>
                          <p className="text-sm text-gray-500">No contact is made to families without officer approval</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-[#0B1A3E]">Audit Trail</p>
                          <p className="text-sm text-gray-500">Every decision is logged with officer identification</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Limitations */}
            <section className="bg-white rounded-[18px] border border-gray-100 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#0B1A3E] mb-4">
                    AI Limitations & Accuracy
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      While our AI system is highly accurate, it's important to understand its limitations:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Not 100% Accurate:</strong> AI can make errors. Similar-looking 
                          individuals may produce false positives.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Image Quality Matters:</strong> Poor lighting, angles, or resolution 
                          can affect accuracy.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Age Changes:</strong> The system may struggle with significant age 
                          differences between photos.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>No Guarantee:</strong> A high confidence score does not guarantee 
                          a correct match.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Bias & Fairness */}
            <section className="bg-white rounded-[18px] border border-gray-100 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#0B1A3E] mb-4">
                    Bias Testing & Fairness
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      We are committed to ensuring our AI system performs fairly across all demographics. 
                      Our approach includes:
                    </p>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Regular Audits:</strong> Quarterly fairness audits by independent 
                          researchers to detect demographic bias.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Diverse Training Data:</strong> Our models are trained on diverse 
                          datasets representing various ethnicities, ages, and genders.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Performance Monitoring:</strong> Continuous monitoring of match 
                          accuracy across different demographic groups.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Transparency Reports:</strong> Published reports on system performance 
                          and fairness metrics.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section className="bg-white rounded-[18px] border border-gray-100 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1E6BFF]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#1E6BFF]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#0B1A3E] mb-4">
                    How We Use Your Data
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      Data uploaded to Pehchaan is used exclusively for missing person identification:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <p className="font-medium text-[#0B1A3E] mb-2">We DO:</p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Use photos for matching missing persons</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Share with authorized law enforcement</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Encrypt and securely store all data</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Delete search photos after 30 days</span>
                          </li>
                        </ul>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <p className="font-medium text-[#0B1A3E] mb-2">We DON'T:</p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>Sell or share data with third parties</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>Use data for advertising</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>Train AI on photos without consent</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>Retain data longer than necessary</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-[#0B1A3E] rounded-[18px] p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Questions or Concerns?
                  </h2>
                  <p className="text-white/70 leading-relaxed mb-4">
                    If you have questions about our AI systems, data usage, or want to 
                    report a concern, please contact our team.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link 
                      to="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E6BFF] text-white font-medium rounded-xl hover:bg-[#1a5fe6] transition-colors"
                    >
                      Contact Us
                    </Link>
                    <Link 
                      to="/privacy"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
