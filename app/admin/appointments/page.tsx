"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Search, Filter, Download, MoreVertical, 
  Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle, ChevronRight,
  Plus, FileText, Phone, MapPin, Mail, Stethoscope, TrendingUp,
  Bell, ArrowUpDown, RefreshCw, Calendar as CalendarIcon,
  Video, MessageSquare, Share2, Printer, Zap, Heart, Star, Award
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

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
  duration?: number;
  location?: string;
  priority?: 'low' | 'medium' | 'high';
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
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

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

      const appointmentsData = appointmentsRes.data.data || appointmentsRes.data || getMockAppointments();
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
      _id: '1', patientId: 'p001', patientName: 'John Smith',
      doctorId: 'd001', doctorName: 'Dr. Robert Wilson', doctorSpecialization: 'Cardiology',
      date: '2024-01-20', time: '10:30 AM', status: 'confirmed', type: 'consultation',
      notes: 'Routine heart checkup', createdAt: '2024-01-10', updatedAt: '2024-01-10',
      patientPhone: '+1 (555) 123-4567', patientEmail: 'john.smith@email.com',
      symptoms: ['Chest pain', 'Shortness of breath'], duration: 30, priority: 'high'
    },
    {
      _id: '2', patientId: 'p002', patientName: 'Emily Johnson',
      doctorId: 'd002', doctorName: 'Dr. Sarah Miller', doctorSpecialization: 'Pediatrics',
      date: '2024-01-21', time: '02:00 PM', status: 'scheduled', type: 'routine',
      notes: 'Annual physical examination', createdAt: '2024-01-11', updatedAt: '2024-01-11',
      patientPhone: '+1 (555) 987-6543', duration: 45, priority: 'medium'
    },
    {
      _id: '3', patientId: 'p003', patientName: 'Michael Brown',
      doctorId: 'd003', doctorName: 'Dr. James Wilson', doctorSpecialization: 'Orthopedics',
      date: '2024-01-19', time: '11:15 AM', status: 'completed', type: 'follow-up',
      notes: 'Post-surgery follow-up', createdAt: '2024-01-05', updatedAt: '2024-01-19',
      symptoms: ['Knee pain'], duration: 20, location: 'Room 305'
    },
    {
      _id: '4', patientId: 'p004', patientName: 'Sophia Davis',
      doctorId: 'd004', doctorName: 'Dr. Lisa Anderson', doctorSpecialization: 'Dermatology',
      date: '2024-01-22', time: '09:45 AM', status: 'confirmed', type: 'consultation',
      notes: 'Skin condition evaluation', createdAt: '2024-01-12', updatedAt: '2024-01-12',
      patientEmail: 'sophia.d@email.com', duration: 25, priority: 'medium'
    },
    {
      _id: '5', patientId: 'p005', patientName: 'David Wilson',
      doctorId: 'd005', doctorName: 'Dr. Michael Chen', doctorSpecialization: 'Neurology',
      date: '2024-01-18', time: '03:30 PM', status: 'cancelled', type: 'consultation',
      notes: 'Migraine consultation', createdAt: '2024-01-03', updatedAt: '2024-01-17',
      patientPhone: '+1 (555) 654-3210', symptoms: ['Headache'], duration: 40
    },
    {
      _id: '6', patientId: 'p006', patientName: 'Olivia Martinez',
      doctorId: 'd001', doctorName: 'Dr. Robert Wilson', doctorSpecialization: 'Cardiology',
      date: '2024-01-23', time: '11:00 AM', status: 'scheduled', type: 'follow-up',
      notes: 'Blood pressure check', createdAt: '2024-01-15', updatedAt: '2024-01-15',
      patientEmail: 'olivia.m@email.com', duration: 15, priority: 'low'
    },
    {
      _id: '7', patientId: 'p007', patientName: 'Robert Taylor',
      doctorId: 'd002', doctorName: 'Dr. Sarah Miller', doctorSpecialization: 'Pediatrics',
      date: '2024-01-24', time: '01:30 PM', status: 'confirmed', type: 'emergency',
      notes: 'Fever and cough', createdAt: '2024-01-16', updatedAt: '2024-01-16',
      symptoms: ['Fever', 'Cough'], duration: 30, priority: 'high'
    },
    {
      _id: '8', patientId: 'p008', patientName: 'Emma Anderson',
      doctorId: 'd003', doctorName: 'Dr. James Wilson', doctorSpecialization: 'Orthopedics',
      date: '2024-01-25', time: '10:00 AM', status: 'no-show', type: 'consultation',
      notes: 'Back pain consultation', createdAt: '2024-01-14', updatedAt: '2024-01-25',
      patientPhone: '+1 (555) 345-6789', duration: 45
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
        apt.doctorSpecialization.toLowerCase().includes(query)
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
    setCurrentPage(1);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      loadAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-purple-100 text-purple-700 border-purple-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      'no-show': 'bg-yellow-100 text-yellow-700 border-yellow-200'
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

  const getPriorityColor = (priority?: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  if (loading) {
    return <LoadingScreen message="Loading appointments..." />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
      <Sidebar activeRoute="/admin/appointments" />
      
      <div className="flex-1 overflow-auto ml-72">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          adminData={{ name: 'System Admin' }}
          searchPlaceholder="Search appointments..."
        />
        
        {/* Page Header */}
        <div className="sticky top-[84px] z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
              <span className="text-sm font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {filteredAppointments.length} appointments
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={loadAppointments}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <button 
                onClick={() => router.push('/admin/appointments/new')}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">New Appointment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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

        {/* Filters Panel */}
        <div className="px-8 pb-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="week">Next 7 Days</option>
                  </select>
                </div>
                
                <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                </button>

                {/* View Toggle */}
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Calendar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Grid View */}
        <div className="px-8 pb-8">
          {viewMode === 'grid' ? (
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">All Appointments</h3>
                <p className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAppointments.length)} of {filteredAppointments.length} appointments
                </p>
              </div>
              
              {currentAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentAppointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment._id}
                      appointment={appointment}
                      onView={() => setSelectedAppointment(appointment)}
                      formatDate={formatDate}
                      getStatusColor={getStatusColor}
                      getTypeColor={getTypeColor}
                      getPriorityColor={getPriorityColor}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 px-6 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <CalendarIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No appointments found</p>
                    <p className="text-sm text-gray-400">Try adjusting your filters</p>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {filteredAppointments.length > itemsPerPage && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </div>
          ) : (
            <CalendarView appointments={filteredAppointments} />
          )}

          {/* Appointment Detail Modal */}
          {selectedAppointment && (
            <AppointmentDetail
              appointment={selectedAppointment}
              onClose={() => setSelectedAppointment(null)}
              handleStatusChange={handleStatusChange}
              formatDate={formatFullDate}
              getStatusColor={getStatusColor}
              getTypeColor={getTypeColor}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-500">Manage appointments efficiently</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ActionCard
                icon={Calendar}
                title="Bulk Schedule"
                description="Schedule multiple appointments"
                color="purple"
                onClick={() => {}}
              />
              <ActionCard
                icon={Bell}
                title="Send Reminders"
                description="Send appointment reminders"
                color="blue"
                onClick={() => {}}
              />
              <ActionCard
                icon={Video}
                title="Virtual Sessions"
                description="Manage virtual appointments"
                color="green"
                onClick={() => {}}
              />
              <ActionCard
                icon={FileText}
                title="Generate Reports"
                description="Create appointment reports"
                color="red"
                onClick={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== APPOINTMENT CARD COMPONENT ==========
const AppointmentCard: React.FC<{
  appointment: Appointment;
  onView: () => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: Appointment['status']) => string;
  getTypeColor: (type: Appointment['type']) => string;
  getPriorityColor: (priority?: string) => string;
  onStatusChange: (id: string, status: Appointment['status']) => Promise<void>;
}> = ({ appointment, onView, formatDate, getStatusColor, getTypeColor, getPriorityColor, onStatusChange }) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statusOptions: Appointment['status'][] = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];

  return (
    <div className="bg-white border border-gray-200/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
      {/* Header with Patient Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
            {appointment.patientName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{appointment.patientName}</h3>
            <p className="text-xs text-gray-500">
              Patient ID: {appointment.patientId.slice(-4)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={onView}
            className="p-1.5 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-purple-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 relative"
            title="Change Status"
          >
            <MoreVertical className="w-4 h-4" />
            
            {/* Status Dropdown */}
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        onStatusChange(appointment._id, status);
                        setShowStatusMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Doctor & Specialization */}
      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Stethoscope className="w-3 h-3 mr-2 flex-shrink-0" />
          <span className="font-medium text-gray-900">{appointment.doctorName}</span>
        </div>
        <p className="text-xs text-gray-500">{appointment.doctorSpecialization}</p>
      </div>

      {/* Date & Time */}
      <div className="bg-purple-50/50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">{appointment.time}</span>
          </div>
        </div>
        {appointment.duration && (
          <p className="text-xs text-gray-500 mt-1 text-center">{appointment.duration} minutes</p>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
          {appointment.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
          {appointment.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
          {appointment.status}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
          {appointment.type}
        </span>
        {appointment.priority && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(appointment.priority)}`}>
            {appointment.priority}
          </span>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {appointment.patientPhone && (
          <div className="flex items-center text-xs text-gray-600">
            <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">{appointment.patientPhone}</span>
          </div>
        )}
        {appointment.patientEmail && (
          <div className="flex items-center text-xs text-gray-600">
            <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">{appointment.patientEmail}</span>
          </div>
        )}
        {appointment.location && (
          <div className="flex items-center text-xs text-gray-600">
            <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">{appointment.location}</span>
          </div>
        )}
      </div>

      {/* Symptoms Preview */}
      {appointment.symptoms && appointment.symptoms.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Symptoms</p>
          <div className="flex flex-wrap gap-1">
            {appointment.symptoms.slice(0, 2).map((symptom, index) => (
              <span key={index} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">
                {symptom}
              </span>
            ))}
            {appointment.symptoms.length > 2 && (
              <span className="text-xs text-gray-400">+{appointment.symptoms.length - 2} more</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => {/* Edit appointment */}}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-blue-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {/* Send reminder */}}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-green-600"
            title="Send Reminder"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {/* Start video call */}}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-purple-600"
            title="Start Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(appointment.createdAt)}
        </div>
      </div>
    </div>
  );
};

// ========== STAT CARD COMPONENT ==========
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
    <div className={`bg-gradient-to-br ${colorConfig[color].bg} border rounded-xl p-4`}>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        <p className={`text-xs font-medium mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      </div>
    </div>
  );
};

// ========== ACTION CARD COMPONENT ==========
const ActionCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'purple' | 'green' | 'blue' | 'red';
  onClick: () => void;
}> = ({ icon: Icon, title, description, color, onClick }) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <button onClick={onClick} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer text-left group">
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

// ========== PAGINATION COMPONENT ==========
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => (
  <div className="border-t border-gray-200/50 px-6 py-4 mt-6">
    <div className="flex items-center justify-between">
      <button
        onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(page)}
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
        onClick={() => onPageChange(currentPage + 1)}
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
);

// ========== CALENDAR VIEW COMPONENT ==========
const CalendarView: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => (
  <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Calendar View</h3>
      <div className="flex items-center space-x-3">
        <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
          Today
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 cursor-pointer">
          Add Event
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-7 gap-2 mb-4">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center py-2 text-sm font-medium text-gray-600">
          {day}
        </div>
      ))}
      
      {Array.from({ length: 35 }, (_, i) => i + 1).map((day) => {
        const dayAppointments = appointments.filter(apt => {
          const date = new Date(apt.date);
          return date.getDate() === day % 31;
        });
        
        return (
          <div 
            key={day} 
            className={`min-h-20 p-2 border border-gray-200 rounded-lg ${
              day <= 31 ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-medium ${
                day <= 31 ? 'text-gray-900' : 'text-gray-400'
              }`}>{day <= 31 ? day : ''}</span>
              {dayAppointments.length > 0 && (
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                  {dayAppointments.length}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              {dayAppointments.slice(0, 2).map((apt, idx) => (
                <div 
                  key={idx} 
                  className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-90"
                  style={{ 
                    backgroundColor: apt.status === 'confirmed' ? '#dcfce7' : 
                                    apt.status === 'cancelled' ? '#fee2e2' : 
                                    '#dbeafe',
                    color: apt.status === 'confirmed' ? '#166534' : 
                           apt.status === 'cancelled' ? '#991b1b' : 
                           '#1e40af'
                  }}
                >
                  {apt.time} - {apt.patientName.split(' ')[0]}
                </div>
              ))}
              {dayAppointments.length > 2 && (
                <div className="text-xs text-gray-400 text-center">
                  +{dayAppointments.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
    
    <div className="border-t border-gray-200 pt-4">
      <h4 className="font-medium text-gray-900 mb-3">Today's Appointments</h4>
      <div className="space-y-2">
        {appointments.slice(0, 5).map((apt) => (
          <div key={apt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{apt.patientName}</p>
              <p className="text-sm text-gray-500">{apt.time} • {apt.doctorName}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
              apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 
              'bg-gray-100 text-gray-700'
            }`}>
              {apt.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ========== APPOINTMENT DETAIL MODAL ==========
const AppointmentDetail: React.FC<{
  appointment: Appointment;
  onClose: () => void;
  handleStatusChange: (id: string, status: Appointment['status']) => Promise<void>;
  formatDate: (date: string) => string;
  getStatusColor: (status: Appointment['status']) => string;
  getTypeColor: (type: Appointment['type']) => string;
}> = ({ appointment, onClose, handleStatusChange, formatDate, getStatusColor, getTypeColor }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
    <div className="relative w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl transition-all duration-300">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status === 'confirmed' && <CheckCircle className="w-4 h-4 mr-1" />}
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(appointment.type)}`}>
                {appointment.type}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <XCircle className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Appointment Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Patient Information */}
          <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Patient Information
            </h3>
            <div className="space-y-3">
              <DetailRow label="Name" value={appointment.patientName} />
              <DetailRow label="Patient ID" value={appointment.patientId} />
              <DetailRow label="Phone" value={appointment.patientPhone || 'N/A'} />
              <DetailRow label="Email" value={appointment.patientEmail || 'N/A'} />
            </div>
          </div>

          {/* Doctor Information */}
          <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-purple-600" />
              Doctor Information
            </h3>
            <div className="space-y-3">
              <DetailRow label="Doctor" value={appointment.doctorName} />
              <DetailRow label="Specialization" value={appointment.doctorSpecialization} />
              <DetailRow label="Doctor ID" value={appointment.doctorId} />
            </div>
          </div>

          {/* Appointment Details */}
          <div className="lg:col-span-2 bg-purple-50/50 border border-purple-200/50 rounded-xl p-5">
            <h3 className="font-medium text-purple-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(appointment.date)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium text-gray-900 mt-1">{appointment.time}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900 mt-1">{appointment.duration || 30} minutes</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(appointment.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Symptoms & Notes */}
          {appointment.symptoms && appointment.symptoms.length > 0 && (
            <div className="bg-red-50/50 border border-red-100/50 rounded-xl p-5">
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
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-5">
              <h3 className="font-medium text-blue-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Notes
              </h3>
              <p className="text-gray-700">{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
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
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer">
              Reschedule
            </button>
          </div>
          <div className="flex items-center space-x-3">
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