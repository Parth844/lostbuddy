import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Clock, Shield, User, MapPin,
  Calendar, FileText, ChevronRight, AlertCircle,
  RefreshCw, Copy, Check, Phone, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getCaseById, getCaseTimeline, type Case, type TimelineEvent } from '@/services/api';

export default function TrackCase() {
  const [searchParams] = useSearchParams();
  const [caseId, setCaseId] = useState(searchParams.get('id') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setCaseId(id);
      handleSearch(id);
    }
  }, [searchParams]);

  const handleSearch = async (id: string = caseId) => {
    if (!id.trim()) {
      toast.error('Please enter a case ID');
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    setCaseData(null);

    try {
      const data = await getCaseById(id.trim());
      setCaseData(data);
      // Fetch timeline
      try {
        const events = await getCaseTimeline(id.trim());
        setTimelineEvents(events);
      } catch (e) {
        console.error("Failed to load timeline", e);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error('Failed to fetch case. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const copyCaseId = () => {
    if (caseData) {
      navigator.clipboard.writeText(caseData.case_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Case ID copied to clipboard');
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Your case has been received and is awaiting verification.';
      case 'verified':
        return 'Case information has been verified. Preparing for search.';
      case 'under-review':
        return 'Case is actively being reviewed by authorities with AI assistance.';
      case 'matched':
        return 'Potential matches have been found and are being verified.';
      case 'closed':
        return 'Case has been resolved and closed.';
      default:
        return 'Case status is being updated.';
    }
  };

  // getTimeline removed, using server data


  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-[#1E6BFF]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#0B1A3E]">Track Case</span>
          </nav>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                Track Your Case
              </h1>
              <p className="mt-4 text-gray-600">
                Enter your case ID to check the status and progress of your report.
              </p>
            </div>

            {/* Search Box */}
            <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-8 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter Case ID (e.g., PEH-2026-0001)"
                    className="input-field !pl-12"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="bg-[#1E6BFF] px-8"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Track Case
                    </>
                  )}
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center">
                Case ID was provided when you submitted your report.
                <Link to="/contact" className="text-[#1E6BFF] ml-1 hover:underline">
                  Lost your case ID?
                </Link>
              </p>
            </div>

            {/* Not Found State */}
            {notFound && (
              <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-[#0B1A3E] mb-2">
                  Case Not Found
                </h2>
                <p className="text-gray-600 mb-6">
                  We couldn't find a case with ID "{caseId}". Please check the ID and try again.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNotFound(false);
                      setCaseId('');
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Link to="/contact">
                    <Button variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Case Details */}
            {caseData && (
              <div className="space-y-6">
                {/* Case Header */}
                <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        {caseData.image_file ? (
                          <img
                            src={`/uploads/${caseData.image_file}`}
                            alt={caseData.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-[#0B1A3E]">{caseData.name}</h2>
                          <StatusBadge status={caseData.status} />
                        </div>
                        <p className="text-gray-500">
                          {caseData.age} years • {caseData.gender}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg text-[#0B1A3E]">{caseData.case_id}</span>
                      <button
                        onClick={copyCaseId}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-[#1E6BFF]/5 rounded-xl">
                    <p className="text-[#1E6BFF]">
                      {getStatusDescription(caseData.status)}
                    </p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Timeline */}
                  <div className="lg:col-span-2 bg-white rounded-[18px] border border-gray-100 shadow-lg p-6">
                    <h3 className="text-lg font-bold text-[#0B1A3E] mb-6">Case Timeline</h3>

                    <div className="timeline">
                      {timelineEvents.map((item, index) => (
                        <div
                          key={index}
                          className={`timeline-item completed`} // Simplified for now, or match logic
                        >
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-semibold text-[#0B1A3E]">
                                  {item.title}
                                </h4>
                                <p className="text-sm mt-1 text-gray-600">
                                  {item.description}
                                </p>
                              </div>
                              <span className="text-sm whitespace-nowrap text-gray-500">
                                {item.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {timelineEvents.length === 0 && (
                        <p className="text-gray-500 text-center">No timeline updates yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Case Info */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-6">
                      <h3 className="text-lg font-bold text-[#0B1A3E] mb-4">Case Information</h3>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Reported On</p>
                            <p className="font-medium text-[#0B1A3E]">
                              {new Date(caseData.reported_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Last Seen Location</p>
                            <p className="font-medium text-[#0B1A3E]">{caseData.last_seen_location}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Last Seen Date</p>
                            <p className="font-medium text-[#0B1A3E]">
                              {new Date(caseData.last_seen_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        {caseData.description && (
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Description</p>
                            <p className="text-sm text-[#0B1A3E]">{caseData.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-6">
                      <h3 className="text-lg font-bold text-[#0B1A3E] mb-4">Reporter Information</h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="text-[#0B1A3E]">{caseData.reporter_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span className="text-[#0B1A3E]">{caseData.reporter_phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => setShowContactDialog(true)}
                        className="w-full bg-[#1E6BFF]"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                      <Link to="/search">
                        <Button variant="outline" className="w-full">
                          <Search className="w-4 h-4 mr-2" />
                          Search for Matches
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="!bg-white">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Get in touch with our support team for assistance with your case.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-[#1E6BFF]" />
              <div>
                <p className="text-sm text-gray-500">Support Line</p>
                <p className="font-medium text-[#0B1A3E]">1800-XXX-XXXX</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-[#1E6BFF]" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-[#0B1A3E]">support@pehchaan.gov.in</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Shield className="w-5 h-5 text-[#1E6BFF]" />
              <div>
                <p className="text-sm text-gray-500">Emergency</p>
                <p className="font-medium text-[#0B1A3E]">112</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                When contacting support, please have your Case ID ready:{' '}
                <strong>{caseData?.case_id}</strong>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
