"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope, UserPlus, UserCheck, UserX, Shield,
  Search, Filter, MoreVertical, Edit, Trash2,
  CheckCircle, XCircle, Eye, Mail, Phone,
  Calendar, ChevronRight, Download, RefreshCw,
  TrendingUp, TrendingDown, Star, Award, Clock,
  MapPin, GraduationCap, BriefcaseMedical, Heart,
  Users, CreditCard, Settings, LogOut, HelpCircle,
  BarChart3, Activity, Bell
} from 'lucide-react';
import api from '@/lib/api/api';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  badge?: number;
  route?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, badge, route }) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (route) {
      router.push(route);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
    >
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
};

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

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  department?: string;
  qualification: string;
  experience: number;
  licenseNumber: string;
  status: 'active' | 'inactive' | 'pending' | 'on_leave';
  availability: 'available' | 'busy' | 'unavailable';
  rating: number;
  totalAppointments: number;
  consultationFee: number;
  revenue?: number;
  joinedDate: string;
  avatar?: string;
  nextAvailable?: string;
  location?: string;
}

const DoctorsModule = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    available: 0,
    onLeave: 0,
    totalRevenue: 0
  });

  const router = useRouter();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchQuery, selectedSpecialization, selectedStatus, selectedAvailability]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Mock data structure
      const mockDoctors: Doctor[] = [
        {
          _id: '1',
          name: 'Dr. Robert Wilson',
          email: 'robert.w@healthmate.com',
          phone: '+1 (555) 123-4567',
          specialization: 'Cardiology',
          department: 'Heart Center',
          qualification: 'MD, Cardiology',
          experience: 12,
          licenseNumber: 'CARD12345',
          status: 'active',
          availability: 'available',
          rating: 4.8,
          totalAppointments: 156,
          consultationFee: 150,
          revenue: 12500,
          joinedDate: '2022-03-15',
          nextAvailable: 'Today, 2:30 PM',
          location: 'Main Hospital, Floor 3'
        },
        {
          _id: '2',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.j@healthmate.com',
          phone: '+1 (555) 987-6543',
          specialization: 'Neurology',
          department: 'Neuro Sciences',
          qualification: 'MD, Neurology',
          experience: 10,
          licenseNumber: 'NEURO67890',
          status: 'active',
          availability: 'busy',
          rating: 4.9,
          totalAppointments: 142,
          consultationFee: 180,
          revenue: 11200,
          joinedDate: '2021-11-20',
          nextAvailable: 'Tomorrow, 10:00 AM',
          location: 'Neuro Center, Floor 5'
        },
        {
          _id: '3',
          name: 'Dr. Michael Brown',
          email: 'michael.b@healthmate.com',
          phone: '+1 (555) 456-7890',
          specialization: 'Orthopedics',
          department: 'Bone & Joint',
          qualification: 'MS, Orthopedics',
          experience: 8,
          licenseNumber: 'ORTHO54321',
          status: 'active',
          availability: 'available',
          rating: 4.7,
          totalAppointments: 128,
          consultationFee: 120,
          revenue: 9800,
          joinedDate: '2023-01-10',
          nextAvailable: 'Today, 4:00 PM',
          location: 'Ortho Center, Floor 2'
        },
        {
          _id: '4',
          name: 'Dr. Emily Davis',
          email: 'emily.d@healthmate.com',
          phone: '+1 (555) 234-5678',
          specialization: 'Pediatrics',
          department: 'Child Care',
          qualification: 'MD, Pediatrics',
          experience: 15,
          licenseNumber: 'PEDIA98765',
          status: 'active',
          availability: 'available',
          rating: 4.9,
          totalAppointments: 175,
          consultationFee: 100,
          revenue: 10500,
          joinedDate: '2020-08-25',
          nextAvailable: 'Today, 1:00 PM',
          location: 'Children\'s Wing, Floor 1'
        },
        {
          _id: '5',
          name: 'Dr. James Miller',
          email: 'james.m@healthmate.com',
          specialization: 'Dermatology',
          department: 'Skin Care',
          qualification: 'MD, Dermatology',
          experience: 7,
          licenseNumber: 'DERMA32145',
          status: 'pending',
          availability: 'unavailable',
          rating: 4.6,
          totalAppointments: 98,
          consultationFee: 90,
          joinedDate: '2024-12-01',
          location: 'Skin Center, Floor 4'
        },
        {
          _id: '6',
          name: 'Dr. Lisa Chen',
          email: 'lisa.c@healthmate.com',
          phone: '+1 (555) 345-6789',
          specialization: 'Gynecology',
          department: 'Women\'s Health',
          qualification: 'MD, Gynecology',
          experience: 11,
          licenseNumber: 'GYNEC65432',
          status: 'active',
          availability: 'busy',
          rating: 4.8,
          totalAppointments: 135,
          consultationFee: 130,
          revenue: 9200,
          joinedDate: '2021-06-15',
          nextAvailable: 'Tomorrow, 11:30 AM',
          location: 'Women\'s Health, Floor 3'
        },
        {
          _id: '7',
          name: 'Dr. David Wilson',
          email: 'david.w@healthmate.com',
          phone: '+1 (555) 567-8901',
          specialization: 'Oncology',
          department: 'Cancer Center',
          qualification: 'MD, Oncology',
          experience: 14,
          licenseNumber: 'ONCO78901',
          status: 'active',
          availability: 'available',
          rating: 4.7,
          totalAppointments: 112,
          consultationFee: 200,
          revenue: 14500,
          joinedDate: '2019-04-20',
          nextAvailable: 'Today, 3:00 PM',
          location: 'Cancer Center, Floor 6'
        },
        {
          _id: '8',
          name: 'Dr. Maria Garcia',
          email: 'maria.g@healthmate.com',
          specialization: 'Psychiatry',
          department: 'Mental Health',
          qualification: 'MD, Psychiatry',
          experience: 9,
          licenseNumber: 'PSYCH23456',
          status: 'on_leave',
          availability: 'unavailable',
          rating: 4.5,
          totalAppointments: 85,
          consultationFee: 160,
          revenue: 6800,
          joinedDate: '2022-09-10',
          location: 'Mental Health, Floor 4'
        },
        {
          _id: '9',
          name: 'Dr. Thomas Lee',
          email: 'thomas.l@healthmate.com',
          phone: '+1 (555) 678-9012',
          specialization: 'General Surgery',
          department: 'Surgery',
          qualification: 'MS, Surgery',
          experience: 16,
          licenseNumber: 'SURG34567',
          status: 'active',
          availability: 'busy',
          rating: 4.9,
          totalAppointments: 165,
          consultationFee: 220,
          revenue: 18200,
          joinedDate: '2018-12-05',
          nextAvailable: 'Tomorrow, 9:00 AM',
          location: 'Surgical Wing, Floor 7'
        },
        {
          _id: '10',
          name: 'Dr. Amanda Scott',
          email: 'amanda.s@healthmate.com',
          phone: '+1 (555) 789-0123',
          specialization: 'Radiology',
          department: 'Imaging',
          qualification: 'MD, Radiology',
          experience: 6,
          licenseNumber: 'RADIO45678',
          status: 'active',
          availability: 'available',
          rating: 4.4,
          totalAppointments: 92,
          consultationFee: 110,
          revenue: 7600,
          joinedDate: '2023-07-20',
          nextAvailable: 'Today, 11:00 AM',
          location: 'Imaging Center, Floor 2'
        }
      ];

      setDoctors(mockDoctors);
      calculateStats(mockDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (doctorsList: Doctor[]) => {
    const stats = {
      total: doctorsList.length,
      active: doctorsList.filter(d => d.status === 'active').length,
      pending: doctorsList.filter(d => d.status === 'pending').length,
      available: doctorsList.filter(d => d.availability === 'available').length,
      onLeave: doctorsList.filter(d => d.status === 'on_leave').length,
      totalRevenue: doctorsList.reduce((sum, doc) => sum + (doc.revenue || 0), 0)
    };
    setTotalStats(stats);
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        doctor.email.toLowerCase().includes(query) ||
        doctor.department?.toLowerCase().includes(query)
      );
    }

    // Specialization filter
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(doctor => doctor.status === selectedStatus);
    }

    // Availability filter
    if (selectedAvailability !== 'all') {
      filtered = filtered.filter(doctor => doctor.availability === selectedAvailability);
    }

    setFilteredDoctors(filtered);
    setCurrentPage(1);
  };

  const getSpecializations = () => {
    const specializations = doctors.map(d => d.specialization);
    return Array.from(new Set(specializations));
  };

  const handleStatusUpdate = async (doctorId: string, newStatus: Doctor['status']) => {
    try {
      // In real app, this would be your API endpoint
      await api.put(`/doctors/${doctorId}/status`, { status: newStatus });
      
      setDoctors(doctors.map(doctor => 
        doctor._id === doctorId ? { ...doctor, status: newStatus } : doctor
      ));
      
      alert(`Doctor status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating doctor status:', error);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      try {
        // In real app, this would be your API endpoint
        await api.delete(`/doctors/${doctorId}`);
        
        setDoctors(doctors.filter(doctor => doctor._id !== doctorId));
        alert('Doctor deleted successfully');
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const getStatusColor = (status: Doctor['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'on_leave': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvailabilityColor = (availability: Doctor['availability']) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'busy': return 'bg-yellow-100 text-yellow-700';
      case 'unavailable': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSpecializationColor = (specialization: string) => {
    const colors = ['bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700'];
    const index = specialization.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

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
          <p className="mt-6 text-gray-600 font-medium">Loading doctors...</p>
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
          <NavItem icon={BarChart3} label="Dashboard" route="/admin/dashboard" />
          <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border border-purple-200/50 cursor-pointer">
            <div className="flex items-center space-x-3.5">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Doctors</span>
            </div>
          </div>
          <NavItem icon={UserPlus} label="Patients" route="/admin/patients" />
          <NavItem icon={Calendar} label="Appointments" route="/admin/appointments" />
          <NavItem icon={CreditCard} label="Billing" route="/admin/billing" />
        </nav>

        <div className="p-5 space-y-2 border-t border-gray-200/50">
          <NavItem icon={HelpCircle} label="Help & Support" route="/admin/help" />
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
              <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
              <span className="text-sm font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {totalStats.total} Total Doctors
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchDoctors}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Add New Doctor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              label="Total Doctors"
              value={totalStats.total}
              icon={Stethoscope}
              color="purple"
              trend="+5%"
            />
            <StatCard
              label="Active Now"
              value={totalStats.active}
              icon={UserCheck}
              color="green"
              trend="+2"
            />
            <StatCard
              label="Available"
              value={totalStats.available}
              icon={CheckCircle}
              color="blue"
              trend="+3"
            />
            <StatCard
              label="Pending"
              value={totalStats.pending}
              icon={Clock}
              color="yellow"
              trend="-1"
            />
            <StatCard
              label="On Leave"
              value={totalStats.onLeave}
              icon={UserX}
              color="orange"
              trend="+1"
            />
            <StatCard
              label="Total Revenue"
              value={`$${totalStats.totalRevenue.toLocaleString()}`}
              icon={BriefcaseMedical}
              color="green"
              trend="+15%"
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
                  placeholder="Search doctors by name, specialty, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Specializations</option>
                    {getSpecializations().map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
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
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Availability</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
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

        {/* Doctors Table */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
            <div className="border-b border-gray-200/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Doctors</h3>
                <p className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredDoctors.length)} of {filteredDoctors.length} doctors
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Doctor</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Specialization</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Performance</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDoctors.length > 0 ? (
                    currentDoctors.map((doctor) => (
                      <tr 
                        key={doctor._id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                              {doctor.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doctor.name}</p>
                              <p className="text-sm text-gray-500">{doctor.email}</p>
                              {doctor.department && (
                                <p className="text-xs text-blue-600 mt-1">
                                  {doctor.department}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getSpecializationColor(doctor.specialization)}`}>
                              {doctor.specialization}
                            </span>
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <GraduationCap className="w-3 h-3" />
                              <span>{doctor.qualification}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <BriefcaseMedical className="w-3 h-3" />
                              <span>{doctor.experience} years exp</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            {doctor.phone && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{doctor.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{doctor.email}</span>
                            </div>
                            {doctor.location && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span className="text-xs">{doctor.location}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doctor.status)}`}>
                              {doctor.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {doctor.status === 'on_leave' && <Clock className="w-3 h-3 mr-1" />}
                              {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1).replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(doctor.availability)}`}>
                              {doctor.availability === 'available' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {doctor.availability === 'busy' && <Clock className="w-3 h-3 mr-1" />}
                              {doctor.availability.charAt(0).toUpperCase() + doctor.availability.slice(1)}
                            </span>
                            {doctor.nextAvailable && (
                              <div className="flex items-center space-x-1 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>Next: {doctor.nextAvailable}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{doctor.rating}/5.0</span>
                              <span className="text-xs text-gray-500">({doctor.totalAppointments} apps)</span>
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              ${doctor.consultationFee}/visit
                            </div>
                            {doctor.revenue && (
                              <div className="text-xs text-gray-600">
                                Revenue: ${doctor.revenue.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {/* View doctor details */}}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:text-purple-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button 
                              onClick={() => {/* Edit doctor */}}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            {doctor.status !== 'on_leave' ? (
                              <button 
                                onClick={() => handleStatusUpdate(doctor._id, 'on_leave')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:text-orange-600"
                                title="Mark as On Leave"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleStatusUpdate(doctor._id, 'active')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:text-green-600"
                                title="Activate Doctor"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            
                            {doctor.status !== 'pending' && (
                              <button 
                                onClick={() => handleDeleteDoctor(doctor._id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:text-red-600"
                                title="Delete Doctor"
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
                            <Stethoscope className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No doctors found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredDoctors.length > itemsPerPage && (
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
                <h3 className="text-lg font-semibold text-gray-900">Quick Doctor Actions</h3>
                <p className="text-sm text-gray-500">Manage doctors efficiently</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ActionCard
                icon={UserPlus}
                title="Add New Doctor"
                description="Register new medical professional"
                color="purple"
                onClick={() => {/* Add doctor logic */}}
              />
              <ActionCard
                icon={Award}
                title="Review Applications"
                description="Review pending doctor applications"
                color="blue"
                onClick={() => {/* Review applications logic */}}
              />
              <ActionCard
                icon={Calendar}
                title="Schedule Management"
                description="Manage doctor schedules"
                color="green"
                onClick={() => {/* Schedule management logic */}}
              />
              <ActionCard
                icon={Heart}
                title="Performance Review"
                description="Review doctor performance metrics"
                color="red"
                onClick={() => {/* Performance review logic */}}
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
  value: number | string;
  icon: React.ElementType;
  color: 'purple' | 'green' | 'blue' | 'yellow' | 'orange' | 'red';
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    purple: 'from-purple-50 to-purple-100/50 border-purple-200/50 text-purple-600',
    green: 'from-green-50 to-green-100/50 border-green-200/50 text-green-600',
    blue: 'from-blue-50 to-blue-100/50 border-blue-200/50 text-blue-600',
    yellow: 'from-yellow-50 to-yellow-100/50 border-yellow-200/50 text-yellow-600',
    orange: 'from-orange-50 to-orange-100/50 border-orange-200/50 text-orange-600',
    red: 'from-red-50 to-red-100/50 border-red-200/50 text-red-600'
  };

  const bgColorClasses = {
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50',
    green: 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/50',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50',
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

export default DoctorsModule;