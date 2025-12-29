"use client";

console.log('=== FILE LOADED: HealthMateDoctorPortal ===');

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Search, Filter, Phone, Mail, Calendar, Activity, ChevronRight,
  User, Heart, Thermometer, FileText, Pill, ArrowLeft, Plus, Eye,
  MapPin, Clock, Stethoscope, AlertCircle, Download, Save
} from 'lucide-react';
import api from '@/lib/api/api';

console.log('=== IMPORTS SUCCESSFUL ===');

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
  console.log('=== HealthMateDoctorPortal component rendering ===');

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
    console.log('=== useEffect triggered - Component mounted ===');
    fetchPatients();
  }, []);

  // Fetch all patients who have appointments with this doctor
  const fetchPatients = async () => {
    console.log('=== fetchPatients called ===');
    try {
      setLoading(true);

      // Get all appointments for this doctor
      console.log('Fetching appointments from /appointments/my...');
      const appointmentsResponse = await api.get('/appointments/my-doctor-appointments');

      console.log('Raw appointments response:', appointmentsResponse);
      console.log('Appointments data:', appointmentsResponse.data);

      const appointments: Appointment[] = Array.isArray(appointmentsResponse.data)
        ? appointmentsResponse.data
        : [];

      console.log('Processed appointments:', appointments);
      console.log('Total appointments found:', appointments.length);

      // Create a map to group appointments by patient
      const patientsMap = new Map<string, {
        patient: Omit<Patient, 'lastAppointment'> & { lastAppointment?: string | null };
        appointments: Appointment[];
      }>();

      // Group appointments by patient
      for (const appointment of appointments) {
        console.log('Processing appointment:', appointment);
        console.log('PatientId type:', typeof appointment.patientId);
        console.log('PatientId value:', appointment.patientId);

        // Handle both populated and non-populated patientId
        const patientId = typeof appointment.patientId === 'string'
          ? appointment.patientId
          : appointment.patientId?._id;

        console.log('Extracted patientId:', patientId);

        if (!patientId) {
          console.log('Skipping appointment - no patientId');
          continue;
        }

        if (!patientsMap.has(patientId)) {
          // Get patient name and email if patientId is populated
          const patientName = typeof appointment.patientId === 'object'
            ? appointment.patientId?.name
            : 'Patient';
          const patientEmail = typeof appointment.patientId === 'object'
            ? appointment.patientId?.email
            : '';

          console.log('Adding new patient to map:', patientId);

          patientsMap.set(patientId, {
            patient: {
              _id: patientId,
              userId: {
                _id: patientId,
                name: patientName,
                email: patientEmail
              },
              fullName: patientName,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            appointments: []
          });
        }
        patientsMap.get(patientId)!.appointments.push(appointment);
      }

      console.log('Patients map size:', patientsMap.size);
      console.log('Patient IDs in map:', Array.from(patientsMap.keys()));

      // Fetch detailed patient information for each patient
      const enrichedPatients: Patient[] = await Promise.all(
        Array.from(patientsMap.values()).map(async ({ patient, appointments }) => {
          try {
            console.log(`Fetching details for patient ${patient._id}...`);
            // Fetch full patient details from /patients/{id}
            const patientResponse = await api.get(`/patients/${patient._id}`);
            const patientData = patientResponse.data;

            console.log(`Patient ${patient._id} data:`, patientData);

            // Sort appointments by date (most recent first)
            const sortedAppointments = appointments.sort((a, b) => {
              const dateA = a.appointmentDate || '';
              const dateB = b.appointmentDate || '';
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            });

            const lastAppointment = sortedAppointments.length > 0
              ? (sortedAppointments[0].appointmentDate || undefined)
              : undefined;

            // Return enriched patient object with all details
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
            console.error(`Error fetching patient ${patient._id}:`, error);

            // Fallback: use basic info from appointments if patient details fetch fails
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

      console.log('Enriched patients:', enrichedPatients);

      // Sort patients by most recent appointment
      const sortedPatients = enrichedPatients.sort((a, b) => {
        const dateA = a.lastAppointment ? new Date(a.lastAppointment).getTime() : 0;
        const dateB = b.lastAppointment ? new Date(b.lastAppointment).getTime() : 0;
        return dateB - dateA;
      });

      setPatients(sortedPatients);
      setFilteredPatients(sortedPatients);

      // Calculate stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Active patients: have had an appointment in the last 30 days
      const activePatients = sortedPatients.filter(patient => {
        if (!patient.lastAppointment) return false;
        const lastAppointmentDate = new Date(patient.lastAppointment);
        return lastAppointmentDate >= thirtyDaysAgo && (patient.totalAppointments || 0) > 0;
      });

      // New patients: only have scheduled appointments, no completed ones yet
      const newPatients = sortedPatients.filter(patient => {
        const patientAppointments = Array.from(patientsMap.values())
          .find(p => p.patient._id === patient._id)?.appointments || [];

        const hasCompletedAppointment = patientAppointments.some(
          apt => apt.status === 'completed'
        );

        return !hasCompletedAppointment && (patient.totalAppointments || 0) > 0;
      });

      setStats({
        total: sortedPatients.length,
        active: activePatients.length,
        new: newPatients.length
      });

      console.log('=== Stats calculated ===', {
        total: sortedPatients.length,
        active: activePatients.length,
        new: newPatients.length
      });

    } catch (error) {
      console.error('=== Error fetching patients ===', error);
      setPatients([]);
      setFilteredPatients([]);
      setStats({ total: 0, active: 0, new: 0 });
    } finally {
      setLoading(false);
      console.log('=== fetchPatients completed ===');
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

  // Fetch patient details including appointments, records, and prescriptions
  const fetchPatientDetails = async (patientId: string) => {
    try {
      // Fetch patient's appointments with this doctor
      const appointmentsResponse = await api.get(`/appointments/my-doctor-appointments`);
      const allAppointments = appointmentsResponse.data || [];

      // Filter appointments for this specific patient
      const patientAppointments = Array.isArray(allAppointments)
        ? allAppointments.filter((apt: Appointment) => {
          // Handle both populated and non-populated patientId
          const aptPatientId = typeof apt.patientId === 'string'
            ? apt.patientId
            : apt.patientId?._id;
          return aptPatientId === patientId;
        })
        : [];

      setAppointments(patientAppointments);

      // Fetch medical records for this patient
      try {
        const recordsResponse = await api.get(`/medical-records/patient/${patientId}`);
        setMedicalRecords(recordsResponse.data?.data || recordsResponse.data || []);
      } catch (error) {
        console.error('Error fetching medical records:', error);
        setMedicalRecords([]);
      }

      // Fetch prescriptions for this patient
      try {
        const prescriptionsResponse = await api.get(`/prescriptions/patient/${patientId}`);
        setPrescriptions(prescriptionsResponse.data?.data || prescriptionsResponse.data || []);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setPrescriptions([]);
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setAppointments([]);
      setMedicalRecords([]);
      setPrescriptions([]);
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
                    <p className="text-xs text-gray-400 mt-1">No completed appointments</p>
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
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${patient.gender === 'Female'
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
          /* Patient Details - Content continues */
          <div className="text-center py-16">
            <p className="text-gray-500">Patient details view - Implementation continues from original code</p>
          </div>
        ) : showCreateRecord && selectedPatient ? (
          /* Create Medical Record Form */
          <div className="text-center py-16">
            <p className="text-gray-500">Medical record form - Implementation continues from original code</p>
          </div>
        ) : showCreatePrescription && selectedPatient ? (
          /* Create Prescription */
          <div className="text-center py-16">
            <p className="text-gray-500">Prescription form - Implementation continues from original code</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HealthMateDoctorPortal;