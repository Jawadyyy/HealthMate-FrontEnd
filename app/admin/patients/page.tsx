"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, UserPlus, Search, Filter, Download, MoreVertical, 
  Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar, Activity,
  Bell, ChevronRight, RefreshCw, Plus, AlertCircle, CheckCircle,
  XCircle, ChevronDown, ArrowUpDown, FileText, XCircle as XCircleIcon,
  Heart, Clock, Stethoscope, Pill, Shield, AlertTriangle, Thermometer
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// ========== TYPES ==========
interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  medicalConditions: string[];
  lastVisit: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  age?: number;
  upcomingAppointments?: number;
  totalVisits?: number;
}

interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  newThisMonth: number;
  appointmentsToday: number;
}

interface FilterState {
  status: string;
  gender: string;
  search: string;
  dateRange: string;
}

// ========== MOCK DATA ==========
const MOCK_PATIENTS: Patient[] = [
  {
    _id: 'p001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    bloodGroup: 'O+',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: '+1 (555) 987-6543 (Jane Smith)',
    medicalConditions: ['Hypertension', 'Diabetes Type 2'],
    lastVisit: '2024-01-15',
    status: 'active',
    createdAt: '2023-05-20',
    updatedAt: '2024-01-15',
    age: 38,
    upcomingAppointments: 2,
    totalVisits: 12
  },
  {
    _id: 'p002',
    name: 'Emily Johnson',
    email: 'emily.j@email.com',
    phone: '+1 (555) 987-6543',
    dateOfBirth: '1990-07-22',
    gender: 'female',
    bloodGroup: 'A+',
    address: '456 Park Ave, Brooklyn, NY 11201',
    emergencyContact: '+1 (555) 456-7890 (Robert Johnson)',
    medicalConditions: ['Asthma', 'Seasonal Allergies'],
    lastVisit: '2024-01-18',
    status: 'active',
    createdAt: '2023-08-10',
    updatedAt: '2024-01-18',
    age: 33,
    upcomingAppointments: 1,
    totalVisits: 8
  },
  {
    _id: 'p003',
    name: 'Michael Brown',
    email: 'michael.b@email.com',
    phone: '+1 (555) 456-7890',
    dateOfBirth: '1978-11-30',
    gender: 'male',
    bloodGroup: 'B+',
    address: '789 Broadway, Queens, NY 11355',
    emergencyContact: '+1 (555) 321-0987 (Sarah Brown)',
    medicalConditions: ['Arthritis', 'High Cholesterol'],
    lastVisit: '2024-01-10',
    status: 'inactive',
    createdAt: '2022-12-05',
    updatedAt: '2024-01-10',
    age: 45,
    upcomingAppointments: 0,
    totalVisits: 5
  },
  {
    _id: 'p004',
    name: 'Sophia Davis',
    email: 'sophia.d@email.com',
    phone: '+1 (555) 321-0987',
    dateOfBirth: '1995-05-18',
    gender: 'female',
    bloodGroup: 'AB+',
    address: '101 Elm St, Bronx, NY 10451',
    emergencyContact: '+1 (555) 654-3210 (James Davis)',
    medicalConditions: [],
    lastVisit: '2024-01-20',
    status: 'active',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20',
    age: 28,
    upcomingAppointments: 3,
    totalVisits: 1
  },
  {
    _id: 'p005',
    name: 'David Wilson',
    email: 'david.w@email.com',
    phone: '+1 (555) 654-3210',
    dateOfBirth: '1982-09-25',
    gender: 'male',
    bloodGroup: 'O-',
    address: '202 Oak Ave, Staten Island, NY 10301',
    emergencyContact: '+1 (555) 789-0123 (Lisa Wilson)',
    medicalConditions: ['Migraine', 'Anxiety'],
    lastVisit: '2023-12-28',
    status: 'pending',
    createdAt: '2023-11-15',
    updatedAt: '2024-01-02',
    age: 41,
    upcomingAppointments: 0,
    totalVisits: 4
  },
  {
    _id: 'p006',
    name: 'Olivia Martinez',
    email: 'olivia.m@email.com',
    phone: '+1 (555) 789-0123',
    dateOfBirth: '1988-12-10',
    gender: 'female',
    bloodGroup: 'A-',
    address: '303 Pine St, Manhattan, NY 10016',
    emergencyContact: '+1 (555) 234-5678 (Carlos Martinez)',
    medicalConditions: ['Diabetes Type 1', 'Hypertension'],
    lastVisit: '2024-01-22',
    status: 'active',
    createdAt: '2023-06-15',
    updatedAt: '2024-01-22',
    age: 35,
    upcomingAppointments: 1,
    totalVisits: 15
  },
  {
    _id: 'p007',
    name: 'Robert Taylor',
    email: 'robert.t@email.com',
    phone: '+1 (555) 234-5678',
    dateOfBirth: '1975-02-28',
    gender: 'male',
    bloodGroup: 'B-',
    address: '404 Cedar Ave, Brooklyn, NY 11215',
    emergencyContact: '+1 (555) 345-6789 (Maria Taylor)',
    medicalConditions: ['COPD', 'Sleep Apnea'],
    lastVisit: '2023-11-30',
    status: 'inactive',
    createdAt: '2022-09-20',
    updatedAt: '2023-11-30',
    age: 48,
    upcomingAppointments: 0,
    totalVisits: 9
  },
  {
    _id: 'p008',
    name: 'Emma Anderson',
    email: 'emma.a@email.com',
    phone: '+1 (555) 345-6789',
    dateOfBirth: '1992-08-14',
    gender: 'female',
    bloodGroup: 'O+',
    address: '505 Maple Dr, Queens, NY 11374',
    emergencyContact: '+1 (555) 456-7890 (Thomas Anderson)',
    medicalConditions: ['Thyroid Disorder'],
    lastVisit: '2024-01-25',
    status: 'active',
    createdAt: '2023-10-10',
    updatedAt: '2024-01-25',
    age: 31,
    upcomingAppointments: 2,
    totalVisits: 6
  }
];

