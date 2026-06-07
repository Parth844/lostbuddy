import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, FileText, Bell,
  Clock, CheckCircle, AlertCircle,
  MapPin, Phone, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import CaseCard from '@/components/shared/CaseCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCases, getDashboardStats, getNotifications, markNotificationRead, type Case, type DashboardStats, type Notification } from '@/services/api';

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState('cases');
  const [myCases, setMyCases] = useState<Case[]>([]);
  const [casesTotal, setCasesTotal] = useState(0);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [casesData, statsData] = await Promise.all([
        getCases({ mine: true }),
        getDashboardStats()
      ]);
      setMyCases(casesData.cases);
      setCasesTotal(casesData.total);
      setDashboardStats(statsData);
      const notifs = await getNotifications();
      setNotifications(notifs);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const stats = [
    {
      label: 'Total Cases',
      value: dashboardStats?.total_cases || 0,
      change: 'Cases reported',
      icon: FileText,
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      label: 'Traced',
      value: dashboardStats?.traced || 0,
      change: 'Successfully found',
      icon: CheckCircle,
      gradient: 'from-emerald-400 to-emerald-600'
    },
    {
      label: 'Untraced',
      value: dashboardStats?.untraced || 0,
      change: 'Still searching',
      icon: AlertCircle,
      gradient: 'from-amber-400 to-amber-500'
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Dashboard</h1>
              <p className="mt-1 text-slate-500">Track your cases and stay updated on progress</p>
            </div>
            <div className="flex gap-3">
              <Link to="/search">
                <Button variant="outline" className="flex items-center gap-2 border-slate-200">
                  <Search className="w-4 h-4" />
                  Search Person
                </Button>
              </Link>
              <Link to="/report">
                <Button className="bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600/30 shadow-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Report Missing
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.09)] hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
                    <p className="text-3xl font-bold font-['Sora'] text-slate-900 mt-1.5 tracking-tight">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border border-slate-200/80 p-1 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
              <TabsTrigger value="cases" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My Cases
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-semibold">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="space-y-6">
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-500">Loading cases…</p>
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
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <FileText className="w-9 h-9 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">No cases yet</h3>
                  <p className="text-slate-500 mb-6 text-sm">You haven't reported any missing persons yet.</p>
                  <Link to="/report">
                    <Button className="bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600/30 shadow-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Report Missing Person
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-2xl border p-4 flex items-start gap-4 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 ${
                      notification.read
                        ? 'border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)]'
                        : 'border-blue-200 bg-blue-50/40 shadow-[0_1px_4px_rgba(37,99,235,0.12)]'
                    }`}
                    onClick={() => !notification.read && handleMarkRead(notification.id)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.read ? 'bg-slate-50' : 'bg-white shadow-sm'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={`font-semibold text-sm ${notification.read ? 'text-slate-700' : 'text-blue-700'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-slate-500 text-sm mt-0.5">{notification.message}</p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{notification.date}</span>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <Bell className="w-9 h-9 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">No notifications</h3>
                  <p className="text-slate-500 text-sm">You'll receive updates about your cases here.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/track',        icon: Search,       gradient: 'from-blue-400 to-blue-600',    title: 'Track Case',     desc: 'Check case status' },
              { to: '/search',       icon: CheckCircle,  gradient: 'from-emerald-400 to-emerald-600', title: 'Search Person',  desc: 'Upload photo to search' },
              { to: '/contact',      icon: Phone,        gradient: 'from-amber-400 to-amber-500',  title: 'Get Support',    desc: 'Contact our team' },
              { to: '/how-it-works', icon: MapPin,       gradient: 'from-violet-400 to-violet-600', title: 'How It Works',   desc: 'Learn the process' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to}>
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.09)] hover:-translate-y-0.5 transition-all duration-200 h-full">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.gradient} mb-4`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
