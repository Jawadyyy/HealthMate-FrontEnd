"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from "lucide-react";
import { Users, UserPlus, Stethoscope, Calendar, CreditCard, Settings, LogOut, HelpCircle, Search, Edit, Plus, FileText, ChevronRight, Bell, Download, Filter, MoreVertical, BarChart3, TrendingUp, Shield, Activity, UserCheck, UserX, DollarSign, ClipboardList, AlertCircle, CheckCircle, XCircle, Eye, Trash2, Archive } from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AnalyticsData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeAppointments: number;
  appointmentsByDate?: Array<{ date: string; count: number }>;
  revenueByMonth?: Array<{ month: string; revenue: number }>;
  patientGrowth?: Array<{ month: string; patients: number }>;
  topDoctors?: Array<{ name: string; specialization: string; appointments: number; revenue: number }>;
  diseaseTrends?: Array<{ disease: string; count: number; trend: 'up' | 'down' }>;
}

const COLORS = ['#7c3aed', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeAppointments: 0,
    appointmentsByDate: [],
    revenueByMonth: [],
    patientGrowth: [],
    topDoctors: [],
    diseaseTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAdminData(),
          fetchAnalytics()
        ]);
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedTimeRange]);

  const fetchAdminData = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data || response.data;
      setAdminData(userData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes, revenueRes, topDoctorsRes, diseaseTrendsRes] = await Promise.all([
        api.get('/analytics/total-patients'),
        api.get('/analytics/total-doctors'),
        api.get('/analytics/appointments'),
        api.get('/analytics/revenue'),
        api.get('/analytics/top-doctors'),
        api.get('/analytics/disease-trends')
      ]);

      // Mock data for charts (in real app, these would come from backend)
      const mockAppointmentsByDate = [
        { date: 'Mon', appointments: 42 },
        { date: 'Tue', appointments: 58 },
        { date: 'Wed', appointments: 65 },
        { date: 'Thu', appointments: 71 },
        { date: 'Fri', appointments: 48 },
        { date: 'Sat', appointments: 35 },
        { date: 'Sun', appointments: 28 }
      ];

      const mockRevenueByMonth = [
        { month: 'Jan', revenue: 45000 },
        { month: 'Feb', revenue: 52000 },
        { month: 'Mar', revenue: 48000 },
        { month: 'Apr', revenue: 61000 },
        { month: 'May', revenue: 59000 },
        { month: 'Jun', revenue: 68000 }
      ];

      const mockPatientGrowth = [
        { month: 'Jan', patients: 850 },
        { month: 'Feb', patients: 920 },
        { month: 'Mar', patients: 1050 },
        { month: 'Apr', patients: 1120 },
        { month: 'May', patients: 1250 },
        { month: 'Jun', patients: 1380 }
      ];

      setAnalytics({
        totalPatients: patientsRes.data.total || 1250,
        totalDoctors: doctorsRes.data.total || 85,
        totalAppointments: appointmentsRes.data.total || 320,
        totalRevenue: revenueRes.data.total || 45600,
        pendingApprovals: doctorsRes.data.pending || 12,
        activeAppointments: appointmentsRes.data.active || 45,
        //error: appointmentsByDate: mockAppointmentsByDate,
        revenueByMonth: mockRevenueByMonth,
        patientGrowth: mockPatientGrowth,
        topDoctors: topDoctorsRes.data || [
          { name: 'Dr. Robert Wilson', specialization: 'Cardiology', appointments: 156, revenue: 12500 },
          { name: 'Dr. Emily Davis', specialization: 'Pediatrics', appointments: 142, revenue: 9800 },
          { name: 'Dr. Michael Brown', specialization: 'Orthopedics', appointments: 128, revenue: 11200 },
          { name: 'Dr. Sarah Johnson', specialization: 'Neurology', appointments: 115, revenue: 10500 },
          { name: 'Dr. James Miller', specialization: 'Dermatology', appointments: 98, revenue: 8600 }
        ],
        diseaseTrends: diseaseTrendsRes.data || [
          { disease: 'Diabetes', count: 156, trend: 'up' },
          { disease: 'Hypertension', count: 142, trend: 'up' },
          { disease: 'Arthritis', count: 128, trend: 'down' },
          { disease: 'Asthma', count: 115, trend: 'up' },
          { disease: 'Migraine', count: 98, trend: 'down' }
        ]
      });
    } catch (e) {
      console.log("Using mock analytics data");
      setAnalytics({
        totalPatients: 1250,
        totalDoctors: 85,
        totalAppointments: 320,
        totalRevenue: 45600,
        pendingApprovals: 12,
        activeAppointments: 45,
        /* error: appointmentsByDate: [
          { date: 'Mon', appointments: 42 },
          { date: 'Tue', appointments: 58 },
          { date: 'Wed', appointments: 65 },
          { date: 'Thu', appointments: 71 },
          { date: 'Fri', appointments: 48 },
          { date: 'Sat', appointments: 35 },
          { date: 'Sun', appointments: 28 }
        ],*/
        revenueByMonth: [
          { month: 'Jan', revenue: 45000 },
          { month: 'Feb', revenue: 52000 },
          { month: 'Mar', revenue: 48000 },
          { month: 'Apr', revenue: 61000 },
          { month: 'May', revenue: 59000 },
          { month: 'Jun', revenue: 68000 }
        ],
        patientGrowth: [
          { month: 'Jan', patients: 850 },
          { month: 'Feb', patients: 920 },
          { month: 'Mar', patients: 1050 },
          { month: 'Apr', patients: 1120 },
          { month: 'May', patients: 1250 },
          { month: 'Jun', patients: 1380 }
        ],
        topDoctors: [
          { name: 'Dr. Robert Wilson', specialization: 'Cardiology', appointments: 156, revenue: 12500 },
          { name: 'Dr. Emily Davis', specialization: 'Pediatrics', appointments: 142, revenue: 9800 },
          { name: 'Dr. Michael Brown', specialization: 'Orthopedics', appointments: 128, revenue: 11200 },
          { name: 'Dr. Sarah Johnson', specialization: 'Neurology', appointments: 115, revenue: 10500 },
          { name: 'Dr. James Miller', specialization: 'Dermatology', appointments: 98, revenue: 8600 }
        ],
        diseaseTrends: [
          { disease: 'Diabetes', count: 156, trend: 'up' },
          { disease: 'Hypertension', count: 142, trend: 'up' },
          { disease: 'Arthritis', count: 128, trend: 'down' },
          { disease: 'Asthma', count: 115, trend: 'up' },
          { disease: 'Migraine', count: 98, trend: 'down' }
        ]
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isLoggedIn');
    router.push('/auth/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading admin dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col fixed left-0 top-0 h-full z-20 shadow-lg shadow-purple-500/5">
        <div className="p-8 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">HealthMate</span>
              <p className="text-xs text-gray-500 mt-1">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="px-5 space-y-2 flex-1">
          <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border border-purple-200/50 cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Dashboard</span>
            </div>
          </div>
          <NavItem icon={Users} label="Users" />
          <NavItem icon={Stethoscope} label="Doctors" badge={analytics.pendingApprovals} />
          <NavItem icon={UserPlus} label="Patients" />
          <NavItem icon={Calendar} label="Appointments" />
          <NavItem icon={CreditCard} label="Billing" />
          <NavItem icon={Settings} label="Settings" />
        </nav>

        <div className="p-5 space-y-2 border-t border-gray-200/50">
          <NavItem icon={HelpCircle} label="Help & Support" />
          <div onClick={handleLogout} className="w-full">
            <NavItem icon={LogOut} label="Logout" />
          </div>
        </div>

        <div className="p-5 mt-auto">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
            <p className="text-sm font-medium text-purple-800">System Status</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs text-purple-600/80">All systems operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-72">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search analytics, reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                />
              </div>
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                {(['week', 'month', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      selectedTimeRange === range
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-5">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{adminData?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {adminData?.name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb & Quick Actions */}
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              Real-time Insights
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export Report</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Generate Report</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard
              icon={UserPlus}
              label="Total Patients"
              value={analytics.totalPatients}
              change="+12%"
              color="purple"
            />
            <StatCard
              icon={Stethoscope}
              label="Total Doctors"
              value={analytics.totalDoctors}
              change="+5%"
              color="green"
            />
            <StatCard
              icon={Calendar}
              label="Active Appointments"
              value={analytics.activeAppointments}
              change="+8"
              color="blue"
            />
            <StatCard
              icon={CreditCard}
              label="Total Revenue"
              value={`$${analytics.totalRevenue.toLocaleString()}`}
              change="+15%"
              color="orange"
            />
            <StatCard
              icon={UserCheck}
              label="Pending Approvals"
              value={analytics.pendingApprovals}
              change="-3"
              color="yellow"
            />
            <StatCard
              icon={Activity}
              label="System Health"
              value="98%"
              change="+2%"
              color="purple"
            />
          </div>
        </div>

        {/* Main Charts Grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointments Chart */}
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Appointments Trend</h3>
                  <p className="text-sm text-gray-500">Weekly appointment statistics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Appointments</span>
                  </div>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.appointmentsByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="appointments" 
                      fill="#7c3aed" 
                      radius={[4, 4, 0, 0]}
                      name="Appointments"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                  <p className="text-sm text-gray-500">Monthly revenue growth</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Revenue</span>
                  </div>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      fill="url(#colorRevenue)" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Doctors Chart */}
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Doctors</h3>
                  <p className="text-sm text-gray-500">Based on appointments and revenue</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.topDoctors}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#6b7280"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'appointments') return [value, 'Appointments'];
                        if (name === 'revenue') return [`$${value}`, 'Revenue'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="appointments" 
                      fill="#3b82f6" 
                      radius={[0, 4, 4, 0]}
                      name="Appointments"
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#8b5cf6" 
                      radius={[0, 4, 4, 0]}
                      name="Revenue ($)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Disease Trends Chart */}
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Disease Trends</h3>
                  <p className="text-sm text-gray-500">Common conditions analysis</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.diseaseTrends}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      //label={({ disease, percent }) => `${disease}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="disease"
                    >
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name, props) => [`${value} cases`, props.payload.disease]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Patient Growth Chart */}
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Patient Growth</h3>
                  <p className="text-sm text-gray-500">Cumulative patient growth over time</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.patientGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [value, 'Patients']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="patients" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Total Patients"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Doctors Table */}
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
              <div className="border-b border-gray-200/50 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Doctors Performance</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Doctor</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Specialization</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Appointments</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topDoctors?.map((doctor, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Stethoscope className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{doctor.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{doctor.specialization}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">{doctor.appointments}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-green-600">${doctor.revenue.toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Disease Trends Table */}
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
              <div className="border-b border-gray-200/50 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Disease Trends Analysis</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Disease</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cases</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Trend</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.diseaseTrends?.map((disease, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{disease.disease}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">{disease.count}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              {disease.trend === 'up' ? (
                                <>
                                  <TrendingUp className="w-4 h-4 text-red-500" />
                                  <span className="text-sm text-red-600">Increasing</span>
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
                                  <span className="text-sm text-green-600">Decreasing</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              disease.trend === 'up' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {disease.trend === 'up' ? 'High Priority' : 'Under Control'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Insights</h3>
                <p className="text-sm text-gray-500">Key findings from the analytics</p>
              </div>
              <button className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer">
                View Detailed Report →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InsightCard
                title="Peak Appointment Hours"
                description="Most appointments occur between 10 AM - 12 PM"
                icon={Clock}
                color="purple"
              />
              <InsightCard
                title="Highest Revenue Stream"
                description="Cardiology generates 25% of total revenue"
                icon={DollarSign}
                color="green"
              />
              <InsightCard
                title="Patient Satisfaction"
                description="94% positive feedback this month"
                icon={CheckCircle}
                color="blue"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, badge }) => (
  <div className="flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-gray-600 hover:bg-gray-50/80 hover:text-gray-900">
    <div className="flex items-center space-x-3.5">
      <Icon className="w-5 h-5 text-gray-500" />
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
        {badge}
      </span>
    )}
  </div>
);

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  change: string;
  color: 'purple' | 'green' | 'blue' | 'orange' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, color }) => {
  const colorClasses = {
    purple: 'from-purple-50 to-purple-100/50 border-purple-200/50 text-purple-600',
    green: 'from-green-50 to-green-100/50 border-green-200/50 text-green-600',
    blue: 'from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-600',
    orange: 'from-orange-50 to-orange-100/50 border-orange-200/50 text-orange-600',
    yellow: 'from-yellow-50 to-yellow-100/50 border-yellow-200/50 text-yellow-600'
  };

  const bgColorClasses = {
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50',
    green: 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/50'
  };

  return (
    <div className={`${bgColorClasses[color]} border rounded-2xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <p className={`text-xs font-medium mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change} from last month
          </p>
        </div>
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[colorClasses[color].split(' ').length - 1]}`} />
        </div>
      </div>
    </div>
  );
};

interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'purple' | 'green' | 'blue';
}

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, description, color }) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;