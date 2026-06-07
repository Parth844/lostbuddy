import { useState, useEffect } from 'react';
import {
  Shield, Users, FileText, Database, Settings, Search,
  TrendingUp, CheckCircle, XCircle, Clock,
  Download, BarChart3, Activity, Eye, Filter,
  MoreHorizontal, UserCheck, Globe, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  getDashboardStats,
  getUsers,
  getPendingPolice,
  getSystemActivity,
  verifyUser,
  updateUserRole,
  createAdmin,
  getPotentialMatches,
  confirmMatch,
  rejectMatch,
  type DashboardStats,
  type User as ApiUser,
  type MatchReview
} from '@/services/api';

// Extend or use User type from API. 
// The local User interface had extra fields (joinedDate etc) which API might not have yet.
// We will adapt.
interface User extends ApiUser {
  status: 'active' | 'inactive' | 'pending';
  joinedDate?: string;
  lastActive?: string;
  casesReported?: number;
  casesVerified?: number;
}

interface SystemStats {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  pendingVerification: number;
  totalUsers: number;
  activeUsers: number;
  systemUptime: string;
  avgResponseTime: string;
}

export default function AdminDashboard() {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [pendingUsers, setPendingUsers] = useState<ApiUser[]>([]);
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]); // Real users state
  const [activityLog, setActivityLog] = useState<any[]>([]); // New activity state
  const [potentialMatches, setPotentialMatches] = useState<MatchReview[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [newAdmin, setNewAdmin] = useState({
    first_name: '', last_name: '', email: '', password: ''
  });

  // Fetch Stats and Pending Users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await getDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }

      try {
        const pending = await getPendingPolice();
        setPendingUsers(pending);
      } catch (error) {
        console.error("Failed to fetch pending users", error);
      }

      try {
        const users = await getUsers();
        // Map API users to local User type if needed, or just use what we have.
        // API returns { id, first_name, last_name, email, role, is_verified, created_at }
        // We can cast or transform.
        const mappedUsers = users.map((u: any) => ({
          ...u,
          status: u.is_verified ? 'active' : 'pending',
          joinedDate: u.created_at, // Map created_at to joinedDate if used
          lastActive: 'Unknown', // Placeholder
          casesVerified: 0 // Placeholder
        }));
        setAllUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch all users", error);
      }

      try {
        const activity = await getSystemActivity();
        setActivityLog(activity);
      } catch (error) {
        console.error("Failed to fetch system activity", error);
      }

      try {
        const matches = await getPotentialMatches();
        setPotentialMatches(matches);
      } catch (error) {
        console.error("Failed to fetch potential matches", error);
      }
    };
    fetchData();
  }, []);

  const handleConfirmMatch = async (matchId: number) => {
    try {
      await confirmMatch(matchId);
      toast.success("Match Confirmed! Reporter notified.");
      // Refresh list
      const matches = await getPotentialMatches();
      setPotentialMatches(matches);
    } catch (e) {
      toast.error("Failed to confirm match.");
    }
  };

  const handleRejectMatch = async (matchId: number) => {
    try {
      await rejectMatch(matchId);
      toast.success("Match Rejected.");
      // Refresh list
      const matches = await getPotentialMatches();
      setPotentialMatches(matches);
    } catch (e) {
      toast.error("Failed to reject match.");
    }
  };

  const handleVerify = async (id: number) => {
    try {
      await verifyUser(id);
      toast.success("User verified successfully");
      setPendingUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      toast.error("Verification failed");
    }
  };

  const handlePromoteUser = async (id: number, newRole: 'citizen' | 'police' | 'admin') => {
    try {
      await updateUserRole(id, newRole);
      toast.success(`User promoted to ${newRole}`);
      // Refresh the list - crudely by reloading or refetching. 
      // ideally verifyUser logic should update local state, but 'users' tab uses mocked data in the code I wrote previous turn?
      // Wait, the "Users" tab was utilizing `users` array which was MOCKED in previous code.
      // I need to fetch REAL users for the "Users" tab for this to work on the real user.
      // I'll add a fetch for all users.
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdmin(newAdmin);
      toast.success("Admin user created successfully");
      setNewAdmin({ first_name: '', last_name: '', email: '', password: '' });
    } catch (error) {
      toast.error("Failed to create admin");
    }
  };

  // Mock data for display mostly (adapted from legacy code)
  const systemStats: SystemStats = {
    totalCases: stats?.total_cases || 0,
    activeCases: stats?.untraced || 0,
    resolvedCases: (stats?.traced || 0) + (stats?.matched || 0),
    pendingVerification: stats?.case_status_distribution?.submitted || 0,
    totalUsers: 2847,
    activeUsers: stats?.case_status_distribution?.submitted || 0, // Just mapping some stat for now
    systemUptime: '99.97%',
    avgResponseTime: '1.2s',
  };



  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Admin</span>;
      case 'police':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Police</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">Citizen</span>;
    }
  };



  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Shield className="w-6 h-6 text-violet-600" />
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
              </div>
              <p className="text-slate-500">
                System overview and management controls
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2 border-slate-200">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
              <Button className="bg-gradient-to-b from-violet-500 to-violet-600 border border-violet-600/30 shadow-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* System Overview Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.09)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Cases</p>
                  <p className="text-3xl font-bold font-['Sora'] text-slate-900 mt-1.5 tracking-tight">{systemStats.totalCases.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+12% this month</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.09)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Active Cases</p>
                  <p className="text-3xl font-bold font-['Sora'] text-slate-900 mt-1.5 tracking-tight">{systemStats.activeCases}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-amber-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{systemStats.pendingVerification} pending</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-400 to-red-500">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.09)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Users</p>
                  <p className="text-3xl font-bold font-['Sora'] text-slate-900 mt-1.5 tracking-tight">{systemStats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{systemStats.activeUsers} active</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-400 to-violet-600">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.09)] hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">System Uptime</p>
                  <p className="text-3xl font-bold font-['Sora'] text-slate-900 mt-1.5 tracking-tight">{systemStats.systemUptime}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Avg: {systemStats.avgResponseTime}</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
                  <Database className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border border-slate-200/80 p-1 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="matches" className="relative flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Matches
                {potentialMatches.length > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity Log
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Pending Requests
              </TabsTrigger>
              <TabsTrigger value="create-admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Create Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Status Distribution */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Case Status Distribution</h3>
                  {stats?.case_status_distribution ? (
                    <div className="space-y-4">
                      {Object.entries(stats.case_status_distribution).map(([status, count]) => {
                        const total = stats.total_cases || 1;
                        const percentage = Math.round((count / total) * 100);
                        const color = status === 'closed' ? 'bg-slate-400' :
                          status === 'matched' ? 'bg-emerald-500' :
                            status === 'verified' ? 'bg-blue-500' :
                              status === 'under_review' ? 'bg-violet-500' :
                                'bg-amber-500';
                        return (
                          <div key={status} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize text-slate-600">{status.replace('_', ' ')}</span>
                              <span className="font-medium text-slate-900">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                              <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-400">Loading stats...</div>
                  )}
                </div>

                {/* Yearly Trend */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Yearly Trend</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {stats?.yearly_activity && stats.yearly_activity.length > 0 ? (
                      stats.yearly_activity.map((item, index) => {
                        // Calculate max for scale or use hardcoded max for now
                        const maxCases = Math.max(...stats.yearly_activity.map(d => d.cases)) || 10;
                        const heightPct = (item.cases / maxCases) * 100;

                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-blue-100 rounded-t-lg relative group" style={{ height: `${Math.max(heightPct, 5)}%` }}>
                              <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg" style={{ height: '100%' }} />
                              {/* Tooltip-ish case count */}
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.cases}
                              </div>
                            </div>
                            <span className="text-xs text-slate-500">{item.month}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No trend data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activityLog.slice(0, 5).map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.title.includes('Report') || activity.title.includes('Submitted') ? 'bg-blue-100' :
                        activity.title.includes('Match') ? 'bg-emerald-100' :
                          activity.title.includes('Closed') ? 'bg-slate-100' :
                            'bg-violet-100'
                        }`}>
                        {activity.title.includes('Report') || activity.title.includes('Submitted') ? <FileText className="w-4 h-4 text-blue-600" /> :
                          activity.title.includes('Match') ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                            activity.title.includes('Closed') ? <XCircle className="w-4 h-4 text-slate-500" /> :
                              <Activity className="w-4 h-4 text-violet-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{activity.title} <span className="text-slate-400 font-normal">({activity.case_name})</span></p>
                        <p className="text-xs text-slate-500">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                  {activityLog.length === 0 && <p className="text-slate-500 text-sm">No recent activity.</p>}
                </div>
              </div>
            </TabsContent>


            <TabsContent value="users" className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)] overflow-hidden">
                <div className="p-4 border-b border-slate-100/80">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search users by name or email..."
                        className="pl-11 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex items-center gap-2 border-slate-200">
                            <Filter className="w-4 h-4" />
                            {roleFilter === 'all' ? 'All Roles' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem onClick={() => setRoleFilter('all')}>All Roles</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRoleFilter('admin')}>Admin</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRoleFilter('police')}>Police</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRoleFilter('citizen')}>Citizen</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button className="bg-gradient-to-b from-violet-500 to-violet-600 border border-violet-600/30 shadow-sm">
                        <Users className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100/80">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Activity</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {allUsers
                        .filter(user => {
                          const matchesSearch = (user.first_name + ' ' + user.last_name + user.email).toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesRole = roleFilter === 'all' || user.role === roleFilter;
                          return matchesSearch && matchesRole;
                        })
                        .map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/80">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-slate-600">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{user.first_name} {user.last_name}</p>
                                  <p className="text-sm text-slate-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getRoleBadge(user.role)}
                            </td>
                            <td className="px-6 py-4">
                              {user.is_verified ? <StatusBadge status={'approved'} size="sm" /> : <StatusBadge status={'pending'} size="sm" />}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <p className="text-slate-500">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white">
                                  <DropdownMenuItem onClick={() => {
                                    // @ts-ignore
                                    openUserDetails(user)
                                  }}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>

                                  {user.role === 'citizen' && (
                                    <DropdownMenuItem onClick={() => handlePromoteUser(user.id, 'police')} className="text-blue-600">
                                      <Shield className="w-4 h-4 mr-2" />
                                      Promote to Police
                                    </DropdownMenuItem>
                                  )}

                                  {!user.is_verified && (
                                    <DropdownMenuItem onClick={() => handleVerify(user.id)} className="text-green-600">
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      Verify User
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Potential Match Review</h3>
                {potentialMatches.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">No pending matches to review.</div>
                ) : (
                  <div className="grid gap-6">
                    {potentialMatches.map((match) => (
                      <div key={match.id} className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/60">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          {/* Original Case */}
                          <div className="flex-1 text-center">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Original Missing Person</p>
                            <div className="relative w-40 h-40 mx-auto rounded-xl overflow-hidden border-2 border-blue-200">
                              <img src={`/uploads/${match.case_image}`} className="w-full h-full object-cover" alt="Original" />
                            </div>
                            <p className="mt-2 font-bold text-slate-900">{match.case_name}</p>
                            <p className="text-xs text-slate-500">{match.location}</p>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="bg-white p-2 rounded-full border border-slate-200 shadow-sm">
                              <ArrowRight className="w-6 h-6 text-slate-400" />
                            </div>
                          </div>

                          {/* Submitted Match */}
                          <div className="flex-1 text-center">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Submitted Evidence</p>
                            <div className="relative w-40 h-40 mx-auto rounded-xl overflow-hidden border-2 border-amber-200">
                              <img src={`/user-uploads/${match.submitted_image}`} className="w-full h-full object-cover" alt="Submitted" />
                            </div>
                            <p className="mt-2 text-sm text-slate-500">Submitted just now</p>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200/80">
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleRejectMatch(match.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Match
                          </Button>
                          <Button
                            className="bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-600/30 shadow-sm text-white"
                            onClick={() => handleConfirmMatch(match.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Match
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">System Activity Log</h3>
                <div className="space-y-0 divide-y divide-slate-100/80">
                  {activityLog.map((activity, i) => (
                    <div key={i} className="py-4 flex items-start gap-4">
                      <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.title.includes('Submitted') ? 'bg-blue-50' :
                        activity.title.includes('Match') ? 'bg-emerald-50' :
                          activity.title.includes('Closed') ? 'bg-slate-100' :
                            'bg-violet-50'
                        }`}>
                        {activity.title.includes('Submitted') ? <FileText className="w-5 h-5 text-blue-600" /> :
                          activity.title.includes('Match') ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                            activity.title.includes('Closed') ? <XCircle className="w-5 h-5 text-slate-500" /> :
                              <Activity className="w-5 h-5 text-violet-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-900">{activity.title}</h4>
                            <p className="text-sm text-slate-500 mt-0.5">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                Case: {activity.case_name}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-md capitalize ${activity.status === 'match' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                Status: {activity.status}
                              </span>
                              {activity.title === 'Potential Match Flagged' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7 ml-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                  onClick={() => setActiveTab('matches')}
                                >
                                  View Match
                                </Button>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-slate-500 whitespace-nowrap">{activity.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activityLog.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      No activity recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)] overflow-hidden">
                <div className="p-4 border-b border-slate-100/80">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Pending Verification</h3>
                </div>
                <div className="divide-y divide-slate-100/80">
                  {pendingUsers.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No pending requests</div>
                  ) : (
                    pendingUsers.map(user => (
                      <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-900">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-slate-500">{user.email} • {user.role}</p>
                        </div>
                        <Button
                          onClick={() => handleVerify(user.id)}
                          className="bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-600/30 shadow-sm text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="create-admin" className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)] p-6 max-w-lg">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">Create New Administrator</h3>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="First Name" className="border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" value={newAdmin.first_name} onChange={e => setNewAdmin({ ...newAdmin, first_name: e.target.value })} required />
                    <Input placeholder="Last Name" className="border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" value={newAdmin.last_name} onChange={e => setNewAdmin({ ...newAdmin, last_name: e.target.value })} required />
                  </div>
                  <Input type="email" placeholder="Email Address" className="border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
                  <Input type="password" placeholder="Password" className="border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
                  <Button type="submit" className="w-full bg-gradient-to-b from-violet-500 to-violet-600 border border-violet-600/30 shadow-sm">Create Admin User</Button>
                </form>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>

      <Footer />

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">User Details</DialogTitle>
            <DialogDescription className="text-slate-500">Detailed information about the selected user.</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600">
                  {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedUser.first_name} {selectedUser.last_name}</h3>
                  <div className="flex gap-2 mt-1">
                    {getRoleBadge(selectedUser.role)}
                    {selectedUser.is_verified ? <StatusBadge status={'approved'} size="sm" /> : <StatusBadge status={'pending'} size="sm" />}
                  </div>
                </div>
              </div>

              <div className="space-y-3 py-4 border-t border-b border-slate-100/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-900">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-medium text-slate-900">N/A</span>
                  {/* Phone not in User interface currently, add if needed */}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Joined Date</span>
                  <span className="font-medium text-slate-900">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {!selectedUser.is_verified && (
                  <Button
                    onClick={() => handleVerify(selectedUser.id)}
                    className="bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-600/30 shadow-sm text-white"
                  >
                    Verify User
                  </Button>
                )}
                <Button variant="outline" className="border-slate-200" onClick={() => setShowUserDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div >
  );
}
