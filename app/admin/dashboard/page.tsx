"use client";

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Stethoscope, Calendar, CreditCard, Settings, LogOut, HelpCircle, Search, Edit, Plus, FileText, ChevronRight, Bell, Download, Filter, MoreVertical, BarChart3, TrendingUp, Shield, Activity, UserCheck, UserX, DollarSign, ClipboardList, AlertCircle, CheckCircle, XCircle, Eye, Trash2, Archive } from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  email: string;
  phone: string;
  hospitalName: string;
  status: 'active' | 'pending' | 'inactive';
  experienceYears: number;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  status: 'active' | 'inactive';
}

interface Appointment {
  _id: string;
  date: string;
  time: string;
  type: string;
  patientName: string;
  doctorName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Billing {
  _id: string;
  patientName: string;
  doctorName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
}

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'doctors' | 'patients' | 'appointments' | 'billing'>('overview');
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeAppointments: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchAdminData(),
          fetchStats(),
          fetchUsers(),
          fetchDoctors(),
          fetchPatients(),
          fetchAppointments(),
          fetchBilling()
        ]);
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data || response.data;
      setAdminData(userData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes, revenueRes] = await Promise.all([
        api.get('/analytics/total-patients'),
        api.get('/analytics/total-doctors'),
        api.get('/analytics/appointments'),
        api.get('/analytics/revenue')
      ]);

      setStats({
        totalPatients: patientsRes.data.total || 0,
        totalDoctors: doctorsRes.data.total || 0,
        totalAppointments: appointmentsRes.data.total || 0,
        totalRevenue: revenueRes.data.total || 0,
        pendingApprovals: doctorsRes.data.pending || 0,
        activeAppointments: appointmentsRes.data.active || 0
      });
    } catch (e) {
      console.log("Using mock stats data");
      setStats({
        totalPatients: 1250,
        totalDoctors: 85,
        totalAppointments: 320,
        totalRevenue: 45600,
        pendingApprovals: 12,
        activeAppointments: 45
      });
    }
  };

  const fetchUsers = async () => {
    try {
      // We'll fetch all users through separate endpoints
      // For now, use mock data
      setUsers([
        { _id: '1', name: 'John Smith', email: 'john@example.com', role: 'patient', status: 'active', createdAt: '2024-01-01' },
        { _id: '2', name: 'Dr. Sarah Johnson', email: 'sarah@example.com', role: 'doctor', status: 'active', createdAt: '2024-01-02' },
        { _id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', createdAt: '2024-01-01' },
      ]);
    } catch (e) {
      console.log("Using mock users data");
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors/all');
      setDoctors(response.data.data || response.data || []);
    } catch (e) {
      console.log("Using mock doctors data");
      setDoctors([
        { _id: '1', fullName: 'Dr. Robert Wilson', specialization: 'Cardiology', email: 'robert@example.com', phone: '+1234567890', hospitalName: 'City Hospital', status: 'active', experienceYears: 10 },
        { _id: '2', fullName: 'Dr. Emily Davis', specialization: 'Pediatrics', email: 'emily@example.com', phone: '+1234567891', hospitalName: 'Children Hospital', status: 'active', experienceYears: 8 },
        { _id: '3', fullName: 'Dr. Michael Brown', specialization: 'Orthopedics', email: 'michael@example.com', phone: '+1234567892', hospitalName: 'General Hospital', status: 'pending', experienceYears: 5 },
      ]);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients/all');
      setPatients(response.data.data || response.data || []);
    } catch (e) {
      console.log("Using mock patients data");
      setPatients([
        { _id: '1', name: 'John Smith', email: 'john@example.com', age: 45, gender: 'Male', bloodGroup: 'O+', status: 'active' },
        { _id: '2', name: 'Lisa White', email: 'lisa@example.com', age: 32, gender: 'Female', bloodGroup: 'A+', status: 'active' },
        { _id: '3', name: 'David Miller', email: 'david@example.com', age: 58, gender: 'Male', bloodGroup: 'B+', status: 'inactive' },
      ]);
    }
  };

  const fetchAppointments = async () => {
    try {
      // Admin would need a different endpoint to view all appointments
      // Using mock data for now
      setAppointments([
        { _id: '1', date: '2024-01-15', time: '09:00 AM', type: 'Consultation', patientName: 'John Smith', doctorName: 'Dr. Robert Wilson', status: 'scheduled' },
        { _id: '2', date: '2024-01-15', time: '10:30 AM', type: 'Follow-up', patientName: 'Lisa White', doctorName: 'Dr. Emily Davis', status: 'completed' },
        { _id: '3', date: '2024-01-16', time: '02:00 PM', type: 'Checkup', patientName: 'David Miller', doctorName: 'Dr. Michael Brown', status: 'cancelled' },
      ]);
    } catch (e) {
      console.log("Using mock appointments data");
    }
  };

  const fetchBilling = async () => {
    try {
      // Using mock billing data
      setBilling([
        { _id: '1', patientName: 'John Smith', doctorName: 'Dr. Robert Wilson', amount: 150, status: 'paid', date: '2024-01-14' },
        { _id: '2', patientName: 'Lisa White', doctorName: 'Dr. Emily Davis', amount: 200, status: 'pending', date: '2024-01-15' },
        { _id: '3', patientName: 'David Miller', doctorName: 'Dr. Michael Brown', amount: 300, status: 'overdue', date: '2024-01-13' },
      ]);
    } catch (e) {
      console.log("Using mock billing data");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isLoggedIn');
    router.push('/auth/admin/login');
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        // Determine endpoint based on user role
        // This would need additional logic
        console.log('Delete user:', id);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleApproveDoctor = async (id: string) => {
    try {
      // Update doctor status to active
      console.log('Approve doctor:', id);
    } catch (error) {
      console.error('Error approving doctor:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
      case 'cancelled':
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
          <NavItem 
            icon={BarChart3} 
            label="Dashboard" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          />
          <NavItem 
            icon={Users} 
            label="Users" 
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <NavItem 
            icon={Stethoscope} 
            label="Doctors" 
            active={activeTab === 'doctors'}
            onClick={() => setActiveTab('doctors')}
            badge={stats.pendingApprovals}
          />
          <NavItem 
            icon={UserPlus} 
            label="Patients" 
            active={activeTab === 'patients'}
            onClick={() => setActiveTab('patients')}
          />
          <NavItem 
            icon={Calendar} 
            label="Appointments" 
            active={activeTab === 'appointments'}
            onClick={() => setActiveTab('appointments')}
          />
          <NavItem 
            icon={CreditCard} 
            label="Billing" 
            active={activeTab === 'billing'}
            onClick={() => setActiveTab('billing')}
          />
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
                  placeholder="Search users, records, reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
              </button>
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
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {adminData?.name?.split(' ')[0] || 'Admin'}!</h1>
            <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              System Administrator
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export Report</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add User</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="px-8 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard
                  icon={UserPlus}
                  label="Total Patients"
                  value={stats.totalPatients}
                  change="+12%"
                  color="purple"
                />
                <StatCard
                  icon={Stethoscope}
                  label="Total Doctors"
                  value={stats.totalDoctors}
                  change="+5%"
                  color="green"
                />
                <StatCard
                  icon={Calendar}
                  label="Active Appointments"
                  value={stats.activeAppointments}
                  change="+8"
                  color="blue"
                />
                <StatCard
                  icon={CreditCard}
                  label="Total Revenue"
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  change="+15%"
                  color="orange"
                />
                <StatCard
                  icon={UserCheck}
                  label="Pending Approvals"
                  value={stats.pendingApprovals}
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

            {/* Recent Activity & Charts */}
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Appointments */}
                <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
                    <button className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer">View All</button>
                  </div>
                  <div className="space-y-4">
                    {appointments.slice(0, 5).map((appointment) => (
                      <div key={appointment._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200">
                        <div>
                          <p className="font-medium text-gray-900">{appointment.patientName}</p>
                          <p className="text-sm text-gray-500">with {appointment.doctorName}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(appointment.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                    <button className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer">View All</button>
                  </div>
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                            user.role === 'doctor' ? 'bg-green-100 text-green-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {user.role === 'admin' ? <Shield className="w-4 h-4" /> :
                             user.role === 'doctor' ? <Stethoscope className="w-4 h-4" /> :
                             <Users className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* System Management */}
            <div className="px-8 pb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">System Management</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg border border-purple-200 hover:bg-purple-50 transition-all duration-200 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Manage</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ManagementCard
                    icon={Users}
                    title="User Management"
                    description="Manage all system users"
                    action="View Users"
                    onClick={() => setActiveTab('users')}
                  />
                  <ManagementCard
                    icon={Stethoscope}
                    title="Doctor Approvals"
                    description="Review and approve doctor applications"
                    action="Review Applications"
                    badge={stats.pendingApprovals}
                    onClick={() => setActiveTab('doctors')}
                  />
                  <ManagementCard
                    icon={CreditCard}
                    title="Billing Overview"
                    description="Monitor payments and revenue"
                    action="View Reports"
                    onClick={() => setActiveTab('billing')}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="px-8 pb-8">
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
              <div className="border-b border-gray-200/50 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage all system users and permissions</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add New User</span>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Joined</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'doctor' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 cursor-pointer">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="px-8 pb-8">
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
              <div className="border-b border-gray-200/50 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Doctor Management</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage doctors and their applications</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Doctor</span>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Doctor</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Specialization</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hospital</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Experience</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => (
                        <tr key={doctor._id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{doctor.fullName}</p>
                              <p className="text-sm text-gray-500">{doctor.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium text-gray-900">{doctor.specialization}</span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {doctor.hospitalName}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{doctor.experienceYears} years</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doctor.status)}`}>
                              {doctor.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {doctor.status === 'pending' && (
                                <button 
                                  onClick={() => handleApproveDoctor(doctor._id)}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-all duration-200 cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 cursor-pointer">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="px-8 pb-8">
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
              <div className="border-b border-gray-200/50 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Patient Management</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage all patient records and information</p>
                </div>
              </div>
              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Age</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Gender</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Blood Group</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient._id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-500">{patient.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{patient.age || 'N/A'}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{patient.gender || 'N/A'}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium text-gray-900">{patient.bloodGroup || 'N/A'}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                              {patient.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 cursor-pointer">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer">
                                <Archive className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="px-8 pb-8">
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
              <div className="border-b border-gray-200/50 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
                  <p className="text-gray-500 text-sm mt-1">View and manage all appointments</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 gap-4">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="border border-gray-200/50 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 bg-white">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start space-x-6">
                          <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 min-w-[80px]">
                            <p className="text-2xl font-bold text-purple-900">{new Date(appointment.date).getDate()}</p>
                            <p className="text-xs font-medium text-purple-700 mt-1">
                              {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">{appointment.time}</p>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">{appointment.type}</p>
                              <div className="flex flex-wrap gap-4 mt-2">
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500">Patient</p>
                                    <p className="font-medium">{appointment.patientName}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Stethoscope className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500">Doctor</p>
                                    <p className="font-medium">{appointment.doctorName}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="px-8 pb-8">
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
              <div className="border-b border-gray-200/50 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Billing & Payments</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage invoices, payments, and revenue</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Create Invoice</span>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Invoice</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Doctor</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.map((bill) => (
                        <tr key={bill._id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                          <td className="py-4 px-4">
                            <p className="font-medium text-gray-900">INV-{bill._id.slice(-6).toUpperCase()}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">{bill.patientName}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">{bill.doctorName}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-gray-900">${bill.amount}</p>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {formatDate(bill.date)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                              {bill.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              {bill.status === 'pending' && (
                                <button className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-all duration-200 cursor-pointer">
                                  Mark Paid
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false, badge, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${active
      ? 'bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border border-purple-200/50'
      : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
      }`}
  >
    <div className="flex items-center space-x-3.5">
      <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
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

interface ManagementCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  badge?: number;
  onClick: () => void;
}

const ManagementCard: React.FC<ManagementCardProps> = ({ icon: Icon, title, description, action, badge, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer"
  >
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-purple-600" />
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    <button className="text-sm font-medium text-purple-600 hover:text-purple-700 cursor-pointer">
      {action} →
    </button>
  </div>
);

export default AdminDashboard;