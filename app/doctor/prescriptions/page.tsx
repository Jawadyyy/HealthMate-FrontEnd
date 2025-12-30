"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Pill, Plus, Search, Filter, User, Calendar, AlertCircle, CheckCircle, XCircle, Eye, 
  Download, Printer, ArrowLeft, Save, RefreshCw, ChevronRight, Mail, Phone, 
  FileText, Clock, Edit, Loader2
} from 'lucide-react';
import api from '@/lib/api/api';

// Interfaces
interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Prescription {
  _id: string;
  patientId: any; // Can be string or object
  doctorId: any; // Can be string or object
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  status: string;
  refills: number;
  refillsUsed: number;
  nextRefillDate?: string;
  prescriptionDate: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  _id: string;
  userId?: {
    _id: string;
    name?: string;
    email?: string;
  };
  name?: string;
  fullName?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
}

// Main Component
const DoctorPrescriptionsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prescriptionId = searchParams.get('id');
  const patientId = searchParams.get('patientId');
  
  // Main states
  const [activeView, setActiveView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // List view states
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create view states
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [refills, setRefills] = useState(0);
  const [patientSearch, setPatientSearch] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState<string>('');
  
  // Details view states
  const [patientDetails, setPatientDetails] = useState<any>(null);

  // Initialize
  useEffect(() => {
    if (prescriptionId) {
      fetchPrescriptionDetails(prescriptionId);
    } else {
      fetchPrescriptions();
    }
    
    if (patientId && activeView === 'create') {
      // Load patient data if patientId is provided
      fetchPatientForPrescription(patientId);
    }
  }, []);

  // Fetch prescriptions for list view
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      console.log('Fetching prescriptions...');
      
      // Try different endpoints based on your API
      let data: any[] = [];
      
      try {
        // First try /prescriptions/doctor/my
        const response = await api.get('/prescriptions/doctor/my');
        data = response.data.data || response.data || [];
        console.log('Found prescriptions from /prescriptions/doctor/my:', data.length);
      } catch (error: any) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          console.log('Trying alternative endpoint /prescriptions/my...');
          // Try /prescriptions/my for doctor's prescriptions
          const response = await api.get('/prescriptions/my');
          data = response.data.data || response.data || [];
          console.log('Found prescriptions from /prescriptions/my:', data.length);
        } else {
          throw error;
        }
      }
      
      // Filter to only show prescriptions for current doctor
      // (assuming doctor's ID is in the prescription data)
      const filteredData = data.filter((prescription: any) => {
        // Keep if it belongs to current doctor or if we can't verify
        return true; // For now, show all prescriptions from the endpoint
      });
      
      setPrescriptions(filteredData);
      setFilteredPrescriptions(filteredData);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      // Show empty state with mock data for development
      setPrescriptions([]);
      setFilteredPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients for create view
  const fetchPatientsForCreate = async () => {
    try {
      console.log('Fetching patients for prescription creation...');
      
      // Get patients from appointments
      const appointmentsResponse = await api.get('/appointments/my');
      const appointments = Array.isArray(appointmentsResponse.data) 
        ? appointmentsResponse.data 
        : appointmentsResponse.data.data || [];
      
      console.log('Found appointments:', appointments.length);
      
      const patientsMap = new Map<string, Patient>();
      
      for (const appointment of appointments) {
        // Extract patient info from appointment
        const patientId = appointment.patientId?._id || appointment.patientId;
        const patientName = appointment.patientId?.name || 'Patient';
        const patientEmail = appointment.patientId?.email || '';
        
        if (!patientId) continue;
        
        if (!patientsMap.has(patientId)) {
          patientsMap.set(patientId, {
            _id: patientId,
            userId: {
              _id: patientId,
              name: patientName,
              email: patientEmail
            },
            name: patientName,
            fullName: patientName,
            email: patientEmail
          });
        }
      }
      
      const patientsList = Array.from(patientsMap.values());
      console.log('Patients from appointments:', patientsList.length);
      
      // Try to enrich patient data with patient details
      const enrichedPatients = await Promise.all(
        patientsList.map(async (patient) => {
          try {
            const patientResponse = await api.get(`/patients/${patient._id}`);
            const patientData = patientResponse.data;
            
            return {
              ...patient,
              age: patientData.age,
              gender: patientData.gender,
              phone: patientData.phone,
              name: patientData.name || patientData.fullName || patient.name,
              fullName: patientData.fullName || patientData.name || patient.fullName,
              email: patientData.email || patient.email
            };
          } catch (error) {
            console.log(`Could not fetch details for patient ${patient._id}, using basic info`);
            return patient;
          }
        })
      );
      
      setPatients(enrichedPatients);
      
      // Auto-select patient from URL param
      if (patientId && !selectedPatient) {
        const patient = enrichedPatients.find(p => p._id === patientId);
        if (patient) {
          setSelectedPatient(patient);
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  // Fetch single patient for prescription
  const fetchPatientForPrescription = async (id: string) => {
    try {
      const response = await api.get(`/patients/${id}`);
      const patientData = response.data;
      
      setSelectedPatient({
        _id: patientData._id,
        userId: {
          _id: patientData._id,
          name: patientData.name || patientData.fullName,
          email: patientData.email
        },
        name: patientData.name || patientData.fullName,
        fullName: patientData.fullName || patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        phone: patientData.phone,
        email: patientData.email
      });
    } catch (error) {
      console.error('Error fetching patient:', error);
      // Create basic patient object if API fails
      setSelectedPatient({
        _id: id,
        userId: { _id: id, name: 'Patient', email: '' },
        name: 'Patient',
        fullName: 'Patient'
      });
    }
  };

  // Fetch prescription details
  const fetchPrescriptionDetails = async (id: string) => {
    try {
      setLoading(true);
      console.log(`Fetching prescription details for ${id}...`);
      
      let response;
      try {
        response = await api.get(`/prescriptions/${id}`);
      } catch (error: any) {
        if (error.response?.status === 404 || error.response?.status === 403) {
          // Try to get from list if direct endpoint fails
          await fetchPrescriptions();
          const prescription = prescriptions.find(p => p._id === id);
          if (prescription) {
            response = { data: prescription };
          } else {
            throw new Error('Prescription not found');
          }
        } else {
          throw error;
        }
      }
      
      const data = response.data;
      console.log('Prescription data:', data);
      
      setSelectedPrescription(data);
      setActiveView('details');
      
      // Fetch patient details
      if (data.patientId) {
        const patientId = data.patientId._id || data.patientId;
        try {
          const patientResponse = await api.get(`/patients/${patientId}`);
          setPatientDetails(patientResponse.data);
        } catch (error) {
          console.error('Error fetching patient details:', error);
          // Create basic patient info from prescription
          setPatientDetails({
            userId: {
              name: data.patientId.name || 'Patient',
              email: data.patientId.email || ''
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching prescription:', error);
      alert(error.message || 'Failed to load prescription details');
      setActiveView('list');
    } finally {
      setLoading(false);
    }
  };

  // Filter prescriptions for list view
  useEffect(() => {
    if (activeView === 'list') {
      let filtered = [...prescriptions];

      if (activeFilter !== 'all') {
        filtered = filtered.filter(p => p.status === activeFilter);
      }

      if (searchTerm) {
        filtered = filtered.filter(p => {
          const patientName = typeof p.patientId === 'object' 
            ? p.patientId?.name 
            : 'Patient';
          return (
            patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.medications.some(m => 
              m.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
        });
      }

      setFilteredPrescriptions(filtered);
    }
  }, [activeFilter, searchTerm, prescriptions, activeView]);

  // Fetch patients when switching to create view
  useEffect(() => {
    if (activeView === 'create') {
      fetchPatientsForCreate();
    }
  }, [activeView]);

  // Create prescription functions
  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }

    if (!diagnosis.trim()) {
      alert('Please enter a diagnosis');
      return;
    }

    const validMedications = medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );

    if (validMedications.length === 0) {
      alert('Please add at least one medication');
      return;
    }

    try {
      setCreateLoading(true);
      
      const prescriptionData = {
        patientId: selectedPatient._id,
        medications: validMedications,
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || undefined,
        refills: refills,
        prescriptionDate: prescriptionDate || new Date().toISOString(),
        status: 'active'
      };

      console.log('Creating prescription with data:', prescriptionData);
      
      const response = await api.post('/prescriptions/create', prescriptionData);
      
      console.log('Prescription created:', response.data);
      
      alert('Prescription created successfully!');
      setActiveView('list');
      fetchPrescriptions(); // Refresh list
      
      // Reset form
      setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      setDiagnosis('');
      setNotes('');
      setRefills(0);
      setSelectedPatient(null);
      setPrescriptionDate('');
      
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      alert(
        error.response?.data?.message || 
        error.message || 
        'Failed to create prescription. Please check your input and try again.'
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // Prescription actions
  const handlePrint = () => {
    if (!selectedPrescription) return;
    
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="margin: 0; color: #059669;">HEALTHMATE PRESCRIPTION</h1>
          <p style="margin: 5px 0; color: #666;">Prescription #${selectedPrescription._id.slice(-8)}</p>
          <p style="margin: 5px 0; color: #666;">Date: ${formatDate(selectedPrescription.prescriptionDate)}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #059669; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Patient Information</h2>
          <p><strong>Name:</strong> ${patientDetails?.userId?.name || 'Patient'}</p>
          ${patientDetails?.age ? `<p><strong>Age:</strong> ${patientDetails.age}</p>` : ''}
          ${patientDetails?.gender ? `<p><strong>Gender:</strong> ${patientDetails.gender}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #059669; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Diagnosis</h2>
          <p>${selectedPrescription.diagnosis}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #059669; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Prescribed Medications</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Medication</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Dosage</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Frequency</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${selectedPrescription.medications.map(med => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px;">${med.name}</td>
                  <td style="border: 1px solid #ddd; padding: 10px;">${med.dosage}</td>
                  <td style="border: 1px solid #ddd; padding: 10px;">${med.frequency}</td>
                  <td style="border: 1px solid #ddd; padding: 10px;">${med.duration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${selectedPrescription.notes ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #059669; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Additional Instructions</h2>
          <p>${selectedPrescription.notes}</p>
        </div>
        ` : ''}
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #059669; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Refill Information</h2>
          <p><strong>Refills:</strong> ${selectedPrescription.refillsUsed || 0} of ${selectedPrescription.refills} used</p>
          ${selectedPrescription.nextRefillDate ? `<p><strong>Next Refill Date:</strong> ${formatDate(selectedPrescription.nextRefillDate)}</p>` : ''}
        </div>
        
        <div style="margin-top: 50px; border-top: 2px solid #000; padding-top: 20px;">
          <div style="float: right; text-align: center;">
            <p style="margin: 0; font-weight: bold;">Dr. ${selectedPrescription.doctorId?.name || 'Doctor'}</p>
            <p style="margin: 5px 0 0 0; color: #666;">Signature</p>
          </div>
          <div style="clear: both;"></div>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription #${selectedPrescription._id.slice(-8)}</title>
            <style>
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 1000);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = () => {
    if (!selectedPrescription) return;

    const prescriptionData = `
PRESCRIPTION
============

Prescription ID: ${selectedPrescription._id}
Date: ${formatDate(selectedPrescription.prescriptionDate)}
Status: ${selectedPrescription.status}

PATIENT INFORMATION
===================
Name: ${patientDetails?.userId?.name || 'Patient'}
${patientDetails?.age ? `Age: ${patientDetails.age}` : ''}
${patientDetails?.gender ? `Gender: ${patientDetails.gender}` : ''}

DIAGNOSIS
=========
${selectedPrescription.diagnosis}

MEDICATIONS
===========
${selectedPrescription.medications.map((med, index) => `
${index + 1}. ${med.name} - ${med.dosage}
    Frequency: ${med.frequency}
    Duration: ${med.duration}
    ${med.instructions ? `Instructions: ${med.instructions}` : ''}
`).join('\n')}

${selectedPrescription.notes ? `
ADDITIONAL NOTES
================
${selectedPrescription.notes}
` : ''}

REFILL INFORMATION
==================
Total Refills: ${selectedPrescription.refills}
Refills Used: ${selectedPrescription.refillsUsed || 0}

Prescribed by: Dr. ${selectedPrescription.doctorId?.name || 'Doctor'}
Date: ${formatDate(selectedPrescription.prescriptionDate)}
    `;

    const blob = new Blob([prescriptionData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${selectedPrescription._id.slice(-8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCancelPrescription = async () => {
    if (!selectedPrescription) return;

    if (!confirm('Are you sure you want to cancel this prescription?')) {
      return;
    }

    try {
      await api.patch(`/prescriptions/cancel/${selectedPrescription._id}`);
      alert('Prescription cancelled successfully');
      fetchPrescriptionDetails(selectedPrescription._id);
    } catch (error) {
      console.error('Error cancelling prescription:', error);
      alert('Failed to cancel prescription');
    }
  };

  const handleRefillPrescription = async () => {
    if (!selectedPrescription) return;

    try {
      await api.post(`/prescriptions/refill/${selectedPrescription._id}`);
      alert('Prescription refilled successfully');
      fetchPrescriptionDetails(selectedPrescription._id);
    } catch (error) {
      console.error('Error refilling prescription:', error);
      alert('Failed to refill prescription');
    }
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'expired': return 'bg-gray-100 text-gray-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Loading state
  if (loading && (activeView === 'list' || activeView === 'details')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {activeView !== 'list' && (
                <button
                  onClick={() => setActiveView('list')}
                  className="group flex items-center space-x-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-emerald-600" />
                  <span className="font-medium text-gray-700 group-hover:text-emerald-700">Back</span>
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {activeView === 'list' ? 'Prescriptions' :
                   activeView === 'create' ? 'New Prescription' :
                   'Prescription Details'}
                </h1>
                <p className="text-gray-500 mt-2">
                  {activeView === 'list' ? 'Manage and issue patient prescriptions' :
                   activeView === 'create' ? 'Prescribe medications for your patient' :
                   'View prescription details and history'}
                </p>
              </div>
            </div>
            
            {activeView === 'list' && (
              <button
                onClick={() => setActiveView('create')}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Prescription</span>
              </button>
            )}
          </div>

          {/* Stats - Only show on list view */}
          {activeView === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Prescriptions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{prescriptions.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Pill className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {prescriptions.filter(p => p.status?.toLowerCase() === 'active').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {prescriptions.filter(p => p.status?.toLowerCase() === 'completed').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {prescriptions.filter(p => p.status?.toLowerCase() === 'cancelled').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters - Only for list view */}
          {activeView === 'list' && (
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient name, diagnosis, or medication..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl p-1">
                  {(['all', 'active', 'completed', 'cancelled'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {activeView === 'list' && (
          /* Prescriptions List */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedPrescription(prescription);
                    router.push(`?id=${prescription._id}`);
                  }}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <Pill className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Prescription #{prescription._id.slice(-6)}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                              {getStatusIcon(prescription.status)}
                              <span>{prescription.status?.charAt(0).toUpperCase() + prescription.status?.slice(1) || 'Active'}</span>
                            </span>
                            {prescription.refills > 0 && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                {prescription.refills} refill(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">
                          {typeof prescription.patientId === 'object' 
                            ? prescription.patientId?.name || 'Patient'
                            : 'Patient'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(prescription.prescriptionDate)}</span>
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Diagnosis</p>
                      <p className="font-medium text-gray-900 truncate">{prescription.diagnosis}</p>
                    </div>

                    {/* Medications */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Medications ({prescription.medications.length})</p>
                      <div className="space-y-2">
                        {prescription.medications.slice(0, 2).map((med, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 truncate">{med.name}</span>
                              <span className="text-sm text-gray-600">{med.dosage}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {med.frequency} for {med.duration}
                            </div>
                          </div>
                        ))}
                        {prescription.medications.length > 2 && (
                          <div className="text-center">
                            <span className="text-sm text-gray-500">
                              +{prescription.medications.length - 2} more medications
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrescription(prescription);
                          handlePrint();
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="text-sm font-medium">Print</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrescription(prescription);
                          router.push(`?id=${prescription._id}`);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Pill className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {prescriptions.length === 0 ? 'No prescriptions yet' : 'No prescriptions found'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  {prescriptions.length === 0
                    ? 'Start by creating your first prescription for a patient.'
                    : 'No prescriptions match your search criteria.'}
                </p>
                <button
                  onClick={() => setActiveView('create')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-500/30 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Prescription</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'create' && (
          /* Create Prescription Form */
          <form onSubmit={handleCreatePrescription} className="space-y-8">
            {/* Patient Selection */}
            <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Select Patient</h2>
                  <p className="text-sm text-gray-500">Choose the patient for this prescription</p>
                </div>
              </div>

              {selectedPatient ? (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{selectedPatient.name}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedPatient.age ? `${selectedPatient.age} years` : ''}
                          {selectedPatient.gender ? ` • ${selectedPatient.gender}` : ''}
                        </p>
                        {selectedPatient.phone && (
                          <p className="text-sm text-gray-500">{selectedPatient.phone}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(null)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Change Patient
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search patients by name..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {patients.length > 0 ? (
                      patients
                        .filter((patient: Patient) =>
                          patient.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
                          patient.email?.toLowerCase().includes(patientSearch.toLowerCase())
                        )
                        .map((patient) => (
                          <label
                            key={patient._id}
                            className={`flex items-center space-x-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 RX-${selectedPrescription?._id?.slice(-8).toUpperCase() || 'N/A'}
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                              }`}
                          >
                            <input
  type="radio"
  name="patient"
  value={patient._id}
 checked={(selectedPatient as unknown as Patient)?._id === patient._id}
  onChange={() => setSelectedPatient(patient)}
  className="w-4 h-4 text-emerald-600"
/>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{patient.name}</span>
                                {patient.age && (
                                  <span className="text-sm text-gray-500">{patient.age} years</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {patient.phone && <div>{patient.phone}</div>}
                                {patient.email && <div>{patient.email}</div>}
                              </div>
                            </div>
                          </label>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No patients found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Patients will appear here after they book appointments with you.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Diagnosis */}
            <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Diagnosis</h2>
                <p className="text-sm text-gray-500">Enter the primary diagnosis for this prescription</p>
              </div>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis (e.g., Upper Respiratory Infection, Hypertension, Type 2 Diabetes, etc.)"
                className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                required
              />
            </div>

            {/* Medications */}
            <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Pill className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Medications</h2>
                    <p className="text-sm text-gray-500">Prescribe medications for the patient</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Add Medication</span>
                </button>
              </div>

              <div className="space-y-6">
                {medications.map((medication, index) => (
                  <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Medication {index + 1}</h3>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="p-1 hover:bg-white rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medication Name *
                        </label>
                        <input
                          type="text"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          placeholder="e.g., Amoxicillin, Metformin, Lisinopril"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg, 5mg, 10mg/325mg"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frequency *
                        </label>
                        <select
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          required
                        >
                          <option value="">Select frequency</option>
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="Every morning">Every morning</option>
                          <option value="Every night">Every night</option>
                          <option value="With meals">With meals</option>
                          <option value="As needed">As needed</option>
                          <option value="Every 4 hours">Every 4 hours</option>
                          <option value="Every 6 hours">Every 6 hours</option>
                          <option value="Every 8 hours">Every 8 hours</option>
                          <option value="Every 12 hours">Every 12 hours</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration *
                        </label>
                        <input
                          type="text"
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days, 30 days, 90 days"
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instructions (Optional)
                        </label>
                        <textarea
                          value={medication.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take with food, Avoid alcohol, Take before bedtime, etc."
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Additional Notes</h2>
                  <p className="text-sm text-gray-500">Any special instructions or notes for the patient</p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any additional notes or instructions for the patient..."
                  className="w-full h-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Prescription Details</h2>
                  <p className="text-sm text-gray-500">Set prescription validity and refills</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prescription Date
                    </label>
                    <input
                      type="date"
                      value={prescriptionDate}
                      onChange={(e) => setPrescriptionDate(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to use today's date
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Refills
                    </label>
                    <input
                      type="number"
                      value={refills}
                      onChange={(e) => setRefills(parseInt(e.target.value) || 0)}
                      min="0"
                      max="10"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How many times can this prescription be refilled?
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-emerald-800 font-medium mb-1">Important Information</p>
                        <ul className="text-xs text-emerald-700 space-y-1">
                          <li>• This prescription will be valid for 6 months</li>
                          <li>• Patient can refill up to the specified number of times</li>
                          <li>• Prescription will be saved to patient's medical records</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('list');
                    // Clear form
                    setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
                    setDiagnosis('');
                    setNotes('');
                    setRefills(0);
                    setSelectedPatient(null);
                    setPrescriptionDate('');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !selectedPatient}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 cursor-pointer"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Create Prescription</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {activeView === 'details' && selectedPrescription && (
          /* Prescription Details */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Prescription Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Patient Information */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Patient Information</h2>
                    <p className="text-sm text-gray-500">Prescription for patient</p>
                  </div>
                </div>

                {patientDetails ? (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {patientDetails.userId?.name || patientDetails.name || 'Patient'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {patientDetails.age && (
                            <span>{patientDetails.age} years</span>
                          )}
                          {patientDetails.gender && (
                            <span>• {patientDetails.gender}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patientDetails.phone && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{patientDetails.phone}</span>
                        </div>
                      )}

                      {patientDetails.email && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900 truncate">{patientDetails.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Patient information not available</p>
                  </div>
                )}
              </div>

              {/* Diagnosis & Medications */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Pill className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Prescription Details</h2>
                    <p className="text-sm text-gray-500">Diagnosis and prescribed medications</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Diagnosis */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Diagnosis</h3>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <p className="text-gray-900 font-medium">{selectedPrescription.diagnosis}</p>
                    </div>
                  </div>

                  {/* Medications */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-700">Medications</h3>
                      <span className="text-sm text-gray-500">{selectedPrescription.medications.length} medication(s)</span>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedPrescription.medications.map((medication, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-900">{medication.name}</h4>
                            <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                              {medication.dosage}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                            <div>
                              <span className="text-gray-500">Frequency:</span>
                              <span className="font-medium ml-2">{medication.frequency}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <span className="font-medium ml-2">{medication.duration}</span>
                            </div>
                            {medication.instructions && (
                              <div className="md:col-span-2">
                                <span className="text-gray-500">Instructions:</span>
                                <span className="font-medium ml-2">{medication.instructions}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedPrescription.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h3>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-gray-700">{selectedPrescription.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Actions & Info */}
            <div className="space-y-8">
              {/* Prescription Info */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Prescription Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Prescription ID</span>
                    <span className="text-sm font-medium text-gray-900">
                      RX-{selectedPrescription._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Date</span>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(selectedPrescription.prescriptionDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(selectedPrescription.status)}`}>
                      {selectedPrescription.status?.charAt(0).toUpperCase() + selectedPrescription.status?.slice(1) || 'Active'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Refills</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedPrescription.refillsUsed || 0} of {selectedPrescription.refills} used
                    </span>
                  </div>
                  
                  {selectedPrescription.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expiry Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(selectedPrescription.expiryDate)}
                      </span>
                    </div>
                  )}
                  
                  {selectedPrescription.nextRefillDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Next Refill</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(selectedPrescription.nextRefillDate)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(selectedPrescription.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-2xl shadow-lg shadow-emerald-500/5 border border-gray-200/50 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Actions</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
                  >
                    <Printer className="w-5 h-5" />
                    <span className="font-medium">Print Prescription</span>
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Download PDF</span>
                  </button>
                  
                  {selectedPrescription.status === 'active' && selectedPrescription.refills > (selectedPrescription.refillsUsed || 0) && (
                    <button
                      onClick={handleRefillPrescription}
                      className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all cursor-pointer"
                    >
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">Issue Refill</span>
                    </button>
                  )}
                  
                  {selectedPrescription.status === 'active' && (
                    <button
                      onClick={handleCancelPrescription}
                      className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Cancel Prescription</span>
                    </button>
                  )}
                </div>
                
                {selectedPrescription.status === 'cancelled' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">Prescription Cancelled</p>
                        <p className="text-sm text-red-600 mt-1">
                          This prescription has been cancelled and cannot be refilled.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedPrescription.status === 'expired' && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-800">Prescription Expired</p>
                        <p className="text-sm text-amber-600 mt-1">
                          This prescription has expired and cannot be refilled.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPrescriptionsPage;