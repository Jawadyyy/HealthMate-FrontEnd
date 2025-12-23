"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserPlus, UserCheck, UserX, Shield, 
  Search, Filter, MoreVertical, Edit, Trash2, 
  CheckCircle, XCircle, Eye, Mail, Phone, 
  Calendar, ChevronRight, Download, RefreshCw,
  TrendingUp, TrendingDown, Bell, Stethoscope, 
  CreditCard, Settings, LogOut, HelpCircle,
  BarChart3, Activity, Clock, DollarSign
} from 'lucide-react';
import api from '@/lib/api/api';

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

interface HeaderProps {
  adminData?: any;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
}

const Header = ({ 
  adminData, 
  searchQuery = '', 
  onSearchChange,
  searchPlaceholder = "Search analytics, reports..."
}: HeaderProps) => {
  const router = useRouter();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleNotificationClick = () => {
    router.push('/admin/notifications');
  };

  const handleProfileClick = () => {
    router.push('/admin/profile');
  };

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
            />
          </div>
        </div>
        <div className="flex items-center space-x-5">
          <button 
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div 
            onClick={handleProfileClick}
            className="flex items-center space-x-3 cursor-pointer"
          >
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
  );
};

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'admin' | 'staff';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  doctorInfo?: {
    specialization?: string;
    licenseNumber?: string;
    rating?: number;
  };
  patientInfo?: {
    age?: number;
    bloodGroup?: string;
  };
}

