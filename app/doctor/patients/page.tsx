"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Search, Filter, Plus, Calendar, Phone, Mail,
  MapPin, ChevronRight, MoreVertical, Eye, FileText,
  Clock, Activity, Heart, User
} from 'lucide-react';
import api from '@/lib/api/api';

/* ================= TYPES ================= */

interface Patient {
  _id: string;
  name: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | string;
  phone?: string;
  lastVisit?: string;
  nextAppointment?: string;
  conditions?: string[];
  status: 'active' | 'inactive' | 'new';
}

interface PatientStats {
  total: number;
  active: number;
  new: number;
  todayAppointments: number;
}

/* ================= COMPONENT ================= */

const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'new' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  /* ================= HELPER FUNCTIONS ================= */

  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) return 'Not scheduled';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  }, []);

  const getStatusColor = useCallback((status: Patient['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }, []);

  const getInitials = useCallback((name: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, []);

  const getTodayDateString = useCallback((): string => {
    return new Date().toISOString().split('T')[0];
  }, []);

  /* ================= STATS CALCULATION ================= */

  const patientStats = useMemo((): PatientStats => {
    const today = getTodayDateString();

    return {
      total: patients.length,
      active: patients.filter(p => p.status === 'active').length,
      new: patients.filter(p => p.status === 'new').length,
      todayAppointments: patients.filter(p =>
        p.nextAppointment && p.nextAppointment === today
      ).length
    };
  }, [patients, getTodayDateString]);

  /* ================= API ================= */

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctors/patients');

      let fetchedPatients: Patient[] = [];

      // Handle different response structures
      if (response.data?.data?.patients) {
        fetchedPatients = response.data.data.patients;
      } else if (response.data?.patients) {
        fetchedPatients = response.data.patients;
      } else if (Array.isArray(response.data?.data)) {
        fetchedPatients = response.data.data;
      } else if (Array.isArray(response.data)) {
        fetchedPatients = response.data;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        throw new Error('Invalid response format');
      }

      // Validate and normalize patient data
      const validatedPatients = fetchedPatients.map((patient: any) => ({
        _id: patient._id || patient.id || `patient-${Math.random().toString(36).substr(2, 9)}`,
        name: patient.name || 'Unknown Patient',
        email: patient.email || '',
        age: Number(patient.age) || 0,
        gender: patient.gender || 'Other',
        phone: patient.phone || patient.phoneNumber || undefined,
        lastVisit: patient.lastVisit || patient.lastAppointment || undefined,
        nextAppointment: patient.nextAppointment || patient.nextVisit || undefined,
        conditions: Array.isArray(patient.conditions) ? patient.conditions :
          patient.conditions ? [patient.conditions] : [],
        status: (patient.status as Patient['status']) || 'new'
      }));

      setPatients(validatedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Fallback mock data with better validation
      const mockPatients: Patient[] = [
        {
          _id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          age: 45,
          gender: 'Male',
          phone: '+1 234 567 8900',
          lastVisit: '2024-01-15',
          nextAppointment: getTodayDateString(),
          conditions: ['Hypertension', 'Diabetes'],
          status: 'active'
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          age: 32,
          gender: 'Female',
          phone: '+1 234 567 8901',
          lastVisit: '2024-01-10',
          nextAppointment: '2024-02-10',
          conditions: ['Asthma', 'Seasonal Allergies'],
          status: 'new'
        },
        {
          _id: '3',
          name: 'Robert Davis',
          email: 'robert@example.com',
          age: 58,
          gender: 'Male',
          phone: '+1 234 567 8902',
          lastVisit: '2023-12-20',
          nextAppointment: '2024-03-15',
          conditions: ['Arthritis'],
          status: 'inactive'
        },
        {
          _id: '4',
          name: 'Emma Wilson',
          email: 'emma@example.com',
          age: 28,
          gender: 'Female',
          lastVisit: '2024-01-05',
          conditions: ['Migraine'],
          status: 'active'
        }
      ];

      setPatients(mockPatients);
    } finally {
      setLoading(false);
    }
  }, [getTodayDateString]);

  /* ================= FILTERING ================= */

  const filterPatients = useCallback(() => {
    let filtered = [...patients];

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === activeFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(patient => {
        const matchesName = patient.name.toLowerCase().includes(searchLower);
        const matchesEmail = patient.email.toLowerCase().includes(searchLower);
        const matchesPhone = patient.phone?.toLowerCase().includes(searchLower);
        const matchesConditions = patient.conditions?.some(cond =>
          cond.toLowerCase().includes(searchLower)
        );

        return matchesName || matchesEmail || matchesPhone || matchesConditions;
      });
    }

    setFilteredPatients(filtered);
  }, [patients, activeFilter, searchTerm]);

  /* ================= EVENT HANDLERS ================= */

  const handleAddPatient = useCallback(() => {
    console.log('Opening add patient form...');
    // In a real app, this would open a modal or navigate to a form
    alert('Add patient functionality would be implemented here');
  }, []);

  const handleViewProfile = useCallback((patientId: string) => {
    console.log(`Viewing profile for patient: ${patientId}`);
    // In a real app, this would navigate to patient details
    // router.push(`/doctor/patients/${patientId}`);
  }, []);

  const handleViewMedicalRecords = useCallback((patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Viewing medical records for patient: ${patientId}`);
  }, []);

  const handleScheduleAppointment = useCallback((patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Scheduling appointment for patient: ${patientId}`);
  }, []);

  const handleMoreOptions = useCallback((patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`More options for patient: ${patientId}`);
  }, []);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    filterPatients();
  }, [filterPatients]);

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading patients...</p>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Patients</h1>
              <p className="text-gray-500 mt-2">Manage and view your patient records</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients by name, email, phone, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all duration-200"
                aria-label="Search patients"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <div className="flex flex-wrap items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                {(['all', 'active', 'new', 'inactive'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeFilter === filter
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{patientStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{patientStats.active}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">New Patients</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{patientStats.new}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{patientStats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-2xl shadow-lg shadow-green-500/5 border border-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => handleViewProfile(patient._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleViewProfile(patient._id);
                  }
                }}
                aria-label={`View ${patient.name}'s profile`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-green-700">
                          {getInitials(patient.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{patient.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(patient.status)}`}>
                            {patient.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {patient.age}y • {patient.gender}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleMoreOptions(patient._id, e)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 hover:bg-gray-100 rounded-lg"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    {patient.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm truncate">{patient.email}</span>
                      </div>
                    )}
                    {patient.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm truncate">{patient.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Medical Info */}
                  {patient.conditions && patient.conditions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Conditions</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.conditions.slice(0, 2).map((condition, index) => (
                          <span
                            key={index}
                            className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full"
                          >
                            {condition}
                          </span>
                        ))}
                        {patient.conditions.length > 2 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                            +{patient.conditions.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Appointment Info */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last Visit:</span>
                      <span className="font-medium text-gray-700">{formatDate(patient.lastVisit)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Next Appointment:</span>
                      <span className={`font-medium ${patient.nextAppointment === getTodayDateString()
                        ? 'text-yellow-600'
                        : patient.nextAppointment
                          ? 'text-green-600'
                          : 'text-gray-500'
                        }`}>
                        {formatDate(patient.nextAppointment)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(patient._id);
                      }}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium text-sm cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleViewMedicalRecords(patient._id, e)}
                        className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                        title="Medical Records"
                        aria-label="View medical records"
                      >
                        <FileText className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => handleScheduleAppointment(patient._id, e)}
                        className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                        title="Schedule Appointment"
                        aria-label="Schedule appointment"
                      >
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                {searchTerm
                  ? 'No patients match your search criteria. Try a different search term.'
                  : 'You have no patients in your practice yet.'}
              </p>
              <button
                onClick={handleAddPatient}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg shadow-green-500/30 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>{searchTerm ? 'Clear Search' : 'Add Your First Patient'}</span>
              </button>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientsPage;