"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope, UserPlus, UserCheck, UserX, Search, Filter, MoreVertical, Edit, Trash2,
  CheckCircle, XCircle, Eye, Mail, Phone, Calendar, ChevronRight, Download, RefreshCw,
  TrendingUp, TrendingDown, Star, Award, Clock, MapPin, GraduationCap, BriefcaseMedical, Heart,
  CreditCard, X, DollarSign, FileText, User as UserIcon, AlertCircle, CalendarDays, Target,
  MessageSquare, Download as DownloadIcon, Share2, Printer, Shield as ShieldIcon, BadgeCheck,
  Plus, MessageCircle, Map, Building, Activity
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '@/lib/api/api';

// Types remain exactly the same
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
  address?: string;
  education?: string[];
  certifications?: string[];
  bio?: string;
  fees?: { consultation: number; followup?: number; emergency?: number };
}

interface DoctorStats {
  total: number; active: number; pending: number; available: number; 
  onLeave: number; totalRevenue: number; specializations: { [key: string]: number };
}

interface Appointment {
  _id: string; patientName: string; patientId: string; doctorId: string; 
  date: string; time: string; status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  type: 'consultation' | 'followup' | 'emergency'; fee: number; paid: boolean;
}

// API URLs
const DOCTORS_API = {
  ALL: '/doctors/all',
  CREATE: '/doctors/create',
  UPDATE: '/doctors/update',
  DELETE: (id: string) => `/doctors/${id}`,
  GET_ONE: (id: string) => `/doctors/${id}`,
  MY_PROFILE: '/doctors/me'
};

const ANALYTICS_API = {
  TOTAL_DOCTORS: '/analytics/total-doctors'
};

const APPOINTMENTS_API = {
  DOCTOR_APPOINTMENTS: (doctorId: string) => `/appointments/doctor/${doctorId}`,
  BOOK: '/appointments/book'
};