const UsersComponent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    doctors: 0,
    patients: 0
  });

  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // In real app, this would be your API endpoint
      const response = await api.get('/users');
      const usersData = response.data.data || response.data;
      
      // Mock data structure
      const mockUsers: User[] = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          role: 'patient',
          status: 'active',
          createdAt: '2024-01-15',
          lastLogin: '2024-12-23',
          patientInfo: {
            age: 32,
            bloodGroup: 'O+'
          }
        },
        {
          _id: '2',
          name: 'Dr. Sarah Wilson',
          email: 'sarah.w@clinic.com',
          phone: '+1 (555) 987-6543',
          role: 'doctor',
          status: 'active',
          createdAt: '2023-11-20',
          lastLogin: '2024-12-22',
          doctorInfo: {
            specialization: 'Cardiology',
            licenseNumber: 'MED123456',
            rating: 4.8
          }
        },
        {
          _id: '3',
          name: 'Robert Chen',
          email: 'robert.c@example.com',
          phone: '+1 (555) 456-7890',
          role: 'patient',
          status: 'pending',
          createdAt: '2024-12-20',
          patientInfo: {
            age: 45,
            bloodGroup: 'A+'
          }
        },
        {
          _id: '4',
          name: 'Dr. Michael Brown',
          email: 'michael.b@clinic.com',
          role: 'doctor',
          status: 'suspended',
          createdAt: '2023-08-10',
          lastLogin: '2024-11-15',
          doctorInfo: {
            specialization: 'Neurology',
            licenseNumber: 'MED789012',
            rating: 4.5
          }
        },
        {
          _id: '5',
          name: 'Emma Johnson',
          email: 'emma.j@example.com',
          phone: '+1 (555) 234-5678',
          role: 'patient',
          status: 'active',
          createdAt: '2024-03-05',
          lastLogin: '2024-12-23',
          patientInfo: {
            age: 28,
            bloodGroup: 'B+'
          }
        },
        {
          _id: '6',
          name: 'Dr. James Miller',
          email: 'james.m@clinic.com',
          phone: '+1 (555) 345-6789',
          role: 'doctor',
          status: 'active',
          createdAt: '2024-02-14',
          lastLogin: '2024-12-22',
          doctorInfo: {
            specialization: 'Dermatology',
            licenseNumber: 'MED345678',
            rating: 4.9
          }
        },
        {
          _id: '7',
          name: 'Lisa Wang',
          email: 'lisa.w@example.com',
          role: 'patient',
          status: 'inactive',
          createdAt: '2024-09-30',
          lastLogin: '2024-10-15',
          patientInfo: {
            age: 35,
            bloodGroup: 'AB+'
          }
        },
        {
          _id: '8',
          name: 'Dr. Emily Davis',
          email: 'emily.d@clinic.com',
          phone: '+1 (555) 567-8901',
          role: 'doctor',
          status: 'pending',
          createdAt: '2024-12-10',
          doctorInfo: {
            specialization: 'Pediatrics',
            licenseNumber: 'MED901234'
          }
        },
        {
          _id: '9',
          name: 'David Kim',
          email: 'david.k@example.com',
          phone: '+1 (555) 678-9012',
          role: 'patient',
          status: 'active',
          createdAt: '2024-05-18',
          lastLogin: '2024-12-23',
          patientInfo: {
            age: 41,
            bloodGroup: 'O-'
          }
        },
        {
          _id: '10',
          name: 'System Admin',
          email: 'admin@healthmate.com',
          role: 'admin',
          status: 'active',
          createdAt: '2023-01-01',
          lastLogin: '2024-12-23'
        }
      ];

      setUsers(mockUsers);
      calculateStats(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersList: User[]) => {
    const stats = {
      total: usersList.length,
      active: usersList.filter(u => u.status === 'active').length,
      pending: usersList.filter(u => u.status === 'pending').length,
      suspended: usersList.filter(u => u.status === 'suspended').length,
      doctors: usersList.filter(u => u.role === 'doctor').length,
      patients: usersList.filter(u => u.role === 'patient').length
    };
    setTotalStats(stats);
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.doctorInfo?.specialization?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (userId: string, newStatus: User['status']) => {
    try {
      // In real app, this would be your API endpoint
      await api.put(`/users/${userId}/status`, { status: newStatus });
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      
      // Show success message
      alert(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        // In real app, this would be your API endpoint
        await api.delete(`/users/${userId}`);
        
        setUsers(users.filter(user => user._id !== userId));
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'doctor': return 'bg-blue-100 text-blue-700';
      case 'patient': return 'bg-green-100 text-green-700';
      case 'staff': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'doctor': return <UserCheck className="w-4 h-4" />;
      case 'patient': return <UserPlus className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
          <p className="mt-6 text-gray-600 font-medium">Loading users...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
      {/* Sidebar - Copied from AdminDashboard */}
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
          <NavItem icon={BarChart3} label="Dashboard" />
          <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border border-purple-200/50 cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Users</span>
            </div>
          </div>
          <NavItem icon={Stethoscope} label="Doctors" />
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
        <Header 
          adminData={{ name: 'System Admin' }}
          searchPlaceholder="Search analytics, reports..."
        />
        
        {/* Page-specific Header */}
        <div className="sticky top-[84px] z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <span className="text-sm font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {totalStats.total} Total Users
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchUsers}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Add New User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              label="Total Users"
              value={totalStats.total}
              icon={Users}
              color="purple"
              trend="+12%"
            />
            <StatCard
              label="Active Users"
              value={totalStats.active}
              icon={UserCheck}
              color="green"
              trend="+8%"
            />
            <StatCard
              label="Pending"
              value={totalStats.pending}
              icon={UserPlus}
              color="yellow"
              trend="-2"
            />
            <StatCard
              label="Doctors"
              value={totalStats.doctors}
              icon={UserCheck}
              color="blue"
              trend="+5"
            />
            <StatCard
              label="Patients"
              value={totalStats.patients}
              icon={UserPlus}
              color="green"
              trend="+15"
            />
            <StatCard
              label="Suspended"
              value={totalStats.suspended}
              icon={UserX}
              color="red"
              trend="+1"
            />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-8 pb-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctors</option>
                    <option value="patient">Patients</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                
                <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
            <div className="border-b border-gray-200/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                <p className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Joined Date</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr 
                        key={user._id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              {user.doctorInfo?.specialization && (
                                <p className="text-xs text-blue-600 mt-1">
                                  {user.doctorInfo.specialization}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 ${getRoleColor(user.role).split(' ')[0]} rounded-lg flex items-center justify-center`}>
                              {getRoleIcon(user.role)}
                            </div>
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getRoleColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {user.phone && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {user.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                          {user.lastLogin && (
                            <p className="text-xs text-gray-500 mt-1">
                              Last login: {new Date(user.lastLogin).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {/* View user details */}}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:text-purple-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button 
                              onClick={() => {/* Edit user */}}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            {user.status !== 'suspended' ? (
                              <button 
                                onClick={() => handleStatusUpdate(user._id, 'suspended')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:text-red-600"
                                title="Suspend User"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleStatusUpdate(user._id, 'active')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:text-green-600"
                                title="Activate User"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            
                            {user.role !== 'admin' && (
                              <button 
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:text-red-600"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 px-6 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No users found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > itemsPerPage && (
              <div className="border-t border-gray-200/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
                      currentPage === 1 
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    <span className="text-sm font-medium">Previous</span>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <span className="text-sm font-medium">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quick User Actions</h3>
                <p className="text-sm text-gray-500">Manage users efficiently</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ActionCard
                icon={UserPlus}
                title="Add New User"
                description="Create new user account"
                color="purple"
                onClick={() => {/* Add user logic */}}
              />
              <ActionCard
                icon={Download}
                title="Export Users"
                description="Download user data"
                color="green"
                onClick={() => {/* Export logic */}}
              />
              <ActionCard
                icon={UserCheck}
                title="Bulk Approve"
                description="Approve pending users"
                color="blue"
                onClick={() => {/* Bulk approve logic */}}
              />
              <ActionCard
                icon={UserX}
                title="Cleanup Inactive"
                description="Remove old inactive users"
                color="red"
                onClick={() => {/* Cleanup logic */}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'purple' | 'green' | 'blue' | 'yellow' | 'red';
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    purple: 'from-purple-50 to-purple-100/50 border-purple-200/50 text-purple-600',
    green: 'from-green-50 to-green-100/50 border-green-200/50 text-green-600',
    blue: 'from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-600',
    yellow: 'from-yellow-50 to-yellow-100/50 border-yellow-200/50 text-yellow-600',
    red: 'from-red-50 to-red-100/50 border-red-200/50 text-red-600'
  };

  const bgColorClasses = {
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50',
    green: 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/50',
    red: 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50'
  };

  return (
    <div className={`${bgColorClasses[color]} border rounded-2xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {trend.startsWith('+') ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend} from last month
            </span>
          </div>
        </div>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[colorClasses[color].split(' ').length - 1]}`} />
        </div>
      </div>
    </div>
  );
};

interface ActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'purple' | 'green' | 'blue' | 'red';
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, title, description, color, onClick }) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <button 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer text-left group"
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-all duration-200">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default UsersComponent;