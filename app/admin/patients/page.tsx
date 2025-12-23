"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, UserPlus, Search, Filter, Download, MoreVertical, 
  Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar, Activity,
  Shield, LogOut, HelpCircle, BarChart3, Stethoscope, CreditCard,
  Bell, ChevronRight, RefreshCw, Plus, AlertCircle, CheckCircle,
  XCircle, ChevronDown, ArrowUpDown, FileText
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

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
    updatedAt: '2024-01-15'
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
    updatedAt: '2024-01-18'
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
    updatedAt: '2024-01-10'
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
    updatedAt: '2024-01-20'
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
    updatedAt: '2024-01-02'
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    gender: 'all',
    search: '',
    dateRange: 'all'
  });

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

      setPatients(patientsRes.data.data || patientsRes.data || MOCK_PATIENTS);
      setFilteredPatients(patientsRes.data.data || patientsRes.data || MOCK_PATIENTS);
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

    // Date range filter (simplified)
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
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    ['token', 'role', 'isLoggedIn'].forEach(key => localStorage.removeItem(key));
    router.push('/auth/admin/login');
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

  if (loading && !patients.length) {
    return <LoadingScreen message="Loading patients..." />;
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
        />

        {/* Breadcrumb & Actions */}
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Patients Management</h1>
            <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              {filteredPatients.length} patients
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/admin/patients/new')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm font-medium">Add New Patient</span>
            </button>
            <ActionButton icon={Download} label="Export" />
            <ActionButton icon={RefreshCw} label="Refresh" onClick={loadPatients} />
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        {/* Filters Panel */}
        {showFilters && (
          <FiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={() => setFilters({ status: 'all', gender: 'all', search: '', dateRange: 'all' })}
          />
        )}

        {/* Patients Table */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 overflow-hidden">
            <div className="border-b border-gray-200/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Patients</h3>
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Medical Info</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Last Visit</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <tr 
                          key={patient._id} 
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                            selectedPatient?._id === patient._id ? 'bg-purple-50' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{patient.name}</p>
                                <p className="text-xs text-gray-500">
                                  {patient.gender === 'male' ? 'Male' : 'Female'} • {patient.dateOfBirth}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-3 h-3 mr-2" />
                                {patient.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-3 h-3 mr-2" />
                                {patient.phone}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
                                  {patient.bloodGroup}
                                </span>
                                {patient.medicalConditions.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {patient.medicalConditions.length} condition(s)
                                  </span>
                                )}
                              </div>
                              {patient.emergencyContact && (
                                <div className="text-xs text-gray-500">
                                  Emergency: {patient.emergencyContact}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{formatDate(patient.lastVisit)}</p>
                              <p className="text-xs text-gray-500">Member since {formatDate(patient.createdAt)}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                              </span>
                              <StatusDropdown 
                                currentStatus={patient.status}
                                onStatusChange={(newStatus) => console.log('Update status:', newStatus)}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => setSelectedPatient(patient)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => router.push(`/admin/patients/${patient._id}/edit`)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => console.log('Delete patient:', patient._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <div className="text-gray-400">
                            <User className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-lg font-medium">No patients found</p>
                            <p className="text-sm mt-1">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
    </div>
  );
};

// ========== SIDEBAR COMPONENT ==========
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
      <NavItem icon={UserPlus} label="Patients" />
      <NavItem icon={Calendar} label="Appointments" route="/admin/appointments" />
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
      className={`flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
        label === 'Patients' 
          ? 'bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border border-purple-200/50'
          : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center space-x-3.5">
        <Icon className={`w-5 h-5 ${label === 'Patients' ? 'text-purple-600' : 'text-gray-500'}`} />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
};

// ========== HEADER COMPONENT ==========
const Header: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}> = ({ searchQuery, setSearchQuery, showFilters, setShowFilters }) => (
  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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
      placeholder="Search patients by name, email, or phone..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200"
    />
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

// ========== STATS GRID COMPONENT ==========
const StatsGrid: React.FC<{ stats: PatientStats }> = ({ stats }) => (
  <div className="px-8 pb-6">
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
);

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

// ========== FILTERS PANEL COMPONENT ==========
const FiltersPanel: React.FC<{
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
}> = ({ filters, onFilterChange, onClearFilters }) => (
  <div className="px-8 pb-6">
    <div className="bg-white rounded-2xl shadow-lg shadow-purple-500/5 border border-gray-200/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button 
          onClick={onClearFilters}
          className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
        >
          Clear All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'inactive', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => onFilterChange('status', status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  filters.status === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
          <div className="flex flex-wrap gap-2">
            {['all', 'male', 'female', 'other'].map((gender) => (
              <button
                key={gender}
                onClick={() => onFilterChange('gender', gender)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  filters.gender === gender
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
          <div className="flex flex-wrap gap-2">
            {['all', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => onFilterChange('dateRange', range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  filters.dateRange === range
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

// ========== STATUS DROPDOWN COMPONENT ==========
const StatusDropdown: React.FC<{
  currentStatus: Patient['status'];
  onStatusChange: (status: Patient['status']) => void;
}> = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const statuses: Patient['status'][] = ['active', 'inactive', 'pending'];

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

// ========== PATIENT DETAIL MODAL COMPONENT ==========
const PatientDetailModal: React.FC<{
  patient: Patient;
  onClose: () => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: Patient['status']) => string;
  getBloodGroupColor: (bloodGroup: string) => string;
}> = ({ patient, onClose, formatDate, getStatusColor, getBloodGroupColor }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                  {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
                  {patient.bloodGroup}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <XCircle className="w-6 h-6 text-gray-400" />
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
              <DetailRow label="Date of Birth" value={patient.dateOfBirth} />
              <DetailRow label="Gender" value={patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)} />
              <DetailRow label="Address" value={patient.address} icon={MapPin} />
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              Medical Information
            </h3>
            <div className="space-y-3">
              <DetailRow label="Blood Group" value={patient.bloodGroup} />
              <DetailRow label="Emergency Contact" value={patient.emergencyContact} icon={Phone} />
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
            </div>
          </div>

          {/* Visit History */}
          <div className="lg:col-span-2 bg-purple-50/50 border border-purple-200/50 rounded-xl p-5">
            <h3 className="font-medium text-purple-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Visit History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Last Visit</p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(patient.lastVisit)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(patient.createdAt)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="font-medium text-gray-900 mt-1">12</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600">Pending Appointments</p>
                <p className="font-medium text-gray-900 mt-1">2</p>
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
    <span className="font-medium text-gray-900">{value}</span>
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