// Main Component - Only API calls updated
const DoctorsModule = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalStats, setTotalStats] = useState<DoctorStats>({
    total: 0, active: 0, pending: 0, available: 0, onLeave: 0, 
    totalRevenue: 0, specializations: {}
  });
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchDoctors();
    fetchDoctorStats();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchQuery, selectedSpecialization, selectedStatus, selectedAvailability]);

  // API Functions - Updated with actual endpoints
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get(DOCTORS_API.ALL);
      if (response.data && Array.isArray(response.data)) {
        const doctorsData = response.data.map((doctor: any) => ({
          _id: doctor._id || doctor.id || '',
          name: doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Unnamed Doctor',
          email: doctor.email || 'No email',
          phone: doctor.phone || doctor.contactNumber || '',
          specialization: doctor.specialization || doctor.speciality || 'General',
          department: doctor.department || '',
          qualification: doctor.qualification || doctor.education?.[0] || 'MBBS',
          experience: doctor.experience || 0,
          licenseNumber: doctor.licenseNumber || doctor.license || 'N/A',
          status: mapStatus(doctor.status || (doctor.isActive !== false ? 'active' : 'inactive')),
          availability: mapAvailability(doctor.availability || 'available'),
          rating: doctor.rating || 0,
          totalAppointments: doctor.totalAppointments || doctor.appointmentCount || 0,
          consultationFee: doctor.consultationFee || doctor.fees?.consultation || 0,
          revenue: doctor.revenue || doctor.totalRevenue || 0,
          joinedDate: doctor.joinedDate || doctor.createdAt || new Date().toISOString(),
          location: doctor.location || doctor.address || '',
          address: doctor.address,
          education: doctor.education,
          certifications: doctor.certifications,
          bio: doctor.bio,
          fees: doctor.fees,
          nextAvailable: doctor.nextAvailable || doctor.availableFrom || 'Not scheduled'
        }));
        setDoctors(doctorsData);
      } else {
        // Placeholder when no data
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorStats = async () => {
    try {
      const response = await api.get(ANALYTICS_API.TOTAL_DOCTORS);
      if (response.data) {
        setTotalStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
    }
  };

  const fetchRecentAppointments = async (doctorId: string) => {
    try {
      const response = await api.get(APPOINTMENTS_API.DOCTOR_APPOINTMENTS(doctorId));
      if (response.data && Array.isArray(response.data)) {
        setRecentAppointments(response.data.slice(0, 3));
      } else {
        setRecentAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setRecentAppointments([]);
    }
  };

  const mapStatus = (status: string): Doctor['status'] => {
    const statusMap: { [key: string]: Doctor['status'] } = {
      'active': 'active', 'inactive': 'inactive', 'pending': 'pending',
      'pending_approval': 'pending', 'on_leave': 'on_leave',
      'suspended': 'inactive', 'approved': 'active'
    };
    return statusMap[status.toLowerCase()] || 'pending';
  };

  const mapAvailability = (availability: string): Doctor['availability'] => {
    const availabilityMap: { [key: string]: Doctor['availability'] } = {
      'available': 'available', 'busy': 'busy', 'unavailable': 'unavailable',
      'offline': 'unavailable', 'online': 'available', 'in_consultation': 'busy'
    };
    return availabilityMap[availability.toLowerCase()] || 'available';
  };

  const filterDoctors = () => {
    let filtered = [...doctors];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        doctor.email.toLowerCase().includes(query) ||
        doctor.department?.toLowerCase().includes(query) ||
        doctor.qualification.toLowerCase().includes(query)
      );
    }
    if (selectedSpecialization !== 'all') filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization);
    if (selectedStatus !== 'all') filtered = filtered.filter(doctor => doctor.status === selectedStatus);
    if (selectedAvailability !== 'all') filtered = filtered.filter(doctor => doctor.availability === selectedAvailability);
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  };

  const getSpecializations = () => {
    const specializations = Array.from(new Set(doctors.map(d => d.specialization)));
    return specializations.length > 0 ? specializations : ['Cardiology', 'Neurology', 'Orthopedics'];
  };

  const handleStatusUpdate = async (doctorId: string, newStatus: Doctor['status']) => {
    try {
      await api.patch(DOCTORS_API.UPDATE, { id: doctorId, status: newStatus });
      setDoctors(doctors.map(doctor => doctor._id === doctorId ? { ...doctor, status: newStatus } : doctor));
      fetchDoctorStats();
    } catch (error) {
      console.error('Error updating doctor status:', error);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      try {
        await api.delete(DOCTORS_API.DELETE(doctorId));
        setDoctors(doctors.filter(doctor => doctor._id !== doctorId));
        fetchDoctorStats();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor. Please try again.');
      }
    }
  };

  const handleAddDoctor = async (doctorData: any) => {
    try {
      const response = await api.post(DOCTORS_API.CREATE, doctorData);
      if (response.data) {
        const newDoctor: Doctor = {
          _id: response.data.id || response.data._id || Date.now().toString(),
          name: response.data.name || 'New Doctor',
          email: response.data.email || '',
          phone: response.data.phone || '',
          specialization: response.data.specialization || 'General',
          department: response.data.department || '',
          qualification: response.data.qualification || 'MBBS',
          experience: response.data.experience || 0,
          licenseNumber: response.data.licenseNumber || '',
          status: 'pending',
          availability: 'available',
          rating: 0,
          totalAppointments: 0,
          consultationFee: response.data.consultationFee || 0,
          joinedDate: new Date().toISOString(),
          location: response.data.location || ''
        };
        setDoctors([...doctors, newDoctor]);
        setIsAddModalOpen(false);
        fetchDoctorStats();
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert('Failed to add doctor. Please try again.');
    }
  };

  const handleUpdateDoctor = async (doctorId: string, updateData: any) => {
    try {
      const response = await api.patch(DOCTORS_API.UPDATE, { id: doctorId, ...updateData });
      if (response.data) {
        setDoctors(doctors.map(doctor => 
          doctor._id === doctorId ? { ...doctor, ...updateData } : doctor
        ));
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert('Failed to update doctor. Please try again.');
    }
  };

  const openDoctorModal = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    await fetchRecentAppointments(doctor._id);
  };

  const closeDoctorModal = () => {
    setSelectedDoctor(null);
    setIsModalOpen(false);
    setRecentAppointments([]);
  };

  const handleExportDoctors = async () => {
    try {
      const response = await api.get(DOCTORS_API.ALL, { 
        params: { format: 'csv' }, 
        responseType: 'blob' 
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `doctors-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting doctors:', error);
      alert('Failed to export doctors. Please try again.');
    }
  };

  const handleScheduleAppointment = async (doctorId: string, appointmentData: any) => {
    try {
      await api.post(APPOINTMENTS_API.BOOK, { 
        ...appointmentData, 
        doctorId, 
        status: 'scheduled' 
      });
      alert('Appointment scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment. Please try again.');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

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
      <Sidebar pendingApprovals={totalStats.pending} activeRoute="/admin/doctors" />
      <div className="flex-1 overflow-auto ml-72">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} adminData={{ name: 'System Admin' }} searchPlaceholder="Search doctors..." />
        
        {/* Page Header - All UI remains exactly the same */}
        <div className="sticky top-[84px] z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
              <span className="text-sm font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">{totalStats.total} Total Doctors</span>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={fetchDoctors} className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
                <RefreshCw className="w-4 h-4" /><span className="text-sm font-medium">Refresh</span>
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
                <Plus className="w-4 h-4" /><span className="text-sm font-medium">Add New Doctor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview - All UI remains exactly the same */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Doctors" value={totalStats.total} icon={Stethoscope} color="purple" trend="+5%" />
            <StatCard label="Active Now" value={totalStats.active} icon={UserCheck} color="green" trend="+2" />
            <StatCard label="Available" value={totalStats.available} icon={CheckCircle} color="blue" trend="+3" />
            <StatCard label="Pending" value={totalStats.pending} icon={Clock} color="yellow" trend="-1" />
            <StatCard label="On Leave" value={totalStats.onLeave} icon={UserX} color="orange" trend="+1" />
            <StatCard label="Total Revenue" value={`$${(totalStats.totalRevenue || 0).toLocaleString()}`} icon={BriefcaseMedical} color="green" trend="+15%" />
          </div>
        </div>

        {/* Filters - All UI remains exactly the same */}
        <div className="px-8 pb-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Search doctors by name, specialization, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200" />
              </div>
              <div className="flex items-center space-x-4">
                <SelectFilter value={selectedSpecialization} onChange={setSelectedSpecialization} options={['All Specializations', ...getSpecializations()]} />
                <SelectFilter value={selectedStatus} onChange={setSelectedStatus} options={['All Status', 'Active', 'Pending', 'Inactive', 'On Leave']} />
                <SelectFilter value={selectedAvailability} onChange={setSelectedAvailability} options={['All Availability', 'Available', 'Busy', 'Unavailable']} />
                <button onClick={handleExportDoctors} className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
                  <Download className="w-4 h-4" /><span className="text-sm font-medium">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid - All UI remains exactly the same */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">All Doctors</h3>
              <p className="text-sm text-gray-500">Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredDoctors.length)} of {filteredDoctors.length} doctors</p>
            </div>
            {currentDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentDoctors.map((doctor) => (
                  <DoctorCard key={doctor._id} doctor={doctor} onView={openDoctorModal} onStatusUpdate={handleStatusUpdate} onDelete={handleDeleteDoctor} onEdit={() => { setSelectedDoctor(doctor); setIsEditModalOpen(true); }} />
                ))}
              </div>
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"><Stethoscope className="w-8 h-8 text-gray-400" /></div>
                  <p className="text-gray-500 font-medium">No doctors found</p><p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
              </div>
            )}
            {filteredDoctors.length > itemsPerPage && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </div>
        </div>

        {/* Quick Actions - All UI remains exactly the same */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-lg font-semibold text-gray-900">Quick Doctor Actions</h3><p className="text-sm text-gray-500">Manage doctors efficiently</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ActionCard icon={Plus} title="Add New Doctor" description="Register new medical professional" color="purple" onClick={() => setIsAddModalOpen(true)} />
              <ActionCard icon={Award} title="Review Applications" description="Review pending doctor applications" color="blue" onClick={() => router.push('/admin/pending-doctors')} />
              <ActionCard icon={Calendar} title="Schedule Management" description="Manage doctor schedules" color="green" onClick={() => router.push('/admin/schedules')} />
              <ActionCard icon={Heart} title="Performance Review" description="Review doctor performance metrics" color="red" onClick={() => router.push('/admin/analytics')} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals - All UI remains exactly the same */}
      {isModalOpen && selectedDoctor && <DoctorDetailModal doctor={selectedDoctor} onClose={closeDoctorModal} appointments={recentAppointments} onScheduleAppointment={handleScheduleAppointment} />}
      {isAddModalOpen && <AddDoctorModal onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddDoctor} />}
      {isEditModalOpen && selectedDoctor && <EditDoctorModal doctor={selectedDoctor} onClose={() => { setIsEditModalOpen(false); setSelectedDoctor(null); }} onSubmit={handleUpdateDoctor} />}
    </div>
  );
};

// All sub-components remain EXACTLY THE SAME - no changes to DoctorCard, StatCard, ActionCard, etc.
// [Rest of the code remains exactly the same - DoctorCard, StatCard, ActionCard, SelectFilter, Pagination, 
// DoctorDetailModal, AddDoctorModal, EditDoctorModal, and all helper components are unchanged]

const DoctorCard: React.FC<{
  doctor: Doctor; onView: (doctor: Doctor) => void; onStatusUpdate: (id: string, status: Doctor['status']) => void;
  onDelete: (id: string) => void; onEdit: () => void;
}> = ({ doctor, onView, onStatusUpdate, onDelete, onEdit }) => {
  const statusColors = { active: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', inactive: 'bg-gray-100 text-gray-700', on_leave: 'bg-orange-100 text-orange-700' };
  const availabilityColors = { available: 'bg-green-100 text-green-700', busy: 'bg-yellow-100 text-yellow-700', unavailable: 'bg-red-100 text-red-700' };
  const statusIcons = { active: <CheckCircle className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, on_leave: <Clock className="w-3 h-3" />, inactive: <XCircle className="w-3 h-3" /> };

  return (
    <div className="bg-white border border-gray-200/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">{doctor.name?.charAt(0) || 'D'}</div>
          <div><h3 className="font-bold text-gray-900">{doctor.name || 'Unnamed Doctor'}</h3><p className="text-xs text-gray-500">{doctor.email || 'No email'}</p></div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => onView(doctor)} className="p-1.5 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-purple-600" title="View Details"><Eye className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500"><MoreVertical className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mb-2">{doctor.specialization || 'General'}</span>
        <div className="flex items-center text-xs text-gray-600 mb-1"><GraduationCap className="w-3 h-3 mr-1" />{doctor.qualification || 'MBBS'}</div>
        <div className="flex items-center text-xs text-gray-600"><BriefcaseMedical className="w-3 h-3 mr-1" />{doctor.experience || 0} years experience</div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[doctor.status]}`}>{statusIcons[doctor.status]}<span className="ml-1">{doctor.status.replace('_', ' ')}</span></span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${availabilityColors[doctor.availability]}`}>{doctor.availability === 'available' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}<span className="ml-1">{doctor.availability}</span></span>
      </div>
      <div className="space-y-2 mb-4">
        {doctor.phone && <div className="flex items-center text-xs text-gray-600"><Phone className="w-3 h-3 mr-2 flex-shrink-0" /><span className="truncate">{doctor.phone}</span></div>}
        {doctor.location && <div className="flex items-center text-xs text-gray-600"><MapPin className="w-3 h-3 mr-2 flex-shrink-0" /><span className="truncate">{doctor.location}</span></div>}
        {doctor.department && <div className="flex items-center text-xs text-blue-600"><Building className="w-3 h-3 mr-2 flex-shrink-0" /><span className="truncate">{doctor.department}</span></div>}
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center"><Star className="w-4 h-4 text-yellow-500 fill-current mr-1" /><span className="text-sm font-medium">{doctor.rating || 0}/5.0</span></div>
          <div className="text-sm font-medium text-green-600">${doctor.consultationFee || 0}</div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{doctor.totalAppointments || 0} appointments</span>
          {doctor.revenue && <span>${doctor.revenue.toLocaleString()} revenue</span>}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-600"><Clock className="w-3 h-3 mr-1" /><span>{doctor.nextAvailable || 'Not scheduled'}</span></div>
        <div className="flex items-center space-x-1">
          <button onClick={() => doctor.status !== 'on_leave' ? onStatusUpdate(doctor._id, 'on_leave') : onStatusUpdate(doctor._id, 'active')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-orange-600" title={doctor.status !== 'on_leave' ? "Mark on leave" : "Activate"}><Clock className="w-4 h-4" /></button>
          <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-blue-600" title="Edit"><Edit className="w-4 h-4" /></button>
          {doctor.status !== 'pending' && <button onClick={() => onDelete(doctor._id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string; value: number | string; icon: React.ElementType; color: 'purple' | 'green' | 'blue' | 'yellow' | 'orange' | 'red'; trend: string;
}> = ({ label, value, icon: Icon, color, trend }) => {
  const bgColors = {
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50',
    green: 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/50',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50',
    red: 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50'
  };
  const iconColors = { purple: 'text-purple-600', green: 'text-green-600', blue: 'text-blue-600', yellow: 'text-yellow-600', orange: 'text-orange-600', red: 'text-red-600' };
  return (
    <div className={`${bgColors[color]} border rounded-2xl p-4`}>
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium text-gray-600">{label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">{trend.startsWith('+') ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
            <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{trend} from last month</span>
          </div>
        </div>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg"><Icon className={`w-5 h-5 ${iconColors[color]}`} /></div>
      </div>
    </div>
  );
};

const ActionCard: React.FC<{
  icon: React.ElementType; title: string; description: string; color: 'purple' | 'green' | 'blue' | 'red'; onClick: () => void;
}> = ({ icon: Icon, title, description, color, onClick }) => {
  const colorClasses = { purple: 'bg-purple-100 text-purple-600', green: 'bg-green-100 text-green-600', blue: 'bg-blue-100 text-blue-600', red: 'bg-red-100 text-red-600' };
  return (
    <button onClick={onClick} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer text-left group">
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-200`}><Icon className="w-6 h-6" /></div>
        <div><h4 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-all duration-200">{title}</h4><p className="text-sm text-gray-500">{description}</p></div>
      </div>
    </button>
  );
};

const SelectFilter: React.FC<{ value: string; onChange: (value: string) => void; options: string[]; }> = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value.toLowerCase().replace(' ', '_'))} className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm">
    {options.map((opt) => <option key={opt} value={opt.toLowerCase().replace(' ', '_')}>{opt}</option>)}
  </select>
);

