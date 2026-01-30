import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, FileText, CheckCircle, XCircle, Eye,
  ChevronDown, Calendar, MapPin, User,
  AlertCircle, Download, RefreshCw, Shield,
  BarChart3, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCases, getDashboardStats, updateCaseStatus, type Case, type DashboardStats } from '@/services/api';

export default function PoliceDashboard() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showCaseDialog, setShowCaseDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<Case[]>([]);
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCases, setTotalCases] = useState(0);
  const ITEMS_PER_PAGE = 15;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, [currentPage, filterStatus, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStatsData(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const data = await getCases({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        status: filterStatus === 'all' ? undefined : filterStatus
      });
      setCases(data.cases);
      setTotalCases(data.total);
    } catch (error) {
      toast.error('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Cases',
      value: statsData?.total_cases || 0,
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      label: 'Traced',
      value: statsData?.traced || 0,
      change: '+5%',
      trend: 'up',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      label: 'Untraced',
      value: statsData?.untraced || 0,
      change: '-2%',
      trend: 'down',
      icon: AlertCircle,
      color: 'bg-red-500'
    },
    {
      label: 'Matches Found',
      value: statsData?.matched || 0,
      change: '+8%',
      trend: 'up',
      icon: Search,
      color: 'bg-purple-500'
    },
  ];

  // Client-side filtering is no longer needed as we do it on server
  const filteredCases = cases;

  const handleApprove = async (caseId: string) => {
    try {
      await updateCaseStatus(caseId, 'verified');
      toast.success(`Case ${caseId} approved`);
      setShowCaseDialog(false);
      fetchCases();
    } catch (e) {
      toast.error('Failed to approve case');
    }
  };

  const handleReject = async (caseId: string) => {
    try {
      await updateCaseStatus(caseId, 'rejected');
      toast.error(`Case ${caseId} rejected`);
      setShowCaseDialog(false);
      fetchCases();
    } catch (e) {
      toast.error('Failed to reject case');
    }
  };

  const handleConfirmMatch = async (caseId: string) => {
    try {
      await updateCaseStatus(caseId, 'match-confirmed');
      toast.success(`Match confirmed for case ${caseId}`);
      setShowCaseDialog(false);
      fetchCases();
    } catch (e) {
      toast.error('Failed to confirm match');
    }
  };

  const openCaseDetails = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setShowCaseDialog(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Shield className="w-6 h-6 text-[#1E6BFF]" />
                <h1 className="text-3xl font-bold text-[#0B1A3E]">Police Dashboard</h1>
              </div>
              <p className="text-gray-600">
                Review, verify, and manage missing person cases
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Link to="/search">
                <Button className="bg-[#1E6BFF] flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Database
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#0B1A3E] mt-1">{stat.value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      <TrendingUp className="w-4 h-4" />
                      <span>{stat.change} this week</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color}/10 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="cases" className="space-y-6">
            <TabsList className="bg-white border border-gray-100 p-1">
              <TabsTrigger value="cases" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Case Management
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by case ID, name, or location..."
                      className="pl-11"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          Status
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                          All Cases
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus('submitted')}>
                          Submitted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus('verified')}>
                          Verified
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus('under-review')}>
                          Under Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus('matched')}>
                          Matched
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus('closed')}>
                          Closed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={() => { setFilterStatus('all'); setSearchQuery(''); setCurrentPage(1); }}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cases Table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 border-4 border-[#1E6BFF]/20 border-t-[#1E6BFF] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading cases...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Case ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Last Seen
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Reported
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Match
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredCases.map((caseItem) => (
                          <tr key={caseItem.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm text-gray-600">{caseItem.case_id}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                  {caseItem.photo_url ? (
                                    <img
                                      src={caseItem.photo_url}
                                      alt={caseItem.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <User className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-[#0B1A3E]">{caseItem.name}</p>
                                  <p className="text-sm text-gray-500">{caseItem.age} yrs • {caseItem.gender}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-gray-700">{caseItem.last_seen_location}</p>
                                <p className="text-xs text-gray-500">{caseItem.last_seen_date}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">{caseItem.reported_date}</span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={caseItem.status as any} size="sm" />
                            </td>
                            <td className="px-6 py-4">
                              {caseItem.match_confidence ? (
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${caseItem.match_confidence >= 80 ? 'bg-green-500' :
                                    caseItem.match_confidence >= 60 ? 'bg-amber-500' : 'bg-gray-400'
                                    }`} />
                                  <span className={`text-sm font-medium ${caseItem.match_confidence >= 80 ? 'text-green-600' :
                                    caseItem.match_confidence >= 60 ? 'text-amber-600' : 'text-gray-600'
                                    }`}>
                                    {Math.round(caseItem.match_confidence)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCaseDetails(caseItem)}
                                className="text-[#1E6BFF]"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!isLoading && filteredCases.length === 0 && (
                  <div className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No cases found matching your criteria</p>
                  </div>
                )}
                {/* Pagination */}
                {!isLoading && totalCases > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                    <div className="text-sm text-gray-500">
                      Showing <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCases)}</span> of <span className="font-medium">{totalCases}</span> results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage * ITEMS_PER_PAGE >= totalCases}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-[#0B1A3E] mb-4">Cases by Status</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Submitted', value: statsData?.case_status_distribution?.submitted || 0, color: 'bg-gray-400' },
                      { label: 'Verified', value: statsData?.case_status_distribution?.verified || 0, color: 'bg-blue-400' },
                      { label: 'Under Review', value: statsData?.case_status_distribution?.under_review || 0, color: 'bg-amber-400' },
                      { label: 'Matched', value: statsData?.case_status_distribution?.matched || 0, color: 'bg-green-400' },
                      { label: 'Closed', value: statsData?.case_status_distribution?.closed || 0, color: 'bg-purple-400' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{item.label}</span>
                          <span className="text-sm font-medium text-[#0B1A3E]">{item.value}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${cases.length > 0 ? (item.value / cases.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-[#0B1A3E] mb-4">Weekly Activity</h3>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {/* If we have real data, map it. Otherwise fallback to empty or some default days if desired.
                        Here we show what we got. We might want to ensure all 7 days are present, but for now showing available data.
                     */}
                    {(statsData?.weekly_activity && statsData.weekly_activity.length > 0
                      ? statsData.weekly_activity
                      : [
                        { day: 'Mon', cases: 0 },
                        { day: 'Tue', cases: 0 },
                        { day: 'Wed', cases: 0 },
                        { day: 'Thu', cases: 0 },
                        { day: 'Fri', cases: 0 },
                        { day: 'Sat', cases: 0 },
                        { day: 'Sun', cases: 0 },
                      ]
                    ).map((item) => (
                      <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-[#1E6BFF]/20 rounded-t-lg"
                          style={{ height: `${statsData?.total_cases ? (item.cases / Math.max(10, statsData.total_cases)) * 100 : 0}%` }}
                        >
                          <div
                            className="w-full bg-[#1E6BFF] rounded-t-lg"
                            style={{ height: `${statsData?.total_cases ? (item.cases / Math.max(10, statsData.total_cases)) * 80 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Case Detail Dialog */}
      <Dialog open={showCaseDialog} onOpenChange={setShowCaseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto !bg-white">
          <DialogHeader >
            <DialogTitle className="flex items-center gap-3">
              Case Details
              {selectedCase && <StatusBadge status={selectedCase.status as any} size="sm" />}
            </DialogTitle>
            <DialogDescription>
              Review and take action on this case
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6 mt-4">
              {/* Case Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-sm text-gray-500">Case ID</p>
                  <p className="font-mono font-medium text-[#0B1A3E]">{selectedCase.case_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reported Date</p>
                  <p className="font-medium text-[#0B1A3E]">{selectedCase.reported_date}</p>
                </div>
              </div>

              {/* Missing Person Details */}
              <div>
                <h4 className="font-semibold text-[#0B1A3E] mb-3">Missing Person</h4>
                <div className="flex gap-4 mb-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    {selectedCase.photo_url ? (
                      <img
                        src={selectedCase.photo_url}
                        alt={selectedCase.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-[#0B1A3E]">{selectedCase.name}</p>
                        <p className="text-sm text-gray-500">{selectedCase.age} years • {selectedCase.gender}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-[#0B1A3E]">{selectedCase.last_seen_location}</p>
                        <p className="text-sm text-gray-500">Last seen: {selectedCase.last_seen_date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div>
                <h4 className="font-semibold text-[#0B1A3E] mb-3">Reporter Information</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#0B1A3E]">{selectedCase.reporter_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#0B1A3E]">{selectedCase.reporter_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Confidence */}
              {selectedCase.match_confidence && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900 mb-2">AI Match Found</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-green-700">Confidence Score</span>
                        <span className="font-bold text-green-900">{Math.round(selectedCase.match_confidence)}%</span>
                      </div>
                      <div className="h-3 bg-green-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${selectedCase.match_confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {selectedCase.status === 'submitted' && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedCase.case_id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Case
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleReject(selectedCase.case_id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                {selectedCase.status === 'under-review' && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleConfirmMatch(selectedCase.case_id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Match
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toast.info('Requesting more info')}
                    >
                      Request Info
                    </Button>
                  </>
                )}
                <Link to={`/track?id=${selectedCase.case_id}`}>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Public Page
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
