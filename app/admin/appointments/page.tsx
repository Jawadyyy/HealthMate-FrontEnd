"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Search, Filter, Download, MoreVertical, 
  Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle, ChevronRight,
  Plus, FileText, Phone, MapPin, Mail, Stethoscope, TrendingUp,
  Shield, LogOut, HelpCircle, Settings, Users, UserPlus, CreditCard,
  BarChart3, Bell, ArrowUpDown, RefreshCw
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine' | 'surgery';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patientPhone?: string;
  patientEmail?: string;
  symptoms?: string[];
}

interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  today: number;
  upcoming: number;
}

const AppointmentsModule = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    today: 0,
    upcoming: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchQuery, statusFilter, dateFilter, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, statsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/appointments/stats')
      ]);

      const appointmentsData = appointmentsRes.data.data || appointmentsRes.data || [];
      const statsData = statsRes.data.data || statsRes.data || {};

      setAppointments(appointmentsData);
      setStats({
        total: statsData.total || appointmentsData.length,
        scheduled: statsData.scheduled || 0,
        confirmed: statsData.confirmed || 0,
        completed: statsData.completed || 0,
        cancelled: statsData.cancelled || 0,
        noShow: statsData.noShow || 0,
        today: statsData.today || 0,
        upcoming: statsData.upcoming || 0
      });
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments(getMockAppointments());
      setStats(getMockStats());
    } finally {
      setLoading(false);
    }
  };

  const getMockAppointments = (): Appointment[] => [
    {
      _id: '1',
      patientId: 'p001',
      patientName: 'John Smith',
      doctorId: 'd001',
      doctorName: 'Dr. Robert Wilson',
      doctorSpecialization: 'Cardiology',
      date: '2024-01-20',
      time: '10:30 AM',
      status: 'confirmed',
      type: 'consultation',
      notes: 'Routine heart checkup',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
      patientPhone: '+1 (555) 123-4567',
      patientEmail: 'john.smith@email.com',
      symptoms: ['Chest pain', 'Shortness of breath']
    },
    {
      _id: '2',
      patientId: 'p002',
      patientName: 'Emily Johnson',
      doctorId: 'd002',
      doctorName: 'Dr. Sarah Miller',
      doctorSpecialization: 'Pediatrics',
      date: '2024-01-21',
      time: '02:00 PM',
      status: 'scheduled',
      type: 'routine',
      notes: 'Annual physical examination',
      createdAt: '2024-01-11',
      updatedAt: '2024-01-11',
      patientPhone: '+1 (555) 987-6543'
    },
    {
      _id: '3',
      patientId: 'p003',
      patientName: 'Michael Brown',
      doctorId: 'd003',
      doctorName: 'Dr. James Wilson',
      doctorSpecialization: 'Orthopedics',
      date: '2024-01-19',
      time: '11:15 AM',
      status: 'completed',
      type: 'follow-up',
      notes: 'Post-surgery follow-up',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-19',
      symptoms: ['Knee pain']
    },
    {
      _id: '4',
      patientId: 'p004',
      patientName: 'Sophia Davis',
      doctorId: 'd004',
      doctorName: 'Dr. Lisa Anderson',
      doctorSpecialization: 'Dermatology',
      date: '2024-01-22',
      time: '09:45 AM',
      status: 'confirmed',
      type: 'consultation',
      notes: 'Skin condition evaluation',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-12'
    },
    {
      _id: '5',
      patientId: 'p005',
      patientName: 'David Wilson',
      doctorId: 'd005',
      doctorName: 'Dr. Michael Chen',
      doctorSpecialization: 'Neurology',
      date: '2024-01-18',
      time: '03:30 PM',
      status: 'cancelled',
      type: 'consultation',
      notes: 'Migraine consultation',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-17'
    }
  ];

  const getMockStats = (): AppointmentStats => ({
    total: 128,
    scheduled: 45,
    confirmed: 56,
    completed: 18,
    cancelled: 7,
    noShow: 2,
    today: 12,
    upcoming: 67
  });

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(query) ||
        apt.doctorName.toLowerCase().includes(query) ||
        apt.doctorSpecialization.toLowerCase().includes(query) ||
        apt._id.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(apt => {
        const aptDate = apt.date;
        switch (dateFilter) {
          case 'today': return aptDate === today;
          case 'tomorrow': {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return aptDate === tomorrow.toISOString().split('T')[0];
          }
          case 'week': {
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return new Date(aptDate) <= weekFromNow && new Date(aptDate) >= new Date();
          }
          default: return true;
        }
      });
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      loadAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleLogout = () => {
    ['token', 'role', 'isLoggedIn'].forEach(key => localStorage.removeItem(key));
    router.push('/auth/admin/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-red-100 text-red-700',
      'no-show': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status];
  };

  const getTypeColor = (type: Appointment['type']) => {
    const colors = {
      consultation: 'bg-purple-100 text-purple-700',
      'follow-up': 'bg-blue-100 text-blue-700',
      emergency: 'bg-red-100 text-red-700',
      routine: 'bg-green-100 text-green-700',
      surgery: 'bg-orange-100 text-orange-700'
    };
    return colors[type];
  };

  if (loading) {
    return <LoadingScreen message="Loading appointments..." />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
      <Sidebar handleLogout={handleLogout} />

      <div className="flex-1 overflow-auto ml-72">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Breadcrumb & Quick Actions */}
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
            <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              {filteredAppointments.length} appointments
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/admin/appointments/new')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Appointment</span>
            </button>
            <ActionButton icon={Download} label="Export" />
            <ActionButton icon={RefreshCw} label="Refresh" onClick={loadAppointments} />
          </div>
        </div>

        {/* Stats Cards */}
        <StatsGrid stats={stats} />

        {/* Filters Panel */}
        {showFilters && (
          <FiltersPanel
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
        )}

        {/* Main Content */}
        <div className="px-8 pb-8">
          {viewMode === 'list' ? (
            <AppointmentsList
              appointments={filteredAppointments}
              selectedAppointment={selectedAppointment}
              setSelectedAppointment={setSelectedAppointment}
              handleStatusChange={handleStatusChange}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getTypeColor={getTypeColor}
            />
          ) : (
            <CalendarView appointments={filteredAppointments} />
          )}

          {selectedAppointment && (
            <AppointmentDetail
              appointment={selectedAppointment}
              onClose={() => setSelectedAppointment(null)}
              handleStatusChange={handleStatusChange}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar: React.FC<{ handleLogout: () => void }> = ({ handleLogout }) => (
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
      <NavItem icon={Stethoscope} label="Doctors" route="/admin/doctors" />
      <NavItem icon={UserPlus} label="Patients" route="/admin/patients" />
      <ActiveNavItem icon={Calendar} label="Appointments" />
      <NavItem icon={CreditCard} label="Billing" route="/admin/billing" />
    </nav>

    <div className="p-5 space-y-2 border-t border-gray-200/50">
      <NavItem icon={HelpCircle} label="Help & Support" route="/admin/help" />
      <div onClick={handleLogout} className="w-full"><NavItem icon={LogOut} label="Logout" /></div>
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
);

const NavItem: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  route?: string;
}> = ({ icon: Icon, label, route }) => {
  const router = useRouter();
  
  return (
    <div 
      onClick={() => route && router.push(route)}
      className="flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
    >
      <div className="flex items-center space-x-3.5">
        <Icon className="w-5 h-5 text-gray-500" />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
};

const ActiveNavItem: React.FC<{ icon: React.ElementType; label: string }> = ({ icon: Icon, label }) => (
  <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border border-purple-200/50 cursor-pointer">
    <div className="flex items-center space-x-3.5">
      <Icon className="w-5 h-5 text-purple-600" />
      <span className="font-medium">{label}</span>
    </div>
  </div>
);

// Header Component
const Header: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
}> = ({ searchQuery, setSearchQuery, showFilters, setShowFilters, viewMode, setViewMode }) => (
  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
      <div className="flex items-center space-x-5">
        <BellButton />
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              showFilters ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Filters
          </button>
        </div>
      </div>
    </div>
  </div>
);

const SearchBar: React.FC<{ 
  searchQuery: string; 
  setSearchQuery: (query: string) => void 
}> = ({ searchQuery, setSearchQuery }) => (
  <div className="relative flex-1 max-w-lg">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    <input
      type="text"
      placeholder="Search appointments, patients, doctors..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
    />
  </div>
);

const ViewToggle: React.FC<{
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
}> = ({ viewMode, setViewMode }) => (
  <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
    <button
      onClick={() => setViewMode('list')}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
        viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      List View
    </button>
    <button
      onClick={() => setViewMode('calendar')}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
        viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      Calendar View
    </button>
  </div>
);

const BellButton: React.FC = () => (
  <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
    <Bell className="w-5 h-5 text-gray-600" />
    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
  </button>
);

const ActionButton: React.FC<{ 
  icon: React.ElementType; 
  label: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// Stats Grid Component
const StatsGrid: React.FC<{ stats: AppointmentStats }> = ({ stats }) => (
  <div className="px-8 pb-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
      <StatCard label="Total" value={stats.total} change="+12%" color="purple" />
      <StatCard label="Scheduled" value={stats.scheduled} change="+8%" color="blue" />
      <StatCard label="Confirmed" value={stats.confirmed} change="+15%" color="green" />
      <StatCard label="Completed" value={stats.completed} change="+5%" color="purple" />
      <StatCard label="Cancelled" value={stats.cancelled} change="-3%" color="red" />
      <StatCard label="No Show" value={stats.noShow} change="+2%" color="yellow" />
      <StatCard label="Today" value={stats.today} change="+20%" color="orange" />
      <StatCard label="Upcoming" value={stats.upcoming} change="+10%" color="green" />
    </div>
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: number;
  change: string;
  color: 'purple' | 'green' | 'blue' | 'red' | 'yellow' | 'orange';
}> = ({ label, value, change, color }) => {
  const colorConfig = {
    purple: { bg: 'from-purple-50 to-purple-100/50 border-purple-200/50', text: 'text-purple-600' },
    green: { bg: 'from-green-50 to-green-100/50 border-green-200/50', text: 'text-green-600' },
    blue: { bg: 'from-blue-50 to-blue-100/50 border-blue-200/50', text: 'text-blue-600' },
    red: { bg: 'from-red-50 to-red-100/50 border-red-200/50', text: 'text-red-600' },
    yellow: { bg: 'from-yellow-50 to-yellow-100/50 border-yellow-200/50', text: 'text-yellow-600' },
    orange: { bg: 'from-orange-50 to-orange-100/50 border-orange-200/50', text: 'text-orange-600' }
  };

  return (
    <div className={`bg-gradient-to-br ${colorConfig[color].bg} border rounded-2xl p-6`}>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <p className={`text-xs font-medium mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last week
        </p>
      </div>
    </div>
  );
};

// Filters Panel Component
const FiltersPanel: React.FC<{
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
}> = ({ statusFilter, setStatusFilter, dateFilter, setDateFilter }) => (
  <div className="px-8 pb-6">
    <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button 
          onClick={() => {
            setStatusFilter('all');
            setDateFilter('all');
          }}
          className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
        >
          Clear All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
          <div className="flex flex-wrap gap-2">
            {['all', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
          <div className="flex flex-wrap gap-2">
            {['all', 'today', 'tomorrow', 'week'].map((range) => (
              <button
                key={range}
                onClick={() => setDateFilter(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  dateFilter === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Appointments List Component
const AppointmentsList: React.FC<{
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  setSelectedAppointment: (apt: Appointment | null) => void;
  handleStatusChange: (id: string, status: Appointment['status']) => Promise<void>;
  formatDate: (date: string) => string;
  getStatusColor: (status: Appointment['status']) => string;
  getTypeColor: (type: Appointment['type']) => string;
}> = ({ appointments, selectedAppointment, setSelectedAppointment, handleStatusChange, formatDate, getStatusColor, getTypeColor }) => (
  <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
    <div className="border-b border-gray-200/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Appointments</h3>
        <div className="flex items-center space-x-2">
          <button className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
            <ArrowUpDown className="w-4 h-4 inline mr-1" />
            Sort
          </button>
        </div>
      </div>
    </div>
    
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Doctor</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date & Time</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr 
                  key={appointment._id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                    selectedAppointment?._id === appointment._id ? 'bg-purple-50' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patientName}</p>
                        <p className="text-xs text-gray-500">{appointment.patientPhone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.doctorName}</p>
                      <p className="text-xs text-gray-500">{appointment.doctorSpecialization}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(appointment.date)}</p>
                      <p className="text-xs text-gray-500">{appointment.time}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                      {appointment.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <StatusDropdown 
                        currentStatus={appointment.status}
                        onStatusChange={(newStatus) => handleStatusChange(appointment._id, newStatus)}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setSelectedAppointment(appointment)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">No appointments found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const StatusDropdown: React.FC<{
  currentStatus: Appointment['status'];
  onStatusChange: (status: Appointment['status']) => void;
}> = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const statuses: Appointment['status'][] = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  onStatusChange(status);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Calendar View Component (Simplified)
const CalendarView: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => (
  <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar View</h3>
      <p className="text-gray-500">Calendar feature coming soon</p>
      <div className="mt-6 p-8 bg-gray-50 rounded-xl border border-gray-200">
        <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Interactive calendar view will be available in the next update</p>
      </div>
    </div>
  </div>
);

// Appointment Detail Component
const AppointmentDetail: React.FC<{
  appointment: Appointment;
  onClose: () => void;
  handleStatusChange: (id: string, status: Appointment['status']) => Promise<void>;
  formatDate: (date: string) => string;
  getStatusColor: (status: Appointment['status']) => string;
}> = ({ appointment, onClose, handleStatusChange, formatDate, getStatusColor }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <XCircle className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Info */}
          <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-600" />
              Patient Information
            </h3>
            <div className="space-y-3">
              <DetailRow label="Name" value={appointment.patientName} />
              <DetailRow label="Email" value={appointment.patientEmail || 'N/A'} />
              <DetailRow label="Phone" value={appointment.patientPhone || 'N/A'} />
              <DetailRow label="Patient ID" value={appointment.patientId} />
            </div>
          </div>

          {/* Doctor Info */}
          <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-gray-600" />
              Doctor Information
            </h3>
            <div className="space-y-3">
              <DetailRow label="Doctor" value={appointment.doctorName} />
              <DetailRow label="Specialization" value={appointment.doctorSpecialization} />
              <DetailRow label="Doctor ID" value={appointment.doctorId} />
            </div>
          </div>

          {/* Appointment Details */}
          <div className="md:col-span-2 bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-600" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <DetailRow label="Date" value={formatDate(appointment.date)} />
                <DetailRow label="Time" value={appointment.time} />
                <DetailRow label="Type" value={appointment.type} />
              </div>
              <div className="space-y-3">
                <DetailRow label="Status" value={
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                } />
                <DetailRow label="Created" value={formatDate(appointment.createdAt)} />
                <DetailRow label="Last Updated" value={formatDate(appointment.updatedAt)} />
              </div>
            </div>
          </div>

          {/* Symptoms & Notes */}
          {appointment.symptoms && appointment.symptoms.length > 0 && (
            <div className="md:col-span-2 bg-red-50/50 border border-red-100/50 rounded-xl p-5">
              <h3 className="font-medium text-red-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                Symptoms Reported
              </h3>
              <div className="flex flex-wrap gap-2">
                {appointment.symptoms.map((symptom, index) => (
                  <span key={index} className="text-sm bg-white text-red-600 px-4 py-2 rounded-lg border border-red-200">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {appointment.notes && (
            <div className="md:col-span-2 bg-purple-50/50 border border-purple-100/50 rounded-xl p-5">
              <h3 className="font-medium text-purple-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Notes
              </h3>
              <p className="text-gray-700">{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => handleStatusChange(appointment._id, 'confirmed')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 cursor-pointer"
            >
              Confirm
            </button>
            <button 
              onClick={() => handleStatusChange(appointment._id, 'cancelled')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer">
              Reschedule
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
              Send Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-gray-50">
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-6 text-gray-600 font-medium">{message}</p>
      <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
    </div>
  </div>
);

export default AppointmentsModule;