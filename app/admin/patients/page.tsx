"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, UserPlus, Search, Filter, Download, MoreVertical, 
  Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar, Activity,
  Bell, ChevronRight, RefreshCw, Plus, AlertCircle, CheckCircle,
  XCircle, FileText, XCircle as XCircleIcon, Heart, Clock, Stethoscope,
  TrendingUp, TrendingDown, Shield, Thermometer, Home, Contact
} from 'lucide-react';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// Updated interface to match API fields
interface Patient {
  _id: string; 
  name?: string;  // Optional since API doesn't have name field
  email?: string; // Optional since API doesn't have email field
  age: number;
  gender: 'male' | 'female' | 'other' | string;
  bloodGroup: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions: string[];
  // Optional fields for UI enhancement
  status?: 'active' | 'inactive' | 'pending';
  lastVisit?: string;
  createdAt?: string;
  updatedAt?: string;
  totalVisits?: number;
  occupation?: string;
  allergies?: string[];
  insuranceProvider?: string;
  insuranceId?: string;
}

interface PatientStats {
  total: number; active: number; inactive: number; pending: number;
  newThisMonth: number; appointmentsToday: number; averageAge?: number;
  genderDistribution?: { male: number; female: number; other: number };
}

interface FilterState { status: string; gender: string; search: string; dateRange: string; }

interface Appointment {
  _id: string; patientId: string; doctorId: string; doctorName: string;
  date: string; time: string; status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  type: 'consultation' | 'followup' | 'emergency' | 'checkup'; fee: number; paid: boolean;
}

interface MedicalRecord {
  _id: string; patientId: string; doctorId: string; doctorName: string;
  date: string; diagnosis: string; symptoms: string[]; treatment: string;
  medications: string[]; notes: string; followupDate?: string;
}

// Updated API URLs - Using patients instead of patients
const PATIENTS_API = {
  ALL: '/patients/all',
  CREATE: '/patients/create',
  UPDATE: '/patients/update',
  DELETE: (id: string) => `/patients/${id}`,
  GET_ONE: (id: string) => `/patients/${id}`,
  MY_PROFILE: '/patients/me'
};

const ANALYTICS_API = {
  TOTAL_PATIENTS: '/analytics/total-patients'
};

const APPOINTMENTS_API = {
  MY_APPOINTMENTS: '/appointments/my',
  BOOK: '/appointments/book'
};

const MEDICAL_RECORDS_API = {
  PATIENT_RECORDS: (patientId: string) => `/medical-records/patient/${patientId}`
};

// Blood groups with colors
const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'];

