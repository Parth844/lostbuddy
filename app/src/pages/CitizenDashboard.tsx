import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, FileText, Bell,
  Clock, CheckCircle, AlertCircle,
  MapPin, Phone
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import CaseCard from '@/components/shared/CaseCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCases, type Case } from '@/services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'update' | 'match' | 'alert';
}

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState('cases');
  const [myCases, setMyCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const { cases } = await getCases();
      setMyCases(cases);
    } catch (error) {
      toast.error('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Case Update',
      message: 'Your case is now under active review.',
      date: '2 hours ago',
      read: false,
      type: 'update',
    },
    {
      id: '2',
      title: 'Potential Match Found',
      message: 'A potential match has been identified for one of your cases.',
      date: '1 day ago',
      read: false,
      type: 'match',
    },
    {
      id: '3',
      title: 'Verification Complete',
      message: 'Case information has been verified.',
      date: '3 days ago',
      read: true,
      type: 'update',
    },
  ];

  const stats = [
    {
      label: 'Active Cases',
      value: myCases.filter(c => c.status !== 'closed').length,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      label: 'Matches Found',
      value: myCases.filter(c => c.status === 'matched').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      label: 'Under Review',
      value: myCases.filter(c => c.status === 'under-review').length,
      icon: Clock,
      color: 'bg-amber-500'
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0B1A3E]">Citizen Dashboard</h1>
              <p className="mt-1 text-gray-600">
                Track your cases and stay updated on progress
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/search">
                <Button variant="outline" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Person
                </Button>
              </Link>
              <Link to="/report">
                <Button className="bg-[#1E6BFF] flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Report Missing
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#0B1A3E] mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color}/10 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border border-gray-100 p-1">
              <TabsTrigger value="cases" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My Cases
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-[#1E6BFF] text-white text-xs rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-6">
              {isLoading ? (
                <div className="bg-white rounded-[18px] border border-gray-100 p-12 text-center">
                  <div className="w-12 h-12 border-4 border-[#1E6BFF]/20 border-t-[#1E6BFF] rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading cases...</p>
                </div>
              ) : myCases.length > 0 ? (
                <div className="grid gap-6">
                  {myCases.map((caseItem) => (
                    <CaseCard
                      key={caseItem.id}
                      caseId={caseItem.case_id}
                      name={caseItem.name}
                      age={caseItem.age}
                      gender={caseItem.gender}
                      lastSeenLocation={caseItem.last_seen_location}
                      lastSeenDate={caseItem.last_seen_date}
                      status={caseItem.status as any}
                      photoUrl={caseItem.photo_url}
                      reportedDate={caseItem.reported_date}
                      matchConfidence={caseItem.match_confidence}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[18px] border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1A3E] mb-2">No Cases Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't reported any missing persons yet.
                  </p>
                  <Link to="/report">
                    <Button className="bg-[#1E6BFF]">
                      <Plus className="w-4 h-4 mr-2" />
                      Report Missing Person
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl border p-4 flex items-start gap-4 ${notification.read ? 'border-gray-100' : 'border-[#1E6BFF]/30 bg-[#1E6BFF]/5'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={`font-semibold ${notification.read ? 'text-[#0B1A3E]' : 'text-[#1E6BFF]'
                            }`}>
                            {notification.title}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {notification.date}
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-[#1E6BFF] rounded-full flex-shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-[18px] border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1A3E] mb-2">No Notifications</h3>
                  <p className="text-gray-600">
                    You'll receive updates about your cases here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/track">
              <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <Search className="w-8 h-8 text-[#1E6BFF] mb-4" />
                <h3 className="font-semibold text-[#0B1A3E]">Track Case</h3>
                <p className="text-sm text-gray-500 mt-1">Check case status</p>
              </div>
            </Link>
            <Link to="/search">
              <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
                <h3 className="font-semibold text-[#0B1A3E]">Search Person</h3>
                <p className="text-sm text-gray-500 mt-1">Upload photo to search</p>
              </div>
            </Link>
            <Link to="/contact">
              <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <Phone className="w-8 h-8 text-amber-500 mb-4" />
                <h3 className="font-semibold text-[#0B1A3E]">Get Support</h3>
                <p className="text-sm text-gray-500 mt-1">Contact our team</p>
              </div>
            </Link>
            <Link to="/how-it-works">
              <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <MapPin className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="font-semibold text-[#0B1A3E]">How It Works</h3>
                <p className="text-sm text-gray-500 mt-1">Learn the process</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
