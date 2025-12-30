"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Search, Filter, Phone, Mail, Calendar, Activity, ChevronRight,
  User, Heart, Thermometer, FileText, Pill, ArrowLeft, Plus, Eye,
  MapPin, Clock, Stethoscope, AlertCircle, Download, Save, CalendarDays
} from 'lucide-react';
import api from '@/lib/api/api';

// Interfaces
interface Patient {
  _id: string;
  userId?: {
    _id: string;
    name?: string;
    email?: string;
  };
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string[];
  allergies?: string[]; // Changed: always string array
  lastAppointment?: string;
  totalAppointments?: number;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  _id: string;
  patientId: string | { _id: string; name?: string; email?: string };
  appointmentDate: string;
  status: string;
  type?: string;
  notes?: string;
}

const HealthMateDoctorPortal = () => {
  const router = useRouter();

  // States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    new: 0
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Initialize
  useEffect(() => {
    fetchAllPatients();
  }, []);

  // Fetch all patients directly from the API
  const fetchAllPatients = async () => {
    try {
      setLoading(true);
      console.log('Fetching all patients...');

      // Try multiple endpoints
      const endpoints = [
        '/patients/all',
        '/appointments/my' // Alternative: get patients from appointments
      ];

      let allPatients: Patient[] = [];

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await api.get(endpoint);
          
          if (endpoint === '/patients/all') {
            // Direct patients endpoint
            if (Array.isArray(response.data)) {
              // Transform API response to match Patient interface
              allPatients = response.data.map((patient: any) => ({
                _id: patient._id,
                userId: patient.userId || { _id: patient._id },
                name: patient.name || patient.fullName,
                fullName: patient.fullName || patient.name,
                email: patient.email || patient.userId?.email,
                phone: patient.phone,
                age: patient.age,
                gender: patient.gender,
                bloodGroup: patient.bloodGroup,
                address: patient.address,
                emergencyContactName: patient.emergencyContactName,
                emergencyContactPhone: patient.emergencyContactPhone,
                medicalConditions: Array.isArray(patient.medicalConditions) 
                  ? patient.medicalConditions 
                  : patient.medicalConditions ? [patient.medicalConditions] : [],
                allergies: Array.isArray(patient.allergies) 
                  ? patient.allergies 
                  : patient.allergies ? [patient.allergies] : [],
                lastAppointment: patient.lastAppointment,
                totalAppointments: patient.totalAppointments,
                createdAt: patient.createdAt || new Date().toISOString(),
                updatedAt: patient.updatedAt || new Date().toISOString()
              }));
              console.log(`✅ Found ${allPatients.length} patients from /patients/all`);
              break;
            }
          } else if (endpoint === '/appointments/my') {
            // Get patients from appointments
            const appointmentsData = Array.isArray(response.data) ? response.data : [];
            console.log(`Found ${appointmentsData.length} appointments`);
            
            // Create unique patients from appointments
            const uniquePatients = new Map<string, Patient>();
            
            appointmentsData.forEach((apt: Appointment) => {
              // Handle both string and object patientId
              let patientId: string;
              let patientName: string;
              let patientEmail: string;
              
              if (typeof apt.patientId === 'string') {
                patientId = apt.patientId;
                patientName = 'Patient';
                patientEmail = '';
              } else {
                patientId = apt.patientId?._id || '';
                patientName = apt.patientId?.name || 'Patient';
                patientEmail = apt.patientId?.email || '';
              }
              
              if (patientId && !uniquePatients.has(patientId)) {
                uniquePatients.set(patientId, {
                  _id: patientId,
                  userId: {
                    _id: patientId,
                    name: patientName,
                    email: patientEmail
                  },
                  name: patientName,
                  fullName: patientName,
                  medicalConditions: [],
                  allergies: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
              }
            });
            
            allPatients = Array.from(uniquePatients.values());
            console.log(`✅ Found ${allPatients.length} unique patients from appointments`);
            
            // Fetch additional patient details for each patient
            await Promise.all(
              allPatients.map(async (patient, index) => {
                try {
                  // Try to get patient details from API
                  const patientDetailResponse = await api.get(`/patients/${patient._id}`);
                  const patientData = patientDetailResponse.data;
                  
                  // Update patient with API data
                  allPatients[index] = {
                    ...patient,
                    name: patientData.name || patientData.fullName || patient.name,
                    fullName: patientData.fullName || patientData.name || patient.fullName,
                    email: patientData.email || patient.userId?.email,
                    phone: patientData.phone,
                    age: patientData.age,
                    gender: patientData.gender,
                    bloodGroup: patientData.bloodGroup,
                    address: patientData.address,
                    emergencyContactName: patientData.emergencyContactName,
                    emergencyContactPhone: patientData.emergencyContactPhone,
                    medicalConditions: Array.isArray(patientData.medicalConditions) 
                      ? patientData.medicalConditions 
                      : patientData.medicalConditions ? [patientData.medicalConditions] : [],
                    allergies: Array.isArray(patientData.allergies) 
                      ? patientData.allergies 
                      : patientData.allergies ? [patientData.allergies] : [],
                    createdAt: patientData.createdAt || patient.createdAt,
                    updatedAt: patientData.updatedAt || patient.updatedAt
                  };
                } catch (error) {
                  console.log(`Could not fetch details for patient ${patient._id}, using basic info`);
                  // If we can't get details, add mock data for development
                  allPatients[index] = {
                    ...patient,
                    age: patient.age || Math.floor(Math.random() * 50) + 18,
                    gender: patient.gender || (Math.random() > 0.5 ? 'Male' : 'Female'),
                    bloodGroup: patient.bloodGroup || ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
                    phone: patient.phone || `+1${Math.floor(Math.random() * 900000000) + 100000000}`,
                    address: patient.address || 'Address not available',
                    medicalConditions: patient.medicalConditions || ['Hypertension', 'Diabetes', 'Asthma'].slice(0, Math.floor(Math.random() * 3)),
                    allergies: patient.allergies || (Math.random() > 0.5 ? ['Penicillin'] : ['Sulfa'])
                  };
                }
                
                // Get appointments for this patient to count them
                const patientAppointments = appointmentsData.filter((apt: Appointment) => {
                  const aptPatientId = typeof apt.patientId === 'string' 
                    ? apt.patientId 
                    : apt.patientId?._id;
                  return aptPatientId === patient._id;
                });
                
                // Get latest appointment date
                const sortedAppointments = patientAppointments.sort((a, b) => 
                  new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
                );
                
                // Update patient with appointment info
                allPatients[index] = {
                  ...allPatients[index],
                  lastAppointment: sortedAppointments[0]?.appointmentDate,
                  totalAppointments: patientAppointments.length
                };
              })
            );
            
            break;
          }
        } catch (err) {
          console.log(`❌ Failed ${endpoint}:`, (err as any).response?.status);
          continue;
        }
      }

      setPatients(allPatients);
      setFilteredPatients(allPatients);

      // Calculate stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activePatients = allPatients.filter(patient => {
        if (!patient.lastAppointment) return false;
        const lastAppointmentDate = new Date(patient.lastAppointment);
        return lastAppointmentDate >= thirtyDaysAgo && (patient.totalAppointments || 0) > 0;
      });

      // New patients: have appointments but all are scheduled/upcoming
      const newPatients = allPatients.filter(patient => {
        return (patient.totalAppointments || 0) <= 2;
      });

      setStats({
        total: allPatients.length,
        active: activePatients.length,
        new: newPatients.length
      });

      console.log('Patients loaded:', {
        total: allPatients.length,
        active: activePatients.length,
        new: newPatients.length
      });

    } catch (error) {
      console.error('Error fetching patients:', error);
      
      // Fallback to mock data for development
      const mockPatients: Patient[] = [
        {
          _id: 'patient1',
          userId: { _id: 'patient1', name: 'Ali', email: 'ali@patient.com' },
          name: 'Ali',
          fullName: 'Ali',
          age: 35,
          gender: 'Male',
          bloodGroup: 'A+',
          phone: '+1234567890',
          address: '123 Street, City',
          medicalConditions: ['Hypertension'],
          allergies: ['Penicillin'],
          lastAppointment: '2024-12-28T10:00:00Z',
          totalAppointments: 3,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-12-28T00:00:00Z'
        },
        {
          _id: 'patient2',
          userId: { _id: 'patient2', name: 'Ahmed', email: 'ahmed@patient.com' },
          name: 'Ahmed',
          fullName: 'Ahmed',
          age: 42,
          gender: 'Male',
          bloodGroup: 'B+',
          phone: '+1987654321',
          address: '456 Avenue, City',
          medicalConditions: ['Diabetes', 'Hypertension'],
          allergies: [],
          lastAppointment: '2024-12-29T14:30:00Z',
          totalAppointments: 2,
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-12-29T00:00:00Z'
        },
        {
          _id: 'patient3',
          userId: { _id: 'patient3', name: 'Sara', email: 'sara@patient.com' },
          name: 'Sara',
          fullName: 'Sara Khan',
          age: 28,
          gender: 'Female',
          bloodGroup: 'O+',
          phone: '+1555123456',
          address: '789 Road, City',
          medicalConditions: ['Asthma'],
          allergies: ['Sulfa'],
          lastAppointment: '2024-12-15T11:00:00Z',
          totalAppointments: 1,
          createdAt: '2024-03-01T00:00:00Z',
          updatedAt: '2024-12-15T00:00:00Z'
        }
      ];

      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
      setStats({
        total: mockPatients.length,
        active: 2,
        new: 1
      });
      
    } finally {
      setLoading(false);
    }
  };

  // Filter patients
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = patients.filter(patient => {
      const name = patient.name || patient.fullName || patient.userId?.name || '';
      const email = patient.email || patient.userId?.email || '';
      const phone = patient.phone || '';
      const conditions = patient.medicalConditions?.join(' ') || '';
      const allergies = patient.allergies?.join(' ') || '';

      return (
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        phone.includes(term) ||
        conditions.toLowerCase().includes(term) ||
        allergies.toLowerCase().includes(term) ||
        (patient.bloodGroup && patient.bloodGroup.toLowerCase().includes(term))
      );
    });

    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  // Select patient
  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    
    try {
      const appointmentsResponse = await api.get('/appointments/my');
      const allAppointments = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
      
      const patientAppointments = allAppointments.filter((apt: Appointment) => {
        const patientId = typeof apt.patientId === 'string' ? apt.patientId : apt.patientId?._id;
        return patientId === patient._id;
      });
      
      setAppointments(patientAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
    
    router.push(`/doctor/patients/${patient._id}`);
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
              <p className="text-gray-500 mt-2">Patients who have booked appointments with you</p>
            </div>
            <button
              onClick={() => router.push('/doctor/appointments')}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center"
            >
              <CalendarDays className="w-5 h-5 mr-2" />
              View Appointments
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">My Patients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  <p className="text-xs text-gray-400 mt-1">From your appointments</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.active}</p>
                  <p className="text-xs text-gray-400 mt-1">Appointments in last 30 days</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New Patients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.new}</p>
                  <p className="text-xs text-gray-400 mt-1">With few appointments</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients by name, email, phone, or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                />
              </div>
              <button className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                onClick={() => selectPatient(patient)}
              >
                <div className="p-6">
                  {/* Patient Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        patient.gender === 'Female' ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                        patient.gender === 'Male' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                        'bg-gradient-to-br from-emerald-500 to-green-600'
                      }`}>
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 truncate">
                          {patient.name || patient.fullName || patient.userId?.name || 'Patient'}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {patient.age ? `${patient.age} years` : 'Age not specified'}
                          {patient.gender && ` • ${patient.gender}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>

                  {/* Patient Info */}
                  <div className="space-y-3 mb-6">
                    {(patient.email || patient.userId?.email) && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {patient.email || patient.userId?.email}
                        </span>
                      </div>
                    )}

                    {patient.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm">{patient.phone}</span>
                      </div>
                    )}

                    {patient.bloodGroup && (
                      <div className="flex items-center text-gray-600">
                        <Heart className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm">Blood Group: {patient.bloodGroup}</span>
                      </div>
                    )}

                    {patient.medicalConditions && patient.medicalConditions.length > 0 && (
                      <div className="flex items-start text-gray-600">
                        <Thermometer className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Conditions: {patient.medicalConditions.slice(0, 2).join(', ')}
                          {patient.medicalConditions.length > 2 && '...'}
                        </span>
                      </div>
                    )}

                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="flex items-start text-gray-600">
                        <AlertCircle className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          Allergies: {patient.allergies.slice(0, 2).join(', ')}
                          {patient.allergies.length > 2 && '...'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Medical Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-xs text-emerald-700 mb-1">Appointments</p>
                      <p className="text-lg font-bold text-emerald-900">
                        {patient.totalAppointments || 0}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-700 mb-1">Conditions</p>
                      <p className="text-lg font-bold text-blue-900">
                        {patient.medicalConditions?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Last Visit */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">Last visit:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {formatDate(patient.lastAppointment)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-gray-200/50 shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {patients.length === 0 ? 'No patients yet' : 'No patients found'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {patients.length === 0
                  ? 'Patients will appear here after they book appointments with you.'
                  : searchTerm
                    ? 'Try adjusting your search terms or filters.'
                    : 'No patients match the selected filters.'}
              </p>
              {patients.length === 0 && (
                <button
                  onClick={() => router.push('/doctor/appointments')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  View Appointments
                </button>
              )}
            </div>
          )}
        </div>

        {/* Patient Count Info */}
        <div className="text-center text-gray-500 text-sm">
          Showing {filteredPatients.length} of {patients.length} patients
        </div>
      </div>
    </div>
  );
};

export default HealthMateDoctorPortal;