// Main Component
const PatientsModule = () => {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats>({ total: 0, active: 0, inactive: 0, pending: 0, newThisMonth: 0, appointmentsToday: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [patientMedicalRecords, setPatientMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ status: 'all', gender: 'all', search: '', dateRange: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => { 
    console.log('PatientsModule loading...');
    loadPatients(); 
    loadPatientStats(); 
  }, []);

  useEffect(() => { 
    filterPatients(); 
  }, [searchQuery, filters, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading patients from API:', PATIENTS_API.ALL);
      
      const response = await api.get(PATIENTS_API.ALL);
      console.log('Patients API Response:', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data)
      });
      
      let patientsData: Patient[] = [];
      if (response.data && Array.isArray(response.data)) {
        patientsData = response.data.map((patient: any, index: number) => {
          console.log(`Processing patient ${index}:`, patient);
          
          const processedPatient: Patient = {
            _id: patient._id || patient.id || `temp-${Date.now()}-${index}`,
            // Generate a display name since API doesn't provide name field
            name: patient.name || `Patient ${patient._id?.substring(0, 8) || index + 1}`,
            email: patient.email || `patient${patient._id?.substring(0, 8) || index + 1}@example.com`,
            age: patient.age || 0,
            gender: patient.gender || 'other',
            bloodGroup: patient.bloodGroup || 'Unknown',
            phone: patient.phone || '',
            address: patient.address || '',
            emergencyContactName: patient.emergencyContactName || '',
            emergencyContactPhone: patient.emergencyContactPhone || '',
            medicalConditions: patient.medicalConditions || [],
            status: patient.status || 'active',
            lastVisit: patient.lastVisit || new Date().toISOString(),
            createdAt: patient.createdAt || new Date().toISOString(),
            updatedAt: patient.updatedAt || new Date().toISOString(),
            totalVisits: patient.totalVisits || 0
          };
          
          console.log(`Patient ${index} processed:`, processedPatient);
          return processedPatient;
        });
      } else {
        console.warn('Invalid response format - expected array:', response.data);
        setError('Invalid data format received from server');
      }
      
      setPatients(patientsData);
      setFilteredPatients(patientsData);
      console.log('Total patients loaded:', patientsData.length);
      
      if (patientsData.length === 0) {
        console.warn('No patients data received from API');
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      console.error('Error details:', {
        message: (error as any).message,
        response: (error as any).response?.data,
        status: (error as any).response?.status
      });
      
      setPatients([]);
      setFilteredPatients([]);
      setError(`Failed to load patients: ${(error as any).message || 'Network error'}`);
    } finally {
      setLoading(false);
      console.log('Patients load completed');
    }
  };

  const loadPatientStats = async () => {
    try {
      console.log('Loading patient stats from:', ANALYTICS_API.TOTAL_PATIENTS);
      const response = await api.get(ANALYTICS_API.TOTAL_PATIENTS);
      
      console.log('Patient stats response:', {
        status: response.status,
        data: response.data
      });
      
      if (response.data) {
        setStats(response.data);
        console.log('Patient stats set:', response.data);
      } else {
        console.warn('No patient stats data received');
        // Calculate stats from local data
        const now = new Date();
        const currentMonth = now.getMonth();
        
        const defaultStats = {
          total: patients.length,
          active: patients.filter(p => p.status === 'active').length,
          inactive: patients.filter(p => p.status === 'inactive').length,
          pending: patients.filter(p => p.status === 'pending').length,
          newThisMonth: patients.filter(p => {
            const created = p.createdAt ? new Date(p.createdAt) : null;
            return created && created.getMonth() === currentMonth;
          }).length,
          appointmentsToday: 0,
          averageAge: patients.length > 0 
            ? Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length)
            : 0
        };
        
        setStats(defaultStats);
      }
    } catch (error) {
      console.error('Error loading patient stats:', error);
      console.error('Error details:', (error as any).response?.data || (error as any).message);
      
      // Calculate stats from local data on error
      const now = new Date();
      const currentMonth = now.getMonth();
      
      const defaultStats = {
        total: patients.length,
        active: patients.filter(p => p.status === 'active').length,
        inactive: patients.filter(p => p.status === 'inactive').length,
        pending: patients.filter(p => p.status === 'pending').length,
        newThisMonth: patients.filter(p => {
          const created = p.createdAt ? new Date(p.createdAt) : null;
          return created && created.getMonth() === currentMonth;
        }).length,
        appointmentsToday: 0,
        averageAge: patients.length > 0 
          ? Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length)
          : 0
      };
      
      setStats(defaultStats);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    try {
      console.log('Loading patient details for:', patientId);
      
      const [patientRes, appointmentsRes, medicalRecordsRes] = await Promise.all([
        api.get(PATIENTS_API.GET_ONE(patientId)),
        api.get(APPOINTMENTS_API.MY_APPOINTMENTS),
        api.get(MEDICAL_RECORDS_API.PATIENT_RECORDS(patientId))
      ]);
      
      console.log('Patient details response:', patientRes.data);
      console.log('Appointments response:', appointmentsRes.data);
      console.log('Medical records response:', medicalRecordsRes.data);
      
      let patientData = patientRes.data;
      
      // Handle different API response structures
      if (patientData?.data) {
        patientData = patientData.data;
      }
      
      if (!patientData) {
        patientData = {
          _id: patientId,
          name: `Patient ${patientId.substring(0, 8)}`,
          age: 0,
          gender: 'other',
          bloodGroup: 'Unknown',
          phone: 'No phone',
          address: 'Not provided',
          emergencyContactName: 'Not provided',
          emergencyContactPhone: '',
          medicalConditions: [],
          status: 'active',
          lastVisit: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      setSelectedPatient(patientData);
      
      // Filter appointments for this specific patient
      if (appointmentsRes.data && Array.isArray(appointmentsRes.data)) {
        const patientAppointments = appointmentsRes.data.filter(
          (appt: any) => appt.patientId === patientId
        );
        setPatientAppointments(patientAppointments);
      } else {
        setPatientAppointments([]);
      }
      
      if (medicalRecordsRes.data && Array.isArray(medicalRecordsRes.data)) {
        setPatientMedicalRecords(medicalRecordsRes.data);
      } else {
        setPatientMedicalRecords([]);
      }
      
      setIsDetailModalOpen(true);
      console.log('Patient details loaded successfully');
    } catch (error) {
      console.error('Error loading patient details:', error);
      console.error('Error details:', (error as any).response?.data || (error as any).message);
      
      // Create a fallback patient object if the API call fails
      setSelectedPatient({
        _id: patientId,
        name: `Patient ${patientId.substring(0, 8)}`,
        age: 0,
        gender: 'other',
        bloodGroup: 'Unknown',
        phone: 'No phone',
        address: 'Not provided',
        emergencyContactName: 'Not provided',
        emergencyContactPhone: '',
        medicalConditions: [],
        status: 'active',
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setPatientAppointments([]);
      setPatientMedicalRecords([]);
      setIsDetailModalOpen(true);
    }
  };

  const handleAddPatient = async (patientData: any) => {
    try {
      console.log('Adding new patient:', patientData);
      console.log('API endpoint:', PATIENTS_API.CREATE);
      
      // Validate required fields based on API
      const requiredFields = ['age', 'gender', 'bloodGroup', 'phone', 'address', 'emergencyContactName', 'emergencyContactPhone'];
      const missingFields = requiredFields.filter(field => !patientData[field] && patientData[field] !== 0);
      
      if (missingFields.length > 0) {
        alert(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      // Prepare data exactly matching API structure
      const apiData = {
        age: parseInt(patientData.age) || 0,
        gender: patientData.gender,
        bloodGroup: patientData.bloodGroup,
        phone: patientData.phone,
        address: patientData.address,
        emergencyContactName: patientData.emergencyContactName,
        emergencyContactPhone: patientData.emergencyContactPhone,
        medicalConditions: patientData.medicalConditions || []
      };
      
      console.log('Sending to API:', apiData);
      
      const response = await api.post(PATIENTS_API.CREATE, apiData);
      console.log('Add patient response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
      if (response.data) {
        const newPatient: Patient = {
          _id: response.data.id || response.data._id || `temp-${Date.now()}`,
          name: `Patient ${(response.data._id || response.data.id || Date.now().toString()).substring(0, 8)}`,
          age: response.data.age || apiData.age,
          gender: response.data.gender || apiData.gender,
          bloodGroup: response.data.bloodGroup || apiData.bloodGroup,
          phone: response.data.phone || apiData.phone,
          address: response.data.address || apiData.address,
          emergencyContactName: response.data.emergencyContactName || apiData.emergencyContactName,
          emergencyContactPhone: response.data.emergencyContactPhone || apiData.emergencyContactPhone,
          medicalConditions: response.data.medicalConditions || apiData.medicalConditions,
          status: 'active',
          lastVisit: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('Created new patient object:', newPatient);
        
        setPatients([...patients, newPatient]);
        setIsAddModalOpen(false);
        loadPatientStats();
        alert('Patient added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding patient:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });
      
      let errorMessage = 'Failed to add patient. ';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 500) {
          errorMessage += 'Server error (500). Please check server logs.';
        } else if (error.response.data?.message) {
          errorMessage += error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage += error.response.data.error;
        } else if (error.response.data) {
          errorMessage += JSON.stringify(error.response.data);
        } else {
          errorMessage += `Server responded with status ${error.response.status}`;
        }
      } else if (error.request) {
        // No response received
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        // Request setup error
        errorMessage += error.message;
      }
      
      alert(errorMessage);
      
      // Optional: Add retry logic
      if (confirm('Would you like to try again with different data?')) {
        console.log('User wants to retry adding patient');
      }
    }
  };

  const handleUpdatePatient = async (patientId: string, updateData: any) => {
    try {
      console.log('Updating patient:', { patientId, updateData });
      const response = await api.patch(PATIENTS_API.UPDATE, { 
        id: patientId, 
        ...updateData 
      });
      console.log('Update response:', response.data);
      
      if (response.data) {
        setPatients(patients.map(patient => 
          patient._id === patientId ? { ...patient, ...updateData } : patient
        ));
        setIsEditModalOpen(false);
        alert('Patient updated successfully!');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update patient. Please try again.');
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        console.log('Deleting patient:', patientId);
        const response = await api.delete(PATIENTS_API.DELETE(patientId));
        console.log('Delete response:', response.data);
        
        setPatients(patients.filter(patient => patient._id !== patientId));
        loadPatientStats();
        alert('Patient deleted successfully.');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient. Please try again.');
      }
    }
  };

  const handleExportPatients = async () => {
    try {
      console.log('Exporting patients data');
      const response = await api.get(PATIENTS_API.ALL, { 
        params: { format: 'csv' }, 
        responseType: 'blob' 
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patients-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Export completed');
    } catch (error) {
      console.error('Error exporting patients:', error);
      alert('Failed to export patients. Please try again.');
    }
  };

  const handleScheduleAppointment = async (patientId: string, appointmentData: any) => {
    try {
      console.log('Scheduling appointment:', { patientId, appointmentData });
      const response = await api.post(APPOINTMENTS_API.BOOK, { 
        ...appointmentData, 
        patientId, 
        status: 'scheduled' 
      });
      console.log('Appointment scheduled response:', response.data);
      alert('Appointment scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment. Please try again.');
    }
  };

  const filterPatients = () => {
    console.log('Filtering patients with:', {
      searchQuery,
      filters,
      totalPatients: patients.length
    });
    
    let filtered = [...patients];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.name?.toLowerCase().includes(query) ||
        patient.phone.includes(searchQuery) ||
        patient._id.toLowerCase().includes(query) ||
        patient.address.toLowerCase().includes(query) ||
        patient.emergencyContactName.toLowerCase().includes(query)
      );
      console.log(`Filtered by search "${searchQuery}": ${filtered.length} patients`);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(patient => patient.status === filters.status);
      console.log(`Filtered by status "${filters.status}": ${filtered.length} patients`);
    }
    
    if (filters.gender !== 'all') {
      filtered = filtered.filter(patient => patient.gender === filters.gender);
      console.log(`Filtered by gender "${filters.gender}": ${filtered.length} patients`);
    }
    
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(patient => {
        const created = patient.createdAt ? new Date(patient.createdAt) : null;
        if (!created) return false;
        
        switch (filters.dateRange) {
          case 'week': 
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return created >= weekAgo;
          case 'month': 
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return created >= monthAgo;
          case 'year': 
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return created >= yearAgo;
          default: 
            return true;
        }
      });
      console.log(`Filtered by date range "${filters.dateRange}": ${filtered.length} patients`);
    }
    
    console.log('Final filtered patients count:', filtered.length);
    setFilteredPatients(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Not specified';
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    const colors: Record<string, string> = { 
      active: 'bg-green-100 text-green-700', 
      inactive: 'bg-gray-100 text-gray-700', 
      pending: 'bg-yellow-100 text-yellow-700' 
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: Record<string, string> = {
      'O+': 'bg-red-100 text-red-700', 'A+': 'bg-blue-100 text-blue-700', 'B+': 'bg-green-100 text-green-700',
      'AB+': 'bg-purple-100 text-purple-700', 'O-': 'bg-red-50 text-red-600', 'A-': 'bg-blue-50 text-blue-600',
      'B-': 'bg-green-50 text-green-600', 'AB-': 'bg-purple-50 text-purple-600', 'Unknown': 'bg-gray-100 text-gray-700'
    };
    return colors[bloodGroup] || 'bg-gray-100 text-gray-700';
  };

  const getGenderIcon = (gender: string) => {
    const icons: Record<string, React.ElementType> = {
      male: User,
      female: User,
      other: User
    };
    return icons[gender] || User;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  console.log('Component render state:', {
    loading,
    error,
    patientsCount: patients.length,
    filteredCount: filteredPatients.length,
    currentPatientsCount: currentPatients.length,
    stats
  });

  if (loading && !patients.length) {
    return <LoadingScreen message="Loading patients..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
        <Sidebar activeRoute="/admin/patients" />
        
        <div className="flex-1 overflow-auto ml-72 flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Error Loading Patients</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setError(null);
                  loadPatients();
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 cursor-pointer"
              >
                Retry Loading
              </button>
              <button 
                onClick={() => {
                  setError(null);
                  setPatients([]);
                }}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 cursor-pointer"
              >
                Continue Anyway
              </button>
            </div>
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left text-sm">
              <p className="font-medium text-yellow-800 mb-2">Debug Information:</p>
              <ul className="space-y-1 text-yellow-700">
                <li>• Check browser console (F12) for detailed logs</li>
                <li>• Verify API endpoints are accessible</li>
                <li>• Ensure authentication is valid</li>
                <li>• API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50">
      <Sidebar activeRoute="/admin/patients" />
      <div className="flex-1 overflow-auto ml-72">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} adminData={{ name: 'System Admin' }} searchPlaceholder="Search patients by name, phone, or address..." />
        
        {/* Page Header */}
        <div className="sticky top-[84px] z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Patients Management</h1>
              <span className="text-sm font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {filteredPatients.length} patients
                {patients.length === 0 && ' (No data loaded)'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => { loadPatients(); loadPatientStats(); }} className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
                <RefreshCw className="w-4 h-4" /><span className="text-sm font-medium">Refresh</span>
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-500/30 cursor-pointer">
                <Plus className="w-4 h-4" /><span className="text-sm font-medium">Add New Patient</span>
              </button>
            </div>
          </div>
        </div>

        {/* Debug Info Banner */}
        {patients.length === 0 && (
          <div className="px-8 py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-2">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    No patients data loaded. Showing placeholder data.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Check browser console for API debugging information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard icon={User} label="Total Patients" value={stats.total} change="+12%" color="purple" />
            <StatCard icon={CheckCircle} label="Active" value={stats.active} change="+8%" color="green" />
            <StatCard icon={XCircle} label="Inactive" value={stats.inactive} change="-2%" color="red" />
            <StatCard icon={AlertCircle} label="Pending" value={stats.pending} change="+5" color="yellow" />
            <StatCard icon={UserPlus} label="New This Month" value={stats.newThisMonth} change="+15%" color="blue" />
            <StatCard icon={Calendar} label="Appointments Today" value={stats.appointmentsToday} change="+3" color="purple" />
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
                    placeholder="Search patients by name, phone, or address..." 
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
                <button onClick={handleExportPatients} className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer">
                  <Download className="w-4 h-4" /><span className="text-sm font-medium">Export</span>
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
                    onView={() => loadPatientDetails(patient._id)} 
                    onEdit={() => { setSelectedPatient(patient); setIsEditModalOpen(true); }} 
                    onDelete={() => handleDeletePatient(patient._id)} 
                    formatDate={formatDate} 
                    getStatusColor={getStatusColor} 
                    getBloodGroupColor={getBloodGroupColor} 
                    getGenderIcon={getGenderIcon}
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
            {filteredPatients.length > itemsPerPage && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
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
              <ActionCard icon={Plus} title="Register Patient" description="Add new patient to the system" color="purple" onClick={() => setIsAddModalOpen(true)} />
              <ActionCard icon={Calendar} title="Schedule Appointment" description="Book new appointment" color="blue" onClick={() => router.push('/admin/appointments')} />
              <ActionCard icon={FileText} title="Generate Reports" description="Create patient reports" color="green" onClick={() => router.push('/admin/reports')} />
              <ActionCard icon={Bell} title="Send Notifications" description="Notify patients about updates" color="red" onClick={() => router.push('/admin/notifications')} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isDetailModalOpen && selectedPatient && (
        <PatientDetailModal 
          patient={selectedPatient} 
          appointments={patientAppointments} 
          medicalRecords={patientMedicalRecords} 
          onClose={() => { 
            setIsDetailModalOpen(false); 
            setSelectedPatient(null); 
            setPatientAppointments([]); 
            setPatientMedicalRecords([]); 
          }} 
          formatDate={formatDate} 
          getStatusColor={getStatusColor} 
          getBloodGroupColor={getBloodGroupColor} 
          onScheduleAppointment={handleScheduleAppointment} 
        />
      )}
      {isAddModalOpen && <AddPatientModal onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddPatient} />}
      {isEditModalOpen && selectedPatient && <EditPatientModal patient={selectedPatient} onClose={() => { setIsEditModalOpen(false); setSelectedPatient(null); }} onSubmit={handleUpdatePatient} />}
    </div>
  );
};

// Updated Patient Card Component
const PatientCard: React.FC<{
  patient: Patient; 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
  formatDate: (date: string) => string; 
  getStatusColor: (status: string | undefined) => string;
  getBloodGroupColor: (bloodGroup: string) => string;
  getGenderIcon: (gender: string) => React.ElementType;
}> = ({ patient, onView, onEdit, onDelete, formatDate, getStatusColor, getBloodGroupColor, getGenderIcon }) => {
  const GenderIcon = getGenderIcon(patient.gender);
  
  return (
    <div className="bg-white border border-gray-200/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {patient.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{patient.name || 'Patient'}</h3>
            <p className="text-xs text-gray-500 flex items-center">
              <GenderIcon className="w-3 h-3 mr-1" />
              {patient.gender === 'male' ? 'Male' : patient.gender === 'female' ? 'Female' : 'Other'} • {patient.age} years
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={onView} className="p-1.5 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-purple-600" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {patient.phone && (
          <div className="flex items-center text-xs text-gray-600">
            <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">{patient.phone}</span>
          </div>
        )}
        {patient.address && (
          <div className="flex items-center text-xs text-gray-600">
            <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">{patient.address.split(',')[0]}</span>
          </div>
        )}
        {patient.emergencyContactName && (
          <div className="flex items-center text-xs text-gray-600">
            <Contact className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">{patient.emergencyContactName}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
          {patient.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
          {patient.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
          {patient.status?.charAt(0).toUpperCase() + patient.status?.slice(1) || 'Active'}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
          {patient.bloodGroup}
        </span>
        {patient.medicalConditions.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            {patient.medicalConditions.length} conditions
          </span>
        )}
      </div>
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Medical Conditions</p>
        <div className="flex flex-wrap gap-1">
          {patient.medicalConditions.slice(0, 2).map((condition, index) => (
            <span key={index} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">{condition}</span>
          ))}
          {patient.medicalConditions.length > 2 && (
            <span className="text-xs text-gray-400">+{patient.medicalConditions.length - 2} more</span>
          )}
          {patient.medicalConditions.length === 0 && (
            <span className="text-xs text-gray-400">No conditions</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-purple-50/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-gray-600">Last Visit</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {patient.lastVisit ? formatDate(patient.lastVisit) : 'No visits'}
          </p>
        </div>
        <div className="bg-green-50/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-3 h-3 text-green-600" />
            <span className="text-xs text-gray-600">Total Visits</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-1">{patient.totalVisits || 0}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
        <div className="flex items-center space-x-1">
          <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-blue-600" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer text-gray-500 hover:text-red-600" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Joined {patient.createdAt ? formatDate(patient.createdAt) : 'N/A'}
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
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
          <div className="flex items-center mt-2">
            {change.startsWith('+') ? <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
            <span className={`text-xs font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last month
            </span>
          </div>
        </div>
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <Icon className={`w-6 h-6 ${colorConfig[color].text}`} />
        </div>
      </div>
    </div>
  );
};

// Action Card Component
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

// Pagination Component
const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => (
  <div className="border-t border-gray-200/50 px-6 py-4 mt-6">
    <div className="flex items-center justify-between">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'}`}>
        <ChevronRight className="w-4 h-4 rotate-180" /><span className="text-sm font-medium">Previous</span>
      </button>
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button key={page} onClick={() => onPageChange(page)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === page ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {page}
          </button>
        ))}
      </div>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'}`}>
        <span className="text-sm font-medium">Next</span><ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Patient Detail Modal Component
const PatientDetailModal: React.FC<{
  patient: Patient; 
  appointments: Appointment[]; 
  medicalRecords: MedicalRecord[]; 
  onClose: () => void;
  formatDate: (date: string) => string; 
  getStatusColor: (status: string | undefined) => string;
  getBloodGroupColor: (bloodGroup: string) => string; 
  onScheduleAppointment: (patientId: string, appointmentData: any) => void;
}> = ({ patient, appointments, medicalRecords, onClose, formatDate, getStatusColor, getBloodGroupColor, onScheduleAppointment }) => {
  
  const handleScheduleClick = () => {
    const appointmentData = { 
      doctorId: 'default-doctor-id', 
      date: new Date().toISOString().split('T')[0], 
      time: '10:00', 
      type: 'consultation', 
      notes: 'Routine checkup' 
    };
    onScheduleAppointment(patient._id, appointmentData);
  };

  // Safely get status text
  const getStatusText = (status: string | undefined | null) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getGenderText = (gender: string) => {
    return gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Other';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl transition-all duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {patient.name?.charAt(0) || 'P'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{patient.name || 'Patient'}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.status)}`}>
                    {patient.status === 'active' && <CheckCircle className="w-4 h-4 mr-1" />}
                    {patient.status === 'pending' && <AlertCircle className="w-4 h-4 mr-1" />}
                    {getStatusText(patient.status)}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
                    {patient.bloodGroup}
                  </span>
                  <span className="text-sm text-gray-600">
                    {getGenderText(patient.gender)} • {patient.age} years
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
              <XCircleIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <DetailRow label="Patient ID" value={patient._id} />
                <DetailRow label="Age" value={`${patient.age} years`} />
                <DetailRow label="Gender" value={getGenderText(patient.gender)} />
                <DetailRow label="Phone" value={patient.phone || 'No phone'} icon={Phone} />
                <DetailRow label="Address" value={patient.address || 'Not provided'} icon={MapPin} />
                <DetailRow label="Emergency Contact" value={`${patient.emergencyContactName || 'Not provided'} - ${patient.emergencyContactPhone || 'No phone'}`} icon={Contact} />
                {patient.lastVisit && <DetailRow label="Last Visit" value={formatDate(patient.lastVisit)} icon={Calendar} />}
                {patient.createdAt && <DetailRow label="Member Since" value={formatDate(patient.createdAt)} />}
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
                    {patient.medicalConditions && patient.medicalConditions.length > 0 ? 
                      patient.medicalConditions.map((condition, index) => (
                        <span key={index} className="text-sm bg-red-100 text-red-600 px-3 py-1.5 rounded-lg">
                          {condition}
                        </span>
                      )) : 
                      <span className="text-gray-400">No conditions recorded</span>
                    }
                  </div>
                </div>
                {patient.allergies && patient.allergies.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <span key={index} className="text-sm bg-yellow-100 text-yellow-600 px-3 py-1.5 rounded-lg">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                  <span className="text-sm text-gray-600">Total Visits</span>
                  <span className="font-medium text-gray-900">{patient.totalVisits || 0}</span>
                </div>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-5">
              <h3 className="font-medium text-blue-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Recent Appointments
              </h3>
              <div className="space-y-3">
                {appointments.length > 0 ? appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-blue-100">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.doctorName || 'Doctor'}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(appointment.date)} • {appointment.time} • {appointment.type}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                )) : <p className="text-gray-500 text-center py-4">No recent appointments</p>}
              </div>
            </div>

            {/* Medical Records */}
            <div className="lg:col-span-2 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 rounded-xl p-5">
              <h3 className="font-medium text-green-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Recent Medical Records
              </h3>
              <div className="space-y-3">
                {medicalRecords.length > 0 ? medicalRecords.slice(0, 3).map((record) => (
                  <div key={record._id} className="flex items-start justify-between p-3 bg-white/50 rounded-lg border border-green-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{record.diagnosis}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Dr. {record.doctorName} • {formatDate(record.date)}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {record.symptoms.slice(0, 2).map((symptom, idx) => (
                          <span key={idx} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                            {symptom}
                          </span>
                        ))}
                        {record.symptoms.length > 2 && (
                          <span className="text-xs text-gray-400">+{record.symptoms.length - 2} more</span>
                        )}
                      </div>
                    </div>
                    <button className="ml-4 text-sm text-green-600 hover:text-green-700">
                      View Details
                    </button>
                  </div>
                )) : <p className="text-gray-500 text-center py-4">No medical records found</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button onClick={handleScheduleClick} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 cursor-pointer">
                Schedule Appointment
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 cursor-pointer">
                Add Medical Record
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
};

const DetailRow: React.FC<{ label: string; value: string; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-0">
    <span className="text-sm text-gray-600 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {label}
    </span>
    <span className="font-medium text-gray-900 text-right">{value}</span>
  </div>
);

// Updated Add Patient Modal with correct API fields
const AddPatientModal: React.FC<{ onClose: () => void; onSubmit: (patientData: any) => void; }> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'other',
    bloodGroup: 'O+',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.age || parseInt(formData.age) < 0 || parseInt(formData.age) > 120) {
      newErrors.age = 'Valid age (0-120) is required';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    
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
        age: parseInt(formData.age),
        medicalConditions: formData.medicalConditions.split(',').map(c => c.trim()).filter(c => c)
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({...errors, [e.target.name]: ''});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add New Patient</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer">
              <XCircleIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Fill in patient information (fields marked with * are required)</p>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  max="120" 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.age ? 'border-red-300' : 'border-gray-300'}`} 
                  placeholder="e.g., 30" 
                />
                {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select 
                  name="bloodGroup" 
                  value={formData.bloodGroup} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                  {BLOOD_GROUPS.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`} 
                  placeholder="+1 (555) 123-4567" 
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  required 
                  rows={2} 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.address ? 'border-red-300' : 'border-gray-300'}`} 
                  placeholder="123 Main St, City, State, ZIP" 
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="emergencyContactName" 
                  value={formData.emergencyContactName} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.emergencyContactName ? 'border-red-300' : 'border-gray-300'}`} 
                  placeholder="Jane Smith" 
                />
                {errors.emergencyContactName && <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  name="emergencyContactPhone" 
                  value={formData.emergencyContactPhone} 
                  onChange={handleChange} 
                  required 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${errors.emergencyContactPhone ? 'border-red-300' : 'border-gray-300'}`} 
                  placeholder="+1 (555) 987-6543" 
                />
                {errors.emergencyContactPhone && <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Conditions
                </label>
                <textarea 
                  name="medicalConditions" 
                  value={formData.medicalConditions} 
                  onChange={handleChange} 
                  rows={2} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200" 
                  placeholder="Hypertension, Diabetes (comma separated)" 
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple conditions with commas</p>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white pt-6 mt-4 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The patient will be automatically assigned a unique ID and display name.
                  Required fields are marked with <span className="text-red-500">*</span>.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={isSubmitting}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 cursor-pointer disabled:opacity-50 font-medium flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Patient...
                    </>
                  ) : (
                    'Add Patient'
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

// Edit Patient Modal
const EditPatientModal: React.FC<{ patient: Patient; onClose: () => void; onSubmit: (patientId: string, updateData: any) => void; }> = ({ patient, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    age: patient.age.toString(),
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    phone: patient.phone,
    address: patient.address,
    emergencyContactName: patient.emergencyContactName,
    emergencyContactPhone: patient.emergencyContactPhone,
    medicalConditions: patient.medicalConditions.join(', '),
    status: patient.status || 'active'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.age || parseInt(formData.age) < 0 || parseInt(formData.age) > 120) {
      newErrors.age = 'Valid age (0-120) is required';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    
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
      await onSubmit(patient._id, { 
        ...formData, 
        age: parseInt(formData.age),
        medicalConditions: formData.medicalConditions.split(',').map(c => c.trim()).filter(c => c)
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({...errors, [e.target.name]: ''});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Patient</h2>
              <p className="text-sm text-gray-500 mt-1">Patient ID: {patient._id.substring(0, 8)}...</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XCircleIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Patient Display Name</p>
            <p className="font-medium text-gray-900">{patient.name || `Patient ${patient._id.substring(0, 8)}`}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                name="age" 
                value={formData.age} 
                onChange={handleChange} 
                required 
                min="0" 
                max="120" 
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.age ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select 
                name="bloodGroup" 
                value={formData.bloodGroup} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {BLOOD_GROUPS.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
                rows={2} 
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="emergencyContactName" 
                value={formData.emergencyContactName} 
                onChange={handleChange} 
                required 
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.emergencyContactName ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.emergencyContactName && <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Phone <span className="text-red-500">*</span>
              </label>
              <input 
                type="tel" 
                name="emergencyContactPhone" 
                value={formData.emergencyContactPhone} 
                onChange={handleChange} 
                required 
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.emergencyContactPhone ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.emergencyContactPhone && <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
              <textarea 
                name="medicalConditions" 
                value={formData.medicalConditions} 
                onChange={handleChange} 
                rows={2} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                placeholder="Hypertension, Diabetes (comma separated)" 
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple conditions with commas</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 cursor-pointer disabled:opacity-50 font-medium flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Patient'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Loading Screen
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