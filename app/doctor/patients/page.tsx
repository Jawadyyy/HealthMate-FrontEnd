"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Search, Filter, Phone, Mail, Calendar, Activity, ChevronRight, 
  User, Heart, Thermometer, FileText, Pill, ArrowLeft, Plus, Eye,
  MapPin, Clock, Stethoscope, AlertCircle, Download, Save
} from 'lucide-react';
import api from '@/lib/api/api';

// Interfaces
interface Patient {
  _id: string;
  userId: {
    _id: string;
    name?: string;
    email?: string;
  };
  age?: number;
  gender?: string;
  bloodGroup?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string[];
  allergies?: string[];
  lastAppointment?: string;
  totalAppointments?: number;
  fullName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  _id: string;
  appointmentDate: string;
  status: string;
  type: string;
  notes?: string;
  patientId?: any;
}

interface MedicalRecord {
  _id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

interface Prescription {
  _id: string;
  date: string;
  diagnosis: string;
  status: string;
  medications: Array<{ name: string }>;
}

interface Stats {
  total: number;
  active: number;
  new: number;
}

interface FormData {
  recordType: 'consultation' | 'diagnosis' | 'lab-report' | 'other';
  title: string;
  description: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  date: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
}

// Main Component
const HealthMateDoctorPortal = () => {
  const router = useRouter();
  
  // States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, new: 0 });
  const [activeTab, setActiveTab] = useState<'patients' | 'details' | 'records' | 'prescriptions'>('patients');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showCreateRecord, setShowCreateRecord] = useState(false);
  const [showCreatePrescription, setShowCreatePrescription] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    recordType: 'consultation',
    title: '',
    description: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: ''
    }
  });

  // Initialize
  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const appointmentsResponse = await api.get('/appointments/my');
      const appointments: Appointment[] = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
      
      const patientsMap = new Map<string, {
        patient: Omit<Patient, 'lastAppointment'> & { lastAppointment?: string | null };
        appointments: Appointment[];
      }>();
      
      for (const appointment of appointments) {
        const patientId = appointment.patientId?._id;
        if (!patientId) continue;
        
        if (!patientsMap.has(patientId)) {
          patientsMap.set(patientId, {
            patient: {
              _id: patientId,
              userId: {
                _id: patientId,
                name: appointment.patientId?.name || 'Patient',
                email: appointment.patientId?.email || ''
              },
              fullName: appointment.patientId?.name || 'Patient',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            appointments: []
          });
        }
        patientsMap.get(patientId)!.appointments.push(appointment);
      }
      
      const enrichedPatients: Patient[] = await Promise.all(
        Array.from(patientsMap.values()).map(async ({ patient, appointments }) => {
          try {
            const patientResponse = await api.get(`/patients/${patient._id}`);
            const patientData = patientResponse.data;
            
            const sortedAppointments = appointments.sort((a, b) => {
              const dateA = a.appointmentDate || '';
              const dateB = b.appointmentDate || '';
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
            
            const lastAppointment = sortedAppointments.length > 0 
              ? (sortedAppointments[0].appointmentDate || undefined)
              : undefined;
            
            return {
              _id: patient._id,
              userId: {
                _id: patient._id,
                name: patientData.name || patientData.fullName || patientData.userId?.name || 'Patient',
                email: patientData.email || patientData.userId?.email || ''
              },
              age: patientData.age,
              gender: patientData.gender,
              bloodGroup: patientData.bloodGroup,
              phone: patientData.phone,
              email: patientData.email || patientData.userId?.email || '',
              address: patientData.address,
              emergencyContactName: patientData.emergencyContactName,
              emergencyContactPhone: patientData.emergencyContactPhone,
              medicalConditions: patientData.medicalConditions || [],
              allergies: patientData.allergies || [],
              lastAppointment: lastAppointment,
              totalAppointments: appointments.length,
              fullName: patientData.name || patientData.fullName || patientData.userId?.name || 'Patient',
              createdAt: patientData.createdAt || new Date().toISOString(),
              updatedAt: patientData.updatedAt || new Date().toISOString()
            };
          } catch (error) {
            const sortedAppointments = appointments.sort((a, b) => {
              const dateA = a.appointmentDate || '';
              const dateB = b.appointmentDate || '';
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
            
            const lastAppointment = sortedAppointments.length > 0 
              ? (sortedAppointments[0].appointmentDate || undefined)
              : undefined;
            
            return {
              ...patient,
              lastAppointment: lastAppointment,
              totalAppointments: appointments.length,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as Patient;
          }
        })
      );
      
      setPatients(enrichedPatients);
      setFilteredPatients(enrichedPatients);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activePatients = enrichedPatients.filter(patient => {
        if (!patient.lastAppointment) return false;
        const lastAppointmentDate = new Date(patient.lastAppointment);
        return lastAppointmentDate >= thirtyDaysAgo && (patient.totalAppointments || 0) > 0;
      });
      
      const newPatients = enrichedPatients.filter(patient => 
        (patient.totalAppointments || 0) === 0
      );
      
      setStats({
        total: enrichedPatients.length,
        active: activePatients.length,
        new: newPatients.length
      });
      
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
      setFilteredPatients([]);
      setStats({ total: 0, active: 0, new: 0 });
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
      const userName = patient.userId?.name || patient.fullName || '';
      const userEmail = patient.userId?.email || patient.email || '';
      const phone = patient.phone || '';
      
      return (
        userName.toLowerCase().includes(term) ||
        userEmail.toLowerCase().includes(term) ||
        phone.includes(searchTerm) ||
        (patient.bloodGroup && patient.bloodGroup.toLowerCase().includes(term)) ||
        (patient.gender && patient.gender.toLowerCase().includes(term))
      );
    });
    
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  // Select patient and fetch details
  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('details');
    await fetchPatientDetails(patient._id);
  };

  // Fetch patient details
  const fetchPatientDetails = async (patientId: string) => {
    try {
      // Fetch appointments
      const appointmentsResponse = await api.get(`/appointments/doctor/patient?patientId=${patientId}`);
      setAppointments(appointmentsResponse.data.data || appointmentsResponse.data || []);
      
      // Fetch medical records
      const recordsResponse = await api.get(`/medical-records/patient/${patientId}`);
      setMedicalRecords(recordsResponse.data.data || recordsResponse.data || []);
      
      // Fetch prescriptions
      const prescriptionsResponse = await api.get(`/prescriptions/patient/${patientId}`);
      setPrescriptions(prescriptionsResponse.data.data || prescriptionsResponse.data || []);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
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
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-emerald-100 text-emerald-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Handle form submission for medical record
  const handleSubmitMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !selectedPatient) {
      alert('Please enter a title');
      return;
    }

    try {
      const recordData = {
        patientId: selectedPatient._id,
        type: formData.recordType,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        diagnosis: formData.diagnosis.trim() || undefined,
        treatment: formData.treatment.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        date: new Date(formData.date).toISOString(),
        vitalSigns: formData.vitalSigns.bloodPressure || formData.vitalSigns.heartRate || 
                  formData.vitalSigns.temperature || formData.vitalSigns.weight 
          ? {
              bloodPressure: formData.vitalSigns.bloodPressure || undefined,
              heartRate: formData.vitalSigns.heartRate ? parseInt(formData.vitalSigns.heartRate) : undefined,
              temperature: formData.vitalSigns.temperature ? parseFloat(formData.vitalSigns.temperature) : undefined,
              weight: formData.vitalSigns.weight ? parseFloat(formData.vitalSigns.weight) : undefined
            }
          : undefined
      };

      await api.post('/medical-records/add', recordData);
      
      alert('Medical record created successfully!');
      setShowCreateRecord(false);
      setFormData({
        recordType: 'consultation',
        title: '',
        description: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        vitalSigns: {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          weight: ''
        }
      });
      
      if (selectedPatient) {
        await fetchPatientDetails(selectedPatient._id);
      }
    } catch (error: any) {
      console.error('Error creating medical record:', error);
      alert(error.response?.data?.message || 'Failed to create medical record');
    }
  };

  // Loading state
  if (loading && activeTab === 'patients') {
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
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === 'patients' ? 'My Patients' : 
                 activeTab === 'details' ? 'Patient Details' :
                 activeTab === 'records' ? 'Medical Records' : 'Prescriptions'}
              </h1>
              <p className="text-gray-500 mt-2">
                {activeTab === 'patients' ? 'Patients who have booked appointments with you' :
                 activeTab === 'details' ? selectedPatient?.userId?.name || 'Patient details' :
                 activeTab === 'records' ? 'Patient medical records and history' : 'Prescriptions and medications'}
              </p>
            </div>
            
            {activeTab !== 'patients' && (
              <button
                onClick={() => {
                  setActiveTab('patients');
                  setSelectedPatient(null);
                  setShowCreateRecord(false);
                  setShowCreatePrescription(false);
                }}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Patients</span>
              </button>
            )}
          </div>

          {/* Stats - Only show on patients tab */}
          {activeTab === 'patients' && (
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
                    <p className="text-xs text-gray-400 mt-1">No appointments yet</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          {activeTab === 'patients' && (
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
          )}
        </div>

        {/* Main Content */}
        {activeTab === 'patients' ? (
          /* Patients Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => selectPatient(patient)}
                >
                  <div className="p-6">
                    {/* Patient Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          patient.gender === 'Female' 
                            ? 'bg-gradient-to-br from-pink-500 to-rose-600' 
                            : patient.gender === 'Male'
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            : 'bg-gradient-to-br from-emerald-500 to-green-600'
                        }`}>
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 truncate">
                            {patient.userId?.name || patient.fullName || 'Patient'}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {patient.age ? `${patient.age} years` : 'Age not specified'}
                            {patient.gender && ` • ${patient.gender}`}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Patient Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm truncate">{patient.userId?.email || patient.email || 'No email'}</span>
                      </div>

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
        ) : selectedPatient && !showCreateRecord && !showCreatePrescription ? (
          /* Patient Details */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Patient Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Patient Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedPatient.userId?.name || 'Patient'}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {selectedPatient.age && (
                        <span>{selectedPatient.age} years</span>
                      )}
                      {selectedPatient.gender && (
                        <span>• {selectedPatient.gender}</span>
                      )}
                      {selectedPatient.bloodGroup && (
                        <span>• Blood Group: {selectedPatient.bloodGroup}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Patient since {new Date(selectedPatient.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      {selectedPatient.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-900">{selectedPatient.phone}</span>
                        </div>
                      )}
                      {selectedPatient.userId?.email && (
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-900 truncate">{selectedPatient.userId.email}</span>
                        </div>
                      )}
                      {selectedPatient.address && (
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                          <span className="text-sm text-gray-900">{selectedPatient.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h3>
                    <div className="space-y-3">
                      {selectedPatient.emergencyContactName && (
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-900">{selectedPatient.emergencyContactName}</span>
                        </div>
                      )}
                      {selectedPatient.emergencyContactPhone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-900">{selectedPatient.emergencyContactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Conditions */}
                {selectedPatient.medicalConditions && selectedPatient.medicalConditions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Medical Conditions</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.medicalConditions.map((condition, index) => (
                        <span
                          key={index}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Allergies</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs Navigation */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-1 px-6">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('records')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'records'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Medical Records ({medicalRecords.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('prescriptions')}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'prescriptions'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Prescriptions ({prescriptions.length})
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {/* Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-emerald-800">Total Appointments</p>
                              <p className="text-2xl font-bold text-emerald-900 mt-2">{appointments.length}</p>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-emerald-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-800">Medical Records</p>
                              <p className="text-2xl font-bold text-blue-900 mt-2">{medicalRecords.length}</p>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-red-800">Active Prescriptions</p>
                              <p className="text-2xl font-bold text-red-900 mt-2">
                                {prescriptions.filter(p => p.status === 'active').length}
                              </p>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                              <Pill className="w-5 h-5 text-red-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button
                            onClick={() => router.push(`/doctor/appointments?patientId=${selectedPatient._id}`)}
                            className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer text-left"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Schedule Appointment</p>
                                <p className="text-xs text-gray-500 mt-1">Book a new appointment</p>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => setShowCreatePrescription(true)}
                            className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer text-left"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Pill className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Write Prescription</p>
                                <p className="text-xs text-gray-500 mt-1">Prescribe medications</p>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => setShowCreateRecord(true)}
                            className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer text-left"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Add Medical Record</p>
                                <p className="text-xs text-gray-500 mt-1">Document consultation</p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'records' && (
                    <div className="space-y-4">
                      {medicalRecords.length > 0 ? (
                        medicalRecords.map((record) => (
                          <div
                            key={record._id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{record.title}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(record.date)} • {record.type}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No medical records found</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'prescriptions' && (
                    <div className="space-y-4">
                      {prescriptions.length > 0 ? (
                        prescriptions.map((prescription) => (
                          <div
                            key={prescription._id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <Pill className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  Prescription {prescription._id.slice(-6)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(prescription.date)} • {prescription.medications.length} med(s)
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(prescription.status)}`}>
                                {prescription.status}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No prescriptions found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Recent Activity & Actions */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
                
                <div className="space-y-4">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment._id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Appointment</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(appointment.appointmentDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {medicalRecords.slice(0, 2).map((record) => (
                    <div key={record._id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Medical Record: {record.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(record.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {appointments.length === 0 && medicalRecords.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Stats */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Patient Statistics</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Appointment Frequency</span>
                    <span className="text-sm font-medium text-gray-900">
                      {appointments.length > 0 ? 'Regular' : 'First-time'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Appointment</span>
                    <span className="text-sm text-gray-900">
                      {appointments.length > 0 
                        ? formatDate(appointments[appointments.length - 1].appointmentDate)
                        : 'Never'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Prescriptions</span>
                    <span className="text-sm font-medium text-gray-900">
                      {prescriptions.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Visits</span>
                    <span className="text-sm font-medium text-gray-900">
                      {appointments.filter(a => a.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCreatePrescription(true)}
                    className="w-full flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="font-medium text-gray-900">Write Prescription</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                  </button>
                  
                  <button
                    onClick={() => setShowCreateRecord(true)}
                    className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">Add Medical Record</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </button>
                  
                  <button
                    onClick={() => router.push(`/doctor/appointments?patientId=${selectedPatient._id}`)}
                    className="w-full flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-900">Schedule Appointment</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : showCreateRecord && selectedPatient ? (
          /* Create Medical Record Form */
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmitMedicalRecord} className="space-y-8">
              {/* Header */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">New Medical Record</h2>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{selectedPatient.userId?.name || 'Patient'}</span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">ID: {selectedPatient._id.slice(-8)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateRecord(false)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back</span>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
                    <p className="text-sm text-gray-500">Record type and basic details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Record Type *
                    </label>
                    <select
                      value={formData.recordType}
                      onChange={(e) => setFormData({...formData, recordType: e.target.value as any})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      required
                    >
                      <option value="consultation">Consultation</option>
                      <option value="diagnosis">Diagnosis</option>
                      <option value="lab-report">Lab Report</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Annual Checkup, Follow-up Visit"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of this record..."
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis & Treatment */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Diagnosis & Treatment</h2>
                    <p className="text-sm text-gray-500">Medical diagnosis and prescribed treatment</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosis
                    </label>
                    <textarea
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                      placeholder="Enter medical diagnosis..."
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Treatment Plan
                    </label>
                    <textarea
                      value={formData.treatment}
                      onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                      placeholder="Describe the treatment plan..."
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowCreateRecord(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/30"
                  >
                    <Save className="w-5 h-5" />
                    <span>Create Medical Record</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : showCreatePrescription && selectedPatient ? (
          /* Create Prescription (Placeholder) */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">New Prescription</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <Pill className="w-4 h-4" />
                      <span className="font-medium">{selectedPatient.userId?.name || 'Patient'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreatePrescription(false)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back</span>
                </button>
              </div>
              
              <div className="text-center py-16">
                <Pill className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Prescription Module</h3>
                <p className="text-gray-500 mb-8">
                  This is a placeholder for the prescription creation form.
                  In a full implementation, this would include medication selection,
                  dosage instructions, and prescription details.
                </p>
                <button
                  onClick={() => {
                    alert('Prescription functionality would be implemented here');
                    setShowCreatePrescription(false);
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Prescription (Demo)</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HealthMateDoctorPortal;