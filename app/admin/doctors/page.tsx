"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope, UserPlus, UserCheck, UserX, Search, Filter, MoreVertical, Edit, Trash2,
  CheckCircle, XCircle, Eye, Mail, Phone, Calendar, ChevronRight, Download, RefreshCw,
  TrendingUp, TrendingDown, Star, Award, Clock, MapPin, GraduationCap, BriefcaseMedical, Heart,
  CreditCard, X, DollarSign, FileText, User as UserIcon, AlertCircle, CalendarDays, Target,
  MessageSquare, Download as DownloadIcon, Share2, Printer, Shield as ShieldIcon, BadgeCheck,
  Plus, MessageCircle, Map, Building, Activity, Thermometer, Heart as HeartIcon, Brain, Bone,
  Baby, Eye as EyeIcon, Activity as ActivityIcon, Microscope, Sun, Moon, Check
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '@/lib/api/api';

// Types
interface Doctor {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  specialization: string;
  hospitalName?: string;
  degrees: string;
  experienceYears: number;
  fee: number;
  availableDays: string[];
  availableSlots: string[];
  status: 'active' | 'inactive' | 'pending' | 'on_leave';
  availability: 'available' | 'busy' | 'unavailable';
  rating?: number;
  totalAppointments?: number;
  revenue?: number;
  joinedDate?: string;
  location?: string;
  address?: string;
  education?: string[];
  certifications?: string[];
  bio?: string;
  nextAvailable?: string;
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

interface BookAppointmentData {
  doctorId: string;
  appointmentDate: string;
  notes: string;
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

// Available days and time slots
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

// Specializations with icons
const SPECIALIZATIONS = [
  { value: 'Cardiology', label: 'Cardiology', icon: HeartIcon, color: 'text-red-600' },
  { value: 'Neurology', label: 'Neurology', icon: Brain, color: 'text-blue-600' },
  { value: 'Orthopedics', label: 'Orthopedics', icon: Bone, color: 'text-green-600' },
  { value: 'Pediatrics', label: 'Pediatrics', icon: Baby, color: 'text-pink-600' },
  { value: 'Dermatology', label: 'Dermatology', icon: Thermometer, color: 'text-orange-600' },
  { value: 'Gynecology', label: 'Gynecology', icon: ActivityIcon, color: 'text-purple-600' },
  { value: 'Oncology', label: 'Oncology', icon: Microscope, color: 'text-gray-600' },
  { value: 'Psychiatry', label: 'Psychiatry', icon: Brain, color: 'text-indigo-600' },
  { value: 'General Surgery', label: 'General Surgery', icon: Activity, color: 'text-teal-600' },
  { value: 'Radiology', label: 'Radiology', icon: EyeIcon, color: 'text-yellow-600' }
];

// Main Component
const DoctorsModule = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [bookingForm, setBookingForm] = useState<BookAppointmentData>({
    doctorId: '',
    appointmentDate: '',
    notes: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [isViewingReports, setIsViewingReports] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchDoctors();
    fetchDoctorStats();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchQuery, selectedSpecialization, selectedStatus, selectedAvailability]);

  // API Functions
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(DOCTORS_API.ALL);
      