const MOCK_STATS: PatientStats = {
  total: 156,
  active: 128,
  inactive: 18,
  pending: 10,
  newThisMonth: 24,
  appointmentsToday: 12
};

// ========== MAIN COMPONENT ==========
const PatientsModule = () => {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    gender: 'all',
    search: '',
    dateRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, filters, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const [patientsRes, statsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/patients/stats')
      ]);

      const patientsData = patientsRes.data.data || patientsRes.data || MOCK_PATIENTS;
      setPatients(patientsData);
      setFilteredPatients(patientsData);
      setStats(statsRes.data.data || statsRes.data || MOCK_STATS);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients(MOCK_PATIENTS);
      setFilteredPatients(MOCK_PATIENTS);
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.includes(searchQuery) ||
        patient._id.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(patient => patient.status === filters.status);
    }

    // Gender filter
    if (filters.gender !== 'all') {
      filtered = filtered.filter(patient => patient.gender === filters.gender);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(patient => {
        const created = new Date(patient.createdAt);
        switch (filters.dateRange) {
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return created >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return created >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
            return created >= yearAgo;
          default:
            return true;
        }
      });
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Patient['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status];
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: Record<string, string> = {
      'O+': 'bg-red-100 text-red-700',
      'A+': 'bg-blue-100 text-blue-700',
      'B+': 'bg-green-100 text-green-700',
      'AB+': 'bg-purple-100 text-purple-700',
      'O-': 'bg-red-50 text-red-600',
      'A-': 'bg-blue-50 text-blue-600',
      'B-': 'bg-green-50 text-green-600',
      'AB-': 'bg-purple-50 text-purple-600'
    };
    return colors[bloodGroup] || 'bg-gray-100 text-gray-700';
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  if (loading && !patients.length) {
    return <LoadingScreen message="Loading patients..." />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
      <Sidebar activeRoute="/admin/patients" />
      
      <div className="flex-1 overflow-auto ml-72">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          adminData={{ name: 'System Admin' }}
          searchPlaceholder="Search patients..."
        />
        
        {/* Page Header */}
        <div className="sticky top-[84px] z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Patients Management</h1>
              <span className="text-sm font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {filteredPatients.length} patients
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={loadPatients}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <button 
                onClick={() => router.push('/admin/patients/new')}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add New Patient</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard
              icon={User}
              label="Total Patients"
              value={stats.total}
              change="+12%"
              color="purple"
            />
            <StatCard
              icon={CheckCircle}
              label="Active"
              value={stats.active}
              change="+8%"
              color="green"
            />
            <StatCard
              icon={XCircle}
              label="Inactive"
              value={stats.inactive}
              change="-2%"
              color="red"
            />
            <StatCard
              icon={AlertCircle}
              label="Pending"
              value={stats.pending}
              change="+5"
              color="yellow"
            />
            <StatCard
              icon={UserPlus}
              label="New This Month"
              value={stats.newThisMonth}
              change="+15%"
              color="blue"
            />
            <StatCard
              icon={Calendar}
              label="Appointments Today"
              value={stats.appointmentsToday}
              change="+3"
              color="purple"
            />
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
                    placeholder="Search patients by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <select
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
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

        {/* Patients Grid */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">All Patients</h3>
              <p className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPatients.length)} of {filteredPatients.length} patients
              </p>
            </div>
            
            {currentPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentPatients.map((patient) => (
                  <PatientCard 
                    key={patient._id}
                    patient={patient}
                    onView={() => setSelectedPatient(patient)}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    getBloodGroupColor={getBloodGroupColor}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No patients found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredPatients.length > itemsPerPage && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-500">Manage patients efficiently</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ActionCard
                icon={Plus}
                title="Register Patient"
                description="Add new patient to the system"
                color="purple"
                onClick={() => router.push('/admin/patients/new')}
              />
              <ActionCard
                icon={Calendar}
                title="Schedule Appointment"
                description="Book new appointment"
                color="blue"
                onClick={() => {}}
              />
              <ActionCard
                icon={FileText}
                title="Generate Reports"
                description="Create patient reports"
                color="green"
                onClick={() => {}}
              />
              <ActionCard
                icon={Bell}
                title="Send Notifications"
                description="Notify patients about updates"
                color="red"
                onClick={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
          getBloodGroupColor={getBloodGroupColor}
        />
      )}
    </div>
  );
};

// ========== PATIENT CARD COMPONENT ==========
const PatientCard: React.FC<{
  patient: Patient;
  onView: () => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: 'active' | 'inactive' | 'pending') => string;
  getBloodGroupColor: (bloodGroup: string) => string;
}> = ({ patient, onView, formatDate, getStatusColor, getBloodGroupColor }) => {
  return (
    <div className="bg-white border border-gray-200/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
      {/* Header with Avatar and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{patient.name}</h3>
            <p className="text-xs text-gray-500">
              {patient.gender === 'male' ? 'Male' : 'Female'} • {patient.age} years
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
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-xs text-gray-600">
          <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
          <span className="truncate">{patient.email}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
          <span className="truncate">{patient.phone}</span>
        </div>
        {patient.address && (
          <div className="flex items-center text-xs text-gray-600">
            <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">{patient.address.split(',')[0]}</span>
          </div>
        )}
      </div>

      {/* Medical Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
          {patient.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
          {patient.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
          {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
          {patient.bloodGroup}
        </span>
        {patient.medicalConditions.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {patient.medicalConditions.length} conditions
          </span>
        )}
      </div>

      {/* Medical Conditions Preview */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Medical Conditions</p>
        <div className="flex flex-wrap gap-1">
          {patient.medicalConditions.slice(0, 2).map((condition, index) => (
            <span key={index} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">
              {condition}
            </span>
          ))}
          {patient.medicalConditions.length > 2 && (
            <span className="text-xs text-gray-400">+{patient.medicalConditions.length - 2} more</span>
          )}
          {patient.medicalConditions.length === 0 && (
            <span className="text-xs text-gray-400">No conditions</span>
          )}
        </div>
      </div>

      {/* Visit Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-purple-50/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-gray-600">Last Visit</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(patient.lastVisit)}</p>
        </div>
        <div className="bg-green-50/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-3 h-3 text-green-600" />
            <span className="text-xs text-gray-600">Total Visits</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-1">{patient.totalVisits || 0}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => {/* Edit patient */}}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-blue-600"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => console.log('Delete patient:', patient._id)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Joined {formatDate(patient.createdAt)}
        </div>
      </div>
    </div>
  );
};

// ========== STATS CARD COMPONENT ==========
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  change: string;
  color: 'purple' | 'green' | 'red' | 'yellow' | 'blue';
}> = ({ icon: Icon, label, value, change, color }) => {
  const colorConfig = {
    purple: { bg: 'from-purple-50 to-purple-100/50 border-purple-200/50', text: 'text-purple-600' },
    green: { bg: 'from-green-50 to-green-100/50 border-green-200/50', text: 'text-green-600' },
    red: { bg: 'from-red-50 to-red-100/50 border-red-200/50', text: 'text-red-600' },
    yellow: { bg: 'from-yellow-50 to-yellow-100/50 border-yellow-200/50', text: 'text-yellow-600' },
    blue: { bg: 'from-blue-50 to-blue-100/50 border-blue-200/50', text: 'text-blue-600' }
  };

  return (
    <div className={`bg-gradient-to-br ${colorConfig[color].bg} border rounded-2xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <p className={`text-xs font-medium mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change} from last month
          </p>
        </div>
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <Icon className={`w-6 h-6 ${colorConfig[color].text}`} />
        </div>
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

// ========== PATIENT DETAIL MODAL COMPONENT ==========
const PatientDetailModal: React.FC<{
  patient: Patient;
  onClose: () => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: 'active' | 'inactive' | 'pending') => string;
  getBloodGroupColor: (bloodGroup: string) => string;
}> = ({ patient, onClose, formatDate, getStatusColor, getBloodGroupColor }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
    <div className="relative w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl transition-all duration-300">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.status)}`}>
                  {patient.status === 'active' && <CheckCircle className="w-4 h-4 mr-1" />}
                  {patient.status === 'pending' && <AlertCircle className="w-4 h-4 mr-1" />}
                  {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
                  {patient.bloodGroup}
                </span>
                <span className="text-sm text-gray-600">
                  {patient.gender === 'male' ? 'Male' : 'Female'} • {patient.age} years
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <XCircleIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Patient Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Personal Information
            </h3>
            <div className="space-y-3">
              <DetailRow label="Email" value={patient.email} icon={Mail} />
              <DetailRow label="Phone" value={patient.phone} icon={Phone} />
              <DetailRow label="Date of Birth" value={`${patient.dateOfBirth} (${patient.age} years)`} />
              <DetailRow label="Address" value={patient.address} icon={MapPin} />
              <DetailRow label="Emergency Contact" value={patient.emergencyContact} icon={Phone} />
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              Medical Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                <span className="text-sm text-gray-600">Blood Group</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
                  {patient.bloodGroup}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Medical Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {patient.medicalConditions.length > 0 ? (
                    patient.medicalConditions.map((condition, index) => (
                      <span key={index} className="text-sm bg-red-100 text-red-600 px-3 py-1.5 rounded-lg">
                        {condition}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No conditions recorded</span>
                  )}
                </div>
              </div>
              
              <DetailRow label="Last Visit" value={formatDate(patient.lastVisit)} icon={Calendar} />
              <DetailRow label="Member Since" value={formatDate(patient.createdAt)} />
            </div>
          </div>

          {/* Visit History */}
          <div className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-xl p-5">
            <h3 className="font-medium text-purple-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Visit History & Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Last Visit</p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(patient.lastVisit)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="font-medium text-gray-900 mt-1">{patient.totalVisits || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Upcoming Appointments</p>
                <p className="font-medium text-gray-900 mt-1">{patient.upcomingAppointments || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Average Wait Time</p>
                <p className="font-medium text-gray-900 mt-1">15 mins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 cursor-pointer">
              View Full History
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer">
              Schedule Appointment
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-all duration-200 cursor-pointer">
              Deactivate Account
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DetailRow: React.FC<{ 
  label: string; 
  value: string; 
  icon?: React.ElementType 
}> = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-0">
    <span className="text-sm text-gray-600 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {label}
    </span>
    <span className="font-medium text-gray-900 text-right">{value}</span>
  </div>
);

// ========== LOADING SCREEN ==========
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

export default PatientsModule;