const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => (
  <div className="border-t border-gray-200/50 px-6 py-4 mt-6">
    <div className="flex items-center justify-between">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'}`}>
        <ChevronRight className="w-4 h-4 rotate-180" /><span className="text-sm font-medium">Previous</span>
      </button>
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button key={page} onClick={() => onPageChange(page)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === page ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{page}</button>
        ))}
      </div>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'}`}>
        <span className="text-sm font-medium">Next</span><ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const DoctorDetailModal: React.FC<{ doctor: Doctor; onClose: () => void; appointments: Appointment[]; onScheduleAppointment: (doctorId: string, appointmentData: any) => void; }> = ({ doctor, onClose, appointments, onScheduleAppointment }) => {
  const performanceMetrics = [
    { label: 'Patient Satisfaction', value: '96%', color: 'text-green-600', icon: DownloadIcon },
    { label: 'On-time Rate', value: '94%', color: 'text-blue-600', icon: Clock },
    { label: 'Success Rate', value: '98%', color: 'text-purple-600', icon: Target },
    { label: 'Follow-up Rate', value: '92%', color: 'text-orange-600', icon: MessageSquare }
  ];

  const handleScheduleClick = () => {
    const appointmentData = { patientId: 'current-patient-id', date: new Date().toISOString().split('T')[0], time: '10:00', type: 'consultation', notes: 'Routine checkup' };
    onScheduleAppointment(doctor._id, appointmentData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-6xl mx-auto max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl transition-all duration-300">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">{doctor.name?.charAt(0) || 'D'}</div>
              <div><h2 className="text-2xl font-bold text-gray-900">{doctor.name || 'Unnamed Doctor'}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${doctor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {doctor.status === 'active' ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}{doctor.status?.charAt(0)?.toUpperCase() + doctor.status?.slice(1)?.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${doctor.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {doctor.availability === 'available' ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}{doctor.availability?.charAt(0)?.toUpperCase() + doctor.availability?.slice(1)}
                  </span>
                  <div className="flex items-center text-yellow-600"><Star className="w-4 h-4 fill-current" /><span className="ml-1 font-medium">{doctor.rating || 0}/5.0</span></div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <InfoCard title="Personal Information" icon={UserIcon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField icon={Mail} label="Email" value={doctor.email || 'No email'} />
                  <InfoField icon={Phone} label="Phone" value={doctor.phone || 'Not provided'} />
                  <InfoField icon={MapPin} label="Location" value={doctor.location || 'Not specified'} />
                  <InfoField icon={Calendar} label="Joined Date" value={doctor.joinedDate ? new Date(doctor.joinedDate).toLocaleDateString() : 'Not specified'} />
                  <InfoField icon={BadgeCheck} label="License" value={doctor.licenseNumber || 'N/A'} />
                  <InfoField icon={DollarSign} label="Consultation Fee" value={`$${doctor.consultationFee || 0}`} />
                </div>
              </InfoCard>
              <InfoCard title="Professional Details" icon={BriefcaseMedical}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-gray-600">Specialization</label>
                      <div className="mt-1"><span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">{doctor.specialization || 'General'}</span></div>
                    </div>
                    <InfoField label="Department" value={doctor.department || 'Not assigned'} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Qualification" value={doctor.qualification || 'MBBS'} />
                    <InfoField label="Experience" value={`${doctor.experience || 0} years`} />
                  </div>
                  {doctor.education && doctor.education.length > 0 && (
                    <div><label className="text-sm font-medium text-gray-600">Education</label>
                      <div className="mt-2 space-y-1">{doctor.education.map((edu, index) => <p key={index} className="text-sm text-gray-700">{edu}</p>)}</div>
                    </div>
                  )}
                </div>
              </InfoCard>
              <InfoCard title="Performance Metrics" icon={DownloadIcon}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{performanceMetrics.map((metric, index) => <MetricCard key={index} metric={metric} />)}</div>
              </InfoCard>
            </div>
            <div className="space-y-6">
              <StatCardSection doctor={doctor} />
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
                <div className="space-y-3">
                  {appointments.length > 0 ? appointments.map((appointment) => (
                    <div key={appointment._id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                        <p className="text-xs text-gray-500 mt-1">{appointment.date} • {appointment.time} • {appointment.type}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' : appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{appointment.status}</span>
                    </div>
                  )) : <p className="text-sm text-gray-500 text-center py-4">No recent appointments</p>}
                </div>
              </div>
              <QuickActionsCard onSchedule={handleScheduleClick} />
            </div>
          </div>
          <InfoCard title="Documents & Certifications" icon={FileText} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {doctor.certifications && doctor.certifications.length > 0 ? doctor.certifications.map((cert, idx) => <DocumentCard key={idx} title={cert} />) : <p className="text-sm text-gray-500 col-span-3 text-center py-4">No documents uploaded</p>}
            </div>
          </InfoCard>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500"><ShieldIcon className="w-4 h-4" /><span>Last updated: {new Date().toLocaleDateString()}</span></div>
            <div className="flex items-center space-x-3">
              <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">Close</button>
              <button onClick={handleScheduleClick} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200">Schedule Appointment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddDoctorModal: React.FC<{ onClose: () => void; onSubmit: (doctorData: any) => void; }> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', specialization: '', department: '', 
    qualification: '', experience: '', licenseNumber: '', consultationFee: '', location: '' 
  });

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onSubmit({ 
      ...formData, 
      experience: parseInt(formData.experience), 
      consultationFee: parseFloat(formData.consultationFee) 
    }); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add New Doctor</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="Dr. John Doe" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="doctor@example.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="+1 (555) 123-4567" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select 
                  name="specialization" 
                  value={formData.specialization} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Radiology">Radiology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input 
                  type="text" 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="Cardiology Department" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input 
                  type="text" 
                  name="qualification" 
                  value={formData.qualification} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="MD, Cardiology" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                <input 
                  type="number" 
                  name="experience" 
                  value={formData.experience} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="5" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input 
                  type="text" 
                  name="licenseNumber" 
                  value={formData.licenseNumber} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="MED12345" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
                <input 
                  type="number" 
                  name="consultationFee" 
                  value={formData.consultationFee} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  step="0.01" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="100" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="Main Hospital, Floor 3" 
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-6">
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  Add Doctor
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const EditDoctorModal: React.FC<{ doctor: Doctor; onClose: () => void; onSubmit: (doctorId: string, updateData: any) => void; }> = ({ doctor, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: doctor.name, email: doctor.email, phone: doctor.phone || '', specialization: doctor.specialization,
    department: doctor.department || '', qualification: doctor.qualification, experience: doctor.experience.toString(),
    licenseNumber: doctor.licenseNumber, consultationFee: doctor.consultationFee.toString(), location: doctor.location || '',
    status: doctor.status, availability: doctor.availability
  });

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onSubmit(doctor._id, { 
      ...formData, 
      experience: parseInt(formData.experience), 
      consultationFee: parseFloat(formData.consultationFee) 
    }); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Edit Doctor</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Doctor ID</p>
                  <p className="font-medium text-gray-900">{doctor._id}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select 
                  name="availability" 
                  value={formData.availability} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select 
                  name="specialization" 
                  value={formData.specialization} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Radiology">Radiology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input 
                  type="text" 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input 
                  type="text" 
                  name="qualification" 
                  value={formData.qualification} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                <input 
                  type="number" 
                  name="experience" 
                  value={formData.experience} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input 
                  type="text" 
                  name="licenseNumber" 
                  value={formData.licenseNumber} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
                <input 
                  type="number" 
                  name="consultationFee" 
                  value={formData.consultationFee} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  step="0.01" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-6">
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  Update Doctor
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper Components remain exactly the same
const InfoCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; className?: string; }> = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-gray-50 rounded-xl p-6 ${className}`}><h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Icon className="w-5 h-5 mr-2" />{title}</h3>{children}</div>
);

const InfoField: React.FC<{ icon?: React.ElementType; label: string; value: string; }> = ({ icon: Icon, label, value }) => (
  <div>{Icon && <div className="flex items-center space-x-2 text-sm text-gray-600"><Icon className="w-4 h-4" /><span>{label}</span></div>}
    {!Icon && <div className="text-sm font-medium text-gray-600">{label}</div>}<p className="mt-1 text-gray-900 font-medium">{value}</p>
  </div>
);

const MetricCard: React.FC<{ metric: { label: string; value: string; color: string; icon: React.ElementType }; }> = ({ metric }) => {
  const Icon = metric.icon;
  return (
    <div className="bg-white rounded-lg p-4 text-center">
      <div className={`${metric.color} mb-2`}><Icon className="w-6 h-6 mx-auto" /></div>
      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
      <div className="text-sm text-gray-600 mt-1">{metric.label}</div>
    </div>
  );
};

const StatCardSection: React.FC<{ doctor: Doctor }> = ({ doctor }) => (
  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics Overview</h3>
    <div className="space-y-4">
      <StatItem icon={CalendarDays} label="Total Appointments" value={doctor.totalAppointments?.toLocaleString() || '0'} />
      <StatItem icon={DollarSign} label="Total Revenue" value={`$${doctor.revenue?.toLocaleString() || '0'}`} />
      <StatItem icon={Star} label="Average Rating" value={doctor.rating?.toString() || '0'} />
      <StatItem icon={Clock} label="Next Available" value={doctor.nextAvailable || 'Not scheduled'} />
    </div>
  </div>
);

const StatItem: React.FC<{ icon: React.ElementType; label: string; value: string; }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center"><Icon className="w-4 h-4" /></div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);

const QuickActionsCard: React.FC<{ onSchedule: () => void }> = ({ onSchedule }) => {
  const actions = [
    { icon: MessageSquare, label: 'Send Message' },
    { icon: Calendar, label: 'Schedule Appointment', onClick: onSchedule },
    { icon: FileText, label: 'View Reports' },
    { icon: Edit, label: 'Edit Profile' },
    { icon: Share2, label: 'Share Profile' },
    { icon: Printer, label: 'Print Details' },
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action, idx) => (
          <button key={idx} onClick={action.onClick} className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-200">
            <action.icon className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const DocumentCard: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div>
      <div><p className="font-medium text-gray-900">{title}</p><p className="text-xs text-gray-500">PDF • 2.4 MB</p></div>
    </div>
    <button className="p-2 hover:bg-gray-100 rounded-lg"><DownloadIcon className="w-4 h-4 text-gray-500" /></button>
  </div>
);

export default DoctorsModule;