      if (response.data && Array.isArray(response.data)) {
        const doctorsData = response.data.map((doctor: any, index: number) => {
          const processedDoctor: Doctor = {
            _id: doctor._id || doctor.id || `temp-${Date.now()}-${index}`,
            fullName: doctor.fullName || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Unnamed Doctor',
            email: doctor.email || '',
            phone: doctor.phone || '',
            specialization: doctor.specialization || 'General',
            hospitalName: doctor.hospitalName || '',
            degrees: doctor.degrees || doctor.qualification || 'MBBS',
            experienceYears: doctor.experienceYears || doctor.experience || 0,
            fee: doctor.fee || doctor.consultationFee || 0,
            availableDays: doctor.availableDays || [],
            availableSlots: doctor.availableSlots || [],
            status: mapStatus(doctor.status || (doctor.isActive !== false ? 'active' : 'inactive')),
            availability: mapAvailability(doctor.availability || 'available'),
            rating: doctor.rating || 0,
            totalAppointments: doctor.totalAppointments || doctor.appointmentCount || 0,
            revenue: doctor.revenue || doctor.totalRevenue || 0,
            joinedDate: doctor.joinedDate || doctor.createdAt || new Date().toISOString(),
            location: doctor.location || doctor.address || '',
            nextAvailable: doctor.nextAvailable || doctor.availableFrom || 'Not scheduled'
          };
          
          return processedDoctor;
        });
        
        setDoctors(doctorsData);
        
        if (doctorsData.length === 0) {
          setError('No doctors data received from API');
        }
      } else {
        setDoctors([]);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      setDoctors([]);
      setError(`Failed to load doctors: ${(error as any).message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorStats = async () => {
    try {
      const response = await api.get(ANALYTICS_API.TOTAL_DOCTORS);
      
      if (response.data) {
        setTotalStats(response.data);
      } else {
        const defaultStats = {
          total: doctors.length,
          active: doctors.filter(d => d.status === 'active').length,
          pending: doctors.filter(d => d.status === 'pending').length,
          available: doctors.filter(d => d.availability === 'available').length,
          onLeave: doctors.filter(d => d.status === 'on_leave').length,
          totalRevenue: doctors.reduce((sum, d) => sum + (d.revenue || 0), 0),
          specializations: doctors.reduce((acc, d) => {
            acc[d.specialization] = (acc[d.specialization] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number })
        };
        setTotalStats(defaultStats);
      }
    } catch (error) {
      const defaultStats = {
        total: doctors.length,
        active: doctors.filter(d => d.status === 'active').length,
        pending: doctors.filter(d => d.status === 'pending').length,
        available: doctors.filter(d => d.availability === 'available').length,
        onLeave: doctors.filter(d => d.status === 'on_leave').length,
        totalRevenue: doctors.reduce((sum, d) => sum + (d.revenue || 0), 0),
        specializations: doctors.reduce((acc, d) => {
          acc[d.specialization] = (acc[d.specialization] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      };
      setTotalStats(defaultStats);
    }
  };

  const fetchRecentAppointments = async (doctorId: string) => {
    try {
      const url = APPOINTMENTS_API.DOCTOR_APPOINTMENTS(doctorId);
      const response = await api.get(url);
      
      if (response.data && Array.isArray(response.data)) {
        setRecentAppointments(response.data.slice(0, 3));
      } else {
        setRecentAppointments([]);
      }
    } catch (error) {
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
        doctor.fullName.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        doctor.email?.toLowerCase().includes(query) ||
        doctor.hospitalName?.toLowerCase().includes(query) ||
        doctor.degrees.toLowerCase().includes(query)
      );
    }
    
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(doctor => doctor.status === selectedStatus);
    }
    
    if (selectedAvailability !== 'all') {
      filtered = filtered.filter(doctor => doctor.availability === selectedAvailability);
    }
    
    setFilteredDoctors(filtered);
    setCurrentPage(1);
  };

  const getSpecializations = () => {
    const specializations = Array.from(new Set(doctors.map(d => d.specialization)));
    
    if (specializations.length === 0) {
      return SPECIALIZATIONS.map(s => s.value);
    }
    
    return specializations;
  };

  const handleStatusUpdate = async (doctorId: string, newStatus: Doctor['status']) => {
    try {
      await api.patch(DOCTORS_API.UPDATE, { id: doctorId, status: newStatus });
      
      setDoctors(doctors.map(doctor => doctor._id === doctorId ? { ...doctor, status: newStatus } : doctor));
      fetchDoctorStats();
      alert(`Doctor status updated to ${newStatus}`);
    } catch (error) {
      alert('Failed to update doctor status. Please try again.');
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      try {
        await api.delete(DOCTORS_API.DELETE(doctorId));
        
        setDoctors(doctors.filter(doctor => doctor._id !== doctorId));
        fetchDoctorStats();
        alert('Doctor deleted successfully.');
      } catch (error) {
        alert('Failed to delete doctor. Please try again.');
      }
    }
  };

  const handleAddDoctor = async (doctorData: any) => {
    try {
      const requiredFields = ['fullName', 'specialization', 'degrees', 'experienceYears', 'fee'];
      const missingFields = requiredFields.filter(field => !doctorData[field] && doctorData[field] !== 0);
      
      if (missingFields.length > 0) {
        alert(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      const apiData = {
        fullName: doctorData.fullName,
        specialization: doctorData.specialization,
        degrees: doctorData.degrees,
        phone: doctorData.phone || '',
        hospitalName: doctorData.hospitalName || '',
        experienceYears: parseInt(doctorData.experienceYears) || 0,
        fee: parseFloat(doctorData.fee) || 0,
        availableDays: doctorData.availableDays || [],
        availableSlots: doctorData.availableSlots || []
      };
      
      const response = await api.post(DOCTORS_API.CREATE, apiData);
      
      if (response.data) {
        const newDoctor: Doctor = {
          _id: response.data.id || response.data._id || `temp-${Date.now()}`,
          fullName: response.data.fullName || apiData.fullName,
          phone: response.data.phone || apiData.phone,
          specialization: response.data.specialization || apiData.specialization,
          hospitalName: response.data.hospitalName || apiData.hospitalName,
          degrees: response.data.degrees || apiData.degrees,
          experienceYears: response.data.experienceYears || apiData.experienceYears,
          fee: response.data.fee || apiData.fee,
          availableDays: response.data.availableDays || apiData.availableDays,
          availableSlots: response.data.availableSlots || apiData.availableSlots,
          status: 'pending',
          availability: 'available',
          rating: 0,
          totalAppointments: 0,
          revenue: 0,
          joinedDate: new Date().toISOString()
        };
        
        setDoctors([...doctors, newDoctor]);
        setIsAddModalOpen(false);
        fetchDoctorStats();
        alert('Doctor added successfully!');
      }
    } catch (error: any) {
      let errorMessage = 'Failed to add doctor. ';
      
      if (error.response) {
        if (error.response.status === 500) {
          errorMessage += 'Server error (500). Please check server logs.';
        } else if (error.response.data?.message) {
          errorMessage += error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage += error.response.data.error;
        } else {
          errorMessage += `Server responded with status ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
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
        alert('Doctor updated successfully!');
      }
    } catch (error) {
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
      setIsExporting(true);
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
      alert('Failed to export doctors. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenBookingModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingForm({
      doctorId: doctor._id,
      appointmentDate: '',
      notes: ''
    });
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedDoctor(null);
    setBookingForm({
      doctorId: '',
      appointmentDate: '',
      notes: ''
    });
  };

