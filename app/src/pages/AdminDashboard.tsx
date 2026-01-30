import { useState } from 'react';
import { 
  Shield, Users, FileText, Database, Settings, Search,
  TrendingUp, CheckCircle, XCircle, Clock,
  Download, BarChart3, Activity, Lock, Eye, Filter,
  MoreHorizontal, UserCheck, UserX, Globe, ChevronRight
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

interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'police' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  lastActive: string;
  casesReported?: number;
  casesVerified?: number;
}

export default function AdminDashboard() {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const systemStats: SystemStats = {
    totalCases: 1247,
    activeCases: 186,
    resolvedCases: 1024,
    pendingVerification: 37,
    totalUsers: 2847,
    activeUsers: 423,
    systemUptime: '99.97%',
    avgResponseTime: '1.2s',
  };

  const recentCases = [
    { id: 'PEH-2026-0045', name: 'New Case Reported', time: '2 min ago', type: 'report' },
    { id: 'PEH-2026-0042', name: 'Match Verified', time: '15 min ago', type: 'match' },
    { id: 'PEH-2026-0038', name: 'Case Closed', time: '1 hour ago', type: 'close' },
    { id: 'PEH-2026-0035', name: 'User Registered', time: '2 hours ago', type: 'user' },
  ];

  const users: User[] = [
    {
      id: '1',
      name: 'Inspector R. Mehta',
      email: 'r.mehta@police.gov.in',
      role: 'police',
      status: 'active',
      joinedDate: '2025-08-15',
      lastActive: '2 min ago',
      casesVerified: 47,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      role: 'citizen',
      status: 'active',
      joinedDate: '2026-01-20',
      lastActive: '5 min ago',
      casesReported: 2,
    },
    {
      id: '3',
      name: 'Dr. A. Pillai',
      email: 'a.pillai@ngo.org',
      role: 'citizen',
      status: 'active',
      joinedDate: '2025-11-10',
      lastActive: '1 hour ago',
      casesReported: 5,
    },
    {
      id: '4',
      name: 'Sub Inspector K. Rao',
      email: 'k.rao@police.gov.in',
      role: 'police',
      status: 'pending',
      joinedDate: '2026-01-28',
      lastActive: '-',
      casesVerified: 0,
    },
    {
      id: '5',
      name: 'Admin User',
      email: 'admin@pehchaan.gov.in',
      role: 'admin',
      status: 'active',
      joinedDate: '2025-01-01',
      lastActive: 'Just now',
    },
  ];

  const monthlyData = [
    { month: 'Aug', cases: 89 },
    { month: 'Sep', cases: 112 },
    { month: 'Oct', cases: 98 },
    { month: 'Nov', cases: 134 },
    { month: 'Dec', cases: 156 },
    { month: 'Jan', cases: 187 },
  ];

  const handleApproveUser = (userId: string) => {
    toast.success(`User ${userId} approved`);
    setShowUserDialog(false);
  };

  const handleSuspendUser = (userId: string) => {
    toast.error(`User ${userId} suspended`);
    setShowUserDialog(false);
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
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Citizen</span>;
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
              <div className="flex items-center gap-3 mb-1">
                <Shield className="w-6 h-6 text-purple-600" />
                <h1 className="text-3xl font-bold text-[#0B1A3E]">Admin Dashboard</h1>
              </div>
              <p className="text-gray-600">
                System overview and management controls
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
              <Button className="bg-purple-600 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* System Overview Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Cases</p>
                  <p className="text-3xl font-bold text-[#0B1A3E] mt-1">{systemStats.totalCases.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12% this month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Cases</p>
                  <p className="text-3xl font-bold text-[#0B1A3E] mt-1">{systemStats.activeCases}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-amber-600">
                    <Clock className="w-4 h-4" />
                    <span>{systemStats.pendingVerification} pending</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold text-[#0B1A3E] mt-1">{systemStats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+{systemStats.activeUsers} active</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">System Uptime</p>
                  <p className="text-3xl font-bold text-[#0B1A3E] mt-1">{systemStats.systemUptime}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <Globe className="w-4 h-4" />
                    <span>Avg: {systemStats.avgResponseTime}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white border border-gray-100 p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Monthly Trend */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#0B1A3E]">Monthly Case Trend</h3>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-4">
                    {monthlyData.map((item) => (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-blue-100 rounded-t-lg relative" style={{ height: `${(item.cases / 200) * 100}%` }}>
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg" style={{ height: '80%' }} />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-medium text-[#0B1A3E]">
                            {item.cases}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-[#0B1A3E] mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentCases.map((activity, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'report' ? 'bg-blue-100' :
                          activity.type === 'match' ? 'bg-green-100' :
                          activity.type === 'close' ? 'bg-gray-100' :
                          'bg-purple-100'
                        }`}>
                          {activity.type === 'report' ? <FileText className="w-4 h-4 text-blue-600" /> :
                           activity.type === 'match' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                           activity.type === 'close' ? <XCircle className="w-4 h-4 text-gray-600" /> :
                           <Users className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0B1A3E] truncate">{activity.name}</p>
                          <p className="text-xs text-gray-500">{activity.id} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-[#1E6BFF]">
                    View All Activity
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Case Distribution */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-[#0B1A3E] mb-4">Case Status Distribution</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Submitted', value: 156, color: 'bg-gray-400' },
                      { label: 'Verified', value: 234, color: 'bg-blue-400' },
                      { label: 'Under Review', value: 312, color: 'bg-amber-400' },
                      { label: 'Matched', value: 289, color: 'bg-green-400' },
                      { label: 'Closed', value: 1024, color: 'bg-purple-400' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{item.label}</span>
                          <span className="text-sm font-medium text-[#0B1A3E]">{item.value}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${(item.value / 1024) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-[#0B1A3E] mb-4">System Health</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'API Response Time', value: '1.2s', status: 'good', icon: Activity },
                      { label: 'Database Status', value: 'Operational', status: 'good', icon: Database },
                      { label: 'Storage Usage', value: '68%', status: 'warning', icon: Lock },
                      { label: 'Backup Status', value: 'Last: 2 hours ago', status: 'good', icon: CheckCircle },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#0B1A3E]">{item.value}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'good' ? 'bg-green-500' :
                            item.status === 'warning' ? 'bg-amber-500' :
                            'bg-red-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              {/* User Management */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search users by name or email..."
                        className="pl-11"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                      </Button>
                      <Button className="bg-purple-600">
                        <Users className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-[#0B1A3E]">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={user.status as any} size="sm" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-600">Last active: {user.lastActive}</p>
                              {user.casesVerified && (
                                <p className="text-gray-500">Cases verified: {user.casesVerified}</p>
                              )}
                              {user.casesReported && (
                                <p className="text-gray-500">Cases reported: {user.casesReported}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openUserDetails(user)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {user.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => handleApproveUser(user.id)}>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                )}
                                {user.status === 'active' && (
                                  <DropdownMenuItem onClick={() => handleSuspendUser(user.id)} className="text-red-600">
                                    <UserX className="w-4 h-4 mr-2" />
                                    Suspend
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

            <TabsContent value="activity" className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-[#0B1A3E] mb-4">System Activity Log</h3>
                <div className="space-y-4">
                  {[
                    { action: 'Case PEH-2026-0045 created', user: 'Priya Sharma', time: '2 min ago', type: 'create' },
                    { action: 'User k.rao@police.gov.in approved', user: 'Admin', time: '15 min ago', type: 'approve' },
                    { action: 'Match verified for PEH-2026-0042', user: 'Inspector R. Mehta', time: '1 hour ago', type: 'verify' },
                    { action: 'System backup completed', user: 'System', time: '2 hours ago', type: 'system' },
                    { action: 'Case PEH-2026-0038 closed', user: 'Inspector R. Mehta', time: '3 hours ago', type: 'close' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        log.type === 'create' ? 'bg-blue-100' :
                        log.type === 'approve' ? 'bg-green-100' :
                        log.type === 'verify' ? 'bg-purple-100' :
                        log.type === 'system' ? 'bg-gray-100' :
                        'bg-amber-100'
                      }`}>
                        {log.type === 'create' ? <FileText className="w-4 h-4 text-blue-600" /> :
                         log.type === 'approve' ? <UserCheck className="w-4 h-4 text-green-600" /> :
                         log.type === 'verify' ? <CheckCircle className="w-4 h-4 text-purple-600" /> :
                         log.type === 'system' ? <Database className="w-4 h-4 text-gray-600" /> :
                         <XCircle className="w-4 h-4 text-amber-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#0B1A3E]">{log.action}</p>
                        <p className="text-xs text-gray-500">by {log.user} • {log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0B1A3E]">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getRoleBadge(selectedUser.role)}
                    <StatusBadge status={selectedUser.status as any} size="sm" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium text-[#0B1A3E]">{selectedUser.joinedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Active</p>
                  <p className="font-medium text-[#0B1A3E]">{selectedUser.lastActive}</p>
                </div>
                {selectedUser.casesVerified !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Cases Verified</p>
                    <p className="font-medium text-[#0B1A3E]">{selectedUser.casesVerified}</p>
                  </div>
                )}
                {selectedUser.casesReported !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Cases Reported</p>
                    <p className="font-medium text-[#0B1A3E]">{selectedUser.casesReported}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {selectedUser.status === 'pending' ? (
                  <Button 
                    className="flex-1 bg-green-600"
                    onClick={() => handleApproveUser(selectedUser.id)}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Approve User
                  </Button>
                ) : selectedUser.status === 'active' ? (
                  <Button 
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200"
                    onClick={() => handleSuspendUser(selectedUser.id)}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Suspend User
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 bg-green-600"
                    onClick={() => handleApproveUser(selectedUser.id)}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Reactivate User
                  </Button>
                )}
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