  const handleBookAppointment = async () => {
    if (!bookingForm.appointmentDate) {
      alert('Please select an appointment date and time');
      return;
    }

    if (!bookingForm.doctorId) {
      alert('Doctor information is missing');
      return;
    }

    try {
      setIsBooking(true);
      
      const response = await api.post(APPOINTMENTS_API.BOOK, bookingForm);
      
      if (response.data) {
        alert('Appointment booked successfully!');
        handleCloseBookingModal();
        
        if (selectedDoctor) {
          await fetchRecentAppointments(selectedDoctor._id);
        }
        
        fetchDoctors();
      }
    } catch (error: any) {
      let errorMessage = 'Failed to book appointment. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  const handleShareProfile = (doctor: Doctor) => {
    setIsSharing(true);
    setTimeout(() => {
      if (navigator.share) {
        navigator.share({
          title: `Dr. ${doctor.fullName}`,
          text: `Check out Dr. ${doctor.fullName}, ${doctor.specialization} at ${doctor.hospitalName}`,
          url: window.location.href,
        }).catch(() => {
          navigator.clipboard.writeText(`${doctor.fullName} - ${doctor.specialization}`)
            .then(() => alert('Profile link copied to clipboard!'));
        });
      } else {
        navigator.clipboard.writeText(`${doctor.fullName} - ${doctor.specialization}`)
          .then(() => alert('Profile link copied to clipboard!'));
      }
      setIsSharing(false);
    }, 500);
  };

  const handlePrintDetails = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleSendMessage = (doctor: Doctor) => {
    setIsMessaging(true);
    const message = `Hi Dr. ${doctor.fullName}, I'd like to discuss...`;
    alert(`Open messaging interface for Dr. ${doctor.fullName}\nMessage: ${message}`);
    setTimeout(() => setIsMessaging(false), 1000);
  };

  const handleViewReports = (doctor: Doctor) => {
    setIsViewingReports(true);
    router.push(`/admin/reports?doctorId=${doctor._id}`);
    setTimeout(() => setIsViewingReports(false), 1000);
  };

  const handleMoreOptions = (doctor: Doctor) => {
    const options = [
      { label: 'View Profile', action: () => openDoctorModal(doctor) },
      { label: 'Edit Doctor', action: () => { setSelectedDoctor(doctor); setIsEditModalOpen(true); } },
      { label: 'Message Doctor', action: () => handleSendMessage(doctor) },
      { label: 'View Reports', action: () => handleViewReports(doctor) },
      { label: 'Share Profile', action: () => handleShareProfile(doctor) },
      { label: 'Print Details', action: handlePrintDetails },
      { label: 'Schedule Leave', action: () => handleStatusUpdate(doctor._id, 'on_leave') },
      { label: doctor.status !== 'active' ? 'Activate Doctor' : 'Deactivate Doctor', 
        action: () => handleStatusUpdate(doctor._id, doctor.status === 'active' ? 'inactive' : 'active') },
    ];
    
    const selectedOption = prompt(
      `Select an option for Dr. ${doctor.fullName}:\n${options.map((opt, i) => `${i + 1}. ${opt.label}`).join('\n')}`
    );
    
    if (selectedOption) {
      const index = parseInt(selectedOption) - 1;
      if (options[index]) {
        options[index].action();
      }
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

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
        <Sidebar pendingApprovals={totalStats.pending} activeRoute="/admin/doctors" />
        
        <div className="flex-1 overflow-auto ml-72 flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Error Loading Doctors</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setError(null);
                  fetchDoctors();
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 cursor-pointer"
              >
                Retry Loading
              </button>
              <button 
                onClick={() => {
                  setError(null);
                  setDoctors([]);
                }}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 cursor-pointer"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
      <Sidebar pendingApprovals={totalStats.pending} activeRoute="/admin/doctors" />
      <div className="flex-1 overflow-auto ml-72">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} adminData={{ name: 'System Admin' }} searchPlaceholder="Search doctors..." />
        
        {/* Page Header */}
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

        {/* Stats Overview */}
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

        {/* Filters */}
        <div className="px-8 pb-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Search doctors by name, specialization, hospital..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200" />
              </div>
              <div className="flex items-center space-x-4">
                <SelectFilter value={selectedSpecialization} onChange={setSelectedSpecialization} options={['All Specializations', ...getSpecializations()]} />
                <SelectFilter value={selectedStatus} onChange={setSelectedStatus} options={['All Status', 'Active', 'Pending', 'Inactive', 'On Leave']} />
                <SelectFilter value={selectedAvailability} onChange={setSelectedAvailability} options={['All Availability', 'Available', 'Busy', 'Unavailable']} />
                <button onClick={handleExportDoctors} disabled={isExporting} className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span className="text-sm font-medium">{isExporting ? 'Exporting...' : 'Export'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">All Doctors</h3>
              <p className="text-sm text-gray-500">Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredDoctors.length)} of {filteredDoctors.length} doctors</p>
            </div>
            {currentDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentDoctors.map((doctor) => (
                  <DoctorCard 
                    key={doctor._id} 
                    doctor={doctor} 
                    onView={openDoctorModal} 
                    onStatusUpdate={handleStatusUpdate} 
                    onDelete={handleDeleteDoctor} 
                    onEdit={() => { setSelectedDoctor(doctor); setIsEditModalOpen(true); }} 
                    onBook={() => handleOpenBookingModal(doctor)}
                    onMoreOptions={() => handleMoreOptions(doctor)}
                  />
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

        {/* Quick Actions */}
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

      {/* Modals */}
      {isModalOpen && selectedDoctor && (
        <DoctorDetailModal 
          doctor={selectedDoctor} 
          onClose={closeDoctorModal} 
          appointments={recentAppointments} 
          onBookAppointment={() => handleOpenBookingModal(selectedDoctor)}
          onSendMessage={() => handleSendMessage(selectedDoctor)}
          onViewReports={() => handleViewReports(selectedDoctor)}
          onShareProfile={() => handleShareProfile(selectedDoctor)}
          onPrintDetails={handlePrintDetails}
          isSharing={isSharing}
          isPrinting={isPrinting}
          isMessaging={isMessaging}
          isViewingReports={isViewingReports}
        />
      )}
      {isAddModalOpen && <AddDoctorModal onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddDoctor} />}
      {isEditModalOpen && selectedDoctor && <EditDoctorModal doctor={selectedDoctor} onClose={() => { setIsEditModalOpen(false); setSelectedDoctor(null); }} onSubmit={handleUpdateDoctor} />}
      
      {/* Booking Modal */}
      {isBookingModalOpen && selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          formData={bookingForm}
          onFormChange={(field, value) => setBookingForm({...bookingForm, [field]: value})}
          onClose={handleCloseBookingModal}
          onSubmit={handleBookAppointment}
          isSubmitting={isBooking}
        />
      )}
    </div>
  );
};

// DoctorCard Component
const DoctorCard: React.FC<{
  doctor: Doctor; 
  onView: (doctor: Doctor) => void; 
  onStatusUpdate: (id: string, status: Doctor['status']) => void;
  onDelete: (id: string) => void; 
  onEdit: () => void;
  onBook: () => void;
  onMoreOptions: () => void;
}> = ({ doctor, onView, onStatusUpdate, onDelete, onEdit, onBook, onMoreOptions }) => {
  const statusColors = { active: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', inactive: 'bg-gray-100 text-gray-700', on_leave: 'bg-orange-100 text-orange-700' };
  const availabilityColors = { available: 'bg-green-100 text-green-700', busy: 'bg-yellow-100 text-yellow-700', unavailable: 'bg-red-100 text-red-700' };
  const statusIcons = { active: <CheckCircle className="w-3 h-3" />, pending: <Clock className="w-3 h-3" />, on_leave: <Clock className="w-3 h-3" />, inactive: <XCircle className="w-3 h-3" /> };
  
  const specializationIcon = SPECIALIZATIONS.find(s => s.value === doctor.specialization)?.icon || Stethoscope;
  const specializationColor = SPECIALIZATIONS.find(s => s.value === doctor.specialization)?.color || 'text-purple-600';

  const SpecializationIconComponent = specializationIcon;

  return (
    <div className="bg-white border border-gray-200/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {doctor.fullName?.charAt(0) || 'D'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{doctor.fullName || 'Unnamed Doctor'}</h3>
            <p className="text-xs text-gray-500">{doctor.hospitalName || 'No hospital specified'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => onView(doctor)} className="p-1.5 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-purple-600" title="View Details"><Eye className="w-4 h-4" /></button>
          <button onClick={onMoreOptions} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-gray-700" title="More Options"><MoreVertical className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700`}>
            <SpecializationIconComponent className={`w-3 h-3 mr-1 ${specializationColor}`} />
            {doctor.specialization || 'General'}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-600 mb-1"><GraduationCap className="w-3 h-3 mr-1" />{doctor.degrees || 'MBBS'}</div>
        <div className="flex items-center text-xs text-gray-600"><BriefcaseMedical className="w-3 h-3 mr-1" />{doctor.experienceYears || 0} years experience</div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[doctor.status]}`}>
          {statusIcons[doctor.status]}
          <span className="ml-1">{doctor.status.replace('_', ' ')}</span>
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${availabilityColors[doctor.availability]}`}>
          {doctor.availability === 'available' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          <span className="ml-1">{doctor.availability}</span>
        </span>
      </div>
      <div className="space-y-2 mb-4">
        {doctor.phone && (
          <div className="flex items-center text-xs text-gray-600">
            <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">{doctor.phone}</span>
          </div>
        )}
        {doctor.hospitalName && (
          <div className="flex items-center text-xs text-blue-600">
            <Building className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">{doctor.hospitalName}</span>
          </div>
        )}
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
            <span className="text-sm font-medium">{doctor.rating || 0}/5.0</span>
          </div>
          <div className="text-sm font-medium text-green-600">${doctor.fee || 0}</div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{doctor.totalAppointments || 0} appointments</span>
          {doctor.revenue && <span>${doctor.revenue.toLocaleString()} revenue</span>}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-600">
          <Clock className="w-3 h-3 mr-1" />
          <span>{doctor.nextAvailable || 'Not scheduled'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={onBook} className="p-1.5 hover:bg-green-50 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-green-600" title="Book Appointment"><Calendar className="w-4 h-4" /></button>
          <button onClick={() => doctor.status !== 'on_leave' ? onStatusUpdate(doctor._id, 'on_leave') : onStatusUpdate(doctor._id, 'active')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-orange-600" title={doctor.status !== 'on_leave' ? "Mark on leave" : "Activate"}><Clock className="w-4 h-4" /></button>
          <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-blue-600" title="Edit"><Edit className="w-4 h-4" /></button>
          {doctor.status !== 'pending' && <button onClick={() => onDelete(doctor._id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>}
        </div>
      </div>
    </div>
  );
};

// StatCard Component
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
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {trend.startsWith('+') ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
            <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{trend} from last month</span>
          </div>
        </div>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        </div>
      </div>
    </div>
  );
};

// ActionCard Component
const ActionCard: React.FC<{
  icon: React.ElementType; title: string; description: string; color: 'purple' | 'green' | 'blue' | 'red'; onClick: () => void;
}> = ({ icon: Icon, title, description, color, onClick }) => {
  const colorClasses = { purple: 'bg-purple-100 text-purple-600', green: 'bg-green-100 text-green-600', blue: 'bg-blue-100 text-blue-600', red: 'bg-red-100 text-red-600' };
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

// SelectFilter Component
const SelectFilter: React.FC<{ value: string; onChange: (value: string) => void; options: string[]; }> = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value.toLowerCase().replace(' ', '_'))} className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm">
    {options.map((opt) => <option key={opt} value={opt.toLowerCase().replace(' ', '_')}>{opt}</option>)}
  </select>
);

// Pagination Component
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

// BookingModal Component
const BookingModal: React.FC<{
  doctor: Doctor;
  formData: BookAppointmentData;
  onFormChange: (field: keyof BookAppointmentData, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}> = ({ doctor, formData, onFormChange, onClose, onSubmit, isSubmitting }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
              <p className="text-sm text-gray-500 mt-1">Schedule with Dr. {doctor.fullName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Doctor Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {doctor.fullName?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{doctor.fullName}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <p className="text-sm text-gray-500">{doctor.hospitalName || 'General Hospital'}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Fee</p>
                    <p className="text-lg font-bold text-green-600">${doctor.fee || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="text-lg font-bold text-yellow-600">{doctor.rating || 0}/5.0</p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.appointmentDate}
                    onChange={(e) => onFormChange('appointmentDate', e.target.value)}
                    required
                    min={`${today}T09:00`}
                    max={`${maxDateStr}T17:00`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Available: Mon-Fri, 9:00 AM - 5:00 PM
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => onFormChange('notes', e.target.value)}
                    rows={3}
                    placeholder="Any specific concerns or requirements for the appointment..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-800 mb-2">Appointment Summary</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex justify-between">
                    <span>Doctor:</span>
                    <span className="font-medium">Dr. {doctor.fullName}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Specialization:</span>
                    <span className="font-medium">{doctor.specialization}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Consultation Fee:</span>
                    <span className="font-medium">${doctor.fee || 0}</span>
                  </li>
                  <li className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-medium">Total Payable:</span>
                    <span className="font-bold text-green-600">${doctor.fee || 0}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-6">
              <div className="flex flex-col space-y-3">
                <div className="text-xs text-gray-500 text-center">
                  By booking this appointment, you agree to our terms and conditions.
                </div>
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    disabled={isSubmitting}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 font-medium flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// DoctorDetailModal Component
const DoctorDetailModal: React.FC<{ 
  doctor: Doctor; 
  onClose: () => void; 
  appointments: Appointment[]; 
  onBookAppointment: () => void;
  onSendMessage: () => void;
  onViewReports: () => void;
  onShareProfile: () => void;
  onPrintDetails: () => void;
  isSharing: boolean;
  isPrinting: boolean;
  isMessaging: boolean;
  isViewingReports: boolean;
}> = ({ doctor, onClose, appointments, onBookAppointment, onSendMessage, onViewReports, onShareProfile, onPrintDetails, isSharing, isPrinting, isMessaging, isViewingReports }) => {
  const performanceMetrics = [
    { label: 'Patient Satisfaction', value: '96%', color: 'text-green-600', icon: DownloadIcon },
    { label: 'On-time Rate', value: '94%', color: 'text-blue-600', icon: Clock },
    { label: 'Success Rate', value: '98%', color: 'text-purple-600', icon: Target },
    { label: 'Follow-up Rate', value: '92%', color: 'text-orange-600', icon: MessageSquare }
  ];

  const specializationIcon = SPECIALIZATIONS.find(s => s.value === doctor.specialization)?.icon || Stethoscope;
  const specializationColor = SPECIALIZATIONS.find(s => s.value === doctor.specialization)?.color || 'text-purple-600';
  
  const SpecializationIconComponent = specializationIcon;

  const quickActions = [
    { icon: MessageSquare, label: 'Send Message', onClick: onSendMessage, loading: isMessaging },
    { icon: Calendar, label: 'Schedule Appointment', onClick: onBookAppointment },
    { icon: FileText, label: 'View Reports', onClick: onViewReports, loading: isViewingReports },
    { icon: Share2, label: 'Share Profile', onClick: onShareProfile, loading: isSharing },
    { icon: Printer, label: 'Print Details', onClick: onPrintDetails, loading: isPrinting },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-6xl mx-auto max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl transition-all duration-300">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {doctor.fullName?.charAt(0) || 'D'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{doctor.fullName || 'Unnamed Doctor'}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${doctor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {doctor.status === 'active' ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
                    {doctor.status?.charAt(0)?.toUpperCase() + doctor.status?.slice(1)?.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${doctor.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {doctor.availability === 'available' ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
                    {doctor.availability?.charAt(0)?.toUpperCase() + doctor.availability?.slice(1)}
                  </span>
                  <div className="flex items-center text-yellow-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 font-medium">{doctor.rating || 0}/5.0</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <InfoCard title="Personal Information" icon={UserIcon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField icon={Mail} label="Email" value={doctor.email || 'No email'} />
                  <InfoField icon={Phone} label="Phone" value={doctor.phone || 'Not provided'} />
                  <InfoField icon={MapPin} label="Hospital" value={doctor.hospitalName || 'Not specified'} />
                  <InfoField icon={Calendar} label="Joined Date" value={doctor.joinedDate ? new Date(doctor.joinedDate).toLocaleDateString() : 'Not specified'} />
                  <InfoField icon={BadgeCheck} label="Degrees" value={doctor.degrees || 'N/A'} />
                  <InfoField icon={DollarSign} label="Consultation Fee" value={`$${doctor.fee || 0}`} />
                </div>
              </InfoCard>
              <InfoCard title="Professional Details" icon={BriefcaseMedical}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Specialization</label>
                      <div className="mt-1 flex items-center">
                        <SpecializationIconComponent className={`w-5 h-5 mr-2 ${specializationColor}`} />
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                          {doctor.specialization || 'General'}
                        </span>
                      </div>
                    </div>
                    <InfoField label="Experience" value={`${doctor.experienceYears || 0} years`} />
                  </div>
                </div>
              </InfoCard>
              <InfoCard title="Availability" icon={Calendar}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Available Days</label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_DAYS.map(day => (
                        <span 
                          key={day} 
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${doctor.availableDays?.includes(day) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Available Time Slots</label>
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map(slot => (
                        <span 
                          key={slot} 
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${doctor.availableSlots?.includes(slot) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </InfoCard>
              <InfoCard title="Performance Metrics" icon={DownloadIcon}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {performanceMetrics.map((metric, index) => (
                    <MetricCard key={index} metric={metric} />
                  ))}
                </div>
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
                      <span className={`text-xs px-2 py-1 rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' : appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {appointment.status}
                      </span>
                    </div>
                  )) : <p className="text-sm text-gray-500 text-center py-4">No recent appointments</p>}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {quickActions.map((action, idx) => (
                    <button 
                      key={idx} 
                      onClick={action.onClick} 
                      disabled={action.loading}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {action.loading ? (
                        <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
                      ) : (
                        <action.icon className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-sm text-gray-700">{action.label}</span>
                      {action.loading && <span className="text-xs text-gray-500 ml-auto">...</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ShieldIcon className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                Close
              </button>
              <button onClick={onBookAppointment} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200">
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AddDoctorModal Component
const AddDoctorModal: React.FC<{ onClose: () => void; onSubmit: (doctorData: any) => void; }> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    specialization: '', 
    degrees: '', 
    phone: '', 
    hospitalName: '', 
    experienceYears: '', 
    fee: '', 
    availableDays: [] as string[],
    availableSlots: [] as string[]
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!formData.degrees.trim()) newErrors.degrees = 'Degrees/Qualifications are required';
    if (!formData.experienceYears || parseInt(formData.experienceYears) < 0) newErrors.experienceYears = 'Valid experience is required';
    if (!formData.fee || parseFloat(formData.fee) <= 0) newErrors.fee = 'Valid consultation fee is required';
    if (formData.availableDays.length === 0) newErrors.availableDays = 'At least one available day is required';
    if (formData.availableSlots.length === 0) newErrors.availableSlots = 'At least one time slot is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    
    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({ 
        ...formData, 
        experienceYears: parseInt(formData.experienceYears), 
        fee: parseFloat(formData.fee),
        availableDays: formData.availableDays,
        availableSlots: formData.availableSlots
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
    if (errors[e.target.name]) {
      setErrors({...errors, [e.target.name]: ''});
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
    
    if (errors.availableDays) {
      setErrors({...errors, availableDays: ''});
    }
  };

  const handleSlotToggle = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter(s => s !== slot)
        : [...prev.availableSlots, slot]
    }));
    
    if (errors.availableSlots) {
      setErrors({...errors, availableSlots: ''});
    }
  };

  const clearAllDays = () => {
    setFormData(prev => ({ ...prev, availableDays: [] }));
  };

  const selectAllDays = () => {
    setFormData(prev => ({ ...prev, availableDays: [...ALL_DAYS] }));
  };

  const clearAllSlots = () => {
    setFormData(prev => ({ ...prev, availableSlots: [] }));
  };

  const selectAllSlots = () => {
    setFormData(prev => ({ ...prev, availableSlots: [...TIME_SLOTS] }));
  };

  const selectedSpecialization = SPECIALIZATIONS.find(s => s.value === formData.specialization);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Doctor</h2>
              <p className="text-sm text-gray-500 mt-1">Fill in the doctor's information below</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleChange} 
                      required 
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.fullName ? 'border-red-300' : 'border-gray-300'}`} 
                      placeholder="Dr. John Doe" 
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200" 
                      placeholder="+1 (555) 123-4567" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="specialization" 
                      value={formData.specialization} 
                      onChange={handleChange} 
                      required 
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.specialization ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      <option value="">Select specialization</option>
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec.value} value={spec.value}>
                          {spec.label}
                        </option>
                      ))}
                    </select>
                    {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>}
                    {selectedSpecialization && (
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <selectedSpecialization.icon className={`w-4 h-4 mr-2 ${selectedSpecialization.color}`} />
                        <span>{selectedSpecialization.label}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hospital/Clinic Name
                    </label>
                    <input 
                      type="text" 
                      name="hospitalName" 
                      value={formData.hospitalName} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200" 
                      placeholder="City General Hospital" 
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Degrees & Qualifications <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="degrees" 
                      value={formData.degrees} 
                      onChange={handleChange} 
                      required 
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.degrees ? 'border-red-300' : 'border-gray-300'}`} 
                      placeholder="MD, MBBS, FRCS, etc." 
                    />
                    {errors.degrees && <p className="mt-1 text-sm text-red-600">{errors.degrees}</p>}
                    <p className="mt-1 text-xs text-gray-500">Separate multiple degrees with commas</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience (Years) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        name="experienceYears" 
                        value={formData.experienceYears} 
                        onChange={handleChange} 
                        required 
                        min="0" 
                        max="50" 
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.experienceYears ? 'border-red-300' : 'border-gray-300'}`} 
                        placeholder="5" 
                      />
                      {errors.experienceYears && <p className="mt-1 text-sm text-red-600">{errors.experienceYears}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultation Fee ($) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        name="fee" 
                        value={formData.fee} 
                        onChange={handleChange} 
                        required 
                        min="0" 
                        step="0.01" 
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.fee ? 'border-red-300' : 'border-gray-300'}`} 
                        placeholder="100.00" 
                      />
                      {errors.fee && <p className="mt-1 text-sm text-red-600">{errors.fee}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Availability Schedule
                </h3>
                
                {/* Available Days */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Available Days <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <button type="button" onClick={selectAllDays} className="text-xs text-purple-600 hover:text-purple-700">
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button type="button" onClick={clearAllDays} className="text-xs text-gray-600 hover:text-gray-700">
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
                    {ALL_DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                          formData.availableDays.includes(day)
                            ? 'bg-purple-100 border-purple-500 text-purple-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm font-medium">{day.slice(0, 3)}</span>
                        {formData.availableDays.includes(day) && (
                          <Check className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.availableDays && <p className="mt-2 text-sm text-red-600">{errors.availableDays}</p>}
                  {formData.availableDays.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {formData.availableDays.join(', ')}
                    </p>
                  )}
                </div>

                {/* Available Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Available Time Slots <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <button type="button" onClick={selectAllSlots} className="text-xs text-purple-600 hover:text-purple-700">
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button type="button" onClick={clearAllSlots} className="text-xs text-gray-600 hover:text-gray-700">
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotToggle(slot)}
                        className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                          formData.availableSlots.includes(slot)
                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm font-medium">{slot}</span>
                        {formData.availableSlots.includes(slot) && (
                          <Check className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.availableSlots && <p className="mt-2 text-sm text-red-600">{errors.availableSlots}</p>}
                  {formData.availableSlots.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {formData.availableSlots.join(', ')}
                    </p>
                  )}
                </div>

                {/* Summary */}
                {formData.availableDays.length > 0 && formData.availableSlots.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      <Check className="w-4 h-4 inline mr-2" />
                      Availability set: {formData.availableDays.length} day(s), {formData.availableSlots.length} time slot(s)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-6">
              <div className="flex flex-col space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Required fields are marked with <span className="text-red-500">*</span>. 
                    The doctor will be added with "pending" status and can be activated later.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    disabled={isSubmitting}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 font-medium flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding Doctor...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Doctor
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// EditDoctorModal Component
const EditDoctorModal: React.FC<{ doctor: Doctor; onClose: () => void; onSubmit: (doctorId: string, updateData: any) => void; }> = ({ doctor, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: doctor.fullName,
    specialization: doctor.specialization,
    degrees: doctor.degrees,
    phone: doctor.phone || '',
    hospitalName: doctor.hospitalName || '',
    experienceYears: doctor.experienceYears.toString(),
    fee: doctor.fee.toString(),
    availableDays: doctor.availableDays || [],
    availableSlots: doctor.availableSlots || [],
    status: doctor.status,
    availability: doctor.availability
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!formData.degrees.trim()) newErrors.degrees = 'Degrees/Qualifications are required';
    if (!formData.experienceYears || parseInt(formData.experienceYears) < 0) newErrors.experienceYears = 'Valid experience is required';
    if (!formData.fee || parseFloat(formData.fee) <= 0) newErrors.fee = 'Valid consultation fee is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    
    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(doctor._id, { 
        ...formData, 
        experienceYears: parseInt(formData.experienceYears), 
        fee: parseFloat(formData.fee)
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
    if (errors[e.target.name]) {
      setErrors({...errors, [e.target.name]: ''});
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSlotToggle = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter(s => s !== slot)
        : [...prev.availableSlots, slot]
    }));
  };

  const selectedSpecialization = SPECIALIZATIONS.find(s => s.value === formData.specialization);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Doctor</h2>
              <p className="text-sm text-gray-500 mt-1">Update doctor information</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Doctor ID</p>
              <p className="font-medium text-gray-900">{doctor._id}</p>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    required 
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.fullName ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="specialization" 
                    value={formData.specialization} 
                    onChange={handleChange} 
                    required 
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.specialization ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    {SPECIALIZATIONS.map((spec) => (
                      <option key={spec.value} value={spec.value}>
                        {spec.label}
                      </option>
                    ))}
                  </select>
                  {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>}
                  {selectedSpecialization && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <selectedSpecialization.icon className={`w-4 h-4 mr-2 ${selectedSpecialization.color}`} />
                      <span>{selectedSpecialization.label}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                  <input 
                    type="text" 
                    name="hospitalName" 
                    value={formData.hospitalName} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Professional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degrees & Qualifications <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    name="degrees" 
                    value={formData.degrees} 
                    onChange={handleChange} 
                    required 
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.degrees ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.degrees && <p className="mt-1 text-sm text-red-600">{errors.degrees}</p>}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience (Years) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="experienceYears" 
                      value={formData.experienceYears} 
                      onChange={handleChange} 
                      required 
                      min="0" 
                      max="50" 
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.experienceYears ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.experienceYears && <p className="mt-1 text-sm text-red-600">{errors.experienceYears}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consultation Fee ($) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="fee" 
                      value={formData.fee} 
                      onChange={handleChange} 
                      required 
                      min="0" 
                      step="0.01" 
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.fee ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.fee && <p className="mt-1 text-sm text-red-600">{errors.fee}</p>}
                  </div>
                </div>
              </div>

              {/* Status & Availability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              {/* Availability Schedule */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Schedule</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Days
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
                    {ALL_DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                          formData.availableDays.includes(day)
                            ? 'bg-purple-100 border-purple-500 text-purple-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm font-medium">{day.slice(0, 3)}</span>
                        {formData.availableDays.includes(day) && (
                          <Check className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                  {formData.availableDays.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {formData.availableDays.join(', ')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotToggle(slot)}
                        className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                          formData.availableSlots.includes(slot)
                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm font-medium">{slot}</span>
                        {formData.availableSlots.includes(slot) && (
                          <Check className="w-4 h-4 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                  {formData.availableSlots.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {formData.availableSlots.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-6">
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={isSubmitting}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 font-medium flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Doctor'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; className?: string; }> = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Icon className="w-5 h-5 mr-2" />
      {title}
    </h3>
    {children}
  </div>
);

const InfoField: React.FC<{ icon?: React.ElementType; label: string; value: string; }> = ({ icon: Icon, label, value }) => (
  <div>
    {Icon && (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
    )}
    {!Icon && <div className="text-sm font-medium text-gray-600">{label}</div>}
    <p className="mt-1 text-gray-900 font-medium">{value}</p>
  </div>
);

const MetricCard: React.FC<{ metric: { label: string; value: string; color: string; icon: React.ElementType }; }> = ({ metric }) => {
  const Icon = metric.icon;
  return (
    <div className="bg-white rounded-lg p-4 text-center">
      <div className={`${metric.color} mb-2`}>
        <Icon className="w-6 h-6 mx-auto" />
      </div>
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
      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);

export default DoctorsModule;